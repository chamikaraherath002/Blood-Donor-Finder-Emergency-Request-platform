import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h1>Blood Donor Finder</h1>
      <h2>Dashboard</h2>
      <p>Welcome to the Blood Donor Finder platform.</p>

      <hr />

      <h3>Donor</h3>
      <button onClick={() => navigate("/donor-profile")}>
        My Donor Profile
      </button>
      <button onClick={() => navigate("/find-donors")}>Find Donors</button>

      <hr />

      <h3>Blood Requests</h3>
      <button onClick={() => navigate("/create-blood-request")}>
        Create Blood Request
      </button>

      <button onClick={() => navigate("/my-blood-requests")}>
        My Blood Requests
      </button>

      <hr />

      <h3>Donation Requests</h3>
      <button onClick={() => navigate("/donation-requests/received")}>
        Received Requests
      </button>
      <button>Sent Requests</button>

      <hr />

      <h3>Notifications</h3>
      <button>View Notifications</button>

      <hr />

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
