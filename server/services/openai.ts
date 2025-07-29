import OpenAI from "openai";
import type { EmotionAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Crisis keywords that indicate potential self-harm or suicidal thoughts
const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end it all', 'no point living', 'worthless', 'hopeless',
  'self-harm', 'hurt myself', 'give up', 'can\'t go on', 'want to die', 'better off dead',
  'no way out', 'everyone would be better without me'
];

export async function analyzeEmotion(journalText: string): Promise<EmotionAnalysis> {
  try {
    // First check for crisis indicators using keyword detection
    const crisisIndicators = CRISIS_KEYWORDS.some(keyword => 
      journalText.toLowerCase().includes(keyword.toLowerCase())
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in analyzing college student mental health and academic stress. Analyze the provided journal entry and return a detailed emotional analysis in JSON format.

Focus on:
- Academic stress indicators (exam anxiety, study pressure, performance worry)
- General emotional states (anxiety, depression, stress, determination)
- Specific phrases that indicate emotional states
- Crisis indicators (self-harm, suicidal ideation, hopelessness)
- Actionable recommendations for college students

Respond with this exact JSON structure:
{
  "anxiety": number (0-1),
  "stress": number (0-1), 
  "depression": number (0-1),
  "determination": number (0-1),
  "overall_sentiment": "positive" | "negative" | "neutral",
  "confidence": number (0-1),
  "highlighted_phrases": [
    {
      "text": "specific phrase from journal",
      "emotion": "emotion detected",
      "intensity": number (0-1)
    }
  ],
  "crisis_indicators": boolean,
  "recommendations": ["specific actionable advice for college students"]
}`
        },
        {
          role: "user",
          content: `Analyze this journal entry from a college student: "${journalText}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const analysisResult = JSON.parse(response.choices[0].message.content!);
    
    // Override crisis indicators if our keyword detection found any
    if (crisisIndicators) {
      analysisResult.crisis_indicators = true;
    }

    // Ensure all required fields are present with defaults
    const emotionAnalysis: EmotionAnalysis = {
      anxiety: Math.min(1, Math.max(0, analysisResult.anxiety || 0)),
      stress: Math.min(1, Math.max(0, analysisResult.stress || 0)),
      depression: Math.min(1, Math.max(0, analysisResult.depression || 0)),
      determination: Math.min(1, Math.max(0, analysisResult.determination || 0)),
      overall_sentiment: analysisResult.overall_sentiment || 'neutral',
      confidence: Math.min(1, Math.max(0, analysisResult.confidence || 0.5)),
      highlighted_phrases: analysisResult.highlighted_phrases || [],
      crisis_indicators: analysisResult.crisis_indicators || crisisIndicators,
      recommendations: analysisResult.recommendations || [
        "Consider taking regular study breaks",
        "Practice deep breathing exercises",
        "Reach out to campus counseling services if needed"
      ]
    };

    return emotionAnalysis;

  } catch (error) {
    console.error("Error analyzing emotion:", error);
    
    // Fallback analysis - still check for crisis indicators
    const crisisIndicators = CRISIS_KEYWORDS.some(keyword => 
      journalText.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      anxiety: 0.5,
      stress: 0.5,
      depression: 0.3,
      determination: 0.4,
      overall_sentiment: 'neutral',
      confidence: 0.3,
      highlighted_phrases: [
        {
          text: "Unable to analyze specific phrases",
          emotion: "unknown",
          intensity: 0.3
        }
      ],
      crisis_indicators: crisisIndicators,
      recommendations: [
        "I'm having trouble analyzing your entry right now, but I'm here to help",
        "Consider speaking with a counselor about your feelings",
        "Remember that seeking help is a sign of strength"
      ]
    };
  }
}

export async function generateChatResponse(userMessage: string, userId: number): Promise<string> {
  try {
    // Get some context about recent interactions (in a real app, you'd fetch this from storage)
    // For now, we'll provide general college student context

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are MindEase AI, a compassionate mental health support assistant specifically designed for college students. Your role is to:

1. Provide empathetic, supportive responses focused on academic stress and college life
2. Offer practical coping strategies for exam anxiety, study stress, and academic pressure
3. Suggest evidence-based techniques like breathing exercises, time management, and study strategies
4. Encourage healthy habits and self-care practices
5. Recognize when to refer students to professional help
6. Use a warm, understanding tone that validates their feelings

Key guidelines:
- Always validate the student's feelings first
- Provide specific, actionable advice tailored to college life
- Include breathing exercises, study techniques, or mindfulness practices when appropriate
- If you detect crisis language, gently encourage professional help while being supportive
- Keep responses conversational and relatable to college students
- Focus on academic stress, exam anxiety, social pressures, and time management
- Remember you're supporting students during one of the most stressful times in their lives

Do not:
- Provide medical diagnoses or replace professional therapy
- Give advice outside your scope of mental health support
- Ignore potential crisis situations
- Be overly clinical or robotic in your responses`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    let botResponse = response.choices[0].message.content!;

    // Check if the user message contains crisis indicators
    const crisisDetected = CRISIS_KEYWORDS.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    // If crisis detected, append emergency resources
    if (crisisDetected) {
      botResponse += "\n\n🆘 I'm concerned about you. Please reach out for immediate support:\n" +
                   "• Crisis Text Line: Text HOME to 741741\n" +
                   "• National Suicide Prevention Lifeline: 988\n" +
                   "• Campus Counseling Center: Available 24/7\n\n" +
                   "You matter, and help is available. Please don't hesitate to reach out.";
    }

    return botResponse;

  } catch (error) {
    console.error("Error generating chat response:", error);
    
    // Fallback response that's still helpful
    const fallbackResponses = [
      "I'm here to listen and support you. While I'm having a technical issue right now, please know that what you're feeling is valid. If you're in crisis, please contact your campus counseling center or call 988.",
      "Thank you for sharing with me. Although I'm experiencing some technical difficulties, I want you to know that seeking support shows strength. Consider reaching out to a counselor or trusted friend.",
      "I appreciate you reaching out. While I'm having trouble responding fully right now, please remember that you're not alone in this. Your campus likely has counseling resources available 24/7."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}
