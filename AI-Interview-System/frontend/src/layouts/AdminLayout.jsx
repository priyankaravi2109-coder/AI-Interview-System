import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      label: "Job Management",
      path: "/admin/jobs",
    },
    {
      label: "Candidate Management",
      path: "/admin/candidates",
    },
    {
      label: "Interview Management",
      path: "/admin/interviews",
    },
    {
      label: "Interview Configuration",
      path: "/admin/interview-configuration",
    },
    {
      label: "Verification Logs",
      path: "/admin/verification-logs",
    },
    {
      label: "Interview Reports",
      path: "/admin/reports",
    },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
    },
  ];

  return (
    <div className="admin-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-header">
          <h2>AI Interview</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-navigation">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "admin-nav-link active"
                  : "admin-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}

        </nav>

        <div className="admin-sidebar-footer">

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* =========================
          MAIN AREA
      ========================= */}

      <div className="admin-main">

        <header className="admin-header">

          <div>
            <h1>AI Interview & Assessment</h1>
            <p>HR / Admin Management Portal</p>
          </div>

          <div className="admin-user-info">

            <strong>
              {user?.name || user?.email || "Administrator"}
            </strong>

            <span>
              {user?.role || "admin"}
            </span>

          </div>

        </header>


        {/* =========================
            PAGE CONTENT
        ========================= */}

        <main className="admin-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;