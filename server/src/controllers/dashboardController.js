import Project from "../models/Project.js";
import Issue from "../models/Issue.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardStats = asyncHandler(async (req, res) => {
  const projects = await Project.find({ createdBy: req.user._id }).select("_id");
  const projectIds = projects.map((project) => project._id);
  const base = { projectId: { $in: projectIds } };

  const [totalIssues, todo, inProgress, done, highPriority] = await Promise.all([
    Issue.countDocuments(base),
    Issue.countDocuments({ ...base, status: "todo" }),
    Issue.countDocuments({ ...base, status: "in-progress" }),
    Issue.countDocuments({ ...base, status: "done" }),
    Issue.countDocuments({ ...base, priority: "high" })
  ]);

  res.json({
    success: true,
    stats: {
      totalProjects: projects.length,
      totalIssues,
      openIssues: todo,
      inProgressIssues: inProgress,
      completedIssues: done,
      highPriorityIssues: highPriority
    }
  });
});
