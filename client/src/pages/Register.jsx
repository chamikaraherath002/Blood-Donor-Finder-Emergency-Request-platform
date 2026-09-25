import { useState } from "react";

function Register() {
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
      // Send registration data to the backend
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

      // Check if registration failed
      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      // Show successful registration message
      setMessage("Registration successful!");

      // Clear the form
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
    <div>
      <h1>Blood Donor Finder</h1>

      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <div>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

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

        <div>
          <label>Phone</label>
          <input
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Role</label>

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="SEEKER">Seeker</option>
            <option value="DONOR">Donor</option>
          </select>
        </div>

        <button type="submit">
          Register
        </button>
      </form>

      {/* Show success or error message */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;