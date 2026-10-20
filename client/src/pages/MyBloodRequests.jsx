import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBloodRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBloodRequests = async () => {
      const token = localStorage.getItem("token");

      try {
        // Get the logged-in user's blood requests
        const response = await fetch(
          "http://localhost:5000/api/blood-requests/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load blood requests");
          return;
        }

        setRequests(data.bloodRequests);
      } catch (error) {
        console.error("Blood requests error:", error);
        setMessage("Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBloodRequests();
  }, []);

  if (loading) {
    return <p>Loading blood requests...</p>;
  }

  return (
    <div>
      <h1>My Blood Requests</h1>

      {message && <p>{message}</p>}

      {requests.length === 0 ? (
        <p>You have not created any blood requests yet.</p>
      ) : (
        requests.map((request) => (
          <div className="record-card" key={request._id}>
            <hr />

            <p>
              <strong>Blood Group:</strong> {request.bloodGroup}
            </p>

            <p>
              <strong>Units:</strong> {request.units}
            </p>

            <p>
              <strong>Hospital:</strong> {request.hospital}
            </p>

            <p>
              <strong>Area:</strong> {request.location.area}
            </p>

            <p>
              <strong>City:</strong> {request.location.city}
            </p>

            <p>
              <strong>Urgency:</strong> {request.urgency}
            </p>

            <p>
              <strong>Required Date:</strong>{" "}
              {new Date(request.requiredDate).toLocaleDateString()}
            </p>

            <p>
              <strong>Contact:</strong> {request.contactPhone}
            </p>

            <p>
              <strong>Status:</strong> {request.status}
            </p>

            {request.message && (
              <p>
                <strong>Message:</strong> {request.message}
              </p>
            )}
          </div>
        ))
      )}

      <hr />

      <button onClick={() => navigate("/create-blood-request")}>
        Create New Blood request
      </button>
      
      <br></br>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default MyBloodRequests;