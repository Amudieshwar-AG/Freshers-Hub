import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Search, Plus, RefreshCw, ExternalLink, Code2,
  Sparkles, Flame, Award, CheckCircle2, Shield, ShieldCheck, User, Filter, X, Clock, Lock, Calendar,
  Upload, FileText, Check, Database, Cpu, Cloud, ShieldAlert, GraduationCap,
  Eye, Trash2, CheckCheck, ChevronDown, Download, Zap, Target, Mail, KeyRound
} from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface LeetcodeProfile {
  id: number;
  studentName: string;
  leetcodeUsername: string;
  department: string;
  year: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  reputation: number;
  lastUpdated: string;
}

interface SkillrackProfile {
  id: number;
  studentName: string;
  skillrackEmail: string;
  department: string;
  year: string;
  totalPoints: number;
  codeTestSolved: number;
  codeTutorSolved: number;
  codeTrackSolved: number;
  dcSolved: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  lastUpdated: string;
}

export type CertDomain =
  | 'AI & Machine Learning'
  | 'Database & MongoDB'
  | 'Cloud & DevOps'
  | 'Cybersecurity'
  | 'Full Stack & Web'
  | 'Software Engineering';

interface StudentCertification {
  id: string;
  studentName: string;
  regNumber: string;
  title: string;
  domain: CertDomain;
  issuingBody: string;
  issueDate: string;
  credentialUrl?: string;
  fileName?: string;
  fileDataUrl?: string; // Stored Base64 Image/PDF string
  status: 'Verified' | 'Pending Verification';
}

const DEPARTMENTS = ['All', 'CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSBS'];
const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

// ─────────────────────────────────────────────────────────────
// Initial Mock Datasets
// ─────────────────────────────────────────────────────────────

const MOCK_CERTIFICATE_IMAGE =
  'https://images.unsplash.com/photo-1589330694653-aded6fad0ad1?q=80&w=1000&auto=format&fit=crop';

const INITIAL_CERTIFICATIONS: StudentCertification[] = [
  { id: 'cert-1', studentName: 'S DEVESH', regNumber: '211722010042', title: 'Deep Learning Specialization', domain: 'AI & Machine Learning', issuingBody: 'Coursera / DeepLearning.AI', issueDate: 'Jan 2026', credentialUrl: 'https://coursera.org/verify/dl-spec', status: 'Verified' },
  { id: 'cert-2', studentName: 'S DEVESH', regNumber: '211722010042', title: 'TensorFlow Developer Certificate', domain: 'AI & Machine Learning', issuingBody: 'Google', issueDate: 'Nov 2025', credentialUrl: 'https://google.accredible.com/tf-dev', status: 'Verified' },
  { id: 'cert-3', studentName: 'S DEVESH', regNumber: '211722010042', title: 'Generative AI Engineering with LLMs', domain: 'AI & Machine Learning', issuingBody: 'AWS & Coursera', issueDate: 'Feb 2026', credentialUrl: 'https://coursera.org/verify/genai-aws', status: 'Verified' },
  { id: 'cert-4', studentName: 'S DEVESH', regNumber: '211722010042', title: 'Computer Vision Masterclass', domain: 'AI & Machine Learning', issuingBody: 'NPTEL IIT Madras', issueDate: 'Dec 2025', credentialUrl: 'https://nptel.ac.in/noc/Ecert_PK', status: 'Verified' },
  { id: 'cert-5', studentName: 'S DEVESH', regNumber: '211722010042', title: 'MongoDB Certified Associate Developer', domain: 'Database & MongoDB', issuingBody: 'MongoDB University', issueDate: 'Jan 2026', credentialUrl: 'https://university.mongodb.com/cert/associate', status: 'Verified' },
  { id: 'cert-6', studentName: 'S DEVESH', regNumber: '211722010042', title: 'Database Management Systems & SQL', domain: 'Database & MongoDB', issuingBody: 'Oracle / NPTEL', issueDate: 'Oct 2025', credentialUrl: 'https://nptel.ac.in/noc/dbms', status: 'Verified' },
  { id: 'cert-7', studentName: 'S DEVESH', regNumber: '211722010042', title: 'Redis Data Structures & Caching', domain: 'Database & MongoDB', issuingBody: 'Redis University', issueDate: 'Feb 2026', credentialUrl: 'https://university.redis.com/certs', status: 'Verified' },
  { id: 'cert-8', studentName: 'S DEVESH', regNumber: '211722010042', title: 'AWS Certified Solutions Architect - Associate', domain: 'Cloud & DevOps', issuingBody: 'Amazon Web Services', issueDate: 'Dec 2025', credentialUrl: 'https://aws.amazon.com/verification', status: 'Verified' },
  { id: 'cert-9', studentName: 'S DEVESH', regNumber: '211722010042', title: 'Docker & Kubernetes Fundamentals', domain: 'Cloud & DevOps', issuingBody: 'Linux Foundation', issueDate: 'Jan 2026', credentialUrl: 'https://training.linuxfoundation.org/verify', status: 'Verified' },
  { id: 'cert-10', studentName: 'S DEVESH', regNumber: '211722010042', title: 'CompTIA Security+ Certification', domain: 'Cybersecurity', issuingBody: 'CompTIA', issueDate: 'Nov 2025', credentialUrl: 'https://comptia.org/verify', status: 'Verified' },
  { id: 'cert-11', studentName: 'S DEVESH', regNumber: '211722010042', title: 'Meta Front-End Developer Specialization', domain: 'Full Stack & Web', issuingBody: 'Meta / Coursera', issueDate: 'Jan 2026', credentialUrl: 'https://coursera.org/verify/meta-frontend', status: 'Verified' },
  { id: 'cert-12', studentName: 'S DEVESH', regNumber: '211722010042', title: 'React & Next.js Professional Developer', domain: 'Full Stack & Web', issuingBody: 'Vercel Academy', issueDate: 'Feb 2026', credentialUrl: 'https://vercel.com/academy/certs', status: 'Verified' },
];

