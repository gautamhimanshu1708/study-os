import StudySession from '../models/StudySession.js';
/**
 * @desc    Log a new study session
 * @route   POST /api/study-sessions
 * @access  Private
 */
export const logStudySession = async (req, res) => {
  try {
    const { duration, studyStartTime, studyEndTime, pomodoroMode, subject } = req.body;
    
    const studyDate = new Date().toISOString().split('T')[0];

    const session = new StudySession({
      user: req.user._id,
      duration,
      studyDate,
      studyStartTime,
      studyEndTime,
      pomodoroMode,
      subject
    });

    await session.save();

    // ConsistencyLog is no longer used. Analytics are computed dynamically.

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error logging study session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log study session',
      error: error.message
    });
  }
};

/**
 * @desc    Get all study sessions for user
 * @route   GET /api/study-sessions
 * @access  Private
 */
export const getStudySessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study sessions',
      error: error.message
    });
  }
};

/**
 * @desc    Get study session statistics
 * @route   GET /api/study-sessions/stats
 * @access  Private
 */
export const getStudySessionStats = async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.user._id });
    
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    
    // Today
    const todaySessions = sessions.filter(s => s.studyDate === today);
    const todayStudyMinutes = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
    const todayStudyHours = todayStudyMinutes / 60;
    
    // Weekly
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const weeklySessions = sessions.filter(s => s.studyDate >= weekAgoStr && s.studyDate <= today);
    const weeklyStudyMinutes = weeklySessions.reduce((acc, curr) => acc + curr.duration, 0);
    const weeklyStudyHours = weeklyStudyMinutes / 60;

    // Monthly
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    const monthlySessions = sessions.filter(s => s.studyDate >= monthAgoStr && s.studyDate <= today);
    const monthlyStudyMinutes = monthlySessions.reduce((acc, curr) => acc + curr.duration, 0);
    const monthlyStudyHours = monthlyStudyMinutes / 60;

    // Total Sessions Completed
    const totalSessionsCompleted = sessions.length;

    // Total Deep Work Hours
    const deepWorkSessions = sessions.filter(s => s.pomodoroMode === 'Deep Work');
    const totalDeepWorkMinutes = deepWorkSessions.reduce((acc, curr) => acc + curr.duration, 0);
    const totalDeepWorkHours = totalDeepWorkMinutes / 60;
    
    // Most Productive Day
    const minutesPerDay = {};
    sessions.forEach(s => {
      minutesPerDay[s.studyDate] = (minutesPerDay[s.studyDate] || 0) + s.duration;
    });
    
    let mostProductiveDay = null;
    let maxMinutes = 0;
    for (const [date, mins] of Object.entries(minutesPerDay)) {
      if (mins > maxMinutes) {
        maxMinutes = mins;
        mostProductiveDay = date;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        todayStudyHours: Math.round(todayStudyHours * 10) / 10,
        weeklyStudyHours: Math.round(weeklyStudyHours * 10) / 10,
        monthlyStudyHours: Math.round(monthlyStudyHours * 10) / 10,
        totalSessionsCompleted,
        totalDeepWorkHours: Math.round(totalDeepWorkHours * 10) / 10,
        mostProductiveDay
      }
    });
  } catch (error) {
    console.error('Error fetching study session stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study session stats',
      error: error.message
    });
  }
};
