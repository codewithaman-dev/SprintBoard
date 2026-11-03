import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Activity, FolderKanban, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

export default function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand"><span className="brand-mark">S</span><span>SprintBoard</span></NavLink>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to="/" end><LayoutDashboard size={18} /> Overview</NavLink>
          <NavLink to="/projects"><FolderKanban size={18} /> Projects</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
            <div className="user-copy"><strong>{user?.name}</strong><span>{user?.email}</span></div>
          </div>
          <button className="nav-button" onClick={handleSignOut}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><span className="topbar-kicker">YOUR WORKSPACE</span><strong>Make progress visible.</strong></div>
          <button className="button button-primary button-small" onClick={() => navigate("/projects")}><Plus size={16} /> New project</button>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
