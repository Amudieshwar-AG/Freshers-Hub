export interface StudentProfile {
  name: string;
  registerNumber: string;
  regNumber?: string;
  department: string;
  departmentCode: string;
  batch: string;
  year: number;
  semester: number;
  email: string;
  degree: string;
  regulation: string;
  avatarUrl: string;
  timetableUrl?: string;
}

import { DEPARTMENT_CURRICULUM, DEPARTMENT_CODE_MAP, PROFESSIONAL_ELECTIVES_LIST } from '@/constants/departmentCurriculum';

export interface TimetablePeriod {
  periodNumber: number;
  timeSlot: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  staffName: string;
  staffCode?: string;
  type: 'THEORY' | 'LAB';
}

export interface WeeklySchedule {
  monday: TimetablePeriod[];
  tuesday: TimetablePeriod[];
  wednesday: TimetablePeriod[];
  thursday: TimetablePeriod[];
  friday: TimetablePeriod[];
}

export interface SubjectAttendance {
  code: string;
  name: string;
  conducted: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface AttendanceReport {
  overallPercentage: number;
  totalConducted: number;
  totalPresent: number;
  totalAbsent: number;
  subjects: SubjectAttendance[];
}

export interface SubjectCatMark {
  code: string;
  name: string;
  faculty?: string;
  co1?: string;
  co2?: string;
  total?: string;
  weightage?: string;
}

export interface CatMarksReport {
  subjects: SubjectCatMark[];
}

export interface AssignmentMarkItem {
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  a1: string;
  a2: string;
  a3: string;
  a4: string;
  a5: string;
  total: string;
}

export interface LabMarkItem {
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  marks: string;
  total: string;
}

export interface SemesterGrade {
  code: string;
  name: string;
  credits: number;
  internalMark?: number;
  externalMark?: number;
  totalMark?: number;
  grade: string;
  result: string;
}

export interface SemesterResult {
  semester: number;
  gpa: number;
  totalCredits: number;
  subjects: SemesterGrade[];
}

export type StudentInfo = StudentProfile;

export interface ImsLoginResult {
  success: boolean;
  message: string;
  token?: string;
  profile?: StudentProfile;
  student?: StudentProfile;
}

const IMS_STORAGE_KEY = 'rit_ims_v4_student_session';
const IMS_PROFILE_CACHE_KEY = 'rit_ims_v4_profile_cache_';
const IMS_TIMETABLE_CACHE_KEY = 'rit_ims_v4_timetable_cache_';
const IMS_ATTENDANCE_CACHE_KEY = 'rit_ims_v4_attendance_cache_';
const IMS_MARKS_CACHE_KEY = 'rit_ims_v4_marks_cache_';
const IMS_GRADES_CACHE_KEY = 'rit_ims_v4_grades_cache_';


export const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'U': 0,
  'RA': 0,
  'AB': 0,
  'W': 0,
  'FAIL': 0,
};

export function getStoredImsSession(): { token: string; profile: StudentProfile; student: StudentProfile } | null {
  try {
    const raw = localStorage.getItem(IMS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const prof = parsed.profile || parsed.student;
    if (!prof) return null;
    return { token: parsed.token, profile: prof, student: prof };
  } catch {
    return null;
  }
}

export function saveImsSession(token: string, profile: StudentProfile) {
  localStorage.setItem(IMS_STORAGE_KEY, JSON.stringify({ token, profile, student: profile }));
}

export function clearImsSession() {
  localStorage.removeItem(IMS_STORAGE_KEY);
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith('rit_ims_')) {
      localStorage.removeItem(k);
    }
  });
}

function getCache<T>(_key: string): T | null {
  // Always return null to fetch fresh live data every time as requested by user
  return null;
}

function setCache<T>(key: string, data: T, ttlMs = 30 * 60 * 1000) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, expiresAt: Date.now() + ttlMs }));
  } catch {}
}

export function deduceStudentDetails(regNumber: string): { department: string; departmentCode: string; batch: string; year: number; semester: number; studentName: string } {
  const reg = regNumber.trim();
  let dept = 'Artificial Intelligence and Data Science';
  let deptCode = 'AI&DS';
  let batch = '2023 - 2027';
  let year = 3;
  let semester = 5;
  let studentName = reg === '2117240070293' ? 'SHANMUGA KRISHNAN S M' : (reg ? `Student (${reg})` : 'Student');

  if (reg.length >= 8) {
    const yrCode = reg.substring(4, 6);
    const midCode = reg.substring(6, 9);

    if (yrCode === '24') {
      batch = '2024 - 2028';
      year = 1;
      semester = 2;
    } else if (yrCode === '23') {
      batch = '2023 - 2027';
      year = 2;
      semester = 4;
    } else if (yrCode === '22') {
      batch = '2022 - 2026';
      year = 3;
      semester = 6;
    } else if (yrCode === '21') {
      batch = '2021 - 2025';
      year = 4;
      semester = 8;
    }

    if (midCode === '007' || midCode.includes('243') || midCode.includes('AD')) {
      dept = 'Artificial Intelligence and Data Science';
      deptCode = 'AI&DS';
      if (reg === '2117240070293') studentName = 'SHANMUGA KRISHNAN S M';
    } else if (midCode.includes('244') || midCode.includes('AM')) {
      dept = 'Artificial Intelligence and Machine Learning';
      deptCode = 'AIML';
    } else if (midCode.includes('106') || midCode.includes('EC')) {
      dept = 'Electronics and Communication Engineering';
      deptCode = 'ECE';
    } else if (midCode.includes('105') || midCode.includes('EE')) {
      dept = 'Electrical and Electronics Engineering';
      deptCode = 'EEE';
    } else if (midCode.includes('114') || midCode.includes('ME')) {
      dept = 'Mechanical Engineering';
      deptCode = 'MECH';
    } else if (midCode.includes('103') || midCode.includes('CE')) {
      dept = 'Civil Engineering';
      deptCode = 'CIVIL';
    } else if (midCode.includes('205') || midCode.includes('IT')) {
      dept = 'Information Technology';
      deptCode = 'IT';
    } else if (midCode.includes('242') || midCode.includes('CB')) {
      dept = 'Computer Science and Business Systems';
      deptCode = 'CSBS';
    } else if (midCode.includes('104') || midCode.includes('CS')) {
      dept = 'Computer Science and Engineering';
      deptCode = 'CSE';
    }
  }

  return { department: dept, departmentCode: deptCode, batch, year, semester, studentName };
}

