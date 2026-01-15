import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  due_date?: string;
  created_at: string;
}

export interface CalendarEventCreate {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export const TASK_KEYWORDS = [
  'task', 'todo', 'to-do', 'to do', 'remind', 'reminder',
  'add task', 'create task', 'new task', 'schedule task'
];

export const PROJECT_KEYWORDS = [
  'project', 'create project', 'new project', 'add project'
];

export const CALENDAR_ACTION_KEYWORDS = [
  'add to calendar', 'schedule', 'create event', 'add event', 
  'put on calendar', 'book', 'set up meeting', 'create meeting'
];

export function useTaskIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch user's tasks
  const fetchTasks = useCallback(async (): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const taskList = (data || []) as Task[];
      setTasks(taskList);
      return taskList;
    } catch (err) {
      console.error('Fetch tasks error:', err);
      return [];
    }
  }, []);

  // Fetch user's projects
  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const projectList = (data || []) as Project[];
      setProjects(projectList);
      return projectList;
    } catch (err) {
      console.error('Fetch projects error:', err);
      return [];
    }
  }, []);

  // Create a new task
  const createTask = useCallback(async (taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    project_id?: string;
  }): Promise<{ success: boolean; task?: Task; message?: string; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vopsy-actions', {
        body: {
          action: 'create_task',
          data: taskData,
        },
      });

      if (error) throw error;
      
      if (data.success && data.task) {
        setTasks(prev => [data.task, ...prev]);
        toast.success(data.message || 'Task created!');
      }
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a task
  const updateTask = useCallback(async (
    taskId: string, 
    updates: Partial<Task>
  ): Promise<{ success: boolean; task?: Task; message?: string; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vopsy-actions', {
        body: {
          action: 'update_task',
          data: { task_id: taskId, ...updates },
        },
      });

      if (error) throw error;
      
      if (data.success && data.task) {
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
        toast.success(data.message || 'Task updated!');
      }
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update task';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new project
  const createProject = useCallback(async (projectData: {
    name: string;
    description?: string;
    due_date?: string;
  }): Promise<{ success: boolean; project?: Project; message?: string; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vopsy-actions', {
        body: {
          action: 'create_project',
          data: projectData,
        },
      });

      if (error) throw error;
      
      if (data.success && data.project) {
        setProjects(prev => [data.project, ...prev]);
        toast.success(data.message || 'Project created!');
      }
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a project
  const updateProject = useCallback(async (
    projectId: string, 
    updates: Partial<Project>
  ): Promise<{ success: boolean; project?: Project; message?: string; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vopsy-actions', {
        body: {
          action: 'update_project',
          data: { project_id: projectId, ...updates },
        },
      });

      if (error) throw error;
      
      if (data.success && data.project) {
        setProjects(prev => prev.map(p => p.id === projectId ? data.project : p));
        toast.success(data.message || 'Project updated!');
      }
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update project';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a calendar event
  const createCalendarEvent = useCallback(async (
    eventData: CalendarEventCreate
  ): Promise<{ success: boolean; eventId?: string; message?: string; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vopsy-actions', {
        body: {
          action: 'create_calendar_event',
          data: eventData,
        },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success(data.message || 'Calendar event created!');
      }
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create calendar event';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format tasks for chat display
  const formatTasksForChat = useCallback((taskList: Task[]): string => {
    const lines: string[] = [];
    
    lines.push(`📋 **Your Tasks**`);
    lines.push('');

    if (taskList.length === 0) {
      lines.push(`✨ No tasks yet! Would you like me to create one?`);
      return lines.join('\n');
    }

    const pending = taskList.filter(t => t.status === 'pending' || t.status === 'in-progress');
    const completed = taskList.filter(t => t.status === 'completed');

    if (pending.length > 0) {
      lines.push('**Active Tasks:**');
      pending.forEach((task, i) => {
        const priority = task.priority === 'urgent' ? '🔴' : task.priority === 'high' ? '🟠' : task.priority === 'medium' ? '🟡' : '🟢';
        const status = task.status === 'in-progress' ? '⏳' : '⬜';
        const due = task.due_date ? ` (due ${new Date(task.due_date).toLocaleDateString()})` : '';
        lines.push(`${status} ${priority} ${task.title}${due}`);
      });
      lines.push('');
    }

    if (completed.length > 0) {
      lines.push(`✅ **Completed:** ${completed.length} tasks`);
    }

    lines.push('');
    lines.push('💬 Say "add task [title]" to create a new task');

    return lines.join('\n');
  }, []);

  // Format projects for chat display
  const formatProjectsForChat = useCallback((projectList: Project[]): string => {
    const lines: string[] = [];
    
    lines.push(`📁 **Your Projects**`);
    lines.push('');

    if (projectList.length === 0) {
      lines.push(`✨ No projects yet! Would you like me to create one?`);
      return lines.join('\n');
    }

    projectList.forEach((project) => {
      const status = project.status === 'active' ? '🟢' : project.status === 'completed' ? '✅' : project.status === 'on-hold' ? '⏸️' : '❌';
      const due = project.due_date ? ` (due ${new Date(project.due_date).toLocaleDateString()})` : '';
      lines.push(`${status} **${project.name}**${due}`);
      if (project.description) {
        lines.push(`   ${project.description}`);
      }
    });

    lines.push('');
    lines.push('💬 Say "create project [name]" to start a new project');

    return lines.join('\n');
  }, []);

  return {
    isLoading,
    tasks,
    projects,
    fetchTasks,
    fetchProjects,
    createTask,
    updateTask,
    createProject,
    updateProject,
    createCalendarEvent,
    formatTasksForChat,
    formatProjectsForChat,
  };
}
