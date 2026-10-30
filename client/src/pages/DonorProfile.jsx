import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyProfile = {
  bloodGroup: "O+",
  availability: true,
  area: "",
  city: "",
  lastDonationDate: "",
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function DonorProfile() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const populateProfile = (donorData) => {
    setProfile({
      bloodGroup: donorData?.bloodGroup || "O+",
      availability: donorData?.availability ?? true,
      area: donorData?.location?.area || "",
      city: donorData?.location?.city || "",
      lastDonationDate: donorData?.lastDonationDate
        ? donorData.lastDonationDate.split("T")[0]
        : "",
    });
  };

  useEffect(() => {
    const fetchDonorProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/donors/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();

        if (data.user) {
          setAccount(data.user);
          populateProfile(data.donor);
        }

        if (response.ok) {
          setDonor(data.donor);
        } else if (response.status === 404) {
          setDonor(null);
          setIsEditing(true);
        } else {
          setMessage(data.message || "Failed to load donor profile");
          setMessageType("error");
        }
      } catch (error) {
        console.error("Donor profile error:", error);
        setMessage("Cannot connect to the server");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorProfile();
  }, []);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setMessageType("");

    const hasDonorProfile = Boolean(donor);
    const payload = {
      bloodGroup: profile.bloodGroup,
      availability: profile.availability,
      location: {
        area: profile.area,
        city: profile.city,
      },
      lastDonationDate: profile.lastDonationDate || null,
    };

    try {
      const response = await fetch(
        hasDonorProfile
          ? "http://localhost:5000/api/donors/me"
          : "http://localhost:5000/api/donors",
        {
          method: hasDonorProfile ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to save your profile");
        setMessageType("error");
        return;
      }

      setDonor(data.donor);
      setAccount(data.user || data.donor.user);
      populateProfile(data.donor);
      setIsEditing(false);
      setMessage(hasDonorProfile ? "Your profile has been updated." : "Your donor profile is ready.");
      setMessageType("success");
    } catch (error) {
      console.error("Save donor profile error:", error);
      setMessage("Cannot connect to the server");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    populateProfile(donor);
    setIsEditing(false);
    setMessage("");
    setMessageType("");
  };

  if (loading) {
    return <p className="donor-profile-loading">Loading your profile...</p>;
  }

  return (
    <main className="donor-profile-page">
      <header className="donor-profile-header">
        <div>
          <p className="admin-eyebrow">Your information</p>
          <h1>My Donor Profile</h1>
          <p>Keep your contact and donor details up to date.</p>
        </div>
      </header>

      <section aria-labelledby="donor-profile-title" className="record-card donor-profile-card">
        <header className="donor-profile-section-header">
          <div>
            <h2 id="donor-profile-title">
              {donor ? "Profile details" : "Create your donor profile"}
            </h2>
            <p>
              {donor
                ? "Your account and donation information in one place."
                : "Add your contact and donation information to join the donor community."}
            </p>
          </div>
          {donor && !isEditing && (
            <button
              className="donor-profile-edit-button"
              onClick={() => {
                setMessage("");
                setIsEditing(true);
              }}
              type="button"
            >
              Edit profile
            </button>
          )}
        </header>

        {message && (
          <p className={`donor-profile-message ${messageType}`} role="status">
            {message}
          </p>
        )}

        {isEditing ? (
          <form className="donor-profile-form" onSubmit={handleSaveProfile}>
            <div className="donor-profile-form-section">
              <h3>Contact details</h3>
              <dl className="donor-profile-details">
                <div><dt>Full name</dt><dd>{account?.name || "Not provided"}</dd></div>
                <div><dt>Email address</dt><dd>{account?.email || "Not provided"}</dd></div>
                <div><dt>Phone number</dt><dd>{account?.phone || "Not provided"}</dd></div>
                {account?.createdAt && (
                  <div>
                    <dt>Member since</dt>
                    <dd>{new Date(account.createdAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="donor-profile-form-section">
              <h3>Donor details</h3>
              <div className="donor-profile-form-grid">
                <label>
                  Blood group
                  <select
                    onChange={(event) => updateField("bloodGroup", event.target.value)}
                    value={profile.bloodGroup}
                  >
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Area
                  <input
                    autoComplete="address-level3"
                    maxLength="100"
                    onChange={(event) => updateField("area", event.target.value)}
                    required
                    value={profile.area}
                  />
                </label>
                <label>
                  City
                  <input
                    autoComplete="address-level2"
                    maxLength="100"
                    onChange={(event) => updateField("city", event.target.value)}
                    required
                    value={profile.city}
                  />
                </label>
                <label>
                  Last donation date
                  <input
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(event) =>
                      updateField("lastDonationDate", event.target.value)
                    }
                    type="date"
                    value={profile.lastDonationDate}
                  />
                </label>
                <fieldset className="donor-availability-control">
                  <legend>Donation availability</legend>
                  <div className="donor-availability-options">
                    {[true, false].map((isAvailable) => (
                      <button
                        aria-pressed={profile.availability === isAvailable}
                        className={[
                          "donor-availability-option",
                          profile.availability === isAvailable ? "selected" : "",
                          isAvailable ? "available-option" : "unavailable-option",
                        ].filter(Boolean).join(" ")}
                        key={String(isAvailable)}
                        onClick={() => updateField("availability", isAvailable)}
                        type="button"
                      >
                        <span className="donor-availability-indicator" aria-hidden="true" />
                        <span>
                          <strong>{isAvailable ? "Available" : "Taking a break"}</strong>
                          <small>
                            {isAvailable
                              ? "Show me in donor searches"
                              : "Hide me from donor searches"}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="donor-profile-form-actions">
              <button disabled={saving} type="submit">
                {saving ? "Saving..." : donor ? "Save changes" : "Create profile"}
              </button>
              {donor && (
                <button
                  className="donor-profile-cancel-button"
                  disabled={saving}
                  onClick={handleCancelEdit}
                  type="button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="donor-profile-summary">
            <section className="donor-profile-summary-section">
              <h3>Contact details</h3>
              <dl className="donor-profile-details">
                <div><dt>Full name</dt><dd>{account?.name || "Not provided"}</dd></div>
                <div><dt>Email address</dt><dd>{account?.email || "Not provided"}</dd></div>
                <div><dt>Phone number</dt><dd>{account?.phone || "Not provided"}</dd></div>
                {account?.createdAt && (
                  <div>
                    <dt>Member since</dt>
                    <dd>{new Date(account.createdAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="donor-profile-summary-section">
              <div className="donor-profile-summary-heading">
                <h3>Donor details</h3>
                <span className={`status-badge ${donor.availability ? "" : "unavailable"}`}>
                  {donor.availability ? "Available to donate" : "Not available"}
                </span>
              </div>
              <dl className="donor-profile-details">
                <div><dt>Blood group</dt><dd>{donor.bloodGroup}</dd></div>
                <div><dt>Availability</dt><dd>{donor.availability ? "Available" : "Not available"}</dd></div>
                <div><dt>Area</dt><dd>{donor.location.area}</dd></div>
                <div><dt>City</dt><dd>{donor.location.city}</dd></div>
                <div>
                  <dt>Last donation</dt>
                  <dd>
                    {donor.lastDonationDate
                      ? new Date(donor.lastDonationDate).toLocaleDateString()
                      : "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt>Donor since</dt>
                  <dd>{new Date(donor.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt>Profile updated</dt>
                  <dd>{new Date(donor.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </section>

      <button
        className="donor-profile-back"
        onClick={() => navigate("/dashboard")}
        type="button"
      >
        Back to dashboard
      </button>
    </main>
  );
}

export default DonorProfile;
