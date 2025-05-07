import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProfileData } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import PhonePreview from "@/components/phone-preview";
import ProfileEditor from "@/components/profile-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    document.title = "Dashboard | LinkHub";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="ri-links-line text-primary text-3xl"></i>
            <h1 className="text-2xl font-bold text-gray-900">LinkHub</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/${profile.username}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View My Page</span>
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="col-span-1 lg:col-span-4 xl:col-span-5">
          <div className="mx-auto max-w-sm">
            <PhonePreview profile={profile} />
          </div>
        </div>

        <div className="col-span-1 lg:col-span-8 xl:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Tabs 
              defaultValue="profile" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full border-b border-gray-200 rounded-none bg-white">
                <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 data-[state=active]:border-b-2 data-[state=active]:border-primary-500">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="links" className="flex-1">
                  Links
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex-1">
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1">
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <ProfileEditor profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
