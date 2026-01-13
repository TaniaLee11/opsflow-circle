import { motion } from "framer-motion";
import { Plus, UserPlus, FolderPlus, FileUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function QuickActions() {
  const navigate = useNavigate();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const handleNewTask = () => {
    if (newTask.trim()) {
      toast.success(`Task "${newTask}" created!`);
      setNewTask("");
      setTaskDialogOpen(false);
    }
  };

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteDialogOpen(false);
    }
  };

  const handleUpload = () => {
    toast.info("Opening file picker...");
    setUploadDialogOpen(false);
    // Navigate to Vault for file management
    navigate("/vault");
  };

  const actions = [
    { icon: Plus, label: "New Task", color: "bg-primary", onClick: () => setTaskDialogOpen(true) },
    { icon: UserPlus, label: "Invite Member", color: "bg-info", onClick: () => setInviteDialogOpen(true) },
    { icon: FolderPlus, label: "Create Project", color: "bg-success", onClick: () => navigate("/workflows") },
    { icon: FileUp, label: "Upload File", color: "bg-warning", onClick: () => setUploadDialogOpen(true) },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl glass gradient-border p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border transition-all group"
            >
              <div className={`p-2 rounded-lg ${action.color} text-white`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* New Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create New Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task name..."
              onKeyDown={(e) => e.key === "Enter" && handleNewTask()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleNewTask}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-info" />
              Invite Team Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address..."
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite}>Send Invite</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-warning" />
              Upload File
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Files are managed in the Vault. Click below to go to the Vault and upload your files.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload}>Go to Vault</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
