import { getBackendUrl } from '@/lib/utils';

export interface StudentInfo {
  studentId: string;
  regNumber: string;
  name: string;
  email: string;
  degree: string;
  department: string;
  departmentCode: string;
  year: number;
  semester: number;
  section: string;
  batch: string;
  regulation: string;
}

export interface ClassLocationInfo {
  roomNumber: string;
  buildingName: string;
  floor: string;
  wing: string;
  landmark: string;
}

export interface ClassFacultyMember {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  designation: string;
  email: string;
  officeLocation: string;
  phoneExtension: string;
  avatarUrl?: string;
  isClassIncharge: boolean;
}

export interface TimetablePeriod {
  periodNumber: number;
  timeSlot: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  type: 'THEORY' | 'LAB' | 'TUTORIAL' | 'LIBRARY';
  facultyName: string;
  venue: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface DaySchedule {
  dayOfWeek: string;
  date: string;
  periods: TimetablePeriod[];
}

export interface StudentDashboardData {
  student: StudentInfo;
  classLocation: ClassLocationInfo;
  facultyList: ClassFacultyMember[];
  todaySchedule: DaySchedule;
  isMockData: boolean;
}

export interface MockUserCredential {
  regNumber: string;
  defaultPassword: string;
  studentName: string;
  department: string;
  section: string;
}

export interface ImsLoginResult {
  success: boolean;
  message: string;
  token?: string;
  student?: StudentInfo;
}

const IMS_STORAGE_KEY = 'rit_ims_student_session';

export function getStoredImsSession(): { token: string; student: StudentInfo } | null {
  try {
    const raw = localStorage.getItem(IMS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveImsSession(token: string, student: StudentInfo) {
  localStorage.setItem(IMS_STORAGE_KEY, JSON.stringify({ token, student }));
}

export function clearImsSession() {
  localStorage.removeItem(IMS_STORAGE_KEY);
}

// ─── Default Mock Data for Client Fallback ───────────────────────────
const CLIENT_FALLBACK_MOCKS: Record<string, StudentDashboardData> = {
  '2114251001': {
    student: {
      studentId: '2114251001',
      regNumber: '2114251001',
      name: 'Anbu Kathir',
      email: '251001@ritchennai.edu.in',
      degree: 'B.E.',
      department: 'Computer Science & Engineering',
      departmentCode: 'CSE',
      year: 1,
      semester: 2,
      section: 'A',
      batch: '2025 - 2029',
      regulation: '2021 Regulation',
    },
    classLocation: {
      roomNumber: 'LH-204',
      buildingName: 'Dr. APJ Abdul Kalam Academic Block',
      floor: '2nd Floor',
      wing: 'East Wing',
      landmark: 'Next to CSE Department Library, Opposite to Seminar Hall',
    },
    facultyList: [
      {
        subjectCode: 'CS3201',
        subjectName: 'Data Structures & Algorithms',
        facultyName: 'Dr. R. Arunkumar',
        designation: 'Associate Professor & Class Incharge',
        email: 'arunkumar.r@ritchennai.edu.in',
        officeLocation: 'APJ Block, Cabin 208-B',
        phoneExtension: 'Ext. 312',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arunkumar',
        isClassIncharge: true,
      },
      {
        subjectCode: 'MA3251',
        subjectName: 'Discrete Mathematics',
        facultyName: 'Dr. S. Malathi',
        designation: 'Professor (Mathematics)',
        email: 'malathi.s@ritchennai.edu.in',
        officeLocation: 'Science & Humanities Block, 1st Floor',
        phoneExtension: 'Ext. 118',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Malathi',
        isClassIncharge: false,
      },
      {
        subjectCode: 'CS3202',
        subjectName: 'Digital Principles & System Design',
        facultyName: 'Dr. M. Balaji',
        designation: 'Assistant Professor',
        email: 'balaji.m@ritchennai.edu.in',
        officeLocation: 'APJ Block, Cabin 104',
        phoneExtension: 'Ext. 325',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Balaji',
        isClassIncharge: false,
      },
      {
        subjectCode: 'GE3251',
        subjectName: 'Environmental Sciences & Sustainability',
        facultyName: 'Dr. T. Gayathri',
        designation: 'Assistant Professor (Chemistry)',
        email: 'gayathri.t@ritchennai.edu.in',
        officeLocation: 'Science Block, Chemistry Cabin 3',
        phoneExtension: 'Ext. 142',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathri',
        isClassIncharge: false,
      },
      {
        subjectCode: 'CS3271',
        subjectName: 'Data Structures Laboratory',
        facultyName: 'Dr. R. Arunkumar / Dr. K. Revathi',
        designation: 'Lab In-Charges',
        email: 'lab.cse@ritchennai.edu.in',
        officeLocation: 'Computing Center 3 (CC-03)',
        phoneExtension: 'Ext. 330',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Revathi',
        isClassIncharge: false,
      },
    ],
    todaySchedule: {
      dayOfWeek: 'MONDAY',
      date: new Date().toISOString().split('T')[0],
      periods: [
        { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'MA3251', subjectName: 'Discrete Mathematics', type: 'THEORY', facultyName: 'Dr. S. Malathi', venue: 'LH-204', status: 'COMPLETED' },
        { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'CS3201', subjectName: 'Data Structures & Algorithms', type: 'THEORY', facultyName: 'Dr. R. Arunkumar', venue: 'LH-204', status: 'COMPLETED' },
        { periodNumber: 3, timeSlot: '10:50 AM - 11:45 AM', startTime: '10:50', endTime: '11:45', subjectCode: 'CS3202', subjectName: 'Digital Principles & System Design', type: 'THEORY', facultyName: 'Dr. M. Balaji', venue: 'LH-204', status: 'ONGOING' },
        { periodNumber: 4, timeSlot: '11:45 AM - 12:40 PM', startTime: '11:45', endTime: '12:40', subjectCode: 'GE3251', subjectName: 'Environmental Sciences', type: 'THEORY', facultyName: 'Dr. T. Gayathri', venue: 'LH-204', status: 'UPCOMING' },
        { periodNumber: 5, timeSlot: '01:30 PM - 02:25 PM', startTime: '13:30', endTime: '14:25', subjectCode: 'CS3201', subjectName: 'DSA Tutorial & Problem Solving', type: 'TUTORIAL', facultyName: 'Dr. R. Arunkumar', venue: 'LH-204', status: 'UPCOMING' },
        { periodNumber: 6, timeSlot: '02:25 PM - 03:20 PM', startTime: '14:25', endTime: '15:20', subjectCode: 'LIB', subjectName: 'Digital Library & Research Hours', type: 'LIBRARY', facultyName: 'Chief Librarian', venue: 'Central Library - 2nd Floor', status: 'UPCOMING' },
      ],
    },
    isMockData: true,
  },
  '2114251002': {
    student: {
      studentId: '2114251002',
      regNumber: '2114251002',
      name: 'Priyadharshini M',
      email: '251002@ritchennai.edu.in',
      degree: 'B.Tech.',
      department: 'Artificial Intelligence & Data Science',
      departmentCode: 'AIDS',
      year: 1,
      semester: 2,
      section: 'B',
      batch: '2025 - 2029',
      regulation: '2021 Regulation',
    },
    classLocation: {
      roomNumber: 'LH-301',
      buildingName: 'Sir Isaac Newton Innovation Block',
      floor: '3rd Floor',
      wing: 'North Wing',
      landmark: 'Opposite AI Centre of Excellence, Near Lift Lobby',
    },
    facultyList: [
      {
        subjectCode: 'AD3251',
        subjectName: 'Data Structures Design',
        facultyName: 'Dr. N. Saravanan',
        designation: 'Associate Professor & Class Incharge',
        email: 'saravanan.n@ritchennai.edu.in',
        officeLocation: 'Newton Block, Cabin 302',
        phoneExtension: 'Ext. 401',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Saravanan',
        isClassIncharge: true,
      },
      {
        subjectCode: 'AD3252',
        subjectName: 'Foundations of Artificial Intelligence',
        facultyName: 'Prof. J. Daniel',
        designation: 'Assistant Professor',
        email: 'daniel.j@ritchennai.edu.in',
        officeLocation: 'Newton Block, Cabin 306',
        phoneExtension: 'Ext. 405',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
        isClassIncharge: false,
      },
      {
        subjectCode: 'MA3251',
        subjectName: 'Probability and Statistics',
        facultyName: 'Dr. V. Lakshmi',
        designation: 'Professor (Mathematics)',
        email: 'lakshmi.v@ritchennai.edu.in',
        officeLocation: 'Science Block, Cabin 108',
        phoneExtension: 'Ext. 119',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi',
        isClassIncharge: false,
      },
    ],
    todaySchedule: {
      dayOfWeek: 'MONDAY',
      date: new Date().toISOString().split('T')[0],
      periods: [
        { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'MA3251', subjectName: 'Probability & Stats', type: 'THEORY', facultyName: 'Dr. V. Lakshmi', venue: 'LH-301', status: 'COMPLETED' },
        { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'AD3251', subjectName: 'Data Structures Design', type: 'THEORY', facultyName: 'Dr. N. Saravanan', venue: 'LH-301', status: 'COMPLETED' },
        { periodNumber: 3, timeSlot: '10:50 AM - 11:45 AM', startTime: '10:50', endTime: '11:45', subjectCode: 'AD3252', subjectName: 'Foundations of AI', type: 'THEORY', facultyName: 'Prof. J. Daniel', venue: 'LH-301', status: 'ONGOING' },
        { periodNumber: 4, timeSlot: '11:45 AM - 12:40 PM', startTime: '11:45', endTime: '12:40', subjectCode: 'GE3251', subjectName: 'Environmental Sciences', type: 'THEORY', facultyName: 'Dr. T. Gayathri', venue: 'LH-301', status: 'UPCOMING' },
        { periodNumber: 5, timeSlot: '01:30 PM - 02:25 PM', startTime: '13:30', endTime: '14:25', subjectCode: 'AD3251', subjectName: 'AI Problem Solving Tutorial', type: 'TUTORIAL', facultyName: 'Dr. N. Saravanan', venue: 'LH-301', status: 'UPCOMING' },
        { periodNumber: 6, timeSlot: '02:25 PM - 03:20 PM', startTime: '14:25', endTime: '15:20', subjectCode: 'LIB', subjectName: 'Digital Library & Research Hours', type: 'LIBRARY', facultyName: 'Chief Librarian', venue: 'Central Library - 2nd Floor', status: 'UPCOMING' },
      ],
    },
    isMockData: true,
  },
  '2114251003': {
    student: {
      studentId: '2114251003',
      regNumber: '2114251003',
      name: 'Rahul V',
      email: '251003@ritchennai.edu.in',
      degree: 'B.E.',
      department: 'Electronics & Communication Engineering',
      departmentCode: 'ECE',
      year: 1,
      semester: 2,
      section: 'A',
      batch: '2025 - 2029',
      regulation: '2021 Regulation',
    },
    classLocation: {
      roomNumber: 'LH-105',
      buildingName: 'Rabindranath Tagore Academic Block',
      floor: '1st Floor',
      wing: 'South Wing',
      landmark: 'Near Department Auditorium',
    },
    facultyList: [
      {
        subjectCode: 'EC3251',
        subjectName: 'Circuit Analysis',
        facultyName: 'Dr. I. Chandra',
        designation: 'Professor & Class Incharge',
        email: 'chandra.i@ritchennai.edu.in',
        officeLocation: 'Tagore Block, Cabin 112',
        phoneExtension: 'Ext. 502',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chandra',
        isClassIncharge: true,
      },
    ],
    todaySchedule: {
      dayOfWeek: 'MONDAY',
      date: new Date().toISOString().split('T')[0],
      periods: [
        { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'MA3251', subjectName: 'Discrete Mathematics', type: 'THEORY', facultyName: 'Dr. S. Malathi', venue: 'LH-105', status: 'COMPLETED' },
        { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'EC3251', subjectName: 'Circuit Analysis', type: 'THEORY', facultyName: 'Dr. I. Chandra', venue: 'LH-105', status: 'ONGOING' },
      ],
    },
    isMockData: true,
  },
};

const DEFAULT_MOCK_USER_LIST: MockUserCredential[] = [
  { regNumber: '2114251001', defaultPassword: 'rit@2026', studentName: 'Anbu Kathir', department: 'Computer Science & Engineering', section: 'Sec A' },
  { regNumber: '2114251002', defaultPassword: 'rit@2026', studentName: 'Priyadharshini M', department: 'AI & Data Science', section: 'Sec B' },
  { regNumber: '2114251003', defaultPassword: 'rit@2026', studentName: 'Rahul V', department: 'Electronics & Comm. Engg.', section: 'Sec A' },
];

/**
 * Log in using Register Number and Password
 */
export async function loginWithIms(regNumber: string, password: string): Promise<ImsLoginResult> {
  try {
    const url = getBackendUrl('/api/v1/ims/auth/login');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNumber, password }),
    });

    if (response.ok) {
      const data: ImsLoginResult = await response.json();
      if (data.success && data.token && data.student) {
        saveImsSession(data.token, data.student);
      }
      return data;
    }
  } catch {
    // Backend offline fallback
  }

