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

      <h2>Search Results</h2>

      {donors.length === 0 ? (
        <p>No donors found.</p>
      ) : (
        donors.map((donor) => (
          <div className="record-card" key={donor._id}>
            <hr />

            <p>
              <strong>Blood Group:</strong> {donor.bloodGroup}
            </p>

            <p>
              <strong>Availability:</strong>{" "}
              {donor.availability ? "Available" : "Not Available"}
            </p>

            <p>
              <strong>Area:</strong> {donor.location.area}
            </p>

            <p>
              <strong>City:</strong> {donor.location.city}
            </p>
          </div>
        ))
      )}

      <hr />
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default FindDonors;