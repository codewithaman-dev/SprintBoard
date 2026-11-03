import { Router } from "express";
import {
  createProject, deleteProject, getProject, listProjects, projectActivities, updateProject
} from "../controllers/projectController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id/activities", projectActivities);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
export default router;
