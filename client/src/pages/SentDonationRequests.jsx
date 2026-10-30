import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SentDonationRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const fetchSent = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:5000/api/donation-requests/sent",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load sent requests");
          return;
        }

        setRequests(data.donationRequests || []);
      } catch (error) {
        console.error("Sent donation requests error:", error);
        setMessage("Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchSent();
  }, []);

  const handleDelete = async (request) => {
    if (
      !window.confirm(
        "Delete this sent request? It will also be removed from the donor's received requests.",
      )
    ) {
      return;
    }

    setDeletingId(request._id);
    setActionMessage("");
    setActionError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/donation-requests/${request._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setActionError(data.message || "Failed to delete sent request");
        return;
      }

      setRequests((currentRequests) =>
        currentRequests.filter((currentRequest) => currentRequest._id !== request._id),
      );
      setActionMessage("Sent request deleted.");
    } catch (error) {
      console.error("Delete sent donation request error:", error);
      setActionError("Cannot connect to the server");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <p>Loading sent requests...</p>;
  }

  return (
    <div>
      <h1>Sent Donation Requests</h1>
      <p>Track and manage donation requests you have sent to donors.</p>

      {message && <p>{message}</p>}
      {actionMessage && <p role="status">{actionMessage}</p>}
      {actionError && <p role="alert">{actionError}</p>}

      {requests.length === 0 && !message ? (
        <p>You have not sent any donation requests yet.</p>
      ) : (
        requests.map((req) => (
          <div className="record-card" key={req._id}>
            <hr />

            <p>
              <strong>To Donor:</strong> {req.donor?.name} ({req.donor?.email},{" "}
              {req.donor?.phone})
            </p>

            <p>
              <strong>Blood Group:</strong>{" "}
              {req.bloodRequest?.bloodGroup || req.bloodGroup || "Not specified"}
            </p>

            {req.bloodRequest && (
              <>
                <p>
                  <strong>Hospital:</strong> {req.bloodRequest.hospital}
                </p>
                <p>
                  <strong>Urgency:</strong> {req.bloodRequest.urgency}
                </p>
              </>
            )}

            {req.message && (
              <p>
                <strong>Message:</strong> {req.message}
              </p>
            )}

            <p>
              <strong>Status:</strong> {req.status}
            </p>

            <p>
              <strong>Sent:</strong>{" "}
              {new Date(req.createdAt).toLocaleDateString()}
            </p>
            <button
              disabled={Boolean(deletingId)}
              onClick={() => handleDelete(req)}
              type="button"
            >
              {deletingId === req._id ? "Deleting..." : "Delete request"}
            </button>
          </div>
        ))
      )}

      <hr />
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default SentDonationRequests;