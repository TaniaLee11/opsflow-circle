import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { 
  Brain, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  Send, 
  Save,
  Play,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  User,
  Building2,
  Heart,
  ChevronRight,
  Code,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  enabled: boolean;
  userTypes: ("contractor" | "consultant" | "nonprofit")[];
}

const defaultPrompts: PromptConfig[] = [
  {
    id: "financial_explainer",
    name: "Financial Explainer",
    description: "Translates financial metrics into plain language",
    category: "Financial Hub",
    prompt: `You are VOPSy's financial intelligence assistant. Your role is to explain financial concepts in simple, non-judgmental language.

When explaining metrics:
- Start with "Here's what this means for you..."
- Avoid jargon unless you immediately define it
- Always connect the number to a real-world implication
- Suggest one actionable next step

Tone: Calm, competent, empowering. Never condescending.`,
    enabled: true,
    userTypes: ["contractor", "consultant", "nonprofit"]
  },
  {
    id: "compliance_alerts",
    name: "Compliance Alerts",
    description: "Generates compliance warnings and deadlines",
    category: "Compliance",
    prompt: `You are VOPSy's compliance monitor. Your role is to alert users to upcoming deadlines and requirements.

When generating alerts:
- Lead with the deadline or risk
- Explain the consequence of missing it
- Provide a clear action step
- Link to relevant resources when available

Priority levels:
- URGENT: Within 7 days
- IMPORTANT: Within 30 days
- REMINDER: Within 60 days`,
    enabled: true,
    userTypes: ["contractor", "consultant", "nonprofit"]
  },
  {
    id: "dashboard_summary",
    name: "Dashboard Summary",
    description: "Creates personalized dashboard insights",
    category: "Dashboard",
    prompt: `You are VOPSy's operations analyst. Generate a daily summary that answers:
- "Am I okay?" (overall health assessment)
- "What should I focus on next?" (top priority)
- "What am I missing?" (blind spots)
- "What happens if I don't act?" (risk preview)

Keep summaries under 150 words. Lead with the most important insight.`,
    enabled: true,
    userTypes: ["contractor", "consultant", "nonprofit"]
  },
  {
    id: "autoresponder",
    name: "Autoresponder Logic",
    description: "Powers automated email/SMS responses",
    category: "Communication",
    prompt: `You are VOPSy's communication assistant. Draft professional, warm responses that:
- Acknowledge the sender's intent
- Provide a helpful response or redirect
- Set clear expectations for follow-up
- Maintain the user's brand voice

Never make commitments on behalf of the user. Use phrases like "I'll make sure [Name] sees this" rather than promising specific actions.`,
    enabled: true,
    userTypes: ["consultant", "nonprofit"]
  }
];

const userTypeConfig = {
  contractor: { label: "Contractor", icon: User, color: "text-info" },
  consultant: { label: "Consultant", icon: Building2, color: "text-primary" },
  nonprofit: { label: "Nonprofit", icon: Heart, color: "text-success" }
};

export default function AIStudio() {
  const { isAdmin } = useAuth();
  const [prompts, setPrompts] = useState<PromptConfig[]>(defaultPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptConfig | null>(defaultPrompts[0]);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const togglePrompt = (id: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const updatePrompt = (id: string, newPrompt: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, prompt: newPrompt } : p
    ));
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(prev => prev ? { ...prev, prompt: newPrompt } : null);
    }
  };

  const handleTest = async () => {
    if (!selectedPrompt || !testInput) return;
    setIsTesting(true);
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestOutput(`[VOPSy Response Preview]

Based on your input: "${testInput}"

Using the "${selectedPrompt.name}" configuration, here's how I would respond:

---

This is a simulated preview. In production, this would use your configured AI model to generate a real response based on the system prompt and user input.

The response would follow these guidelines:
• ${selectedPrompt.prompt.split('\n').slice(0, 3).join('\n• ')}

---

[End Preview]`);
    setIsTesting(false);
  };

  const categories = [...new Set(prompts.map(p => p.category))];

  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Studio</h1>
                <p className="text-muted-foreground">Configure and manage AI behavior across VOPSy</p>
              </div>
            </div>
            
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 glow-primary-sm">
              <Save className="w-4 h-4" />
              Save All Changes
            </button>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prompt Library */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Prompt Library
              </h2>
              
              {categories.map(category => (
                <div key={category} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                    {category}
                  </p>
                  {prompts.filter(p => p.category === category).map(prompt => (
                    <motion.button
                      key={prompt.id}
                      onClick={() => setSelectedPrompt(prompt)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all",
                        selectedPrompt?.id === prompt.id
                          ? "glass gradient-border glow-primary-sm"
                          : "bg-card hover:bg-surface-hover border border-border"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{prompt.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePrompt(prompt.id);
                          }}
                          className={cn(
                            "transition-colors",
                            prompt.enabled ? "text-success" : "text-muted-foreground"
                          )}
                        >
                          {prompt.enabled ? (
                            <ToggleRight className="w-6 h-6" />
                          ) : (
                            <ToggleLeft className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
                      <div className="flex gap-1.5">
                        {prompt.userTypes.map(type => {
                          const config = userTypeConfig[type];
                          return (
                            <span key={type} className={cn("text-xs px-2 py-0.5 rounded-full bg-muted", config.color)}>
                              {config.label}
                            </span>
                          );
                        })}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>

            {/* Prompt Editor */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPrompt ? (
                <>
                  <div className="glass gradient-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">
                          {selectedPrompt.name}
                        </h3>
                      </div>
                      <span className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        selectedPrompt.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {selectedPrompt.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      System Prompt
                    </label>
                    <textarea
                      value={selectedPrompt.prompt}
                      onChange={(e) => updatePrompt(selectedPrompt.id, e.target.value)}
                      rows={12}
                      className="w-full p-4 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground outline-none transition-all font-mono text-sm resize-none"
                    />

                    <div className="mt-4 flex items-center gap-4">
                      <p className="text-xs text-muted-foreground">
                        Applied to: 
                        {selectedPrompt.userTypes.map((type, i) => (
                          <span key={type} className="ml-1">
                            {userTypeConfig[type].label}{i < selectedPrompt.userTypes.length - 1 ? "," : ""}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  {/* Test Console */}
                  <div className="glass gradient-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Test Console</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Test Input
                        </label>
                        <textarea
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          rows={3}
                          placeholder="Enter a sample input to test this prompt..."
                          className="w-full p-4 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground outline-none transition-all text-sm resize-none"
                        />
                      </div>

                      <button
                        onClick={handleTest}
                        disabled={isTesting || !testInput}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        {isTesting ? "Testing..." : "Run Test"}
                      </button>

                      {testOutput && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Preview Response
                          </label>
                          <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground whitespace-pre-wrap font-mono">
                            {testOutput}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96 glass gradient-border rounded-xl">
                  <p className="text-muted-foreground">Select a prompt to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
