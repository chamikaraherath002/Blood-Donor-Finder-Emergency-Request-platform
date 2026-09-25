import { useState } from "react";

function Login() {
  // Store the values entered in the form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store messages from the backend
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      // Send login details to the backend
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

      const data = await response.json();       //waiting the backend response

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Save the JWT token in the browser
      localStorage.setItem("token", data.token);

      setMessage("Login successful!");

      console.log("Logged in user:", data.user);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to the server");
    }
  };

  return (
    <div>
      <h1>Blood Donor Finder</h1>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">
          Login
        </button>
      </form>

      {/* Show success or error message */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;