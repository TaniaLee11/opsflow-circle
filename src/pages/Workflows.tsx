import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { VOPSyAgent } from "@/components/vopsy/VOPSyAgent";
import { motion } from "framer-motion";
import { 
  FolderPlus, 
  Calendar, 
  Plus, 
  MoreHorizontal,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "on-hold";
  dueDate: string;
  members: number;
  tasks: { total: number; completed: number };
  createdAt: string;
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Q4 Tax Planning",
    description: "Prepare quarterly tax documents and estimates",
    status: "active",
    dueDate: "2026-01-20",
    members: 3,
    tasks: { total: 12, completed: 8 },
    createdAt: "2025-12-15"
  },
  {
    id: "2",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    status: "active",
    dueDate: "2026-02-15",
    members: 5,
    tasks: { total: 24, completed: 10 },
    createdAt: "2025-11-01"
  },
  {
    id: "3",
    name: "Client Onboarding System",
    description: "Automate new client onboarding process",
    status: "on-hold",
    dueDate: "2026-03-01",
    members: 2,
    tasks: { total: 8, completed: 2 },
    createdAt: "2025-12-01"
  }
];

const calendarEvents = [
  { id: "1", title: "Tax Filing Deadline", date: "2026-01-15", type: "deadline" },
  { id: "2", title: "Team Standup", date: "2026-01-13", type: "meeting" },
  { id: "3", title: "Client Review", date: "2026-01-14", type: "meeting" },
  { id: "4", title: "Quarterly Report Due", date: "2026-01-20", type: "deadline" },
  { id: "5", title: "Budget Planning", date: "2026-01-16", type: "task" },
];

function WorkflowsContent() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: "active",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      members: 1,
      tasks: { total: 0, completed: 0 },
      createdAt: new Date().toISOString().split("T")[0]
    };
    
    setProjects([project, ...projects]);
    setNewProject({ name: "", description: "" });
    setNewProjectOpen(false);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active": return "bg-success/20 text-success";
      case "completed": return "bg-primary/20 text-primary";
      case "on-hold": return "bg-warning/20 text-warning";
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDay(day);
      const isToday = day === 13 && currentMonth.getMonth() === 0 && currentMonth.getFullYear() === 2026;
      
      days.push(
        <div
          key={day}
          className={cn(
            "h-24 border border-border/50 p-2 rounded-lg hover:bg-secondary/30 transition-colors",
            isToday && "bg-primary/10 border-primary/50"
          )}
        >
          <span className={cn(
            "text-sm font-medium",
            isToday ? "text-primary" : "text-foreground"
          )}>
            {day}
          </span>
          <div className="mt-1 space-y-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded truncate",
                  event.type === "deadline" && "bg-destructive/20 text-destructive",
                  event.type === "meeting" && "bg-info/20 text-info",
                  event.type === "task" && "bg-success/20 text-success"
                )}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <span className="text-xs text-muted-foreground">+{events.length - 2} more</span>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-foreground"
              >
                Workflows
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs sm:text-sm text-muted-foreground"
              >
                Manage your projects and schedule
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 glow-primary-sm text-sm">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Project</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FolderPlus className="w-5 h-5 text-primary" />
                      Create New Project
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Project Name</label>
                      <Input
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="Enter project name..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Description</label>
                      <Textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Describe your project..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setNewProjectOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProject}>
                        Create Project
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="projects" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="projects" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4 sm:space-y-6">
              {/* Projects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass gradient-border rounded-xl p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {project.description}
                        </p>
                      </div>
                      <button className="p-1 rounded-lg hover:bg-secondary transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    <Badge className={cn("mb-4", getStatusColor(project.status))}>
                      {project.status === "active" && <Circle className="w-2 h-2 mr-1 fill-current" />}
                      {project.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {project.status.replace("-", " ")}
                    </Badge>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-medium">
                          {project.tasks.completed}/{project.tasks.total} tasks
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ 
                            width: `${project.tasks.total > 0 ? (project.tasks.completed / project.tasks.total) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{project.members}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add Project Card */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: projects.length * 0.1 }}
                  onClick={() => setNewProjectOpen(true)}
                  className="min-h-[200px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary"
                >
                  <div className="p-3 rounded-xl bg-secondary">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-medium">Create New Project</span>
                </motion.button>
              </div>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass gradient-border rounded-xl p-6"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">{formatMonth(currentMonth)}</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date(2026, 0, 1))}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive/50" />
                    <span className="text-xs text-muted-foreground">Deadline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-info/50" />
                    <span className="text-xs text-muted-foreground">Meeting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success/50" />
                    <span className="text-xs text-muted-foreground">Task</span>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <VOPSyAgent />
    </div>
  );
}

export default function Workflows() {
  return (
    <AccessGate>
      <WorkflowsContent />
    </AccessGate>
  );
}
