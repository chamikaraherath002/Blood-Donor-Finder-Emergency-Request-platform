import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ReceivedDonationRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the logged-in user's token
  const token = localStorage.getItem("token");

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

      console.log("Received donation requests:", data);

      // Store the received requests
      setRequests(
        data.requests ||
        data.donationRequests ||
        (Array.isArray(data) ? data : [])
      );
    } catch (error) {
      console.error("Failed to load received requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only make the API request when a token exists
  if (token) {
    fetchReceivedRequests();
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

  if (loading) {
    return <h2>Loading received requests...</h2>;
  }

  return (
    <div>
      <h1>Received Donation Requests</h1>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>

      <hr />

      {requests.length === 0 ? (
        <p>No donation requests received.</p>
      ) : (
        requests.map((request) => (
          <div className="record-card" key={request._id}>
            <h3>Donation Request</h3>

            <p>
              <strong>Status:</strong> {request.status}
            </p>

            <p>
              <strong>Message:</strong>{" "}
              {request.message || "No message"}
            </p>

            {/* Requester information */}
            {request.requester && (
              <>
                <p>
                  <strong>Requester:</strong>{" "}
                  {request.requester.name}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {request.requester.phone}
                </p>
              </>
            )}

            {/* Blood request information */}
            {request.bloodRequest && (
              <>
                <p>
                  <strong>Blood Group:</strong>{" "}
                  {request.bloodRequest.bloodGroup}
                </p>

                <p>
                  <strong>Units:</strong>{" "}
                  {request.bloodRequest.units}
                </p>

                <p>
                  <strong>Hospital:</strong>{" "}
                  {request.bloodRequest.hospital}
                </p>

                <p>
                  <strong>Urgency:</strong>{" "}
                  {request.bloodRequest.urgency}
                </p>
              </>
            )}

            {/* Only pending requests can be accepted/rejected */}
            {request.status === "PENDING" && (
              <div>
                <button onClick={() => handleAccept(request._id)}>
                  Accept
                </button>

                <button onClick={() => handleReject(request._id)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ReceivedDonationRequests;