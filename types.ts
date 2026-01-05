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
  nin?: string;
  selfie_url?: string;
  verification_status?: 'none' | 'pending' | 'approved' | 'rejected';
  is_identity_verified?: boolean;
  created_at?: string;
}
export interface Payment {
  id: string;
  user_id: string;
  lodge_id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  reference: string;
  metadata?: {
    check_in?: string;
    check_out?: string;
    lodgeTitle?: string;
    base_amount?: number;
    tax_amount?: number;
  };
  created_at: string;
  lodges?: Lodge;
  profiles?: UserProfile;
}
