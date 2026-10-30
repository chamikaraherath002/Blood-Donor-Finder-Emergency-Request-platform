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
  const [recentRequests, setRecentRequests] = useState([]);
  const [requestsMessage, setRequestsMessage] = useState("");
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [respondingRequestId, setRespondingRequestId] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [responseError, setResponseError] = useState("");

  useEffect(() => {
    const fetchRecentRequests = async () => {
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
          setRequestsMessage(data.message || "Failed to load blood requests");
          return;
        }

        setRecentRequests(data.bloodRequests);
      } catch (error) {
        console.error("Latest blood requests error:", error);
        setRequestsMessage("Cannot connect to the server");
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRecentRequests();
  }, []);

  useEffect(() => {
    // Allow closing the request details dialog with Escape.
    if (!selectedRequest) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedRequest(null);
        setResponseMessage("");
        setResponseError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRequest]);

  const handleDonateNow = async () => {
    if (!selectedRequest) {
      return;
    }

    const token = localStorage.getItem("token");
    setRespondingRequestId(selectedRequest._id);
    setResponseMessage("");
    setResponseError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/blood-requests/${selectedRequest._id}/respond`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setResponseError(data.message || "Failed to send your offer");
        return;
      }

      setResponseMessage(
        "Your offer and contact details were sent to the requester.",
      );
      setRecentRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === selectedRequest._id
            ? { ...request, hasResponded: true }
            : request,
        ),
      );
      setSelectedRequest((request) =>
        request?._id === selectedRequest._id
          ? { ...request, hasResponded: true }
          : request,
      );
    } catch (error) {
      console.error("Donate now error:", error);
      setResponseError("Cannot connect to the server");
    } finally {
      setRespondingRequestId("");
    }
  };

  // Clear feedback when the request details dialog closes.
  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setResponseMessage("");
    setResponseError("");
  };

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
          <h2>Recent blood requests</h2>
          <p>Latest active needs from your community</p>
        </div>
      </div>
      {loadingRequests ? (
        <p className="urgent-request-state" role="status">
          Loading blood requests...
        </p>
      ) : requestsMessage ? (
        <p className="urgent-request-state" role="alert">{requestsMessage}</p>
      ) : recentRequests.length === 0 ? (
        <p className="urgent-request-state">
          There are no active blood requests right now.
        </p>
      ) : (
        <section
          className="urgent-request-grid"
          aria-label="Recent blood requests"
        >
          {recentRequests.map((request) => (
            <article
              aria-haspopup="dialog"
              className="urgent-request-card"
              key={request._id}
              onClick={() => setSelectedRequest(request)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedRequest(request);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="urgent-request-card-top">
                <span
                  className={`urgency-badge urgency-${request.urgency.toLowerCase()}`}
                >
                  {request.urgency === "EMERGENCY"
                    ? "Critical"
                    : request.urgency === "URGENT"
                      ? "Urgent"
                      : "Normal"}
                </span>
                <span className="request-blood-group">{request.bloodGroup}</span>
              </div>
              <p className="request-owner">
                Requested by {request.requester?.name || "Community member"}
              </p>
              <h3>{request.hospital}</h3>
              <p className="request-location">
                {request.location.area}, {request.location.city}
              </p>
              <div className="request-units">
                <strong>{request.units} {request.units === 1 ? "unit" : "units"} needed</strong>
                <span>Required by {new Date(request.requiredDate).toLocaleDateString()}</span>
              </div>
              <span className="request-card-hint">View details</span>
            </article>
          ))}
        </section>
      )}

      {selectedRequest && (
        <div
          className="request-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeRequestDetails();
            }
          }}
        >
          <section
            aria-labelledby="request-modal-title"
            aria-modal="true"
            className="request-modal"
            role="dialog"
          >
            <button
              aria-label="Close request details"
              className="request-modal-close"
              onClick={closeRequestDetails}
              type="button"
            >
              ×
            </button>
            <p className="eyebrow">Blood request details</p>
            <h2 id="request-modal-title">
              {selectedRequest.bloodGroup} blood needed
            </h2>
            <p className="request-modal-owner">
              Requested by{" "}
              {selectedRequest.requester?.name || "Community member"}
            </p>
            <dl className="request-detail-list">
              <div>
                <dt>Hospital</dt>
                <dd>{selectedRequest.hospital}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {selectedRequest.location.area},{" "}
                  {selectedRequest.location.city}
                </dd>
              </div>
              <div>
                <dt>Blood needed</dt>
                <dd>
                  {selectedRequest.units}{" "}
                  {selectedRequest.units === 1 ? "unit" : "units"}
                </dd>
              </div>
              <div>
                <dt>Urgency</dt>
                <dd>{selectedRequest.urgency}</dd>
              </div>
              <div>
                <dt>Required by</dt>
                <dd>
                  {new Date(selectedRequest.requiredDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt>Contact phone</dt>
                <dd>
                  <a href={`tel:${selectedRequest.contactPhone}`}>
                    {selectedRequest.contactPhone}
                  </a>
                </dd>
              </div>
            </dl>
            {selectedRequest.message && (
              <div className="request-modal-message">
                <h3>Additional information</h3>
                <p>{selectedRequest.message}</p>
              </div>
            )}
            {responseError && (
              <p className="request-response-error" role="alert">
                {responseError}
              </p>
            )}
            {responseMessage && (
              <p className="request-response-success" role="status">
                {responseMessage}
              </p>
            )}
            <button
              className="button-primary request-donate-button"
              disabled={
                selectedRequest.hasResponded ||
                respondingRequestId === selectedRequest._id
              }
              onClick={handleDonateNow}
              type="button"
            >
              {selectedRequest.hasResponded
                ? "You have responded"
                : respondingRequestId === selectedRequest._id
                  ? "Sending..."
                  : "Donate now"}
            </button>
          </section>
        </div>
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
