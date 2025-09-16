import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { ThemeContext, THEME_ORDER, VALID_THEMES, THEME_STORAGE_KEY } from '@/lib/theme.js';

// --- Main Components ---
import EventsHub from '@/components/EventsHub.jsx';
import CampusHub from '@/components/CampusHub.jsx';
import InterHub from '@/components/InterHub.jsx';
import BadgeCenter from '@/components/BadgeCenter.jsx';
import ProfilePage from '@/components/ProfilePage.jsx';
import Navigation from '@/components/Navigation.jsx';
import LoginFlow from '@/components/LoginFlow.jsx';
import BuddyBeacon from '@/components/campus/BuddyBeacon.jsx';

// --- Other Components ---
import LoadingSpinner from '@/components/animations/LoadingSpinner.jsx';
import ThemeBackground from '@/components/backgrounds/ThemeBackground.jsx';
import XPDisplay from '@/components/ui/XPDisplay.jsx';

// This component handles the user data fetching after a login redirect
const ProfileSetupHandler = ({ setAppUser, setInitialLoginFlowState }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      fetch(`http://localhost:8080/api/users/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error("Could not fetch user profile after login.");
          return res.json();
        })
        .then(user => {
          setAppUser(user);
          setInitialLoginFlowState({ step: 'step1', data: user });
          navigate('/'); // Go back to the main page to show the profile form
        })
        .catch(err => {
          console.error("Error fetching user:", err);
          setError(err.message);
          navigate('/login-failed');
        });
    }
  }, [searchParams, setAppUser, setInitialLoginFlowState, navigate]);

  if (error) return <div>Error: {error}</div>;
  return <LoadingSpinner />;
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setThemeState] = useState('light');
  const [initialLoginFlowState, setInitialLoginFlowState] = useState({ step: 'login', data: null });

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && VALID_THEMES.includes(savedTheme)) setThemeState(savedTheme);
  }, []);

  // Update document and localStorage when theme changes
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // This function is called by LoginFlow when the profile setup is complete
  const handleLoginComplete = (finalUserData) => {
    setUser(finalUserData);
  };

  const AuthenticatedApp = () => {
    const [currentView, setCurrentView] = useState('campus');
    const [viewContext, setViewContext] = useState(null);

    const handleNavigateToBeacon = (eventId) => {
      setViewContext({ eventId: eventId });
      setCurrentView('buddybeacon');
    };

    return (
      <>
        <Navigation user={user} currentView={currentView} onViewChange={setCurrentView} />
        <XPDisplay user={user} />
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentView === 'campus' && <CampusHub user={user} eventId={viewContext?.eventId} initialView={viewContext?.initialView || 'overview'} />}
            {currentView === 'events' && <EventsHub user={user} onNavigateToBeacon={handleNavigateToBeacon} />}
            {currentView === 'inter' && <InterHub user={user} />}
            {currentView === 'badges' && <BadgeCenter user={user} />}
            {currentView === 'profile' && <ProfilePage user={user} />}
            {currentView === 'buddybeacon' && <BuddyBeacon eventId={viewContext?.eventId} />}
          </div>
        </main>
      </>
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      <div className={`${theme}`}>
        <ThemeBackground theme={theme} />
        <Router>
          <Routes>
            <Route path="/" element={
              user ? <AuthenticatedApp /> : <LoginFlow onComplete={handleLoginComplete} initialFlowState={initialLoginFlowState} />
            } />
            <Route path="/profile-setup" element={<ProfileSetupHandler setAppUser={setUser} setInitialLoginFlowState={setInitialLoginFlowState} />} />
            <Route path="/login-failed" element={<div><h1>Login Failed</h1><p>Please try again.</p></div>} />
          </Routes>
        </Router>
      </div>
    </ThemeContext.Provider>
  );
}