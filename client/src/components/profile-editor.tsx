import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ProfileData, LinkData } from "@shared/types";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Trash2, Pencil } from "lucide-react";
import LinkItem from "@/components/link-item";
import AddLinkDialog from "@/components/add-link-dialog";

interface ProfileEditorProps {
  profile: ProfileData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileEditor = ({ profile, activeTab, setActiveTab }: ProfileEditorProps) => {
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profilePicture || null);
  const { toast } = useToast();

  const maxBioLength = 150;
  const remainingChars = maxBioLength - bio.length;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProfileImageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/profile/image");
      if (!response.ok) throw new Error("Failed to delete profile image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setPreviewUrl(null);
      toast({
        title: "Image removed",
        description: "Your profile image has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (1MB max)
      if (selectedFile.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 1MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl && profile.profilePicture) {
      deleteProfileImageMutation.mutate();
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSaveProfile = () => {
    const formData = new FormData();
    formData.append("displayName", displayName);
    formData.append("username", username);
    formData.append("bio", bio);
    
    if (file) {
      formData.append("profileImage", file);
    }
    
    updateProfileMutation.mutate(formData);
  };

  return (
    <>
      <TabsContent value="profile" className="p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          
          <div className="mb-6">
            <Label className="block mb-4">
              <span className="text-sm font-medium text-gray-700 block mb-1">Profile Picture</span>
              <div className="mt-1 flex items-center space-x-6">
                <div className="relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="ri-user-line text-3xl text-gray-400"></i>
                    </div>
                  )}
                  <button 
                    className="absolute -bottom-1 -right-1 rounded-full bg-gray-100 p-1 border border-gray-300 hover:bg-gray-200"
                    onClick={() => document.getElementById("profile-upload")?.click()}
                    type="button"
                  >
                    <Pencil className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
                
                <div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById("profile-upload")?.click()}
                      type="button"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload new image
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleRemoveImage}
                      type="button"
                      disabled={!previewUrl}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                    <input
                      type="file"
                      id="profile-upload"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG or GIF. 1MB max.
                  </p>
                </div>
              </div>
            </Label>
          </div>

          <div className="mb-6">
            <Label className="block mb-4">
              <span className="text-sm font-medium text-gray-700 block mb-1">Username</span>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  linkhub.app/
                </span>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-l-none"
                  placeholder="yourusername"
                />
              </div>
            </Label>
          </div>

          <div className="mb-6">
            <Label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">Display Name</span>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </Label>
          </div>

          <div className="mb-6">
            <Label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">Bio</span>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.substring(0, maxBioLength))}
                placeholder="Tell visitors a little bit about yourself..."
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                <span className={`${remainingChars < 10 ? 'text-red-500' : 'text-gray-700'} font-medium`}>
                  {remainingChars}
                </span> characters remaining
              </p>
            </Label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="links" className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Social Links</h2>
          
          <div className="space-y-4">
            {profile.links && profile.links.length > 0 ? (
              profile.links
                .sort((a, b) => a.order - b.order)
                .map((link: LinkData) => (
                  <LinkItem 
                    key={link.id} 
                    link={link} 
                  />
                ))
            ) : (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-500 mb-4">No links added yet</div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddLinkOpen(true)}
                >
                  <i className="ri-add-line mr-2"></i>
                  Add your first link
                </Button>
              </div>
            )}

            {profile.links && profile.links.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => setIsAddLinkOpen(true)}
              >
                <i className="ri-add-line mr-2"></i>
                Add new link
              </Button>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button onClick={() => setActiveTab("profile")}>
            Save and Continue
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="appearance" className="p-6">
        <div className="text-center p-12">
          <h2 className="text-xl font-semibold mb-2">Appearance Settings</h2>
          <p className="text-gray-500 mb-6">Customize your page appearance (coming soon)</p>
          <Button onClick={() => setActiveTab("profile")}>
            Back to Profile
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="p-6">
        <div className="text-center p-12">
          <h2 className="text-xl font-semibold mb-2">Analytics Dashboard</h2>
          <p className="text-gray-500 mb-6">Track how your links are performing (coming soon)</p>
          <Button onClick={() => setActiveTab("profile")}>
            Back to Profile
          </Button>
        </div>
      </TabsContent>

      <AddLinkDialog 
        isOpen={isAddLinkOpen} 
        onClose={() => setIsAddLinkOpen(false)} 
      />
    </>
  );
};

export default ProfileEditor;
