import { useState } from "react";
import { Calendar as CalendarIcon, Plus, TrendingUp, Users, Heart, MessageCircle, Eye, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function SocialMedia() {
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // Mock data - will be replaced with real data from integrations
  const connectedPlatforms = [
    { name: "LinkedIn", icon: Linkedin, followers: 1234, connected: true, color: "text-blue-600" },
    { name: "Instagram", icon: Instagram, followers: 5678, connected: true, color: "text-pink-600" },
    { name: "Facebook", icon: Facebook, followers: 3456, connected: false, color: "text-blue-500" },
    { name: "X (Twitter)", icon: Twitter, followers: 0, connected: false, color: "text-sky-500" },
  ];

  const scheduledPosts = [
    {
      id: 1,
      platform: "LinkedIn",
      content: "Excited to share our Q1 results! Revenue up 25% YoY...",
      scheduledFor: "2026-02-17 09:00",
      status: "scheduled",
      engagement: { likes: 0, comments: 0, views: 0 },
    },
    {
      id: 2,
      platform: "Instagram",
      content: "Behind the scenes at our team retreat 🎉",
      scheduledFor: "2026-02-17 14:00",
      status: "scheduled",
      engagement: { likes: 0, comments: 0, views: 0 },
    },
  ];

  const recentPosts = [
    {
      id: 3,
      platform: "LinkedIn",
      content: "5 tips for better business operations...",
      publishedAt: "2026-02-15 10:30",
      status: "published",
      engagement: { likes: 47, comments: 12, views: 892 },
    },
    {
      id: 4,
      platform: "Instagram",
      content: "Monday motivation: Start where you are...",
      publishedAt: "2026-02-16 08:00",
      status: "published",
      engagement: { likes: 234, comments: 18, views: 1456 },
    },
  ];

  const hasConnectedPlatforms = connectedPlatforms.some(p => p.connected);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Social Media</h1>
        <p className="text-muted-foreground mt-1">
          Manage your social media presence across all platforms
        </p>
      </div>

      {/* Connected Platforms Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {connectedPlatforms.map((platform) => (
          <Card key={platform.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <platform.icon className={`w-5 h-5 ${platform.color}`} />
                {platform.connected ? (
                  <Badge variant="default" className="text-xs">Connected</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Not Connected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{platform.name}</p>
              {platform.connected ? (
                <p className="text-2xl font-bold mt-1">{platform.followers.toLocaleString()}</p>
              ) : (
                <Button size="sm" variant="outline" className="mt-2 w-full">
                  Connect
                </Button>
              )}
              {platform.connected && (
                <p className="text-xs text-muted-foreground mt-1">followers</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      {!hasConnectedPlatforms ? (
        // Empty State
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Social Media Accounts</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Link your social media platforms to schedule posts, track engagement, and manage your content calendar all in one place.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Connect First Platform
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="scheduled" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Scheduled Posts */}
          <TabsContent value="scheduled" className="space-y-4">
            {scheduledPosts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No Scheduled Posts</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Create and schedule your first post to maintain a consistent social media presence.
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Your First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scheduledPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {post.platform === "LinkedIn" && <Linkedin className="w-5 h-5 text-blue-600" />}
                          {post.platform === "Instagram" && <Instagram className="w-5 h-5 text-pink-600" />}
                          <div>
                            <CardTitle className="text-base">{post.platform}</CardTitle>
                            <CardDescription>Scheduled for {post.scheduledFor}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{post.content}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="ghost">Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Published Posts */}
          <TabsContent value="published" className="space-y-4">
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {post.platform === "LinkedIn" && <Linkedin className="w-5 h-5 text-blue-600" />}
                        {post.platform === "Instagram" && <Instagram className="w-5 h-5 text-pink-600" />}
                        <div>
                          <CardTitle className="text-base">{post.platform}</CardTitle>
                          <CardDescription>Published {post.publishedAt}</CardDescription>
                        </div>
                      </div>
                      <Badge>Published</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.engagement.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.engagement.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.engagement.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Drafts */}
          <TabsContent value="drafts">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold mb-2">No Drafts</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Save posts as drafts to work on them later before scheduling or publishing.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Draft
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Helpful Tips (First-time visit) */}
      {hasConnectedPlatforms && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Posting consistently is key to social media success. Schedule posts for Tuesday and Thursday at 9 AM for best engagement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
