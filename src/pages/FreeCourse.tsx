import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  Play,
  Video,
} from "lucide-react";

import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePublicCourse } from "@/hooks/usePublicCourses";

// Import local course videos
import ideationValidationVideo from "@/assets/videos/lesson-ideation-validation.mp4";
import moneyTaxesVideo from "@/assets/videos/lesson-money-taxes.mp4";
import brandBuildingVideo from "@/assets/videos/lesson-brand-building.mp4";

// Map lesson IDs to local video assets
const localVideoMap: Record<string, string> = {
  'cdb9cd25-f813-4c84-a759-ca17deeb0390': ideationValidationVideo,
  '59c83a77-12ac-4035-8f2c-36ea14a73409': moneyTaxesVideo,
  'd9db66a2-0bc0-416c-8604-a9c075a3cf22': brandBuildingVideo,
};

export default function FreeCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const { course, isLoading, error } = usePublicCourse(courseId || "");

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const lessons = course?.lessons || [];
  const currentLesson = lessons[currentLessonIndex];

  const progressPercent = useMemo(() => {
    if (!lessons.length) return 0;
    return Math.round(((currentLessonIndex + 1) / lessons.length) * 100);
  }, [currentLessonIndex, lessons.length]);

  const quizzesForLesson = useMemo(() => {
    if (!course || !currentLesson) return [];
    return (course.quizzes || [])
      .filter((q) => q.lesson_id === currentLesson.id)
      .sort((a, b) => a.order_index - b.order_index);
  }, [course, currentLesson]);

  const allQuizzesCorrect = useMemo(() => {
    if (!quizzesForLesson.length) return true;
    return quizzesForLesson.every((q) => quizResults[q.id]);
  }, [quizzesForLesson, quizResults]);

  const getVideoInfo = (lessonId: string, url: string | null): { type: 'embed' | 'direct' | null; src: string | null } => {
    // First check for locally mapped videos
    const localVideo = localVideoMap[lessonId];
    if (localVideo) {
      return { type: 'direct', src: localVideo };
    }
    
    if (!url) return { type: null, src: null };
    
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
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

  const handlePrev = () => {
    if (currentLessonIndex === 0) return;
    setCurrentLessonIndex((i) => i - 1);
    setQuizAnswers({});
    setQuizResults({});
    setShowQuizResults(false);
  };

  const handleNext = () => {
    if (currentLessonIndex >= lessons.length - 1) return;
    setCurrentLessonIndex((i) => i + 1);
    setQuizAnswers({});
    setQuizResults({});
    setShowQuizResults(false);
  };

  const handleQuizSubmit = () => {
    const results: Record<string, boolean> = {};
    quizzesForLesson.forEach((quiz) => {
      results[quiz.id] = quizAnswers[quiz.id] === quiz.correct_answer;
    });
    setQuizResults(results);
    setShowQuizResults(true);
  };

  return (
    <>
      <Helmet>
        <title>
          {course?.title
            ? `${course.title} | Free Course | Virtual OPS Hub`
            : "Free Course | Virtual OPS Hub"}
        </title>
        <meta
          name="description"
          content={
            course?.description ||
            "Start a free business course. Learn the fundamentals with step-by-step lessons."
          }
        />
        {courseId && (
          <link
            rel="canonical"
            href={`https://virtualops.lovable.app/free-courses/${courseId}`}
          />
        )}
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />
        
        {/* Page Theme Toggle */}
        <div className="fixed top-20 right-4 z-40">
          <PageThemeToggle className="px-0 py-0" />
        </div>

        <main className="pt-20 sm:pt-24 px-4 sm:px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => navigate("/free-courses")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {course && (
                <div className="flex items-center gap-3">
                  <Badge className="bg-success text-success-foreground">FREE</Badge>
                  <div className="hidden sm:block w-40">
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading course...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-semibold text-foreground mb-1">Couldn’t load this course.</p>
                <p className="text-sm text-muted-foreground">
                  Please go back and try again.
                </p>
              </div>
            ) : !course ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-semibold text-foreground mb-1">Course not found.</p>
                <p className="text-sm text-muted-foreground">
                  This course may be unpublished or not available as a free course.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                {/* Sidebar */}
                <aside className="lg:sticky lg:top-28 h-fit rounded-xl border border-border bg-card/50 overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <h1 className="font-semibold text-foreground leading-tight">
                        {course.title}
                      </h1>
                    </div>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Lessons
                    </p>
                    <div className="space-y-1">
                      {lessons.map((lesson, index) => {
                        const isCurrent = index === currentLessonIndex;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setCurrentLessonIndex(index);
                              setQuizAnswers({});
                              setQuizResults({});
                              setShowQuizResults(false);
                            }}
                            className={cn(
                              "w-full flex items-start gap-2 p-2 rounded-lg text-left text-sm transition-colors",
                              isCurrent
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-foreground"
                            )}
                          >
                            {isCurrent ? (
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                            ) : (
                              <Circle className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{lesson.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                {lesson.lesson_type === "video" ? (
                                  <Video className="w-3 h-3" />
                                ) : (
                                  <FileText className="w-3 h-3" />
                                )}
                                {lesson.duration_minutes ? (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration_minutes} min
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Want progress tracking, certificates, and your AI assistant? Join the full platform.
                      </p>
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => navigate("/hub")}
                      >
                        Explore Full Platform
                        <Play className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </aside>

                {/* Main */}
                <section className="rounded-xl border border-border bg-card/50 overflow-hidden">
                  <header className="p-5 border-b border-border">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          Lesson {currentLessonIndex + 1} of {lessons.length}
                        </Badge>
                        <h2 className="text-2xl font-bold text-foreground">
                          {currentLesson?.title || ""}
                        </h2>
                      </div>
                      <div className="hidden sm:block w-40">
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </div>
                  </header>

                  {!currentLesson ? (
                    <div className="p-6 text-muted-foreground">No lessons available.</div>
                  ) : (
                    <div className="p-6 space-y-6">
                      {currentLesson.lesson_type === "video" && (() => {
                        const videoInfo = getVideoInfo(currentLesson.id, currentLesson.video_url);
                        if (!videoInfo.src) return null;
                        
                        return (
                          <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                            {videoInfo.type === 'embed' ? (
                              <iframe
                                src={videoInfo.src}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={currentLesson.title}
                              />
                            ) : (
                              <video
                                src={videoInfo.src}
                                className="w-full h-full object-cover"
                                controls
                                playsInline
                                title={currentLesson.title}
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        );
                      })()}

                      {currentLesson.content && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap">{currentLesson.content}</div>
                        </div>
                      )}

                      {quizzesForLesson.length > 0 && (
                        <div className="border border-border rounded-xl p-6 space-y-6">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Knowledge Check</h3>
                          </div>

                          {quizzesForLesson.map((quiz, qIndex) => (
                            <div key={quiz.id} className="space-y-3">
                              <p className="font-medium text-foreground">
                                {qIndex + 1}. {quiz.question}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(quiz.options || []).map((option, oIndex) => {
                                  const isSelected = quizAnswers[quiz.id] === option;
                                  const isCorrect =
                                    showQuizResults && option === quiz.correct_answer;
                                  const isWrong =
                                    showQuizResults && isSelected && !isCorrect;

                                  return (
                                    <button
                                      key={oIndex}
                                      onClick={() =>
                                        !showQuizResults &&
                                        setQuizAnswers((prev) => ({
                                          ...prev,
                                          [quiz.id]: option,
                                        }))
                                      }
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
                                  {quiz.explanation}
                                </p>
                              )}
                            </div>
                          ))}

                          {!showQuizResults ? (
                            <Button
                              onClick={handleQuizSubmit}
                              disabled={
                                Object.keys(quizAnswers).length < quizzesForLesson.length
                              }
                            >
                              Check Answers
                            </Button>
                          ) : (
                            <div
                              className={cn(
                                "p-4 rounded-lg",
                                allQuizzesCorrect
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              )}
                            >
                              {allQuizzesCorrect
                                ? "Great job! All answers correct."
                                : "Some answers need revision. Try again."}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          onClick={handlePrev}
                          disabled={currentLessonIndex === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleNext}
                          disabled={currentLessonIndex === lessons.length - 1}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
