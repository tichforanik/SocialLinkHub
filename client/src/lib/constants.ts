import { SocialPlatform } from "@shared/types";

export const PLATFORMS: SocialPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "instagram-line",
    color: "text-pink-600",
    urlPrefix: "https://instagram.com/",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "youtube-line",
    color: "text-red-600",
    urlPrefix: "https://youtube.com/@",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: "twitter-x-line",
    color: "text-gray-800",
    urlPrefix: "https://twitter.com/",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "facebook-box-fill",
    color: "text-blue-600",
    urlPrefix: "https://facebook.com/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "tiktok-line",
    color: "text-pink-500",
    urlPrefix: "https://tiktok.com/@",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin-box-line",
    color: "text-blue-700",
    urlPrefix: "https://linkedin.com/in/",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "github-fill",
    color: "text-gray-900",
    urlPrefix: "https://github.com/",
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: "spotify-fill",
    color: "text-green-500",
    urlPrefix: "https://open.spotify.com/user/",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: "twitch-line",
    color: "text-purple-600",
    urlPrefix: "https://twitch.tv/",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "pinterest-line",
    color: "text-red-700",
    urlPrefix: "https://pinterest.com/",
  },
  {
    id: "email",
    name: "Email",
    icon: "mail-line",
    color: "text-gray-600",
    urlPrefix: "mailto:",
  },
  {
    id: "website",
    name: "Website",
    icon: "global-line",
    color: "text-blue-500",
  },
  {
    id: "store",
    name: "My Shop",
    icon: "store-2-line",
    color: "text-green-600",
  },
  {
    id: "custom",
    name: "Custom Link",
    icon: "links-line",
    color: "text-gray-700",
  },
];

export function getPlatform(id: string): SocialPlatform {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[PLATFORMS.length - 1];
}
