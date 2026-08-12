import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home/Home';
import Notes from '@/pages/Notes/Notes';
import Toolkit from '@/pages/Toolkit/Toolkit';
import AIAssistant from '@/pages/AIAssistant/AIAssistant';
import Campus from '@/pages/Campus/Campus';
import Events from '@/pages/Events/Events';
import Community from '@/pages/Community/Community';
import BusRoutes from '@/pages/BusRoutes/BusRoutes';
import Faculty from '@/pages/Faculty/Faculty';
import DevCollab from '@/pages/DevCollab/DevCollab';
import LeetcodeLeaderboard from '@/pages/LeetcodeLeaderboard/LeetcodeLeaderboard';
import AdminDashboard from '@/pages/Admin/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Standalone Admin Route */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />

            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/toolkit" element={<Toolkit />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/campus" element={<Campus />} />
              <Route path="/bus-routes" element={<BusRoutes />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/events" element={<Events />} />

              {/* Protected Routes — Require Google Sign-In */}
              <Route
                path="/community"
                element={
                  <ProtectedRoute
                    title="RIT Q&A Community"
                    description="Connect with fellow RIT students and ask senior helpers any question about campus life and academics."
                  >
                    <Community />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collab"
                element={
                  <ProtectedRoute
                    title="Developer Collab Hub"
                    description="Post open-source projects, search for co-developers, and connect with fellow programmers."
                    requireVerifiedStudent={true}
                  >
                    <DevCollab />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leetcode"
                element={
                  <ProtectedRoute
                    title="RIT LeetCode Leaderboard"
                    description="Track campus competitive programming rankings and see top RIT coders."
                  >
                    <LeetcodeLeaderboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
