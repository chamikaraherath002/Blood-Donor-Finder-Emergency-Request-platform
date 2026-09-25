import { useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  // Decide which page to show
  const [page, setPage] = useState("login");

  return (
    <div>
      {page === "login" ? <Login /> : <Register />}

      <hr />

      {/* Switch between Login and Register */}
      {page === "login" ? (
        <button onClick={() => setPage("register")}>
          Go to Register
        </button>
      ) : (
        <button onClick={() => setPage("login")}>
          Go to Login
        </button>
      )}
    </div>
  );
}

export default App;