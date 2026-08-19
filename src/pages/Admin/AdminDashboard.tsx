import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, User, LogOut, Mail, Plus, Trash2, 
  CheckCircle2, AlertCircle, RefreshCw, Bus, Send, 
  MessageCircle, BookOpen, Bot, Edit, MapPin, 
  Clock, Palette, KeyRound, ExternalLink, ArrowRight, 
  Code2, Check, HelpCircle, Users, Activity
} from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';


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
  stops?: BusStopItem[];
}

interface SeniorHelperItem {
  chatId: number;
  name: string;
}

interface TelegramConfig {
  community_bot_token?: string;
  telegram_bot_token?: string;
  spring_backend_url?: string;
  helper_chat_ids?: number[];
  seniorHelpers?: SeniorHelperItem[];
}

const ROUTE_STORAGE_KEY = 'RIT_LOCAL_BUS_ROUTES';
const TELEGRAM_STORAGE_KEY = 'RIT_LOCAL_TELEGRAM_CONFIG';
const NOTES_STORAGE_KEY = 'RIT_LOCAL_NOTES';
const QUESTIONS_STORAGE_KEY = 'RIT_LOCAL_QUESTIONS';
const RECIPIENTS_STORAGE_KEY = 'RIT_LOCAL_RECIPIENTS';

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
  tags: string[];
  votes: number;
}

