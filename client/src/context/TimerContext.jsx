import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { logStudySession, getStudySessionStats } from '../api/studySessionApi';
import { getConsistencyStats } from '../api/consistencyApi';
import toast from 'react-hot-toast';

const TimerContext = createContext();

const STORAGE_KEY = 'studyos_global_timer_state';

const MODES = {
  '25/5':   { study: 25, break: 5, label: '25/5 Classic' },
  '50/10':  { study: 50, break: 10, label: '50/10 Deep' },
  'Custom': { study: 25, break: 5, label: 'Custom' },
};

export const TimerProvider = ({ children }) => {
  // Load initial state from localStorage safely
  const getInitialState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();

        if (parsed.isActive && parsed.targetEndTimestamp) {
          const diff = Math.round((parsed.targetEndTimestamp - now) / 1000);
          if (diff > 0) {
            return { ...parsed, timeLeft: diff, isActive: true, autoCompletedOnLoad: false };
          } else {
            // Timer expired while away — mark for auto-completion
            return { ...parsed, timeLeft: 0, isActive: false, autoCompletedOnLoad: true };
          }
        }
        return { ...parsed, isActive: false, autoCompletedOnLoad: false };
      } catch (err) {
        console.error('Failed to parse timer state', err);
      }
    }
    return {
      mode: '25/5',
      isStudyPhase: true,
      isActive: false,
      timeLeft: 25 * 60,
      totalDuration: 25 * 60,
      customStudy: 25,
      customBreak: 5,
      sessionStartTime: null,
      targetEndTimestamp: null,
      autoCompletedOnLoad: false,
    };
  };

  const initialStateRef = useRef(getInitialState());

  const [mode, setMode] = useState(initialStateRef.current.mode || '25/5');
  const [isStudyPhase, setIsStudyPhase] = useState(initialStateRef.current.isStudyPhase ?? true);
  const [isActive, setIsActive] = useState(initialStateRef.current.isActive ?? false);
  const [timeLeft, setTimeLeft] = useState(initialStateRef.current.timeLeft ?? 25 * 60);
  const [customStudy, setCustomStudy] = useState(initialStateRef.current.customStudy || 25);
  const [customBreak, setCustomBreak] = useState(initialStateRef.current.customBreak || 5);
  const [sessionStartTime, setSessionStartTime] = useState(initialStateRef.current.sessionStartTime || null);
  const [targetEndTimestamp, setTargetEndTimestamp] = useState(initialStateRef.current.targetEndTimestamp || null);

  // Shared global statistics — single source of truth for the entire app
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState({ current: 0, best: 0 });

  // Track the elapsed study time in real-time (in seconds) for live display
  const [liveStudySeconds, setLiveStudySeconds] = useState(0);

  // High-precision tracking refs for live per-minute study logging
  const activeStudySecondsRef = useRef(0);
  const loggedSecondsRef = useRef(0);

  const timerRef = useRef(null);
  const autoCompleteHandledRef = useRef(false);

  // Helper to compute duration in seconds
  const getTotalDuration = useCallback((m, isStudy, cStudy, cBreak) => {
    if (isStudy) {
      return (m === 'Custom' ? cStudy : MODES[m]?.study || 25) * 60;
    }
    return (m === 'Custom' ? cBreak : MODES[m]?.break || 5) * 60;
  }, []);

  const totalDuration = getTotalDuration(mode, isStudyPhase, customStudy, customBreak);

  // Browser system notification permission request
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch Stats from backend API — single source of truth
  const fetchStats = useCallback(async () => {
    try {
      const [sessionRes, streakRes] = await Promise.allSettled([
        getStudySessionStats(),
        getConsistencyStats(),
      ]);
      if (sessionRes.status === 'fulfilled') setStats(sessionRes.value.data || null);
      if (streakRes.status === 'fulfilled') {
        setStreak({
          current: streakRes.value.data?.currentStreak || 0,
          best: streakRes.value.data?.bestStreak || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load focus stats', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Audio tone notification chime
  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio context suppressed
    }
  }, []);

  // Send system notification
  const sendBrowserNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Live per-minute incremental session logger
  const checkAndLogIncrementalSession = useCallback(async (isFinalOrPause = false, currentMode, currentIsStudyPhase) => {
    if (!currentIsStudyPhase) return;

    const unloggedSec = activeStudySecondsRef.current - loggedSecondsRef.current;
    let minsToLog = 0;

    if (isFinalOrPause) {
      if (unloggedSec >= 30) {
        minsToLog = Math.round(unloggedSec / 60);
      }
    } else {
      if (unloggedSec >= 60) {
        minsToLog = Math.floor(unloggedSec / 60);
      }
    }

    if (minsToLog > 0) {
      loggedSecondsRef.current += minsToLog * 60;
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - minsToLog * 60 * 1000);
      const pomodoroModeStr = currentMode === '25/5' ? 'Classic' : currentMode === '50/10' ? 'Deep Work' : 'Custom';

      try {
        await logStudySession({
          duration: minsToLog,
          studyStartTime: startTime.toISOString(),
          studyEndTime: endTime.toISOString(),
          pomodoroMode: pomodoroModeStr,
          subject: 'General Study',
        });
        await fetchStats();
      } catch (err) {
        console.error('Failed to log incremental session:', err);
      }
    }
  }, [fetchStats]);

  // Complete Focus / Break Session
  const handlePhaseComplete = useCallback(async (completedMode, completedIsStudyPhase, completedSessionStartTime, completedTotalDuration, completedCustomBreak, completedCustomStudy) => {
    setIsActive(false);
    setTargetEndTimestamp(null);
    setLiveStudySeconds(0);
    playNotificationSound();

    if (completedIsStudyPhase) {
      // Log any remaining study seconds
      await checkAndLogIncrementalSession(true, completedMode, completedIsStudyPhase);
      activeStudySecondsRef.current = 0;
      loggedSecondsRef.current = 0;

      toast.success(`🎉 Focus session complete! Logged & XP added.`);
      sendBrowserNotification('🎉 Focus Session Complete!', `Awesome work! Focus round completed.`);
      await fetchStats();

      setIsStudyPhase(false);
      const nextBreakDuration = (completedMode === 'Custom' ? completedCustomBreak : MODES[completedMode].break) * 60;
      setTimeLeft(nextBreakDuration);
    } else {
      toast.success('☕ Break over — ready to focus again?');
      sendBrowserNotification('☕ Break Time Finished', 'Ready for your next focus round?');
      setIsStudyPhase(true);
      const nextStudyDuration = (completedMode === 'Custom' ? completedCustomStudy : MODES[completedMode].study) * 60;
      setTimeLeft(nextStudyDuration);
    }
    setSessionStartTime(null);
  }, [checkAndLogIncrementalSession, fetchStats, playNotificationSound, sendBrowserNotification]);

  // Handle reload completion if timer expired while tab closed
  useEffect(() => {
    if (initialStateRef.current.autoCompletedOnLoad && !autoCompleteHandledRef.current) {
      autoCompleteHandledRef.current = true;
      const st = initialStateRef.current;
      handlePhaseComplete(
        st.mode || '25/5',
        st.isStudyPhase ?? true,
        st.sessionStartTime,
        st.totalDuration || 25 * 60,
        st.customBreak || 5,
        st.customStudy || 25
      );
    }
  }, [handlePhaseComplete]);

  // Main high-precision timestamp-based ticker loop
  useEffect(() => {
    if (isActive) {
      // Ensure we have a target end timestamp
      let currentTarget = targetEndTimestamp;
      if (!currentTarget) {
        currentTarget = Date.now() + timeLeft * 1000;
        setTargetEndTimestamp(currentTarget);
      }

      const tick = () => {
        const remaining = Math.max(0, Math.round((currentTarget - Date.now()) / 1000));
        setTimeLeft(remaining);

        // Update live study seconds & check per-minute recording
        if (isStudyPhase) {
          activeStudySecondsRef.current += 1;
          const elapsed = activeStudySecondsRef.current;
          setLiveStudySeconds(elapsed);

          // Check if 60 seconds (1 minute) has elapsed since last log
          if ((elapsed - loggedSecondsRef.current) >= 60) {
            checkAndLogIncrementalSession(false, mode, isStudyPhase);
          }
        }

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handlePhaseComplete(mode, isStudyPhase, sessionStartTime, totalDuration, customBreak, customStudy);
        }
      };

      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, targetEndTimestamp, mode, isStudyPhase, sessionStartTime, totalDuration, customBreak, customStudy, checkAndLogIncrementalSession, handlePhaseComplete]);

  // Visibility change handler — resync timer when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && targetEndTimestamp) {
        const remaining = Math.max(0, Math.round((targetEndTimestamp - Date.now()) / 1000));
        if (remaining <= 0) {
          setTimeLeft(0);
          clearInterval(timerRef.current);
          handlePhaseComplete(mode, isStudyPhase, sessionStartTime, totalDuration, customBreak, customStudy);
        } else {
          setTimeLeft(remaining);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, targetEndTimestamp, mode, isStudyPhase, sessionStartTime, totalDuration, customBreak, customStudy, handlePhaseComplete]);

  // Persist current state to localStorage
  useEffect(() => {
    const stateToSave = {
      mode,
      isStudyPhase,
      isActive,
      timeLeft,
      totalDuration,
      customStudy,
      customBreak,
      sessionStartTime,
      targetEndTimestamp: isActive ? targetEndTimestamp : null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [mode, isStudyPhase, isActive, timeLeft, totalDuration, customStudy, customBreak, sessionStartTime, targetEndTimestamp]);

  // Controls
  const toggleTimer = () => {
    if (!isActive) {
      const now = new Date();
      if (isStudyPhase && !sessionStartTime) {
        setSessionStartTime(now.toISOString());
      }
      const target = Date.now() + timeLeft * 1000;
      setTargetEndTimestamp(target);
      setIsActive(true);
    } else {
      // Pausing — clear target and record any unlogged 30+ seconds
      setIsActive(false);
      setTargetEndTimestamp(null);
      checkAndLogIncrementalSession(true, mode, isStudyPhase);
    }
  };

  const resetTimer = () => {
    if (isStudyPhase) {
      checkAndLogIncrementalSession(true, mode, isStudyPhase);
    }
    setIsActive(false);
    setTargetEndTimestamp(null);
    setSessionStartTime(null);
    setIsStudyPhase(true);
    setLiveStudySeconds(0);
    activeStudySecondsRef.current = 0;
    loggedSecondsRef.current = 0;
    const initialStudyDuration = (mode === 'Custom' ? customStudy : MODES[mode].study) * 60;
    setTimeLeft(initialStudyDuration);
  };

  const skipPhase = () => {
    if (isStudyPhase) {
      checkAndLogIncrementalSession(true, mode, isStudyPhase);
    }
    setIsActive(false);
    setTargetEndTimestamp(null);
    setSessionStartTime(null);
    setLiveStudySeconds(0);
    activeStudySecondsRef.current = 0;
    loggedSecondsRef.current = 0;
    if (isStudyPhase) {
      toast('Study phase skipped');
      setIsStudyPhase(false);
      setTimeLeft((mode === 'Custom' ? customBreak : MODES[mode].break) * 60);
    } else {
      toast('Break skipped');
      setIsStudyPhase(true);
      setTimeLeft((mode === 'Custom' ? customStudy : MODES[mode].study) * 60);
    }
  };

  const changeMode = (newMode) => {
    if (isStudyPhase) {
      checkAndLogIncrementalSession(true, mode, isStudyPhase);
    }
    setMode(newMode);
    setIsActive(false);
    setTargetEndTimestamp(null);
    setSessionStartTime(null);
    setIsStudyPhase(true);
    setLiveStudySeconds(0);
    activeStudySecondsRef.current = 0;
    loggedSecondsRef.current = 0;
    const newDuration = (newMode === 'Custom' ? customStudy : MODES[newMode].study) * 60;
    setTimeLeft(newDuration);
  };

  const updateCustomSettings = (newStudyMins, newBreakMins) => {
    setCustomStudy(newStudyMins);
    setCustomBreak(newBreakMins);
    if (mode === 'Custom') {
      if (isStudyPhase) {
        checkAndLogIncrementalSession(true, mode, isStudyPhase);
      }
      setIsActive(false);
      setTargetEndTimestamp(null);
      activeStudySecondsRef.current = 0;
      loggedSecondsRef.current = 0;
      const newDuration = (isStudyPhase ? newStudyMins : newBreakMins) * 60;
      setTimeLeft(newDuration);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        MODES,
        isStudyPhase,
        isActive,
        timeLeft,
        totalDuration,
        customStudy,
        customBreak,
        stats,
        streak,
        liveStudySeconds,
        toggleTimer,
        resetTimer,
        skipPhase,
        changeMode,
        updateCustomSettings,
        formatTime,
        fetchStats,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export default TimerContext;
