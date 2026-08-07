import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, LogOut, Mail, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Server, Send } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Subscribers management state
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check saved session token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('RIT_ADMIN_TOKEN');
    if (savedToken === 'ADMIN_SESSION_TOKEN_RIT_2026') {
      setIsLoggedIn(true);
      fetchRecipients();
    }
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError('Please enter both username and password');
      return;
    }
    setLoadingLogin(true);
    setLoginError(null);

    fetch(getBackendUrl('/api/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        try {
          const data = await res.json();
          return data;
        } catch (e) {
          return { success: false, message: `Server returned HTTP ${res.status}` };
        }
      })
      .then((data) => {
        if (data.success) {
          localStorage.setItem('RIT_ADMIN_TOKEN', data.token);
          setIsLoggedIn(true);
          fetchRecipients();
        } else {
          setLoginError(data.message || 'Invalid username or password');
        }
      })
      .catch((err) => {
        setLoginError(err.message || 'Server connection error');
      })
      .finally(() => setLoadingLogin(false));
  };

  const handleLogout = () => {
    localStorage.removeItem('RIT_ADMIN_TOKEN');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const fetchRecipients = () => {
    setLoadingRecipients(true);
    fetch(getBackendUrl('/api/admin/recipients'))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecipients(data);
        }
      })
      .catch(() => showToast('error', 'Failed to fetch email subscribers'))
      .finally(() => setLoadingRecipients(false));
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showToast('error', 'Please enter a valid email address');
      return;
    }

    setSubmittingEmail(true);
    fetch(getBackendUrl('/api/admin/recipients'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast('success', data.message || 'Email added successfully');
          setNewEmail('');
          if (Array.isArray(data.recipients)) {
            setRecipients(data.recipients);
          } else {
            fetchRecipients();
          }
        } else {
          showToast('error', data.message || 'Could not add email');
        }
      })
      .catch(() => showToast('error', 'Failed to add recipient'))
      .finally(() => setSubmittingEmail(false));
  };

  const handleRemoveRecipient = (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from deployment notifications?`)) return;

    fetch(getBackendUrl(`/api/admin/recipients?email=${encodeURIComponent(email)}`), {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast('success', data.message || 'Removed email recipient');
          if (Array.isArray(data.recipients)) {
            setRecipients(data.recipients);
          } else {
            fetchRecipients();
          }
        } else {
          showToast('error', data.message || 'Could not remove email');
        }
      })
      .catch(() => showToast('error', 'Failed to remove recipient'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden py-10 px-4">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                RIT Portal Admin Console
              </h1>
              <p className="text-xs text-slate-400">Manage deployment email subscribers & system settings</p>
            </div>
          </div>

          <Link to="/" className="text-xs text-slate-400 hover:text-orange-400 transition-colors">
            ← Back to Main Site
          </Link>
        </div>

        {!isLoggedIn ? (
          /* Login Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your admin credentials to access subscriber controls</p>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mb-4 text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (e.g. ritadmin)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingLogin}
                className="w-full py-3 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loadingLogin ? 'Authenticating...' : 'Sign In to Console'}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Authenticated Admin Dashboard */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Dashboard Header Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                    🟢 Authenticated Session
                  </span>
                  <span className="text-xs text-slate-400 font-mono">User: ritadmin</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Deployment Email Subscribers</h2>
                <p className="text-xs text-slate-400">
                  Every <code className="text-orange-400 font-mono">git push</code> automatically sends live health reports to all emails listed below.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                Sign Out
              </button>
            </div>

            {/* Add New Subscriber Form */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Add New Email Recipient
              </h3>

              <form onSubmit={handleAddRecipient} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. successor@ritchennai.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingEmail}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {submittingEmail ? 'Adding...' : '➕ Add Subscriber'}
                </button>
              </form>
            </div>

            {/* Active Subscribers List Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">
                    Active Email Subscribers ({recipients.length})
                  </h3>
                </div>

                <button
                  onClick={fetchRecipients}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Refresh list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRecipients ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingRecipients ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading subscribers list...</div>
              ) : recipients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                  No email subscribers found. Use the form above to add a recipient!
                </div>
              ) : (
                <div className="space-y-2">
                  {recipients.map((email, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:bg-slate-800/90"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                          <Send className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold text-white">{email}</p>
                          <p className="text-[10px] text-slate-400">Receives deployment reports on git push</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
