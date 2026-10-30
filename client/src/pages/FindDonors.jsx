import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FindDonors() {
  const navigate = useNavigate();

  // Store search values
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState(true);

  // Store search results
  const [donors, setDonors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingDonorId, setSendingDonorId] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);

  // Store messages
  const [message, setMessage] = useState("");
  const [requestFeedback, setRequestFeedback] = useState("");
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/donation-requests/sent",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load sent requests");
        }

        setSentRequests(data.donationRequests || []);
      } catch (error) {
        console.error("Load sent donation requests error:", error);
        setRequestError(error.message || "Cannot connect to the server");
      }
    };

    fetchSentRequests();
  }, []);

  useEffect(() => {
    if (!selectedDonor) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !sendingDonorId) {
        setSelectedDonor(null);
        setRequestMessage("");
        setRequestError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDonor, sendingDonorId]);

  const handleSearch = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    setMessage("");
    setRequestError("");

    try {
      const params = new URLSearchParams();

      if (bloodGroup) {
        params.append("bloodGroup", bloodGroup);
      }

      if (city) {
        params.append("city", city);
      }

      params.append("availability", availability);

      const response = await fetch(
        `http://localhost:5000/api/donors/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to search donors");
        return;
      }

      setDonors(data.donors);
      setHasSearched(true);
      setMessage("");
    } catch (error) {
      console.error("Search donors error:", error);
      setMessage("Cannot connect to the server");
    }
  };

  const getRequestForDonor = (donor) =>
    sentRequests.find((request) => {
      const requestDonorId =
        typeof request.donor === "object" ? request.donor?._id : request.donor;
      return requestDonorId === donor.user?._id;
    });

  const openRequestDialog = (donor) => {
    setRequestMessage("");
    setRequestError("");
    setRequestFeedback("");
    setSelectedDonor(donor);
  };

  const closeRequestDialog = () => {
    if (sendingDonorId) {
      return;
    }
    setSelectedDonor(null);
    setRequestMessage("");
    setRequestError("");
  };

  const handleSendRequest = async (event) => {
    event.preventDefault();
    const donor = selectedDonor;
    if (!donor) {
      return;
    }

    setSendingDonorId(donor._id);
    setRequestFeedback("");
    setRequestError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/donation-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            donorId: donor._id,
            bloodGroup,
            message: requestMessage,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setRequestError(data.message || "Failed to send donation request");
        return;
      }

      const createdRequest = {
        ...data.donationRequest,
        donor: donor.user,
      };
      setSentRequests((currentRequests) => [
        createdRequest,
        ...currentRequests,
      ]);
      setRequestFeedback(`Request sent to ${donor.user?.name || "the donor"}.`);
      setSelectedDonor(null);
      setRequestMessage("");
    } catch (error) {
      console.error("Send donation request error:", error);
      setRequestError("Cannot connect to the server");
    } finally {
      setSendingDonorId("");
    }
  };

  return (
    <div>
      <h1>Find Donors</h1>

      {requestError && !selectedDonor && (
        <p role="alert">{requestError}</p>
      )}
      {requestFeedback && <p role="status">{requestFeedback}</p>}

      <form onSubmit={handleSearch}>
        <div>
          <label>Blood Group</label>

          <select
            required
            value={bloodGroup}
            onChange={(event) => setBloodGroup(event.target.value)}
          >
            <option value="">Select a blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label>City</label>

          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={availability}
              onChange={(event) => setAvailability(event.target.checked)}
            />
            Available donors only
          </label>
        </div>

        <button type="submit">Search</button>
      </form>

      <hr />

      {message && <p>{message}</p>}

      <section className="donor-results">
        <header className="donor-results-heading">
          <div>
            <h2>Donors near you</h2>
            <p>Reach out directly to a donor who can help.</p>
          </div>
          {donors.length > 0 && (
            <span className="donor-results-count">
              {donors.length} {donors.length === 1 ? "donor" : "donors"} found
            </span>
          )}
        </header>

      {!hasSearched ? (
        <div className="donor-empty-state">
          <span aria-hidden="true" className="donor-empty-icon">⌕</span>
          <h3>Search for a donor</h3>
          <p>Choose the blood group you need and enter a city to get started.</p>
        </div>
      ) : donors.length === 0 ? (
        <div className="donor-empty-state">
          <span aria-hidden="true" className="donor-empty-icon">♥</span>
          <h3>No matching donors yet</h3>
          <p>Try a different blood group or search another city.</p>
        </div>
      ) : (
        <div className="donor-results-grid">
          {donors.map((donor) => (
            <article className="donor-result-card" key={donor._id}>
              <header className="donor-result-header">
                <span aria-hidden="true" className="donor-avatar">
                  {donor.user?.name?.trim()?.[0]?.toUpperCase() || "D"}
                </span>
                <div className="donor-result-identity">
                  <h3>{donor.user?.name || "Community donor"}</h3>
                  <p>{donor.location.area}, {donor.location.city}</p>
                </div>
                <span className="donor-blood-type">{donor.bloodGroup}</span>
              </header>
              <div className="donor-availability">
                <span aria-hidden="true" />
                {donor.availability ? "Available to donate" : "Not available"}
              </div>
              <div className="donor-contact">
                {donor.user?.phone && (
                  <a href={`tel:${donor.user.phone}`}>
                    <span aria-hidden="true">☎</span>
                    {donor.user.phone}
                  </a>
                )}
                {donor.user?.email && (
                  <a href={`mailto:${donor.user.email}`}>
                    <span aria-hidden="true">✉</span>
                    {donor.user.email}
                  </a>
                )}
              </div>
              {donor.lastDonationDate && (
                <p className="donor-last-donation">
                  Last donated{" "}
                  {new Date(donor.lastDonationDate).toLocaleDateString()}
                </p>
              )}
              {(() => {
                const sentRequest = getRequestForDonor(donor);
                if (["PENDING", "ACCEPTED"].includes(sentRequest?.status)) {
                  return (
                    <button disabled type="button">
                      {sentRequest.status === "PENDING"
                        ? "Request pending"
                        : "Request accepted"}
                    </button>
                  );
                }

                return (
                  <button
                    disabled={
                      !bloodGroup || !donor.availability || Boolean(sendingDonorId)
                    }
                    onClick={() => openRequestDialog(donor)}
                    type="button"
                  >
                    {sentRequest ? "Send again" : "Send request"}
                  </button>
                );
              })()}
            </article>
          ))}
        </div>
      )}
      </section>

      {selectedDonor && (
        <div
          className="request-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeRequestDialog();
            }
          }}
        >
          <section
            aria-labelledby="donor-request-dialog-title"
            aria-modal="true"
            className="request-modal"
            role="dialog"
          >
            <button
              aria-label="Close dialog"
              className="request-modal-close"
              disabled={Boolean(sendingDonorId)}
              onClick={closeRequestDialog}
              type="button"
            >
              ×
            </button>
            <p className="eyebrow">Send donation request</p>
            <h2 id="donor-request-dialog-title">
              Message {selectedDonor.user?.name || "this donor"}
            </h2>
            <p className="request-modal-owner">
              Requesting <strong>{bloodGroup}</strong> blood
            </p>
            {requestError && (
              <p className="request-response-error" role="alert">
                {requestError}
              </p>
            )}
            <form className="request-message-form" onSubmit={handleSendRequest}>
              <label htmlFor="donation-request-message">
                Message to donor (optional)
              </label>
              <textarea
                autoFocus
                id="donation-request-message"
                maxLength="500"
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Add a short note explaining your request"
                rows="4"
                value={requestMessage}
              />
              <div className="request-message-actions">
                <button disabled={Boolean(sendingDonorId)} type="submit">
                  {sendingDonorId ? "Sending..." : "Send request"}
                </button>
                <button
                  disabled={Boolean(sendingDonorId)}
                  onClick={closeRequestDialog}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <hr />
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default FindDonors;