// ── User & Auth ──────────────────────────────────────────────
export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── Package (colis) ──────────────────────────────────────────
export type PackageStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'REFUSED'
  | 'IN_TRANSIT'
  | 'PAUSED'
  | 'DELIVERED';

export const STATUS_LABELS: Record<PackageStatus, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  REFUSED: 'Refusé',
  IN_TRANSIT: 'En transit',
  PAUSED: 'En pause',
  DELIVERED: 'Livré',
};

export const STATUS_COLORS: Record<PackageStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  VALIDATED: 'bg-blue-100 text-blue-700 border-blue-200',
  REFUSED: 'bg-red-100 text-red-700 border-red-200',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  PAUSED: 'bg-orange-100 text-orange-700 border-orange-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export type TransportMode = 'ROUTE' | 'AIR' | 'MER';

export interface Waypoint {
  id: string;
  label: string;
  orderIndex: number;
  lat: number;
  lng: number;
  estimatedArrival?: string;
  reachedAt?: string;
  stopDurationMinutes?: number;
}

export interface TrackingEvent {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
}

export interface PackageMessage {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface PackageItem {
  id: string;
  trackingNumber: string;
  name: string;
  description?: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  status: PackageStatus;
  refusalReason?: string;
  originAddress: string;
  originLat?: number;
  originLng?: number;
  destinationAddress: string;
  destinationLat?: number;
  destinationLng?: number;
  transportMode?: TransportMode;
  deliveryDelay?: string;
  material?: string;
  weightKg?: number;
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
  estimatedCost?: number;
  estimatedDuration?: string;
  shippingDate?: string;
  photoUrl?: string;
  imageUrls?: string[];
  validatedAt?: string;
  validatedBy?: string;
  transitStartedAt?: string;
  demoDurationMinutes?: number;
  createdAt: string;
  updatedAt?: string;
  waypoints?: Waypoint[];
  trackingEvents?: TrackingEvent[];
  messages?: PackageMessage[];
}

// ── Notifications ────────────────────────────────────────────
export interface Notification {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ── Contact messages ─────────────────────────────────────────
export type ContactStatus = 'NON_TRAITE' | 'TRAITE';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

// ── FAQ ──────────────────────────────────────────────────────
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: string;
}

// ── Dashboard stats ──────────────────────────────────────────
export interface DashboardStats {
  total: number;
  pending: number;
  validated: number;
  inTransit: number;
  delivered: number;
  refused: number;
}
