import Task from '../models/Task.js';

/**
 * @desc    Get user planner tasks with search & filters
 * @route   GET /api/planner/tasks
 * @access  Private
 */
export const getTasks = async (req, res) => {
  try {
    const { type, subject, priority, isCompleted, search, category } = req.query;

    const query = { user: req.user._id };

    if (type && ['normal', 'topic'].includes(type)) {
      query.type = type;
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    if (isCompleted !== undefined && isCompleted !== 'all') {
      query.isCompleted = isCompleted === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { chapter: { $regex: search, $options: 'i' } },
        { 'subtopics.name': { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query).sort({ deadline: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching planner tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve planner tasks',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/planner/tasks/:id
 * @access  Private
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new task (Normal or Topic-Based)
 * @route   POST /api/planner/tasks
 * @access  Private
 */
export const createTask = async (req, res) => {
  try {
    const { title, type, subject, chapter, subtopics, category, priority, deadline, notes } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const taskData = {
      user: req.user._id,
      title,
      type: type || 'normal',
      subject: subject || 'General',
      chapter: chapter || '',
      category: category || 'General',
      priority: priority || 'medium',
      deadline: deadline || null,
      notes: notes || '',
    };

    if (type === 'topic' && Array.isArray(subtopics)) {
      taskData.subtopics = subtopics.map((st) => ({
        name: typeof st === 'string' ? st : st.name,
        isCompleted: typeof st === 'object' ? Boolean(st.isCompleted) : false,
      }));
    }

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/planner/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res) => {
  try {
    const { title, type, subject, chapter, subtopics, category, priority, deadline, isCompleted, notes } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (title !== undefined) task.title = title;
    if (type !== undefined) task.type = type;
    if (subject !== undefined) task.subject = subject;
    if (chapter !== undefined) task.chapter = chapter;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline;
    if (notes !== undefined) task.notes = notes;

    if (type === 'topic' && Array.isArray(subtopics)) {
      task.subtopics = subtopics.map((st) => ({
        name: typeof st === 'string' ? st : st.name,
        isCompleted: typeof st === 'object' ? Boolean(st.isCompleted) : false,
      }));
    }

    if (isCompleted !== undefined && task.type === 'normal') {
      task.isCompleted = isCompleted;
      task.completedAt = isCompleted ? new Date() : null;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/planner/tasks/:id
 * @access  Private
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle overall task completion status
 * @route   PATCH /api/planner/tasks/:id/toggle
 * @access  Private
 */
export const toggleTaskComplete = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const nextState = !task.isCompleted;
    task.isCompleted = nextState;
    task.completedAt = nextState ? new Date() : null;

    if (task.type === 'topic' && task.subtopics) {
      task.subtopics.forEach((st) => {
        st.isCompleted = nextState;
        st.completedAt = nextState ? new Date() : null;
      });
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.isCompleted ? 'completed' : 'pending'}`,
      data: task,
    });
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle task completion status',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle individual subtopic completion within a topic-based task
 * @route   PATCH /api/planner/tasks/:id/subtopic/:subtopicId
 * @access  Private
 */
export const toggleSubtopicComplete = async (req, res) => {
  try {
    const { id, subtopicId } = req.params;

    const task = await Task.findOne({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const subtopic = task.subtopics.id(subtopicId);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        message: 'Subtopic not found',
      });
    }

    subtopic.isCompleted = !subtopic.isCompleted;
    subtopic.completedAt = subtopic.isCompleted ? new Date() : null;

    await task.save(); // pre('save') hook calculates new progressPercentage

    res.status(200).json({
      success: true,
      message: `Subtopic '${subtopic.name}' updated`,
      data: task,
    });
  } catch (error) {
    console.error('Error toggling subtopic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subtopic status',
      error: error.message,
    });
  }
};

/**
 * @desc    Get LeetCode-style planner stats & subject progress breakdown
 * @route   GET /api/planner/stats
 * @access  Private
 */
export const getPlannerStats = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Normal vs Topic counts
    const normalCount = tasks.filter((t) => t.type === 'normal').length;
    const topicCount = tasks.filter((t) => t.type === 'topic').length;

    // Subject breakdown (LeetCode style)
    const subjectMap = {};

    tasks.forEach((t) => {
      const subj = t.subject || 'General';
      if (!subjectMap[subj]) {
        subjectMap[subj] = {
          subject: subj,
          totalTasks: 0,
          completedTasks: 0,
          totalSubtopics: 0,
          completedSubtopics: 0,
          chapters: new Set(),
        };
      }

      subjectMap[subj].totalTasks += 1;
      if (t.isCompleted) subjectMap[subj].completedTasks += 1;
      if (t.chapter) subjectMap[subj].chapters.add(t.chapter);

      if (t.type === 'topic' && t.subtopics) {
        subjectMap[subj].totalSubtopics += t.subtopics.length;
        subjectMap[subj].completedSubtopics += t.subtopics.filter((st) => st.isCompleted).length;
      }
    });

    const subjectStats = Object.values(subjectMap).map((item) => {
      const chaptersCount = item.chapters.size;
      const subPct = item.totalSubtopics > 0
        ? Math.round((item.completedSubtopics / item.totalSubtopics) * 100)
        : item.totalTasks > 0
        ? Math.round((item.completedTasks / item.totalTasks) * 100)
        : 0;

      return {
        subject: item.subject,
        chaptersCount,
        totalTasks: item.totalTasks,
        completedTasks: item.completedTasks,
        totalSubtopics: item.totalSubtopics,
        completedSubtopics: item.completedSubtopics,
        percentage: subPct,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overallPercentage,
        normalCount,
        topicCount,
        subjectStats,
      },
    });
  } catch (error) {
    console.error('Error fetching planner stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve planner statistics',
      error: error.message,
    });
  }
};
