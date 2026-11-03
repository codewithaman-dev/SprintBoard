import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", default: null },
  action: { type: String, required: true, maxlength: 240 }
}, { timestamps: { createdAt: true, updatedAt: false } });

activitySchema.index({ projectId: 1, createdAt: -1 });
export default mongoose.model("Activity", activitySchema);
