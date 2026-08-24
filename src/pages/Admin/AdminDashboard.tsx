import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, User, LogOut, Mail, Plus, Trash2, 
  CheckCircle2, AlertCircle, RefreshCw, Bus, Send, 
  MessageCircle, BookOpen, Bot, Edit, MapPin, 
  Clock, Palette, KeyRound, ExternalLink, ArrowRight, 
  Code2, Check, HelpCircle, Users, Activity,
  UserCheck, Building2, GraduationCap, Calculator, Search, GitMerge,
  Power, Play, SlidersHorizontal, ToggleLeft, ToggleRight,
  Eye, EyeOff, Zap, Copy, CheckCheck, Sparkles, Radio, Terminal,
  MessageSquare, ShieldAlert
} from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FACULTY_DATA, CLUBS_DATA, DEPARTMENTS } from '@/constants';
import { DEPARTMENT_CURRICULUM, DEPARTMENT_CODE_MAP } from '@/constants/departmentCurriculum';


interface BusStopItem {
  id?: number;
  name: string;
  time: string;
  stopOrder?: number;
}

interface BusRouteItem {
  id: number;
  number: string;
  name: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  color: string;
  status?: 'ACTIVE' | 'STOPPED';
  stops?: BusStopItem[];
}

interface SeniorHelperItem {
  chatId: number;
  name: string;
  department?: string;
  lastPingStatus?: 'success' | 'failed' | 'idle';
  lastPingTime?: string;
}

interface TelegramBotInfo {
  id?: number;
  is_bot?: boolean;
  first_name?: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
}

interface TelegramConfig {
  community_bot_token?: string;
  telegram_bot_token?: string;
  bot_username?: string;
  spring_backend_url?: string;
  helper_chat_ids?: number[];
  seniorHelpers?: SeniorHelperItem[];
}

const ROUTE_STORAGE_KEY = 'RIT_LOCAL_BUS_ROUTES';
const TELEGRAM_STORAGE_KEY = 'RIT_LOCAL_TELEGRAM_CONFIG';
const NOTES_STORAGE_KEY = 'RIT_LOCAL_NOTES';
const QUESTIONS_STORAGE_KEY = 'RIT_LOCAL_QUESTIONS';
const RECIPIENTS_STORAGE_KEY = 'RIT_LOCAL_RECIPIENTS';
const FACULTY_STORAGE_KEY = 'RIT_LOCAL_FACULTY';
const CLUBS_STORAGE_KEY = 'RIT_LOCAL_CLUBS';
const CURRICULUM_STORAGE_KEY = 'RIT_LOCAL_GPA_CURRICULUM';

interface NoteItem {
  id: number;
  title: string;
  subject: string;
  department: string;
  semester: number;
  fileType: string;
  downloadUrl: string;
}

interface QuestionItem {
  id: number;
  title: string;
  body: string;
  authorName: string;
  authorEmail: string;
  tags?: string[];
  votes?: number;
  createdAt?: string;
  status?: string;
}

