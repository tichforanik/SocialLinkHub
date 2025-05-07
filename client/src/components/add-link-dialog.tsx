import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLATFORMS, getPlatform } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLinkDialog = ({ isOpen, onClose }: AddLinkDialogProps) => {
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const { toast } = useToast();

  const addLinkMutation = useMutation({
    mutationFn: async (data: { platform: string; url: string; title?: string }) => {
      const response = await apiRequest("POST", "/api/links", data);
      if (!response.ok) throw new Error("Failed to add link");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Link added",
        description: "Your new link has been added successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!platform) {
      toast({
        title: "Platform required",
        description: "Please select a platform for your link.",
        variant: "destructive",
      });
      return;
    }

    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a URL for your link.",
        variant: "destructive",
      });
      return;
    }

    // Add http:// if missing
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("mailto:")) {
      fullUrl = "https://" + url;
    }

    addLinkMutation.mutate({
      platform,
      url: fullUrl,
      title: title || undefined,
    });
  };

  const handleClose = () => {
    setPlatform("");
    setUrl("");
    setTitle("");
    onClose();
  };

  const selectedPlatform = platform ? getPlatform(platform) : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
          <DialogDescription>
            Add a social media or custom link to your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={platform}
                onValueChange={setPlatform}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center">
                        <i className={`ri-${p.icon} ${p.color} mr-2`}></i>
                        <span>{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={selectedPlatform?.urlPrefix || "https://"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Custom display title"
              />
              <p className="text-xs text-gray-500">
                Leave empty to use the platform name
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addLinkMutation.isPending}
            >
              {addLinkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkDialog;
