import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNavbar from './components/BottomNavbar';
import Home from './pages/Home';
import About from './pages/About';
import Loans from './pages/Loans';
import Eligibility from './pages/Eligibility';
import Documents from './pages/Documents';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import CibilCheck from './pages/CibilCheck';
import AIAssistant from './pages/AIAssistant';
import AdminDashboard from './pages/AdminDashboard';
import AdminEligibility from './pages/AdminEligibility';
import DocumentPortal from './pages/DocumentPortal';
import PasswordGate from './components/PasswordGate';
import ServicesList from './pages/ServicesList';
import Service from './pages/Service';
import Catalog from './pages/Catalog';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import DownloadApplication from './pages/DownloadApplication';
import ProductApply from './pages/ProductApply';
import TemplateDashboard from './pages/TemplateDashboard';
import AssetLibrary from './pages/AssetLibrary';
import CampaignBuilder from './pages/CampaignBuilder';
import SchoolFunding from './pages/SchoolFunding';
import CollegeFunding from './pages/CollegeFunding';
import ErrorBoundary from './components/ErrorBoundary';

// ── Financial Calculator Suite (Protected & Password-Gated) ──
import { CalculatorAuthProvider } from './calculators/auth/CalculatorAuthContext';
import CalculatorProtectedRoute from './calculators/auth/CalculatorProtectedRoute';
import CalculatorLogin from './calculators/pages/CalculatorLogin';
import CalculatorAdmin from './calculators/pages/CalculatorAdmin';
import CalculatorDashboard from './calculators/pages/CalculatorDashboard';

// Loan Calculators
import EmiCalculatorPage from './calculators/pages/loan/EmiCalculatorPage';
import FoirEligibilityPage from './calculators/pages/loan/FoirEligibilityPage';
import MultiplierEligibilityPage from './calculators/pages/loan/MultiplierEligibilityPage';
import OutstandingLoanPage from './calculators/pages/loan/OutstandingLoanPage';
import ForeclosurePage from './calculators/pages/loan/ForeclosurePage';
import OverdraftPage from './calculators/pages/loan/OverdraftPage';
import LoanComparisonPage from './calculators/pages/loan/LoanComparisonPage';
import PrepaymentPage from './calculators/pages/loan/PrepaymentPage';
import RateChangePage from './calculators/pages/loan/RateChangePage';
import GstOnInterestPage from './calculators/pages/loan/GstOnInterestPage';

// Investment Calculators
import FdCalculatorPage from './calculators/pages/investment/FdCalculatorPage';
import RdCalculatorPage from './calculators/pages/investment/RdCalculatorPage';
import SipCalculatorPage from './calculators/pages/investment/SipCalculatorPage';
import InterestCalculatorPage from './calculators/pages/investment/InterestCalculatorPage';
import PpfCalculatorPage from './calculators/pages/investment/PpfCalculatorPage';

// Other Financial Tools
import GstCalculatorPage from './calculators/pages/other/GstCalculatorPage';
import ProfitLossPage from './calculators/pages/other/ProfitLossPage';
import DiscountPage from './calculators/pages/other/DiscountPage';
import CashCounterPage from './calculators/pages/other/CashCounterPage';
import AmountToWordsPage from './calculators/pages/other/AmountToWordsPage';

import './App.css';