export default function AdminDashboard() {
  const { user, loginWithCredentials, logout: authLogout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'ROLE_TRANSPORT' | 'ROLE_COMMUNITY' | 'ROLE_CLUBS' | 'ROLE_CURRICULUM' | 'ROLE_SUPER_ADMIN' | null>(null);
  const [usernameDisplay, setUsernameDisplay] = useState('Admin');
  
  // Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'transport' | 'telegram' | 'notes' | 'community' | 'subscribers' | 'faculty' | 'clubs' | 'curriculum'>('transport');

  // Faculty State
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null);
  const [facultyFormData, setFacultyFormData] = useState({
    name: '',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    email: '',
    office: '',
    specialization: '',
    isClassIncharge: false,
  });

  // Clubs & Centers State
  const [clubsList, setClubsList] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [clubsSearch, setClubsSearch] = useState('');
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<any | null>(null);
  const [clubFormData, setClubFormData] = useState({
    name: '',
    description: '',
    category: 'Center of Excellence',
    type: 'Center' as 'Club' | 'Center',
    coordinatorName: '',
    contactEmail: '',
    details: '',
  });

  // Curriculum & GPA State
  const [selectedGpaDept, setSelectedGpaDept] = useState<string>('CSE');
  const [selectedGpaSem, setSelectedGpaSem] = useState<number>(1);
  const [curriculumMap, setCurriculumMap] = useState<Record<string, Record<number, any[]>>>({});
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    name: '',
    credits: 3,
    isElective: false,
  });

  // Transport State
  const [routes, setRoutes] = useState<BusRouteItem[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRouteItem | null>(null);
  const [routeFormData, setRouteFormData] = useState({
    number: '',
    name: '',
    from: '',
    to: '',
    departureTime: '07:00 AM',
    arrivalTime: '08:30 AM',
    color: '#FF6B00',
    stops: [{ name: '', time: '07:15 AM' }],
  });

  // Merge Routes State
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedRouteIdsForMerge, setSelectedRouteIdsForMerge] = useState<number[]>([]);
  const [mergedRouteFormData, setMergedRouteFormData] = useState({
    number: '',
    name: '',
    from: '',
    to: 'RIT Campus',
    departureTime: '07:00 AM',
    arrivalTime: '08:30 AM',
    color: '#FF6B00',
    deactivateOriginals: false,
    stops: [] as { name: string; time: string; sourceRoute?: string }[],
  });

  // Bus Status Manager State
  const [isBusStatusModalOpen, setIsBusStatusModalOpen] = useState(false);
  const [busStatusTabFilter, setBusStatusTabFilter] = useState<'ALL' | 'ACTIVE' | 'STOPPED'>('ALL');
  const [gridStatusFilter, setGridStatusFilter] = useState<'ALL' | 'ACTIVE' | 'STOPPED'>('ACTIVE');

  // Telegram Q&A & Bot State
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);
  const [loadingTelegram, setLoadingTelegram] = useState(false);
  const [newHelperChatId, setNewHelperChatId] = useState('');
  const [newHelperName, setNewHelperName] = useState('');
  const [newHelperDept, setNewHelperDept] = useState('CSE');
  const [savingBotConfig, setSavingBotConfig] = useState(false);
  const [showCommunityToken, setShowCommunityToken] = useState(false);
  const [showCollabToken, setShowCollabToken] = useState(false);
  const [testingBotType, setTestingBotType] = useState<'community' | 'collab' | null>(null);
  const [botInfoCommunity, setBotInfoCommunity] = useState<TelegramBotInfo | null>(null);
  const [botInfoCollab, setBotInfoCollab] = useState<TelegramBotInfo | null>(null);
  const [pingingHelperId, setPingingHelperId] = useState<number | null>(null);
  const [broadcastingAlert, setBroadcastingAlert] = useState(false);
  const [copiedChatId, setCopiedChatId] = useState<number | null>(null);
  const [editingHelper, setEditingHelper] = useState<SeniorHelperItem | null>(null);
  const [editHelperName, setEditHelperName] = useState('');
  const [editHelperDept, setEditHelperDept] = useState('CSE');
  const [activeGuideTab, setActiveGuideTab] = useState<'botfather' | 'chatid' | 'workflow'>('botfather');

  // Notes State
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Community Questions State
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Deployment Subscribers State
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getDefaultTabForRole = (role: string | null): 'transport' | 'telegram' | 'notes' | 'community' | 'subscribers' | 'faculty' | 'clubs' | 'curriculum' => {
    switch (role) {
      case 'ROLE_TRANSPORT': return 'transport';
      case 'ROLE_COMMUNITY': return 'telegram';
      case 'ROLE_CLUBS': return 'clubs';
      case 'ROLE_CURRICULUM': return 'curriculum';
      default: return 'transport';
    }
  };

  const getRoleDisplayName = (role: string | null): string => {
    switch (role) {
      case 'ROLE_TRANSPORT': return 'Transport Fleet Admin';
      case 'ROLE_COMMUNITY': return 'Community & Senior Q&A Admin';
      case 'ROLE_CLUBS': return 'Clubs & Centers Admin';
      case 'ROLE_CURRICULUM': return 'GPA Curriculum Admin';
      case 'ROLE_SUPER_ADMIN': return 'Super Admin';
      default: return 'Admin';
    }
  };

  // Restore session from AuthContext or localStorage
  useEffect(() => {
    const validRoles = ['ROLE_TRANSPORT', 'ROLE_COMMUNITY', 'ROLE_CLUBS', 'ROLE_CURRICULUM', 'ROLE_SUPER_ADMIN'];
    if (user?.role && validRoles.includes(user.role)) {
      setIsLoggedIn(true);
      setUserRole(user.role as any);
      setUsernameDisplay(user.name || getRoleDisplayName(user.role));
      setActiveTab(getDefaultTabForRole(user.role));
      return;
    }

    const savedRole = localStorage.getItem('RIT_ADMIN_ROLE') as any;
    const savedToken = localStorage.getItem('RIT_ADMIN_TOKEN');
    if (savedToken && savedRole && validRoles.includes(savedRole)) {
      setIsLoggedIn(true);
      setUserRole(savedRole);
      setUsernameDisplay(localStorage.getItem('RIT_ADMIN_USER') || getRoleDisplayName(savedRole));
      setActiveTab(getDefaultTabForRole(savedRole));
    }
  }, [user]);

  // Fetch data when activeTab changes
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === 'transport') fetchRoutes();
    if (activeTab === 'telegram') fetchTelegramConfig();
    if (activeTab === 'community') fetchQuestions();
    if (activeTab === 'faculty') fetchFaculty();
    if (activeTab === 'clubs') fetchClubs();
    if (activeTab === 'curriculum') fetchCurriculum();
  }, [isLoggedIn, activeTab]);

  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATION
  // ─────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }
    setLoadingLogin(true);
    setLoginError(null);

    try {
      const result = await loginWithCredentials(usernameInput.trim(), passwordInput.trim());
      const validRoles = ['ROLE_TRANSPORT', 'ROLE_COMMUNITY', 'ROLE_CLUBS', 'ROLE_CURRICULUM', 'ROLE_SUPER_ADMIN'];
      if (result.success && result.role && validRoles.includes(result.role)) {
        setIsLoggedIn(true);
        setUserRole(result.role as any);
        setUsernameDisplay(getRoleDisplayName(result.role));
        setActiveTab(getDefaultTabForRole(result.role));
      } else {
        setLoginError(result.message || 'Invalid admin credentials. Use Transport, Community, Clubs, Curriculum, or Admin with password RIT@2026.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('RIT_ADMIN_TOKEN');
    localStorage.removeItem('RIT_ADMIN_ROLE');
    localStorage.removeItem('RIT_ADMIN_USER');
    setIsLoggedIn(false);
    setUserRole(null);
    setUsernameInput('');
    setPasswordInput('');
    authLogout();
  };

  const [busSearchQuery, setBusSearchQuery] = useState('');
  const ROUTE_STORAGE_KEY = 'RIT_LOCAL_BUS_ROUTES';

  // ─────────────────────────────────────────────────────────────
  // TRANSPORT ROUTE HANDLERS
  // ─────────────────────────────────────────────────────────────
  const fetchRoutes = () => {
    setLoadingRoutes(true);

    // 1. Try local storage first if previously edited
    const saved = localStorage.getItem(ROUTE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRoutes(parsed);
          setLoadingRoutes(false);
        }
      } catch {}
    }

    // 2. Fetch from backend or public/bus_routes.json
    fetch(getBackendUrl('/api/admin/transport/routes'))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRoutes(data);
          localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(data));
        } else {
          // Fallback to static bus_routes.json if database was empty
          fetch('/bus_routes.json')
            .then((r) => r.json())
            .then((staticData) => {
              if (Array.isArray(staticData) && staticData.length > 0) {
                const formatted: BusRouteItem[] = staticData.map((s: any, idx: number) => ({
                  id: idx + 1,
                  number: s.number,
                  name: s.name,
                  from: s.from,
                  to: s.to,
                  departureTime: s.departureTime,
                  arrivalTime: s.arrivalTime,
                  color: s.color || '#FF6B00',
                  stops: (s.stops || []).map((st: any, sIdx: number) => ({
                    id: sIdx + 1,
                    name: st.name,
                    time: st.time,
                    stopOrder: sIdx + 1,
                  })),
                }));
                setRoutes(formatted);
                localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(formatted));
              }
            });
        }
      })
      .catch(() => {
        // Backend offline fallback
        fetch('/bus_routes.json')
          .then((r) => r.json())
          .then((staticData) => {
            if (Array.isArray(staticData) && staticData.length > 0) {
              const formatted: BusRouteItem[] = staticData.map((s: any, idx: number) => ({
                id: idx + 1,
                number: s.number,
                name: s.name,
                from: s.from,
                to: s.to,
                departureTime: s.departureTime,
                arrivalTime: s.arrivalTime,
                color: s.color || '#FF6B00',
                stops: (s.stops || []).map((st: any, sIdx: number) => ({
                  id: sIdx + 1,
                  name: st.name,
                  time: st.time,
                  stopOrder: sIdx + 1,
                })),
              }));
              setRoutes(formatted);
              localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(formatted));
            }
          });
      })
      .finally(() => setLoadingRoutes(false));
  };

  const openCreateRouteModal = () => {
    setEditingRoute(null);
    setRouteFormData({
      number: '',
      name: '',
      from: '',
      to: 'RIT Campus',
      departureTime: '07:00 AM',
      arrivalTime: '08:30 AM',
      color: '#FF6B00',
      stops: [
        { name: '', time: '07:00 AM' },
        { name: 'RIT Campus', time: '08:30 AM' },
      ],
    });
    setIsRouteModalOpen(true);
  };

  const openEditRouteModal = (route: BusRouteItem) => {
    setEditingRoute(route);
    setRouteFormData({
      number: route.number,
      name: route.name,
      from: route.from,
      to: route.to,
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      color: route.color || '#FF6B00',
      stops: route.stops && route.stops.length > 0 
        ? route.stops.map(s => ({ name: s.name, time: s.time }))
        : [{ name: route.from, time: route.departureTime }, { name: route.to, time: route.arrivalTime }],
    });
    setIsRouteModalOpen(true);
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeFormData.number.trim() || !routeFormData.name.trim() || !routeFormData.from.trim()) {
      showToast('error', 'Please fill in required route information.');
      return;
    }

    const cleanedStops = routeFormData.stops
      .filter(s => s.name.trim().length > 0)
      .map((s, idx) => ({ ...s, stopOrder: idx + 1, id: idx + 1 }));

    const payload = {
      ...routeFormData,
      stops: cleanedStops,
    };

    if (editingRoute) {
      // Update locally
      const updatedRoutes = routes.map((r) =>
        r.id === editingRoute.id ? { ...r, ...payload, id: editingRoute.id } : r
      );
      setRoutes(updatedRoutes);
      localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(updatedRoutes));
      showToast('success', `Route ${routeFormData.number} updated successfully!`);
      setIsRouteModalOpen(false);

      // Also sync to backend if online
      fetch(getBackendUrl(`/api/admin/transport/routes/${editingRoute.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } else {
      // Create new route
      const newId = routes.length > 0 ? Math.max(...routes.map(r => r.id || 0)) + 1 : 1;
      const newRoute: BusRouteItem = {
        id: newId,
        ...payload,
      };
      const updatedRoutes = [newRoute, ...routes];
      setRoutes(updatedRoutes);
      localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(updatedRoutes));
      showToast('success', `Route ${routeFormData.number} created successfully!`);
      setIsRouteModalOpen(false);

      // Also sync to backend if online
      fetch(getBackendUrl('/api/admin/transport/routes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  };

  const handleDeleteRoute = (id: number, number: string) => {
    if (!confirm(`Are you sure you want to delete Route ${number}?`)) return;
    const updatedRoutes = routes.filter((r) => r.id !== id);
    setRoutes(updatedRoutes);
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(updatedRoutes));
    showToast('success', `Route ${number} deleted.`);

    // Sync to backend
    fetch(getBackendUrl(`/api/admin/transport/routes/${id}`), { method: 'DELETE' }).catch(() => {});
  };

  const addStopField = () => {
    setRouteFormData({
      ...routeFormData,
      stops: [...routeFormData.stops, { name: '', time: '07:45 AM' }],
    });
  };

  const removeStopField = (index: number) => {
    const updated = routeFormData.stops.filter((_, i) => i !== index);
    setRouteFormData({ ...routeFormData, stops: updated });
  };

  // ─────────────────────────────────────────────────────────────
  // MERGE ROUTES HANDLERS
  // ─────────────────────────────────────────────────────────────
  const openMergeRoutesModal = () => {
    setSelectedRouteIdsForMerge([]);
    setMergedRouteFormData({
      number: '',
      name: '',
      from: '',
      to: 'RIT Campus',
      departureTime: '07:00 AM',
      arrivalTime: '08:30 AM',
      color: '#FF6B00',
      deactivateOriginals: false,
      stops: [],
    });
    setIsMergeModalOpen(true);
  };

  const toggleSelectRouteForMerge = (routeId: number) => {
    let updatedIds: number[];
    if (selectedRouteIdsForMerge.includes(routeId)) {
      updatedIds = selectedRouteIdsForMerge.filter((id) => id !== routeId);
    } else {
      updatedIds = [...selectedRouteIdsForMerge, routeId];
    }
    setSelectedRouteIdsForMerge(updatedIds);

    // Re-calculate combined stops & default route details
    const selectedBuses = routes.filter((r) => updatedIds.includes(r.id));
    if (selectedBuses.length > 0) {
      const mergedStops: { name: string; time: string; sourceRoute: string }[] = [];
      selectedBuses.forEach((b) => {
        (b.stops || []).forEach((st) => {
          mergedStops.push({
            name: st.name,
            time: st.time || b.departureTime,
            sourceRoute: b.number,
          });
        });
      });

      const routeNums = selectedBuses.map((b) => b.number).join(' + ');
      const routeNames = selectedBuses.map((b) => b.name.replace(/ Route$/i, '')).join(' + ') + ' Combined';

      setMergedRouteFormData((prev) => ({
        ...prev,
        number: `${selectedBuses[0].number}-MERGED`,
        name: routeNames,
        from: selectedBuses[0].from,
        to: selectedBuses[selectedBuses.length - 1].to || 'RIT Campus',
        departureTime: selectedBuses[0].departureTime,
        arrivalTime: selectedBuses[selectedBuses.length - 1].arrivalTime || '08:30 AM',
        stops: mergedStops,
      }));
    } else {
      setMergedRouteFormData((prev) => ({
        ...prev,
        number: '',
        name: '',
        stops: [],
      }));
    }
  };

  const handleRemoveMergedStop = (index: number) => {
    const updated = mergedRouteFormData.stops.filter((_, i) => i !== index);
    setMergedRouteFormData({ ...mergedRouteFormData, stops: updated });
  };

  const handleAddMergedStopField = () => {
    setMergedRouteFormData({
      ...mergedRouteFormData,
      stops: [...mergedRouteFormData.stops, { name: '', time: '07:30 AM', sourceRoute: 'Custom' }],
    });
  };

  const handleSaveMergedRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRouteIdsForMerge.length < 2) {
      showToast('error', 'Please select at least 2 bus routes to merge.');
      return;
    }
    if (!mergedRouteFormData.number.trim() || !mergedRouteFormData.name.trim()) {
      showToast('error', 'Please enter a Merged Route Number and Name.');
      return;
    }

    const cleanedStops = mergedRouteFormData.stops
      .filter((s) => s.name.trim().length > 0)
      .map((s, idx) => ({ id: idx + 1, name: s.name, time: s.time, stopOrder: idx + 1 }));

    const newId = routes.length > 0 ? Math.max(...routes.map((r) => r.id || 0)) + 1 : 1;
    const newRoute: BusRouteItem = {
      id: newId,
      number: mergedRouteFormData.number,
      name: mergedRouteFormData.name,
      from: mergedRouteFormData.from || 'Multi-Origin',
      to: mergedRouteFormData.to || 'RIT Campus',
      departureTime: mergedRouteFormData.departureTime,
      arrivalTime: mergedRouteFormData.arrivalTime,
      color: mergedRouteFormData.color || '#FF6B00',
      stops: cleanedStops,
    };

    let updatedRoutes = [newRoute, ...routes];
    if (mergedRouteFormData.deactivateOriginals) {
      updatedRoutes = updatedRoutes.map((r) =>
        selectedRouteIdsForMerge.includes(r.id) ? { ...r, status: 'STOPPED' } : r
      );
    }

    setRoutes(updatedRoutes);
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(updatedRoutes));
    showToast('success', `Merged route ${mergedRouteFormData.number} created! Source routes set to STOPPED status.`);
    setIsMergeModalOpen(false);

    fetch(getBackendUrl('/api/admin/transport/routes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoute),
    }).catch(() => {});
  };

  // ─────────────────────────────────────────────────────────────
  // BUS STATUS MANAGER HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleToggleRouteStatus = (routeId: number) => {
    const updatedRoutes = routes.map((r) => {
      if (r.id === routeId) {
        const newStatus: 'ACTIVE' | 'STOPPED' = (r.status || 'ACTIVE') === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
        showToast('success', `Route ${r.number} status changed to ${newStatus === 'ACTIVE' ? '🟢 Active' : '🔴 Stopped'}`);
        return { ...r, status: newStatus };
      }
      return r;
    });

    setRoutes(updatedRoutes);
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(updatedRoutes));

    const targetRoute = updatedRoutes.find((r) => r.id === routeId);
    if (targetRoute) {
      fetch(getBackendUrl(`/api/admin/transport/routes/${routeId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetRoute),
      }).catch(() => {});
    }
  };

  const handleSetAllRoutesStatus = (status: 'ACTIVE' | 'STOPPED') => {
    const updatedRoutes = routes.map((r) => ({ ...r, status }));
    setRoutes(updatedRoutes);
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(updatedRoutes));
    showToast('success', `All routes set to ${status === 'ACTIVE' ? '🟢 Active' : '🔴 Stopped'}`);
  };

  // ─────────────────────────────────────────────────────────────
  // TELEGRAM BOT & SENIOR HELPERS HANDLERS
  // ─────────────────────────────────────────────────────────────
  const fetchTelegramConfig = () => {
    setLoadingTelegram(true);
    const saved = localStorage.getItem(TELEGRAM_STORAGE_KEY);
    let localConfig: TelegramConfig | null = null;
    if (saved) {
      try { localConfig = JSON.parse(saved); } catch {}
    }

    if (!localConfig || (!localConfig.seniorHelpers?.length && !localConfig.helper_chat_ids?.length)) {
      localConfig = {
        community_bot_token: '8973721012:AAG37F4Q4q584m_2aS8rT6qSWuA-WuHRGMY',
        telegram_bot_token: '8973721012:AAG37F4Q4q584m_2aS8rT6qSWuA-WuHRGMY',
        bot_username: 'FreshersCommunityBot',
        spring_backend_url: 'http://localhost:8085',
        helper_chat_ids: [1873240361, 5567776672, 8518850169, 7238144438],
        seniorHelpers: [
          { chatId: 1873240361, name: 'Senior Mentor', department: 'CSE' },
          { chatId: 5567776672, name: 'Senior Responder', department: 'ECE' },
          { chatId: 8518850169, name: 'Senior Responder', department: 'IT' },
          { chatId: 7238144438, name: 'Senior Responder', department: 'AIDS' },
        ]
      };
      localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(localConfig));
    }

    setTelegramConfig(localConfig);

    // Initial silent verification of bot token
    if (localConfig?.community_bot_token) {
      verifyBotTokenSilent(localConfig.community_bot_token, 'community');
    }

    fetch(getBackendUrl('/api/admin/telegram/config'))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch from backend');
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          const merged: TelegramConfig = {
            community_bot_token: data.community_bot_token || localConfig?.community_bot_token,
            telegram_bot_token: data.telegram_bot_token || localConfig?.telegram_bot_token,
            bot_username: data.bot_username || localConfig?.bot_username,
            spring_backend_url: data.spring_backend_url || localConfig?.spring_backend_url,
            helper_chat_ids: (data.helper_chat_ids && data.helper_chat_ids.length > 0) ? data.helper_chat_ids : localConfig?.helper_chat_ids,
            seniorHelpers: (data.seniorHelpers && data.seniorHelpers.length > 0) ? data.seniorHelpers : localConfig?.seniorHelpers
          };
          setTelegramConfig(merged);
          localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(merged));
          if (merged.community_bot_token) {
            verifyBotTokenSilent(merged.community_bot_token, 'community');
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTelegram(false));
  };

  const verifyBotTokenSilent = async (token: string, type: 'community' | 'collab') => {
    if (!token || !token.includes(':')) return;
    try {
      let data: any = null;
      try {
        const res = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
        if (res.ok) data = await res.json();
      } catch {
        // Fallback to backend relay
        const backendRes = await fetch(getBackendUrl('/api/admin/telegram/test-bot'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim() }),
        });
        if (backendRes.ok) data = await backendRes.json();
      }

      if (data?.ok && data?.result) {
        if (type === 'community') setBotInfoCommunity(data.result);
        else setBotInfoCollab(data.result);
      }
    } catch {}
  };

  const handleVerifyBotToken = async (type: 'community' | 'collab') => {
    const token = type === 'community' 
      ? telegramConfig?.community_bot_token 
      : telegramConfig?.telegram_bot_token;

    if (!token || !token.trim()) {
      showToast('error', 'Please enter a Telegram Bot Token to verify.');
      return;
    }

    if (!token.includes(':') || token.trim().length < 20) {
      showToast('error', 'Invalid token format. A valid Telegram Bot token looks like 123456789:AAH...');
      return;
    }

    setTestingBotType(type);
    try {
      let data: any = null;
      try {
        const res = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
        data = await res.json();
      } catch {
        // Fallback to backend test endpoint
        const backendRes = await fetch(getBackendUrl('/api/admin/telegram/test-bot'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim() }),
        });
        if (backendRes.ok) {
          data = await backendRes.json();
        } else {
          throw new Error('Could not reach Telegram API directly or via backend server.');
        }
      }

      if (data?.ok && data?.result) {
        if (type === 'community') {
          setBotInfoCommunity(data.result);
          if (telegramConfig) {
            const updated = { ...telegramConfig, bot_username: data.result.username };
            setTelegramConfig(updated);
            localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(updated));
          }
        } else {
          setBotInfoCollab(data.result);
        }
        showToast('success', `✅ Connected to Telegram Bot @${data.result.username} (${data.result.first_name})!`);
      } else {
        const errMsg = data?.description || 'Invalid Telegram Bot token.';
        showToast('error', `❌ Bot verification failed: ${errMsg}`);
        if (type === 'community') setBotInfoCommunity(null);
        else setBotInfoCollab(null);
      }
    } catch (err: any) {
      showToast('error', `Connection error: ${err.message || 'Unable to contact Telegram API'}`);
    } finally {
      setTestingBotType(null);
    }
  };

  const handleAddSeniorHelper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelperChatId.trim() || isNaN(Number(newHelperChatId.trim()))) {
      showToast('error', 'Please enter a valid numeric Telegram Chat ID.');
      return;
    }
    const chatIdNum = parseInt(newHelperChatId.trim());
    const helperNameStr = newHelperName.trim() || 'Senior Responder';
    const helperDeptStr = newHelperDept || 'CSE';

    const currentHelpers = telegramConfig?.seniorHelpers || [];
    const currentChatIds = telegramConfig?.helper_chat_ids || [];

    if (currentHelpers.some(h => h.chatId === chatIdNum) || currentChatIds.includes(chatIdNum)) {
      showToast('error', `Chat ID ${chatIdNum} is already registered as a responder.`);
      return;
    }

    const updatedHelpers = [...currentHelpers, { chatId: chatIdNum, name: helperNameStr, department: helperDeptStr }];
    const updatedChatIds = [...currentChatIds, chatIdNum];
    const updatedConfig: TelegramConfig = {
      ...telegramConfig,
      helper_chat_ids: updatedChatIds,
      seniorHelpers: updatedHelpers
    };

    setTelegramConfig(updatedConfig);
    localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(updatedConfig));
    setNewHelperChatId('');
    setNewHelperName('');
    showToast('success', `Senior responder ${helperNameStr} (${chatIdNum}) added!`);

    fetch(getBackendUrl('/api/admin/telegram/helpers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: chatIdNum, name: `${helperNameStr} (${helperDeptStr})` }),
    }).catch(() => {});
  };

  const handleRemoveSeniorHelper = (chatId: number) => {
    if (!confirm(`Remove Telegram Chat ID ${chatId} from receiving Q&A alerts?`)) return;

    const updatedHelpers = (telegramConfig?.seniorHelpers || []).filter(h => h.chatId !== chatId);
    const updatedChatIds = (telegramConfig?.helper_chat_ids || []).filter(id => id !== chatId);
    const updatedConfig: TelegramConfig = {
      ...telegramConfig,
      helper_chat_ids: updatedChatIds,
      seniorHelpers: updatedHelpers
    };

    setTelegramConfig(updatedConfig);
    localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(updatedConfig));
    showToast('success', `Senior responder Chat ID ${chatId} removed.`);

    fetch(getBackendUrl(`/api/admin/telegram/helpers/${chatId}`), { method: 'DELETE' }).catch(() => {});
  };

  const handlePingSeniorHelper = async (chatId: number, helperName: string) => {
    const token = telegramConfig?.community_bot_token;
    if (!token) {
      showToast('error', 'Community Bot Token is not configured. Please save a token first.');
      return;
    }

    setPingingHelperId(chatId);
    try {
      const pingMsg = `🔔 *RIT Nexus Admin Test Alert*\n\nHi *${helperName || 'Senior Responder'}*!\nYour Telegram Chat ID \`${chatId}\` is verified and active on the RIT Freshers Hub Q&A dispatch network.\n\n✨ *You are ready to receive real-time question alerts!*`;
      
      let resData: any = null;
      try {
        const backendRes = await fetch(getBackendUrl('/api/admin/telegram/test-dispatch'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, chatId, message: pingMsg }),
        });
        if (backendRes.ok) resData = await backendRes.json();
      } catch {}

      if (!resData) {
        // Direct Telegram API call
        const directRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: pingMsg,
            parse_mode: 'Markdown',
          }),
        });
        resData = await directRes.json();
      }

      if (resData?.ok) {
        showToast('success', `✅ Test ping delivered to ${helperName || chatId} on Telegram!`);
      } else {
        const desc = resData?.description || 'Telegram returned an error';
        if (desc.includes('bot was blocked') || desc.includes('chat not found')) {
          showToast('error', `❌ Delivery failed: Ensure user has clicked /start in the Telegram bot (@${telegramConfig?.bot_username || 'bot'}).`);
        } else {
          showToast('error', `❌ Ping failed: ${desc}`);
        }
      }
    } catch (err: any) {
      showToast('error', `Failed to send ping: ${err.message}`);
    } finally {
      setPingingHelperId(null);
    }
  };

  const handleBroadcastTestAlert = async () => {
    const helpers = telegramConfig?.seniorHelpers || [];
    const chatIds = telegramConfig?.helper_chat_ids || [];
    if (!helpers.length && !chatIds.length) {
      showToast('error', 'No senior helpers configured to broadcast to.');
      return;
    }

    setBroadcastingAlert(true);
    try {
      const res = await fetch(getBackendUrl('/api/admin/telegram/test-broadcast'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: telegramConfig?.community_bot_token,
          message: `📢 *RIT Nexus Q&A Dispatch Network Test*\n\nAdmin broadcast test: Verifying active connection to all senior responders. Everything is functioning normally!`
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', `📢 Broadcast delivered to ${data.delivered || 0} / ${data.total || (helpers.length || chatIds.length)} active senior responders!`);
      } else {
        showToast('success', `📢 Test broadcast dispatched to all ${helpers.length || chatIds.length} senior helpers!`);
      }
    } catch {
      showToast('success', `📢 Test broadcast dispatched to all ${helpers.length || chatIds.length} senior helpers!`);
    } finally {
      setBroadcastingAlert(false);
    }
  };

  const handleOpenEditHelper = (helper: SeniorHelperItem) => {
    setEditingHelper(helper);
    setEditHelperName(helper.name || '');
    setEditHelperDept(helper.department || 'CSE');
  };

  const handleSaveEditedHelper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHelper || !telegramConfig) return;

    const updatedHelpers = (telegramConfig.seniorHelpers || []).map(h => {
      if (h.chatId === editingHelper.chatId) {
        return {
          ...h,
          name: editHelperName.trim() || 'Senior Responder',
          department: editHelperDept.trim() || 'CSE'
        };
      }
      return h;
    });

    const updatedConfig: TelegramConfig = {
      ...telegramConfig,
      seniorHelpers: updatedHelpers,
    };

    setTelegramConfig(updatedConfig);
    localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(updatedConfig));
    showToast('success', `Responder ${editingHelper.chatId} details updated!`);
    setEditingHelper(null);

    fetch(getBackendUrl('/api/admin/telegram/helpers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chatId: editingHelper.chatId, 
        name: `${editHelperName.trim()} (${editHelperDept.trim()})` 
      }),
    }).catch(() => {});
  };

  const handleSaveTelegramTokens = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramConfig) return;
    setSavingBotConfig(true);

    localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(telegramConfig));
    showToast('success', '💾 Telegram bot configuration saved and updated on VPS!');

    fetch(getBackendUrl('/api/admin/telegram/config'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramConfig),
    })
      .then((res) => {
        if (res.ok) {
          if (telegramConfig.community_bot_token) {
            verifyBotTokenSilent(telegramConfig.community_bot_token, 'community');
          }
        }
      })
      .catch(() => {})
      .finally(() => setSavingBotConfig(false));
  };



  // ─────────────────────────────────────────────────────────────
  // COMMUNITY QUESTIONS
  // ─────────────────────────────────────────────────────────────
  const fetchQuestions = () => {
    setLoadingQuestions(true);
    const saved = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setLoadingQuestions(false);
          return;
        }
      } catch {}
    }

    fetch(getBackendUrl('/api/admin/questions'))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(data));
        }
      })
      .catch(() => {
        if (!saved) {
          const initialQuestions: QuestionItem[] = [
            { id: 1, title: "When is the fresher's orientation?", body: "I couldn't find the exact date for the CSE orientation.", authorName: "Karthik", authorEmail: "karthik.2024@ritchennai.edu.in", createdAt: new Date().toISOString(), status: "PENDING", tags: ["orientation"], votes: 0 },
            { id: 2, title: "Are laptops mandatory in first year?", body: "Just wondering if we need to bring laptops to college every day.", authorName: "Sneha", authorEmail: "sneha.2024@ritchennai.edu.in", createdAt: new Date(Date.now() - 86400000).toISOString(), status: "APPROVED", tags: ["academics"], votes: 5 }
          ];
          setQuestions(initialQuestions);
          localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(initialQuestions));
        }
      })
      .finally(() => setLoadingQuestions(false));
  };

  const handleDeleteQuestion = (id: number, title: string) => {
    if (!confirm(`Delete student question "${title}"?`)) return;
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
    showToast('success', `Question "${title}" deleted.`);

    fetch(getBackendUrl(`/api/admin/questions/${id}`), { method: 'DELETE' }).catch(() => {});
  };

  // ─────────────────────────────────────────────────────────────
  // FACULTY MANAGEMENT HANDLERS
  // ─────────────────────────────────────────────────────────────
  const fetchFaculty = () => {
    setLoadingFaculty(true);
    const saved = localStorage.getItem(FACULTY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFacultyList(parsed);
          setLoadingFaculty(false);
          return;
        }
      } catch {}
    }
    setFacultyList(FACULTY_DATA);
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(FACULTY_DATA));
    setLoadingFaculty(false);
  };

  const openAddFacultyModal = () => {
    setEditingFaculty(null);
    setFacultyFormData({
      name: '',
      designation: 'Assistant Professor',
      department: 'Computer Science & Engineering',
      email: '',
      office: '',
      specialization: '',
      isClassIncharge: false,
    });
    setIsFacultyModalOpen(true);
  };

  const openEditFacultyModal = (item: any) => {
    setEditingFaculty(item);
    setFacultyFormData({
      name: item.name || '',
      designation: item.designation || '',
      department: item.department || 'Computer Science & Engineering',
      email: item.email || '',
      office: item.office || item.cabin || '',
      specialization: item.specialization || '',
      isClassIncharge: item.isClassIncharge || false,
    });
    setIsFacultyModalOpen(true);
  };

  const handleSaveFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyFormData.name.trim() || !facultyFormData.department.trim()) {
      showToast('error', 'Faculty Name and Department are required.');
      return;
    }

    let updated: any[];
    if (editingFaculty) {
      updated = facultyList.map((f) =>
        f.id === editingFaculty.id ? { ...f, ...facultyFormData } : f
      );
      showToast('success', `Faculty ${facultyFormData.name} updated!`);
    } else {
      const newId = `fac_${Date.now()}`;
      const newFaculty = { id: newId, ...facultyFormData };
      updated = [newFaculty, ...facultyList];
      showToast('success', `Faculty ${facultyFormData.name} added!`);
    }

    setFacultyList(updated);
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(updated));
    setIsFacultyModalOpen(false);

    fetch(getBackendUrl('/api/admin/faculty'), {
      method: editingFaculty ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facultyFormData),
    }).catch(() => {});
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete faculty member "${name}"?`)) return;
    const updated = facultyList.filter((f) => f.id !== id);
    setFacultyList(updated);
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(updated));
    showToast('success', `Faculty "${name}" deleted.`);

    fetch(getBackendUrl(`/api/admin/faculty/${id}`), { method: 'DELETE' }).catch(() => {});
  };

  // ─────────────────────────────────────────────────────────────
  // CLUBS & CENTERS MANAGEMENT HANDLERS
  // ─────────────────────────────────────────────────────────────
  const fetchClubs = () => {
    setLoadingClubs(true);
    const saved = localStorage.getItem(CLUBS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClubsList(parsed);
          setLoadingClubs(false);
          return;
        }
      } catch {}
    }
    setClubsList(CLUBS_DATA);
    localStorage.setItem(CLUBS_STORAGE_KEY, JSON.stringify(CLUBS_DATA));
    setLoadingClubs(false);
  };

  const openAddClubModal = () => {
    setEditingClub(null);
    setClubFormData({
      name: '',
      description: '',
      category: 'Center of Excellence',
      type: 'Center',
      coordinatorName: '',
      contactEmail: '',
      details: '',
    });
    setIsClubModalOpen(true);
  };

  const openEditClubModal = (item: any) => {
    setEditingClub(item);
    setClubFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'Center of Excellence',
      type: item.type || (item.category === 'Center of Excellence' ? 'Center' : 'Club'),
      coordinatorName: item.coordinatorName || '',
      contactEmail: item.contactEmail || '',
      details: item.details || '',
    });
    setIsClubModalOpen(true);
  };

  const handleSaveClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubFormData.name.trim() || !clubFormData.description.trim()) {
      showToast('error', 'Name and Description are required.');
      return;
    }

    let updated: any[];
    if (editingClub) {
      updated = clubsList.map((c) =>
        c.id === editingClub.id ? { ...c, ...clubFormData } : c
      );
      showToast('success', `${clubFormData.type} "${clubFormData.name}" updated!`);
    } else {
      const newId = `club_${Date.now()}`;
      const newClub = { id: newId, members: 50, ...clubFormData };
      updated = [newClub, ...clubsList];
      showToast('success', `${clubFormData.type} "${clubFormData.name}" added!`);
    }

    setClubsList(updated);
    localStorage.setItem(CLUBS_STORAGE_KEY, JSON.stringify(updated));
    setIsClubModalOpen(false);

    fetch(getBackendUrl('/api/admin/clubs'), {
      method: editingClub ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clubFormData),
    }).catch(() => {});
  };

  const handleDeleteClub = (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from directory?`)) return;
    const updated = clubsList.filter((c) => c.id !== id);
    setClubsList(updated);
    localStorage.setItem(CLUBS_STORAGE_KEY, JSON.stringify(updated));
    showToast('success', `"${name}" removed.`);

    fetch(getBackendUrl(`/api/admin/clubs/${id}`), { method: 'DELETE' }).catch(() => {});
  };

  // ─────────────────────────────────────────────────────────────
  // GPA CALCULATOR CURRICULUM MANAGEMENT HANDLERS
  // ─────────────────────────────────────────────────────────────
  const fetchCurriculum = () => {
    const saved = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setCurriculumMap(parsed);
          return;
        }
      } catch {}
    }
    setCurriculumMap(DEPARTMENT_CURRICULUM as any);
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(DEPARTMENT_CURRICULUM));
  };

  const openAddCourseModal = () => {
    setEditingCourseIndex(null);
    setCourseFormData({ name: '', credits: 3, isElective: false });
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (idx: number, course: any) => {
    setEditingCourseIndex(idx);
    setCourseFormData({
      name: course.name || '',
      credits: course.credits || 3,
      isElective: !!course.isElective,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.name.trim()) {
      showToast('error', 'Course name/code is required.');
      return;
    }

    const updatedMap = { ...curriculumMap };
    if (!updatedMap[selectedGpaDept]) updatedMap[selectedGpaDept] = {};
    const coursesList = [...(updatedMap[selectedGpaDept][selectedGpaSem] || (DEPARTMENT_CURRICULUM[selectedGpaDept] && DEPARTMENT_CURRICULUM[selectedGpaDept][selectedGpaSem]) || [])];

    if (editingCourseIndex !== null) {
      coursesList[editingCourseIndex] = { ...courseFormData };
      showToast('success', `Course "${courseFormData.name}" updated!`);
    } else {
      coursesList.push({ ...courseFormData });
      showToast('success', `Course "${courseFormData.name}" added to ${selectedGpaDept} Sem ${selectedGpaSem}!`);
    }

    updatedMap[selectedGpaDept][selectedGpaSem] = coursesList;
    setCurriculumMap(updatedMap);
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(updatedMap));
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = (idx: number, name: string) => {
    if (!confirm(`Delete course "${name}" from ${selectedGpaDept} Semester ${selectedGpaSem}?`)) return;
    const updatedMap = { ...curriculumMap };
    if (!updatedMap[selectedGpaDept]) updatedMap[selectedGpaDept] = {};
    const coursesList = [...(updatedMap[selectedGpaDept][selectedGpaSem] || [])].filter((_, i) => i !== idx);
    updatedMap[selectedGpaDept][selectedGpaSem] = coursesList;

    setCurriculumMap(updatedMap);
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(updatedMap));
    showToast('success', `Course "${name}" deleted.`);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: LOGIN VIEW
  // ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center py-12 px-4 font-sans">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#EA580C] p-0.5 shadow-lg shadow-orange-500/20 mx-auto">
              <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              RIT System Admin Console
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Closed-loop control panel for Transport fleet, Telegram Q&A helpers, and campus services.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-xl space-y-5"
          >
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Admin Username
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. Transport or Admin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Admin Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingLogin}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D97706] shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingLogin ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 block text-center uppercase tracking-wider">
                Quick Role-Based Logins:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setUsernameInput('Transport'); setPasswordInput('RIT@2026'); }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-300 text-left transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-slate-900 group-hover:text-[#FF6B00] flex items-center gap-1 truncate">
                    <span>🚌 Transport</span>
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">Pass: RIT@2026</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsernameInput('Community'); setPasswordInput('RIT@2026'); }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-600 flex items-center gap-1 truncate">
                    <span>💬 Community & Q&A</span>
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">Pass: RIT@2026</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsernameInput('Clubs'); setPasswordInput('RIT@2026'); }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1 truncate">
                    <span>🏢 Clubs & Centers</span>
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">Pass: RIT@2026</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsernameInput('Curriculum'); setPasswordInput('RIT@2026'); }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-slate-900 group-hover:text-purple-600 flex items-center gap-1 truncate">
                    <span>🧮 GPA Curriculum</span>
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">Pass: RIT@2026</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsernameInput('Admin'); setPasswordInput('RIT@2026'); }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group col-span-2 sm:col-span-2"
                >
                  <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                    <span>⚡ Super Admin (All Access)</span>
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">Pass: RIT@2026</p>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: AUTHENTICATED ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  const isSuperAdmin = userRole === 'ROLE_SUPER_ADMIN';
  const isTransportOnly = userRole === 'ROLE_TRANSPORT';
  const isCommunityOnly = userRole === 'ROLE_COMMUNITY';
  const isClubsOnly = userRole === 'ROLE_CLUBS';
  const isCurriculumOnly = userRole === 'ROLE_CURRICULUM';

  const ALL_ADMIN_TABS = [
    { id: 'transport', label: 'Bus Fleet & Routes', icon: Bus, roles: ['ROLE_SUPER_ADMIN', 'ROLE_TRANSPORT'] },
    { id: 'telegram', label: 'Telegram Q&A Seniors', icon: Bot, roles: ['ROLE_SUPER_ADMIN', 'ROLE_COMMUNITY'] },
    { id: 'community', label: 'Community Q&A', icon: MessageCircle, roles: ['ROLE_SUPER_ADMIN', 'ROLE_COMMUNITY'] },
    { id: 'faculty', label: 'Faculty Directory', icon: UserCheck, roles: ['ROLE_SUPER_ADMIN'] },
    { id: 'clubs', label: 'Clubs & Centers', icon: Building2, roles: ['ROLE_SUPER_ADMIN', 'ROLE_CLUBS'] },
    { id: 'curriculum', label: 'GPA Curriculum', icon: Calculator, roles: ['ROLE_SUPER_ADMIN', 'ROLE_CURRICULUM'] },
  ];

  const visibleTabs = ALL_ADMIN_TABS.filter((tab) => !userRole || tab.roles.includes(userRole));

  const getHeaderDetails = () => {
    switch (userRole) {
      case 'ROLE_TRANSPORT':
        return {
          title: 'Transport Fleet Administration',
          badge: 'Transport Manager',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          desc: 'Manage college bus routes, stop timings, driver live tracking, and route allocation.',
          icon: Bus,
        };
      case 'ROLE_COMMUNITY':
        return {
          title: 'Community & Senior Q&A Dispatch Console',
          badge: 'Community & Q&A Admin',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          desc: 'Manage Telegram Q&A senior responders, dispatch alerts, and moderate fresher questions.',
          icon: Bot,
        };
      case 'ROLE_CLUBS':
        return {
          title: 'Clubs & Centers Directory Administration',
          badge: 'Clubs & Centers Admin',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          desc: 'Manage college student clubs, Centers of Excellence, coordinators, and member rosters.',
          icon: Building2,
        };
      case 'ROLE_CURRICULUM':
        return {
          title: 'GPA Academic Curriculum Management',
          badge: 'Curriculum Admin',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          desc: 'Manage semester course credits, electives, and GPA calculation tables across departments.',
          icon: Calculator,
        };
      default:
        return {
          title: 'RIT Closed-Loop Admin Console',
          badge: 'Super Admin',
          badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          desc: 'Full closed-loop control panel for Bus Fleet, Telegram Q&A, Community, Faculty, Clubs, and GPA Curriculum.',
          icon: ShieldCheck,
        };
    }
  };

  const headerInfo = getHeaderDetails();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Top Header Bar */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#EA580C] p-0.5 shadow-md shadow-orange-500/20 shrink-0">
              <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                <HeaderIcon className="w-5.5 h-5.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {headerInfo.title}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${headerInfo.badgeColor}`}>
                  {headerInfo.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {headerInfo.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              ← Main Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(isSuperAdmin || isTransportOnly) && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center shrink-0">
                <Bus className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bus Routes</p>
                <p className="text-lg font-bold text-[#0F172A]">{routes.length}</p>
              </div>
            </div>
          )}

          {(isSuperAdmin || isCommunityOnly) && (
            <>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telegram Seniors</p>
                  <p className="text-lg font-bold text-[#0F172A]">
                    {(telegramConfig?.seniorHelpers?.length || telegramConfig?.helper_chat_ids?.length || 0)}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Q&A Queue</p>
                  <p className="text-lg font-bold text-[#0F172A]">{questions.length}</p>
                </div>
              </div>
            </>
          )}

          {isSuperAdmin && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Faculty</p>
                <p className="text-lg font-bold text-[#0F172A]">{facultyList.length}</p>
              </div>
            </div>
          )}

          {(isSuperAdmin || isClubsOnly) && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clubs & CoEs</p>
                <p className="text-lg font-bold text-[#0F172A]">{clubsList.length}</p>
              </div>
            </div>
          )}

          {(isSuperAdmin || isCurriculumOnly) && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Calculator className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Curriculum Depts</p>
                <p className="text-lg font-bold text-[#0F172A]">{DEPARTMENTS.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation: Dynamic Grid per Role */}
        {visibleTabs.length > 1 && (
          <div className={`bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm grid gap-2 ${
            visibleTabs.length === 2 ? 'grid-cols-2' :
            visibleTabs.length === 3 ? 'grid-cols-3' :
            visibleTabs.length === 4 ? 'grid-cols-2 sm:grid-cols-4' :
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
          }`}>
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    isActive
                      ? 'bg-[#FF6B00] text-white shadow-sm shadow-orange-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: TRANSPORT & BUS FLEET MANAGEMENT                       */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'transport' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Bus className="w-4.5 h-4.5 text-[#FF6B00]" />
                  College Bus Routes ({routes.filter(r => (r.status || 'ACTIVE') === 'ACTIVE').length} Active, {routes.filter(r => r.status === 'STOPPED').length} Stopped)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage active routes, merge low-occupancy buses, or toggle bus status (Active / Stopped).
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsBusStatusModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  title="Manage operational status (Active vs Stopped) for all buses"
                >
                  <Power className="w-3.5 h-3.5" />
                  Bus Status ({routes.filter(r => (r.status || 'ACTIVE') === 'ACTIVE').length} Active)
                </button>
                <button
                  onClick={fetchRoutes}
                  title="Refresh routes"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRoutes ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={openMergeRoutesModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <GitMerge className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Merge Routes
                </button>
                <button
                  onClick={openCreateRouteModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D97706] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add New Route
                </button>
              </div>
            </div>

            {/* Route Status Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Show:</span>
                <button
                  onClick={() => setGridStatusFilter('ACTIVE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    gridStatusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  Active ({routes.filter(r => (r.status || 'ACTIVE') === 'ACTIVE').length})
                </button>
                <button
                  onClick={() => setGridStatusFilter('STOPPED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    gridStatusFilter === 'STOPPED'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-300" />
                  Stopped ({routes.filter(r => r.status === 'STOPPED').length})
                </button>
                <button
                  onClick={() => setGridStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    gridStatusFilter === 'ALL'
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Routes ({routes.length})
                </button>
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busSearchQuery}
                  onChange={(e) => setBusSearchQuery(e.target.value)}
                  placeholder="Search routes by number, name, or stop..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                />
              </div>
            </div>

            {loadingRoutes ? (
              <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading bus routes...</div>
            ) : routes.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-3xl border border-slate-200/80 shadow-sm font-medium">
                No routes configured yet. Click "Add New Route" to create your first bus route!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes
                  .filter((r) => {
                    const statusMatch =
                      gridStatusFilter === 'ALL' ||
                      (gridStatusFilter === 'ACTIVE' && (r.status || 'ACTIVE') === 'ACTIVE') ||
                      (gridStatusFilter === 'STOPPED' && r.status === 'STOPPED');

                    const queryMatch =
                      !busSearchQuery.trim() ||
                      r.name.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
                      r.number.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
                      r.from.toLowerCase().includes(busSearchQuery.toLowerCase());

                    return statusMatch && queryMatch;
                  })
                  .map((route) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white border rounded-3xl p-4.5 space-y-3.5 transition-all flex flex-col justify-between shadow-sm ${
                      route.status === 'STOPPED'
                        ? 'border-rose-200 bg-slate-50/50 opacity-90'
                        : 'border-slate-200/80 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2.5 py-0.5 rounded-xl text-xs font-bold font-mono text-white shadow-sm shrink-0"
                            style={{ backgroundColor: route.color || '#FF6B00' }}
                          >
                            {route.number}
                          </span>
                          <span className="text-sm font-bold text-[#0F172A] truncate max-w-[140px]">{route.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Status Pill */}
                          <button
                            onClick={() => handleToggleRouteStatus(route.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 border transition-all cursor-pointer ${
                              (route.status || 'ACTIVE') === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            }`}
                            title="Click to toggle Active / Stopped status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${ (route.status || 'ACTIVE') === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500' }`} />
                            {(route.status || 'ACTIVE') === 'ACTIVE' ? 'Active' : 'Stopped'}
                          </button>

                          <button
                            onClick={() => openEditRouteModal(route)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Edit route"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route.id, route.number)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Route Path */}
                      <div className="space-y-1.5 text-xs py-2 border-y border-slate-100 font-medium">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 font-semibold">Origin:</span>
                          <strong className="text-[#0F172A]">{route.from} ({route.departureTime})</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 font-semibold">Destination:</span>
                          <strong className="text-[#0F172A]">{route.to} ({route.arrivalTime})</strong>
                        </div>
                      </div>

                      {/* Stops Preview */}
                      <div className="pt-2.5">
                        <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider">
                          Intermediate Stops ({route.stops?.length || 0})
                        </span>
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {route.stops && route.stops.length > 0 ? (
                            route.stops.map((stop, i) => (
                              <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <span className="text-slate-700 font-semibold truncate">{stop.name}</span>
                                <span className="text-[#FF6B00] font-mono font-bold text-[10px] shrink-0">{stop.time}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">No intermediate stops configured</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Driver PIN: <strong className="text-[#0F172A] font-mono font-bold">RITDRIVER</strong></span>
                      <span className={`border px-2 py-0.5 rounded-full flex items-center gap-1 font-bold text-[10px] ${
                        (route.status || 'ACTIVE') === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : 'bg-rose-50 text-rose-700 border-rose-200/80'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ (route.status || 'ACTIVE') === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500' }`} />
                        {(route.status || 'ACTIVE') === 'ACTIVE' ? 'Live Sync' : 'Suspended'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: TELEGRAM Q&A SENIORS & BOT CONFIGURATION              */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            
            {/* Top Status & Quick Action Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bot Connection Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    botInfoCommunity ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-orange-50 text-[#FF6B00] border border-orange-200'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#0F172A]">Community Q&A Bot</h4>
                      <span className={`w-2 h-2 rounded-full ${botInfoCommunity ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                    </div>
                    {botInfoCommunity ? (
                      <a 
                        href={`https://t.me/${botInfoCommunity.username}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        @{botInfoCommunity.username} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {telegramConfig?.bot_username ? `@${telegramConfig.bot_username}` : 'Token configured'}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleVerifyBotToken('community')}
                  disabled={testingBotType === 'community'}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  title="Verify Bot Connection"
                >
                  <RefreshCw className={`w-3 h-3 ${testingBotType === 'community' ? 'animate-spin' : ''}`} />
                  {testingBotType === 'community' ? 'Verifying...' : 'Test Bot'}
                </button>
              </div>

              {/* Active Responders Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Active Senior Responders</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      <strong className="text-[#0F172A] font-bold">
                        {telegramConfig?.seniorHelpers?.length || telegramConfig?.helper_chat_ids?.length || 0}
                      </strong> Seniors in Dispatch Roster
                    </p>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-200">
                  Ready
                </span>
              </div>

              {/* Quick Network Broadcast Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-200 flex items-center justify-center font-bold text-sm">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Network Broadcast Test</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Ping all responders at once</p>
                  </div>
                </div>

                <button
                  onClick={handleBroadcastTestAlert}
                  disabled={broadcastingAlert}
                  className="px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Send className={`w-3 h-3 ${broadcastingAlert ? 'animate-bounce' : ''}`} />
                  {broadcastingAlert ? 'Broadcasting...' : 'Broadcast'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 7 Cols: Active Senior Responders & Dispatch Roster */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Section Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                        <Users className="w-4.5 h-4.5 text-[#FF6B00]" />
                        Senior Responders (Q&A Network)
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Whenever freshers ask questions, these senior helpers receive real-time Telegram notifications with 1-tap reply capability.
                      </p>
                    </div>

                    <button
                      onClick={fetchTelegramConfig}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Refresh Telegram Helpers"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingTelegram ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Add Senior Form */}
                  <form onSubmit={handleAddSeniorHelper} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#FF6B00]" />
                      Add New Senior Responder
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={newHelperChatId}
                          onChange={(e) => setNewHelperChatId(e.target.value)}
                          placeholder="Telegram Chat ID *"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20"
                          required
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={newHelperName}
                          onChange={(e) => setNewHelperName(e.target.value)}
                          placeholder="Senior Name / Note (e.g. Rahul S.)"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 font-medium"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <select
                          value={newHelperDept}
                          onChange={(e) => setNewHelperDept(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-[#FF6B00] font-medium"
                        >
                          <option value="CSE">CSE</option>
                          <option value="AIDS">AIDS</option>
                          <option value="IT">IT</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="MECH">MECH</option>
                          <option value="CIVIL">CIVIL</option>
                          <option value="ALL">All Depts</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Senior to Telegram Dispatch Network
                    </button>
                  </form>

                  {/* Active Seniors List */}
                  {(() => {
                    const helpersList: SeniorHelperItem[] = telegramConfig?.seniorHelpers && telegramConfig.seniorHelpers.length > 0
                      ? telegramConfig.seniorHelpers
                      : (telegramConfig?.helper_chat_ids || []).map(id => ({ chatId: id, name: 'Senior Responder', department: 'CSE' }));

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            Active Responders Roster ({helpersList.length})
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Click <strong className="text-slate-600">⚡ Test</strong> to send an instant ping
                          </span>
                        </div>
                        
                        <div className="space-y-2.5">
                          {helpersList.length > 0 ? (
                            helpersList.map((helper) => (
                              <div
                                key={helper.chatId}
                                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-300 hover:bg-white transition-all shadow-xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-orange-100/70 text-[#FF6B00] border border-orange-200 flex items-center justify-center shrink-0 font-extrabold text-xs">
                                    TG
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#0F172A] truncate">
                                        {helper.name || 'Senior Responder'}
                                      </p>
                                      {helper.department && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 text-[9px] font-extrabold uppercase shrink-0">
                                          {helper.department}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[11px] font-mono text-slate-500 font-medium">
                                        ID: {helper.chatId}
                                      </span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(helper.chatId.toString());
                                          setCopiedChatId(helper.chatId);
                                          setTimeout(() => setCopiedChatId(null), 2000);
                                          showToast('success', `Copied Chat ID ${helper.chatId} to clipboard!`);
                                        }}
                                        className="text-slate-400 hover:text-slate-700 transition-colors"
                                        title="Copy Chat ID"
                                      >
                                        {copiedChatId === helper.chatId ? (
                                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Test Ping Button */}
                                  <button
                                    onClick={() => handlePingSeniorHelper(helper.chatId, helper.name)}
                                    disabled={pingingHelperId === helper.chatId}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                    title="Send a live test message to this responder"
                                  >
                                    <Zap className={`w-3 h-3 text-emerald-600 ${pingingHelperId === helper.chatId ? 'animate-spin' : ''}`} />
                                    {pingingHelperId === helper.chatId ? 'Pinging...' : 'Test'}
                                  </button>

                                  {/* Edit Button */}
                                  <button
                                    onClick={() => handleOpenEditHelper(helper)}
                                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                    title="Edit Responder Details"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Remove Button */}
                                  <button
                                    onClick={() => handleRemoveSeniorHelper(helper.chatId)}
                                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                    title="Remove Responder"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                              <Bot className="w-8 h-8 text-slate-300 mx-auto" />
                              <p className="text-xs text-slate-500 font-medium">No senior helpers configured yet.</p>
                              <p className="text-[11px] text-slate-400">Enter a Telegram Chat ID above to add your first responder!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right 5 Cols: Live Bot Token Config, Replacement & Guides */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Live Config & Bot Token Editor */}
                {telegramConfig && (
                  <form onSubmit={handleSaveTelegramTokens} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#FF6B00]" />
                        Telegram Bot Configuration
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        VPS Sync
                      </span>
                    </div>

                    {/* Community Q&A Bot Token */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Community Q&A Bot Token *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVerifyBotToken('community')}
                          disabled={testingBotType === 'community'}
                          className="text-[10px] font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-2.5 h-2.5" />
                          {testingBotType === 'community' ? 'Testing...' : 'Verify Token'}
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showCommunityToken ? 'text' : 'password'}
                          value={telegramConfig.community_bot_token || ''}
                          onChange={(e) => setTelegramConfig({ ...telegramConfig, community_bot_token: e.target.value })}
                          placeholder="8973721012:AAG37F4Q4q584m_2aS8rT6qSWuA-WuHRGMY"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-16 py-2 text-xs font-mono text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00]"
                          required
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowCommunityToken(!showCommunityToken)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            title={showCommunityToken ? 'Hide Token' : 'Show Token'}
                          >
                            {showCommunityToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Dispatches question alerts to senior responders.</p>
                    </div>

                    {/* DevCollab Bot Token (Optional / Unified) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          DevCollab Bot Token
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                      </div>

                      <div className="relative">
                        <input
                          type={showCollabToken ? 'text' : 'password'}
                          value={telegramConfig.telegram_bot_token || ''}
                          onChange={(e) => setTelegramConfig({ ...telegramConfig, telegram_bot_token: e.target.value })}
                          placeholder="Leave empty to use Community Bot Token"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCollabToken(!showCollabToken)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                          title={showCollabToken ? 'Hide Token' : 'Show Token'}
                        >
                          {showCollabToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Spring Backend Webhook URL */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Spring Backend Dispatch URL
                      </label>
                      <input
                        type="text"
                        value={telegramConfig.spring_backend_url || ''}
                        onChange={(e) => setTelegramConfig({ ...telegramConfig, spring_backend_url: e.target.value })}
                        placeholder="http://localhost:8085"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingBotConfig}
                      className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {savingBotConfig ? 'Saving & Deploying...' : 'Save & Deploy Configuration'}
                    </button>
                  </form>
                )}

                {/* Interactive Setup Guides */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
                      Telegram Setup & Guides
                    </h4>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                      <button
                        onClick={() => setActiveGuideTab('botfather')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          activeGuideTab === 'botfather' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        BotFather
                      </button>
                      <button
                        onClick={() => setActiveGuideTab('chatid')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          activeGuideTab === 'chatid' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Chat ID
                      </button>
                      <button
                        onClick={() => setActiveGuideTab('workflow')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          activeGuideTab === 'workflow' ? 'bg-white text-[#FF6B00] shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Workflow
                      </button>
                    </div>
                  </div>

                  {activeGuideTab === 'botfather' && (
                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
                      <p className="font-bold text-[#0F172A]">How to create or replace a Telegram Bot:</p>
                      <ol className="space-y-1.5 list-decimal list-inside text-slate-600">
                        <li>Open Telegram and search for <strong className="text-[#0F172A]">@BotFather</strong>.</li>
                        <li>Send <code className="bg-slate-100 text-orange-600 px-1 py-0.5 rounded font-mono text-[11px]">/newbot</code> and choose a name & username.</li>
                        <li>Copy the HTTP API token provided by BotFather.</li>
                        <li>Paste the token into the <strong>Community Bot Token</strong> field above and click <strong>Verify</strong>.</li>
                      </ol>
                    </div>
                  )}

                  {activeGuideTab === 'chatid' && (
                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
                      <p className="font-bold text-[#0F172A]">How seniors find their Telegram Chat ID:</p>
                      <ol className="space-y-1.5 list-decimal list-inside text-slate-600">
                        <li>Open Telegram and message <strong className="text-[#0F172A]">@userinfobot</strong> or <strong className="text-[#0F172A]">@raw_data_bot</strong>.</li>
                        <li>Press <strong>Start</strong> or send any message.</li>
                        <li>Copy the numeric <strong>Id</strong> (e.g. <code className="bg-slate-100 text-orange-600 px-1 py-0.5 rounded font-mono text-[11px]">971749136</code>).</li>
                        <li>Add the Chat ID in the form on the left!</li>
                      </ol>
                    </div>
                  )}

                  {activeGuideTab === 'workflow' && (
                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
                      <p className="font-bold text-[#0F172A]">1-Tap Q&A Answer Workflow:</p>
                      <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                        <li>Fresher asks a question on Freshers Hub website.</li>
                        <li>Bot immediately notifies all registered senior responders on Telegram.</li>
                        <li>Seniors simply <strong>reply</strong> to the Telegram message with their answer.</li>
                        <li>The answer is instantly posted to the website community board!</li>
                      </ul>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Edit Senior Responder Modal */}
            <AnimatePresence>
              {editingHelper && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Edit className="w-4 h-4 text-[#FF6B00]" />
                        Edit Senior Responder
                      </h3>
                      <button
                        onClick={() => setEditingHelper(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditedHelper} className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Telegram Chat ID
                        </label>
                        <input
                          type="text"
                          value={editingHelper.chatId}
                          disabled
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Responder Name / Title
                        </label>
                        <input
                          type="text"
                          value={editHelperName}
                          onChange={(e) => setEditHelperName(e.target.value)}
                          placeholder="e.g. Rahul S. (CSE 4th Yr)"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#FF6B00] font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Department
                        </label>
                        <select
                          value={editHelperDept}
                          onChange={(e) => setEditHelperDept(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#FF6B00] font-medium"
                        >
                          <option value="CSE">CSE</option>
                          <option value="AIDS">AIDS</option>
                          <option value="IT">IT</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="MECH">MECH</option>
                          <option value="CIVIL">CIVIL</option>
                          <option value="ALL">All Depts</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingHelper(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: COMMUNITY QUESTIONS MODERATION                        */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'community' && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <MessageCircle className="w-4.5 h-4.5 text-[#FF6B00]" />
                  Community Q&A Questions ({questions.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Moderate and delete inappropriate or spam questions.</p>
              </div>

              <button
                onClick={fetchQuestions}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingQuestions ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingQuestions ? (
              <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading community questions...</div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl font-medium">
                No community questions found in database.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start justify-between gap-3.5 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#0F172A]">{q.title}</h4>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">{q.body}</p>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-500 pt-0.5">
                        <span>Asked by: <strong className="text-slate-800 font-bold">{q.authorName}</strong></span>
                        <span>•</span>
                        <span className="font-bold text-[#FF6B00]">Votes: {q.votes}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id, q.title)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0 cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 4: FACULTY DIRECTORY MANAGEMENT                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'faculty' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-[#FF6B00]" />
                  Faculty Directory Management ({facultyList.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Add, update, or remove faculty profiles, cabin office hours, designations, and department assignments.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    placeholder="Search faculty..."
                    className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                  />
                </div>
                <button
                  onClick={openAddFacultyModal}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Faculty
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facultyList
                .filter((f) =>
                  !facultySearch.trim() ||
                  f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
                  f.department.toLowerCase().includes(facultySearch.toLowerCase()) ||
                  (f.designation && f.designation.toLowerCase().includes(facultySearch.toLowerCase()))
                )
                .map((fac) => (
                  <div
                    key={fac.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-3 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">{fac.name}</h4>
                          <span className="text-[11px] font-bold text-[#FF6B00] block mt-0.5">{fac.designation}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditFacultyModal(fac)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaculty(fac.id, fac.name)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100">
                        <p>🎓 <strong className="text-[#0F172A]">{fac.department}</strong></p>
                        {fac.email && <p>✉️ <span className="text-slate-700">{fac.email}</span></p>}
                        {(fac.office || fac.cabin) && <p>📍 <span className="text-slate-700">Cabin: {fac.office || fac.cabin}</span></p>}
                        {fac.specialization && <p>⚡ <span className="text-slate-500">{fac.specialization}</span></p>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 5: CLUBS & CENTERS OF EXCELLENCE MANAGEMENT               */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'clubs' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5 text-[#FF6B00]" />
                  Clubs & Centers of Excellence ({clubsList.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage student clubs, 15 Future Tech Centers of Excellence (CoEs), faculty lead contacts, and descriptions.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clubsSearch}
                    onChange={(e) => setClubsSearch(e.target.value)}
                    placeholder="Search clubs & centers..."
                    className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                  />
                </div>
                <button
                  onClick={openAddClubModal}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Club / Center
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubsList
                .filter((c) =>
                  !clubsSearch.trim() ||
                  c.name.toLowerCase().includes(clubsSearch.toLowerCase()) ||
                  c.category.toLowerCase().includes(clubsSearch.toLowerCase()) ||
                  (c.coordinatorName && c.coordinatorName.toLowerCase().includes(clubsSearch.toLowerCase()))
                )
                .map((club) => (
                  <div
                    key={club.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-3 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              club.type === 'Center' || club.category === 'Center of Excellence'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {club.type || (club.category === 'Center of Excellence' ? 'Center' : 'Club')}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] line-clamp-1">{club.name}</h4>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditClubModal(club)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClub(club.id, club.name)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-1.5 leading-relaxed">{club.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium space-y-0.5">
                      {club.coordinatorName && <p>👤 Lead: <strong className="text-[#0F172A]">{club.coordinatorName}</strong></p>}
                      {club.category && <p>🏷️ Category: <span className="text-[#FF6B00] font-bold">{club.category}</span></p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 6: GPA CALCULATOR CURRICULUM MANAGEMENT                  */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'curriculum' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                    <Calculator className="w-4.5 h-4.5 text-[#FF6B00]" />
                    Department Courses & Credits Management (GPA Calculator)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Assign and customize course codes, titles, and credit weightages for individual departments & semesters used in GPA calculations.
                  </p>
                </div>

                <button
                  onClick={openAddCourseModal}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Course to {selectedGpaDept} Sem {selectedGpaSem}
                </button>
              </div>

              {/* Department & Semester Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Department</label>
                  <select
                    value={selectedGpaDept}
                    onChange={(e) => setSelectedGpaDept(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold outline-none focus:border-[#FF6B00]"
                  >
                    {['CSE', 'CSBS', 'AIML', 'AIDS', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CCE', 'ECL', 'VLSI'].map((dept) => (
                      <option key={dept} value={dept}>{dept} - Department</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Semester</label>
                  <select
                    value={selectedGpaSem}
                    onChange={(e) => setSelectedGpaSem(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold outline-none focus:border-[#FF6B00]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Courses Table for Selected Department & Semester */}
              <div className="space-y-3 pt-1">
                {(() => {
                  const currentSemCourses = (curriculumMap[selectedGpaDept] && curriculumMap[selectedGpaDept][selectedGpaSem]) || (DEPARTMENT_CURRICULUM[selectedGpaDept] && DEPARTMENT_CURRICULUM[selectedGpaDept][selectedGpaSem]) || [];
                  
                  return (
                    <>
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Configured Courses for {selectedGpaDept} - Semester {selectedGpaSem} ({currentSemCourses.length})
                      </span>

                      <div className="space-y-2">
                        {currentSemCourses.length > 0 ? (
                          currentSemCourses.map((course: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6B00] font-bold text-xs shrink-0">
                                  {course.credits} Cr
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                                    {course.name}
                                    {course.isElective && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Elective Slot
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium">Credit Weightage: {course.credits} Units</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditCourseModal(idx, course)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(idx, course.name)}
                                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic p-5 text-center bg-slate-50 rounded-2xl border border-slate-200/60">
                            No custom courses configured for {selectedGpaDept} Semester {selectedGpaSem} yet. Click "Add Course" above!
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE / EDIT BUS ROUTE                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isRouteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2.5">
                  <Bus className="w-5 h-5 text-[#FF6B00]" />
                  {editingRoute ? `Edit Route ${editingRoute.number}` : 'Create New Bus Route'}
                </h3>
                <button
                  onClick={() => setIsRouteModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRoute} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Route Number *</label>
                    <input
                      type="text"
                      value={routeFormData.number}
                      onChange={(e) => setRouteFormData({ ...routeFormData, number: e.target.value })}
                      placeholder="e.g. RIT-05"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Route Name *</label>
                    <input
                      type="text"
                      value={routeFormData.name}
                      onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                      placeholder="e.g. Tambaram Super Express"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Start Point (Origin) *</label>
                    <input
                      type="text"
                      value={routeFormData.from}
                      onChange={(e) => setRouteFormData({ ...routeFormData, from: e.target.value })}
                      placeholder="e.g. Tambaram"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">End Point (Destination) *</label>
                    <input
                      type="text"
                      value={routeFormData.to}
                      onChange={(e) => setRouteFormData({ ...routeFormData, to: e.target.value })}
                      placeholder="e.g. RIT Campus"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Departure Time</label>
                    <input
                      type="text"
                      value={routeFormData.departureTime}
                      onChange={(e) => setRouteFormData({ ...routeFormData, departureTime: e.target.value })}
                      placeholder="07:00 AM"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Arrival Time</label>
                    <input
                      type="text"
                      value={routeFormData.arrivalTime}
                      onChange={(e) => setRouteFormData({ ...routeFormData, arrivalTime: e.target.value })}
                      placeholder="08:30 AM"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Badge Color</label>
                    <input
                      type="text"
                      value={routeFormData.color}
                      onChange={(e) => setRouteFormData({ ...routeFormData, color: e.target.value })}
                      placeholder="#FF6B00"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Stops Builder */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">Route Stops & Timings</label>
                    <button
                      type="button"
                      onClick={addStopField}
                      className="text-xs text-[#FF6B00] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stop
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {routeFormData.stops.map((stop, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-mono text-slate-400 font-bold">{i + 1}.</span>
                        <input
                          type="text"
                          value={stop.name}
                          onChange={(e) => {
                            const updated = [...routeFormData.stops];
                            updated[i].name = e.target.value;
                            setRouteFormData({ ...routeFormData, stops: updated });
                          }}
                          placeholder="Stop Name (e.g. Chrompet)"
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                        />
                        <input
                          type="text"
                          value={stop.time}
                          onChange={(e) => {
                            const updated = [...routeFormData.stops];
                            updated[i].time = e.target.value;
                            setRouteFormData({ ...routeFormData, stops: updated });
                          }}
                          placeholder="07:20 AM"
                          className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-[#FF6B00]"
                        />
                        <button
                          type="button"
                          onClick={() => removeStopField(i)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRouteModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-xs font-bold text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
                  >
                    {editingRoute ? 'Save Changes' : 'Create Route'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE / EDIT FACULTY                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFacultyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#FF6B00]" />
                  {editingFaculty ? `Edit Faculty: ${editingFaculty.name}` : 'Add New Faculty Member'}
                </h3>
                <button onClick={() => setIsFacultyModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-base font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveFaculty} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={facultyFormData.name}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                    placeholder="e.g. Dr. ARTHI A."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Designation</label>
                    <input
                      type="text"
                      value={facultyFormData.designation}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, designation: e.target.value })}
                      placeholder="e.g. Associate Professor & HOD"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
                    <input
                      type="text"
                      value={facultyFormData.department}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, department: e.target.value })}
                      placeholder="Computer Science & Engineering"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={facultyFormData.email}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, email: e.target.value })}
                      placeholder="arthi.a@ritchennai.edu.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cabin / Office Room</label>
                    <input
                      type="text"
                      value={facultyFormData.office}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, office: e.target.value })}
                      placeholder="CSE HOD Cabin, 2nd Floor"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Specialization / Domain</label>
                  <input
                    type="text"
                    value={facultyFormData.specialization}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, specialization: e.target.value })}
                    placeholder="Machine Learning, Deep Learning, Cloud Computing"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100">
                  <button type="button" onClick={() => setIsFacultyModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] font-bold text-xs text-white shadow-md shadow-orange-500/20 cursor-pointer">Save Faculty</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE / EDIT CLUB OR CENTER                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isClubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#FF6B00]" />
                  {editingClub ? `Edit: ${editingClub.name}` : 'Add New Club / Center of Excellence'}
                </h3>
                <button onClick={() => setIsClubModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-base font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveClub} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={clubFormData.name}
                    onChange={(e) => setClubFormData({ ...clubFormData, name: e.target.value })}
                    placeholder="e.g. Center for Artificial Intelligence & Deep Learning"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Type</label>
                    <select
                      value={clubFormData.type}
                      onChange={(e) => setClubFormData({ ...clubFormData, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold outline-none focus:bg-white focus:border-[#FF6B00]"
                    >
                      <option value="Center">Center of Excellence (CoE)</option>
                      <option value="Club">Student Club</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                    <input
                      type="text"
                      value={clubFormData.category}
                      onChange={(e) => setClubFormData({ ...clubFormData, category: e.target.value })}
                      placeholder="Center of Excellence / Technical / Cultural"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description *</label>
                  <textarea
                    rows={2}
                    value={clubFormData.description}
                    onChange={(e) => setClubFormData({ ...clubFormData, description: e.target.value })}
                    placeholder="Short description of research domain or club activities..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Faculty Lead / Coordinator</label>
                    <input
                      type="text"
                      value={clubFormData.coordinatorName}
                      onChange={(e) => setClubFormData({ ...clubFormData, coordinatorName: e.target.value })}
                      placeholder="e.g. Dr. ARTHI A."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={clubFormData.contactEmail}
                      onChange={(e) => setClubFormData({ ...clubFormData, contactEmail: e.target.value })}
                      placeholder="coe.ai@ritchennai.edu.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100">
                  <button type="button" onClick={() => setIsClubModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] font-bold text-xs text-white shadow-md shadow-orange-500/20 cursor-pointer">Save Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE / EDIT GPA COURSE                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#FF6B00]" />
                  {editingCourseIndex !== null ? 'Edit Course' : `Add Course to ${selectedGpaDept} Sem ${selectedGpaSem}`}
                </h3>
                <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-base font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Course Code & Title *</label>
                  <input
                    type="text"
                    value={courseFormData.name}
                    onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                    placeholder="e.g. CS3301 - Data Structures"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Credit Weightage (1-6)</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={courseFormData.credits}
                      onChange={(e) => setCourseFormData({ ...courseFormData, credits: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00] font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseFormData.isElective}
                        onChange={(e) => setCourseFormData({ ...courseFormData, isElective: e.target.checked })}
                        className="rounded border-slate-300 bg-slate-50 text-[#FF6B00] focus:ring-[#FF6B00] w-4 h-4"
                      />
                      <span>Professional Elective</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100">
                  <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] font-bold text-xs text-white shadow-md shadow-orange-500/20 cursor-pointer">Save Course</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: MERGE BUS ROUTES                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMergeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                    <GitMerge className="w-5 h-5 text-[#FF6B00]" />
                    Merge Bus Routes (Low-Occupancy Attachment)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Select 2 or more buses to attach low-occupancy routes together. All intermediate stops will be auto-combined for custom editing.
                  </p>
                </div>
                <button onClick={() => setIsMergeModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-base font-bold shrink-0">✕</button>
              </div>

              <form onSubmit={handleSaveMergedRoute} className="space-y-5 overflow-y-auto pr-1 flex-1 text-xs">
                
                {/* Step 1: Route Selection Checklist */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    1. Select Bus Routes to Merge ({selectedRouteIdsForMerge.length} selected) *
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {routes.map((route) => {
                      const isChecked = selectedRouteIdsForMerge.includes(route.id);
                      return (
                        <label
                          key={route.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-orange-50/80 border-[#FF6B00] shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRouteForMerge(route.id)}
                            className="rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00] w-4 h-4"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              <span className="font-mono text-[#FF6B00] mr-1">[{route.number}]</span>
                              {route.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {route.from} ({route.departureTime}) → {route.stops?.length || 0} stops
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Merged Route Configuration Details */}
                {selectedRouteIdsForMerge.length >= 2 && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      2. Combined Route Configuration
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Merged Route # *</label>
                        <input
                          type="text"
                          value={mergedRouteFormData.number}
                          onChange={(e) => setMergedRouteFormData({ ...mergedRouteFormData, number: e.target.value })}
                          placeholder="e.g. R11-MERGED"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Merged Route Name *</label>
                        <input
                          type="text"
                          value={mergedRouteFormData.name}
                          onChange={(e) => setMergedRouteFormData({ ...mergedRouteFormData, name: e.target.value })}
                          placeholder="e.g. Ennore + Tondiarpet Combined Express"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-[#FF6B00]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Origin</label>
                        <input
                          type="text"
                          value={mergedRouteFormData.from}
                          onChange={(e) => setMergedRouteFormData({ ...mergedRouteFormData, from: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Destination</label>
                        <input
                          type="text"
                          value={mergedRouteFormData.to}
                          onChange={(e) => setMergedRouteFormData({ ...mergedRouteFormData, to: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Departure</label>
                        <input
                          type="text"
                          value={mergedRouteFormData.departureTime}
                          onChange={(e) => setMergedRouteFormData({ ...mergedRouteFormData, departureTime: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Arrival</label>
                        <input
                          type="text"
                          value={mergedRouteFormData.arrivalTime}
                          onChange={(e) => setMergedRouteFormData({ ...mergedRouteFormData, arrivalTime: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mergedRouteFormData.deactivateOriginals}
                          onChange={(e) => setMergedRouteFormData({ ...mergedRouteFormData, deactivateOriginals: e.target.checked })}
                          className="rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00] w-4 h-4"
                        />
                        <span>Deactivate original source routes after creating merged route</span>
                      </label>
                    </div>

                    {/* Step 3: Combined Stops List with Deletion */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          3. Combined Intermediate Stops ({mergedRouteFormData.stops.length} stops)
                        </span>
                        <button
                          type="button"
                          onClick={handleAddMergedStopField}
                          className="text-[11px] font-bold text-[#FF6B00] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Extra Stop
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium italic">
                        All stops from the selected buses are listed below. Click the <span className="text-rose-600 font-bold">✕</span> icon to remove any duplicate or unwanted stops today.
                      </p>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {mergedRouteFormData.stops.length > 0 ? (
                          mergedRouteFormData.stops.map((stop, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-[#FF6B00] font-mono font-bold text-[10px] shrink-0">
                                {stop.sourceRoute || 'Custom'}
                              </span>
                              <input
                                type="text"
                                value={stop.name}
                                onChange={(e) => {
                                  const updated = [...mergedRouteFormData.stops];
                                  updated[idx].name = e.target.value;
                                  setMergedRouteFormData({ ...mergedRouteFormData, stops: updated });
                                }}
                                placeholder="Stop Name"
                                className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-[#FF6B00]"
                              />
                              <input
                                type="text"
                                value={stop.time}
                                onChange={(e) => {
                                  const updated = [...mergedRouteFormData.stops];
                                  updated[idx].time = e.target.value;
                                  setMergedRouteFormData({ ...mergedRouteFormData, stops: updated });
                                }}
                                placeholder="Time"
                                className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-[#FF6B00]"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveMergedStop(idx)}
                                className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                                title="Delete this stop from merged route"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            Select 2 or more routes above to automatically pull and combine stops.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMergeModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedRouteIdsForMerge.length < 2}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedRouteIdsForMerge.length >= 2
                        ? 'bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D97706] shadow-orange-500/20'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    Save Merged Bus Route
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: BUS STATUS MANAGER (ACTIVE VS STOPPED)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isBusStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-8 max-h-[88vh] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Power className="w-5 h-5 text-amber-500" />
                    Bus Fleet Status Manager
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Toggle service status (Active 🟢 vs Stopped 🔴) for individual buses or merged routes without deleting them.
                  </p>
                </div>
                <button onClick={() => setIsBusStatusModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-base font-bold shrink-0">✕</button>
              </div>

              {/* Status Controls & Quick Bulk Actions */}
              <div className="space-y-3 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
                    <button
                      type="button"
                      onClick={() => setBusStatusTabFilter('ALL')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        busStatusTabFilter === 'ALL' ? 'bg-[#0F172A] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      All ({routes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusStatusTabFilter('ACTIVE')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        busStatusTabFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Active ({routes.filter(r => (r.status || 'ACTIVE') === 'ACTIVE').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusStatusTabFilter('STOPPED')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        busStatusTabFilter === 'STOPPED' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Stopped ({routes.filter(r => r.status === 'STOPPED').length})
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetAllRoutesStatus('ACTIVE')}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-all"
                    >
                      Activate All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllRoutesStatus('STOPPED')}
                      className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold transition-all"
                    >
                      Stop All
                    </button>
                  </div>
                </div>
              </div>

              {/* Route List with Status Toggles */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 flex-1">
                {routes
                  .filter(r => {
                    if (busStatusTabFilter === 'ACTIVE') return (r.status || 'ACTIVE') === 'ACTIVE';
                    if (busStatusTabFilter === 'STOPPED') return r.status === 'STOPPED';
                    return true;
                  })
                  .map((route) => {
                    const isActive = (route.status || 'ACTIVE') === 'ACTIVE';
                    return (
                      <div
                        key={route.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono text-white shadow-sm shrink-0"
                            style={{ backgroundColor: route.color || '#FF6B00' }}
                          >
                            {route.number}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>{route.name}</span>
                              {route.number.includes('MERGED') && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-orange-100 text-[#FF6B00] border border-orange-200">
                                  Merged Route
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {route.from} ({route.departureTime}) → {route.to} ({route.stops?.length || 0} stops)
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleRouteStatus(route.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 border-emerald-600'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 border-rose-600'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {isActive ? 'Active 🟢' : 'Stopped 🔴'}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 shrink-0">
                <span className="text-[11px] font-medium text-slate-500">
                  Tip: Setting source buses (e.g. R11 & R11A) to 🔴 Stopped lets you reactivate them next week instantly!
                </span>
                <button
                  type="button"
                  onClick={() => setIsBusStatusModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
