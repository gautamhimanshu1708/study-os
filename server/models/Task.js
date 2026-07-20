import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['normal', 'topic'],
      default: 'normal',
      index: true,
    },
    // Subject -> Chapter -> Subtopic hierarchy (for topic-based tasks)
    subject: {
      type: String,
      trim: true,
      default: 'General',
      index: true,
    },
    chapter: {
      type: String,
      trim: true,
      default: '',
    },
    subtopics: [subtopicSchema],
    category: {
      type: String,
      enum: ['Assignment', 'Lecture', 'Project', 'Revision', 'Exam', 'General'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    deadline: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to automatically compute progressPercentage for topic-based tasks
taskSchema.pre('save', function (next) {
  if (this.type === 'topic' && this.subtopics && this.subtopics.length > 0) {
    const completedCount = this.subtopics.filter((st) => st.isCompleted).length;
    this.progressPercentage = Math.round((completedCount / this.subtopics.length) * 100);
    this.isCompleted = completedCount === this.subtopics.length;
    if (this.isCompleted && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.isCompleted) {
      this.completedAt = null;
    }
  } else if (this.type === 'normal') {
    this.progressPercentage = this.isCompleted ? 100 : 0;
  }
  next();
});

// Indexes for fast searching and filtering
taskSchema.index({ user: 1, type: 1, isCompleted: 1 });
taskSchema.index({ user: 1, subject: 1 });
taskSchema.index({ user: 1, priority: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