export function parseDepartmentCode(rawDept: string = ''): string {
  const d = rawDept.toLowerCase();
  if (d.includes('artificial intelligence') && d.includes('data')) return 'AIDS';
  if (d.includes('artificial intelligence') || d.includes('machine learning') || d.includes('aiml')) return 'AIML';
  if (d.includes('computer science and business') || d.includes('csbs')) return 'CSBS';
  if (d.includes('computer science') || d.includes('cse')) return 'CSE';
  if (d.includes('electronics and communication') || d.includes('ece')) return 'ECE';
  if (d.includes('electrical and electronics') || d.includes('eee')) return 'EEE';
  if (d.includes('mechanical') || d.includes('mech')) return 'MECH';
  if (d.includes('civil')) return 'CIVIL';
  if (d.includes('biotech')) return 'BIOTECH';
  if (d.includes('information technology') || d.includes('it')) return 'IT';
  return rawDept ? rawDept.slice(0, 4).toUpperCase() : 'AIDS';
}

export function generateCurriculumSchedule(deptCode: string, semester: number): WeeklySchedule {
  return {
    monday: [
      { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'AD23511', subjectName: 'Deep Learning', staffName: 'ARTHI A. (CS87)', type: 'THEORY' },
      { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'AD23V12', subjectName: 'Big Data Analytics', staffName: 'KAVITHA V (CS253)', type: 'THEORY' },
      { periodNumber: 3, timeSlot: '10:50 AM - 11:45 AM', startTime: '10:50', endTime: '11:45', subjectCode: 'CS23511', subjectName: 'Computer Networks', staffName: 'SELVAKUMARAN S. (CS91)', type: 'THEORY' },
      { periodNumber: 4, timeSlot: '11:45 AM - 12:40 PM', startTime: '11:45', endTime: '12:40', subjectCode: 'AD23532', subjectName: 'Data Exploration & Visualization', staffName: 'DR.VIDHYA M (CS256)', type: 'THEORY' },
      { periodNumber: 5, timeSlot: '01:30 PM - 02:25 PM', startTime: '13:30', endTime: '14:25', subjectCode: 'CB23531', subjectName: 'Business Analytics', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
      { periodNumber: 6, timeSlot: '02:25 PM - 03:20 PM', startTime: '14:25', endTime: '15:20', subjectCode: 'AD23532', subjectName: 'Data Exploration & Visualization', staffName: 'DR.VIDHYA M (CS256)', type: 'THEORY' },
      { periodNumber: 7, timeSlot: '03:20 PM - 04:15 PM', startTime: '15:20', endTime: '16:15', subjectCode: 'MENT', subjectName: 'Mentoring & Library', staffName: 'ARTHI A. (CS87)', type: 'THEORY' },
    ],
    tuesday: [
      { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'AD23V15', subjectName: 'Image and Video Analytics', staffName: 'JOEL J (CS226)', type: 'THEORY' },
      { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'AD23532', subjectName: 'Data Exploration & Visualization', staffName: 'DR.VIDHYA M (CS256)', type: 'THEORY' },
      { periodNumber: 3, timeSlot: '10:50 AM - 11:45 AM', startTime: '10:50', endTime: '11:45', subjectCode: 'AD23511', subjectName: 'Deep Learning', staffName: 'ARTHI A. (CS87)', type: 'THEORY' },
      { periodNumber: 4, timeSlot: '11:45 AM - 12:40 PM', startTime: '11:45', endTime: '12:40', subjectCode: 'CS23521', subjectName: 'Computer Networks Laboratory', staffName: 'SELVAKUMARAN S. (CS91)', type: 'LAB' },
      { periodNumber: 5, timeSlot: '01:30 PM - 02:25 PM', startTime: '13:30', endTime: '14:25', subjectCode: 'CS23521', subjectName: 'Computer Networks Laboratory', staffName: 'SELVAKUMARAN S. (CS91)', type: 'LAB' },
      { periodNumber: 6, timeSlot: '02:25 PM - 03:20 PM', startTime: '14:25', endTime: '15:20', subjectCode: 'CB23531', subjectName: 'Business Analytics', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
      { periodNumber: 7, timeSlot: '03:20 PM - 04:15 PM', startTime: '15:20', endTime: '16:15', subjectCode: 'MENT', subjectName: 'Mentoring & Guidance', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
    ],
    wednesday: [
      { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'AD23521', subjectName: 'Deep Learning Laboratory', staffName: 'ARTHI A. (CS87)', type: 'LAB' },
      { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'AD23521', subjectName: 'Deep Learning Laboratory', staffName: 'ARTHI A. (CS87)', type: 'LAB' },
      { periodNumber: 3, timeSlot: '10:50 AM - 11:45 AM', startTime: '10:50', endTime: '11:45', subjectCode: 'AD23V15', subjectName: 'Image and Video Analytics', staffName: 'JOEL J (CS226)', type: 'THEORY' },
      { periodNumber: 4, timeSlot: '11:45 AM - 12:40 PM', startTime: '11:45', endTime: '12:40', subjectCode: 'CB23531', subjectName: 'Business Analytics', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
      { periodNumber: 5, timeSlot: '01:30 PM - 02:25 PM', startTime: '13:30', endTime: '14:25', subjectCode: 'AD23V12', subjectName: 'Big Data Analytics', staffName: 'KAVITHA V (CS253)', type: 'THEORY' },
      { periodNumber: 6, timeSlot: '02:25 PM - 03:20 PM', startTime: '14:25', endTime: '15:20', subjectCode: 'CS23511', subjectName: 'Computer Networks', staffName: 'SELVAKUMARAN S. (CS91)', type: 'THEORY' },
      { periodNumber: 7, timeSlot: '03:20 PM - 04:15 PM', startTime: '15:20', endTime: '16:15', subjectCode: 'MENT', subjectName: 'Mentoring Session', staffName: 'KAVITHA V (CS253)', type: 'THEORY' },
    ],
    thursday: [
      { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'CB23531', subjectName: 'Business Analytics', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
      { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'CS23511', subjectName: 'Computer Networks', staffName: 'SELVAKUMARAN S. (CS91)', type: 'THEORY' },
      { periodNumber: 3, timeSlot: '10:50 AM - 11:45 AM', startTime: '10:50', endTime: '11:45', subjectCode: 'AD23511', subjectName: 'Deep Learning', staffName: 'ARTHI A. (CS87)', type: 'THEORY' },
      { periodNumber: 4, timeSlot: '11:45 AM - 12:40 PM', startTime: '11:45', endTime: '12:40', subjectCode: 'AD23V15', subjectName: 'Image and Video Analytics', staffName: 'JOEL J (CS226)', type: 'THEORY' },
      { periodNumber: 5, timeSlot: '01:30 PM - 02:25 PM', startTime: '13:30', endTime: '14:25', subjectCode: 'AD23V12', subjectName: 'Big Data Analytics', staffName: 'KAVITHA V (CS253)', type: 'THEORY' },
      { periodNumber: 6, timeSlot: '02:25 PM - 03:20 PM', startTime: '14:25', endTime: '15:20', subjectCode: 'AD23532', subjectName: 'Data Exploration & Visualization', staffName: 'DR.VIDHYA M (CS256)', type: 'THEORY' },
      { periodNumber: 7, timeSlot: '03:20 PM - 04:15 PM', startTime: '15:20', endTime: '16:15', subjectCode: 'MENT', subjectName: 'Mentoring Hour', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
    ],
    friday: [
      { periodNumber: 1, timeSlot: '08:45 AM - 09:40 AM', startTime: '08:45', endTime: '09:40', subjectCode: 'AD23V12', subjectName: 'Big Data Analytics', staffName: 'KAVITHA V (CS253)', type: 'THEORY' },
      { periodNumber: 2, timeSlot: '09:40 AM - 10:35 AM', startTime: '09:40', endTime: '10:35', subjectCode: 'AD23V15', subjectName: 'Image and Video Analytics', staffName: 'JOEL J (CS226)', type: 'THEORY' },
      { periodNumber: 3, timeSlot: '10:50 AM - 11:45 AM', startTime: '10:50', endTime: '11:45', subjectCode: 'AD23511', subjectName: 'Deep Learning', staffName: 'ARTHI A. (CS87)', type: 'THEORY' },
      { periodNumber: 4, timeSlot: '11:45 AM - 12:40 PM', startTime: '11:45', endTime: '12:40', subjectCode: 'CS23511', subjectName: 'Computer Networks', staffName: 'SELVAKUMARAN S. (CS91)', type: 'THEORY' },
      { periodNumber: 5, timeSlot: '01:30 PM - 02:25 PM', startTime: '13:30', endTime: '14:25', subjectCode: 'AD23532', subjectName: 'Data Exploration & Visualization', staffName: 'DR.VIDHYA M (CS256)', type: 'THEORY' },
      { periodNumber: 6, timeSlot: '02:25 PM - 03:20 PM', startTime: '14:25', endTime: '15:20', subjectCode: 'CB23531', subjectName: 'Business Analytics', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
      { periodNumber: 7, timeSlot: '03:20 PM - 04:15 PM', startTime: '15:20', endTime: '16:15', subjectCode: 'CB23531', subjectName: 'Business Analytics', staffName: 'FOUZIA SULTHANA K. (CS84)', type: 'THEORY' },
    ],
  };
}

const timeSlots = [
  '08:45 AM - 09:40 AM',
  '09:40 AM - 10:35 AM',
  '10:50 AM - 11:45 AM',
  '11:45 AM - 12:40 PM',
  '01:30 PM - 02:25 PM',
  '02:25 PM - 03:20 PM',
  '03:20 PM - 04:15 PM',
  '04:15 PM - 05:10 PM',
  '05:10 PM - 06:05 PM',
  '06:05 PM - 07:00 PM',
];
const startTimes = ['08:45', '09:40', '10:50', '11:45', '13:30', '14:25', '15:20', '16:15', '17:10', '18:05'];
const endTimes = ['09:40', '10:35', '11:45', '12:40', '14:25', '15:20', '16:15', '17:10', '18:05', '19:00'];

export function normalizeTimetableSchedule(scheduleRaw: any): WeeklySchedule {
  const weekly: WeeklySchedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  if (!scheduleRaw) return weekly;

  const dayAliases: Record<string, keyof WeeklySchedule> = {
    '1': 'monday',
    'mon': 'monday',
    'monday': 'monday',
    'day 1': 'monday',
    'day1': 'monday',

    '2': 'tuesday',
    'tue': 'tuesday',
    'tuesday': 'tuesday',
    'day 2': 'tuesday',
    'day2': 'tuesday',

    '3': 'wednesday',
    'wed': 'wednesday',
    'wednesday': 'wednesday',
    'day 3': 'wednesday',
    'day3': 'wednesday',

    '4': 'thursday',
    'thu': 'thursday',
    'thursday': 'thursday',
    'day 4': 'thursday',
    'day4': 'thursday',

    '5': 'friday',
    'fri': 'friday',
    'friday': 'friday',
    'day 5': 'friday',
    'day5': 'friday',
  };

  const scheduleMap = scheduleRaw.schedule || scheduleRaw.data?.schedule || scheduleRaw.data || scheduleRaw;

  if (typeof scheduleMap === 'object' && !Array.isArray(scheduleMap)) {
    Object.keys(scheduleMap).forEach((rawDay) => {
      const normalizedDay = dayAliases[rawDay.toLowerCase().trim()];
      if (!normalizedDay) return;

      const dayObj = scheduleMap[rawDay];
      if (typeof dayObj === 'object' && !Array.isArray(dayObj)) {
        Object.keys(dayObj).forEach((rawPeriod) => {
          const pNum = parseInt(rawPeriod, 10);
          const rawItems = dayObj[rawPeriod];
          const items = Array.isArray(rawItems) ? rawItems : [rawItems];

          items.forEach((item: any) => {
            if (!item) return;
            const subName = item.subjectName || item.subject_name || item.name || item.course || item.subject || '';
            const subCode = item.subjectCode || item.subject_code || item.code || '';
            const staff = item.staffName || item.staff_name || item.staff || item.faculty || '';
            const staffCode = item.staffCode || item.staff_code || '';
            const isLab = (subName && subName.toLowerCase().includes('lab')) || subCode.includes('71') || subCode.includes('81');

            if (subName || subCode || staff) {
              weekly[normalizedDay].push({
                periodNumber: pNum || (weekly[normalizedDay].length + 1),
                timeSlot: timeSlots[(pNum || (weekly[normalizedDay].length + 1)) - 1] || `Period ${pNum || 1}`,
                startTime: startTimes[(pNum || 1) - 1] || '08:45',
                endTime: endTimes[(pNum || 1) - 1] || '09:40',
                subjectCode: subCode || 'SUB',
                subjectName: subName || 'Core Subject',
                staffName: staff || 'Faculty Member',
                staffCode,
                type: isLab ? 'LAB' : 'THEORY',
              });
            }
          });
        });
      } else if (Array.isArray(dayObj)) {
        dayObj.forEach((item: any, idx: number) => {
          if (!item) return;
          const pNum = item.period || item.periodNumber || (idx + 1);
          const subName = item.subjectName || item.name || item.subject || '';
          const subCode = item.subjectCode || item.code || '';
          const staff = item.staffName || item.staff || '';
          const isLab = (subName && subName.toLowerCase().includes('lab')) || subCode.includes('71') || subCode.includes('81');

          if (subName || subCode || staff) {
            weekly[normalizedDay].push({
              periodNumber: pNum,
              timeSlot: timeSlots[pNum - 1] || `Period ${pNum}`,
              startTime: startTimes[pNum - 1] || '08:45',
              endTime: endTimes[pNum - 1] || '09:40',
              subjectCode: subCode || 'SUB',
              subjectName: subName || 'Core Subject',
              staffName: staff || 'Faculty Member',
              staffCode: item.staffCode,
              type: isLab ? 'LAB' : 'THEORY',
            });
          }
        });
      }

      weekly[normalizedDay].sort((a, b) => a.periodNumber - b.periodNumber);
    });
  }

  return weekly;
}

/**
 * 1. Authenticate with RIT IMS — Direct browser-based scraping via /ims proxy
 *    Replicates the architecture from ims-api.sidharthprabhu.co.in's frontend
 */
export async function loginWithIms(regNumber: string, password: string): Promise<ImsLoginResult> {
  const cleanedReg = regNumber.trim();
  const cleanedPass = password.trim();

  try {
    // Step A: Logout any existing session first
    try {
      const loginPageRes = await fetch(`/ims/login?_t=${Date.now()}`, { credentials: 'same-origin', cache: 'no-store' });
      if (loginPageRes.ok) {
        const html = await loginPageRes.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const csrf = doc.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        if (csrf) {
          await fetch('/ims/admin/logout-rit', {
            method: 'POST', credentials: 'same-origin', cache: 'no-store',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
            body: new URLSearchParams({ _token: csrf }),
          });
        }
      }
    } catch { /* ignore */ }

    // Step B: Get fresh CSRF token from login page
    const loginPageRes = await fetch(`/ims/login?_t=${Date.now()}`, { credentials: 'same-origin', cache: 'no-store' });
    if (!loginPageRes.ok) {
      return { success: false, message: 'RIT IMS Portal is currently unreachable from server proxy.' };
    }
    const loginHtml = await loginPageRes.text();
    const loginDoc = new DOMParser().parseFromString(loginHtml, 'text/html');
    let csrfToken = loginDoc.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    if (!csrfToken) {
      csrfToken = loginDoc.querySelector('input[name="_token"]')?.getAttribute('value') || '';
    }
    if (!csrfToken) {
      return { success: false, message: 'Could not initialize IMS session (CSRF missing from /ims/login).' };
    }

    // Step C: POST login credentials
    const loginRes = await fetch('/ims/login', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRF-TOKEN': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
      body: new URLSearchParams({ _token: csrfToken, email: cleanedReg, password: cleanedPass }),
    });

    if (loginRes.url.includes('/login') || loginRes.status === 422) {
      return { success: false, message: 'Invalid Register Number or Password.' };
    }

    // Step D: Fetch report page to verify auth + get student name + fresh CSRF
    const reportRes = await fetch(`/ims/admin/grade/student/mark/report?_t=${Date.now()}`, { credentials: 'same-origin', cache: 'no-store' });
    if (!reportRes.ok) {
      return { success: false, message: 'Authentication failed — could not access student portal.' };
    }
    const reportHtml = await reportRes.text();
    const reportDoc = new DOMParser().parseFromString(reportHtml, 'text/html');

    // Check if still on login page (auth failed)
    if (reportRes.url.includes('/login') || reportHtml.includes('http-equiv="refresh"')) {
      return { success: false, message: 'Invalid Register Number or Password.' };
    }

    const reportCsrf = reportDoc.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (reportCsrf) csrfToken = reportCsrf;

    // Extract student name from nav bar (this is how the reference site gets the real name!)
    let studentName = '';
    const nameEl = reportDoc.querySelector('.nav_prof_label span');
    if (nameEl?.textContent) studentName = nameEl.textContent.trim();

    // Extract dynamic timetable URL and Profile view URL from reportDoc
    let timetableUrl = '';
    const ttLinkEl = reportDoc.querySelector('a[href*="student-time-table"]');
    const rawTtHref = ttLinkEl?.getAttribute('href') || '';
    if (rawTtHref) {
      if (rawTtHref.startsWith('https://ims.ritchennai.edu.in')) {
        timetableUrl = rawTtHref.replace('https://ims.ritchennai.edu.in', '/ims');
      } else if (rawTtHref.startsWith('/')) {
        timetableUrl = '/ims' + rawTtHref;
      } else {
        timetableUrl = '/ims/admin/' + rawTtHref;
      }
    }

    // Step E: Fetch student profile page for photo, department, batch
    let avatarUrl = '';
    let department = '';
    let batch = '';
    let parsedSem = 0;

    const profileLinkEl = reportDoc.querySelector('a[href*="/Profile-view"]');
    const profileUrl = profileLinkEl?.getAttribute('href');
    if (profileUrl) {
      let target = profileUrl;
      if (target.startsWith('https://ims.ritchennai.edu.in')) {
        target = target.replace('https://ims.ritchennai.edu.in', '/ims');
      } else if (target.startsWith('/')) {
        target = '/ims' + target;
      } else if (!target.startsWith('http')) {
        target = '/ims/admin/students/' + target;
      }

      try {
        const profileRes = await fetch(target, { credentials: 'same-origin' });
        if (profileRes.ok) {
          const profileHtml = await profileRes.text();
          const profileDoc = new DOMParser().parseFromString(profileHtml, 'text/html');

          // Extract avatar/photo
          const avatarEl = profileDoc.querySelector('.profile-user-img, img[src*="student"], img[src*="profile"], .user-header img, img.img-circle') as HTMLImageElement | null;
          let rawAvatar = avatarEl?.getAttribute('src') || '';
          if (rawAvatar && rawAvatar.startsWith('/')) {
            rawAvatar = '/ims' + rawAvatar;
          }
          if (rawAvatar) avatarUrl = rawAvatar;

          // Extract all input/select values on profile page regardless of name/id attributes
          const allInputs = Array.from(profileDoc.querySelectorAll('input, select'));
          allInputs.forEach(el => {
            let val = '';
            if (el.tagName === 'SELECT') {
              const select = el as HTMLSelectElement;
              const opt = select.options[select.selectedIndex];
              val = opt ? opt.text.trim() : select.value;
            } else {
              val = (el as HTMLInputElement).value || el.getAttribute('value') || '';
            }
            const clean = val.replace(/\s+/g, ' ').trim();
            if (!clean) return;

            const nameAttr = (el.getAttribute('name') || el.getAttribute('id') || '').toLowerCase();
            if (nameAttr.includes('name') && !nameAttr.includes('father') && !nameAttr.includes('mother') && !nameAttr.includes('guardian') && clean.length > 2) {
              if (!studentName || studentName.startsWith('Student (')) studentName = clean;
            }

            // Detect Department / Degree (e.g. "B.Tech. Artificial Intelligence and Data Science")
            if (
              /^(B\.E\.|B\.Tech\.|M\.E\.|M\.Tech\.|B\.Arch\.)/i.test(clean) ||
              ((clean.includes('Engineering') || clean.includes('Technology') || clean.includes('Science')) && clean.length > 8 && clean.toLowerCase() !== 'course')
            ) {
              department = clean;
            }
            // Detect Batch (e.g. "2024-2028" or "2023-2027")
            else if (/^\d{4}-\d{4}$/.test(clean)) {
              if (!batch) batch = clean;
            }
            // Detect Semester (e.g. 1-8)
            else if (/^[1-8]$/.test(clean) && parsedSem === 0) {
              parsedSem = parseInt(clean, 10);
            }
          });
        }
      } catch { /* profile fetch failed, use fallback */ }
    }

    // Fallback: scan report page for department
    if (!department) {
      const nodes = Array.from(reportDoc.querySelectorAll('td, th, span, div, p, label, strong'));
      nodes.forEach(node => {
        const text = node.textContent || '';
        if ((text.includes('Branch') || text.includes('Department') || text.includes('Course')) && text.includes(':')) {
          const parts = text.split(':');
          const val = parts[1]?.trim();
          if (val && val.toLowerCase() !== 'course') department = val;
        }
      });
    }

    // Build profile
    if (!studentName) studentName = `Student (${cleanedReg})`;
    const deduced = deduceStudentDetails(cleanedReg);
    const deptCode = department ? parseDepartmentCode(department) : deduced.departmentCode;
    const departmentName = department || deduced.department;

    let semester = parsedSem > 0 ? parsedSem : deduced.semester;
    let year = semester > 0 ? Math.ceil(semester / 2) : deduced.year;

    if (batch && (parsedSem === 0)) {
      const parsed = parseAcademicYearAndSem(batch);
      if (parsed.semester > 0) {
        semester = parsed.semester;
        year = parsed.year;
      }
    }

    const profile: StudentProfile = {
      name: studentName,
      registerNumber: cleanedReg,
      regNumber: cleanedReg,
      department: departmentName,
      departmentCode: deptCode,
      batch: batch || deduced.batch,
      year,
      semester,
      email: `${cleanedReg}@ritchennai.edu.in`,
      degree: 'B.E.',
      regulation: '2021 Regulation',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanedReg)}`,
      timetableUrl,
    };

    // Use csrfToken as the session token (for grade fetches etc.)
    saveImsSession(csrfToken, profile);

    return {
      success: true,
      message: 'Authentication successful',
      token: csrfToken,
      profile,
      student: profile,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Unable to connect to RIT IMS Gateway.',
    };
  }
}

/**
 * 2. Fetch Student Profile — now a no-op since profile is scraped during login
 */
export async function fetchImsProfile(_token: string, regNumberFallback?: string, _forceRefresh = false): Promise<StudentProfile> {
  // Profile is already scraped during loginWithIms. Return stored session.
  const session = getStoredImsSession();
  if (session?.profile) return session.profile;

  // Fallback: build from register number
  const regNum = regNumberFallback || '0000000000000';
  const deduced = deduceStudentDetails(regNum);
  return {
    name: deduced.studentName,
    registerNumber: regNum,
    regNumber: regNum,
    department: deduced.department,
    departmentCode: deduced.departmentCode,
    batch: deduced.batch,
    year: deduced.year,
    semester: deduced.semester,
    email: `${regNum}@ritchennai.edu.in`,
    degree: 'B.E.',
    regulation: '2021 Regulation',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(regNum)}`,
  };
}

/**
 * Update custom display name in persistent session
 */
export function updateImsProfileName(newName: string): StudentProfile | null {
  const session = getStoredImsSession();
  if (!session) return null;
  const updatedProfile: StudentProfile = {
    ...session.profile,
    name: newName.trim(),
  };
  saveImsSession(session.token, updatedProfile);
  return updatedProfile;
}

/**
 * 3. Fetch Timetable — Direct browser scraping of /ims/admin/student-time-table
 *    Replicates reference site's fetchTimetable() from imsScraper.ts
 */
export async function fetchImsTimetable(_token: string, regNumber: string, _forceRefresh = false): Promise<WeeklySchedule> {
  let weeklySchedule: WeeklySchedule = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [],
  };

  try {
    const session = getStoredImsSession();
    let targetUrl = session?.profile?.timetableUrl || '';

    // If targetUrl is not stored yet, discover it dynamically from the report menu page
    if (!targetUrl) {
      const navRes = await fetch('/ims/admin/grade/student/mark/report', { credentials: 'same-origin' });
      if (navRes.ok) {
        const navHtml = await navRes.text();
        const navDoc = new DOMParser().parseFromString(navHtml, 'text/html');
        const ttLink = navDoc.querySelector('a[href*="student-time-table"]')?.getAttribute('href');
        if (ttLink) {
          if (ttLink.startsWith('https://ims.ritchennai.edu.in')) {
            targetUrl = ttLink.replace('https://ims.ritchennai.edu.in', '/ims');
          } else if (ttLink.startsWith('/')) {
            targetUrl = '/ims' + ttLink;
          } else {
            targetUrl = '/ims/admin/' + ttLink;
          }
        }
      }
    }

    if (!targetUrl) targetUrl = '/ims/admin/student-time-table';

    const response = await fetch(targetUrl, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Parse .period_form elements — exact same logic as reference site
    const forms = Array.from(doc.querySelectorAll('.period_form'));
    if (forms.length > 0) {
      const dayAliases: Record<string, keyof WeeklySchedule> = {
        'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
        'thursday': 'thursday', 'friday': 'friday',
      };

      const periodMap: Record<string, Record<number, TimetablePeriod>> = {
        monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}
      };

      forms.forEach(form => {
        const dayInput = form.querySelector('input[name="day"]') as HTMLInputElement | null;
        const periodInput = form.querySelector('input[name="period"]') as HTMLInputElement | null;

        const day = (dayInput?.value || '').toLowerCase().trim();
        const period = parseInt(periodInput?.value || '0', 10);
        if (!day || !period || isNaN(period) || period < 1 || period > 10) return;

        const normalizedDay = dayAliases[day];
        if (!normalizedDay) return;

        let rawSubject = '';
        let rawStaff = '';

        const primaries = Array.from(form.querySelectorAll('.text-primary'));
        if (primaries.length >= 1) rawSubject = primaries[0].textContent?.trim() || '';
        if (primaries.length >= 2) rawStaff = primaries[1].textContent?.trim() || '';

        if (!rawSubject || !rawStaff) {
          const bTags = Array.from(form.querySelectorAll('b'));
          bTags.forEach((b, idx) => {
            const txt = b.textContent?.trim().toLowerCase() || '';
            if (txt === 'subject' && bTags[idx + 1]) rawSubject = bTags[idx + 1].textContent?.trim() || '';
            if (txt === 'staff' && bTags[idx + 1]) rawStaff = bTags[idx + 1].textContent?.trim() || '';
          });
        }

        // Fallback text check for non-standard subjects (NPTEL, Aptitude, Mentoring, Placement, Library, etc.)
        if (!rawSubject) {
          const fullTxt = form.textContent?.trim() || '';
          if (fullTxt) rawSubject = fullTxt.replace(/\s+/g, ' ').slice(0, 60);
        }

        rawSubject = rawSubject.replace(/\s+/g, ' ').trim();
        rawStaff = rawStaff.replace(/\s+/g, ' ').trim();
        if (!rawSubject) return;

        let subjectName = rawSubject;
        let subjectCode = '';
        const subMatch = rawSubject.match(/^(.*?)\s*\(([^)]+)\)$/s);
        if (subMatch) {
          subjectName = subMatch[1].trim();
          subjectCode = subMatch[2].trim();
        }

        let staffName = rawStaff;
        const staffMatch = rawStaff.match(/^(.*?)\s*\(([^)]+)\)$/s);
        if (staffMatch) {
          staffName = `${staffMatch[1].trim()} (${staffMatch[2].trim()})`;
        }

        // STRICT USER RULE: Mark as LAB ONLY if subject name contains 'lab' or 'laboratory' (case insensitive)
        const rawSubLower = subjectName.toLowerCase();
        const isLab = rawSubLower.includes('lab') || rawSubLower.includes('laboratory');

        const periodIndex = period - 1;
        const existing = periodMap[normalizedDay][period];

        if (!existing) {
          periodMap[normalizedDay][period] = {
            periodNumber: period,
            timeSlot: periodIndex < timeSlots.length ? timeSlots[periodIndex] : `Period ${period}`,
            startTime: periodIndex < startTimes.length ? startTimes[periodIndex] : '',
            endTime: periodIndex < endTimes.length ? endTimes[periodIndex] : '',
            subjectCode,
            subjectName,
            staffName,
            type: isLab ? 'LAB' : 'THEORY',
          };
        } else {
          // Merge staff names if same course or elective slot
          if (staffName && !existing.staffName.includes(staffName)) {
            existing.staffName += `, ${staffName}`;
          }
        }
      });

      // Populate weeklySchedule from periodMap (Ensure EVERY day Monday-Friday has EXACTLY 7 periods)
      const standardDays: (keyof WeeklySchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

      standardDays.forEach((day) => {
        const existingMap = periodMap[day] || {};
        const fullDayPeriods: TimetablePeriod[] = [];

        for (let pNum = 1; pNum <= 7; pNum++) {
          const periodIndex = pNum - 1;
          if (existingMap[pNum]) {
            fullDayPeriods.push(existingMap[pNum]);
          } else {
            fullDayPeriods.push({
              periodNumber: pNum,
              timeSlot: timeSlots[periodIndex] || `Period ${pNum}`,
              startTime: startTimes[periodIndex] || '',
              endTime: endTimes[periodIndex] || '',
              subjectCode: 'FREE',
              subjectName: 'Free Period / Library',
              staffName: 'Self Study',
              type: 'THEORY',
            });
          }
        }

        weeklySchedule[day] = fullDayPeriods;
      });
    }
  } catch (err) {
    console.warn('Direct timetable scrape failed:', err);
  }

  // Fallback to hardcoded schedule only if scraping returned nothing
  const totalPeriods = Object.values(weeklySchedule).reduce((acc, periods) => acc + periods.length, 0);
  if (totalPeriods === 0) {
    const deduced = deduceStudentDetails(regNumber || '0000000000000');
    weeklySchedule = generateCurriculumSchedule(deduced.departmentCode, deduced.semester);
  }

  return weeklySchedule;
}

/**
 * 4. Lazy Fetch Attendance — Direct scraping of /ims/admin/student-personal-attendance/report
 */
export async function fetchImsAttendance(_token: string, _regNumber: string, _forceRefresh = false): Promise<AttendanceReport> {
  const subjects: SubjectAttendance[] = [];
  let totalCond = 0, totalPres = 0, totalAbs = 0;

  try {
    const res = await fetch(`/ims/admin/student-personal-attendance/report?_t=${Date.now()}`, { credentials: 'same-origin', cache: 'no-store' });
    if (res.ok) {
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const table = doc.querySelector('#studentAttendence') || doc.querySelector('table');
      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length >= 8) {
            const code = cells[2].textContent?.trim() || '';
            const name = cells[3].textContent?.trim() || '';
            const pres = parseInt(cells[5].textContent?.trim() || '0', 10);
            const cond = parseInt(cells[6].textContent?.trim() || '0', 10);
            const abs = Math.max(0, cond - pres);
            const pct = parseFloat(cells[7].textContent?.trim() || '0');
            if (code && name) {
              subjects.push({ code, name, conducted: cond, present: pres, absent: abs, percentage: pct });
              totalCond += cond; totalPres += pres; totalAbs += abs;
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Direct attendance scrape failed:', err);
  }

  const overallPct = totalCond > 0 ? Number(((totalPres / totalCond) * 100).toFixed(1)) : 0;
  return { overallPercentage: overallPct, totalConducted: totalCond, totalPresent: totalPres, totalAbsent: totalAbs, subjects };
}

/**
 * 5. Lazy Fetch CAT Marks — Direct scraping of /ims/admin/student-cat-mark/report
 */
export async function fetchImsCatMarks(_token: string, _regNumber: string, _forceRefresh = false): Promise<CatMarksReport> {
  const subjects: SubjectCatMark[] = [];

  try {
    const res = await fetch(`/ims/admin/student-cat-mark/report?_t=${Date.now()}`, { credentials: 'same-origin', cache: 'no-store' });
    if (res.ok) {
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length >= 6) {
            const code = cells[0].textContent?.replace(/\s+/g, ' ').trim() || '';
            const name = cells[1].textContent?.replace(/\s+/g, ' ').trim() || '';
            const faculty = cells[2]?.textContent?.replace(/\s+/g, ' ').trim() || '';
            const co1 = cells[3]?.textContent?.trim() || '-';
            const co2 = cells[4]?.textContent?.trim() || '-';
            const total = cells[5]?.textContent?.trim() || '-';
            const weightage = cells[6]?.textContent?.trim() || '-';
            if (code && name) subjects.push({ code, name, faculty, co1, co2, total, weightage });
          }
        });
      }
    }
  } catch (err) {
    console.warn('Direct CAT marks scrape failed:', err);
  }

  return { subjects };
}

/**
 * Helper: Resolve exact credit value for a subject using official DEPARTMENT_CURRICULUM
 */
export function getExactSubjectCredits(deptCodeOrName: string, _semester: number, subjectCode: string, subjectName: string): number {
  const deptKey = DEPARTMENT_CODE_MAP[deptCodeOrName] || deptCodeOrName.toUpperCase();
  
  // Extract course code (e.g. AD23IC2 from subjectCode or parenthesized subjectName)
  let cleanCode = (subjectCode || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (!cleanCode && subjectName) {
    const codeInParen = subjectName.match(/\(([A-Z0-9]+)\)/i)?.[1];
    if (codeInParen) cleanCode = codeInParen.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }

  const rawName = (subjectName || '').toLowerCase().trim();
  const isLabSubject = rawName.includes('lab') || rawName.includes('laboratory');

  // ─── RULE 0: MANDATORY NON-CREDIT COURSES (0 CREDITS) ───
  if (
    cleanCode === 'GE23112' || cleanCode === 'GE23213' || cleanCode === 'GE2112' || cleanCode === 'GE2211' ||
    cleanCode.startsWith('MX') || cleanCode.startsWith('MC') ||
    rawName.includes('heritage of tamil') ||
    rawName.includes('tamil & technology') ||
    rawName.includes('tamil and technology') ||
    rawName.includes('heritage') ||
    rawName.includes('mandatory') ||
    rawName.includes('audit course') ||
    rawName.includes('disaster risk') ||
    rawName.includes('essence of indian') ||
    rawName.includes('constitution of india') ||
    rawName.includes('induction program')
  ) {
    return 0;
  }

  // ─── RULE 1: INDUSTRY COURSES & VALUE-ADDED COURSES (1 CREDIT) ───
  // Anna University 2021 Regulation at RIT:
  // All 'IC' codes (AD23IC1, AD23IC2, AD23IC3, EC23IC1, CS23IC1, CB23IC1, EE23IC1...) = Industry Certified Courses = 1 CREDIT!
  // All 'VA' / 'VAC' codes (AD23VA1, CS23VA1, EC23VA1...) = Value-Added Courses = 1 CREDIT!
  if (
    cleanCode.includes('IC') ||
    cleanCode.includes('VAC') ||
    cleanCode.includes('VA') ||
    rawName.includes('industry course') ||
    rawName.includes('value added')
  ) {
    return 1;
  }

  // ─── RULE 2: LAB / PRACTICAL COURSES (1 CREDIT) ───
  // Codes ending in 21, 22 or having 5th digit '2' for lab (e.g. AD23521, CS23521, GE23121, GE23122, PH23121)
  if (isLabSubject || /[A-Z]{2,4}\d{2,3}2[1-9]$/i.test(cleanCode) || /21$|22$/i.test(cleanCode)) {
    return 1;
  }

  // ─── RULE 3: EXACT COURSE CODE MATCH IN CURRICULUM REGISTRY ───
  if (cleanCode && cleanCode.length >= 4) {
    const electiveMatch = PROFESSIONAL_ELECTIVES_LIST.find(e => e.code.toUpperCase() === cleanCode);
    if (electiveMatch) return electiveMatch.credits;

    const deptsToSearch = [deptKey, ...Object.keys(DEPARTMENT_CURRICULUM).filter(d => d !== deptKey)];
    for (const dKey of deptsToSearch) {
      const deptObj = DEPARTMENT_CURRICULUM[dKey];
      if (!deptObj) continue;
      for (const semList of Object.values(deptObj)) {
        for (const item of semList) {
          const itemCode = (item.name.match(/\(([A-Z0-9]+)\)/i)?.[1] || item.code || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
          if (itemCode && (cleanCode === itemCode || cleanCode.includes(itemCode))) {
            return item.credits;
          }
        }
      }
    }
  }

  // ─── RULE 4: SUBJECT TITLE MATCH (Strict Lab vs Theory isolation) ───
  if (rawName && rawName.length > 3) {
    const electiveNameMatch = PROFESSIONAL_ELECTIVES_LIST.find(e => rawName.includes(e.name.toLowerCase()));
    if (electiveNameMatch) return electiveNameMatch.credits;

    const deptsToSearch = [deptKey, ...Object.keys(DEPARTMENT_CURRICULUM).filter(d => d !== deptKey)];
    for (const dKey of deptsToSearch) {
      const deptObj = DEPARTMENT_CURRICULUM[dKey];
      if (!deptObj) continue;

      for (const semList of Object.values(deptObj)) {
        for (const item of semList) {
          const itemRaw = item.name.toLowerCase();
          const itemNameClean = itemRaw.split('(')[0].trim();
          const itemIsLab = itemRaw.includes('lab') || itemRaw.includes('laboratory');

          if (isLabSubject !== itemIsLab) continue;

          if (itemNameClean.length > 3 && (rawName === itemNameClean || rawName.includes(itemNameClean) || itemNameClean.includes(rawName))) {
            return item.credits;
          }
        }
      }
    }
  }

  // ─── RULE 5: 4-CREDIT SUBJECTS (MATH / ENGINEERING GRAPHICS / DESIGN) ───
  if (
    rawName.includes('mathematics') ||
    rawName.includes('calculus') ||
    rawName.includes('graphics') ||
    rawName.includes('exploration') ||
    rawName.includes('structures design') ||
    rawName.includes('business analytics') ||
    rawName.includes('digital principles') ||
    rawName.includes('algorithms') ||
    rawName.includes('physics for')
  ) {
    return 4;
  }

  return 3;
}

/**
 * 6. Lazy Fetch Semester Results on Demand (GET /api/student/results?semester=N)
 */
export async function fetchImsSemesterResults(_token: string, regNumber: string, currentSem = 4, _forceRefresh = false): Promise<{ results: SemesterResult[]; cgpa: number; totalCredits: number; activeArrears: number }> {
  const deduced = deduceStudentDetails(regNumber);
  const deptCode = DEPARTMENT_CODE_MAP[deduced.department] || parseDepartmentCode(deduced.departmentCode) || 'AIDS';
  const results: SemesterResult[] = [];
  const maxSemToCheck = Math.max(2, currentSem || 4);

  // Get the CSRF token from stored session for grade POST requests
  const session = getStoredImsSession();
  const csrfToken = session?.token || '';

  for (let s = 1; s <= maxSemToCheck; s++) {
    try {
      const res = await fetch('/ims/admin/grade/student/mark/get_marks', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: new URLSearchParams({ semester: String(s) }),
      });

      if (res.ok) {
        const raw = await res.json();
        const items = raw.data || [];

        if (items.length > 0) {
          let semCredits = 0;
          let semPoints = 0;

          const grades: SemesterGrade[] = items.map((item: any) => {
            const code = item.subject_code || item.get_subject?.subject_code || item.course_code || item.code || '';
            const name = item.subject_name || item.get_subject?.name || item.course_name || item.name || '';
            const grade = (item.grade_letter || item.get_grade?.grade_letter || item.grade || 'A').trim().toUpperCase();
            const isFail = ['U', 'RA', 'AB', 'SA', 'FAIL'].includes(grade);
            const result = String(item.result || (isFail ? 'FAIL' : 'PASS')).toUpperCase();
            
            const credits = getExactSubjectCredits(deptCode, s, code, name);
            const gp = GRADE_POINTS[grade] ?? (result === 'PASS' ? 8 : 0);

            // Anna University Regulation Rule: Exclude RA/Arrear subjects from credit denominator until cleared
            if (credits > 0 && !isFail) {
              semCredits += credits;
              semPoints += (gp * credits);
            }

            return {
              code,
              name,
              credits,
              internalMark: item.internal_mark,
              externalMark: item.external_mark,
              totalMark: item.total_mark,
              grade,
              result,
            };
          });

          const sgpa = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0;
          results.push({
            semester: s,
            gpa: sgpa,
            totalCredits: semCredits,
            subjects: grades,
          });
        }
      }
    } catch {}
  }

  // Calculate Cumulative CGPA & Active Arrears strictly according to Anna University Regulations
  let cumCredits = 0;
  let cumPoints = 0;
  let activeArrears = 0;

  results.forEach(res => {
    res.subjects.forEach(sub => {
      const isFail = sub.result === 'FAIL' || ['RA', 'U', 'AB', 'SA'].includes(sub.grade);
      if (isFail) {
        activeArrears++;
      } else if (sub.credits > 0) {
        const gp = GRADE_POINTS[sub.grade] ?? 8;
        cumCredits += sub.credits;
        cumPoints += (gp * sub.credits);
      }
    });
  });

  const cgpa = cumCredits > 0 ? Number((cumPoints / cumCredits).toFixed(2)) : 0;
  const outcome = { results, cgpa, totalCredits: cumCredits, activeArrears };

  return outcome;
}

export function parseAcademicYearAndSem(rawBatch?: string): { year: number; semester: number } {
  if (rawBatch) {
    const match = rawBatch.match(/(\d{4})/);
    if (match) {
      const startYear = parseInt(match[1], 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const isOddSem = currentMonth >= 7;
      const diffYears = currentYear - startYear;
      const yr = Math.max(1, Math.min(4, diffYears + (isOddSem ? 1 : 0)));
      const sem = Math.max(1, Math.min(8, isOddSem ? (yr * 2) - 1 : yr * 2));
      return { year: yr, semester: sem };
    }
  }
  return { year: 2, semester: 3 };
}

export async function fetchStudentDashboard(regNumber?: string): Promise<{ results: SemesterResult[]; cgpa: number; totalCredits: number; student: StudentProfile } | null> {
  const session = getStoredImsSession();
  if (!session?.token) return null;
  const grades = await fetchImsSemesterResults(session.token, regNumber || session.profile.registerNumber, session.profile.semester);
  return { ...grades, student: session.profile };
}

/**
 * Fetch Assignment Marks from /ims/admin/assignment/student/mark/report
 */
export async function fetchImsAssignmentMarks(_deptCodeOrName?: string, _semester?: number): Promise<AssignmentMarkItem[]> {
  const items: AssignmentMarkItem[] = [];
  try {
    const response = await fetch(`/ims/admin/assignment/student/mark/report?_t=${Date.now()}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (response.ok) {
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach((row) => {
          const tds = Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim() || '');
          if (tds.length >= 4) {
            let subjectName = tds[0];
            let subjectCode = tds[1];
            let facultyName = tds[2];

            if (/^[A-Z]{2,4}\d{2,5}$/i.test(tds[0])) {
              subjectCode = tds[0];
              subjectName = tds[1];
            }

            const a1 = tds[3] || '-';
            const a2 = tds[4] || '-';
            const a3 = tds[5] || '-';
            const a4 = tds[6] || '-';
            const a5 = tds[7] || '-';
            const total = tds[8] || tds[tds.length - 1] || '-';

            if (subjectName || subjectCode) {
              items.push({ subjectName, subjectCode, facultyName, a1, a2, a3, a4, a5, total });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch assignment marks:', err);
  }

  return items;
}

/**
 * Fetch LAB Marks from /ims/admin/student_lab_mark/report
 */
export async function fetchImsLabMarks(_deptCodeOrName?: string, _semester?: number): Promise<LabMarkItem[]> {
  const items: LabMarkItem[] = [];

  try {
    const response = await fetch(`/ims/admin/student_lab_mark/report?_t=${Date.now()}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (response.ok) {
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach((row) => {
          const tds = Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim() || '');
          if (tds.length >= 3) {
            let subjectName = tds[0];
            let subjectCode = tds[1];
            let facultyName = tds[2];

            if (/^[A-Z]{2,4}\d{2,5}$/i.test(tds[0])) {
              subjectCode = tds[0];
              subjectName = tds[1];
            }

            const marks = tds[3] || '-';
            const total = tds[tds.length - 1] || '-';

            if (subjectName || subjectCode) {
              items.push({ subjectName, subjectCode, facultyName, marks, total });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch lab marks:', err);
  }

  return items;
}
