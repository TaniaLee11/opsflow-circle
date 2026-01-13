import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Send, 
  Sparkles,
  MessageSquare,
  ListTodo,
  Calendar,
  Mail,
  Zap
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: Mail, label: "Check my inbox", prompt: "Check my inbox and summarize the important emails" },
  { icon: ListTodo, label: "Create todo list", prompt: "Create a todo list based on my pending tasks and emails" },
  { icon: Calendar, label: "Schedule tasks", prompt: "Help me schedule my tasks for today" },
  { icon: Zap, label: "Automate workflow", prompt: "Suggest automations for my repetitive tasks" },
];

export default function VOPSy() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm VOPSy, your Virtual Operations Assistant. I can help you manage your inbox, create workflows, organize tasks, and automate your business operations. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response - this will be replaced with actual Lovable AI integration
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand you'd like help with that. To fully assist you, I'll need to connect to your integrated services. Please make sure your Gmail and other tools are connected in the Integrations page. Once connected, I can read your inbox, analyze your workload, and help create workflows automatically.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <AccessGate>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        
        <main className="flex-1 ml-64 flex flex-col h-screen">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-lg">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  VOPSy
                  <Badge variant="secondary" className="text-xs">AI Assistant</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">Your Virtual Operations Assistant</p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-primary">VOPSy</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-[10px] mt-2 ${
                        message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="px-6 py-4 border-t border-border bg-card/30">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs text-muted-foreground mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAction(action.prompt)}
                    >
                      <action.icon className="w-3 h-3 mr-1.5" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border bg-card">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Ask VOPSy anything... (e.g., 'Check my inbox and create a todo list')"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="min-h-[60px] max-h-[120px] resize-none bg-background"
                    disabled={isLoading}
                  />
                  <Button 
                    size="lg" 
                    className="px-6"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  VOPSy can read your connected inbox, create workflows, and manage your tasks automatically
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
