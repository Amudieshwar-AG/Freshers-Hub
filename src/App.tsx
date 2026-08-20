import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import PageLoader from '@/components/PageLoader/PageLoader';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';

// Code-split route components with dynamic imports for minimal initial bundle size
const Home = lazy(() => import('@/pages/Home/Home'));
const Notes = lazy(() => import('@/pages/Notes/Notes'));
const Toolkit = lazy(() => import('@/pages/Toolkit/Toolkit'));
const AIAssistant = lazy(() => import('@/pages/AIAssistant/AIAssistant'));
const Campus = lazy(() => import('@/pages/Campus/Campus'));
const Events = lazy(() => import('@/pages/Events/Events'));
const Community = lazy(() => import('@/pages/Community/Community'));
const BusRoutes = lazy(() => import('@/pages/BusRoutes/BusRoutes'));
const Faculty = lazy(() => import('@/pages/Faculty/Faculty'));
const DevCollab = lazy(() => import('@/pages/DevCollab/DevCollab'));
const LeetcodeLeaderboard = lazy(() => import('@/pages/LeetcodeLeaderboard/LeetcodeLeaderboard'));
const AdminDashboard = lazy(() => import('@/pages/Admin/AdminDashboard'));
const Raise = lazy(() => import('@/pages/Raise/Raise'));
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard/StudentDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Standalone Admin Route */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />

                {/* Standalone RAISE Route */}
                <Route path="/raise" element={<Raise />} />

                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/toolkit" element={<Toolkit />} />
                  <Route path="/ai-assistant" element={<AIAssistant />} />
                  <Route path="/campus" element={<Campus />} />
                  <Route path="/bus-routes" element={<BusRoutes />} />
                  <Route path="/faculty" element={<Faculty />} />
                  <Route path="/events" element={<Events />} />

                  {/* Student Dashboard & Timetable — Real IMS Reg No & Password */}
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/timetable" element={<StudentDashboard />} />

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
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
