import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialFormData = (request) => ({
  bloodGroup: request.bloodGroup,
  units: request.units,
  hospital: request.hospital,
  area: request.location.area,
  city: request.location.city,
  urgency: request.urgency,
  requiredDate: String(request.requiredDate).slice(0, 10),
  contactPhone: request.contactPhone,
  message: request.message || "",
});

function MyBloodRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState("");
  const [formData, setFormData] = useState(null);
  const [savingId, setSavingId] = useState("");
  const [cancelingId, setCancelingId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const fetchMyBloodRequests = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:5000/api/blood-requests/me",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          },
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

  const startEditing = (request) => {
    setEditingId(request._id);
    setFormData(initialFormData(request));
    setActionMessage("");
    setActionError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSave = async (event, requestId) => {
    event.preventDefault();
    setSavingId(requestId);
    setActionMessage("");
    setActionError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/blood-requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            bloodGroup: formData.bloodGroup,
            units: Number(formData.units),
            hospital: formData.hospital,
            location: {
              area: formData.area,
              city: formData.city,
            },
            urgency: formData.urgency,
            requiredDate: formData.requiredDate,
            contactPhone: formData.contactPhone,
            message: formData.message,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setActionError(data.message || "Failed to update blood request");
        return;
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId ? data.bloodRequest : request,
        ),
      );
      setEditingId("");
      setFormData(null);
      setActionMessage("Blood request updated successfully.");
    } catch (error) {
      console.error("Update blood request error:", error);
      setActionError("Cannot connect to the server");
    } finally {
      setSavingId("");
    }
  };

  const handleCancel = async (requestId) => {
    if (
      !window.confirm(
        "Cancel this blood request? It will remain in your records but no longer appear as active.",
      )
    ) {
      return;
    }

    setCancelingId(requestId);
    setActionMessage("");
    setActionError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/blood-requests/${requestId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setActionError(data.message || "Failed to cancel blood request");
        return;
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId ? data.bloodRequest : request,
        ),
      );
      if (editingId === requestId) {
        setEditingId("");
        setFormData(null);
      }
      setActionMessage("Blood request cancelled.");
    } catch (error) {
      console.error("Cancel blood request error:", error);
      setActionError("Cannot connect to the server");
    } finally {
      setCancelingId("");
    }
  };

  if (loading) {
    return <p>Loading blood requests...</p>;
  }

  return (
    <div className="my-blood-requests">
      <h1>My Blood Requests</h1>
      <p>View and manage the blood requests you have created.</p>

      {message && <p role="alert">{message}</p>}
      {actionMessage && <p role="status">{actionMessage}</p>}
      {actionError && <p role="alert">{actionError}</p>}

      {requests.length === 0 ? (
        <p>You have not created any blood requests yet.</p>
      ) : (
        <section className="my-blood-requests-list" aria-label="My blood requests">
          {requests.map((request) => {
            const isActive = ["PENDING", "ACCEPTED"].includes(request.status);

            return (
              <article className="my-blood-request-card" key={request._id}>
                <div className="my-blood-request-heading">
                  <h2>{request.hospital}</h2>
                  <span className="my-blood-request-group">
                    {request.bloodGroup}
                  </span>
                </div>

                {editingId === request._id ? (
                  <form
                    className="blood-request-edit-form"
                    onSubmit={(event) => handleSave(event, request._id)}
                  >
                    <div>
                      <label htmlFor={`blood-group-${request._id}`}>Blood group</label>
                      <select
                        id={`blood-group-${request._id}`}
                        name="bloodGroup"
                        onChange={handleEditChange}
                        required
                        value={formData.bloodGroup}
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (group) => (
                            <option key={group} value={group}>{group}</option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`units-${request._id}`}>Units</label>
                      <input
                        id={`units-${request._id}`}
                        min="1"
                        name="units"
                        onChange={handleEditChange}
                        required
                        type="number"
                        value={formData.units}
                      />
                    </div>
                    <div>
                      <label htmlFor={`hospital-${request._id}`}>Hospital</label>
                      <input
                        id={`hospital-${request._id}`}
                        name="hospital"
                        onChange={handleEditChange}
                        required
                        value={formData.hospital}
                      />
                    </div>
                    <div>
                      <label htmlFor={`area-${request._id}`}>Area</label>
                      <input
                        id={`area-${request._id}`}
                        name="area"
                        onChange={handleEditChange}
                        required
                        value={formData.area}
                      />
                    </div>
                    <div>
                      <label htmlFor={`city-${request._id}`}>City</label>
                      <input
                        id={`city-${request._id}`}
                        name="city"
                        onChange={handleEditChange}
                        required
                        value={formData.city}
                      />
                    </div>
                    <div>
                      <label htmlFor={`urgency-${request._id}`}>Urgency</label>
                      <select
                        id={`urgency-${request._id}`}
                        name="urgency"
                        onChange={handleEditChange}
                        value={formData.urgency}
                      >
                        {["NORMAL", "URGENT", "EMERGENCY"].map((urgency) => (
                          <option key={urgency} value={urgency}>
                            {urgency.charAt(0) + urgency.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`required-date-${request._id}`}>
                        Required date
                      </label>
                      <input
                        id={`required-date-${request._id}`}
                        name="requiredDate"
                        onChange={handleEditChange}
                        required
                        type="date"
                        value={formData.requiredDate}
                      />
                    </div>
                    <div>
                      <label htmlFor={`phone-${request._id}`}>Contact phone</label>
                      <input
                        id={`phone-${request._id}`}
                        name="contactPhone"
                        onChange={handleEditChange}
                        required
                        type="tel"
                        value={formData.contactPhone}
                      />
                    </div>
                    <div className="blood-request-edit-message">
                      <label htmlFor={`message-${request._id}`}>Message</label>
                      <textarea
                        id={`message-${request._id}`}
                        name="message"
                        onChange={handleEditChange}
                        value={formData.message}
                      />
                    </div>
                    <div className="blood-request-edit-actions">
                      <button disabled={savingId === request._id} type="submit">
                        {savingId === request._id ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        disabled={savingId === request._id}
                        onClick={() => {
                          setEditingId("");
                          setFormData(null);
                          setActionError("");
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="my-blood-request-details">
                      <p><strong>Units:</strong> {request.units}</p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {request.location.area}, {request.location.city}
                      </p>
                      <p><strong>Urgency:</strong> {request.urgency}</p>
                      <p>
                        <strong>Required date:</strong>{" "}
                        {new Date(request.requiredDate).toLocaleDateString()}
                      </p>
                      <p><strong>Contact:</strong> {request.contactPhone}</p>
                      <p><strong>Status:</strong> {request.status}</p>
                      {request.message && (
                        <p><strong>Message:</strong> {request.message}</p>
                      )}
                    </div>
                    {isActive && (
                      <div className="my-blood-request-actions">
                        <button
                          disabled={Boolean(cancelingId || savingId)}
                          onClick={() => startEditing(request)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="blood-request-cancel-button"
                          disabled={Boolean(cancelingId || savingId)}
                          onClick={() => handleCancel(request._id)}
                          type="button"
                        >
                          {cancelingId === request._id
                            ? "Cancelling..."
                            : "Cancel request"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </section>
      )}

      <div className="my-blood-request-page-actions">
        <button onClick={() => navigate("/create-blood-request")} type="button">
          Create new blood request
        </button>
        <button onClick={() => navigate("/dashboard")} type="button">
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default MyBloodRequests;
