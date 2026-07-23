import type { Feature, Stat, BusRoute, Faculty, Event, Club, Question, Confession, ToolkitItem, CampusLocation } from '@/types';

// ─── Navigation ──────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Notes', path: '/notes' },
  { label: 'AI Assistant', path: '/ai-assistant' },
  { label: 'Campus', path: '/campus' },
  { label: 'Events', path: '/events' },
  { label: 'Community', path: '/community' },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
export const STATS: Stat[] = [
  { value: 150, suffix: '+', label: 'PYQs', icon: 'FileText' },
  { value: 40, suffix: '+', label: 'Faculty', icon: 'Users' },
  { value: 25, suffix: '+', label: 'Clubs', icon: 'Star' },
  { value: 24, suffix: '/7', label: 'AI Assistant', icon: 'Bot' },
  { value: 1000, suffix: '+', label: 'Students', icon: 'GraduationCap' },
];

// ─── Features ────────────────────────────────────────────────────────────────
export const FEATURES: Feature[] = [
  {
    id: 'notes',
    icon: 'BookOpen',
    title: 'Notes & PYQs',
    description: 'Access semester-wise notes, previous year question papers, and study materials instantly.',
    path: '/notes',
    color: '#F97316',
    bgColor: '#FFF7ED',
  },
  {
    id: 'ai',
    icon: 'Bot',
    title: 'AI Fresher Assistant',
    description: 'Get instant answers about campus life, academics, rules, and everything RIT – powered by Gemini AI.',
    path: '/ai-assistant',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  {
    id: 'map',
    icon: 'Map',
    title: 'Campus Map',
    description: 'Explore RIT campus interactively – find departments, labs, library, canteen, and facilities.',
    path: '/campus',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    id: 'bus',
    icon: 'Bus',
    title: 'Bus Routes',
    description: 'View all campus bus routes, timings, and pickup locations at a glance.',
    path: '/campus',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'faculty',
    icon: 'UserCheck',
    title: 'Faculty Directory',
    description: 'Find faculty contact details, department, designation, and office hours.',
    path: '/campus',
    color: '#EC4899',
    bgColor: '#FDF2F8',
  },
  {
    id: 'qa',
    icon: 'MessageCircle',
    title: 'Freshers Q&A',
    description: 'Ask questions, get answers from seniors, and join the freshers community discussion.',
    path: '/community',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    id: 'events',
    icon: 'Calendar',
    title: 'Clubs & Events',
    description: 'Discover clubs, upcoming events, workshops, and cultural programs at RIT.',
    path: '/events',
    color: '#EF4444',
    bgColor: '#FEF2F2',
  },
  {
    id: 'toolkit',
    icon: 'Wrench',
    title: 'Student Toolkit',
    description: 'Download timetables, academic calendar, syllabus, forms, and ERP guides.',
    path: '/notes',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
  },
  {
    id: 'confession',
    icon: 'Heart',
    title: 'Anonymous Confession',
    description: 'Share your thoughts, feelings, and confessions anonymously with the RIT community.',
    path: '/community',
    color: '#F97316',
    bgColor: '#FFF7ED',
  },
];

// ─── Bus Routes ──────────────────────────────────────────────────────────────
export const BUS_ROUTES: BusRoute[] = [
  {
    id: '1',
    number: 'RIT-01',
    name: 'Chennai Central Route',
    from: 'Chennai Central',
    to: 'RIT Campus',
    departureTime: '07:00 AM',
    arrivalTime: '08:30 AM',
    color: '#F97316',
    stops: [
      { name: 'Chennai Central', time: '07:00 AM' },
      { name: 'Koyambedu', time: '07:30 AM' },
      { name: 'Porur', time: '08:00 AM' },
      { name: 'RIT Campus', time: '08:30 AM' },
    ],
  },
  {
    id: '2',
    number: 'RIT-02',
    name: 'Tambaram Express',
    from: 'Tambaram',
    to: 'RIT Campus',
    departureTime: '07:15 AM',
    arrivalTime: '08:45 AM',
    color: '#3B82F6',
    stops: [
      { name: 'Tambaram', time: '07:15 AM' },
      { name: 'Chrompet', time: '07:35 AM' },
      { name: 'Pallavaram', time: '07:55 AM' },
      { name: 'RIT Campus', time: '08:45 AM' },
    ],
  },
  {
    id: '3',
    number: 'RIT-03',
    name: 'Anna Nagar Route',
    from: 'Anna Nagar',
    to: 'RIT Campus',
    departureTime: '07:20 AM',
    arrivalTime: '08:50 AM',
    color: '#10B981',
    stops: [
      { name: 'Anna Nagar', time: '07:20 AM' },
      { name: 'Vadapalani', time: '07:45 AM' },
      { name: 'Valasaravakkam', time: '08:10 AM' },
      { name: 'RIT Campus', time: '08:50 AM' },
    ],
  },
  {
    id: '4',
    number: 'RIT-04',
    name: 'OMR Tech Route',
    from: 'Sholinganallur',
    to: 'RIT Campus',
    departureTime: '07:00 AM',
    arrivalTime: '08:30 AM',
    color: '#8B5CF6',
    stops: [
      { name: 'Sholinganallur', time: '07:00 AM' },
      { name: 'Perungudi', time: '07:20 AM' },
      { name: 'Medavakkam', time: '07:45 AM' },
      { name: 'RIT Campus', time: '08:30 AM' },
    ],
  },
];

// ─── Faculty ─────────────────────────────────────────────────────────────────
export const FACULTY_DATA: Faculty[] = [
  {
    id: '1',
    name: 'Dr. S. Ramesh Kumar',
    designation: 'Professor & HOD',
    department: 'Computer Science & Engineering',
    email: 'ramesh@rit.edu',
    office: 'CSE Block, Room 301',
    specialization: 'Machine Learning, AI',
  },
  {
    id: '2',
    name: 'Dr. P. Mahalakshmi',
    designation: 'Associate Professor',
    department: 'Electronics & Communication',
    email: 'mahalakshmi@rit.edu',
    office: 'ECE Block, Room 205',
    specialization: 'VLSI Design, Embedded Systems',
  },
  {
    id: '3',
    name: 'Prof. R. Vijayakumar',
    designation: 'Assistant Professor',
    department: 'Mechanical Engineering',
    email: 'vijay@rit.edu',
    office: 'MECH Block, Room 102',
    specialization: 'CAD/CAM, Robotics',
  },
  {
    id: '4',
    name: 'Dr. K. Anitha',
    designation: 'Professor',
    department: 'Information Technology',
    email: 'anitha@rit.edu',
    office: 'IT Block, Room 401',
    specialization: 'Data Science, Cloud Computing',
  },
  {
    id: '5',
    name: 'Prof. M. Selvakumar',
    designation: 'Associate Professor',
    department: 'Civil Engineering',
    email: 'selva@rit.edu',
    office: 'CIVIL Block, Room 110',
    specialization: 'Structural Engineering',
  },
  {
    id: '6',
    name: 'Dr. S. Priya',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    email: 'priya@rit.edu',
    office: 'CSE Block, Room 205',
    specialization: 'Cyber Security, Networks',
  },
];

// ─── Events ──────────────────────────────────────────────────────────────────
export const EVENTS_DATA: Event[] = [
  {
    id: '1',
    title: 'Fresher\'s Orientation Day 2025',
    description: 'Welcome ceremony for the new batch of students. Meet faculty, seniors, and explore campus.',
    date: '2025-08-05',
    time: '09:00 AM',
    venue: 'Main Auditorium',
    organizer: 'Student Council',
    category: 'seminar',
    isUpcoming: true,
  },
  {
    id: '2',
    title: 'Hackathon 2025 – RIT Code Fest',
    description: 'A 24-hour hackathon open to all departments. Build innovative solutions for real-world problems.',
    date: '2025-08-20',
    time: '08:00 AM',
    venue: 'Computer Lab Complex',
    organizer: 'CSE Department',
    category: 'technical',
    isUpcoming: true,
  },
  {
    id: '3',
    title: 'Techno Cultural Fest – RITMO',
    description: 'Annual cultural and technical fest with competitions, performances, and prize money up to ₹2 lakhs.',
    date: '2025-09-15',
    time: '10:00 AM',
    venue: 'College Ground',
    organizer: 'Arts & Cultural Committee',
    category: 'cultural',
    isUpcoming: true,
  },
  {
    id: '4',
    title: 'Industry Expert Talk – AI & Future',
    description: 'Guest lecture by industry experts from Google and Microsoft on AI trends and career opportunities.',
    date: '2025-08-10',
    time: '02:00 PM',
    venue: 'Seminar Hall',
    organizer: 'ECE Department',
    category: 'seminar',
    isUpcoming: true,
  },
];

// ─── Clubs ───────────────────────────────────────────────────────────────────
export const CLUBS_DATA: Club[] = [
  { id: '1', name: 'Coding Club', description: 'For programming enthusiasts', category: 'Technical', members: 120 },
  { id: '2', name: 'Robotics Club', description: 'Build and code robots', category: 'Technical', members: 85 },
  { id: '3', name: 'Photography Club', description: 'Capture campus moments', category: 'Creative', members: 60 },
  { id: '4', name: 'Music Club', description: 'Classical and contemporary music', category: 'Cultural', members: 95 },
  { id: '5', name: 'Drama Club', description: 'Theatre and performing arts', category: 'Cultural', members: 45 },
  { id: '6', name: 'NSS', description: 'National Service Scheme', category: 'Social', members: 200 },
];

// ─── Community Q&A ───────────────────────────────────────────────────────────
export const QUESTIONS_DATA: Question[] = [
  {
    id: '1',
    title: 'How is the hostel facility at RIT?',
    body: 'I\'m a fresher joining CSE. Can someone give me honest reviews about the hostel rooms, food, and wifi?',
    author: 'Priya S.',
    createdAt: '2025-07-15T10:00:00Z',
    answers: 12,
    votes: 45,
    tags: ['hostel', 'accommodation', 'fresher'],
    isAnswered: true,
  },
  {
    id: '2',
    title: 'Which subjects are most important in 1st semester CSE?',
    body: 'I want to prepare in advance. What are the toughest subjects in the first semester?',
    author: 'Ravi K.',
    createdAt: '2025-07-18T14:30:00Z',
    answers: 8,
    votes: 38,
    tags: ['academics', 'cse', 'semester-1'],
    isAnswered: true,
  },
  {
    id: '3',
    title: 'Is there a gym on campus?',
    body: 'Does RIT have a gym or fitness center for students? What are the timings?',
    author: 'Arun M.',
    createdAt: '2025-07-20T09:15:00Z',
    answers: 4,
    votes: 22,
    tags: ['campus', 'sports', 'facilities'],
    isAnswered: false,
  },
];

// ─── Confessions ─────────────────────────────────────────────────────────────
export const CONFESSIONS_DATA: Confession[] = [
  {
    id: '1',
    content: 'I was so nervous on my first day that I went to the wrong department. A senior helped me out and became my best friend. RIT has such a warm community! 🧡',
    createdAt: '2025-07-19T11:00:00Z',
    reactions: 87,
    category: 'Wholesome',
  },
  {
    id: '2',
    content: 'The library WiFi is actually faster than my home connection. No complaints from me 😂',
    createdAt: '2025-07-18T15:30:00Z',
    reactions: 134,
    category: 'Funny',
  },
  {
    id: '3',
    content: 'I have a crush on someone in my class but I\'m too shy to talk. We have been in the same group project for 2 months now 😅',
    createdAt: '2025-07-17T09:00:00Z',
    reactions: 212,
    category: 'Crush',
  },
];

// ─── Toolkit Items ───────────────────────────────────────────────────────────
export const TOOLKIT_ITEMS: ToolkitItem[] = [
  { id: '1', title: 'Timetable 2025-26', description: 'Semester timetable for all departments', type: 'pdf', url: '#', icon: 'Clock', category: 'Academic' },
  { id: '2', title: 'Academic Calendar', description: 'Important dates, holidays, and exams', type: 'pdf', url: '#', icon: 'CalendarDays', category: 'Academic' },
  { id: '3', title: 'Fee Payment Form', description: 'Semester fee payment form', type: 'form', url: '#', icon: 'CreditCard', category: 'Administrative' },
  { id: '4', title: 'Syllabus 2025', description: 'Updated syllabus for all semesters', type: 'pdf', url: '#', icon: 'BookMarked', category: 'Academic' },
  { id: '5', title: 'Regulations 2021', description: 'Anna University regulations document', type: 'pdf', url: '#', icon: 'ScrollText', category: 'Regulatory' },
  { id: '6', title: 'ERP Portal Guide', description: 'Step-by-step guide to use ERP system', type: 'pdf', url: '#', icon: 'Monitor', category: 'Guide' },
  { id: '7', title: 'Leave Application', description: 'Student leave application form', type: 'form', url: '#', icon: 'FileCheck', category: 'Administrative' },
  { id: '8', title: 'Bus Pass Form', description: 'Apply for monthly bus pass', type: 'form', url: '#', icon: 'Bus', category: 'Administrative' },
];

// ─── Campus Locations ────────────────────────────────────────────────────────
export const CAMPUS_LOCATIONS: CampusLocation[] = [
  { id: 'dept', name: 'Departments', icon: 'Building2' },
  { id: 'library', name: 'Library', icon: 'Library' },
  { id: 'labs', name: 'Labs', icon: 'FlaskConical' },
  { id: 'hostel', name: 'Hostels', icon: 'Home' },
  { id: 'canteen', name: 'Canteen', icon: 'UtensilsCrossed' },
  { id: 'auditorium', name: 'Auditorium', icon: 'Theater' },
  { id: 'sports', name: 'Sports Ground', icon: 'Trophy' },
];

// ─── AI Suggested Prompts ────────────────────────────────────────────────────
export const AI_SUGGESTED_PROMPTS = [
  'What documents do I need for admission?',
  'How do I access the ERP portal?',
  'Tell me about hostel facilities',
  'What are the top clubs at RIT?',
  'How does the bus route system work?',
  'What are the library timings?',
  'Who is the HOD of CSE department?',
  'What is the dress code at RIT?',
];

// ─── Departments ─────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Electrical & Electronics',
  'Artificial Intelligence & Data Science',
];
