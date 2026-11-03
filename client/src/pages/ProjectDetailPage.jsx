import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Plus, Search, Trash2 } from "lucide-react";
import { issueApi, projectApi } from "../services/api";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [projectResult, issueResult, activityResult] = await Promise.all([
        projectApi.list().then((result) => result.projects.find((item) => item._id === id)),
        issueApi.list({ projectId: id, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) }),
        projectApi.activities(id)
      ]);
      if (!projectResult) throw new Error("Project not found.");
      setProject(projectResult);
      setIssues(issueResult.issues);
      setActivities(activityResult.activities);
      setError("");
    } catch (err) { setError(err.message); }
  }, [id, filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const socket = io(socketUrl, { withCredentials: true });
    socket.emit("project:join", id);
    socket.on("issue:changed", load);
    socket.on("project:updated", load);
    return () => { socket.emit("project:leave", id); socket.disconnect(); };
  }, [id, load]);

  async function createIssue(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await issueApi.create({ ...form, projectId: id });
      setForm({ title: "", description: "", priority: "medium" });
      setShowForm(false);
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function changeStatus(issueId, status) {
    try { await issueApi.changeStatus(issueId, status); await load(); }
    catch (err) { setError(err.message); }
  }

  async function removeIssue(issueId) {
    if (!window.confirm("Delete this issue? This cannot be undone.")) return;
    try { await issueApi.remove(issueId); await load(); }
    catch (err) { setError(err.message); }
  }

  const grouped = useMemo(() => ({
    todo: issues.filter((issue) => issue.status === "todo"),
    "in-progress": issues.filter((issue) => issue.status === "in-progress"),
    done: issues.filter((issue) => issue.status === "done")
  }), [issues]);

  if (!project && !error) return <div className="page-loading">Opening project…</div>;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><span className="eyebrow">PROJECT</span><h1>{project?.name || "Project"}</h1><p className="muted">{project?.description || "A focused space for this team's work."}</p></div>
        <button className="button button-primary" onClick={() => setShowForm((value) => !value)}><Plus size={17} /> Add issue</button>
      </section>
      {error && <div className="notice notice-error">{error}</div>}
      {showForm && <form className="content-panel project-form" onSubmit={createIssue}><h2>Capture an issue</h2><label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength="2" maxLength="160" placeholder="What needs doing?" /></label><label>Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength="3000" placeholder="Add useful context…" /></label><label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Create issue"}</button></div></form>}
      <div className="filter-bar"><div className="search-field"><Search size={16} /><input placeholder="Search issues…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div><select aria-label="Filter by status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select><select aria-label="Filter by priority" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
      <section className="board-grid">
        {Object.entries(grouped).map(([status, items]) => <div className="board-column" key={status}><div className="column-heading"><span className={`column-dot dot-${status}`} /><strong>{status === "todo" ? "To do" : status === "done" ? "Done" : "In progress"}</strong><span className="count-pill">{items.length}</span></div>{items.map((issue) => <article className="issue-card" key={issue._id}><div className="issue-card-top"><span className={`priority priority-${issue.priority}`}>{issue.priority}</span><button className="icon-button danger-icon" onClick={() => removeIssue(issue._id)} aria-label="Delete issue"><Trash2 size={15} /></button></div><h3>{issue.title}</h3>{issue.description && <p>{issue.description}</p>}<select aria-label={`Change status for ${issue.title}`} value={issue.status} onChange={(e) => changeStatus(issue._id, e.target.value)}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select></article>)}</div>)}
      </section>
      <section className="content-panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p className="muted">A short history of what has changed.</p></div><span className="live-label"><span /> Live updates</span></div>{activities.length === 0 ? <p className="muted">Project activity will show up here.</p> : <div className="activity-list">{activities.map((activity) => <div className="activity-row" key={activity._id}><div className="activity-avatar">{activity.userId?.name?.slice(0, 1) || "S"}</div><div><strong>{activity.userId?.name || "A teammate"}</strong><span>{activity.action}</span></div><time>{new Date(activity.createdAt).toLocaleString()}</time></div>)}</div>}</section>
    </div>
  );
}
