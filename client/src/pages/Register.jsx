import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  // Store the values entered in the form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Store success/error messages
  const [message, setMessage] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${firstName.trim()} ${lastName.trim()}`,
            email,
            password,
            phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful!");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhone("");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Cannot connect to the server");
    }
  };

  return (
    <main className="auth-page">
      <aside className="auth-aside">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">♥</span>
          <span className="brand-name">Donor<span>Connect</span></span>
        </div>
        <div className="auth-aside-copy">
          <h1>Give hope.<br />Save lives.</h1>
          <p>Create your account and become part of a caring community of donors and seekers.</p>
        </div>
        <p className="auth-footnote">One donation can make all the difference.</p>
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
          <h2>Create your account</h2>
          <p>Get started by sharing a few details.</p>
          <form onSubmit={handleRegister}>
            <div>
              <label htmlFor="register-first-name">First name</label>
              <input
                id="register-first-name"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="register-last-name">Last name</label>
              <input
                id="register-last-name"
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="register-phone">Phone</label>
              <input
                id="register-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </div>
            <button type="submit">Create account</button>
          </form>
          {message && <p className="auth-message" role="alert">{message}</p>}
          <p className="auth-switch">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} type="button">
              Sign in
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;