import Request from "../models/Request.js";

export const sendRequest = async (req, res) => {
  try {
    const { teacherId, message } = req.body;
    const parentId = req.user.id;

    if (!teacherId) return res.status(400).json({ message: "teacherId is required" });

    const newRequest = await Request.create({ parentId, teacherId, message });
    res.json({ message: "Request sent successfully", request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeacherRequests = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const requests = await Request.find({ teacherId }).populate("parentId", "name email avatar");
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "accepted", "rejected"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const updated = await Request.findByIdAndUpdate(requestId, { status }, { new: true });
    res.json({ message: "Request updated", request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