// ─────────────────────────────────────────────────────────────
// Custom Modern Floating Dropdown Component (Matching Figure 2 Navbar Style)
// ─────────────────────────────────────────────────────────────
interface DomainOption {
  value: string;
  label: string;
  count: number;
  icon: any;
  color: string;
}

function CustomDomainDropdown({
  selectedDomain,
  onSelectDomain,
  totalCerts,
  counts,
}: {
  selectedDomain: string;
  onSelectDomain: (val: string) => void;
  totalCerts: number;
  counts: Record<CertDomain, number>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: DomainOption[] = [
    { value: 'ALL', label: 'All Technology Domains', count: totalCerts, icon: Award, color: 'text-[#FF6B00]' },
    { value: 'AI & Machine Learning', label: 'AI & Machine Learning', count: counts['AI & Machine Learning'], icon: Cpu, color: 'text-purple-400' },
    { value: 'Database & MongoDB', label: 'Database & MongoDB', count: counts['Database & MongoDB'], icon: Database, color: 'text-emerald-400' },
    { value: 'Cloud & DevOps', label: 'Cloud & DevOps', count: counts['Cloud & DevOps'], icon: Cloud, color: 'text-sky-400' },
    { value: 'Cybersecurity', label: 'Cybersecurity', count: counts['Cybersecurity'], icon: ShieldAlert, color: 'text-rose-400' },
    { value: 'Full Stack & Web', label: 'Full Stack & Web', count: counts['Full Stack & Web'], icon: Code2, color: 'text-amber-400' },
    { value: 'Software Engineering', label: 'Software Engineering', count: counts['Software Engineering'], icon: Sparkles, color: 'text-indigo-400' },
  ];

  const currentOption = options.find((o) => o.value === selectedDomain) || options[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative w-full sm:w-80 z-30" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white text-[#1E293B] border border-[#E2E8F0] hover:border-[#FF6B00] shadow-sm transition-all cursor-pointer text-xs font-extrabold"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CurrentIcon className={`w-4 h-4 shrink-0 ${currentOption.color}`} />
          <span className="truncate">{currentOption.label}</span>
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FF6B00] border border-orange-200 text-[10px] font-mono shrink-0">
            {currentOption.count}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FF6B00]' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E9E5EE] rounded-2xl shadow-[0_12px_35px_-5px_rgba(0,0,0,0.15)] p-1.5 z-50 space-y-1 overflow-hidden"
          >
            {options.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = selectedDomain === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelectDomain(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md font-bold'
                      : 'text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : opt.color}`} />
                    <span className="truncate">{opt.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                    isSelected ? 'bg-white/25 text-white font-bold' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Custom Form Select Component (White Theme Matching Modal Fields)
// ─────────────────────────────────────────────────────────────
interface CustomSelectOption {
  value: string;
  label: string;
  icon?: any;
  color?: string;
}

const DOMAIN_FORM_OPTIONS: CustomSelectOption[] = [
  { value: 'Database & MongoDB', label: 'Database & MongoDB', icon: Database, color: 'text-emerald-500' },
  { value: 'AI & Machine Learning', label: 'AI & Machine Learning', icon: Cpu, color: 'text-purple-500' },
  { value: 'Cloud & DevOps', label: 'Cloud & DevOps', icon: Cloud, color: 'text-sky-500' },
  { value: 'Cybersecurity', label: 'Cybersecurity', icon: ShieldAlert, color: 'text-rose-500' },
  { value: 'Full Stack & Web', label: 'Full Stack & Web', icon: Code2, color: 'text-amber-500' },
  { value: 'Software Engineering', label: 'Software Engineering', icon: Sparkles, color: 'text-indigo-500' },
];

const DEPT_FORM_OPTIONS: CustomSelectOption[] = DEPARTMENTS.filter(d => d !== 'All').map(d => ({
  value: d,
  label: d,
  icon: GraduationCap,
  color: 'text-[#FF6B00]',
}));

const YEAR_FORM_OPTIONS: CustomSelectOption[] = YEARS.filter(y => y !== 'All').map(y => ({
  value: y,
  label: y,
  icon: Clock,
  color: 'text-amber-500',
}));

function CustomFormSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value) || options[0];
  const IconComponent = selectedOpt?.icon;

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white text-[#1E293B] border border-[#E2E8F0] hover:border-[#FF6B00] shadow-xs transition-all cursor-pointer text-xs font-bold"
      >
        <div className="flex items-center gap-2 min-w-0">
          {IconComponent && <IconComponent className={`w-3.5 h-3.5 shrink-0 ${selectedOpt?.color || 'text-[#FF6B00]'}`} />}
          <span className="truncate">{selectedOpt?.label || placeholder || 'Select option'}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FF6B00]' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E9E5EE] rounded-2xl shadow-[0_12px_35px_-5px_rgba(0,0,0,0.15)] p-1.5 z-50 space-y-1 overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.map((opt) => {
              const OptIcon = opt.icon;
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-bold shadow-sm'
                      : 'text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00]'
                  }`}
                >
                  {OptIcon && <OptIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : opt.color || 'text-[#FF6B00]'}`} />}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LeetcodeLeaderboard() {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Top Feature Switcher State
  const [activeMainTab, setActiveMainTab] = useState<'leetcode' | 'skillrack' | 'certifications'>('leetcode');

  // Shared Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 1. LeetCode Tab State
  // ─────────────────────────────────────────────────────────────
  const [leetcodeProfiles, setLeetcodeProfiles] = useState<LeetcodeProfile[]>([]);
  const [leetcodeLoading, setLeetcodeLoading] = useState(true);
  const [showLeetcodeModal, setShowLeetcodeModal] = useState(false);
  const [isLeetcodeSubmitting, setIsLeetcodeSubmitting] = useState(false);
  const [isLeetcodeSyncing, setIsLeetcodeSyncing] = useState(false);

  // LeetCode Form
  const [lcStudentName, setLcStudentName] = useState('');
  const [lcUsername, setLcUsername] = useState('');
  const [lcDept, setLcDept] = useState('CSE');
  const [lcYear, setLcYear] = useState('1st Year');

  // ─────────────────────────────────────────────────────────────
  // 2. SkillRack Tab State
  // ─────────────────────────────────────────────────────────────
  const [skillrackProfiles, setSkillrackProfiles] = useState<SkillrackProfile[]>([]);
  const [skillrackLoading, setSkillrackLoading] = useState(false);
  const [showSkillrackModal, setShowSkillrackModal] = useState(false);
  const [isSkillrackSubmitting, setIsSkillrackSubmitting] = useState(false);
  const [isSkillrackSyncing, setIsSkillrackSyncing] = useState(false);

  // SkillRack Form
  const [srStudentName, setSrStudentName] = useState('');
  const [srEmail, setSrEmail] = useState('');
  const [srPassword, setSrPassword] = useState('');
  const [srDept, setSrDept] = useState('CSE');
  const [srYear, setSrYear] = useState('1st Year');

  // ─────────────────────────────────────────────────────────────
  // 3. Certifications Vault Tab State
  // ─────────────────────────────────────────────────────────────
  const [certifications, setCertifications] = useState<StudentCertification[]>(() => {
    try {
      const saved = localStorage.getItem('rit_student_certifications');
      return saved ? JSON.parse(saved) : INITIAL_CERTIFICATIONS;
    } catch {
      return INITIAL_CERTIFICATIONS;
    }
  });

  // Domain Filter Dropdown (Replaced horizontal scroll buttons)
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');
  const [showCertModal, setShowCertModal] = useState(false);

  // Certificate Lightbox / Viewer Modal State
  const [viewingCert, setViewingCert] = useState<StudentCertification | null>(null);

  // Upload Cert Form
  const [certTitle, setCertTitle] = useState('');
  const [certDomain, setCertDomain] = useState<CertDomain>('Database & MongoDB');
  const [certIssuer, setCertIssuer] = useState('');
  const [certIssueDate, setCertIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [certCredentialUrl, setCertCredentialUrl] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certFileDataUrl, setCertFileDataUrl] = useState<string | null>(null);

  // Fetch LeetCode + SkillRack Leaderboard on Mount if Auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeetcodeLeaderboard();
      fetchSkillrackLeaderboard();
    }
  }, [isAuthenticated]);

  // Sync certifications to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('rit_student_certifications', JSON.stringify(certifications));
    } catch (e) {
      console.warn('Failed saving certifications:', e);
    }
  }, [certifications]);

  // Auto-fill student details from auth if available
  useEffect(() => {
    if (user?.name) {
      setLcStudentName(user.name);
      setSrStudentName(user.name);
      if (user.department) {
        setLcDept(user.department);
        setSrDept(user.department);
      }
    }
  }, [user]);

  const fetchLeetcodeLeaderboard = async () => {
    setLeetcodeLoading(true);
    try {
      const res = await fetch(getBackendUrl('/api/leetcode/leaderboard'));
      if (res.ok) {
        const data = await res.json();
        setLeetcodeProfiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch LeetCode leaderboard:', err);
    } finally {
      setLeetcodeLoading(false);
    }
  };

  const handleRegisterLeetcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lcStudentName.trim() || !lcUsername.trim()) return;

    setIsLeetcodeSubmitting(true);
    try {
      const res = await fetch(getBackendUrl('/api/leetcode/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: lcStudentName,
          leetcodeUsername: lcUsername,
          department: lcDept,
          year: lcYear,
        }),
      });

      if (res.ok) {
        setToastMessage('✅ Profile added successfully! Fetched latest LeetCode stats.');
        setShowLeetcodeModal(false);
        setLcUsername('');
        fetchLeetcodeLeaderboard();
      } else {
        const errData = await res.json();
        setToastMessage(`❌ ${errData.error || 'Failed to add profile'}`);
      }
    } catch {
      setToastMessage('❌ Error connecting to server');
    } finally {
      setIsLeetcodeSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleTriggerLeetcodeSync = async () => {
    setIsLeetcodeSyncing(true);
    try {
      const res = await fetch(getBackendUrl('/api/leetcode/sync'), { method: 'POST' });
      if (res.ok) {
        setToastMessage('⚡ 24h background sync started! Requests are spaced out by 3s to prevent rate limits.');
      }
    } catch {
      setToastMessage('❌ Failed to trigger sync');
    } finally {
      setIsLeetcodeSyncing(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SkillRack Fetch & Register Handlers
  // ─────────────────────────────────────────────────────────────

  const fetchSkillrackLeaderboard = async () => {
    setSkillrackLoading(true);
    try {
      const res = await fetch(getBackendUrl('/api/skillrack/leaderboard'));
      if (res.ok) {
        const data = await res.json();
        setSkillrackProfiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch SkillRack leaderboard:', err);
    } finally {
      setSkillrackLoading(false);
    }
  };

  const handleRegisterSkillrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srStudentName.trim() || !srEmail.trim() || !srPassword.trim()) return;

    setIsSkillrackSubmitting(true);
    try {
      const res = await fetch(getBackendUrl('/api/skillrack/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: srStudentName,
          skillrackEmail: srEmail,
          skillrackPassword: srPassword,
          department: srDept,
          year: srYear,
        }),
      });

      if (res.ok) {
        setToastMessage('✅ SkillRack profile added! Stats fetched successfully.');
        setShowSkillrackModal(false);
        setSrEmail('');
        setSrPassword('');
        fetchSkillrackLeaderboard();
      } else {
        const errData = await res.json();
        setToastMessage(`❌ ${errData.error || 'Failed to register SkillRack profile'}`);
      }
    } catch {
      setToastMessage('❌ Error connecting to server');
    } finally {
      setIsSkillrackSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleTriggerSkillrackSync = async () => {
    setIsSkillrackSyncing(true);
    try {
      const res = await fetch(getBackendUrl('/api/skillrack/sync'), { method: 'POST' });
      if (res.ok) {
        setToastMessage('⚡ SkillRack background sync started! 5s spacing between profiles.');
      }
    } catch {
      setToastMessage('❌ Failed to trigger SkillRack sync');
    } finally {
      setIsSkillrackSyncing(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Convert File to Base64 Data URL for persistent viewing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCertFileDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certIssuer.trim()) return;

    const formatDateToDDMMYYYY = (dateStr: string) => {
      if (!dateStr) return new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d}/${m}/${y}`;
      }
      return dateStr;
    };

    const formattedDate = formatDateToDDMMYYYY(certIssueDate);

    const newCert: StudentCertification = {
      id: `cert-${Date.now()}`,
      studentName: user?.name || 'Verified RIT Student',
      regNumber: user?.regNumber || '2117240070054',
      title: certTitle.trim(),
      domain: certDomain,
      issuingBody: certIssuer.trim(),
      issueDate: formattedDate,
      credentialUrl: certCredentialUrl.trim() || undefined,
      fileName: certFile ? certFile.name : 'Uploaded_Certificate.pdf',
      fileDataUrl: certFileDataUrl || undefined,
      status: 'Verified',
    };

    setCertifications(prev => [newCert, ...prev]);
    setShowCertModal(false);
    setCertTitle('');
    setCertIssuer('');
    setCertIssueDate(new Date().toISOString().split('T')[0]);
    setCertCredentialUrl('');
    setCertFile(null);
    setCertFileDataUrl(null);
    setToastMessage('🎉 Certificate uploaded and stored successfully!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteCert = (id: string) => {
    setCertifications(prev => prev.filter(c => c.id !== id));
    setToastMessage('🗑️ Certificate removed');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ─────────────────────────────────────────────────────────────
  // Computed Data & Filtering
  // ─────────────────────────────────────────────────────────────

  // LeetCode Filtered
  const filteredLeetcode = leetcodeProfiles.filter(p => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leetcodeUsername.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    const matchesYear = selectedYear === 'All' || p.year === selectedYear;
    return matchesSearch && matchesDept && matchesYear;
  });
  const totalLcCampusSolved = leetcodeProfiles.reduce((acc, curr) => acc + (curr.totalSolved || 0), 0);
  const topLcProfile = leetcodeProfiles.length > 0 ? leetcodeProfiles[0] : null;

  // SkillRack Filtered
  const filteredSkillrack = skillrackProfiles.filter(p => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skillrackEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    const matchesYear = selectedYear === 'All' || p.year === selectedYear;
    return matchesSearch && matchesDept && matchesYear;
  });
  const totalSrPoints = skillrackProfiles.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0);
  const topSrProfile = skillrackProfiles.length > 0 ? skillrackProfiles[0] : null;

  // Certifications Domain Counts
  const certDomainCounts: Record<CertDomain, number> = {
    'AI & Machine Learning': certifications.filter(c => c.domain === 'AI & Machine Learning').length,
    'Database & MongoDB': certifications.filter(c => c.domain === 'Database & MongoDB').length,
    'Cloud & DevOps': certifications.filter(c => c.domain === 'Cloud & DevOps').length,
    'Cybersecurity': certifications.filter(c => c.domain === 'Cybersecurity').length,
    'Full Stack & Web': certifications.filter(c => c.domain === 'Full Stack & Web').length,
    'Software Engineering': certifications.filter(c => c.domain === 'Software Engineering').length,
  };

  const filteredCertifications = certifications.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuingBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedDomainFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.domain === selectedDomainFilter;
  });

  // ─────────────────────────────────────────────────────────────
  // Unauthenticated Guard Screen
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#FAF9FC] text-[#1A0B2E] px-4 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white border border-[#E9E5EE] rounded-3xl p-8 lg:p-10 shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-[#FF6B00] flex items-center justify-center mx-auto border border-orange-500/20 shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#FF6B00] text-xs font-extrabold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Student Portal
            </div>
            <h2 className="text-2xl font-extrabold text-[#1A0B2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Student Sign In Required
            </h2>
            <p className="text-xs sm:text-sm text-[#4A3E5E] mt-2 leading-relaxed">
              RIT Student Leaderboard (LeetCode & Verified Skill Certifications Vault) are accessible exclusively to RIT students. Sign in with your student IMS credentials or Google account.
            </p>
          </div>

          <div className="pt-2 border-t border-[#E9E5EE]">
            <button
              onClick={openAuthModal}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-95 shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <GraduationCap className="w-5 h-5" />
              Sign In to Access Student Leaderboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FAF9FC] text-[#1A0B2E] px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold shadow-2xl flex items-center gap-2 text-xs sm:text-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Top Header Banner ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#E9E5EE] p-6 sm:p-8 shadow-[0_4px_25px_-4px_rgba(19,9,36,0.04)]">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-3">
                <Trophy className="w-4 h-4 text-[#FF6B00]" />
                RIT Student Competency Ecosystem
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A0B2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Student <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-[#F97316]">Leaderboard</span>
              </h1>
              <p className="mt-2 text-[#4A3E5E] max-w-2xl text-xs sm:text-sm font-medium leading-relaxed">
                Track campus competitive programming rankings across LeetCode, and showcase domain-verified student skill certifications.
              </p>
            </div>

            {/* User Session Info Pill */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shrink-0 self-start md:self-auto">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-extrabold text-[#1E293B]">{user.name}</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {user.regNumber || '2117240070054'} · {user.department || 'RIT'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Top Feature Switcher Pills ─── */}
          <div className="mt-8 pt-6 border-t border-[#E9E5EE] flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveMainTab('leetcode')}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeMainTab === 'leetcode'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-[#F8FAFC] text-slate-600 hover:text-slate-900 border border-[#E2E8F0] hover:bg-slate-100'
              }`}
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <Trophy className="w-4 h-4" />
              <span>LeetCode Leaderboard</span>
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeMainTab === 'leetcode' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {leetcodeProfiles.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('skillrack')}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeMainTab === 'skillrack'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-[#F8FAFC] text-slate-600 hover:text-slate-900 border border-[#E2E8F0] hover:bg-slate-100'
              }`}
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <Zap className="w-4 h-4" />
              <span>SkillRack</span>
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeMainTab === 'skillrack' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {skillrackProfiles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('certifications')}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeMainTab === 'certifications'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-[#F8FAFC] text-slate-600 hover:text-slate-900 border border-[#E2E8F0] hover:bg-slate-100'
              }`}
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <Award className="w-4 h-4" />
              <span>Skill Certifications</span>
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeMainTab === 'certifications' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {certifications.length}
              </span>
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* TAB 1: LEETCODE LEADERBOARD                                           */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {activeMainTab === 'leetcode' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#F97316]" /> #1 Top Solver
                </span>
                <p className="text-base sm:text-lg font-bold text-[#1E293B] mt-1 truncate">
                  {topLcProfile ? topLcProfile.studentName : 'N/A'}
                </p>
                <p className="text-xs text-[#F97316] font-medium">
                  {topLcProfile ? `${topLcProfile.totalSolved} Solved` : ''}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-500" /> Total Campus Solved
                </span>
                <p className="text-xl font-bold text-[#1E293B] mt-1">
                  {totalLcCampusSolved.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">Problems across all coders</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-500" /> Active Coders
                </span>
                <p className="text-xl font-bold text-[#1E293B] mt-1">
                  {leetcodeProfiles.length}
                </p>
                <p className="text-xs text-slate-400">Registered RIT coders</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Sync Frequency
                </span>
                <p className="text-base font-bold text-[#1E293B] mt-1">
                  Every 24 Hours
                </p>
                <p className="text-[11px] text-[#F97316] font-mono">3s rate-limited</p>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name or handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F97316]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>Dept: {d}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F97316]"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>Year: {y}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowLeetcodeModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer ml-auto sm:ml-0"
                >
                  <Plus className="w-4 h-4" /> Register Handle
                </button>

                <button
                  onClick={handleTriggerLeetcodeSync}
                  disabled={isLeetcodeSyncing}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] text-slate-700 border border-[#E2E8F0] font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLeetcodeSyncing ? 'animate-spin text-[#FF6B00]' : ''}`} />
                  Sync
                </button>
              </div>
            </div>

            {/* LeetCode Table */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
              {leetcodeLoading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#F97316]" />
                  <p className="text-sm font-medium">Fetching LeetCode rankings...</p>
                </div>
              ) : filteredLeetcode.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-base font-semibold text-slate-800">No coders found</p>
                  <p className="text-xs text-slate-500">Be the first to register your LeetCode handle!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-16">Rank</th>
                        <th className="py-3.5 px-4">Student</th>
                        <th className="py-3.5 px-4">Dept / Year</th>
                        <th className="py-3.5 px-4 text-center">Problems Solved</th>
                        <th className="py-3.5 px-4 text-center">Breakdown</th>
                        <th className="py-3.5 px-4 text-right">Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredLeetcode.map((p, index) => {
                        const rank = index + 1;
                        return (
                          <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-3.5 px-4 text-center font-bold">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-[#1E293B] text-sm">{p.studentName}</p>
                              <p className="text-xs text-slate-400 font-mono">@{p.leetcodeUsername}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                                {p.department}
                              </span>
                              <span className="text-xs text-slate-400 ml-2">{p.year}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-base font-extrabold text-[#F97316] font-mono">
                                {p.totalSolved}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                                <span className="text-emerald-600 font-bold">{p.easySolved}E</span>
                                <span className="text-amber-500 font-bold">{p.mediumSolved}M</span>
                                <span className="text-rose-500 font-bold">{p.hardSolved}H</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <a
                                href={`https://leetcode.com/u/${p.leetcodeUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#F97316] hover:underline font-bold"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* TAB 2: SKILLRACK LEADERBOARD                                          */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {activeMainTab === 'skillrack' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#F97316]" /> #1 Top Scorer
                </span>
                <p className="text-base sm:text-lg font-bold text-[#1E293B] mt-1 truncate">
                  {topSrProfile ? topSrProfile.studentName : 'N/A'}
                </p>
                <p className="text-xs text-[#F97316] font-medium">
                  {topSrProfile ? `${topSrProfile.totalPoints} Points` : ''}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" /> Total Campus Points
                </span>
                <p className="text-xl font-bold text-[#1E293B] mt-1">
                  {totalSrPoints.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">Across all registered students</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-500" /> Active Coders
                </span>
                <p className="text-xl font-bold text-[#1E293B] mt-1">
                  {skillrackProfiles.length}
                </p>
                <p className="text-xs text-slate-400">Registered RIT students</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Auto Sync
                </span>
                <p className="text-base font-bold text-[#1E293B] mt-1">
                  Every 24 Hours
                </p>
                <p className="text-[11px] text-[#F97316] font-mono">5s spacing · 2:30 AM</p>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F97316]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>Dept: {d}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F97316]"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>Year: {y}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowSkillrackModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer ml-auto sm:ml-0"
                >
                  <Plus className="w-4 h-4" /> Register Account
                </button>

                <button
                  onClick={handleTriggerSkillrackSync}
                  disabled={isSkillrackSyncing}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] text-slate-700 border border-[#E2E8F0] font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSkillrackSyncing ? 'animate-spin text-[#FF6B00]' : ''}`} />
                  Sync
                </button>
              </div>
            </div>

            {/* SkillRack Table */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
              {skillrackLoading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#F97316]" />
                  <p className="text-sm font-medium">Fetching SkillRack rankings...</p>
                </div>
              ) : filteredSkillrack.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Zap className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-base font-semibold text-slate-800">No SkillRack profiles found</p>
                  <p className="text-xs text-slate-500">Be the first to register your SkillRack account!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-16">Rank</th>
                        <th className="py-3.5 px-4">Student</th>
                        <th className="py-3.5 px-4">Dept / Year</th>
                        <th className="py-3.5 px-4 text-center">Total Points</th>
                        <th className="py-3.5 px-4 text-center">Programs</th>
                        <th className="py-3.5 px-4 text-center">Medals</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredSkillrack.map((p, index) => {
                        const rank = index + 1;
                        return (
                          <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-3.5 px-4 text-center font-bold">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-[#1E293B] text-sm">{p.studentName}</p>
                              <p className="text-xs text-slate-400 font-mono truncate max-w-[180px]">{p.skillrackEmail}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                                {p.department}
                              </span>
                              <span className="text-xs text-slate-400 ml-2">{p.year}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-base font-extrabold text-[#F97316] font-mono">
                                {p.totalPoints}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono flex-wrap">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold" title="Code Test">CT:{p.codeTestSolved}</span>
                                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold" title="Code Tutor">Tutor:{p.codeTutorSolved}</span>
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold" title="Code Track">Track:{p.codeTrackSolved}</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold" title="Daily Challenge">DC:{p.dcSolved}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                                <span className="text-amber-500 font-bold" title="Gold">🥇{p.goldMedals}</span>
                                <span className="text-slate-400 font-bold" title="Silver">🥈{p.silverMedals}</span>
                                <span className="text-amber-700 font-bold" title="Bronze">🥉{p.bronzeMedals}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* TAB 3: SKILL CERTIFICATIONS (WITH DOMAIN SELECTOR DROPDOWN & PREVIEW) */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {activeMainTab === 'certifications' && (
          <div className="space-y-6">

            {/* Domain Certificate Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
                  <Cpu className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-[#1E293B]">{certDomainCounts['AI & Machine Learning']}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">AI & ML</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Database className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-[#1E293B]">{certDomainCounts['Database & MongoDB']}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">Database & MongoDB</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
                  <Cloud className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-[#1E293B]">{certDomainCounts['Cloud & DevOps']}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">Cloud & DevOps</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-[#1E293B]">{certDomainCounts['Cybersecurity']}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">Cybersecurity</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Code2 className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-[#1E293B]">{certDomainCounts['Full Stack & Web']}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">Full Stack & Web</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-center">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-[#1E293B]">{certifications.length}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">Total Certs</p>
              </div>
            </div>

            {/* Clean Dropdown Bar (Replaced long horizontal scrolling pills per user request) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs">

              {/* Custom Animated Floating Domain Dropdown (Matching Figure 2 Navbar Style) */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
                  <Filter className="w-4 h-4 text-[#FF6B00]" /> Domain:
                </span>
                <CustomDomainDropdown
                  selectedDomain={selectedDomainFilter}
                  onSelectDomain={setSelectedDomainFilter}
                  totalCerts={certifications.length}
                  counts={certDomainCounts}
                />
              </div>

              {/* Action Inputs & Upload */}
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search title, issuer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <button
                  onClick={() => setShowCertModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer shrink-0"
                >
                  <Upload className="w-4 h-4" /> Upload Certificate
                </button>
              </div>
            </div>

            {/* Certificate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCertifications.length === 0 ? (
                <div className="col-span-full p-12 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-[#E5E7EB]">
                  <Award className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-base font-semibold text-slate-800">No certificates found in this domain</p>
                  <p className="text-xs text-slate-500">Upload your industry credentials to build your student proficiency profile!</p>
                </div>
              ) : (
                filteredCertifications.map((cert) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide ${
                          cert.domain === 'AI & Machine Learning'
                            ? 'bg-purple-100 text-purple-700'
                            : cert.domain === 'Database & MongoDB'
                            ? 'bg-emerald-100 text-emerald-700'
                            : cert.domain === 'Cloud & DevOps'
                            ? 'bg-sky-100 text-sky-700'
                            : cert.domain === 'Cybersecurity'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cert.domain}
                        </span>

                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> {cert.status}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-[#1E293B] text-base leading-snug group-hover:text-[#FF6B00] transition-colors">
                          {cert.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Issuer: <span className="text-slate-800 font-bold">{cert.issuingBody}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono text-[11px]">Issued: {cert.issueDate}</span>
                        <span className="font-mono text-[11px] text-slate-400">Reg: {cert.regNumber}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Prominent View Certificate Button (Opens Lightbox Viewer for both files & links) */}
                      <button
                        onClick={() => setViewingCert(cert)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 text-[#FF6B00] hover:bg-orange-100 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Certificate
                      </button>

                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: REGISTER LEETCODE HANDLE                                     */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLeetcodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E9E5EE] shadow-2xl relative"
            >
              <button
                onClick={() => setShowLeetcodeModal(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Register LeetCode Handle
              </h3>
              <p className="text-xs text-slate-500 mt-1">Connect your LeetCode username to RIT campus rankings.</p>

              <form onSubmit={handleRegisterLeetcode} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={lcStudentName}
                    onChange={(e) => setLcStudentName(e.target.value)}
                    placeholder="e.g. S DEVESH"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LeetCode Username (Exact)</label>
                  <input
                    type="text"
                    required
                    value={lcUsername}
                    onChange={(e) => setLcUsername(e.target.value)}
                    placeholder="e.g. devesh_rit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <CustomFormSelect
                      value={lcDept}
                      onChange={setLcDept}
                      options={DEPT_FORM_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                    <CustomFormSelect
                      value={lcYear}
                      onChange={setLcYear}
                      options={YEAR_FORM_OPTIONS}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLeetcodeSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLeetcodeSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MODAL: REGISTER SKILLRACK ACCOUNT                                      */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSkillrackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E9E5EE] shadow-2xl relative"
            >
              <button
                onClick={() => setShowSkillrackModal(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#FF6B00]" />
                <h3 className="text-xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Register SkillRack Account
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter your SkillRack credentials to fetch your stats. Your password is stored encrypted on our server for automatic daily sync.</p>

              <form onSubmit={handleRegisterSkillrack} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={srStudentName}
                    onChange={(e) => setSrStudentName(e.target.value)}
                    placeholder="e.g. S DEVESH"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#FF6B00]" /> SkillRack Email
                  </label>
                  <input
                    type="email"
                    required
                    value={srEmail}
                    onChange={(e) => setSrEmail(e.target.value)}
                    placeholder="e.g. student@ritchennai.edu.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF6B00]" /> SkillRack Password
                  </label>
                  <input
                    type="password"
                    required
                    value={srPassword}
                    onChange={(e) => setSrPassword(e.target.value)}
                    placeholder="Your SkillRack password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Encrypted with AES-256 · Used only for stat fetching
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <CustomFormSelect
                      value={srDept}
                      onChange={setSrDept}
                      options={DEPT_FORM_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                    <CustomFormSelect
                      value={srYear}
                      onChange={setSrYear}
                      options={YEAR_FORM_OPTIONS}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSkillrackSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSkillrackSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Connect & Fetch Stats'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MODAL: UPLOAD SKILL CERTIFICATION FORM                                 */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E9E5EE] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowCertModal(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#FF6B00]" />
                <h3 className="text-xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Upload Skill Certification
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Upload industry certificates & credentials to store & update domain badge counts.</p>

              <form onSubmit={handleUploadCertification} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Title / Course Name</label>
                  <input
                    type="text"
                    required
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="e.g. MongoDB Certified Associate Developer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Technology Domain</label>
                    <CustomFormSelect
                      value={certDomain}
                      onChange={(val) => setCertDomain(val as CertDomain)}
                      options={DOMAIN_FORM_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Body / Platform</label>
                    <input
                      type="text"
                      required
                      value={certIssuer}
                      onChange={(e) => setCertIssuer(e.target.value)}
                      placeholder="e.g. MongoDB, Coursera, AWS"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" /> Issue Date (Day/Month/Year)
                    </label>
                    <input
                      type="date"
                      required
                      value={certIssueDate}
                      onChange={(e) => setCertIssueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#F97316] bg-white cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Verification URL (Optional)</label>
                    <input
                      type="url"
                      value={certCredentialUrl}
                      onChange={(e) => setCertCredentialUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                {/* File Upload Zone (Reads & Stores File as Base64 Data URL) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Attach Certificate Document (Image / PDF)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-orange-400 transition-colors bg-[#F8FAFC]">
                    <Upload className="w-6 h-6 text-[#FF6B00] mx-auto mb-1.5" />
                    <p className="text-xs text-slate-700 font-bold">
                      {certFile ? `Selected: ${certFile.name}` : 'Upload certificate image or document'}
                    </p>
                    {certFile && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        ✓ Stored & ready for viewing
                      </p>
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="cert-file-input"
                    />
                    <label
                      htmlFor="cert-file-input"
                      className="mt-2.5 inline-block px-4 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-xs font-extrabold text-[#FF6B00] cursor-pointer"
                    >
                      Browse File
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" /> Save & Store Certificate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: CERTIFICATE VIEW LIGHTBOX / PREVIEW MODAL                    */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E9E5EE] shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setViewingCert(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <Award className="w-6 h-6 text-[#FF6B00]" />
                <div>
                  <h3 className="text-xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {viewingCert.title}
                  </h3>
                  <p className="text-xs text-slate-500">Issued by {viewingCert.issuingBody} · Reg: {viewingCert.regNumber}</p>
                </div>
              </div>

              {/* Certificate Media Display */}
              <div className="my-4 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-4 min-h-[260px]">
                {viewingCert.fileDataUrl ? (
                  viewingCert.fileDataUrl.startsWith('data:image/') || viewingCert.fileDataUrl.startsWith('data:application/pdf') === false ? (
                    <img
                      src={viewingCert.fileDataUrl}
                      alt={viewingCert.title}
                      className="max-h-[420px] w-auto object-contain rounded-xl shadow-md border border-slate-200"
                    />
                  ) : (
                    <iframe
                      src={viewingCert.fileDataUrl}
                      title="Certificate PDF"
                      className="w-full h-[400px] rounded-xl border border-slate-200"
                    />
                  )
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <img
                      src={MOCK_CERTIFICATE_IMAGE}
                      alt="Certificate Sample"
                      className="max-h-[240px] w-auto object-cover rounded-2xl mx-auto shadow-md border border-slate-200"
                    />
                    <p className="text-xs text-slate-500 font-medium">Official Verified Certificate Document</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified RIT Credential
                </span>

                <div className="flex items-center gap-2">
                  {viewingCert.credentialUrl && (
                    <a
                      href={viewingCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-orange-100 text-[#FF6B00] font-bold text-xs hover:bg-orange-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Issuer Site
                    </a>
                  )}

                  {viewingCert.fileDataUrl && (
                    <a
                      href={viewingCert.fileDataUrl}
                      download={viewingCert.fileName || 'Certificate.png'}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
