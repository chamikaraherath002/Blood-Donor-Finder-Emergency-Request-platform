import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bloodDonationImage from "../assets/blood-donation.png";
import heartbeatImage from "../assets/heartbeat.png";

function Login({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);

      // was: onLogin() — now navigate to dashboard directly
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to the server");
    }
  };

  return (
    <main className="auth-page">
      <aside className="auth-aside">
        <img className="auth-heartbeat" src={heartbeatImage} alt="" />
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">♥</span>
          <span className="brand-name">Donor<span>Connect</span></span>
        </div>
        <div className="auth-aside-copy">
          <h1>Small act.<br />Big impact.</h1>
          <p>Join a community that brings donors and people in need closer together.</p>
        </div>
        <p className="auth-footnote">Together, we can help save lives.</p>
      </aside>
      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-tools">
            <button
              aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
              className="theme-toggle"
              onClick={onToggleTheme}
              title={`Switch to ${darkMode ? "light" : "dark"} mode`}
              type="button"
            >
              <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
            </button>
          </div>
          <img
            className="login-illustration"
            src={bloodDonationImage}
            alt=""
          />
          <h2>Welcome back</h2>
          <p>Sign in to continue to your account.</p>
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <button type="submit">Sign in</button>
          </form>
          {message && <p className="auth-message" role="alert">{message}</p>}
          <p className="auth-switch">
            New to DonorConnect?{" "}
            <button onClick={() => navigate("/register")} type="button">
              Create an account
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;