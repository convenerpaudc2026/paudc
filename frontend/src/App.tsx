import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import About from '@/pages/About';
import Team from '@/pages/Team';
import Schedule from '@/pages/Schedule';
import Speakers from '@/pages/Speakers';
import Contact from '@/pages/Contact';
import Resources from '@/pages/Resources';
import LegacyLab from '@/pages/LegacyLab';
import FAQ from '@/pages/FAQ';
import AuthCallback from '@/pages/AuthCallback';
import AuthError from '@/pages/AuthError';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import LogoutCallback from '@/pages/LogoutCallback';
import Dashboard from '@/pages/Dashboard';
import LmsWaitlist from '@/pages/lms/LmsWaitlist';
import LMSDashboard from '@/pages/lms/LMSDashboard';
import LMSCourses from '@/pages/lms/LMSCourses';
import LMSCourseDetail from '@/pages/lms/LMSCourseDetail';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/register" element={<Register />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/legacy-lab" element={<LegacyLab />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/error" element={<AuthError />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout/callback" element={<LogoutCallback />} />
            {/* LMS Portal — coming soon page for unauthenticated users */}
            <Route path="/lms" element={<LmsWaitlist />} />
            {/* LMS Portal — authenticated */}
            <Route path="/dashboard" element={<LMSDashboard />} />
            <Route path="/lms/courses" element={<LMSCourses />} />
            <Route path="/lms/courses/:id" element={<LMSCourseDetail />} />
            {/* Add protected admin routes if needed */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;