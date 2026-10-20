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
