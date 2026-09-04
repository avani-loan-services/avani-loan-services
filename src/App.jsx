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
import ErrorBoundary from './components/ErrorBoundary';

// ── Financial Calculator Suite (Isolated & Password-Protected Admin) ──
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
              {/* Existing Unchanged Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/eligibility" element={<PasswordGate pageTitle="AI Loan Eligibility Engine"><Eligibility /></PasswordGate>} />
              <Route path="/documents" element={<PasswordGate pageTitle="Document Vault & Calculator"><Documents /></PasswordGate>} />
              <Route path="/download-application" element={<DownloadApplication />} />
              <Route path="/loan-documents/:token" element={<DocumentPortal />} />
              <Route path="/cibil-check" element={<CibilCheck />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/services" element={<ServicesList />} />
              <Route path="/services/:slug" element={<Service />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/admin" element={<PasswordGate pageTitle="Executive Operations Dashboard"><AdminDashboard /></PasswordGate>} />
              <Route path="/admin-eligibility" element={<PasswordGate pageTitle="Eligibility Admin Panel"><AdminEligibility /></PasswordGate>} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/apply" element={<ProductApply />} />
              <Route path="/apply/:productSlug" element={<ProductApply />} />

              {/* ── Financial Tools & Intelligence Suite (/financial-tools) ── */}
              <Route path="/financial-tools" element={<CalculatorDashboard />} />
              <Route path="/financial-tools/login" element={<CalculatorLogin />} />
              <Route
                path="/financial-tools/admin"
                element={
                  <CalculatorProtectedRoute>
                    <CalculatorAdmin />
                  </CalculatorProtectedRoute>
                }
              />
              <Route path="/financial-tools/eligibility" element={<PasswordGate pageTitle="Financial Tools Eligibility Engine"><Eligibility /></PasswordGate>} />
              <Route path="/financial-tools/documents" element={<PasswordGate pageTitle="Financial Tools Document Vault"><Documents /></PasswordGate>} />
              <Route path="/financial-tools/services" element={<ServicesList />} />

              {/* Financial Tools — Loan Calculators */}
              <Route path="/financial-tools/loan/emi" element={<EmiCalculatorPage />} />
              <Route path="/financial-tools/loan/foir-eligibility" element={<FoirEligibilityPage />} />
              <Route path="/financial-tools/eligibility/foir" element={<FoirEligibilityPage />} />
              <Route path="/financial-tools/loan/multiplier-eligibility" element={<MultiplierEligibilityPage />} />
              <Route path="/financial-tools/loan/outstanding" element={<OutstandingLoanPage />} />
              <Route path="/financial-tools/loan/foreclosure" element={<ForeclosurePage />} />
              <Route path="/financial-tools/loan/overdraft" element={<OverdraftPage />} />
              <Route path="/financial-tools/loan/comparison" element={<LoanComparisonPage />} />
              <Route path="/financial-tools/loan/prepayment" element={<PrepaymentPage />} />
              <Route path="/financial-tools/loan/rate-change" element={<RateChangePage />} />
              <Route path="/financial-tools/loan/gst-interest" element={<GstOnInterestPage />} />

              {/* Financial Tools — Investment Calculators */}
              <Route path="/financial-tools/investment/fd" element={<FdCalculatorPage />} />
              <Route path="/financial-tools/investment/rd" element={<RdCalculatorPage />} />
              <Route path="/financial-tools/investment/sip" element={<SipCalculatorPage />} />
              <Route path="/financial-tools/investment/interest" element={<InterestCalculatorPage />} />
              <Route path="/financial-tools/investment/ppf" element={<PpfCalculatorPage />} />

              {/* Financial Tools — Other Financial Tools */}
              <Route path="/financial-tools/other/gst" element={<GstCalculatorPage />} />
              <Route path="/financial-tools/other/profit-margin" element={<ProfitLossPage />} />
              <Route path="/financial-tools/other/discount" element={<DiscountPage />} />
              <Route path="/financial-tools/other/cash-counter" element={<CashCounterPage />} />
              <Route path="/financial-tools/other/amount-to-words" element={<AmountToWordsPage />} />

              {/* ── Backward Compatibility Alias Routes (/calculators/*) ── */}
              <Route path="/calculators" element={<CalculatorDashboard />} />
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
              <Route path="/calculators/loan/emi" element={<EmiCalculatorPage />} />
              <Route path="/calculators/loan/foir-eligibility" element={<FoirEligibilityPage />} />
              <Route path="/calculators/eligibility/foir" element={<FoirEligibilityPage />} />
              <Route path="/calculators/loan/multiplier-eligibility" element={<MultiplierEligibilityPage />} />
              <Route path="/calculators/loan/outstanding" element={<OutstandingLoanPage />} />
              <Route path="/calculators/loan/foreclosure" element={<ForeclosurePage />} />
              <Route path="/calculators/loan/overdraft" element={<OverdraftPage />} />
              <Route path="/calculators/loan/comparison" element={<LoanComparisonPage />} />
              <Route path="/calculators/loan/prepayment" element={<PrepaymentPage />} />
              <Route path="/calculators/loan/rate-change" element={<RateChangePage />} />
              <Route path="/calculators/loan/gst-interest" element={<GstOnInterestPage />} />

              <Route path="/calculators/investment/fd" element={<FdCalculatorPage />} />
              <Route path="/calculators/investment/rd" element={<RdCalculatorPage />} />
              <Route path="/calculators/investment/sip" element={<SipCalculatorPage />} />
              <Route path="/calculators/investment/interest" element={<InterestCalculatorPage />} />
              <Route path="/calculators/investment/ppf" element={<PpfCalculatorPage />} />

              <Route path="/calculators/other/gst" element={<GstCalculatorPage />} />
              <Route path="/calculators/other/profit-margin" element={<ProfitLossPage />} />
              <Route path="/calculators/other/discount" element={<DiscountPage />} />
              <Route path="/calculators/other/cash-counter" element={<CashCounterPage />} />
              <Route path="/calculators/other/amount-to-words" element={<AmountToWordsPage />} />

              {/* Suite Fallbacks */}
              <Route path="/calculators/*" element={<Navigate to="/financial-tools" replace />} />
              <Route path="/financial-tools/*" element={<Navigate to="/financial-tools" replace />} />
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
