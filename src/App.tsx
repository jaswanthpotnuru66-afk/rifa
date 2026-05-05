import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';

// Pages
import Home       from './pages/Home';
import About      from './pages/About';
import Creations  from './pages/Creations';
import Combos     from './pages/Combos';
import CustomOrder from './pages/CustomOrder';
import WhyUs      from './pages/WhyUs';
import Contact    from './pages/Contact';
import Admin      from './pages/Admin';
import Collaborate from './pages/Collaborate';
import NotFound   from './pages/NotFound';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Animated routes wrapper — needs location from inside Router
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"             element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about"        element={<PageTransition><About /></PageTransition>} />
        <Route path="/creations"    element={<PageTransition><Creations /></PageTransition>} />
        <Route path="/combos"       element={<PageTransition><Combos /></PageTransition>} />
        <Route path="/custom-order" element={<PageTransition><CustomOrder /></PageTransition>} />
        <Route path="/collaborate"  element={<PageTransition><Collaborate /></PageTransition>} />
        <Route path="/why-us"       element={<PageTransition><WhyUs /></PageTransition>} />
        <Route path="/contact"      element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/admin"        element={<Admin />} />
        <Route path="*"             element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-[#F9F9F6] text-neutral-900 selection:bg-brand-pink/20">
        {/* Global Grain Overlay */}
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.35] mix-blend-multiply pointer-events-none z-[9999]" />
        <Navbar />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
