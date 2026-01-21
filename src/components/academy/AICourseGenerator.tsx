import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, 
  Sparkles, 
  FileText, 
  Video, 
  Mic, 
  Monitor, 
  HelpCircle,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  GraduationCap,
  Target,
  Clock,
  BookOpen,
  X,
  Edit,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCourses } from "@/hooks/useCourses";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const TIER_OPTIONS = [
  { id: "free", label: "Free", color: "bg-muted text-muted-foreground" },
  { id: "ai_assistant", label: "AI Assistant", color: "bg-info/20 text-info" },
  { id: "ai_operations", label: "AI Operations", color: "bg-primary/20 text-primary" },
  { id: "ai_enterprise", label: "AI Enterprise", color: "bg-success/20 text-success" },
  { id: "ai_advisory", label: "AI Advisory", color: "bg-warning/20 text-warning" },
  { id: "ai_tax", label: "AI Tax", color: "bg-destructive/20 text-destructive" },
  { id: "cohort", label: "Cohort", color: "bg-purple-500/20 text-purple-500" },
];

const DIFFICULTY_OPTIONS = [
  { id: "beginner", label: "Beginner", description: "No prior knowledge required" },
  { id: "intermediate", label: "Intermediate", description: "Some experience helpful" },
  { id: "advanced", label: "Advanced", description: "For experienced learners" },
];

interface GeneratedLesson {
  title: string;
  description: string;
  content: string;
  lesson_type: "text" | "video";
  duration_minutes: number;
  video_script?: string;
  audio_script?: string;
  screenshare_notes?: string;
  quizzes: {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }[];
}

interface GeneratedCourse {
  title: string;
  description: string;
  thumbnail_prompt: string;
  target_audience: string;
  learning_objectives: string[];
  lessons: GeneratedLesson[];
  estimated_duration_hours: number;
}

interface AICourseGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AICourseGenerator({ isOpen, onClose }: AICourseGeneratorProps) {
  const { createCourse, createLesson, addQuiz } = useCourses();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Step 1: Topic
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  
  // Step 2: Preferences
  const [lessonCount, setLessonCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [includeText, setIncludeText] = useState(true);
  const [includeVideo, setIncludeVideo] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [includeScreenshare, setIncludeScreenshare] = useState(false);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  
  // Step 3: Review generated content
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<string[]>(["free"]);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  
  // Editable course data
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a course topic");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-course", {
        body: {
          topic,
          preferences: {
            lessonCount,
            includeText,
            includeVideo,
            includeAudio,
            includeScreenshare,
            includeQuizzes,
            targetAudience,
            difficulty,
          },
        },
      });

      if (error) throw error;

