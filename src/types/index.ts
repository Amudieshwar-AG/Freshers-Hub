// ─── Navigation ─────────────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  path: string;
  icon?: string;
}

// ─── Features ────────────────────────────────────────────────────────────────
export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  path: string;
  color: string;
  bgColor: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

// ─── Faculty ─────────────────────────────────────────────────────────────────
export interface Faculty {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  office?: string;
  avatar?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  subjectsHandling?: string;
  researchAreas?: string;
  officeHours?: string;
  achievements?: string[];
  publications?: string[];
  studentsGuided?: { ug: number; pg: number; phd: number };
  languagesKnown?: string[];
  joinedInstitution?: string;
}

// ─── Bus Routes ──────────────────────────────────────────────────────────────
export interface BusStop {
  name: string;
  time: string;
  lat?: number;
  lng?: number;
}

export interface BusRoute {
  id: string;
  number: string;
  name: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  stops: BusStop[];
  color: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
}

// ─── Notes / PYQs ────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  title: string;
  subject: string;
  department: string;
  semester: number;
  type: 'notes' | 'pyq' | 'syllabus' | 'assignment';
  downloadUrl: string;
  uploadedAt: string;
  downloads: number;
  fileSize: string;
}

// ─── Events ──────────────────────────────────────────────────────────────────
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  category: 'technical' | 'cultural' | 'sports' | 'seminar' | 'workshop';
  imageUrl?: string;
  registrationUrl?: string;
  isUpcoming: boolean;
}

// ─── Clubs ───────────────────────────────────────────────────────────────────
export interface ClubSocialLinks {
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  youtube?: string;
  github?: string;
  website?: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  details?: string;
  category: string;
  members: number;
  presidentName?: string;
  year?: string;
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  logoUrl?: string;
  icon?: string;
  defaultRank?: number;
  socialLinks?: ClubSocialLinks;
}

// ─── Community / Q&A ─────────────────────────────────────────────────────────
export interface Question {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  answers: number;
  votes: number;
  tags: string[];
  isAnswered: boolean;
}

export interface Confession {
  id: string;
  content: string;
  createdAt: string;
  reactions: number;
  category?: string;
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── Toolkit ─────────────────────────────────────────────────────────────────
export interface ToolkitItem {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'link' | 'form';
  url: string;
  icon: string;
  category: string;
}

// ─── Campus Location ─────────────────────────────────────────────────────────
export interface CampusLocation {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
