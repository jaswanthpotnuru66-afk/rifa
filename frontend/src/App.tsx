import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import {FloatingWidget } from './components/FloatingElements';

// Pages
import Home       from './pages/Home';
import About      from './pages/About';
import Creations  from './pages/Creations';
import Combos     from './pages/Combos';
import CustomOrder from './pages/buyer/CustomOrder';
import Contact    from './pages/Contact';
import Collaborate from './pages/Collaborate';
import ProductDetail from './pages/ProductDetail';
import BespokePortal from './pages/BespokePortal';
import Checkout from './pages/buyer/Checkout';
import Auth from './pages/buyer/Auth';
import ArtisanDetail from './pages/ArtisanDetail';
import Profile from './pages/buyer/Profile';
import Marketplace from './pages/Marketplace';
import SearchPage from './pages/Search';
import Cart from './pages/buyer/Cart';
import Success from './pages/buyer/Success';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import NotFound   from './pages/NotFound';

// CraftMaker Pages (Collaborate acts as the entry/register page)
import CraftMakerPending from './pages/craftmaker/Pending';
import CraftMakerDashboard from './pages/craftmaker/Dashboard';
import CraftMakerListings from './pages/craftmaker/Listings';
import CraftMakerListingForm from './pages/craftmaker/ListingForm';
import CraftMakerOrders from './pages/craftmaker/Orders';
import CraftMakerCustomOrders from './pages/craftmaker/CustomOrders';
import CraftMakerOrderDetail from './pages/craftmaker/OrderDetail';
import CraftMakerDisputes from './pages/craftmaker/Disputes';
import CraftMakerShipping from './pages/craftmaker/Shipping';
import CraftMakerEarnings from './pages/craftmaker/Earnings';
import CraftMakerTaxReports from './pages/craftmaker/TaxReports';
import CraftMakerAnalytics from './pages/craftmaker/Analytics';
import CraftMakerMarketing from './pages/craftmaker/Marketing';
import CraftMakerReviews from './pages/craftmaker/Reviews';
import CraftMakerShopSettings from './pages/craftmaker/ShopSettings';
import CraftMakerAccountSettings from './pages/craftmaker/AccountSettings';

// Admin Ops Pages
import AdminOpsDashboard from './pages/admin/ops/AdminOpsDashboard';
import AdminMakers from './pages/admin/ops/AdminMakers';
import AdminMakerDetail from './pages/admin/ops/AdminMakerDetail';
import AdminApplications from './pages/admin/ops/AdminApplications';
import AdminWeightMismatches from './pages/admin/ops/AdminWeightMismatches';
import AdminOrders from './pages/admin/ops/AdminOrders';
import AdminOrderDetail from './pages/admin/ops/AdminOrderDetail';
import AdminDisputes from './pages/admin/ops/AdminDisputes';
import AdminDisputeDetail from './pages/admin/ops/AdminDisputeDetail';
import AdminFlaggedListings from './pages/admin/ops/AdminFlaggedListings';
import AdminShipping from './pages/admin/ops/AdminShipping';
import AdminPayouts from './pages/admin/ops/AdminPayouts';
import AdminTaxReports from './pages/admin/ops/AdminTaxReports';
import AdminRevenue from './pages/admin/ops/AdminRevenue';
import AdminSettings from './pages/admin/ops/AdminSettings';
import AdminProductReview from './pages/admin/ops/AdminProductReview';

import WhyRifa from './pages/WhyRifa';
import { Navigate } from 'react-router-dom';

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
        <Route path="/rifa/:id"     element={<PageTransition><ArtisanDetail /></PageTransition>} />
        <Route path="/product/:id"  element={<ProductDetail />} />
        <Route path="/custom-product/:id" element={<PageTransition><BespokePortal /></PageTransition>} />
        <Route path="/checkout"     element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/"             element={
          <PageTransition>
            {localStorage.getItem('rifa_user') ? <BuyerDashboard /> : <Home />}
          </PageTransition>
        } />
        <Route path="/dashboard"    element={<PageTransition><BuyerDashboard /></PageTransition>} />
        <Route path="/about"        element={<PageTransition><About /></PageTransition>} />
        <Route path="/creations"    element={<PageTransition><Creations /></PageTransition>} />
        <Route path="/marketplace"  element={<PageTransition><Marketplace /></PageTransition>} />
        <Route path="/search"       element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/cart"         element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/success"      element={<PageTransition><Success /></PageTransition>} />
        <Route path="/combos"       element={<PageTransition><Combos /></PageTransition>} />
        <Route path="/custom-order" element={<PageTransition><CustomOrder /></PageTransition>} />
        <Route path="/collaborate"  element={<PageTransition><Collaborate /></PageTransition>} />
        <Route path="/why-rifa"     element={<PageTransition><WhyRifa /></PageTransition>} />
        <Route path="/contact"      element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/profile"      element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/admin"        element={<PageTransition><Auth /></PageTransition>} />
        
        {/* CraftMaker Portal Routes */}
        <Route path="/craftmaker/register" element={<PageTransition><Collaborate /></PageTransition>} />
        <Route path="/craftmaker/pending"  element={<PageTransition><CraftMakerPending /></PageTransition>} />
        
        <Route path="/craftmaker/dashboard"       element={<CraftMakerDashboard />} />
        <Route path="/craftmaker/listings"        element={<CraftMakerListings />} />
        <Route path="/craftmaker/listings/new"    element={<CraftMakerListingForm />} />
        <Route path="/craftmaker/listings/:id/edit" element={<CraftMakerListingForm />} />
        <Route path="/craftmaker/orders"          element={<CraftMakerOrders />} />
        <Route path="/craftmaker/orders/custom"   element={<CraftMakerCustomOrders />} />
        <Route path="/craftmaker/orders/:id"      element={<CraftMakerOrderDetail />} />
        <Route path="/craftmaker/disputes"        element={<CraftMakerDisputes />} />
        <Route path="/craftmaker/disputes/:id"    element={<CraftMakerDisputes />} />
        <Route path="/craftmaker/shipping"        element={<CraftMakerShipping />} />
        <Route path="/craftmaker/earnings"        element={<CraftMakerEarnings />} />
        <Route path="/craftmaker/tax"             element={<CraftMakerTaxReports />} />
        <Route path="/craftmaker/analytics"       element={<CraftMakerAnalytics />} />
        <Route path="/craftmaker/marketing"       element={<CraftMakerMarketing />} />
        <Route path="/craftmaker/reviews"         element={<CraftMakerReviews />} />
        <Route path="/craftmaker/shop"            element={<CraftMakerShopSettings />} />
        <Route path="/craftmaker/settings"        element={<CraftMakerAccountSettings />} />

        {/* Admin Ops Portal Routes */}
        <Route path="/admin/ops"                      element={<Navigate to="/admin/ops/dashboard" replace />} />
        <Route path="/admin/ops/dashboard"            element={<AdminOpsDashboard />} />
        <Route path="/admin/ops/makers"               element={<AdminMakers />} />
        <Route path="/admin/ops/makers/:id"           element={<AdminMakerDetail />} />
        <Route path="/admin/ops/makers/applications"  element={<AdminApplications />} />
        <Route path="/admin/ops/makers/weights"       element={<AdminWeightMismatches />} />
        <Route path="/admin/ops/orders"               element={<AdminOrders />} />
        <Route path="/admin/ops/orders/:id"           element={<AdminOrderDetail />} />
        <Route path="/admin/ops/disputes"             element={<AdminDisputes />} />
        <Route path="/admin/ops/disputes/:id"         element={<AdminDisputeDetail />} />
        <Route path="/admin/ops/listings/flagged"     element={<AdminFlaggedListings />} />
        <Route path="/admin/ops/listings/review"      element={<AdminProductReview />} />

        <Route path="/admin/ops/shipping"             element={<AdminShipping />} />
        <Route path="/admin/ops/payouts"              element={<AdminPayouts />} />
        <Route path="/admin/ops/tax"                  element={<AdminTaxReports />} />
        <Route path="/admin/ops/revenue"              element={<AdminRevenue />} />
        <Route path="/admin/ops/settings"             element={<AdminSettings />} />

        <Route path="*"             element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

// Global elements that only appear on specific routes
const ConditionalNavbar = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname === '/auth') return null;
  return <Navbar />;
};

const ConditionalFooter = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname === '/auth') return null;
  return <Footer />;
};

const ConditionalFloatingWidget = () => {
  const { pathname } = useLocation();
  // Show on buyer-facing discovery pages: home, marketplace, search, artisan profiles
  const shouldShow = pathname === '/' || pathname === '/marketplace' || pathname === '/search' || pathname.startsWith('/rifa/');
  if (!shouldShow) return null;
  return <FloatingWidget />;
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
        
        <ConditionalNavbar />
        <ConditionalFloatingWidget />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <ConditionalFooter />
      </div>
    </Router>
  );
}

export default App;

