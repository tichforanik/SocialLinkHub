import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LinkData, ProfileData } from "@shared/types";
import { getPlatform } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

const Home = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Get username from the url, default to "demo"
  const username = location.substring(1) || "demo";
  
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: [`/api/profile/${username}`],
  });

  useEffect(() => {
    if (profile) {
      document.title = `${profile.displayName || profile.username} | LinkHub`;
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
        <p className="mb-6 text-center">The profile you're looking for doesn't exist or hasn't been created yet.</p>
        <Link href={user ? "/admin" : "/auth"}>
          <Button>{user ? "Go to Dashboard" : "Create Your Own Link Hub"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="flex flex-col items-center space-y-4 py-6">
          {profile.profilePicture && (
            <img
              src={profile.profilePicture}
              alt={`${profile.displayName || profile.username}'s profile`}
              className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
            />
          )}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              {profile.displayName || profile.username}
            </h1>
            {profile.bio && (
              <p className="text-gray-600 max-w-xs text-sm mt-2">{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="space-y-3 py-2">
          {profile.links && profile.links.length > 0 ? (
            profile.links
              .filter(link => link.active)
              .sort((a, b) => a.order - b.order)
              .map((link: LinkData) => {
                const platform = getPlatform(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <i className={`ri-${platform.icon} text-xl ${platform.color} mr-3`}></i>
                    <span className="font-medium">{link.title || platform.name}</span>
                    <i className="ri-arrow-right-up-line ml-auto text-gray-400"></i>
                  </a>
                );
              })
          ) : (
            <div className="text-center py-6 text-gray-500">
              No links have been added yet.
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center text-center text-xs text-gray-500">
          <div>Made with LinkHub</div>
          {user ? (
            <div className="mt-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-xs">
                  Edit My Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign In / Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
