export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  urlPrefix?: string;
}

export interface ProfileData {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  links: LinkData[];
}

export interface LinkData {
  id: number;
  platform: string;
  url: string;
  title?: string;
  active: boolean;
  icon?: string;
  order: number;
}
