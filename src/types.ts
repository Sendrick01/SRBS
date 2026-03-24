export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  photoURL: string;
  emailVerified: boolean;
  hasSeenTour: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  rent: number;
  location: string;
  landlordId: string;
  images: string[];
  vrTourUrl: string;
  arModelUrl: string;
  status: 'available' | 'rented';
  isPremium: boolean;
  isFeatured: boolean;
  bedrooms?: number;
  bathrooms?: number;
  views?: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  depositPaid: boolean;
  escrowStatus: 'none' | 'held' | 'released' | 'refunded';
  occupied: boolean;
  createdAt: string;
  confirmedAt?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  propertyId?: string;
  tenantId: string;
  landlordId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'deposit' | 'rent' | 'boost';
  transactionId: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface Review {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantPhoto: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
  propertyId?: string;
  landlordId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}
