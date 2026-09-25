function Dashboard({ onLogout }) {
  return (
    <div>
      {/* Main heading */}
      <h1>Blood Donor Finder</h1>

      <h2>Dashboard</h2>

      <p>Welcome to the Blood Donor Finder platform.</p>

      <hr />

      {/* Donor profile section */}
      <h3>Donor</h3>

      <button>
        My Donor Profile
      </button>

      <button>
        Find Donors
      </button>

      <hr />

      {/* Blood request section */}
      <h3>Blood Requests</h3>

      <button>
        Create Blood Request
      </button>

      <button>
        My Blood Requests
      </button>

      <hr />

      {/* Donation request section */}
      <h3>Donation Requests</h3>

      <button>
        Received Requests
      </button>

      <button>
        Sent Requests
      </button>

      <hr />

      {/* Notification section */}
      <h3>Notifications</h3>

      <button>
        View Notifications
      </button>

      <hr />

      {/* Logout */}
      <button onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;