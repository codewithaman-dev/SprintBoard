import { Router } from "express";
import { changeIssueStatus, createIssue, deleteIssue, listIssues, updateIssue } from "../controllers/issueController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", listIssues);
router.post("/", createIssue);
router.patch("/:id/status", changeIssueStatus);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);
export default router;
