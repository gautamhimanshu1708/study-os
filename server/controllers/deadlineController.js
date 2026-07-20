import Deadline from '../models/Deadline.js';

// GET /api/deadlines
export const getDeadlines = async (req, res) => {
  try {
    const { category, priority, status } = req.query;
    const query = { user: req.user._id };
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    if (status === 'completed') query.isCompleted = true;
    if (status === 'pending') query.isCompleted = false;

    const deadlines = await Deadline.find(query).sort({ deadlineDate: 1 });
    res.status(200).json({ success: true, data: deadlines });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch deadlines', error: error.message });
  }
};

// POST /api/deadlines
export const createDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create deadline', error: error.message });
  }
};

// PUT /api/deadlines/:id
export const updateDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!deadline) return res.status(404).json({ success: false, message: 'Deadline not found' });
    res.status(200).json({ success: true, data: deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update deadline', error: error.message });
  }
};

// DELETE /api/deadlines/:id
export const deleteDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deadline) return res.status(404).json({ success: false, message: 'Deadline not found' });
    res.status(200).json({ success: true, message: 'Deadline deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete deadline', error: error.message });
  }
};

// PATCH /api/deadlines/:id/toggle
export const toggleDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findOne({ _id: req.params.id, user: req.user._id });
    if (!deadline) return res.status(404).json({ success: false, message: 'Deadline not found' });
    deadline.isCompleted = !deadline.isCompleted;
    await deadline.save();
    res.status(200).json({ success: true, data: deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle deadline', error: error.message });
  }
};
