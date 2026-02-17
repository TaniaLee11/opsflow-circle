import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";

export default function SocialMedia() {
  const navigate = useNavigate();

  // All platforms start as not connected - no fake data
  const platforms = [
    { name: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
    { name: "Instagram", icon: Instagram, color: "text-pink-600" },
    { name: "Facebook", icon: Facebook, color: "text-blue-500" },
    { name: "X (Twitter)", icon: Twitter, color: "text-sky-500" },
  ];

  const handleConnectPlatform = () => {
    // Navigate to integrations page filtered to social media
    navigate("/integrations?category=social");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Social Media</h1>
        <p className="text-muted-foreground mt-1">
          Manage your social media presence across all platforms
        </p>
      </div>

      {/* Platform Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <platform.icon className={`w-5 h-5 ${platform.color}`} />
                <Badge variant="outline" className="text-xs">Not Connected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">{platform.name}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={handleConnectPlatform}
              >
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      <EmptyState
        icon={Instagram}
        title="Connect your social media accounts"
        description="Link your social media platforms to schedule posts, track engagement, and manage your content calendar all in one place."
        actions={[
          {
            label: "Connect Social Account",
            onClick: handleConnectPlatform,
          },
        ]}
      />
    </div>
  );
}
