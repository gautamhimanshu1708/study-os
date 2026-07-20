import Goal from '../models/Goal.js';

/**
 * @desc    Get all goals for logged-in user with filters
 * @route   GET /api/goals
 * @access  Private
 */
export const getGoals = async (req, res) => {
  try {
    const { goalType, status, category, search } = req.query;

    const query = { user: req.user._id };

    if (goalType) {
      query.goalType = goalType;
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const goals = await Goal.find(query).sort({ targetDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve goals',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single goal by ID
 * @route   GET /api/goals/:id
 * @access  Private
 */
export const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal details',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new Goal (Short-Term or Long-Term)
 * @route   POST /api/goals
 * @access  Private
 */
export const createGoal = async (req, res) => {
  try {
    const { title, goalType, category, targetDate, progressPercentage, status, milestones, notes } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Goal title is required',
      });
    }

    if (!targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Target date deadline is required',
      });
    }

    const goal = new Goal({
      user: req.user._id,
      title,
      goalType: goalType || 'Short Term',
      category: category || 'Academic',
      targetDate,
      progressPercentage: progressPercentage !== undefined ? Number(progressPercentage) : 0,
      status: status || 'In Progress',
      milestones: Array.isArray(milestones) ? milestones : [],
      notes: notes || '',
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message,
    });
  }
};

/**
 * @desc    Update goal details
 * @route   PUT /api/goals/:id
 * @access  Private
 */
export const updateGoal = async (req, res) => {
  try {
    const { title, goalType, category, targetDate, progressPercentage, status, milestones, notes } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    if (title !== undefined) goal.title = title;
    if (goalType !== undefined) goal.goalType = goalType;
    if (category !== undefined) goal.category = category;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (progressPercentage !== undefined) goal.progressPercentage = Number(progressPercentage);
    if (status !== undefined) goal.status = status;
    if (milestones !== undefined && Array.isArray(milestones)) goal.milestones = milestones;
    if (notes !== undefined) goal.notes = notes;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message,
    });
  }
};

/**
 * @desc    Update goal progress percentage
 * @route   PATCH /api/goals/:id/progress
 * @access  Private
 */
export const updateGoalProgress = async (req, res) => {
  try {
    const { progressPercentage } = req.body;

    if (progressPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Progress percentage is required',
      });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    goal.progressPercentage = Math.min(100, Math.max(0, Number(progressPercentage)));
    await goal.save();

    res.status(200).json({
      success: true,
      message: `Goal progress updated to ${goal.progressPercentage}%`,
      data: goal,
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle sub-milestone completion inside goal
 * @route   PATCH /api/goals/:id/milestones/:milestoneId
 * @access  Private
 */
export const toggleMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;

    const goal = await Goal.findOne({ _id: id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    const milestone = goal.milestones.id(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    milestone.isCompleted = !milestone.isCompleted;
    await goal.save();

    res.status(200).json({
      success: true,
      message: `Milestone status updated`,
      data: goal,
    });
  } catch (error) {
    console.error('Error toggling milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update milestone',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Goal statistics (Total, Short Term, Long Term, Achieved, Avg %)
 * @route   GET /api/goals/stats
 * @access  Private
 */
export const getGoalStats = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const totalGoals = goals.length;
    const shortTermCount = goals.filter((g) => g.goalType === 'Short Term').length;
    const longTermCount = goals.filter((g) => g.goalType === 'Long Term').length;
    const achievedCount = goals.filter((g) => g.status === 'Achieved').length;
    const inProgressCount = goals.filter((g) => g.status === 'In Progress').length;

    const totalProgress = goals.reduce((acc, g) => acc + (g.progressPercentage || 0), 0);
    const averageProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalGoals,
        shortTermCount,
        longTermCount,
        achievedCount,
        inProgressCount,
        averageProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve goal statistics',
      error: error.message,
    });
  }
};
