import StudySession from '../models/StudySession.js';
import Course from '../models/Course.js';
import Goal from '../models/Goal.js';
import Task from '../models/Task.js';
import Deadline from '../models/Deadline.js';

/**
 * @desc    Get aggregated analytics data for chart visualisations
 * @route   GET /api/analytics
 * @access  Private
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const studySessions = await StudySession.find({
      user: userId,
      studyDate: { $gte: thirtyDaysAgoStr },
    });

    // Format Daily Study Hours (Past 14 Days)
    const dailyStudyHoursMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyStudyHoursMap[dateStr] = {
        date: dateStr,
        day: dayName,
        hours: 0,
        sessions: 0,
        tasks: 0,
      };
    }

    const completedTasks = await Task.find({ user: userId, status: 'Completed' });

    completedTasks.forEach((t) => {
      const d = t.updatedAt ? t.updatedAt.toISOString().split('T')[0] : (t.createdAt ? t.createdAt.toISOString().split('T')[0] : null);
      if (d && dailyStudyHoursMap[d]) {
        dailyStudyHoursMap[d].tasks += 1;
      }
    });

    studySessions.forEach((session) => {
      if (dailyStudyHoursMap[session.studyDate]) {
        dailyStudyHoursMap[session.studyDate].hours += (session.duration / 60);
        dailyStudyHoursMap[session.studyDate].sessions += 1;
      }
    });

    const dailyStudyHours = Object.values(dailyStudyHoursMap);

    // Weekly Progress (Aggregated by Day of Week: Mon - Sun)
    const weekDaysMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    studySessions.forEach((session) => {
      const d = new Date(session.studyDate);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (weekDaysMap[dayName] !== undefined) {
        weekDaysMap[dayName] += (session.duration / 60);
      }
    });

    const weeklyProgress = Object.keys(weekDaysMap).map((day) => ({
      day,
      hours: Math.round(weekDaysMap[day] * 10) / 10,
    }));

    // 2. Fetch Courses Statistics
    const courses = await Course.find({ user: userId });
    const courseStats = {
      total: courses.length,
      completed: courses.filter((c) => c.status === 'Completed').length,
      inProgress: courses.filter((c) => c.status === 'In Progress').length,
      enrolled: courses.filter((c) => c.status === 'Enrolled').length,
      avgProgress: courses.length
        ? Math.round(courses.reduce((acc, c) => acc + (c.progressPercentage || 0), 0) / courses.length)
        : 0,
    };

    const courseCompletionData = [
      { name: 'Completed', value: courseStats.completed, fill: '#22c55e' },
      { name: 'In Progress', value: courseStats.inProgress, fill: '#3b82f6' },
      { name: 'Enrolled', value: courseStats.enrolled, fill: '#a855f7' },
    ];

    // 3. Fetch Goals Statistics
    const goals = await Goal.find({ user: userId });
    const goalStats = {
      total: goals.length,
      shortTermTotal: goals.filter((g) => g.goalType === 'Short Term').length,
      longTermTotal: goals.filter((g) => g.goalType === 'Long Term').length,
      achieved: goals.filter((g) => g.status === 'Achieved').length,
      inProgress: goals.filter((g) => g.status === 'In Progress').length,
      notStarted: goals.filter((g) => g.status === 'Not Started').length,
      missed: goals.filter((g) => g.status === 'Missed').length,
    };

    const goalCompletionData = [
      { name: 'Short-Term Achieved', achieved: goals.filter((g) => g.goalType === 'Short Term' && g.status === 'Achieved').length, total: goalStats.shortTermTotal },
      { name: 'Long-Term Achieved', achieved: goals.filter((g) => g.goalType === 'Long Term' && g.status === 'Achieved').length, total: goalStats.longTermTotal },
    ];

    // 4. Fetch Tasks Statistics
    const tasks = await Task.find({ user: userId });
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      criticalCompleted: tasks.filter((t) => t.priority === 'Critical' && t.status === 'Completed').length,
      criticalTotal: tasks.filter((t) => t.priority === 'Critical').length,
      highCompleted: tasks.filter((t) => t.priority === 'High' && t.status === 'Completed').length,
      highTotal: tasks.filter((t) => t.priority === 'High').length,
      mediumCompleted: tasks.filter((t) => t.priority === 'Medium' && t.status === 'Completed').length,
      mediumTotal: tasks.filter((t) => t.priority === 'Medium').length,
      lowCompleted: tasks.filter((t) => t.priority === 'Low' && t.status === 'Completed').length,
      lowTotal: tasks.filter((t) => t.priority === 'Low').length,
    };

    const taskPriorityData = [
      { priority: 'Critical', completed: taskStats.criticalCompleted, pending: taskStats.criticalTotal - taskStats.criticalCompleted },
      { priority: 'High', completed: taskStats.highCompleted, pending: taskStats.highTotal - taskStats.highCompleted },
      { priority: 'Medium', completed: taskStats.mediumCompleted, pending: taskStats.mediumTotal - taskStats.mediumCompleted },
      { priority: 'Low', completed: taskStats.lowCompleted, pending: taskStats.lowTotal - taskStats.lowCompleted },
    ];

    // 5. Fetch Deadlines Statistics
    const deadlines = await Deadline.find({ user: userId });
    const deadlineStats = {
      total: deadlines.length,
      completed: deadlines.filter(d => d.isCompleted).length,
      pending: deadlines.filter(d => !d.isCompleted).length,
      completionRate: deadlines.length ? Math.round((deadlines.filter(d => d.isCompleted).length / deadlines.length) * 100) : 0,
    };

    const deadlineCompletionData = [
      { name: 'Completed Deadlines', count: deadlineStats.completed, fill: '#10b981' },
      { name: 'Pending Deadlines', count: deadlineStats.pending, fill: '#f43f5e' },
    ];

    // Overall Summary Metrics
    const allStudySessions = await StudySession.find({ user: userId });
    const totalHoursLogged = allStudySessions.reduce((acc, s) => acc + (s.duration / 60), 0);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
          courseCompletionRate: courseStats.total ? Math.round((courseStats.completed / courseStats.total) * 100) : 0,
          goalAchievementRate: goalStats.total ? Math.round((goalStats.achieved / goalStats.total) * 100) : 0,
          taskCompletionRate: taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0,
          deadlineCompletionRate: deadlineStats.completionRate,
        },
        dailyStudyHours,
        weeklyProgress,
        courseCompletionData,
        goalCompletionData,
        taskPriorityData,
        deadlineCompletionData,
        courseStats,
        goalStats,
        taskStats,
        deadlineStats,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary',
      error: error.message,
    });
  }
};
