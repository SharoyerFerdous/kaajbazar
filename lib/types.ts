export type Role = 'SEEKER' | 'PROVIDER' | 'BOTH' | 'ADMIN';
export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type AnnouncementStatus = 'open' | 'matched' | 'completed' | 'cancelled';
export type AppStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  avatar_url?: string;
  role: Role;
  location_district?: string;
  location_thana?: string;
  location_area?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
  icon: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  completed_jobs: number;
  avg_rating: number;
  response_rate: number;
  is_available: boolean;
  // Joined fields
  name?: string;
  phone?: string;
  avatar_url?: string;
  location_district?: string;
  location_thana?: string;
}

export interface Announcement {
  id: string;
  seeker_id: string;
  category_id: string;
  title: string;
  description?: string;
  location_district?: string;
  location_thana?: string;
  location_area?: string;
  budget_min_bdt?: number;
  budget_max_bdt?: number;
  preferred_date?: string;
  flexible_date: boolean;
  status: AnnouncementStatus;
  expires_at: string;
  created_at: string;
  // Joined
  category_icon?: string;
  category_name_bn?: string;
  seeker_name?: string;
}

export interface Booking {
  id: string;
  announcement_id?: string;
  provider_id: string;
  seeker_id: string;
  agreed_price_bdt?: number;
  scheduled_date?: string;
  status: BookingStatus;
  created_at: string;
  // Joined
  provider_name?: string;
  provider_phone?: string;
  seeker_name?: string;
  seeker_phone?: string;
}
