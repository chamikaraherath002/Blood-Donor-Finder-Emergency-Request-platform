import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DonorProfile from "./pages/DonorProfile.jsx";
import FindDonors from "./pages/FindDonors.jsx";
import CreateBloodRequest from "./pages/CreateBloodRequest.jsx";
import MyBloodRequests from "./pages/MyBloodRequests.jsx";
import ReceivedDonationRequests from "./pages/ReceivedDonationRequests.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor-profile"
        element={
          <ProtectedRoute>
            <DonorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/find-donors"
        element={
          <ProtectedRoute>
            <FindDonors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-blood-request"
        element={
          <ProtectedRoute>
            <CreateBloodRequest />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/my-blood-requests"
        element={
          <ProtectedRoute>
            <MyBloodRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donation-requests/received"
        element={
          <ProtectedRoute>
            <ReceivedDonationRequests />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