  // Client-side fallback
  const cleaned = regNumber.trim();
  const mock = CLIENT_FALLBACK_MOCKS[cleaned] || CLIENT_FALLBACK_MOCKS['2114251001'];
  const token = 'ims_mock_token_' + mock.student.regNumber;
  saveImsSession(token, mock.student);

  return {
    success: true,
    message: 'Mock IMS Login Successful',
    token,
    student: mock.student,
  };
}

/**
 * Fetch available demo accounts
 */
export async function fetchMockImsUsers(): Promise<MockUserCredential[]> {
  try {
    const url = getBackendUrl('/api/v1/ims/auth/mock-users');
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback
  }
  return DEFAULT_MOCK_USER_LIST;
}

/**
 * Fetch complete student dashboard information
 */
export async function fetchStudentDashboard(
  regNumber?: string,
  userEmail?: string,
  devStudentId?: string
): Promise<StudentDashboardData> {
  const session = getStoredImsSession();
  const effectiveReg = devStudentId || regNumber || session?.student.regNumber;

  if (!effectiveReg) {
    throw new Error('No IMS session active. Please log in with your Register Number.');
  }

  try {
    const params = new URLSearchParams();
    params.set('regNumber', effectiveReg);
    if (userEmail) {
      params.set('email', userEmail);
    }

    const url = getBackendUrl(`/api/v1/ims/dashboard/me${params.toString() ? `?${params.toString()}` : ''}`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (session?.token) {
      headers['X-IMS-Token'] = session.token;
    }

    if (devStudentId) {
      headers['X-Dev-Student-Id'] = devStudentId;
    }

    const response = await fetch(url, { headers });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback
  }

  // Client fallback mock
  const fallback = CLIENT_FALLBACK_MOCKS[effectiveReg] || CLIENT_FALLBACK_MOCKS['2114251001'];
  return fallback;
}
