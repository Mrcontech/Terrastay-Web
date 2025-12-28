export interface Lodge {
  id: string;
  title: string;
  description: string;
  price: string;
  price_numeric?: number;
  area: string;
  distance?: string;
  amenities?: string[];
  image_urls: string[];
  is_verified?: boolean;
  rating: number;
  review_count?: number;
  caretaker_name?: string;
  bedrooms?: number;
  bathrooms?: number;
  owner_id: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  lodge_id: string;
  booking_code: string;
  inspection_date: string;
  inspection_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  lodges?: Lodge;
  profiles?: UserProfile;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  school_name?: string;
  dob?: string;
  avatar_url?: string;
  role?: 'student' | 'agent' | 'admin';
  created_at?: string;
}
