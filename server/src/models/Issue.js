import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 3000, default: "" },
  status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo", index: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium", index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

issueSchema.index({ projectId: 1, createdAt: -1 });
issueSchema.index({ title: "text", description: "text" });
export default mongoose.model("Issue", issueSchema);
