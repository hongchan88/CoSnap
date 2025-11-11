// On-demand authentication function signatures

export interface ProfileType {
  id: string;
  user_id: string;
  username: string;
  role: 'free' | 'premium' | 'admin';
  focus_score: number;
  focus_tier: 'Blurry' | 'Focusing' | 'Clear' | 'Crystal';
  cocredit_balance: number;
  camera_gear?: string;
  styles: string[];
  languages: string[];
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}
