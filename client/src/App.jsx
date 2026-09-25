import { useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  // Decide which page to show
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  const handleLogin = () => {
    // Go to dashboard after successful login
    setPage("dashboard");
  };

  const handleLogout = () => {
    // Remove the JWT token
    localStorage.removeItem("token");

    // Go back to login
    setPage("login");
  };

  return (
    <div>
      {page === "login" && (
        <>
          <Login onLogin={handleLogin} />

          <hr />

          <button onClick={() => setPage("register")}>
            Go to Register
          </button>
        </>
      )}

      {page === "register" && (
        <>
          <Register />

          <hr />

          <button onClick={() => setPage("login")}>
            Go to Login
          </button>
        </>
      )}

      {page === "dashboard" && (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;