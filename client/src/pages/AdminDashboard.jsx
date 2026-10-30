import { useCallback, useEffect, useState } from "react";

const apiBase = "http://localhost:5000/api/admin";
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const requestStatuses = [
  "PENDING",
  "ACCEPTED",
  "DONATED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];
const userRoles = ["USER", "ADMIN"];
const emptyUserForm = {
  name: "",
  email: "",
  phone: "",
  role: "USER",
  password: "",
};

async function adminFetch(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Admin request failed");
  }
  return data;
}

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [donorPagination, setDonorPagination] = useState(null);
  const [requestPagination, setRequestPagination] = useState(null);
  const [userPagination, setUserPagination] = useState(null);
  const [donorFilters, setDonorFilters] = useState({
    search: "",
    bloodGroup: "",
    city: "",
  });
  const [requestFilters, setRequestFilters] = useState({
    search: "",
    bloodGroup: "",
    status: "",
  });
  const [donorQuery, setDonorQuery] = useState("");
  const [requestQuery, setRequestQuery] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState("");
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actingId, setActingId] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await adminFetch("/dashboard");
      setStats(data.stats);
      setRecentRequests(data.recentRequests || []);
    } catch (error) {
      console.error("Load admin dashboard error:", error);
      setErrorMessage(error.message || "Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDonors = useCallback(async (page = 1, filters = donorQuery) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams({ page: String(page) });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const data = await adminFetch(`/donors?${params.toString()}`);
      setDonors(data.donors || []);
      setDonorPagination(data.pagination);
    } catch (error) {
      console.error("Load admin donors error:", error);
      setErrorMessage(error.message || "Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  }, [donorQuery]);

  const loadBloodRequests = useCallback(async (page = 1, filters = requestQuery) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams({ page: String(page) });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const data = await adminFetch(`/blood-requests?${params.toString()}`);
      setBloodRequests(data.bloodRequests || []);
      setRequestPagination(data.pagination);
    } catch (error) {
      console.error("Load admin blood requests error:", error);
      setErrorMessage(error.message || "Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  }, [requestQuery]);

  const loadUsers = useCallback(async (page = 1, search = userQuery) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      const data = await adminFetch(`/users?${params.toString()}`);
      setUsers(data.users || []);
      setUserPagination(data.pagination);
    } catch (error) {
      console.error("Load admin users error:", error);
      setErrorMessage(error.message || "Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  }, [userQuery]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await adminFetch("/dashboard");
        setStats(data.stats);
        setRecentRequests(data.recentRequests || []);
      } catch (error) {
        console.error("Load admin dashboard error:", error);
        setErrorMessage(error.message || "Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const updateBloodRequest = async (request, action) => {
    const removing = action === "delete";
    const prompt = removing
      ? "Permanently remove this blood request? Related donation responses and notifications will also be removed."
      : "Cancel this blood request? It will remain in the database with CANCELLED status.";
    if (!window.confirm(prompt)) return;

    setActingId(request._id);
    setActionMessage("");
    setErrorMessage("");
    try {
      const result = await adminFetch(
        `/blood-requests/${request._id}${removing ? "" : "/cancel"}`,
        { method: removing ? "DELETE" : "PATCH" },
      );
      setActionMessage(result.message);
      await Promise.all([loadBloodRequests(requestPagination?.page || 1), loadOverview()]);
    } catch (error) {
      console.error("Admin blood request action error:", error);
      setErrorMessage(error.message || "Cannot connect to the server");
    } finally {
      setActingId("");
    }
  };

  const submitDonorSearch = (event) => {
    event.preventDefault();
    setDonorQuery({ ...donorFilters });
    loadDonors(1, donorFilters);
  };

  const submitRequestSearch = (event) => {
    event.preventDefault();
    setRequestQuery({ ...requestFilters });
    loadBloodRequests(1, requestFilters);
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Platform administration</p>
          <h1>Admin dashboard</h1>
          <p>Monitor donors and manage blood requests across the platform.</p>
        </div>
      </header>

      <nav className="admin-section-tabs" aria-label="Admin sections">
        {[
          ["overview", "Overview"],
          ["users", "Users"],
          ["donors", "Donors"],
          ["requests", "Blood requests"],
        ].map(([section, label]) => (
          <button
            aria-current={activeSection === section ? "page" : undefined}
            className={activeSection === section ? "active" : ""}
            key={section}
            onClick={() => {
              setActiveSection(section);
              setErrorMessage("");
              setActionMessage("");
              if (section === "overview") loadOverview();
              if (section === "donors") loadDonors();
              if (section === "requests") loadBloodRequests();
              if (section === "users") loadUsers();
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {errorMessage && <p className="admin-feedback error" role="alert">{errorMessage}</p>}
      {actionMessage && <p className="admin-feedback success" role="status">{actionMessage}</p>}

      {activeSection === "overview" && (
        <section aria-label="Platform overview" className="admin-section">
          <div className="admin-stat-grid">
            {[
              ["Registered users", stats?.users],
              ["Donor profiles", stats?.donors],
              ["All blood requests", stats?.bloodRequests],
              ["Active blood requests", stats?.activeBloodRequests],
              ["Pending donor responses", stats?.pendingDonationRequests],
            ].map(([label, value]) => (
              <article className="admin-stat-card" key={label}>
                <span>{label}</span>
                <strong>{loading && value === undefined ? "…" : value ?? "—"}</strong>
              </article>
            ))}
          </div>
          <section className="admin-panel">
            <header className="admin-panel-heading">
              <div>
                <h2>Latest blood requests</h2>
                <p>Recently submitted requests from across the platform.</p>
              </div>
              <button onClick={() => setActiveSection("requests")} type="button">
                Manage requests
              </button>
            </header>
            {loading && recentRequests.length === 0 ? (
              <p>Loading recent requests...</p>
            ) : recentRequests.length === 0 ? (
              <p>No blood requests have been submitted.</p>
            ) : (
              <div className="admin-request-list">
                {recentRequests.map((request) => (
                  <article className="admin-request-row" key={request._id}>
                    <span className="admin-blood-type">{request.bloodGroup}</span>
                    <div className="admin-row-main">
                      <strong>{request.hospital}</strong>
                      <span>
                        {request.location.city} ·{" "}
                        {request.requester?.name || "Unknown requester"}
                      </span>
                    </div>
                    <span className={`admin-status status-${request.status?.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </article>
                ))}
              </div>
            )}

          </section>
        </section>
      )}

      {activeSection === "users" && (
        <section aria-label="User management" className="admin-section">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              <div>
                <h2>User management</h2>
                <p>Manage user accounts, contact details, and platform roles.</p>
              </div>
              <button
                onClick={() => {
                  setEditingUserId("");
                  setUserForm(emptyUserForm);
                  setUserModalOpen(true);
                }}
                type="button"
              >
                Add user
              </button>
            </header>
            <form
              className="admin-user-search"
              onSubmit={(event) => {
                event.preventDefault();
                setUserQuery(userSearch.trim());
                loadUsers(1, userSearch.trim());
              }}
            >
              <label htmlFor="admin-user-search">Search users</label>
              <input
                id="admin-user-search"
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search by name, email, or phone"
                value={userSearch}
              />
              <button type="submit">Search</button>
            </form>

            {userPagination && (
              <p className="admin-user-total">{userPagination.total} accounts</p>
            )}

            {loading ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p className="admin-empty">No users match your search.</p>
            ) : (
              <div className="admin-user-table-wrap">
                <table className="admin-user-table">
                  <thead>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Role</th>
                      <th scope="col">Joined</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="admin-table-user">
                            <span aria-hidden="true" className="admin-donor-avatar">
                              {user.name?.trim()?.[0]?.toUpperCase() || "U"}
                            </span>
                            <span>
                              <strong>{user.name}</strong>
                              <small>{user.email}</small>
                            </span>
                          </div>
                        </td>
                        <td>{user.phone || "—"}</td>
                        <td>
                          <span className={`admin-role-badge role-${user.role.toLowerCase()}`}>
                            {user.role === "ADMIN" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="admin-user-actions">
                            <button
                              aria-label={`Edit ${user.name}`}
                              onClick={() => {
                                setEditingUserId(user._id);
                                setUserForm({
                                  name: user.name,
                                  email: user.email,
                                  phone: user.phone || "",
                                  role: user.role,
                                  password: "",
                                });
                                setUserModalOpen(true);
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              aria-label={`Delete ${user.name}`}
                              className="admin-delete-button"
                              disabled={Boolean(actingId)}
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `Permanently delete ${user.name} and related donor profiles, blood requests, and notifications?`,
                                  )
                                ) return;
                                setActingId(user._id);
                                setActionMessage("");
                                setErrorMessage("");
                                try {
                                  const result = await adminFetch(
                                    `/users/${user._id}`,
                                    { method: "DELETE" },
                                  );
                                  setActionMessage(result.message);
                                  await Promise.all([
                                    loadUsers(userPagination?.page || 1),
                                    loadOverview(),
                                  ]);
                                } catch (error) {
                                  console.error("Delete user error:", error);
                                  setErrorMessage(
                                    error.message || "Failed to delete user",
                                  );
                                } finally {
                                  setActingId("");
                                }
                              }}
                              type="button"
                            >
                              {actingId === user._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {userPagination && userPagination.pages > 1 && (
              <div className="admin-pagination">
                <button
                  disabled={userPagination.page <= 1 || loading}
                  onClick={() => loadUsers(userPagination.page - 1)}
                  type="button"
                >
                  Previous
                </button>
                <span>Page {userPagination.page} of {userPagination.pages}</span>
                <button
                  disabled={userPagination.page >= userPagination.pages || loading}
                  onClick={() => loadUsers(userPagination.page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </section>
      )}

      {activeSection === "donors" && (
        <section aria-label="Donor management" className="admin-section">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              <div>
                <h2>Donor directory</h2>
                <p>Search donors by name, contact, blood type, and location.</p>
              </div>
              {donorPagination && (
                <span className="admin-result-total">
                  {donorPagination.total} donors
                </span>
              )}
            </header>
            <form className="admin-filter-form" onSubmit={submitDonorSearch}>
              <label>
                Search
                <input
                  onChange={(event) =>
                    setDonorFilters({ ...donorFilters, search: event.target.value })
                  }
                  placeholder="Name, email, phone, or area"
                  value={donorFilters.search}
                />
              </label>
              <label>
                Blood group
                <select
                  onChange={(event) =>
                    setDonorFilters({ ...donorFilters, bloodGroup: event.target.value })
                  }
                  value={donorFilters.bloodGroup}
                >
                  <option value="">All blood groups</option>
                  {bloodGroups.map((group) => <option key={group}>{group}</option>)}
                </select>
              </label>
              <label>
                City
                <input
                  onChange={(event) =>
                    setDonorFilters({ ...donorFilters, city: event.target.value })
                  }
                  placeholder="Filter by city"
                  value={donorFilters.city}
                />
              </label>
              <button type="submit">Search donors</button>
            </form>

            {loading ? (
              <p>Loading donors...</p>
            ) : donors.length === 0 ? (
              <p className="admin-empty">No donors match these filters.</p>
            ) : (
              <div className="admin-donor-grid">
                {donors.map((donor) => (
                  <article className="admin-donor-card" key={donor._id}>
                    <header>
                      <span aria-hidden="true" className="admin-donor-avatar">
                        {donor.user?.name?.trim()?.[0]?.toUpperCase() || "D"}
                      </span>
                      <div className="admin-donor-identity">
                        <h3>{donor.user?.name || "Donor account"}</h3>
                        <p>{donor.user?.email || "No email available"}</p>
                      </div>
                      <span className="admin-blood-type">{donor.bloodGroup}</span>
                    </header>
                    <p><strong>Phone:</strong> {donor.user?.phone || "Not provided"}</p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {donor.location.area}, {donor.location.city}
                    </p>
                    <span className={`admin-availability ${donor.availability ? "available" : ""}`}>
                      {donor.availability ? "Available" : "Unavailable"}
                    </span>
                  </article>
                ))}
              </div>
            )}
            {donorPagination && donorPagination.pages > 1 && (
              <div className="admin-pagination">
                <button
                  disabled={donorPagination.page <= 1 || loading}
                  onClick={() => loadDonors(donorPagination.page - 1)}
                  type="button"
                >
                  Previous
                </button>
                <span>Page {donorPagination.page} of {donorPagination.pages}</span>
                <button
                  disabled={donorPagination.page >= donorPagination.pages || loading}
                  onClick={() => loadDonors(donorPagination.page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </section>
      )}

      {activeSection === "requests" && (
        <section aria-label="Blood request management" className="admin-section">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              <div>
                <h2>Blood request management</h2>
                <p>Review all requests, cancel them, or remove inappropriate content.</p>
              </div>
              {requestPagination && (
                <span className="admin-result-total">
                  {requestPagination.total} requests
                </span>
              )}
            </header>
            <form className="admin-filter-form" onSubmit={submitRequestSearch}>
              <label>
                Search
                <input
                  onChange={(event) =>
                    setRequestFilters({ ...requestFilters, search: event.target.value })
                  }
                  placeholder="Requester, hospital, or location"
                  value={requestFilters.search}
                />
              </label>
              <label>
                Blood group
                <select
                  onChange={(event) =>
                    setRequestFilters({ ...requestFilters, bloodGroup: event.target.value })
                  }
                  value={requestFilters.bloodGroup}
                >
                  <option value="">All blood groups</option>
                  {bloodGroups.map((group) => <option key={group}>{group}</option>)}
                </select>
              </label>
              <label>
                Status
                <select
                  onChange={(event) =>
                    setRequestFilters({ ...requestFilters, status: event.target.value })
                  }
                  value={requestFilters.status}
                >
                  <option value="">All statuses</option>
                  {requestStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <button type="submit">Search requests</button>
            </form>

            {loading ? (
              <p>Loading blood requests...</p>
            ) : bloodRequests.length === 0 ? (
              <p className="admin-empty">No blood requests match these filters.</p>
            ) : (
              <div className="admin-request-list">
                {bloodRequests.map((request) => (
                  <article className="admin-managed-request" key={request._id}>
                    <header className="admin-managed-request-heading">
                      <div className="admin-request-person">
                        <span className="admin-blood-type">{request.bloodGroup}</span>
                        <div>
                          <h3>{request.hospital}</h3>
                          <p>
                            {request.requester?.name || "Unknown requester"} ·{" "}
                            {request.requester?.email || "No email"}
                          </p>
                        </div>
                      </div>
                      <span className={`admin-status status-${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </header>
                    <div className="admin-managed-request-details">
                      <span><strong>Units:</strong> {request.units}</span>
                      <span>
                        <strong>Location:</strong> {request.location.area},{" "}
                        {request.location.city}
                      </span>
                      <span><strong>Urgency:</strong> {request.urgency}</span>
                      <span>
                        <strong>Required:</strong>{" "}
                        {new Date(request.requiredDate).toLocaleDateString()}
                      </span>
                      <span><strong>Contact:</strong> {request.contactPhone}</span>
                    </div>
                    {request.message && (
                      <p className="admin-request-message">{request.message}</p>
                    )}
                    <div className="admin-request-actions">
                      {!["CANCELLED", "COMPLETED"].includes(request.status) && (
                        <button
                          disabled={Boolean(actingId)}
                          onClick={() => updateBloodRequest(request, "cancel")}
                          type="button"
                        >
                          {actingId === request._id ? "Working..." : "Cancel request"}
                        </button>
                      )}
                      <button
                        className="admin-delete-button"
                        disabled={Boolean(actingId)}
                        onClick={() => updateBloodRequest(request, "delete")}
                        type="button"
                      >
                        {actingId === request._id ? "Working..." : "Remove request"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {requestPagination && requestPagination.pages > 1 && (
              <div className="admin-pagination">
                <button
                  disabled={requestPagination.page <= 1 || loading}
                  onClick={() => loadBloodRequests(requestPagination.page - 1)}
                  type="button"
                >
                  Previous
                </button>
                <span>Page {requestPagination.page} of {requestPagination.pages}</span>
                <button
                  disabled={requestPagination.page >= requestPagination.pages || loading}
                  onClick={() => loadBloodRequests(requestPagination.page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </section>
      )}

      {userModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget && !actingId) {
              setUserModalOpen(false);
            }
          }}
        >
          <section
            aria-labelledby="admin-user-modal-title"
            aria-modal="true"
            className="admin-user-modal"
            role="dialog"
          >
            <button
              aria-label="Close user form"
              className="admin-modal-close"
              disabled={Boolean(actingId)}
              onClick={() => setUserModalOpen(false)}
              type="button"
            >
              ×
            </button>
            <p className="admin-eyebrow">
              {editingUserId ? "Edit account" : "New account"}
            </p>
            <h2 id="admin-user-modal-title">
              {editingUserId ? "Edit user" : "Add a user"}
            </h2>
            <form
              className="admin-user-form"
              onSubmit={async (event) => {
                event.preventDefault();
                setActingId(editingUserId || "new-user");
                setActionMessage("");
                setErrorMessage("");
                try {
                  const result = await adminFetch(
                    editingUserId ? `/users/${editingUserId}` : "/users",
                    {
                      method: editingUserId ? "PUT" : "POST",
                      body: JSON.stringify(userForm),
                    },
                  );
                  setActionMessage(result.message);
                  setUserModalOpen(false);
                  setUserForm(emptyUserForm);
                  setEditingUserId("");
                  await Promise.all([loadUsers(1), loadOverview()]);
                } catch (error) {
                  console.error("Save user error:", error);
                  setErrorMessage(error.message || "Failed to save user");
                } finally {
                  setActingId("");
                }
              }}
            >
              <label>
                Full name
                <input
                  maxLength="100"
                  minLength="2"
                  onChange={(event) =>
                    setUserForm({ ...userForm, name: event.target.value })
                  }
                  required
                  value={userForm.name}
                />
              </label>
              <label>
                Email
                <input
                  onChange={(event) =>
                    setUserForm({ ...userForm, email: event.target.value })
                  }
                  required
                  type="email"
                  value={userForm.email}
                />
              </label>
              <label>
                Phone
                <input
                  maxLength="30"
                  onChange={(event) =>
                    setUserForm({ ...userForm, phone: event.target.value })
                  }
                  type="tel"
                  value={userForm.phone}
                />
              </label>
              <label>
                Role
                <select
                  onChange={(event) =>
                    setUserForm({ ...userForm, role: event.target.value })
                  }
                  value={userForm.role}
                >
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {role === "ADMIN" ? "Admin" : "User"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-user-password-field">
                {editingUserId ? "New password (optional)" : "Password"}
                <input
                  autoComplete="new-password"
                  minLength="8"
                  onChange={(event) =>
                    setUserForm({ ...userForm, password: event.target.value })
                  }
                  required={!editingUserId}
                  type="password"
                  value={userForm.password}
                />
              </label>
              {errorMessage && (
                <p className="admin-feedback error" role="alert">
                  {errorMessage}
                </p>
              )}
              <div className="admin-user-form-actions">
                <button disabled={Boolean(actingId)} type="submit">
                  {actingId
                    ? "Saving..."
                    : editingUserId
                      ? "Save changes"
                      : "Create user"}
                </button>
                <button
                  disabled={Boolean(actingId)}
                  onClick={() => {
                    setUserModalOpen(false);
                    setErrorMessage("");
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
