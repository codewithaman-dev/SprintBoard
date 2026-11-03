import Issue from "../models/Issue.js";
import Project from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { issueSchema, objectIdSchema } from "../utils/validators.js";
import { recordActivity } from "../services/activityService.js";

async function ownedProject(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, createdBy: userId });
  if (!project) throw new HttpError(404, "Project not found.");
  return project;
}

export const listIssues = asyncHandler(async (req, res) => {
  const filter = {};
  const projectId = req.query.projectId;
  if (projectId) {
    if (!objectIdSchema.safeParse(projectId).success) throw new HttpError(400, "Invalid project ID.");
    await ownedProject(projectId, req.user._id);
    filter.projectId = projectId;
  } else {
    const projects = await Project.find({ createdBy: req.user._id }).select("_id");
    filter.projectId = { $in: projects.map((project) => project._id) };
  }

  if (req.query.status) {
    if (!["todo", "in-progress", "done"].includes(req.query.status)) throw new HttpError(400, "Invalid status filter.");
    filter.status = req.query.status;
  }
  if (req.query.priority) {
    if (!["low", "medium", "high"].includes(req.query.priority)) throw new HttpError(400, "Invalid priority filter.");
    filter.priority = req.query.priority;
  }
  if (req.query.search) {
    const term = String(req.query.search).trim().slice(0, 80);
    if (term) filter.title = { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const [issues, total] = await Promise.all([
    Issue.find(filter).populate("projectId", "name").sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Issue.countDocuments(filter)
  ]);
  res.json({ success: true, issues, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const createIssue = asyncHandler(async (req, res) => {
  const parsed = issueSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
  const project = await ownedProject(parsed.data.projectId, req.user._id);
  const issue = await Issue.create({ ...parsed.data, createdBy: req.user._id });
  await recordActivity({ userId: req.user._id, projectId: project._id, issueId: issue._id, action: `Created issue "${issue.title}"` });
  req.io?.to(`project:${project._id}`).emit("issue:changed", { projectId: project._id, issueId: issue._id });
  res.status(201).json({ success: true, issue });
});

export const updateIssue = asyncHandler(async (req, res) => {
  if (!objectIdSchema.safeParse(req.params.id).success) throw new HttpError(400, "Invalid issue ID.");
  const current = await Issue.findById(req.params.id);
  if (!current) throw new HttpError(404, "Issue not found.");
  await ownedProject(current.projectId, req.user._id);

  const parsed = issueSchema.partial().omit({ projectId: true }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
  const issue = await Issue.findByIdAndUpdate(current._id, parsed.data, { new: true, runValidators: true });
  await recordActivity({ userId: req.user._id, projectId: issue.projectId, issueId: issue._id, action: `Updated issue "${issue.title}"` });
  req.io?.to(`project:${issue.projectId}`).emit("issue:changed", { projectId: issue.projectId, issueId: issue._id });
  res.json({ success: true, issue });
});

export const changeIssueStatus = asyncHandler(async (req, res) => {
  if (!objectIdSchema.safeParse(req.params.id).success) throw new HttpError(400, "Invalid issue ID.");
  const status = req.body.status;
  if (!["todo", "in-progress", "done"].includes(status)) throw new HttpError(400, "Choose a valid issue status.");
  const current = await Issue.findById(req.params.id);
  if (!current) throw new HttpError(404, "Issue not found.");
  await ownedProject(current.projectId, req.user._id);
  const issue = await Issue.findByIdAndUpdate(current._id, { status }, { new: true, runValidators: true });
  await recordActivity({ userId: req.user._id, projectId: issue.projectId, issueId: issue._id, action: `Moved "${issue.title}" to ${status}` });
  req.io?.to(`project:${issue.projectId}`).emit("issue:changed", { projectId: issue.projectId, issueId: issue._id });
  res.json({ success: true, issue });
});

export const deleteIssue = asyncHandler(async (req, res) => {
  if (!objectIdSchema.safeParse(req.params.id).success) throw new HttpError(400, "Invalid issue ID.");
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw new HttpError(404, "Issue not found.");
  await ownedProject(issue.projectId, req.user._id);
  await issue.deleteOne();
  await recordActivity({ userId: req.user._id, projectId: issue.projectId, action: `Deleted issue "${issue.title}"` });
  req.io?.to(`project:${issue.projectId}`).emit("issue:changed", { projectId: issue.projectId, issueId: issue._id });
  res.json({ success: true, message: "Issue deleted." });
});
