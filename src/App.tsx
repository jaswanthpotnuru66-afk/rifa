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
import CustomOrder from './pages/buyer/CustomOrder';
import WhyUs      from './pages/WhyUs';
import Contact    from './pages/Contact';
import Admin      from './pages/Admin';
import Collaborate from './pages/Collaborate';
import ProductDetail from './pages/ProductDetail';
import BespokePortal from './pages/BespokePortal';
import Checkout from './pages/buyer/Checkout';
import Auth from './pages/buyer/Auth';
import ArtisanDetail from './pages/ArtisanDetail';
import Orders from './pages/buyer/Orders';
import Profile from './pages/buyer/Profile';
import Marketplace from './pages/Marketplace';
import Cart from './pages/buyer/Cart';
import Success from './pages/buyer/Success';
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
        <Route path="/auth"         element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/artisan/:id"  element={<PageTransition><ArtisanDetail /></PageTransition>} />
        <Route path="/product/:id"  element={<ProductDetail />} />
        <Route path="/custom-product/:id" element={<PageTransition><BespokePortal /></PageTransition>} />
        <Route path="/checkout"     element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/"             element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about"        element={<PageTransition><About /></PageTransition>} />
        <Route path="/creations"    element={<PageTransition><Creations /></PageTransition>} />
        <Route path="/marketplace"  element={<PageTransition><Marketplace /></PageTransition>} />
        <Route path="/cart"         element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/success"      element={<PageTransition><Success /></PageTransition>} />
        <Route path="/combos"       element={<PageTransition><Combos /></PageTransition>} />
        <Route path="/custom-order" element={<PageTransition><CustomOrder /></PageTransition>} />
        <Route path="/collaborate"  element={<PageTransition><Collaborate /></PageTransition>} />
        <Route path="/why-us"       element={<PageTransition><WhyUs /></PageTransition>} />
        <Route path="/contact"      element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/orders"       element={<PageTransition><Orders /></PageTransition>} />
        <Route path="/profile"      element={<PageTransition><Profile /></PageTransition>} />
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
      <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-neutral-900 selection:bg-brand-pink/30">
        {/* Global Custom Elements */}
        
        {/* Global Grain Overlay — Using a subtle mix-blend for premium texture */}
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] contrast-150 brightness-100 mix-blend-multiply" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
        
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

