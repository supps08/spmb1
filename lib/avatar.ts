// lib/avatar.ts
export interface AvatarColor {
    bg: string;
    color: string;
  }
  
  export const AVATAR_COLORS: AvatarColor[] = [
    { bg: "#EBF4EE", color: "#1C5C38" },
    { bg: "#D1FAE5", color: "#065F46" },
    { bg: "#E0E7FF", color: "#3730A3" },
    { bg: "#FEF3C7", color: "#92400E" },
    { bg: "#FEE2E2", color: "#991B1B" },
    { bg: "#FCE7F3", color: "#9D174D" },
  ];
  
  export function avatarColor(name: string): AvatarColor {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }