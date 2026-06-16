import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';

// Lazy load Pages
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Creations = React.lazy(() => import('./pages/Creations'));
const Combos = React.lazy(() => import('./pages/Combos'));
const CustomOrder = React.lazy(() => import('./pages/buyer/CustomOrder'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Collaborate = React.lazy(() => import('./pages/Collaborate'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const BespokePortal = React.lazy(() => import('./pages/BespokePortal'));
const Checkout = React.lazy(() => import('./pages/buyer/Checkout'));
const Auth = React.lazy(() => import('./pages/buyer/Auth'));
const ArtisanDetail = React.lazy(() => import('./pages/ArtisanDetail'));
const Profile = React.lazy(() => import('./pages/buyer/Profile'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const SearchPage = React.lazy(() => import('./pages/Search'));
const Cart = React.lazy(() => import('./pages/buyer/Cart'));
const Success = React.lazy(() => import('./pages/buyer/Success'));
const BuyerDashboard = React.lazy(() => import('./pages/buyer/BuyerDashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Craftmakers = React.lazy(() => import('./pages/Craftmakers'));

// CraftMaker Pages
const CraftMakerPending = React.lazy(() => import('./pages/craftmaker/Pending'));
const CraftMakerDashboard = React.lazy(() => import('./pages/craftmaker/Dashboard'));
const CraftMakerListings = React.lazy(() => import('./pages/craftmaker/Listings'));
const CraftMakerListingForm = React.lazy(() => import('./pages/craftmaker/ListingForm'));
const CraftMakerCreateCombo = React.lazy(() => import('./pages/craftmaker/CreateCombo'));
const CraftMakerOrders = React.lazy(() => import('./pages/craftmaker/Orders'));
const CraftMakerCustomOrders = React.lazy(() => import('./pages/craftmaker/CustomOrders'));
const CraftMakerOrderDetail = React.lazy(() => import('./pages/craftmaker/OrderDetail'));
const CraftMakerDisputes = React.lazy(() => import('./pages/craftmaker/Disputes'));
const CraftMakerShipping = React.lazy(() => import('./pages/craftmaker/Shipping'));
const CraftMakerEarnings = React.lazy(() => import('./pages/craftmaker/Earnings'));
const CraftMakerTaxReports = React.lazy(() => import('./pages/craftmaker/TaxReports'));
const CraftMakerAnalytics = React.lazy(() => import('./pages/craftmaker/Analytics'));
const CraftMakerMarketing = React.lazy(() => import('./pages/craftmaker/Marketing'));
const CraftMakerReviews = React.lazy(() => import('./pages/craftmaker/Reviews'));
const CraftMakerShopSettings = React.lazy(() => import('./pages/craftmaker/ShopSettings'));
const CraftMakerAccountSettings = React.lazy(() => import('./pages/craftmaker/AccountSettings'));

// Admin Ops Pages
const AdminOpsDashboard = React.lazy(() => import('./pages/admin/ops/AdminOpsDashboard'));
const AdminMakers = React.lazy(() => import('./pages/admin/ops/AdminMakers'));
const AdminMakerDetail = React.lazy(() => import('./pages/admin/ops/AdminMakerDetail'));
const AdminApplications = React.lazy(() => import('./pages/admin/ops/AdminApplications'));
const AdminWeightMismatches = React.lazy(() => import('./pages/admin/ops/AdminWeightMismatches'));
const AdminOrders = React.lazy(() => import('./pages/admin/ops/AdminOrders'));
const AdminOrderDetail = React.lazy(() => import('./pages/admin/ops/AdminOrderDetail'));
const AdminDisputes = React.lazy(() => import('./pages/admin/ops/AdminDisputes'));
const AdminDisputeDetail = React.lazy(() => import('./pages/admin/ops/AdminDisputeDetail'));
const AdminFlaggedListings = React.lazy(() => import('./pages/admin/ops/AdminFlaggedListings'));
const AdminShipping = React.lazy(() => import('./pages/admin/ops/AdminShipping'));
const AdminPayouts = React.lazy(() => import('./pages/admin/ops/AdminPayouts'));
const AdminTaxReports = React.lazy(() => import('./pages/admin/ops/AdminTaxReports'));
const AdminRevenue = React.lazy(() => import('./pages/admin/ops/AdminRevenue'));
const AdminSettings = React.lazy(() => import('./pages/admin/ops/AdminSettings'));
const AdminProductReview = React.lazy(() => import('./pages/admin/ops/AdminProductReview'));
const AdminCombos = React.lazy(() => import('./pages/admin/ops/AdminCombos'));

const WhyRifa = React.lazy(() => import('./pages/WhyRifa'));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="text-brand-pink animate-spin" />
      <p className="text-sm font-medium text-neutral-500">Loading module...</p>
  </div>
);

// Animated routes wrapper — needs location from inside Router
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/craftmakers"  element={<PageTransition><Craftmakers /></PageTransition>} />
          <Route path="/profile"      element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/admin"        element={<PageTransition><Auth /></PageTransition>} />
          
          {/* CraftMaker Portal Routes */}
          <Route path="/craftmaker/register" element={<PageTransition><Collaborate /></PageTransition>} />
          <Route path="/craftmaker/pending"  element={<PageTransition><CraftMakerPending /></PageTransition>} />
          
          <Route path="/craftmaker/dashboard"       element={<CraftMakerDashboard />} />
          <Route path="/craftmaker/listings"        element={<CraftMakerListings />} />
          <Route path="/craftmaker/listings/new"    element={<CraftMakerListingForm />} />
          <Route path="/craftmaker/listings/:id/edit" element={<CraftMakerListingForm />} />
          <Route path="/craftmaker/combos/new"      element={<CraftMakerCreateCombo />} />
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
          <Route path="/admin/ops/combos"               element={<AdminCombos />} />

          <Route path="*"             element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
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

        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <ConditionalFooter />
      </div>
    </Router>
  );
}

export default App;