      setGeneratedCourse(data);
      setEditedTitle(data.title);
      setEditedDescription(data.description);
      setStep(3);
      toast.success("Course generated successfully!");
    } catch (error: unknown) {
      console.error("Failed to generate course:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate course";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!generatedCourse) return;

    setIsCreating(true);
    try {
      // Create the course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          title: editedTitle,
          description: editedDescription,
          tier_access: selectedTiers,
          status: "draft",
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create lessons and quizzes
      for (let i = 0; i < generatedCourse.lessons.length; i++) {
        const lesson = generatedCourse.lessons[i];
        
        const { data: lessonData, error: lessonError } = await supabase
          .from("course_lessons")
          .insert({
            course_id: courseData.id,
            title: lesson.title,
            content: lesson.content,
            lesson_type: lesson.lesson_type,
            duration_minutes: lesson.duration_minutes,
            order_index: i,
          })
          .select()
          .single();

        if (lessonError) throw lessonError;

        // Create quizzes for this lesson
        if (lesson.quizzes && lesson.quizzes.length > 0) {
          for (let j = 0; j < lesson.quizzes.length; j++) {
            const quiz = lesson.quizzes[j];
            
            const { error: quizError } = await supabase
              .from("course_quizzes")
              .insert({
                lesson_id: lessonData.id,
                question: quiz.question,
                question_type: "multiple_choice",
                options: quiz.options,
                correct_answer: quiz.correct_answer,
                explanation: quiz.explanation,
                order_index: j,
              });

            if (quizError) throw quizError;
          }
        }
      }

      // Invalidate the courses query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      
      toast.success("Course created successfully! You can now publish it.");
      onClose();
      resetForm();
    } catch (error: unknown) {
      console.error("Failed to create course:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create course";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setTopic("");
    setTargetAudience("");
    setLessonCount(5);
    setDifficulty("intermediate");
    setIncludeText(true);
    setIncludeVideo(true);
    setIncludeAudio(false);
    setIncludeScreenshare(false);
    setIncludeQuizzes(true);
    setGeneratedCourse(null);
    setSelectedTiers(["free"]);
    setExpandedLesson(null);
    setEditedTitle("");
    setEditedDescription("");
  };

  const toggleTier = (tierId: string) => {
    setSelectedTiers(prev => 
      prev.includes(tierId) 
        ? prev.filter(t => t !== tierId)
        : [...prev, tierId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Course Generator
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "flex-1 h-1 mx-2 rounded-full transition-all",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Topic */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">What would you like to teach?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter a topic and our AI will create a comprehensive course for you
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Course Topic *</Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., How to start a small business, Introduction to digital marketing..."
                      className="mt-1 text-lg py-6"
                    />
                  </div>

                  <div>
                    <Label htmlFor="audience">Target Audience (optional)</Label>
                    <Input
                      id="audience"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Small business owners, Marketing professionals..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Customize Your Course</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose what type of content to include
                  </p>
                </div>

                {/* Lesson Count */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Number of Lessons</Label>
                    <span className="text-lg font-semibold text-primary">{lessonCount}</span>
                  </div>
                  <Slider
                    value={[lessonCount]}
                    onValueChange={(v) => setLessonCount(v[0])}
                    min={3}
                    max={15}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <Label>Difficulty Level</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setDifficulty(opt.id as typeof difficulty)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-left",
                          difficulty === opt.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Types */}
                <div className="space-y-4">
                  <Label>Content Types</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      includeText ? "border-primary bg-primary/5" : "border-border"
                    )}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Text Content</span>
                      </div>
                      <Switch checked={includeText} onCheckedChange={setIncludeText} />
                    </div>

                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      includeVideo ? "border-primary bg-primary/5" : "border-border"
                    )}>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Video Scripts</span>
                      </div>
                      <Switch checked={includeVideo} onCheckedChange={setIncludeVideo} />
                    </div>

                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      includeAudio ? "border-primary bg-primary/5" : "border-border"
                    )}>
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Audio/Voiceover</span>
                      </div>
                      <Switch checked={includeAudio} onCheckedChange={setIncludeAudio} />
                    </div>

                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      includeScreenshare ? "border-primary bg-primary/5" : "border-border"
                    )}>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Screenshare Notes</span>
                      </div>
                      <Switch checked={includeScreenshare} onCheckedChange={setIncludeScreenshare} />
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    includeQuizzes ? "border-primary bg-primary/5" : "border-border"
                  )}>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-sm font-medium">Include Quizzes</span>
                        <p className="text-xs text-muted-foreground">Add quiz questions to test knowledge</p>
                      </div>
                    </div>
                    <Switch checked={includeQuizzes} onCheckedChange={setIncludeQuizzes} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && generatedCourse && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Review Your Course</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review and customize the generated content before creating
                  </p>
                </div>

                {/* Course Overview */}
                <div className="glass rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="edit-title">Course Title</Label>
                      <Input
                        id="edit-title"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="mt-1 font-semibold"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{generatedCourse.lessons.length} Lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{generatedCourse.estimated_duration_hours}h estimated</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{generatedCourse.target_audience}</span>
                    </div>
                  </div>

                  {generatedCourse.learning_objectives && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-2">Learning Objectives:</p>
                      <ul className="space-y-1">
                        {generatedCourse.learning_objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Target className="w-3 h-3 mt-1 text-primary" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Tier Selection */}
                <div>
                  <Label className="mb-2 block">Tier Access</Label>
                  <div className="flex flex-wrap gap-2">
                    {TIER_OPTIONS.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => toggleTier(tier.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2",
                          selectedTiers.includes(tier.id)
                            ? `${tier.color} border-current`
                            : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                        )}
                      >
                        {tier.label}
                        {selectedTiers.includes(tier.id) && (
                          <Check className="w-3 h-3 ml-1 inline" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lessons Preview */}
                <div>
                  <Label className="mb-2 block">Lessons Preview</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {generatedCourse.lessons.map((lesson, index) => (
                      <div key={index} className="border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedLesson(expandedLesson === index ? null : index)}
                          className="w-full flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-sm text-muted-foreground font-mono">#{index + 1}</span>
                          {lesson.lesson_type === "video" ? (
                            <Video className="w-4 h-4 text-primary" />
                          ) : (
                            <FileText className="w-4 h-4 text-primary" />
                          )}
                          <span className="flex-1 text-left font-medium text-sm">{lesson.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {lesson.duration_minutes}min
                          </Badge>
                          {lesson.quizzes?.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {lesson.quizzes.length} quiz
                            </Badge>
                          )}
                          {expandedLesson === index ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedLesson === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 text-sm text-muted-foreground">
                                <p className="mb-2 font-medium text-foreground">{lesson.description}</p>
                                <p className="line-clamp-4">{lesson.content.substring(0, 300)}...</p>
                                
                                {lesson.quizzes && lesson.quizzes.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border">
                                    <p className="font-medium text-foreground mb-2">Quiz Questions:</p>
                                    {lesson.quizzes.map((quiz, qIdx) => (
                                      <div key={qIdx} className="flex items-start gap-2 mb-1">
                                        <HelpCircle className="w-3 h-3 mt-1 text-primary" />
                                        <span className="text-xs">{quiz.question}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border px-4">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 1) {
                onClose();
                resetForm();
              } else {
                setStep(step - 1);
              }
            }}
            disabled={isGenerating || isCreating}
          >
            {step === 1 ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!topic.trim()}>
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {step === 2 && (
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Course...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Course
                </>
              )}
            </Button>
          )}

          {step === 3 && (
            <Button onClick={handleCreateCourse} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Course...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
