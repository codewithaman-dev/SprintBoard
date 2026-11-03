import Project from "../models/Project.js";
import Issue from "../models/Issue.js";
import Activity from "../models/Activity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { projectSchema, objectIdSchema } from "../utils/validators.js";
import { recordActivity } from "../services/activityService.js";

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ createdBy: req.user._id }).sort({ updatedAt: -1 });
  res.json({ success: true, projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
  const project = await Project.create({ ...parsed.data, createdBy: req.user._id });
  await recordActivity({ userId: req.user._id, projectId: project._id, action: `Created project "${project.name}"` });
  req.io?.to(`project:${project._id}`).emit("project:updated", { projectId: project._id });
  res.status(201).json({ success: true, project });
});

export const getProject = asyncHandler(async (req, res) => {
  if (!objectIdSchema.safeParse(req.params.id).success) throw new HttpError(400, "Invalid project ID.");
  const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!project) throw new HttpError(404, "Project not found.");
  res.json({ success: true, project });
});

export const updateProject = asyncHandler(async (req, res) => {
  if (!objectIdSchema.safeParse(req.params.id).success) throw new HttpError(400, "Invalid project ID.");
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    parsed.data,
    { new: true, runValidators: true }
  );
  if (!project) throw new HttpError(404, "Project not found.");
  await recordActivity({ userId: req.user._id, projectId: project._id, action: `Updated project "${project.name}"` });
  req.io?.to(`project:${project._id}`).emit("project:updated", { projectId: project._id });
  res.json({ success: true, project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  if (!objectIdSchema.safeParse(req.params.id).success) throw new HttpError(400, "Invalid project ID.");
  const project = await Project.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!project) throw new HttpError(404, "Project not found.");
  await Promise.all([
    Issue.deleteMany({ projectId: project._id }),
    Activity.deleteMany({ projectId: project._id })
  ]);
  res.json({ success: true, message: "Project and its related records were deleted." });
});

export const projectActivities = asyncHandler(async (req, res) => {
  if (!objectIdSchema.safeParse(req.params.id).success) throw new HttpError(400, "Invalid project ID.");
  const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!project) throw new HttpError(404, "Project not found.");
  const activities = await Activity.find({ projectId: project._id })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .limit(30);
  res.json({ success: true, activities });
});
