import { Outlet, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function MainLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hideFooter = location.pathname === '/notes' && searchParams.has('toolkit');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {!hideFooter && <Footer />}
    </div>
  );
}
