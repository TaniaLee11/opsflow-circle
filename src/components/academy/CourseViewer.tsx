import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Play, 
  CheckCircle2, 
  Circle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  HelpCircle,
  Download,
  Clock,
  BookOpen,
  Trophy,
  Award,
  Zap,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Course, CourseLesson, CourseQuiz, useCourses } from "@/hooks/useCourses";
import { useGamification } from "@/hooks/useGamification";
import { LevelUpAnimation } from "./LevelUpAnimation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CourseViewerProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseViewer({ course, isOpen, onClose }: CourseViewerProps) {
  const { user } = useAuth();
  const { enrollAsync, updateProgress } = useCourses();
  const { awardXp, issueCertificate, stats } = useGamification();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);
  const [previousLevel, setPreviousLevel] = useState(stats?.current_level || 1);
  const [localEnrollment, setLocalEnrollment] = useState(course.enrollment);

  const lessons = course.lessons || [];
  const currentLesson = lessons[currentLessonIndex];
  useEffect(() => {
    setLocalEnrollment(course.enrollment);
  }, [course.id, course.enrollment?.id]);

  const enrollment = localEnrollment;

  const completedLessons = new Set(
    (enrollment?.progress?.completed_lessons as string[]) || []
  );

  const progressPercent = lessons.length > 0 
    ? Math.round((completedLessons.size / lessons.length) * 100)
    : 0;

  // Check for level up
  useEffect(() => {
    if (stats && stats.current_level > previousLevel) {
      setLevelUpLevel(stats.current_level);
      setShowLevelUp(true);
      setPreviousLevel(stats.current_level);
    }
  }, [stats?.current_level, previousLevel]);

  const handleEnroll = async () => {
    try {
      const enrollmentData = await enrollAsync(course.id);
      setLocalEnrollment(enrollmentData);
      setCurrentLessonIndex(0);
      setQuizAnswers({});
      setQuizResults({});
      setShowQuizResults(false);
    } catch {
      // toast handled in hook
    }
  };

  const handleMarkComplete = () => {
    if (!enrollment || !currentLesson) return;
    
    const wasAlreadyComplete = completedLessons.has(currentLesson.id);
    updateProgress({ enrollmentId: enrollment.id, lessonId: currentLesson.id });
    
    // Award XP for completing lesson (only if not already complete)
    if (!wasAlreadyComplete) {
      awardXp({ xp: 25, type: 'lesson' });
      toast.success("+25 XP", { 
        description: "Lesson completed!",
        icon: <Zap className="w-4 h-4 text-warning" />
      });

      // Check if this completes the course
      const newCompletedCount = completedLessons.size + 1;
      if (newCompletedCount >= lessons.length) {
        // Award course completion XP and certificate
        setTimeout(() => {
          awardXp({ xp: 100, type: 'course' });
          issueCertificate(course.id);
          toast.success("🎓 Course Completed!", {
            description: "+100 XP bonus",
          });
        }, 500);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      setQuizAnswers({});
      setQuizResults({});
      setShowQuizResults(false);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
      setQuizAnswers({});
      setQuizResults({});
      setShowQuizResults(false);
    }
  };

  const handleQuizSubmit = () => {
    if (!currentLesson?.quizzes) return;
    
    const results: Record<string, boolean> = {};
    currentLesson.quizzes.forEach(quiz => {
      results[quiz.id] = quizAnswers[quiz.id] === quiz.correct_answer;
    });
    setQuizResults(results);
    setShowQuizResults(true);

    // Check if all correct - award XP for perfect quiz
    const allCorrect = Object.values(results).every(Boolean);
    if (allCorrect && currentLesson.quizzes.length > 0) {
      awardXp({ xp: 50, type: 'quiz_perfect' });
      toast.success("+50 XP Perfect Score!", {
        icon: <Sparkles className="w-4 h-4 text-warning" />
      });
    }
  };

  const allQuizzesCorrect = currentLesson?.quizzes?.every(q => quizResults[q.id]) ?? true;

  // Extract video embed URL
  const getVideoInfo = (url: string | null): { type: 'embed' | 'direct' | null; src: string | null } => {
    if (!url) return { type: null, src: null };
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return { type: 'embed', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return { type: 'embed', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    
    // Direct video file (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || url.startsWith('blob:') || url.startsWith('/')) {
      return { type: 'direct', src: url };
    }

    // Default to embed for unknown URLs
    return { type: 'embed', src: url };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">{course.title}</h2>
              <p className="text-xs text-muted-foreground">
                {lessons.length} lessons • {progressPercent}% complete
              </p>
            </div>
          </div>
          {enrollment && (
            <Progress value={progressPercent} className="w-32 h-2" />
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Lesson List */}
          <div className="w-64 border-r border-border bg-muted/30 overflow-y-auto">
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Course Content
              </p>
              <div className="space-y-1">
                {lessons.map((lesson, index) => {
                  const isComplete = completedLessons.has(lesson.id);
                  const isCurrent = index === currentLessonIndex;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors",
                        isCurrent 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {lesson.lesson_type === "video" ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {lesson.duration_minutes && (
                            <span>{lesson.duration_minutes} min</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!enrollment ? (
              /* Enrollment CTA */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Ready to start learning?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {course.description}
                  </p>
                  <Button size="lg" onClick={handleEnroll}>
                    <Play className="w-5 h-5 mr-2" />
                    Enroll & Start Learning
                  </Button>
                </div>
              </div>
            ) : currentLesson ? (
              /* Lesson Content */
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Lesson Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Lesson {currentLessonIndex + 1} of {lessons.length}
                      </Badge>
                      {completedLessons.has(currentLesson.id) && (
                        <Badge className="bg-success/20 text-success border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {currentLesson.title}
                    </h2>
                  </div>

                  {/* Video Player */}
                  {currentLesson.lesson_type === "video" && currentLesson.video_url && (() => {
                    const videoInfo = getVideoInfo(currentLesson.video_url);
                    if (!videoInfo.src) return null;
                    
                    return (
                      <div className="aspect-video rounded-xl overflow-hidden bg-black">
                        {videoInfo.type === 'embed' ? (
                          <iframe
                            src={videoInfo.src}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={videoInfo.src}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    );
                  })()}

                  {/* Text Content */}
                  {currentLesson.content && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{currentLesson.content}</div>
                    </div>
                  )}

                  {/* Quizzes */}
                  {currentLesson.quizzes && currentLesson.quizzes.length > 0 && (
                    <div className="border border-border rounded-xl p-6 space-y-6">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Knowledge Check</h3>
                      </div>

                      {currentLesson.quizzes.map((quiz, qIndex) => (
                        <div key={quiz.id} className="space-y-3">
                          <p className="font-medium">
                            {qIndex + 1}. {quiz.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {(quiz.options as string[] || []).map((option, oIndex) => {
                              const isSelected = quizAnswers[quiz.id] === option;
                              const isCorrect = showQuizResults && option === quiz.correct_answer;
                              const isWrong = showQuizResults && isSelected && !isCorrect;
                              
                              return (
                                <button
                                  key={oIndex}
                                  onClick={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [quiz.id]: option }))}
                                  disabled={showQuizResults}
                                  className={cn(
                                    "p-3 rounded-lg text-left text-sm border-2 transition-all",
                                    isCorrect 
                                      ? "border-success bg-success/10 text-success"
                                      : isWrong
                                        ? "border-destructive bg-destructive/10 text-destructive"
                                        : isSelected
                                          ? "border-primary bg-primary/10"
                                          : "border-border hover:border-primary/50"
                                  )}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                          {showQuizResults && quiz.explanation && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                              💡 {quiz.explanation}
                            </p>
                          )}
                        </div>
                      ))}

                      {!showQuizResults ? (
                        <Button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < currentLesson.quizzes.length}
                        >
                          Check Answers
                        </Button>
                      ) : (
                        <div className={cn(
                          "p-4 rounded-lg",
                          allQuizzesCorrect 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        )}>
                          {allQuizzesCorrect 
                            ? "🎉 Great job! All answers correct!" 
                            : "Some answers need revision. Try again!"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attachments */}
                  {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                    <div className="border border-border rounded-xl p-4">
                      <h4 className="font-medium mb-3">Attachments</h4>
                      <div className="space-y-2">
                        {currentLesson.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Download className="w-4 h-4 text-primary" />
                            <span className="text-sm">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No lessons available
              </div>
            )}

            {/* Footer Navigation */}
            {enrollment && currentLesson && (
              <div className="flex items-center justify-between p-4 border-t border-border bg-background">
                <Button
                  variant="outline"
                  onClick={handlePrevLesson}
                  disabled={currentLessonIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <Button
                  variant={completedLessons.has(currentLesson.id) ? "outline" : "default"}
                  onClick={handleMarkComplete}
                  disabled={completedLessons.has(currentLesson.id)}
                >
                  {completedLessons.has(currentLesson.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex === lessons.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Level Up Animation */}
        <LevelUpAnimation
          level={levelUpLevel}
          show={showLevelUp}
          onComplete={() => setShowLevelUp(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