export default function AdminDashboard() {
  const { user, loginWithCredentials, logout: authLogout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'ROLE_TRANSPORT' | 'ROLE_SUPER_ADMIN' | null>(null);
  const [usernameDisplay, setUsernameDisplay] = useState('Admin');
  
  // Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'transport' | 'telegram' | 'notes' | 'community' | 'subscribers'>('transport');

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

  // Telegram Q&A State
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);
  const [loadingTelegram, setLoadingTelegram] = useState(false);
  const [newHelperChatId, setNewHelperChatId] = useState('');
  const [newHelperName, setNewHelperName] = useState('');
  const [savingBotConfig, setSavingBotConfig] = useState(false);

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

  // Restore session from AuthContext or localStorage
  useEffect(() => {
    if (user?.role === 'ROLE_TRANSPORT' || user?.role === 'ROLE_SUPER_ADMIN') {
      setIsLoggedIn(true);
      setUserRole(user.role);
      setUsernameDisplay(user.name);
      if (user.role === 'ROLE_TRANSPORT') {
        setActiveTab('transport');
      }
      return;
    }

    const savedRole = localStorage.getItem('RIT_ADMIN_ROLE') as any;
    const savedToken = localStorage.getItem('RIT_ADMIN_TOKEN');
    if (savedToken && (savedRole === 'ROLE_TRANSPORT' || savedRole === 'ROLE_SUPER_ADMIN')) {
      setIsLoggedIn(true);
      setUserRole(savedRole);
      setUsernameDisplay(localStorage.getItem('RIT_ADMIN_USER') || (savedRole === 'ROLE_TRANSPORT' ? 'Transport Admin' : 'Super Admin'));
      if (savedRole === 'ROLE_TRANSPORT') {
        setActiveTab('transport');
      }
    }
  }, [user]);

  // Fetch data when activeTab changes
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === 'transport') fetchRoutes();
    if (activeTab === 'telegram') fetchTelegramConfig();
    if (activeTab === 'notes') fetchNotes();
    if (activeTab === 'community') fetchQuestions();
    if (activeTab === 'subscribers') fetchRecipients();
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
      if (result.success && (result.role === 'ROLE_TRANSPORT' || result.role === 'ROLE_SUPER_ADMIN')) {
        setIsLoggedIn(true);
        setUserRole(result.role as any);
        setUsernameDisplay(result.role === 'ROLE_TRANSPORT' ? 'Transport Admin' : 'Super Admin');
        setActiveTab('transport');
      } else {
        setLoginError(result.message || 'Invalid admin credentials. Use Transport or Admin with password RIT@2026.');
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
  // TELEGRAM BOT & SENIOR HELPERS HANDLERS
  // ─────────────────────────────────────────────────────────────
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

    fetch(getBackendUrl('/api/admin/telegram/config'))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch from backend');
        return res.json();
      })
      .then((data) => {
        setTelegramConfig(data);
        localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(data));
      })
      .catch(() => {
        if (localConfig) {
          setTelegramConfig(localConfig);
        } else {
          const defaultConfig: TelegramConfig = {
            community_bot_token: '7829148291:AAH_rit_community_bot_token_sample',
            spring_backend_url: 'https://rit-services.in/api',
            helper_chat_ids: [971749136, 982314512],
            seniorHelpers: [
              { chatId: 971749136, name: 'Rahul (CSE 4th Yr)' },
              { chatId: 982314512, name: 'Sneha (ECE 3rd Yr)' }
            ]
          };
          setTelegramConfig(defaultConfig);
          localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(defaultConfig));
        }
      })
      .finally(() => setLoadingTelegram(false));
  };

  const handleAddSeniorHelper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelperChatId.trim() || isNaN(Number(newHelperChatId.trim()))) {
      showToast('error', 'Please enter a valid numeric Telegram Chat ID.');
      return;
    }
    const chatIdNum = parseInt(newHelperChatId.trim());
    const helperNameStr = newHelperName.trim() || 'Senior Responder';

    const currentHelpers = telegramConfig?.seniorHelpers || [];
    const currentChatIds = telegramConfig?.helper_chat_ids || [];

    if (currentHelpers.some(h => h.chatId === chatIdNum) || currentChatIds.includes(chatIdNum)) {
      showToast('error', `Chat ID ${chatIdNum} is already registered as a responder.`);
      return;
    }

    const updatedHelpers = [...currentHelpers, { chatId: chatIdNum, name: helperNameStr }];
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
      body: JSON.stringify({ chatId: chatIdNum, name: helperNameStr }),
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

  const handleSaveTelegramTokens = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramConfig) return;
    setSavingBotConfig(true);

    localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(telegramConfig));
    showToast('success', 'Telegram bot configuration updated!');

    fetch(getBackendUrl('/api/admin/telegram/config'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramConfig),
    })
      .catch(() => {})
      .finally(() => setSavingBotConfig(false));
  };

  // ─────────────────────────────────────────────────────────────
  // NOTES & STUDY MATERIALS
  // ─────────────────────────────────────────────────────────────
  const fetchNotes = () => {
    setLoadingNotes(true);
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          setLoadingNotes(false);
        }
      } catch {}
    }

    fetch(getBackendUrl('/api/admin/notes'))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNotes(data);
          localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(data));
        }
      })
      .catch(() => {
        if (!saved) {
          const initialNotes: NoteItem[] = [
            { id: 1, title: 'Data Structures Unit 1 Notes', subject: 'CS3301', authorName: 'Dr. ARTHI A.', department: 'AI&DS', fileUrl: '#', semester: 3, uploadDate: new Date().toISOString() },
            { id: 2, title: 'Matrices PYQ 2023', subject: 'MA3151', authorName: 'Prof. Senthil', department: 'S&H', fileUrl: '#', semester: 1, uploadDate: new Date(Date.now() - 86400000).toISOString() }
          ];
          setNotes(initialNotes);
          localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(initialNotes));
        }
      })
      .finally(() => setLoadingNotes(false));
  };

  const handleDeleteNote = (id: number, title: string) => {
    if (!confirm(`Delete study note "${title}"?`)) return;
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
    showToast('success', `Study note "${title}" deleted.`);

    fetch(getBackendUrl(`/api/admin/notes/${id}`), { method: 'DELETE' }).catch(() => {});
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
            { id: 1, title: "When is the fresher's orientation?", content: "I couldn't find the exact date for the CSE orientation.", authorName: "Karthik", authorEmail: "karthik.2024@ritchennai.edu.in", createdAt: new Date().toISOString(), status: "PENDING", tags: ["orientation"], votes: 0 },
            { id: 2, title: "Are laptops mandatory in first year?", content: "Just wondering if we need to bring laptops to college every day.", authorName: "Sneha", authorEmail: "sneha.2024@ritchennai.edu.in", createdAt: new Date(Date.now() - 86400000).toISOString(), status: "APPROVED", tags: ["academics"], votes: 5 }
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
  // DEPLOYMENT SUBSCRIBERS
  // ─────────────────────────────────────────────────────────────
  const fetchRecipients = () => {
    setLoadingRecipients(true);
    const saved = localStorage.getItem(RECIPIENTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecipients(parsed);
          setLoadingRecipients(false);
        }
      } catch {}
    }

    fetch(getBackendUrl('/api/admin/recipients'))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRecipients(data);
          localStorage.setItem(RECIPIENTS_STORAGE_KEY, JSON.stringify(data));
        }
      })
      .catch(() => {
        if (!saved) {
          const initialRecipients = ['devops@ritchennai.edu.in', 'admin@ritchennai.edu.in'];
          setRecipients(initialRecipients);
          localStorage.setItem(RECIPIENTS_STORAGE_KEY, JSON.stringify(initialRecipients));
        }
      })
      .finally(() => setLoadingRecipients(false));
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showToast('error', 'Please enter a valid email address');
      return;
    }
    const updated = [...recipients, newEmail.trim()];
    setRecipients(updated);
    localStorage.setItem(RECIPIENTS_STORAGE_KEY, JSON.stringify(updated));
    setNewEmail('');
    showToast('success', `Recipient ${newEmail.trim()} added!`);

    fetch(getBackendUrl('/api/admin/recipients'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim() }),
    }).catch(() => {});
  };

  const handleRemoveRecipient = (email: string) => {
    if (!confirm(`Remove ${email} from deployment notifications?`)) return;
    const updated = recipients.filter((r) => r !== email);
    setRecipients(updated);
    localStorage.setItem(RECIPIENTS_STORAGE_KEY, JSON.stringify(updated));
    showToast('success', `Recipient ${email} removed.`);

    fetch(getBackendUrl(`/api/admin/recipients?email=${encodeURIComponent(email)}`), { method: 'DELETE' }).catch(() => {});
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: LOGIN VIEW
  // ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] p-0.5 shadow-xl shadow-orange-500/20 mx-auto">
              <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              RIT System Admin Console
            </h1>
            <p className="text-xs text-slate-400">
              Closed-loop control panel for Transport fleet, Telegram Q&A helpers, and campus services.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
          >
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  Admin Username
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. Transport or Admin"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                  Admin Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingLogin}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-95 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block text-center">
                Quick Role-Based Logins:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setUsernameInput('Transport'); setPasswordInput('RIT@2026'); }}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/5 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-orange-400">🚌 Transport</p>
                  <p className="text-[10px] text-slate-400">Pass: RIT@2026</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsernameInput('Admin'); setPasswordInput('RIT@2026'); }}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/5 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-emerald-400">⚡ Super Admin</p>
                  <p className="text-[10px] text-slate-400">Pass: RIT@2026</p>
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
  const isTransportOnly = userRole === 'ROLE_TRANSPORT';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/90 border-red-500/40 text-red-300'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] p-0.5 shadow-lg shadow-orange-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center">
                {isTransportOnly ? <Bus className="w-6 h-6 text-white" /> : <ShieldCheck className="w-6 h-6 text-white" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  {isTransportOnly ? 'Transport Fleet Administration' : 'RIT Closed-Loop Admin Console'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  isTransportOnly ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {isTransportOnly ? 'Transport Manager' : 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isTransportOnly 
                  ? 'Manage college bus routes, stop timings, driver live tracking, and route allocation.'
                  : 'Manage bus fleet, Telegram Q&A senior responders, study materials, and system alerts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 border border-white/10 transition-colors"
            >
              ← Main Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        {!isTransportOnly && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            {[
              { id: 'transport', label: 'Bus Fleet & Routes', icon: Bus },
              { id: 'telegram', label: 'Telegram Q&A Seniors', icon: Bot },
              { id: 'notes', label: 'Notes & Study Materials', icon: BookOpen },
              { id: 'community', label: 'Community Q&A Moderation', icon: MessageCircle },
              { id: 'subscribers', label: 'Deployment Email Alerts', icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: TRANSPORT & BUS FLEET MANAGEMENT                       */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'transport' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bus className="w-5 h-5 text-orange-400" />
                  College Bus Routes ({routes.length} Active)
                </h3>
                <p className="text-xs text-slate-400">
                  Edit departure times, intermediate stops, colors, or create and delete routes instantly.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRoutes}
                  title="Refresh routes"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRoutes ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={openCreateRouteModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add New Route
                </button>
              </div>
            </div>

            {/* Route Search Filter */}
            <div className="relative">
              <input
                type="text"
                value={busSearchQuery}
                onChange={(e) => setBusSearchQuery(e.target.value)}
                placeholder="Search routes by number (e.g. R01, RIT-01), name, or origin..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {loadingRoutes ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading bus routes...</div>
            ) : routes.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-white/10">
                No routes configured yet. Click "Add New Route" to create your first bus route!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {routes
                  .filter(
                    (r) =>
                      !busSearchQuery.trim() ||
                      r.name.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
                      r.number.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
                      r.from.toLowerCase().includes(busSearchQuery.toLowerCase())
                  )
                  .map((route) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2.5 py-1 rounded-xl text-xs font-black font-mono text-white shadow-sm"
                            style={{ backgroundColor: route.color || '#FF6B00' }}
                          >
                            {route.number}
                          </span>
                          <span className="text-xs font-bold text-white truncate max-w-[160px]">{route.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditRouteModal(route)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit route"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route.id, route.number)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                            title="Delete route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Route Path */}
                      <div className="space-y-2 text-xs py-2 border-y border-white/10">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Origin:</span>
                          <strong className="text-white">{route.from} ({route.departureTime})</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Destination:</span>
                          <strong className="text-white">{route.to} ({route.arrivalTime})</strong>
                        </div>
                      </div>

                      {/* Stops Preview */}
                      <div className="pt-3">
                        <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">
                          Intermediate Stops ({route.stops?.length || 0})
                        </span>
                        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                          {route.stops && route.stops.length > 0 ? (
                            route.stops.map((stop, i) => (
                              <div key={i} className="flex items-center justify-between text-[11px] bg-slate-950/60 p-2 rounded-lg border border-white/5">
                                <span className="text-slate-300 truncate">{stop.name}</span>
                                <span className="text-orange-400 font-mono text-[10px] shrink-0">{stop.time}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-500 italic">No intermediate stops configured</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Driver PIN: <strong className="text-white font-mono">RITDRIVER</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live Sync
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 7 Cols: Active Senior Responders */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    Telegram Senior Responders (Q&A Network)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    When a fresher posts a question on the portal, these Telegram users receive instant alert messages and can answer directly from Telegram.
                  </p>
                </div>

                {/* Add Senior Form */}
                <form onSubmit={handleAddSeniorHelper} className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white block">Add New Senior Responder</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newHelperChatId}
                      onChange={(e) => setNewHelperChatId(e.target.value)}
                      placeholder="Telegram Chat ID (e.g. 971749136)"
                      className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-orange-500"
                      required
                    />
                    <input
                      type="text"
                      value={newHelperName}
                      onChange={(e) => setNewHelperName(e.target.value)}
                      placeholder="Senior Name / Note (Optional)"
                      className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Senior to Q&A Telegram Dispatch
                  </button>
                </form>

                {/* Active Seniors List */}
                {(() => {
                  const helpersList = telegramConfig?.seniorHelpers && telegramConfig.seniorHelpers.length > 0
                    ? telegramConfig.seniorHelpers
                    : (telegramConfig?.helper_chat_ids || []).map(id => ({ chatId: id, name: '' }));

                  return (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-300 block">
                        Active Senior Responders ({helpersList.length})
                      </span>
                      
                      <div className="space-y-2">
                        {helpersList.length > 0 ? (
                          helpersList.map((helper) => (
                            <div
                              key={helper.chatId}
                              className="bg-slate-950/60 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 font-bold text-xs">
                                  TG
                                </div>
                                <div>
                                  <p className="text-xs font-mono font-bold text-white">
                                    Chat ID: {helper.chatId} {helper.name ? <span className="text-orange-400 font-sans ml-1">({helper.name})</span> : ''}
                                  </p>
                                  <p className="text-[10px] text-slate-400">Receives questions from freshers in real-time</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveSeniorHelper(helper.chatId)}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer"
                                title="Remove responder"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">No senior helpers configured yet. Enter a Chat ID above to add!</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right 5 Cols: How-To Guide & Bot Tokens */}
              <div className="lg:col-span-5 space-y-6">
                {/* Guide Card */}
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-400" />
                    How Seniors Get Their Chat ID
                  </h4>
                  <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                    <li>Open Telegram and search for <strong>@userinfobot</strong>.</li>
                    <li>Click <strong>Start</strong> or send any message.</li>
                    <li>Copy the numeric <strong>Id</strong> (e.g. <code>971749136</code>).</li>
                    <li>Enter that Chat ID in the form on the left and click Add.</li>
                  </ol>
                </div>

                {/* Live Config Editor */}
                {telegramConfig && (
                  <form onSubmit={handleSaveTelegramTokens} className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-orange-400" />
                      Live Telegram Bot Config (VPS)
                    </h4>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Community Bot Token</label>
                      <input
                        type="text"
                        value={telegramConfig.community_bot_token || ''}
                        onChange={(e) => setTelegramConfig({ ...telegramConfig, community_bot_token: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Backend Webhook URL</label>
                      <input
                        type="text"
                        value={telegramConfig.spring_backend_url || ''}
                        onChange={(e) => setTelegramConfig({ ...telegramConfig, spring_backend_url: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingBotConfig}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-colors cursor-pointer"
                    >
                      {savingBotConfig ? 'Saving...' : '💾 Save Bot Configuration to VPS'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: NOTES & STUDY MATERIALS                                */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                  Notes & Study Materials Library ({notes.length})
                </h3>
                <p className="text-xs text-slate-400">View and remove student-accessible notes and previous year question papers.</p>
              </div>

              <button
                onClick={fetchNotes}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${loadingNotes ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingNotes ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading notes from database...</div>
            ) : notes.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl">
                No study materials found in database.
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{note.title}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/10 text-orange-400 uppercase font-mono">
                          {note.fileType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {note.subject} • {note.department} (Sem {note.semester})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={note.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 4: COMMUNITY QUESTIONS MODERATION                        */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'community' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-orange-400" />
                  Community Q&A Questions ({questions.length})
                </h3>
                <p className="text-xs text-slate-400">Moderate and delete inappropriate or spam questions.</p>
              </div>

              <button
                onClick={fetchQuestions}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${loadingQuestions ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingQuestions ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading community questions...</div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl">
                No community questions found in database.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-white">{q.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{q.body}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                        <span>Asked by: <strong className="text-slate-300">{q.authorName}</strong></span>
                        <span>•</span>
                        <span>Votes: {q.votes}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id, q.title)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors shrink-0"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 5: DEPLOYMENT EMAIL SUBSCRIBERS                          */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-400" />
                Add Deployment Alert Recipient
              </h3>
              <p className="text-xs text-slate-400">
                Every <code className="text-orange-400 font-mono">git push</code> automatically sends live health reports to all emails listed below.
              </p>

              <form onSubmit={handleAddRecipient} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. admin@ritchennai.edu.in"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingEmail}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {submittingEmail ? 'Adding...' : '➕ Add Subscriber'}
                </button>
              </form>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Active Email Subscribers ({recipients.length})</h3>
                <button onClick={fetchRecipients} className="p-2 rounded-lg text-slate-400 hover:text-white">
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRecipients ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                {recipients.map((email, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                        <Send className="w-3.5 h-3.5 text-orange-400" />
                      </div>
                      <p className="text-xs font-mono font-bold text-white">{email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bus className="w-5 h-5 text-orange-400" />
                  {editingRoute ? `Edit Route ${editingRoute.number}` : 'Create New Bus Route'}
                </h3>
                <button
                  onClick={() => setIsRouteModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRoute} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Route Number *</label>
                    <input
                      type="text"
                      value={routeFormData.number}
                      onChange={(e) => setRouteFormData({ ...routeFormData, number: e.target.value })}
                      placeholder="e.g. RIT-05"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Route Name *</label>
                    <input
                      type="text"
                      value={routeFormData.name}
                      onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                      placeholder="e.g. Tambaram Super Express"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Start Point (Origin) *</label>
                    <input
                      type="text"
                      value={routeFormData.from}
                      onChange={(e) => setRouteFormData({ ...routeFormData, from: e.target.value })}
                      placeholder="e.g. Tambaram"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">End Point (Destination) *</label>
                    <input
                      type="text"
                      value={routeFormData.to}
                      onChange={(e) => setRouteFormData({ ...routeFormData, to: e.target.value })}
                      placeholder="e.g. RIT Campus"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Departure Time</label>
                    <input
                      type="text"
                      value={routeFormData.departureTime}
                      onChange={(e) => setRouteFormData({ ...routeFormData, departureTime: e.target.value })}
                      placeholder="07:00 AM"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Arrival Time</label>
                    <input
                      type="text"
                      value={routeFormData.arrivalTime}
                      onChange={(e) => setRouteFormData({ ...routeFormData, arrivalTime: e.target.value })}
                      placeholder="08:30 AM"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Badge Color</label>
                    <input
                      type="text"
                      value={routeFormData.color}
                      onChange={(e) => setRouteFormData({ ...routeFormData, color: e.target.value })}
                      placeholder="#FF6B00"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Stops Builder */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Route Stops & Timings</label>
                    <button
                      type="button"
                      onClick={addStopField}
                      className="text-xs text-orange-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stop
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {routeFormData.stops.map((stop, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-mono text-slate-500">{i + 1}.</span>
                        <input
                          type="text"
                          value={stop.name}
                          onChange={(e) => {
                            const updated = [...routeFormData.stops];
                            updated[i].name = e.target.value;
                            setRouteFormData({ ...routeFormData, stops: updated });
                          }}
                          placeholder="Stop Name (e.g. Chrompet)"
                          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
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
                          className="w-24 bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeStopField(i)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsRouteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    {editingRoute ? 'Save Changes' : 'Create Route'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
