import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function ReceivedDonationRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBloodRequests, setLoadingBloodRequests] = useState(true);
  const [bloodRequestsMessage, setBloodRequestsMessage] = useState("");
  const [receivedRequestsMessage, setReceivedRequestsMessage] = useState("");
  const [activeTab, setActiveTab] = useState("community");
  const [seenRequestIds, setSeenRequestIds] = useState(() => {
    try {
      return new Set(
        JSON.parse(
          localStorage.getItem("seenReceivedDonationRequestIds") || "[]",
        ),
      );
    } catch (error) {
      console.error("Load seen donation requests error:", error);
      return new Set();
    }
  });
  const activeTabRef = useRef(activeTab);
  const seenRequestIdsRef = useRef(seenRequestIds);

  // Get the logged-in user's token
  const token = localStorage.getItem("token");
  const hasUnseenPendingRequests = requests.some(
    (request) =>
      request.status === "PENDING" && !seenRequestIds.has(request._id),
  );

  const markPendingRequestsAsSeen = (receivedRequests) => {
    const unseenIds = receivedRequests
      .filter(
        (request) =>
          request.status === "PENDING" &&
          !seenRequestIdsRef.current.has(request._id),
      )
      .map((request) => request._id);

    if (unseenIds.length === 0) {
      return;
    }

    const updatedSeenIds = new Set(seenRequestIdsRef.current);
    unseenIds.forEach((id) => updatedSeenIds.add(id));
    seenRequestIdsRef.current = updatedSeenIds;
    setSeenRequestIds(updatedSeenIds);
    try {
      localStorage.setItem(
        "seenReceivedDonationRequestIds",
        JSON.stringify([...updatedSeenIds]),
      );
    } catch (error) {
      console.error("Save seen donation requests error:", error);
    }
  };

  const handleTabChange = (tab) => {
    activeTabRef.current = tab;
    setActiveTab(tab);
    if (tab === "direct" && !loading) {
      markPendingRequestsAsSeen(requests);
    }
  };

  // Load donation requests received by this user
  useEffect(() => {
  const fetchReceivedRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/donation-requests/received",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setReceivedRequestsMessage(
          data.message || "Failed to load received donation requests",
        );
        return;
      }

      // Store the received requests
      setRequests(
        data.requests ||
        data.donationRequests ||
        (Array.isArray(data) ? data : [])
      );
      const receivedRequests =
        data.requests ||
        data.donationRequests ||
        (Array.isArray(data) ? data : []);
      if (activeTabRef.current === "direct") {
        markPendingRequestsAsSeen(receivedRequests);
      }
    } catch (error) {
      console.error("Failed to load received requests:", error);
      setReceivedRequestsMessage("Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  };

  // Only make the API request when a token exists
  if (token) {
    fetchReceivedRequests();
  }
}, [token]);

  useEffect(() => {
    const fetchCommunityBloodRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/blood-requests/community",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          },
        );
        const data = await response.json();

        if (!response.ok) {
          setBloodRequestsMessage(
            data.message || "Failed to load community blood requests",
          );
          return;
        }

        setBloodRequests(data.bloodRequests || []);
      } catch (error) {
        console.error("Failed to load community blood requests:", error);
        setBloodRequestsMessage("Cannot connect to the server");
      } finally {
        setLoadingBloodRequests(false);
      }
    };

    if (token) {
      fetchCommunityBloodRequests();
    }
  }, [token]);

  // Accept a donation request
  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/donation-requests/${requestId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to accept request");
        return;
      }

      alert("Donation request accepted.");

      // Update the request on the screen
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: "ACCEPTED" }
            : request
        )
      );
    } catch (error) {
      console.error("Accept request error:", error);
    }
  };

  // Reject a donation request
  const handleReject = async (requestId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/donation-requests/${requestId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to reject request");
        return;
      }

      alert("Donation request rejected.");

      // Update the request on the screen
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: "REJECTED" }
            : request
        )
      );
    } catch (error) {
      console.error("Reject request error:", error);
    }
  };

  return (
    <main className="received-requests-page">
      <header className="received-requests-header">
        <div>
          <h1>Received requests</h1>
          <p>Browse community needs or respond to donors who contacted you.</p>
        </div>
        <button onClick={() => navigate("/dashboard")} type="button">
          Back to dashboard
        </button>
      </header>

      <div className="received-request-tabs" role="tablist" aria-label="Received requests">
        <button
          aria-controls="community-panel"
          aria-selected={activeTab === "community"}
          className="received-request-tab"
          id="community-tab"
          onClick={() => handleTabChange("community")}
          role="tab"
          type="button"
        >
          Community
        </button>
        <button
          aria-controls="direct-requests-panel"
          aria-selected={activeTab === "direct"}
          className="received-request-tab"
          id="direct-requests-tab"
          onClick={() => handleTabChange("direct")}
          role="tab"
          type="button"
        >
          Requests to you
          {hasUnseenPendingRequests && (
            <span
              aria-label="New pending requests"
              className="received-tab-new-indicator"
              title="New pending requests"
            />
          )}
        </button>
      </div>

      {activeTab === "community" ? (
        <section
          aria-labelledby="community-tab"
          className="received-request-panel"
          id="community-panel"
          role="tabpanel"
        >
          <header className="received-panel-heading">
            <div>
              <h2>Blood requests from the community</h2>
              <p>Help someone nearby who needs a donation.</p>
            </div>
          </header>
          {bloodRequestsMessage && <p role="alert">{bloodRequestsMessage}</p>}
          {loadingBloodRequests ? (
            <p role="status">Loading community requests...</p>
          ) : bloodRequests.length === 0 ? (
            <p className="received-empty-state">
              No active blood requests from other users right now.
            </p>
          ) : (
            <div className="received-request-grid">
              {bloodRequests.map((request) => (
                <article className="received-request-card" key={request._id}>
                  <header className="received-request-card-heading">
                    <div>
                      <span className="received-request-blood-group">
                        {request.bloodGroup}
                      </span>
                      <span> blood needed</span>
                    </div>
                    <span
                      className={`received-request-urgency received-request-urgency-${request.urgency?.toLowerCase()}`}
                    >
                      {request.urgency}
                    </span>
                  </header>
                  <p className="received-request-sender">
                    Requested by {request.requester?.name || "Community member"}
                  </p>
                  <dl className="received-request-details">
                    <div><dt>Units</dt><dd>{request.units}</dd></div>
                    <div><dt>Hospital</dt><dd>{request.hospital}</dd></div>
                    <div>
                      <dt>Location</dt>
                      <dd>{request.location.area}, {request.location.city}</dd>
                    </div>
                    <div>
                      <dt>Required by</dt>
                      <dd>{new Date(request.requiredDate).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                  <a
                    className="received-request-contact"
                    href={`tel:${request.contactPhone}`}
                  >
                    Call requester · {request.contactPhone}
                  </a>
                  {request.message && (
                    <p className="received-request-message">{request.message}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section
          aria-labelledby="direct-requests-tab"
          className="received-request-panel"
          id="direct-requests-panel"
          role="tabpanel"
        >
          <header className="received-panel-heading">
            <div>
              <h2>Requests sent to you</h2>
              <p>Pending requests are marked so you can find them quickly.</p>
            </div>
          </header>
          {receivedRequestsMessage && (
            <p role="alert">{receivedRequestsMessage}</p>
          )}
          {loading ? (
            <p role="status">Loading requests sent to you...</p>
          ) : requests.length === 0 && !receivedRequestsMessage ? (
            <p className="received-empty-state">
              You do not have any donation requests yet.
            </p>
          ) : (
            <div className="received-request-grid">
              {requests.map((request) => (
                <article className="received-request-card" key={request._id}>
                  <header className="received-request-card-heading">
                    <div>
                      <span className="received-request-blood-group">
                        {request.bloodRequest?.bloodGroup || request.bloodGroup}
                      </span>
                      <span> donation request</span>
                    </div>
                    <span
                      className={`received-request-urgency received-request-status-${request.status?.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </header>
                  <p className="received-request-sender">
                    From {request.requester?.name || "Account name unavailable"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {request.requester?.phone || "Phone number unavailable"}
                  </p>
                  <p>
                    <strong>Message:</strong> {request.message || "No message"}
                  </p>
                  {request.bloodRequest && (
                    <>
                      <p><strong>Hospital:</strong> {request.bloodRequest.hospital}</p>
                      <p><strong>Units:</strong> {request.bloodRequest.units}</p>
                      <p><strong>Urgency:</strong> {request.bloodRequest.urgency}</p>
                    </>
                  )}
                  {request.status === "PENDING" && (
                    <div className="received-request-actions">
                      <button
                        onClick={() => handleAccept(request._id)}
                        type="button"
                      >
                        Accept
                      </button>
                      <button
                        className="received-request-reject"
                        onClick={() => handleReject(request._id)}
                        type="button"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default ReceivedDonationRequests;