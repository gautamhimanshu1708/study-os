import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
    },
    studyDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Study date is required'],
      index: true,
    },
    studyStartTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    studyEndTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    pomodoroMode: {
      type: String,
      enum: ['Classic', 'Deep Work', 'Custom'],
      required: [true, 'Pomodoro mode is required'],
    },
    subject: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;
