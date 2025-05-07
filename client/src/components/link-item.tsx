import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LinkData } from "@shared/types";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getPlatform } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface LinkItemProps {
  link: LinkData;
}

const LinkItem = ({ link }: LinkItemProps) => {
  const [url, setUrl] = useState(link.url);
  const [isActive, setIsActive] = useState(link.active);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const platform = getPlatform(link.platform);

  const updateLinkMutation = useMutation({
    mutationFn: async (data: { url: string; active: boolean }) => {
      const response = await apiRequest("PATCH", `/api/links/${link.id}`, data);
      if (!response.ok) throw new Error("Failed to update link");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Link updated",
        description: "Your link has been updated successfully.",
      });
    },
    onError: (error) => {
      // Reset state on error
      setUrl(link.url);
      setIsActive(link.active);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/links/${link.id}`);
      if (!response.ok) throw new Error("Failed to delete link");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Link deleted",
        description: "Your link has been removed successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleToggleActive = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    updateLinkMutation.mutate({ url, active: newActiveState });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleUrlBlur = () => {
    if (url !== link.url) {
      updateLinkMutation.mutate({ url, active: isActive });
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <i className={`ri-${platform.icon} text-xl ${platform.color} mr-2`}></i>
            <h3 className="font-medium">{link.title || platform.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id={`toggle-${link.id}`} 
              checked={isActive}
              onCheckedChange={handleToggleActive}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-500 h-8 w-8"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <i className="ri-delete-bin-line"></i>
            </Button>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-full">
            <Input 
              value={url}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              placeholder={platform.urlPrefix ? `${platform.urlPrefix}yourusername` : "https://"}
              disabled={updateLinkMutation.isPending}
            />
          </div>
        </div>
        {updateLinkMutation.isPending && (
          <div className="mt-2 flex items-center justify-end text-xs text-gray-500">
            <Loader2 className="animate-spin mr-1 h-3 w-3" />
            Updating...
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your {platform.name} link.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteLinkMutation.mutate();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteLinkMutation.isPending}
            >
              {deleteLinkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LinkItem;
