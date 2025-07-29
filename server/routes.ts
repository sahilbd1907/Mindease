import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCheckInSchema, insertChatMessageSchema, insertExamSchema } from "@shared/schema";
import { analyzeEmotion, generateChatResponse } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (demo user for now)
  app.get("/api/user", async (_req, res) => {
    try {
      const user = await storage.getUser(1); // Demo user
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const userId = 1; // Demo user
      const recentCheckIns = await storage.getCheckInsByUser(userId, 7);
      const upcomingExams = await storage.getUpcomingExams(userId);
      const alerts = await storage.getAlertsByUser(userId);
      
      const currentMood = recentCheckIns.length > 0 ? recentCheckIns[0].mood : 3;
      const checkInStreak = recentCheckIns.length;
      const unreadAlerts = alerts.filter(alert => !alert.resolved).length;

      res.json({
        currentMood,
        checkInStreak,
        upcomingExamsCount: upcomingExams.length,
        insights: 12, // Mock insights count
        recentCheckIns,
        upcomingExams: upcomingExams.slice(0, 3)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });

  // Get check-ins for trend analysis
  app.get("/api/check-ins", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const limit = parseInt(req.query.limit as string) || 30;
      const checkIns = await storage.getCheckInsByUser(userId, limit);
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ error: "Failed to get check-ins" });
    }
  });

  // Submit new check-in
  app.post("/api/check-ins", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const validatedData = insertCheckInSchema.parse({ ...req.body, userId });
      
      // Create check-in
      const checkIn = await storage.createCheckIn(validatedData);
      
      // Analyze emotion if journal entry exists
      if (validatedData.journalEntry) {
        const analysis = await analyzeEmotion(validatedData.journalEntry);
        await storage.updateCheckInAnalysis(checkIn.id, analysis);
        
        // Create alert if crisis indicators detected
        if (analysis.crisis_indicators) {
          await storage.createAlert({
            userId,
            type: 'crisis',
            message: 'Crisis indicators detected in journal entry. Immediate support recommended.'
          });
        }
        
        // Update the checkIn with analysis for response
        checkIn.emotionAnalysis = analysis;
      }
      
      res.json(checkIn);
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({ error: "Failed to submit check-in" });
    }
  });

  // Get chat messages
  app.get("/api/chat", async (_req, res) => {
    try {
      const userId = 1; // Demo user
      const messages = await storage.getChatMessages(userId, 50);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chat messages" });
    }
  });

  // Send chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        message,
        isBot: false
      });
      
      // Generate AI response
      const botResponse = await generateChatResponse(message, userId);
      
      // Save bot message
      const botMessage = await storage.createChatMessage({
        userId,
        message: botResponse,
        isBot: true
      });
      
      res.json({ userMessage, botMessage });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get exams
  app.get("/api/exams", async (_req, res) => {
    try {
      const userId = 1; // Demo user
      const exams = await storage.getExamsByUser(userId);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: "Failed to get exams" });
    }
  });

  // Add exam
  app.post("/api/exams", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const validatedData = insertExamSchema.parse({ ...req.body, userId });
      const exam = await storage.createExam(validatedData);
      res.json(exam);
    } catch (error) {
      res.status(500).json({ error: "Failed to add exam" });
    }
  });

  // Get alerts
  app.get("/api/alerts", async (_req, res) => {
    try {
      const userId = 1; // Demo user
      const alerts = await storage.getAlertsByUser(userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get alerts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
