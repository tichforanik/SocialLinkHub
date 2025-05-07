import { ProfileData } from "@shared/types";
import { getPlatform } from "@/lib/constants";

interface PhonePreviewProps {
  profile: ProfileData;
}

const PhonePreview = ({ profile }: PhonePreviewProps) => {
  return (
    <div className="phone-container">
      <div className="phone-notch"></div>
      
      <div className="phone-content">
        <div className="animate-fade-in">
          <div className="flex flex-col items-center space-y-4 py-6">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${profile.displayName || profile.username}'s profile`}
                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-md">
                <i className="ri-user-line text-4xl text-gray-400"></i>
              </div>
            )}
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {profile.displayName || profile.username}
              </h2>
              <p className="text-gray-600 max-w-xs text-sm">
                {profile.bio || "Add a bio to tell people about yourself"}
              </p>
            </div>
          </div>

          <div className="space-y-3 py-2">
            {profile.links && profile.links.length > 0 ? (
              profile.links
                .filter(link => link.active)
                .sort((a, b) => a.order - b.order)
                .map((link) => {
                  const platform = getPlatform(link.platform);
                  return (
                    <div key={link.id} className="social-link">
                      <i className={`ri-${platform.icon} text-xl ${platform.color} mr-3`}></i>
                      <span className="font-medium">{link.title || platform.name}</span>
                      <i className="ri-arrow-right-up-line ml-auto text-gray-400"></i>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm italic">
                No links added yet
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            Made with LinkHub
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePreview;
