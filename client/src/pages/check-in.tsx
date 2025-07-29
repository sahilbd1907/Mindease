import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, Brain } from "lucide-react";
import { useLocation } from "wouter";
import EmergencyModal from "@/components/emergency-modal";
import type { EmotionAnalysis } from "@shared/schema";

const moodOptions = [
  { value: 1, emoji: '😰', label: 'Struggling' },
  { value: 2, emoji: '😔', label: 'Not great' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' }
];

export default function CheckIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [journalEntry, setJournalEntry] = useState('');
  const [stressLevel, setStressLevel] = useState([5]);
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const submitCheckIn = useMutation({
    mutationFn: async (data: { mood: number; stressLevel: number; journalEntry?: string }) => {
      const response = await apiRequest('POST', '/api/check-ins', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Check for crisis indicators
      if (data.emotionAnalysis?.crisis_indicators) {
        setShowEmergencyModal(true);
      }
      
      setAnalysis(data.emotionAnalysis);
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Check-in completed!",
        description: "Your daily check-in has been saved successfully.",
      });
      
      // Redirect to dashboard after a delay if no crisis
      if (!data.emotionAnalysis?.crisis_indicators) {
        setTimeout(() => setLocation('/'), 2000);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Please select your mood",
        description: "We need to know how you're feeling today.",
        variant: "destructive"
      });
      return;
    }

    submitCheckIn.mutate({
      mood: selectedMood,
      stressLevel: stressLevel[0],
      journalEntry: journalEntry.trim() || undefined
    });
  };

  const getStressLabel = (level: number) => {
    if (level <= 3) return `${level} - Low`;
    if (level <= 6) return `${level} - Moderate`;
    return `${level} - High`;
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-800';
    if (level <= 6) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <main className="flex-1 pb-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Check-in Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Today's Check-in
                  <span className="text-sm font-normal text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Mood Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    How are you feeling today?
                  </label>
                  <div className="flex justify-between max-w-md">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedMood(option.value)}
                        className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${
                          selectedMood === option.value
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-3xl mb-1">{option.emoji}</div>
                        <span className={`text-xs ${
                          selectedMood === option.value
                            ? 'text-primary font-medium'
                            : 'text-gray-600'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Journal Entry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's on your mind? (Optional)
                  </label>
                  <Textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Share your thoughts about today, any stress you're feeling, or what's coming up..."
                    rows={4}
                    className="resize-none"
                  />
                  
                  {/* AI Analysis Preview */}
                  {analysis && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-start">
                        <Brain className="text-blue-500 mt-1 mr-3 h-5 w-5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">AI Analysis</h4>
                          <p className="text-sm text-blue-800 mb-3">
                            I detected some emotions in your message. Here's what I found:
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {analysis.highlighted_phrases.map((phrase, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {phrase.emotion}: {Math.round(phrase.intensity * 100)}%
                              </Badge>
                            ))}
                          </div>
                          {analysis.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">Recommendations:</p>
                              <ul className="text-sm text-blue-800 space-y-1">
                                {analysis.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stress Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Stress Level (1-10)
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Low</span>
                    <div className="flex-1">
                      <Slider
                        value={stressLevel}
                        onValueChange={setStressLevel}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <span key={i}>{i + 1}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">High</span>
                    <Badge className={getStressColor(stressLevel[0])}>
                      {getStressLabel(stressLevel[0])}
                    </Badge>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmit}
                  disabled={submitCheckIn.isPending}
                  className="w-full"
                  size="lg"
                >
                  {submitCheckIn.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Complete Check-in
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with tips and resources */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Wellness Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Breathing Exercise</h4>
                  <p className="text-sm text-green-800">
                    Try the 4-7-8 technique: Breathe in for 4, hold for 7, exhale for 8.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Study Break Reminder</h4>
                  <p className="text-sm text-blue-800">
                    Take a 5-10 minute break every hour to maintain focus and reduce stress.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Hydration Check</h4>
                  <p className="text-sm text-purple-800">
                    Remember to drink water throughout the day. Dehydration can increase stress levels.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EmergencyModal 
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </main>
  );
}
