import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MoodChart from "@/components/mood-chart";
import { 
  Smile, 
  Calendar, 
  GraduationCap, 
  Lightbulb,
  Wind,
  BookOpen,
  Heart,
  ChevronRight,
  Calculator,
  FlaskConical,
  History,
  Plus,
  Bot,
  Send
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DashboardStats {
  currentMood: number;
  checkInStreak: number;
  upcomingExamsCount: number;
  insights: number;
  recentCheckIns: any[];
  upcomingExams: any[];
}

const moodEmojis = ['😰', '😔', '😐', '🙂', '😄'];
const moodLabels = ['Struggling', 'Not great', 'Okay', 'Good', 'Great'];

export default function Dashboard() {
  const [chatInput, setChatInput] = useState('');
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats']
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['/api/check-ins?limit=7']
  });

  const { data: chatMessages = [] } = useQuery<any[]>({
    queryKey: ['/api/chat']
  });

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    try {
      await apiRequest('POST', '/api/chat', { message: chatInput });
      setChatInput('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat'] });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getTimeUntilExam = (examDate: string) => {
    const now = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    return `${Math.ceil(diffDays / 7)} week${diffDays >= 14 ? 's' : ''}`;
  };

  const getExamStatusColor = (examDate: string) => {
    const diffDays = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'bg-red-100 text-red-800';
    if (diffDays <= 3) return 'bg-orange-100 text-orange-800';
    if (diffDays <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const recentMessages = chatMessages.slice(-2);

  return (
    <main className="flex-1 pb-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <Smile className="text-green-500 h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Mood</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? moodLabels[stats.currentMood - 1] : 'Good'}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <span className="text-lg mr-1">
                      {stats ? moodEmojis[stats.currentMood - 1] : '🙂'}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="text-primary h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Check-in Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.checkInStreak || 0} days
                  </p>
                  <p className="text-xs text-primary">Keep it up! 🔥</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <GraduationCap className="text-purple-500 h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.upcomingExamsCount || 0}
                  </p>
                  <p className="text-xs text-purple-600">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Lightbulb className="text-orange-500 h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">AI Insights</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.insights || 0}</p>
                  <p className="text-xs text-orange-600">New insights today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Check-in Preview and Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Check-in Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Check-in</h3>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">How are you feeling today?</p>
                <Link href="/check-in">
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Start Today's Check-in
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Mood Chart */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">7-Day Mood Trend</h3>
                </div>
                <MoodChart checkIns={checkIns as any[]} className="h-64" />
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Mood Score</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Stress Level</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* AI Chat Quick Access */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bot className="text-primary mr-2 h-5 w-5" />
                    AI Support
                  </h3>
                  <Link href="/chat">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Open Chat
                    </Button>
                  </Link>
                </div>
                
                {/* Chat Messages Preview */}
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {recentMessages.length > 0 ? (
                    recentMessages.map((message: any, index: number) => (
                      <div 
                        key={index} 
                        className={`flex items-start space-x-3 ${message.isBot ? '' : 'justify-end'}`}
                      >
                        {message.isBot && (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="text-primary h-4 w-4" />
                          </div>
                        )}
                        <div className={`rounded-2xl p-3 max-w-xs ${
                          message.isBot 
                            ? 'bg-gray-50 rounded-tl-sm' 
                            : 'bg-primary text-primary-foreground rounded-tr-sm'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                      Start a conversation with our AI assistant
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Input 
                    placeholder="Ask me anything..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left">
                    <div className="flex items-center">
                      <Wind className="text-green-600 mr-3 h-5 w-5" />
                      <div>
                        <p className="font-medium text-green-900">Breathing Exercise</p>
                        <p className="text-sm text-green-700">5-minute calm session</p>
                      </div>
                    </div>
                    <ChevronRight className="text-green-600 h-4 w-4" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left">
                    <div className="flex items-center">
                      <BookOpen className="text-purple-600 mr-3 h-5 w-5" />
                      <div>
                        <p className="font-medium text-purple-900">Study Tips</p>
                        <p className="text-sm text-purple-700">Exam preparation strategies</p>
                      </div>
                    </div>
                    <ChevronRight className="text-purple-600 h-4 w-4" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-left">
                    <div className="flex items-center">
                      <Heart className="text-orange-600 mr-3 h-5 w-5" />
                      <div>
                        <p className="font-medium text-orange-900">Wellness Resources</p>
                        <p className="text-sm text-orange-700">Articles and guides</p>
                      </div>
                    </div>
                    <ChevronRight className="text-orange-600 h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-sm font-medium text-gray-900">Stress Pattern Detected</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your stress levels tend to peak on Sunday evenings. Consider planning relaxation time then.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="text-sm font-medium text-gray-900">Positive Trend</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your mood has improved 23% this week compared to last week. Great progress!
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="text-sm font-medium text-gray-900">Study Tip</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Based on your schedule, try the Pomodoro technique for your calculus study sessions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
