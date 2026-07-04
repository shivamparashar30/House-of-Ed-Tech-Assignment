export const DarkColors = {
  background: '#0F0F0F',
  surface: '#121212',
  elevated: '#1A1A1A',
  primary: '#E50914',
  primaryDark: '#B00710',
  accent: '#F5C518',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#262626',
} as const;

export const LightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  primary: '#E50914',
  primaryDark: '#B00710',
  accent: '#F5C518',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
} as const;

// Default export for backward compatibility — dark palette
export const Colors = DarkColors;

export interface ThemeColors {
  background: string;
  surface: string;
  elevated: string;
  primary: string;
  primaryDark: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const DarkHeroGradient = [
  'transparent',
  'rgba(15,15,15,0.35)',
  'rgba(15,15,15,0.85)',
  '#0F0F0F',
] as const;

export const LightHeroGradient = [
  'transparent',
  'rgba(245,245,245,0.35)',
  'rgba(245,245,245,0.85)',
  '#F5F5F5',
] as const;

// Default export — dark
export const HeroGradient = DarkHeroGradient;

export const CardGradient = ['transparent', 'rgba(0,0,0,0.85)'] as const;
