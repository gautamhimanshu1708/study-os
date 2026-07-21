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

  // Complete Focus / Break Session
  const handlePhaseComplete = useCallback(async (completedMode, completedIsStudyPhase, completedSessionStartTime, completedTotalDuration, completedCustomBreak, completedCustomStudy) => {
    setIsActive(false);
    setTargetEndTimestamp(null);
    setLiveStudySeconds(0);
    playNotificationSound();

    if (completedIsStudyPhase) {
      const endTime = new Date();
      const startTime = completedSessionStartTime ? new Date(completedSessionStartTime) : new Date(endTime.getTime() - completedTotalDuration * 1000);
      const durationMins = Math.max(1, Math.round(completedTotalDuration / 60));

      try {
        await logStudySession({
          duration: durationMins,
          studyStartTime: startTime.toISOString(),
          studyEndTime: endTime.toISOString(),
          pomodoroMode: completedMode === '25/5' ? 'Classic' : completedMode === '50/10' ? 'Deep Work' : 'Custom',
          subject: 'General Study',
        });
        toast.success(`🎉 Focus session complete! ${durationMins} min logged & XP added.`);
        sendBrowserNotification('🎉 Focus Session Complete!', `Awesome work! You logged ${durationMins} minutes of focus.`);
        // Refresh stats globally — all subscribed components will update
        await fetchStats();
      } catch (err) {
        console.error('Failed to log session:', err);
        toast.error('Session ended, but failed to sync online.');
      }

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
  }, [fetchStats, playNotificationSound, sendBrowserNotification]);

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

        // Update live study seconds for real-time display
        if (isStudyPhase && sessionStartTime) {
          const elapsed = Math.round((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
          setLiveStudySeconds(elapsed);
        }

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          // Pass current state values directly to avoid stale closures
          handlePhaseComplete(mode, isStudyPhase, sessionStartTime, totalDuration, customBreak, customStudy);
        }
      };

      // Tick immediately on start, then every second
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
  }, [isActive, targetEndTimestamp, mode, isStudyPhase, sessionStartTime, totalDuration, customBreak, customStudy, handlePhaseComplete]);

  // Visibility change handler — resync timer when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && targetEndTimestamp) {
        const remaining = Math.max(0, Math.round((targetEndTimestamp - Date.now()) / 1000));
        if (remaining <= 0) {
          // Timer completed while tab was hidden
          setTimeLeft(0);
          clearInterval(timerRef.current);
          handlePhaseComplete(mode, isStudyPhase, sessionStartTime, totalDuration, customBreak, customStudy);
        } else {
          setTimeLeft(remaining);
        }

        // Update live study seconds
        if (isStudyPhase && sessionStartTime) {
          const elapsed = Math.round((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
          setLiveStudySeconds(elapsed);
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
      // Pausing — clear the target and update live seconds
      setIsActive(false);
      setTargetEndTimestamp(null);
      if (isStudyPhase && sessionStartTime) {
        const elapsed = Math.round((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
        setLiveStudySeconds(elapsed);
      }
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTargetEndTimestamp(null);
    setSessionStartTime(null);
    setIsStudyPhase(true);
    setLiveStudySeconds(0);
    const initialStudyDuration = (mode === 'Custom' ? customStudy : MODES[mode].study) * 60;
    setTimeLeft(initialStudyDuration);
  };

  const skipPhase = () => {
    setIsActive(false);
    setTargetEndTimestamp(null);
    setSessionStartTime(null);
    setLiveStudySeconds(0);
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
    setMode(newMode);
    setIsActive(false);
    setTargetEndTimestamp(null);
    setSessionStartTime(null);
    setIsStudyPhase(true);
    setLiveStudySeconds(0);
    const newDuration = (newMode === 'Custom' ? customStudy : MODES[newMode].study) * 60;
    setTimeLeft(newDuration);
  };

  const updateCustomSettings = (newStudyMins, newBreakMins) => {
    setCustomStudy(newStudyMins);
    setCustomBreak(newBreakMins);
    if (mode === 'Custom') {
      setIsActive(false);
      setTargetEndTimestamp(null);
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
