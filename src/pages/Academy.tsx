import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GraduationCap, 
  Plus, 
  Play, 
  Clock, 
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  Video,
  FileText,
  Users,
  Building2,
  Heart,
  Sparkles,
  Trophy,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  category: string;
  userTypes: ("gig_worker" | "entrepreneur" | "nonprofit")[];
  progress?: number;
  recommended?: boolean;
}

const courses: Course[] = [
  {
    id: "1",
    title: "Understanding Your Cash Flow",
    description: "Learn to read and manage your business cash flow like a pro. No accounting background required.",
    thumbnail: "💰",
    duration: "45 min",
    lessons: 6,
    category: "Finance",
    userTypes: ["gig_worker", "entrepreneur"],
    progress: 67,
    recommended: true
  },
  {
    id: "2",
    title: "Tax Set-Asides for Freelancers",
    description: "Never be surprised by tax season again. Learn how much to save and when.",
    thumbnail: "📊",
    duration: "30 min",
    lessons: 4,
    category: "Compliance",
    userTypes: ["gig_worker"],
    progress: 100
  },
  {
    id: "3",
    title: "Building Business Credit",
    description: "Step-by-step guide to establishing credit for your growing business.",
    thumbnail: "🏦",
    duration: "1 hr",
    lessons: 8,
    category: "Finance",
    userTypes: ["entrepreneur"],
    progress: 25
  },
  {
    id: "4",
    title: "Grant Writing Essentials",
    description: "Master the art of writing winning grant proposals for your nonprofit.",
    thumbnail: "✍️",
    duration: "2 hr",
    lessons: 12,
    category: "Nonprofit",
    userTypes: ["nonprofit"],
    recommended: true
  },
  {
    id: "5",
    title: "Restricted vs Unrestricted Funds",
    description: "Understanding fund accounting and maintaining donor compliance.",
    thumbnail: "📋",
    duration: "45 min",
    lessons: 5,
    category: "Nonprofit",
    userTypes: ["nonprofit"]
  },
  {
    id: "6",
    title: "Automating Client Follow-ups",
    description: "Set up automated workflows that nurture leads without being pushy.",
    thumbnail: "🤖",
    duration: "35 min",
    lessons: 4,
    category: "Automation",
    userTypes: ["entrepreneur"]
  }
];

const userTypeConfig = {
  gig_worker: { label: "Gig", icon: Users, color: "bg-info/20 text-info" },
  entrepreneur: { label: "Biz", icon: Building2, color: "bg-primary/20 text-primary" },
  nonprofit: { label: "501c3", icon: Heart, color: "bg-success/20 text-success" }
};

export default function Academy() {
  const { canCreateCourses, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(courses.map(c => c.category))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const inProgressCourses = courses.filter(c => c.progress && c.progress > 0 && c.progress < 100);
  const recommendedCourses = courses.filter(c => c.recommended);
  const completedCourses = courses.filter(c => c.progress === 100);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Academy</h1>
                <p className="text-muted-foreground">Learn to run your operations with confidence</p>
              </div>
            </div>
            
            {canCreateCourses && (
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 glow-primary-sm">
                <Plus className="w-4 h-4" />
                Create Course
              </button>
            )}
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass gradient-border rounded-xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inProgressCourses.length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass gradient-border rounded-xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10 text-success">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass gradient-border rounded-xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10 text-warning">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">4.5 hrs</p>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recommended for You */}
          {recommendedCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group glass gradient-border rounded-xl p-6 hover:glow-primary-sm transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                        {course.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.lessons} lessons
                          </span>
                        </div>
                      </div>
                      <button className="p-3 rounded-xl bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center">
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Continue Learning */}
          {inProgressCourses.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Continue Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {inProgressCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group glass gradient-border rounded-xl p-5 hover:glow-primary-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                        {course.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{course.progress}% complete</span>
                        <span className="text-primary font-medium">Continue</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Search and Filter */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground outline-none transition-all text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    !selectedCategory 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      selectedCategory === category 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* All Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group glass rounded-xl overflow-hidden hover:glow-primary-sm transition-all cursor-pointer border border-border"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                        {course.thumbnail}
                      </div>
                      <div className="flex gap-1">
                        {course.userTypes.map(type => (
                          <span 
                            key={type} 
                            className={cn("text-xs px-2 py-0.5 rounded-full", userTypeConfig[type].color)}
                          >
                            {userTypeConfig[type].label}
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
                          <Clock className="w-3.5 h-3.5" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {course.lessons}
                        </span>
                      </div>
                      
                      {course.progress === 100 ? (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="w-4 h-4" />
                          Complete
                        </span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
