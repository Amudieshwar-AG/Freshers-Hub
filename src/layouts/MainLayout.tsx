import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full max-w-full bg-[#F8FAFC] flex flex-col font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Top Header Navigation */}
      <Header />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Dynamic Page Content */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Global Footer */}
        <Footer />
      </div>
    </div>
  );
}
