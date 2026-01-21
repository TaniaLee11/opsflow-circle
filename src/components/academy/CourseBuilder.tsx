import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Plus, 
  Trash2, 
  GripVertical, 
  Video, 
  FileText, 
  HelpCircle,
  Upload,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Course, CourseLesson, useCourses } from "@/hooks/useCourses";

const TIER_OPTIONS = [
  { id: "free", label: "Free", color: "bg-muted text-muted-foreground" },
  { id: "ai_assistant", label: "AI Assistant", color: "bg-info/20 text-info" },
  { id: "ai_operations", label: "AI Operations", color: "bg-primary/20 text-primary" },
  { id: "ai_enterprise", label: "AI Enterprise", color: "bg-success/20 text-success" },
  { id: "ai_advisory", label: "AI Advisory", color: "bg-warning/20 text-warning" },
  { id: "ai_tax", label: "AI Tax", color: "bg-destructive/20 text-destructive" },
  { id: "cohort", label: "Cohort", color: "bg-purple-500/20 text-purple-500" },
];

interface CourseBuilderProps {
  course?: Course;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseBuilder({ course, isOpen, onClose }: CourseBuilderProps) {
  const { 
    createCourse, 
    updateCourse, 
    publishCourse,
    createLesson, 
    updateLesson, 
    deleteLesson,
    addQuiz,
    deleteQuiz,
    isCreating, 
    isUpdating 
  } = useCourses();

  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [tierAccess, setTierAccess] = useState<string[]>(course?.tier_access || ["free"]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [newLessonType, setNewLessonType] = useState<"text" | "video">("text");

  // Quiz builder state
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState("");

  const isEditing = !!course;
  const lessons = course?.lessons || [];

  const handleSave = () => {
    if (isEditing && course) {
      updateCourse({
        id: course.id,
        title,
        description,
        tier_access: tierAccess,
      });
    } else {
      createCourse({
        title,
        description,
        tier_access: tierAccess,
      });
      onClose();
    }
  };

  const handleAddLesson = () => {
    if (!course) return;
    createLesson({
      course_id: course.id,
      title: `New ${newLessonType === "video" ? "Video" : "Text"} Lesson`,
      lesson_type: newLessonType,
    });
  };

  const handleUpdateLesson = (lessonId: string, updates: Partial<CourseLesson>) => {
    updateLesson({ id: lessonId, ...updates });
  };

  const handleAddQuiz = (lessonId: string) => {
    if (!quizQuestion.trim()) return;
    
    addQuiz({
      lesson_id: lessonId,
      question: quizQuestion,
      question_type: "multiple_choice",
      options: quizOptions.filter(o => o.trim()),
      correct_answer: quizOptions[quizCorrectAnswer],
      explanation: quizExplanation || null,
    });

    // Reset quiz form
    setQuizQuestion("");
    setQuizOptions(["", "", "", ""]);
    setQuizCorrectAnswer(0);
    setQuizExplanation("");
  };

  const toggleTier = (tierId: string) => {
    setTierAccess(prev => 
      prev.includes(tierId) 
        ? prev.filter(t => t !== tierId)
        : [...prev, tierId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? "Edit Course" : "Create New Course"}</span>
            {isEditing && course && (
              <div className="flex items-center gap-2">
                <Badge variant={course.status === "published" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
                <Button
                  size="sm"
                  variant={course.status === "published" ? "outline" : "default"}
                  onClick={() => publishCourse({ id: course.id, publish: course.status !== "published" })}
                >
                  {course.status === "published" ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Course Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label>Tier Access</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select which tiers can access this course
              </p>
              <div className="flex flex-wrap gap-2">
                {TIER_OPTIONS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => toggleTier(tier.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2",
                      tierAccess.includes(tier.id)
                        ? `${tier.color} border-current`
                        : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    {tier.label}
                    {tierAccess.includes(tier.id) && (
                      <Check className="w-3 h-3 ml-1 inline" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lessons Section - Only show when editing */}
          {isEditing && course && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Lessons ({lessons.length})</Label>
                <div className="flex items-center gap-2">
                  <select
                    value={newLessonType}
                    onChange={(e) => setNewLessonType(e.target.value as "text" | "video")}
                    className="text-sm bg-secondary rounded-lg px-2 py-1 border-0"
                  >
                    <option value="text">Text Lesson</option>
                    <option value="video">Video Lesson</option>
                  </select>
                  <Button size="sm" onClick={handleAddLesson}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Lesson
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {lessons.map((lesson, index) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      {/* Lesson Header */}
                      <div 
                        className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer"
                        onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          {lesson.lesson_type === "video" ? (
                            <Video className="w-4 h-4 text-primary" />
                          ) : (
                            <FileText className="w-4 h-4 text-primary" />
                          )}
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                        </div>
                        <Input
                          value={lesson.title}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateLesson(lesson.id, { title: e.target.value });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-8 text-sm bg-background"
                        />
                        <Badge variant="outline" className="text-xs">
                          {lesson.quizzes?.length || 0} quiz
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLesson(lesson.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        {expandedLesson === lesson.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>

                      {/* Expanded Lesson Content */}
                      <AnimatePresence>
                        {expandedLesson === lesson.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <Tabs defaultValue="content" className="p-4">
                              <TabsList className="mb-4">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="quizzes">
                                  Quizzes ({lesson.quizzes?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="attachments">
                                  Attachments
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value="content" className="space-y-4">
                                {lesson.lesson_type === "video" && (
                                  <div>
                                    <Label>Video URL (YouTube, Vimeo, etc.)</Label>
                                    <Input
                                      value={lesson.video_url || ""}
                                      onChange={(e) => handleUpdateLesson(lesson.id, { video_url: e.target.value })}
                                      placeholder="https://youtube.com/watch?v=..."
                                      className="mt-1"
                                    />
                                  </div>
                                )}
                                <div>
                                  <Label>Lesson Content</Label>
                                  <Textarea
                                    value={lesson.content || ""}
                                    onChange={(e) => handleUpdateLesson(lesson.id, { content: e.target.value })}
                                    placeholder="Write your lesson content here... (Markdown supported)"
                                    className="mt-1 min-h-[200px] font-mono text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Duration (minutes)</Label>
                                    <Input
                                      type="number"
                                      value={lesson.duration_minutes || ""}
                                      onChange={(e) => handleUpdateLesson(lesson.id, { duration_minutes: parseInt(e.target.value) || null })}
                                      placeholder="15"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="quizzes" className="space-y-4">
                                {/* Existing quizzes */}
                                {lesson.quizzes && lesson.quizzes.length > 0 && (
                                  <div className="space-y-2">
                                    {lesson.quizzes.map((quiz, qIndex) => (
                                      <div key={quiz.id} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                                        <HelpCircle className="w-4 h-4 text-primary mt-0.5" />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{quiz.question}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Answer: {quiz.correct_answer}
                                          </p>
                                        </div>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6"
                                          onClick={() => deleteQuiz(quiz.id)}
                                        >
                                          <Trash2 className="w-3 h-3 text-destructive" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Add new quiz */}
                                <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                                  <p className="text-sm font-medium">Add Quiz Question</p>
                                  <Input
                                    value={quizQuestion}
                                    onChange={(e) => setQuizQuestion(e.target.value)}
                                    placeholder="Enter your question..."
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    {quizOptions.map((option, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name="correctAnswer"
                                          checked={quizCorrectAnswer === i}
                                          onChange={() => setQuizCorrectAnswer(i)}
                                          className="w-4 h-4"
                                        />
                                        <Input
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...quizOptions];
                                            newOptions[i] = e.target.value;
                                            setQuizOptions(newOptions);
                                          }}
                                          placeholder={`Option ${i + 1}`}
                                          className="flex-1"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <Input
                                    value={quizExplanation}
                                    onChange={(e) => setQuizExplanation(e.target.value)}
                                    placeholder="Explanation (optional)"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddQuiz(lesson.id)}
                                    disabled={!quizQuestion.trim()}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Question
                                  </Button>
                                </div>
                              </TabsContent>

                              <TabsContent value="attachments">
                                <div className="text-center py-8 text-muted-foreground">
                                  <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Drag and drop files here</p>
                                  <p className="text-xs">or click to upload</p>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {lessons.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No lessons yet</p>
                    <p className="text-xs">Add your first lesson to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isCreating || isUpdating}>
            <Save className="w-4 h-4 mr-1" />
            {isEditing ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
