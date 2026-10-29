import { useEffect, useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DonorProfile from "./pages/DonorProfile.jsx";
import FindDonors from "./pages/FindDonors.jsx";
import CreateBloodRequest from "./pages/CreateBloodRequest.jsx";
import MyBloodRequests from "./pages/MyBloodRequests.jsx";
import ReceivedDonationRequests from "./pages/ReceivedDonationRequests.jsx";
import SentDonationRequests from "./pages/SentDonationRequests.jsx";
import Notifications from "./pages/Notifications.jsx";

const navigationItems = [
  { to: "/dashboard", label: "Overview", icon: "⌂", end: true },
  { to: "/find-donors", label: "Find donors", icon: "⌕" },
  { to: "/create-blood-request", label: "New blood request", icon: "+" },
  { to: "/my-blood-requests", label: "My blood requests", icon: "▤" },
  { to: "/donation-requests/received", label: "Received requests", icon: "↓" },
  { to: "/sent-donation-requests", label: "Sent requests", icon: "↑" },
  { to: "/notifications", label: "Notifications", icon: "♧" },
  { to: "/donor-profile", label: "Donor profile", icon: "○" },
];

function AppShell({ children, darkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "";
  const nameParts = userName.trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : nameParts[0]?.[0]?.toUpperCase() || "?";
  const currentItem = navigationItems.find((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to),
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/dashboard">
          <span className="brand-mark" aria-hidden="true">♥</span>
          <span className="brand-name">Donor<span>Connect</span></span>
        </NavLink>
        <p className="nav-caption">Workspace</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              end={item.end}
              aria-label={item.label}
              key={item.to}
              title={item.label}
              to={item.to}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={handleLogout} type="button">
            <span className="nav-icon" aria-hidden="true">↪</span>
            <span className="nav-label">Sign out</span>
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <span className="topbar-label">{currentItem?.label || "Workspace"}</span>
          <div className="topbar-tools">
            <button
              aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
              className="theme-toggle"
              onClick={onToggleTheme}
              type="button"
            >
              <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
            </button>
            <button
              className="topbar-signout"
              onClick={handleLogout}
              type="button"
            >
              Sign out
            </button>
            <NavLink
              aria-label="View donor profile"
              className="profile-chip"
              title="Donor profile"
              to="/donor-profile"
            >
              {initials}
            </NavLink>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, darkMode, onToggleTheme }) {
  const token = localStorage.getItem("token");
  return token ? (
    <AppShell darkMode={darkMode} onToggleTheme={onToggleTheme}>
      {children}
    </AppShell>
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((currentMode) => !currentMode);

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login darkMode={darkMode} onToggleTheme={toggleTheme} />}
      />
      <Route
        path="/register"
        element={<Register darkMode={darkMode} onToggleTheme={toggleTheme} />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor-profile"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <DonorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/find-donors"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <FindDonors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-blood-request"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <CreateBloodRequest />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/my-blood-requests"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <MyBloodRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donation-requests/received"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <ReceivedDonationRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sent-donation-requests"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <SentDonationRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute darkMode={darkMode} onToggleTheme={toggleTheme}>
            <Notifications />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
