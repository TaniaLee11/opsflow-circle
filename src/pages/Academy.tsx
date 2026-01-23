import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { useAuth } from "@/contexts/AuthContext";
import { useClientView } from "@/contexts/ClientViewContext";
import { useCourses, Course } from "@/hooks/useCourses";
import { useGamification } from "@/hooks/useGamification";
import { CourseBuilder } from "@/components/academy/CourseBuilder";
import { CourseViewer } from "@/components/academy/CourseViewer";
import { GamificationPanel } from "@/components/academy/GamificationPanel";
import { CertificateCard } from "@/components/academy/CertificateCard";
import { AICourseGenerator } from "@/components/academy/AICourseGenerator";
import { AcademyAnalytics } from "@/components/academy/AcademyAnalytics";
import {
  GraduationCap, 
  Plus, 
  Clock, 
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  Trophy,
  Target,
  Eye,
  Edit,
  Loader2,
  Award,
  Flame,
  Zap,
  Wand2,
  Trash2,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

function AcademyContent() {
  const { canCreateCourses, isOwner } = useAuth();
  const { viewedClient, isViewingClient } = useClientView();
  const { courses, isLoading, deleteCourse, totalEnrollmentsByTier } = useCourses();
  const { stats, certificates, levelProgress, earnedBadges } = useGamification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [activeTab, setActiveTab] = useState("courses");
  const [viewingCourse, setViewingCourse] = useState<Course | undefined>();
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);

  // Owners can see all courses (including drafts), others only see published
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const canView = isOwner || course.status === "published";
    return matchesSearch && canView;
  });

  // Sort courses by enrollment count (most used first)
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aEnrollments = a.enrollment_count || 0;
    const bEnrollments = b.enrollment_count || 0;
    return bEnrollments - aEnrollments;
  });

  const getProgress = (course: Course) => {
    const completed = course.enrollment?.progress?.completed_lessons?.length || 0;
    const total = course.lessons?.length || 1;
    return Math.round((completed / total) * 100);
  };

  const inProgressCourses = courses.filter(c => {
    const progress = getProgress(c);
    return progress > 0 && progress < 100;
  });

  const completedCourses = courses.filter(c => getProgress(c) === 100);

  const isReadOnly = isViewingClient;

  const handleOpenBuilder = (course?: Course) => {
    setEditingCourse(course);
    setBuilderOpen(true);
  };

  const handleCloseBuilder = () => {
    setBuilderOpen(false);
    setEditingCourse(undefined);
  };

  return (
    <div className={cn("min-h-screen bg-background", isReadOnly && "pt-10")}>
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {isReadOnly ? `${viewedClient?.displayName || "Client"}'s Academy` : "Academy"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isReadOnly ? `Viewing progress for ${viewedClient?.email}` : "Learn to run your operations with confidence"}
                  </p>
                </div>
                {isReadOnly && (
                  <Badge className="bg-warning/20 text-warning border-0 gap-1 text-xs">
                    <Eye className="w-3 h-3" />
                    Read Only
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Compact gamification stats in header - only for sub-users, not owners */}
              {stats && !isReadOnly && !isOwner && (
                <GamificationPanel compact />
              )}
              
              {canCreateCourses && !isReadOnly && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAiGeneratorOpen(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-opacity text-xs sm:text-sm font-medium flex items-center gap-2 glow-primary-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    AI Generate
                  </button>
                  <button 
                    onClick={() => handleOpenBuilder()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-xs sm:text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Manual
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Tabs for different sections - owners only see Courses, sub-users see gamification */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="courses" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    {isOwner ? "Manage Courses" : "Courses"}
                  </TabsTrigger>
                  {isOwner && (
                    <TabsTrigger value="analytics" className="gap-2">
                      <Target className="w-4 h-4" />
                      Analytics
                    </TabsTrigger>
                  )}
                  {!isOwner && (
                    <>
                      <TabsTrigger value="progress" className="gap-2">
                        <Trophy className="w-4 h-4" />
                        My Progress
                      </TabsTrigger>
                      <TabsTrigger value="certificates" className="gap-2">
                        <Award className="w-4 h-4" />
                        Certificates
                        {certificates.length > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                            {certificates.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-6">
                  {/* Progress Overview - only for sub-users, not owners */}
                  {!isOwner && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass gradient-border rounded-xl p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary"><Target className="w-5 h-5" /></div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{inProgressCourses.length}</p>
                            <p className="text-xs text-muted-foreground">In Progress</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass gradient-border rounded-xl p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-success/10 text-success"><Trophy className="w-5 h-5" /></div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{completedCourses.length}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass gradient-border rounded-xl p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><Flame className="w-5 h-5" /></div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{stats?.current_streak || 0}</p>
                            <p className="text-xs text-muted-foreground">Day Streak</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass gradient-border rounded-xl p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-warning/10 text-warning"><Zap className="w-5 h-5" /></div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{stats?.total_xp?.toLocaleString() || 0}</p>
                            <p className="text-xs text-muted-foreground">Total XP</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Owner Course Stats */}
                  {isOwner && (
                    <div className="space-y-4">
                      {/* Course counts row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass gradient-border rounded-xl p-5">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary"><BookOpen className="w-5 h-5" /></div>
                            <div>
                              <p className="text-xl font-bold text-foreground">{courses.length}</p>
                              <p className="text-xs text-muted-foreground">Total Courses</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass gradient-border rounded-xl p-5">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-success/10 text-success"><CheckCircle2 className="w-5 h-5" /></div>
                            <div>
                              <p className="text-xl font-bold text-foreground">{courses.filter(c => c.status === 'published').length}</p>
                              <p className="text-xs text-muted-foreground">Published</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass gradient-border rounded-xl p-5">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-warning/10 text-warning"><Edit className="w-5 h-5" /></div>
                            <div>
                              <p className="text-xl font-bold text-foreground">{courses.filter(c => c.status === 'draft').length}</p>
                              <p className="text-xs text-muted-foreground">Drafts</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Enrollments by tier row */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.3 }}
                        className="glass gradient-border rounded-xl p-5"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-info/10 text-info"><Users className="w-4 h-4" /></div>
                          <h3 className="font-semibold text-foreground">Enrollments by Tier</h3>
                          <Badge variant="secondary" className="ml-auto">
                            {Object.values(totalEnrollmentsByTier || {}).reduce((a, b) => a + b, 0)} total
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                          {[
                            { key: 'free', label: 'AI Free', color: 'bg-muted text-muted-foreground' },
                            { key: 'ai_assistant', label: 'AI Assistant', color: 'bg-info/20 text-info' },
                            { key: 'ai_operations', label: 'AI Operations', color: 'bg-primary/20 text-primary' },
                            { key: 'ai_tax', label: 'AI Tax', color: 'bg-warning/20 text-warning' },
                            { key: 'cohort', label: 'Cohort', color: 'bg-success/20 text-success' },
                            { key: 'owner', label: 'Owner', color: 'bg-destructive/20 text-destructive' },
                          ].map(tier => (
                            <div key={tier.key} className={cn("rounded-lg p-3 text-center", tier.color)}>
                              <p className="text-lg font-bold">{totalEnrollmentsByTier?.[tier.key] || 0}</p>
                              <p className="text-xs opacity-80">{tier.label}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Owner View - Sorted by Most Used */}
                  {isOwner ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedCourses.map((course, index) => {
                        const progress = getProgress(course);
                        const hasCertificate = certificates.some(c => c.course_id === course.id);
                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * Math.min(index, 10) }}
                            className="group glass rounded-xl overflow-hidden hover:glow-primary-sm transition-all cursor-pointer border border-border"
                            onClick={() => setViewingCourse(course)}
                          >
                            {progress > 0 && (
                              <div className="h-1 bg-muted">
                                <div 
                                  className={cn(
                                    "h-full transition-all",
                                    progress === 100 ? "bg-success" : "bg-primary"
                                  )}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                            
                            <div className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-primary" />
                                  </div>
                                  {hasCertificate && (
                                    <Award className="absolute -top-1 -right-1 w-5 h-5 text-warning fill-warning/20" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {(course.enrollment_count || 0) > 0 && (
                                    <Badge variant="secondary" className="text-xs gap-1">
                                      <Target className="w-3 h-3" />
                                      {course.enrollment_count}
                                    </Badge>
                                  )}
                                  {course.status === 'draft' && (
                                    <Badge variant="outline" className="text-xs">Draft</Badge>
                                  )}
                                </div>
                              </div>
                              
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                                {course.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {course.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {course.lessons?.length || 0} lessons
                                  </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBuilder(course);
                                  }}
                                  className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-medium flex items-center justify-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
                                      deleteCourse(course.id);
                                    }
                                  }}
                                  className="py-2 px-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs font-medium flex items-center justify-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Sub-user View - Simple Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCourses.map((course, index) => {
                        const progress = getProgress(course);
                        const hasCertificate = certificates.some(c => c.course_id === course.id);
                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="group glass rounded-xl overflow-hidden hover:glow-primary-sm transition-all cursor-pointer border border-border"
                            onClick={() => setViewingCourse(course)}
                          >
                            {progress > 0 && (
                              <div className="h-1 bg-muted">
                                <div 
                                  className={cn(
                                    "h-full transition-all",
                                    progress === 100 ? "bg-success" : "bg-primary"
                                  )}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                            
                            <div className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-primary" />
                                  </div>
                                  {hasCertificate && (
                                    <Award className="absolute -top-1 -right-1 w-5 h-5 text-warning fill-warning/20" />
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {course.tier_access?.map(tier => (
                                    <span key={tier} className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                      {tier}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                                {course.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {course.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {course.lessons?.length || 0} lessons
                                  </span>
                                </div>
                                
                                {progress === 100 ? (
                                  <span className="flex items-center gap-1 text-xs text-success">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Complete
                                  </span>
                                ) : progress > 0 ? (
                                  <span className="text-xs text-primary">{progress}%</span>
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {filteredCourses.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No courses available yet</p>
                      {isOwner && <p className="text-sm">Click "Create Course" to add your first course</p>}
                    </div>
                  )}
                </TabsContent>

                {/* Analytics Tab - only for owners */}
                {isOwner && (
                  <TabsContent value="analytics" className="space-y-6">
                    <AcademyAnalytics />
                  </TabsContent>
                )}

                {/* Progress Tab - only for sub-users */}
                {!isOwner && (
                  <TabsContent value="progress" className="space-y-6">
                    <GamificationPanel />
                  </TabsContent>
                )}

                {/* Certificates Tab - only for sub-users */}
                {!isOwner && (
                  <TabsContent value="certificates" className="space-y-6">
                    {certificates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => {
                          const course = courses.find(c => c.id === cert.course_id);
                          return (
                            <CertificateCard
                              key={cert.id}
                              courseName={course?.title || "Course"}
                              certificateNumber={cert.certificate_number}
                              issuedAt={cert.issued_at}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No certificates earned yet</p>
                        <p className="text-sm">Complete courses to earn certificates</p>
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </div>
      </main>

      {/* Course Builder Modal */}
      <CourseBuilder
        course={editingCourse}
        isOpen={builderOpen}
        onClose={handleCloseBuilder}
      />

      {/* AI Course Generator Modal */}
      <AICourseGenerator
        isOpen={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
      />

      {/* Course Viewer Modal */}
      {viewingCourse && (
        <CourseViewer
          course={viewingCourse}
          isOpen={!!viewingCourse}
          onClose={() => setViewingCourse(undefined)}
        />
      )}
    </div>
  );
}

export default function Academy() {
  return (
    <AccessGate>
      <AcademyContent />
    </AccessGate>
  );
}