export default function App() {
  return (
    <CalculatorAuthProvider>
      <div className="app">
        <Navbar />
        <main>
          <ErrorBoundary>
            <Routes>
              {/* ── Public Core Pages ── */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/loans" element={<Loans />} />

              {/* ── Eligibility Engine (Server Password Gated) ── */}
              <Route
                path="/eligibility"
                element={
                  <PasswordGate pageTitle="AI Loan Eligibility Engine">
                    <Eligibility />
                  </PasswordGate>
                }
              />
              <Route path="/eligibility-checker" element={<Navigate to="/eligibility" replace />} />

              {/* ── Documents Vault (100% Public As Required) ── */}
              <Route path="/documents" element={<Documents />} />

              <Route path="/download-application" element={<DownloadApplication />} />
              <Route path="/loan-documents/:token" element={<DocumentPortal />} />
              <Route path="/cibil-check" element={<CibilCheck />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/services" element={<ServicesList />} />
              <Route path="/services/:slug" element={<Service />} />

              {/* ── Dedicated Institutional & Product Routes ── */}
              <Route path="/school-funding" element={<SchoolFunding />} />
              <Route path="/college-funding" element={<CollegeFunding />} />
              <Route path="/personal-loan" element={<Navigate to="/services/salary-loan" replace />} />
              <Route path="/business-loan" element={<Navigate to="/services/business-loan" replace />} />
              <Route path="/doctor-loan" element={<Navigate to="/services/doctor-professional-loan" replace />} />
              <Route path="/home-loan" element={<Navigate to="/services/home-loan" replace />} />
              <Route path="/mortgage-loan" element={<Navigate to="/services/mortgage-lap" replace />} />
              <Route path="/education-loan" element={<Navigate to="/services/education-loan" replace />} />
              <Route path="/ca-loan" element={<Navigate to="/services/chartered-accountant-loan" replace />} />

              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route
                path="/admin"
                element={
                  <PasswordGate pageTitle="Executive Operations Dashboard">
                    <AdminDashboard />
                  </PasswordGate>
                }
              />
              <Route
                path="/admin-eligibility"
                element={
                  <PasswordGate pageTitle="Eligibility Admin Panel">
                    <AdminEligibility />
                  </PasswordGate>
                }
              />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/loan-products" element={<Catalog />} />
              <Route path="/apply" element={<ProductApply />} />
              <Route path="/apply/:productSlug" element={<ProductApply />} />
              <Route path="/templates" element={<TemplateDashboard />} />
              <Route path="/templates/:productId" element={<TemplateDashboard />} />
              <Route path="/assets" element={<AssetLibrary />} />
              <Route path="/asset-library" element={<AssetLibrary />} />
              <Route path="/campaigns" element={<CampaignBuilder />} />
              <Route path="/publishing-queue" element={<CampaignBuilder />} />

              {/* ── Financial Tools & Calculators (PASSWORD PROTECTED) ── */}
              <Route
                path="/financial-tools"
                element={
                  <CalculatorProtectedRoute>
                    <CalculatorDashboard />
                  </CalculatorProtectedRoute>
                }
              />
              <Route path="/financial-tools/login" element={<CalculatorLogin />} />
              <Route
                path="/financial-tools/admin"
                element={
                  <CalculatorProtectedRoute>
                    <CalculatorAdmin />
                  </CalculatorProtectedRoute>
                }
              />
              <Route
                path="/financial-tools/eligibility"
                element={
                  <PasswordGate pageTitle="Financial Tools Eligibility Engine">
                    <Eligibility />
                  </PasswordGate>
                }
              />
              <Route path="/financial-tools/documents" element={<Documents />} />
              <Route path="/financial-tools/services" element={<ServicesList />} />

              {/* Financial Tools — Loan Calculators */}
              <Route path="/financial-tools/loan/emi" element={<CalculatorProtectedRoute><EmiCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/foir-eligibility" element={<CalculatorProtectedRoute><FoirEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/eligibility/foir" element={<CalculatorProtectedRoute><FoirEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/multiplier-eligibility" element={<CalculatorProtectedRoute><MultiplierEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/outstanding" element={<CalculatorProtectedRoute><OutstandingLoanPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/foreclosure" element={<CalculatorProtectedRoute><ForeclosurePage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/overdraft" element={<CalculatorProtectedRoute><OverdraftPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/comparison" element={<CalculatorProtectedRoute><LoanComparisonPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/prepayment" element={<CalculatorProtectedRoute><PrepaymentPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/rate-change" element={<CalculatorProtectedRoute><RateChangePage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/loan/gst-interest" element={<CalculatorProtectedRoute><GstOnInterestPage /></CalculatorProtectedRoute>} />

              {/* Financial Tools — Investment Calculators */}
              <Route path="/financial-tools/investment/fd" element={<CalculatorProtectedRoute><FdCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/investment/rd" element={<CalculatorProtectedRoute><RdCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/investment/sip" element={<CalculatorProtectedRoute><SipCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/investment/interest" element={<CalculatorProtectedRoute><InterestCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/investment/ppf" element={<CalculatorProtectedRoute><PpfCalculatorPage /></CalculatorProtectedRoute>} />

              {/* Financial Tools — Other Financial Tools */}
              <Route path="/financial-tools/other/gst" element={<CalculatorProtectedRoute><GstCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/other/profit-margin" element={<CalculatorProtectedRoute><ProfitLossPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/other/discount" element={<CalculatorProtectedRoute><DiscountPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/other/cash-counter" element={<CalculatorProtectedRoute><CashCounterPage /></CalculatorProtectedRoute>} />
              <Route path="/financial-tools/other/amount-to-words" element={<CalculatorProtectedRoute><AmountToWordsPage /></CalculatorProtectedRoute>} />

              {/* ── Backward Compatibility Protected Calculator Routes (/calculators/*) ── */}
              <Route
                path="/calculators"
                element={
                  <CalculatorProtectedRoute>
                    <CalculatorDashboard />
                  </CalculatorProtectedRoute>
                }
              />
              <Route path="/calculators/login" element={<CalculatorLogin />} />
              <Route
                path="/calculator-admin"
                element={
                  <CalculatorProtectedRoute>
                    <CalculatorAdmin />
                  </CalculatorProtectedRoute>
                }
              />
              <Route path="/calculators/admin" element={<Navigate to="/financial-tools/admin" replace />} />
              <Route path="/calculators/loan/emi" element={<CalculatorProtectedRoute><EmiCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/foir-eligibility" element={<CalculatorProtectedRoute><FoirEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/eligibility/foir" element={<CalculatorProtectedRoute><FoirEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/multiplier-eligibility" element={<CalculatorProtectedRoute><MultiplierEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/outstanding" element={<CalculatorProtectedRoute><OutstandingLoanPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/foreclosure" element={<CalculatorProtectedRoute><ForeclosurePage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/overdraft" element={<CalculatorProtectedRoute><OverdraftPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/comparison" element={<CalculatorProtectedRoute><LoanComparisonPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/prepayment" element={<CalculatorProtectedRoute><PrepaymentPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/rate-change" element={<CalculatorProtectedRoute><RateChangePage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/gst-interest" element={<CalculatorProtectedRoute><GstOnInterestPage /></CalculatorProtectedRoute>} />

              <Route path="/calculators/investment/fd" element={<CalculatorProtectedRoute><FdCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/rd" element={<CalculatorProtectedRoute><RdCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/sip" element={<CalculatorProtectedRoute><SipCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/interest" element={<CalculatorProtectedRoute><InterestCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/ppf" element={<CalculatorProtectedRoute><PpfCalculatorPage /></CalculatorProtectedRoute>} />

              <Route path="/calculators/other/gst" element={<CalculatorProtectedRoute><GstCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/profit-margin" element={<CalculatorProtectedRoute><ProfitLossPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/discount" element={<CalculatorProtectedRoute><DiscountPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/cash-counter" element={<CalculatorProtectedRoute><CashCounterPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/amount-to-words" element={<CalculatorProtectedRoute><AmountToWordsPage /></CalculatorProtectedRoute>} />

              {/* Convenience Shortcuts for direct calculator deep links */}
              <Route path="/calculators/emi" element={<Navigate to="/calculators/loan/emi" replace />} />
              <Route path="/calculators/sip" element={<Navigate to="/calculators/investment/sip" replace />} />
              <Route path="/calculators/fd" element={<Navigate to="/calculators/investment/fd" replace />} />
              <Route path="/calculators/rd" element={<Navigate to="/calculators/investment/rd" replace />} />
              <Route path="/calculators/gst" element={<Navigate to="/calculators/other/gst" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
        <BottomNavbar />
        <FloatingWhatsApp />
        <FloatingAIAssistant />
      </div>
    </CalculatorAuthProvider>
  );
}
