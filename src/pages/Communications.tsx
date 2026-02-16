import { useState, useCallback, useRef, useEffect } from "react";
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
  Zap,
  Search,
  Trash2,
  Download,
  Upload,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
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
import { useSavedContacts, SavedContact } from "@/hooks/useSavedContacts";
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
          <VOPSyMascot size="sm" animate={false} />
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
  const [emailInput, setEmailInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Saved contacts hook
  const { contacts: savedContacts, saveContact, searchContacts } = useSavedContacts();
  
  // Filter suggestions based on input
  const suggestions = searchContacts(emailInput);
  
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Add recipient from email input
  const addRecipientFromInput = (email: string, name?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return;
    
    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Check if already added
    if (recipients.find(r => r.email?.toLowerCase() === trimmedEmail)) {
      toast({
        title: "Already added",
        description: "This email is already in the recipients list.",
      });
      setEmailInput("");
      setShowSuggestions(false);
      return;
    }

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: name || trimmedEmail.split('@')[0],
      email: trimmedEmail,
    };
    
    setRecipients([...recipients, newContact]);
    setEmailInput("");
    setShowSuggestions(false);
    
    // Save to database for future autocomplete
    saveContact(trimmedEmail, name);
  };

  // Handle key press in email input
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipientFromInput(emailInput);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Select suggestion
  const selectSuggestion = (contact: SavedContact) => {
    addRecipientFromInput(contact.email, contact.name);
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
        {/* Recipients - Email Input with Autocomplete */}
        <div className="space-y-2">
          <Label>Recipients</Label>
          <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border rounded-md bg-background relative">
            {recipients.map((contact) => (
              <Badge key={contact.id} variant="secondary" className="gap-1">
                {contact.email || contact.name}
                <button onClick={() => removeRecipient(contact.id)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <div className="relative flex-1 min-w-[200px]">
              <Input
                ref={inputRef}
                type="email"
                placeholder="Type email address..."
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setShowSuggestions(e.target.value.length >= 2);
                }}
                onKeyDown={handleEmailKeyDown}
                onFocus={() => emailInput.length >= 2 && setShowSuggestions(true)}
                className="border-0 shadow-none h-7 p-0 focus-visible:ring-0"
              />
              
              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 mt-1 w-full bg-popover border rounded-md shadow-lg z-50 max-h-[200px] overflow-auto"
                >
                  {suggestions.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => selectSuggestion(contact)}
                      className="w-full p-2 text-left hover:bg-accent transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{contact.email}</p>
                        {contact.name && (
                          <p className="text-xs text-muted-foreground">{contact.name}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Used {contact.use_count}x
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Type an email and press Enter to add. Previously used emails will appear as suggestions.
          </p>
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
      </CardContent>
    </Card>
  );
}

// Batch Communications Component
function BatchCommunications() {
  const { toast } = useToast();
  const { 
    contacts: savedContacts, 
    loading: loadingContacts, 
    exportEmailList, 
    importEmailList,
    bulkSaveEmails 
  } = useSavedContacts();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [batchChannel, setBatchChannel] = useState<"email">("email");
  const [batchMessage, setBatchMessage] = useState("");
  const [batchSubject, setBatchSubject] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedContacts(savedContacts.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedContacts([]);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importEmailList(file);
      e.target.value = ''; // Reset file input
    }
  };

  const handleBatchSend = async () => {
    setIsSending(true);
    
    try {
      // Get BCC list from selected contacts
      const bccEmails = selectedContacts
        .map(id => savedContacts.find(c => c.id === id)?.email)
        .filter((email): email is string => !!email);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          subject: batchSubject,
          body: batchMessage,
          bcc: bccEmails,
          isNewEmail: true,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Batch email sent",
          description: `Email sent to ${bccEmails.length} recipients as BCC.`,
        });
        
        // Save all emails for future use
        await bulkSaveEmails(bccEmails);
        
        setShowConfirmDialog(false);
        setSelectedContacts([]);
        setBatchMessage("");
        setBatchSubject("");
      } else {
        throw new Error(data?.error || "Failed to send batch email");
      }
    } catch (err: any) {
      console.error("Batch send error:", err);
      toast({
        title: "Send failed",
        description: err.message || "Failed to send batch email. Please check your email integration.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
            <CardDescription>Send to multiple recipients as BCC from your connected account</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selectedContacts.length} selected</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import/Export Controls */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
          <div className="flex-1">
            <p className="text-sm font-medium">Email List</p>
            <p className="text-xs text-muted-foreground">Import or export your saved email recipients</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleImportClick} className="gap-1">
            <Upload className="w-3.5 h-3.5" />
            Import List
          </Button>
          <Button variant="outline" size="sm" onClick={exportEmailList} className="gap-1">
            <Download className="w-3.5 h-3.5" />
            Export List
          </Button>
        </div>

        {/* BCC Notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Sent as BCC</p>
            <p className="text-xs text-muted-foreground">
              All recipients are added as BCC (blind carbon copy). Recipients cannot see each other's email addresses.
            </p>
          </div>
        </div>

        {/* Contact Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Select Recipients</Label>
            <div className="flex gap-2">
              {selectedContacts.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs">
                  Clear
                </Button>
              )}
              {savedContacts.length > 0 && (
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs">
                  Select All
                </Button>
              )}
            </div>
          </div>
          
          {loadingContacts ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              Loading saved emails...
            </div>
          ) : savedContacts.length === 0 ? (
            <div className="p-4 text-center border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">
                No saved emails yet. Send emails from the Compose tab or import a CSV file.
              </p>
              <Button variant="outline" size="sm" onClick={handleImportClick} className="gap-1">
                <Upload className="w-3.5 h-3.5" />
                Import Email List
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-2 gap-2 pr-4">
                {savedContacts.map((contact) => (
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
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{contact.email}</p>
                        {contact.name && (
                          <p className="text-xs text-muted-foreground truncate">{contact.name}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            placeholder="Email subject..."
            value={batchSubject}
            onChange={(e) => setBatchSubject(e.target.value)}
          />
        </div>

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
        <Dialog open={showConfirmDialog} onOpenChange={(open) => !isSending && setShowConfirmDialog(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Batch Send (BCC)</DialogTitle>
              <DialogDescription>
                You are about to send an email to {selectedContacts.length} recipients as BCC using your connected email account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                {batchSubject && (
                  <p className="text-sm font-medium mb-2">Subject: {batchSubject}</p>
                )}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{batchMessage}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">BCC Recipients ({selectedContacts.length}):</p>
                <div className="flex flex-wrap gap-1 max-h-[100px] overflow-auto">
                  {selectedContacts.map(id => {
                    const contact = savedContacts.find(c => c.id === id);
                    return contact && (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {contact.email}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button onClick={handleBatchSend} className="gap-2" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Send
                  </>
                )}
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

  const handleSend = async () => {
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please log in to send emails.",
      });
      return;
    }

    // Send email to each recipient
    try {
      toast({
        title: "Sending...",
        description: `Sending email to ${recipients.length} recipient(s)...`,
      });

      for (const recipient of recipients) {
        if (!recipient.email) continue;

        const { data, error } = await supabase.functions.invoke("send-email", {
          body: {
            to: recipient.email,
            subject: subject || "(No Subject)",
            body: body,
            userId: user.id,
          },
        });

        if (error) {
          throw new Error(error.message || "Failed to send email");
        }

        if (data?.error) {
          throw new Error(data.error);
        }
      }

      toast({
        title: "Message sent",
        description: `Your email has been sent to ${recipients.length} recipient(s).`,
      });
      
      // Reset form
      setSubject("");
      setBody("");
      setRecipients([]);
    } catch (error) {
      console.error("Send email error:", error);
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: error instanceof Error ? error.message : "An error occurred while sending the email.",
      });
    }
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
        <Navigation />
        
        <main className="flex-1 overflow-y-auto">
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
