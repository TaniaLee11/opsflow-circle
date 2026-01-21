import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { useAuth } from "@/contexts/AuthContext";
import { useClientView } from "@/contexts/ClientViewContext";
import { useCourses, Course } from "@/hooks/useCourses";
import { CourseBuilder } from "@/components/academy/CourseBuilder";
import { CourseViewer } from "@/components/academy/CourseViewer";
import { 
  GraduationCap, 
  Plus, 
  Play, 
  Clock, 
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  Sparkles,
  Trophy,
  Target,
  Eye,
  Edit,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function AcademyContent() {
  const { canCreateCourses, isOwner } = useAuth();
  const { viewedClient, isViewingClient } = useClientView();
  const { courses, isLoading } = useCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [viewingCourse, setViewingCourse] = useState<Course | undefined>();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && course.status === "published";
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
            
            {canCreateCourses && !isReadOnly && (
              <button 
                onClick={() => handleOpenBuilder()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium flex items-center gap-2 glow-primary-sm w-fit"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Create Course
              </button>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Progress Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass gradient-border rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary"><Target className="w-6 h-6" /></div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{inProgressCourses.length}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass gradient-border rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success/10 text-success"><Trophy className="w-6 h-6" /></div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass gradient-border rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-warning/10 text-warning"><Clock className="w-6 h-6" /></div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{courses.length}</p>
                      <p className="text-sm text-muted-foreground">Total Courses</p>
                    </div>
                  </div>
                </motion.div>
              </div>

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

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course, index) => {
                  const progress = getProgress(course);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="group glass rounded-xl overflow-hidden hover:glow-primary-sm transition-all cursor-pointer border border-border"
                      onClick={() => setViewingCourse(course)}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-primary" />
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

                        {/* Owner edit button */}
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBuilder(course);
                            }}
                            className="mt-3 w-full py-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-medium flex items-center justify-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit Course
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredCourses.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No courses available yet</p>
                  {isOwner && <p className="text-sm">Click "Create Course" to add your first course</p>}
                </div>
              )}
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
