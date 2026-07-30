import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * @param {string[]} [allowedRoles] - if given, the user's role must be in this list
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading, needsApproval } = useAuth();
  const location = useLocation();

  // Firebase restores the session asynchronously on page load. Without this
  // guard, refreshing any protected page would redirect to /login for a
  // moment before the session arrived — logging the user out on every refresh.
  if (loading) {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <sgds-spinner size="lg"></sgds-spinner>
        <span>Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // A volunteer whose account exists but hasn't been approved yet can sign in,
  // but shouldn't reach the app. Send them to the holding page instead of
  // bouncing them to login, which would look like their password was wrong.
  if (needsApproval) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
