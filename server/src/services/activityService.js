import Activity from "../models/Activity.js";

export async function recordActivity({ userId, projectId, issueId = null, action }) {
  return Activity.create({ userId, projectId, issueId, action });
}
