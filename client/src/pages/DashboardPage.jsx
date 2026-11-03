import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleDot, FolderKanban, ListTodo, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardApi, projectApi } from "../services/api";

const emptyStats = { totalProjects: 0, totalIssues: 0, openIssues: 0, inProgressIssues: 0, completedIssues: 0, highPriorityIssues: 0 };

export default function DashboardPage() {
  const [stats, setStats] = useState(emptyStats);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.stats(), projectApi.list()])
      .then(([summary, projectResult]) => {
        setStats(summary.stats);
        setProjects(projectResult.projects.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Projects", value: stats.totalProjects, icon: FolderKanban, tone: "violet" },
    { label: "All issues", value: stats.totalIssues, icon: ListTodo, tone: "blue" },
    { label: "In progress", value: stats.inProgressIssues, icon: CircleDot, tone: "amber" },
    { label: "Completed", value: stats.completedIssues, icon: CheckCircle2, tone: "green" }
  ];

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><span className="eyebrow">OVERVIEW</span><h1>Your work, at a glance.</h1><p className="muted">A little clarity on what’s moving and what needs attention.</p></div>
        <Link className="button button-primary" to="/projects"><Plus size={17} /> Create project</Link>
      </section>
      {error && <div className="notice notice-error">{error}</div>}
      <section className="stats-grid">
        {cards.map(({ label, value, icon: Icon, tone }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><span>{label}</span><strong>{loading ? "—" : value}</strong></article>)}
      </section>
      <section className="content-panel">
        <div className="panel-heading"><div><h2>Recent projects</h2><p className="muted">The spaces you’ve been working in.</p></div><Link to="/projects" className="text-link">All projects <ArrowUpRight size={15} /></Link></div>
        {loading ? <div className="empty-state">Loading your projects…</div> : projects.length === 0 ? <div className="empty-state"><div className="empty-icon"><FolderKanban /></div><h3>Your first project starts here</h3><p>Create a project to give your team's work a home.</p><Link className="button button-primary" to="/projects"><Plus size={16} /> Create a project</Link></div> : <div className="project-list">{projects.map((project) => <Link className="project-row" key={project._id} to={`/projects/${project._id}`}><div className="project-symbol">{project.name.slice(0, 1).toUpperCase()}</div><div className="project-row-copy"><strong>{project.name}</strong><span>{project.description || "No description yet"}</span></div><ArrowUpRight size={17} /></Link>)}</div>}
      </section>
      <div className="quiet-note">High-priority issues: <strong>{stats.highPriorityIssues}</strong> · Open issues: <strong>{stats.openIssues}</strong></div>
    </div>
  );
}
