import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingIds, setUpdatingIds] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:5000/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "Failed to load notifications");
          return;
        }

        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Get notifications error:", error);
        setErrorMessage("Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");
    setActionError("");
    setUpdatingIds((currentIds) => [...currentIds, notificationId]);

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setActionError(data.message || "Failed to mark notification as read");
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
      setActionError("Cannot connect to the server");
    } finally {
      setUpdatingIds((currentIds) =>
        currentIds.filter((id) => id !== notificationId),
      );
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    setActionError("");
    setMarkingAll(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setActionError(data.message || "Failed to mark notifications as read");
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      setActionError("Cannot connect to the server");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  if (loading) {
    return <p className="notifications-status">Loading notifications...</p>;
  }

  return (
    <main className="notifications-page">
      <header className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
              : "You are all caught up."}
          </p>
        </div>
        <div className="notifications-actions">
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || markingAll}
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </header>

      {errorMessage && (
        <p className="notifications-error" role="alert">
          {errorMessage}
        </p>
      )}
      {actionError && (
        <p className="notifications-error" role="alert">
          {actionError}
        </p>
      )}

      {!errorMessage &&
        (notifications.length === 0 ? (
          <p className="notifications-empty">You have no notifications yet.</p>
        ) : (
          <ul className="notifications-list">
            {notifications.map((notification) => (
              <li
                className={`notification-card${notification.isRead ? "" : " notification-card-unread"}`}
                key={notification._id}
              >
                <div className="notification-content">
                  <div className="notification-title-row">
                    <h2>{notification.title}</h2>
                    {!notification.isRead && (
                      <span className="notification-unread-label">Unread</span>
                    )}
                  </div>
                  <p>{notification.message}</p>
                  <time dateTime={notification.createdAt}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </time>
                </div>
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification._id)}
                    disabled={
                      markingAll || updatingIds.includes(notification._id)
                    }
                  >
                    {updatingIds.includes(notification._id)
                      ? "Marking..."
                      : "Mark as read"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ))}
    </main>
  );
}

export default Notifications;
