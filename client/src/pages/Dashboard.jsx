import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const dashboardCards = [
  {
    title: "Find donors",
    description: "Search available donors by blood group and location.",
    icon: "⌕",
    path: "/find-donors",
  },
  {
    title: "Create blood request",
    description: "Share an urgent need with the donor community.",
    icon: "+",
    path: "/create-blood-request",
  },
  {
    title: "My blood requests",
    description: "Review the requests you have created.",
    icon: "▤",
    path: "/my-blood-requests",
  },
  {
    title: "Received requests",
    description: "Respond to donation requests sent to you.",
    icon: "↓",
    path: "/donation-requests/received",
  },
  {
    title: "Sent requests",
    description: "Track the donation requests you have sent.",
    icon: "↑",
    path: "/sent-donation-requests",
  },
  {
    title: "Notifications",
    description: "See updates about your donation activity.",
    icon: "♧",
    path: "/notifications",
  },
  {
    title: "Donor profile",
    description: "Manage your blood group and availability.",
    icon: "○",
    path: "/donor-profile",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [requestsMessage, setRequestsMessage] = useState("");
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const fetchUrgentRequests = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:5000/api/blood-requests/recent",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();

        if (!response.ok) {
          setRequestsMessage(data.message || "Failed to load urgent requests");
          return;
        }

        setUrgentRequests(data.bloodRequests);
      } catch (error) {
        console.error("Latest urgent blood requests error:", error);
        setRequestsMessage("Cannot connect to the server");
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchUrgentRequests();
  }, []);

  return (
    <div className="dashboard-page">
      <section className="dashboard-heading">
        <h1>Good to see you</h1>
        <p>Your community can make a life-changing difference, one donation at a time.</p>
      </section>

      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">Every drop counts</p>
          <h2>Be there when someone needs you.</h2>
          <p>
            Connect people who need blood with generous donors in their community.
          </p>
        </div>
        <button
          className="button-primary"
          onClick={() => navigate("/find-donors")}
          type="button"
        >
          Find a donor
        </button>
      </section>

      <div className="dashboard-section-heading urgent-request-heading">
        <div>
          <h2>Recent urgent blood requests</h2>
          <p>Latest active needs from your community</p>
        </div>
      </div>
      {loadingRequests ? (
        <p className="urgent-request-state" role="status">
          Loading urgent requests...
        </p>
      ) : requestsMessage ? (
        <p className="urgent-request-state" role="alert">{requestsMessage}</p>
      ) : urgentRequests.length === 0 ? (
        <p className="urgent-request-state">
          There are no active urgent blood requests right now.
        </p>
      ) : (
        <section
          className="urgent-request-grid"
          aria-label="Recent urgent blood requests"
        >
          {urgentRequests.map((request) => (
            <article className="urgent-request-card" key={request._id}>
              <div className="urgent-request-card-top">
                <span
                  className={`urgency-badge urgency-${request.urgency.toLowerCase()}`}
                >
                  {request.urgency === "EMERGENCY" ? "Critical" : "Urgent"}
                </span>
                <span className="request-blood-group">{request.bloodGroup}</span>
              </div>
              <h3>{request.hospital}</h3>
              <p className="request-location">
                {request.location.area}, {request.location.city}
              </p>
              <div className="request-units">
                <strong>{request.units} {request.units === 1 ? "unit" : "units"} needed</strong>
                <span>Required by {new Date(request.requiredDate).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="dashboard-section-heading">
        <h2>Your workspace</h2>
        <p>Quick access to everything you need</p>
      </div>
      <section className="dashboard-grid" aria-label="Dashboard actions">
        {dashboardCards.map((card) => (
          <button
            className="dashboard-card"
            key={card.path}
            onClick={() => navigate(card.path)}
            type="button"
          >
            <span className="dashboard-card-icon" aria-hidden="true">
              {card.icon}
            </span>
            <strong>{card.title}</strong>
            <span>{card.description}</span>
          </button>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
