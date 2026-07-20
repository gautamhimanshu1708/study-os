import StudySession from '../models/StudySession.js';

/**
 * @desc    Get consistency logs for past 365 days or date range
 * @route   GET /api/consistency
 * @access  Private
 */
export const getConsistencyLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (startDate && endDate) {
      query.studyDate = { $gte: startDate, $lte: endDate };
    } else {
      // Default: Past 365 days
      const d = new Date();
      d.setDate(d.getDate() - 365);
      const pastYearDateStr = d.toISOString().split('T')[0];
      query.studyDate = { $gte: pastYearDateStr };
    }

    const sessions = await StudySession.find(query).sort({ studyDate: 1 });
    
    // Aggregate by date
    const dailyMap = {};
    sessions.forEach(s => {
      if (!dailyMap[s.studyDate]) {
        dailyMap[s.studyDate] = { date: s.studyDate, studyHours: 0, sessionsCount: 0 };
      }
      dailyMap[s.studyDate].studyHours += (s.duration / 60);
      dailyMap[s.studyDate].sessionsCount += 1;
    });
    
    const logs = Object.values(dailyMap);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching consistency logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consistency logs',
      error: error.message,
    });
  }
};

/**
 * @desc    Log or update activity for a specific date (YYYY-MM-DD)
 * @route   POST /api/consistency
 * @access  Private
 */
export const logDailyActivity = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logging activity via consistency endpoint is deprecated. Use StudySessions instead.',
  });
};

/**
 * @desc    Calculate Current Streak, Best Streak, Weekly %, Monthly %, & Productive Days
 * @route   GET /api/consistency/stats
 * @access  Private
 */
export const getConsistencyStats = async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.user._id });
    
    // Aggregate by date
    const dailyMap = {};
    let totalStudyHours = 0;
    
    sessions.forEach(s => {
      if (!dailyMap[s.studyDate]) {
        dailyMap[s.studyDate] = { studyHours: 0 };
      }
      const hrs = s.duration / 60;
      dailyMap[s.studyDate].studyHours += hrs;
      totalStudyHours += hrs;
    });

    const activeDatesSet = new Set(
      Object.keys(dailyMap).filter(date => dailyMap[date].studyHours >= 0.25)
    );

    const totalProductiveDays = activeDatesSet.size;

    // Current & Best Streak Calculation
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Current Streak calculation
    let currentStreak = 0;
    let checkDate = activeDatesSet.has(todayStr) ? new Date(today) : activeDatesSet.has(yesterdayStr) ? new Date(yesterday) : null;

    if (checkDate) {
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activeDatesSet.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Best Streak calculation
    let bestStreak = 0;
    let tempStreak = 0;

    const sortedActiveDates = Array.from(activeDatesSet).sort();

    for (let i = 0; i < sortedActiveDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedActiveDates[i - 1]);
        const curr = new Date(sortedActiveDates[i]);
        const diffTime = Math.abs(curr - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }

    // Weekly Consistency % (last 7 days)
    let weeklyActiveCount = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      if (activeDatesSet.has(dStr)) weeklyActiveCount++;
    }
    const weeklyConsistency = Math.round((weeklyActiveCount / 7) * 100);

    // Monthly Consistency % (last 30 days)
    let monthlyActiveCount = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      if (activeDatesSet.has(dStr)) monthlyActiveCount++;
    }
    const monthlyConsistency = Math.round((monthlyActiveCount / 30) * 100);

    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        bestStreak: Math.max(bestStreak, currentStreak),
        weeklyConsistency,
        monthlyConsistency,
        totalProductiveDays,
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error calculating consistency stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate consistency statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Auto sync daily activity from Task & StudySession models
 * @route   POST /api/consistency/sync
 * @access  Private
 */
export const autoSyncDailyActivity = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auto-sync is deprecated, stats are computed dynamically.',
  });
};
