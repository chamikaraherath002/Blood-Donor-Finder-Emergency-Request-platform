import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateBloodRequest() {
  const navigate = useNavigate();

  // Form values
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");
  const [requiredDate, setRequiredDate] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");

  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/blood-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bloodGroup,
            units: Number(units),
            hospital,
            location: {
              area,
              city,
            },
            urgency,
            requiredDate,
            contactPhone,
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setResponseMessage(data.message || "Failed to create blood request");
        return;
      }

      setResponseMessage("Blood request created successfully!");

      setBloodGroup("O+");
      setUnits(1);
      setHospital("");
      setArea("");
      setCity("");
      setUrgency("NORMAL");
      setRequiredDate("");
      setContactPhone("");
      setMessage("");
    } catch (error) {
      console.error("Create blood request error:", error);
      setResponseMessage("Cannot connect to the server");
    }
  };

  return (
    <div>
      <h1>Create Blood Request</h1>

      {responseMessage && <p>{responseMessage}</p>}

      <form onSubmit={handleSubmit}>
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
          <label>Units</label>
          <input
            type="number"
            min="1"
            value={units}
            onChange={(event) => setUnits(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Hospital</label>
          <input
            type="text"
            placeholder="Enter hospital name"
            value={hospital}
            onChange={(event) => setHospital(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Area</label>
          <input
            type="text"
            placeholder="Enter area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            required
          />
        </div>

        <div>
          <label>City</label>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Urgency</label>
          <select
            value={urgency}
            onChange={(event) => setUrgency(event.target.value)}
          >
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>

        <div>
          <label>Required Date</label>
          <input
            type="date"
            value={requiredDate}
            onChange={(event) => setRequiredDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Contact Phone</label>
          <input
            type="text"
            placeholder="Enter contact number"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Message</label>
          <textarea
            placeholder="Additional information"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <button type="submit">Create Blood Request</button>
      </form>

      <hr />
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default CreateBloodRequest;