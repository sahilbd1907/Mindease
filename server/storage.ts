import { 
  users, checkIns, chatMessages, exams, alerts,
  type User, type InsertUser,
  type CheckIn, type InsertCheckIn,
  type ChatMessage, type InsertChatMessage,
  type Exam, type InsertExam,
  type Alert, type InsertAlert,
  type EmotionAnalysis
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Check-ins
  getCheckIn(id: number): Promise<CheckIn | undefined>;
  getCheckInsByUser(userId: number, limit?: number): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  updateCheckInAnalysis(id: number, analysis: EmotionAnalysis): Promise<CheckIn>;

  // Chat Messages
  getChatMessages(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Exams
  getExamsByUser(userId: number): Promise<Exam[]>;
  getUpcomingExams(userId: number): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, updates: Partial<Exam>): Promise<Exam>;

  // Alerts
  getAlertsByUser(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private checkIns: Map<number, CheckIn> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private exams: Map<number, Exam> = new Map();
  private alerts: Map<number, Alert> = new Map();
  
  private currentUserId: number = 1;
  private currentCheckInId: number = 1;
  private currentChatMessageId: number = 1;
  private currentExamId: number = 1;
  private currentAlertId: number = 1;

  constructor() {
    // Initialize with a demo user
    this.users.set(1, {
      id: 1,
      name: "Alex",
      email: "alex@example.com",
      createdAt: new Date()
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Check-ins
  async getCheckIn(id: number): Promise<CheckIn | undefined> {
    return this.checkIns.get(id);
  }

  async getCheckInsByUser(userId: number, limit: number = 10): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const id = this.currentCheckInId++;
    const checkIn: CheckIn = {
      ...insertCheckIn,
      id,
      timestamp: new Date(),
      emotionAnalysis: null,
      journalEntry: insertCheckIn.journalEntry || null
    };
    this.checkIns.set(id, checkIn);
    return checkIn;
  }

  async updateCheckInAnalysis(id: number, analysis: EmotionAnalysis): Promise<CheckIn> {
    const checkIn = this.checkIns.get(id);
    if (!checkIn) {
      throw new Error('Check-in not found');
    }
    checkIn.emotionAnalysis = analysis;
    this.checkIns.set(id, checkIn);
    return checkIn;
  }

  // Chat Messages
  async getChatMessages(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime())
      .slice(-limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      isBot: insertMessage.isBot ?? false
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Exams
  async getExamsByUser(userId: number): Promise<Exam[]> {
    return Array.from(this.exams.values())
      .filter(exam => exam.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getUpcomingExams(userId: number): Promise<Exam[]> {
    const now = new Date();
    return Array.from(this.exams.values())
      .filter(exam => exam.userId === userId && new Date(exam.date) > now && !exam.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const id = this.currentExamId++;
    const exam: Exam = {
      ...insertExam,
      id,
      completed: false
    };
    this.exams.set(id, exam);
    return exam;
  }

  async updateExam(id: number, updates: Partial<Exam>): Promise<Exam> {
    const exam = this.exams.get(id);
    if (!exam) {
      throw new Error('Exam not found');
    }
    const updatedExam = { ...exam, ...updates };
    this.exams.set(id, updatedExam);
    return updatedExam;
  }

  // Alerts
  async getAlertsByUser(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      timestamp: new Date(),
      resolved: false
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async resolveAlert(id: number): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error('Alert not found');
    }
    alert.resolved = true;
    this.alerts.set(id, alert);
    return alert;
  }
}

export const storage = new MemStorage();
