import { useState } from "react";
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

  // Store messages
  const [message, setMessage] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

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

  return (
    <div>
      <h1>Find Donors</h1>

      <form onSubmit={handleSearch}>
        <div>
          <label>Blood Group</label>

          <select
            value={bloodGroup}
            onChange={(event) => setBloodGroup(event.target.value)}
          >
            <option value="">Any</option>
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
            </article>
          ))}
        </div>
      )}
      </section>

      <hr />
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default FindDonors;