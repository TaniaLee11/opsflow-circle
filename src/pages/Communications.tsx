import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Users, 
  Settings2, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
  X,
  ChevronDown,
  Plus,
  Inbox,
  SendHorizontal,
  ListChecks,
  Zap
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { VOPSyMascot } from "@/components/brand/VOPSyMascot";
import { cn } from "@/lib/utils";

type Channel = "email" | "sms" | "auto";
type MessageStatus = "draft" | "scheduled" | "sent" | "failed";

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Message {
  id: string;
  channel: "email" | "sms";
  subject?: string;
  body: string;
  recipients: Contact[];
  status: MessageStatus;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

// Mock contacts for demo
const mockContacts: Contact[] = [
  { id: "1", name: "John Smith", email: "john@example.com", phone: "+1234567890" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1987654321" },
  { id: "3", name: "Mike Wilson", email: "mike@example.com", phone: "+1456789012" },
  { id: "4", name: "Emily Davis", email: "emily@example.com", phone: "+1789012345" },
];

// VOPSy Embedded Assistant Component
function VOPSyAssistant({ 
  onDraftMessage, 
  onRewrite,
  currentMessage 
}: { 
  onDraftMessage: (message: string) => void;
  onRewrite: (style: string) => void;
  currentMessage: string;
}) {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Draft a follow-up email",
    "Make it more professional",
    "Shorten this message",
    "Add a call to action"
  ]);

  const handleCommand = (command: string) => {
    setIsThinking(true);
    setTimeout(() => {
      if (command.toLowerCase().includes("draft")) {
        onDraftMessage("Thank you for reaching out. I wanted to follow up on our previous conversation and see if you have any questions. Please let me know a convenient time to connect.");
      } else if (command.toLowerCase().includes("professional")) {
        onRewrite("professional");
      } else if (command.toLowerCase().includes("shorten")) {
        onRewrite("concise");
      } else if (command.toLowerCase().includes("call to action")) {
        onRewrite("cta");
      }
      setIsThinking(false);
    }, 1000);
  };

  return (
    <Card className="border-primary/20 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <VOPSyMascot size="sm" />
          <div>
            <CardTitle className="text-sm font-medium">VOPSy Communications</CardTitle>
            <CardDescription className="text-xs">Your AI operations assistant</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleCommand(suggestion)}
              disabled={isThinking}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Custom Command Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask VOPSy to help..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                handleCommand(input);
                setInput("");
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={() => {
              if (input.trim()) {
                handleCommand(input);
                setInput("");
              }
            }}
            disabled={isThinking || !input.trim()}
          >
            {isThinking ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            VOPSy is thinking...
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Compose Message Component
function ComposeMessage({
  channel,
  setChannel,
  subject,
  setSubject,
  body,
  setBody,
  recipients,
  setRecipients,
  onSend,
  onSchedule
}: {
  channel: Channel;
  setChannel: (c: Channel) => void;
  subject: string;
  setSubject: (s: string) => void;
  body: string;
  setBody: (b: string) => void;
  recipients: Contact[];
  setRecipients: (r: Contact[]) => void;
  onSend: () => void;
  onSchedule: () => void;
}) {
  const { toast } = useToast();
  const [showContactPicker, setShowContactPicker] = useState(false);
  
  // Voice input for body
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error: voiceError,
    toggleListening,
  } = useVoiceInput({
    onTranscript: (text) => {
      const newBody = body + (body ? " " : "") + text;
      setBody(newBody);
      toast({
        title: "Voice captured",
        description: "Your speech has been added to the message.",
      });
    },
    continuous: true,
  });

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const addRecipient = (contact: Contact) => {
    if (!recipients.find(r => r.id === contact.id)) {
      setRecipients([...recipients, contact]);
    }
    setShowContactPicker(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Compose Message</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </div>
                </SelectItem>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    VOPSy Decides
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipients */}
        <div className="space-y-2">
          <Label>Recipients</Label>
          <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border rounded-md bg-background">
            {recipients.map((contact) => (
              <Badge key={contact.id} variant="secondary" className="gap-1">
                {contact.name}
                <button onClick={() => removeRecipient(contact.id)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setShowContactPicker(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Subject (Email only) */}
        {(channel === "email" || channel === "auto") && (
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              placeholder="Enter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}

        {/* Message Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Message</Label>
            {isSupported && (
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={toggleListening}
                className="gap-2"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="relative">
            <Textarea
              placeholder="Type your message or use voice input..."
              value={body + (interimTranscript ? ` ${interimTranscript}` : "")}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className={cn(isListening && "ring-2 ring-primary animate-pulse")}
            />
            {isListening && (
              <div className="absolute bottom-2 right-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-destructive"
                />
              </div>
            )}
          </div>
          {voiceError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {voiceError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {channel === "sms" ? `${body.length}/160 characters` : `${body.length} characters`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={onSend} className="flex-1 gap-2">
            <SendHorizontal className="w-4 h-4" />
            Send Now
          </Button>
          <Button variant="outline" onClick={onSchedule} className="gap-2">
            <Clock className="w-4 h-4" />
            Schedule
          </Button>
        </div>

        {/* Contact Picker Dialog */}
        <Dialog open={showContactPicker} onOpenChange={setShowContactPicker}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Recipients</DialogTitle>
              <DialogDescription>
                Choose contacts to add to your message.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {mockContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => addRecipient(contact)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-colors hover:bg-accent",
                      recipients.find(r => r.id === contact.id) && "bg-primary/10 border-primary"
                    )}
                  >
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contact.email} {contact.phone && `• ${contact.phone}`}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Batch Communications Component
function BatchCommunications() {
  const { toast } = useToast();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [batchChannel, setBatchChannel] = useState<"email" | "sms" | "both">("email");
  const [batchMessage, setBatchMessage] = useState("");
  const [batchSubject, setBatchSubject] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const toggleContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedContacts(mockContacts.map(c => c.id));
  };

  const handleBatchSend = () => {
    toast({
      title: "Batch messages sent",
      description: `${selectedContacts.length} messages have been queued for delivery.`,
    });
    setShowConfirmDialog(false);
    setSelectedContacts([]);
    setBatchMessage("");
    setBatchSubject("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Batch Communications
            </CardTitle>
            <CardDescription>Send to multiple recipients at once</CardDescription>
          </div>
          <Badge variant="outline">{selectedContacts.length} selected</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Select Recipients</Label>
            <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs">
              Select All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mockContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => toggleContact(contact.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors",
                  selectedContacts.includes(contact.id) 
                    ? "bg-primary/10 border-primary" 
                    : "hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center",
                    selectedContacts.includes(contact.id) && "bg-primary border-primary"
                  )}>
                    {selectedContacts.includes(contact.id) && (
                      <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{contact.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Channel Selection */}
        <div className="space-y-2">
          <Label>Delivery Channel</Label>
          <Select value={batchChannel} onValueChange={(v) => setBatchChannel(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="both">Both Email & SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        {(batchChannel === "email" || batchChannel === "both") && (
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              placeholder="Email subject..."
              value={batchSubject}
              onChange={(e) => setBatchSubject(e.target.value)}
            />
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            placeholder="Enter your batch message..."
            value={batchMessage}
            onChange={(e) => setBatchMessage(e.target.value)}
            rows={4}
          />
        </div>

        {/* Send Button */}
        <Button 
          className="w-full gap-2"
          disabled={selectedContacts.length === 0 || !batchMessage.trim()}
          onClick={() => setShowConfirmDialog(true)}
        >
          <Send className="w-4 h-4" />
          Preview & Send to {selectedContacts.length} Recipients
        </Button>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Batch Send</DialogTitle>
              <DialogDescription>
                You are about to send messages to {selectedContacts.length} recipients via {batchChannel === "both" ? "email and SMS" : batchChannel}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                {batchSubject && (
                  <p className="text-sm font-medium mb-2">Subject: {batchSubject}</p>
                )}
                <p className="text-sm text-muted-foreground">{batchMessage}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedContacts.map(id => {
                  const contact = mockContacts.find(c => c.id === id);
                  return contact && (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {contact.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBatchSend} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Confirm Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Auto-Send Rules Component
function AutoSendRules() {
  const { toast } = useToast();
  const [rules, setRules] = useState([
    { id: "1", name: "Follow-up Reminder", trigger: "3 days after last contact", enabled: true, channel: "email" },
    { id: "2", name: "Payment Reminder", trigger: "1 day before due date", enabled: false, channel: "sms" },
  ]);

  const toggleRule = (id: string) => {
    setRules(rules.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
    toast({
      title: "Rule updated",
      description: "Auto-send rule has been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Auto-Send Rules
            </CardTitle>
            <CardDescription>Automated communications with your approval</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div 
              key={rule.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                rule.enabled ? "bg-primary/5 border-primary/20" : "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  rule.enabled ? "bg-primary/10" : "bg-muted"
                )}>
                  {rule.channel === "email" ? (
                    <Mail className={cn("w-4 h-4", rule.enabled ? "text-primary" : "text-muted-foreground")} />
                  ) : (
                    <MessageSquare className={cn("w-4 h-4", rule.enabled ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.trigger}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={rule.enabled ? "default" : "secondary"}>
                  {rule.enabled ? "Active" : "Paused"}
                </Badge>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          All auto-sends require explicit rules. No messages are sent without your configuration.
        </p>
      </CardContent>
    </Card>
  );
}

// Main Communications Page
export default function Communications() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("compose");
  
  // Compose state
  const [channel, setChannel] = useState<Channel>("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<Contact[]>([]);

  const handleDraftMessage = (message: string) => {
    setBody(message);
    toast({
      title: "Draft created",
      description: "VOPSy has drafted a message for you.",
    });
  };

  const handleRewrite = (style: string) => {
    // Simulated rewrite
    const rewrites: Record<string, string> = {
      professional: "I hope this message finds you well. I am writing to follow up on our previous correspondence. Please do not hesitate to reach out should you require any further information.",
      concise: "Following up on our last discussion. Let me know if you have questions.",
      cta: body + "\n\nPlease reply by Friday to confirm your availability.",
    };
    setBody(rewrites[style] || body);
    toast({
      title: "Message rewritten",
      description: `VOPSy has made your message more ${style}.`,
    });
  };

  const handleSend = () => {
    if (recipients.length === 0) {
      toast({
        variant: "destructive",
        title: "No recipients",
        description: "Please add at least one recipient.",
      });
      return;
    }
    if (!body.trim()) {
      toast({
        variant: "destructive",
        title: "Empty message",
        description: "Please enter a message.",
      });
      return;
    }
    toast({
      title: "Message sent",
      description: `Your ${channel === "auto" ? "message" : channel} has been sent to ${recipients.length} recipient(s).`,
    });
    // Reset form
    setSubject("");
    setBody("");
    setRecipients([]);
  };

  const handleSchedule = () => {
    toast({
      title: "Schedule message",
      description: "Scheduling functionality coming soon.",
    });
  };

  return (
    <AccessGate>
      <Helmet>
        <title>Communications | Virtual OPS Hub</title>
        <meta name="description" content="Operational communications workspace with email, SMS, and AI-powered assistance." />
      </Helmet>

      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Communications</h1>
                <p className="text-muted-foreground">Operational messaging with VOPSy assistance</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Inbox className="w-4 h-4" />
                  Inbox
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <ListChecks className="w-4 h-4" />
                  Sent
                </Button>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Compose & Tabs */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="compose" className="gap-2">
                      <Edit3 className="w-4 h-4" />
                      Compose
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="gap-2">
                      <Users className="w-4 h-4" />
                      Batch
                    </TabsTrigger>
                    <TabsTrigger value="automation" className="gap-2">
                      <Zap className="w-4 h-4" />
                      Auto-Send
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="compose" className="mt-4">
                    <ComposeMessage
                      channel={channel}
                      setChannel={setChannel}
                      subject={subject}
                      setSubject={setSubject}
                      body={body}
                      setBody={setBody}
                      recipients={recipients}
                      setRecipients={setRecipients}
                      onSend={handleSend}
                      onSchedule={handleSchedule}
                    />
                  </TabsContent>

                  <TabsContent value="batch" className="mt-4">
                    <BatchCommunications />
                  </TabsContent>

                  <TabsContent value="automation" className="mt-4">
                    <AutoSendRules />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - VOPSy Assistant */}
              <div className="space-y-6">
                <VOPSyAssistant
                  onDraftMessage={handleDraftMessage}
                  onRewrite={handleRewrite}
                  currentMessage={body}
                />

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Emails Sent
                      </div>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        SMS Sent
                      </div>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Scheduled
                      </div>
                      <span className="font-medium">0</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Channel Info */}
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>Operational Communications</strong> — This workspace is designed for intentional, 
                      business-focused messaging. Connect your email and SMS providers in Integrations to enable 
                      sending capabilities.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
