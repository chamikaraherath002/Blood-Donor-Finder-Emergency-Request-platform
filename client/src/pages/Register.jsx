import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  // Store the values entered in the form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("SEEKER");

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
            name,
            email,
            password,
            phone,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful!");

      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRole("SEEKER");
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
            <button className="theme-toggle" onClick={onToggleTheme} type="button">
              <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
          </div>
          <h2>Create your account</h2>
          <p>Get started by sharing a few details.</p>
          <form onSubmit={handleRegister}>
            <div>
              <label htmlFor="register-name">Name</label>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
            <div>
              <label htmlFor="register-role">I want to</label>
              <select
                id="register-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="SEEKER">Find a blood donor</option>
                <option value="DONOR">Donate blood</option>
              </select>
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