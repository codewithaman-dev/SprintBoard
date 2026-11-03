import { useEffect, useState } from "react";
import { FolderKanban, Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { projectApi } from "../services/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadProjects() {
    try { const result = await projectApi.list(); setProjects(result.projects); }
    catch (err) { setError(err.message); }
  }

  useEffect(() => { loadProjects(); }, []);

  async function createProject(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await projectApi.create({ name, description });
      setName(""); setDescription(""); setShowForm(false);
      await loadProjects();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  const visible = projects.filter((project) =>
    `${project.name} ${project.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><span className="eyebrow">WORKSPACE</span><h1>Projects</h1><p className="muted">Keep related work together and moving forward.</p></div>
        <button className="button button-primary" onClick={() => setShowForm((value) => !value)}><Plus size={17} /> New project</button>
      </section>
      {error && <div className="notice notice-error">{error}</div>}
      {showForm && <form className="content-panel project-form" onSubmit={createProject}><div className="panel-heading"><div><h2>A new project</h2><p className="muted">Give this piece of work a name and a little context.</p></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button></div><label>Project name<input value={name} onChange={(e) => setName(e.target.value)} required minLength="2" maxLength="100" placeholder="e.g. Website refresh" /></label><label>Description <span className="muted">(optional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength="1000" rows="3" placeholder="What are you hoping to get done?" /></label><div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? "Creating…" : "Create project"}</button></div></form>}
      <div className="toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a project…" /></div><span className="muted">{visible.length} {visible.length === 1 ? "project" : "projects"}</span></div>
      {visible.length === 0 ? <div className="content-panel empty-state"><div className="empty-icon"><FolderKanban /></div><h3>{search ? "No matching projects" : "Nothing on the board yet"}</h3><p>{search ? "Try another search term." : "Create a project and start collecting the work that matters."}</p></div> : <div className="project-grid">{visible.map((project, index) => <Link className="project-card" to={`/projects/${project._id}`} key={project._id}><div className={`project-card-mark mark-${index % 4}`}>{project.name.slice(0, 1).toUpperCase()}</div><h3>{project.name}</h3><p>{project.description || "A place for the next steps."}</p><span className="project-card-footer">Open project <span>↗</span></span></Link>)}</div>}
    </div>
  );
}
