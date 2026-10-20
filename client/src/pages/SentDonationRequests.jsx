import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SentDonationRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p>Loading sent requests...</p>;
  }

  return (
    <div>
      <h1>Sent Donation Requests</h1>

      {message && <p>{message}</p>}

      {requests.length === 0 ? (
        <p>You have not sent any donation requests yet.</p>
      ) : (
        requests.map((req) => (
          <div key={req._id}>
            <hr />

            <p>
              <strong>To Donor:</strong> {req.donor?.name} ({req.donor?.email},{" "}
              {req.donor?.phone})
            </p>

            <p>
              <strong>Blood Group:</strong> {req.bloodRequest?.bloodGroup}
            </p>

            <p>
              <strong>Hospital:</strong> {req.bloodRequest?.hospital}
            </p>

            <p>
              <strong>Urgency:</strong> {req.bloodRequest?.urgency}
            </p>

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
          </div>
        ))
      )}

      <hr />
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default SentDonationRequests;