import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DonorProfile() {
  const navigate = useNavigate();

  // Store the donor profile
  const [donor, setDonor] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  // Store form values
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [availability, setAvailability] = useState(true);
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [lastDonationDate, setLastDonationDate] = useState("");

  // Store messages
  const [message, setMessage] = useState("");

  // Store loading state
  const [loading, setLoading] = useState(true);

  // Get the existing donor profile
  useEffect(() => {
    const fetchDonorProfile = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:5000/api/donors/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setDonor(data.donor);
          setBloodGroup(data.donor.bloodGroup);
          setAvailability(data.donor.availability);
          setArea(data.donor.location.area);
          setCity(data.donor.location.city);

          if (data.donor.lastDonationDate) {
            setLastDonationDate(data.donor.lastDonationDate.split("T")[0]);
          }
        } else if (response.status === 404) {
          setDonor(null);
        } else {
          setMessage(data.message || "Failed to load donor profile");
        }
      } catch (error) {
        console.error("Donor profile error:", error);
        setMessage("Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorProfile();
  }, []);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/donors/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bloodGroup,
          availability,
          location: {
            area,
            city,
          },
          lastDonationDate: lastDonationDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update donor profile");
        return;
      }

      setDonor(data.donor);
      setIsEditing(false);
      setMessage("Donor profile updated successfully!");
    } catch (error) {
      console.error("Update donor profile error:", error);
      setMessage("Cannot connect to the server");
    }
  };

  const handleCreateProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bloodGroup,
          availability,
          location: {
            area,
            city,
          },
          lastDonationDate: lastDonationDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create donor profile");
        return;
      }

      setDonor(data.donor);
      setMessage("Donor profile created successfully!");
    } catch (error) {
      console.error("Create donor profile error:", error);
      setMessage("Cannot connect to the server");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>My Donor Profile</h1>

      {message && <p>{message}</p>}

      {!donor ? (
        <>
          <h2>Create Donor Profile</h2>

          <form onSubmit={handleCreateProfile}>
            <div>
              <label>Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
              >
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
              <label>
                <input
                  type="checkbox"
                  checked={availability}
                  onChange={(event) => setAvailability(event.target.checked)}
                />
                Available to donate
              </label>
            </div>

            <div>
              <label>Area</label>
              <input
                type="text"
                placeholder="Enter your area"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                required
              />
            </div>

            <div>
              <label>City</label>
              <input
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Last Donation Date</label>
              <input
                type="date"
                value={lastDonationDate}
                onChange={(event) => setLastDonationDate(event.target.value)}
              />
            </div>

            <br />

            <button type="submit">Create Donor Profile</button>
          </form>
        </>
      ) : (
        <>
          {!isEditing ? (
            <>
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

              <p>
                <strong>Last Donation:</strong>{" "}
                {donor.lastDonationDate
                  ? new Date(donor.lastDonationDate).toLocaleDateString()
                  : "Not provided"}
              </p>

              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div>
                <label>Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(event) => setBloodGroup(event.target.value)}
                >
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
                <label>
                  <input
                    type="checkbox"
                    checked={availability}
                    onChange={(event) => setAvailability(event.target.checked)}
                  />
                  Available to donate
                </label>
              </div>

              <div>
                <label>Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  required
                />
              </div>

              <div>
                <label>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required
                />
              </div>

              <div>
                <label>Last Donation Date</label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(event) => setLastDonationDate(event.target.value)}
                />
              </div>

              <br />

              <button type="submit">Save Changes</button>

              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </form>
          )}
        </>
      )}

      <hr />
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default DonorProfile;