import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    goalType: {
      type: String,
      enum: ['Short Term', 'Long Term'],
      default: 'Short Term',
      index: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Coding', 'Skill', 'Career', 'Personal'],
      default: 'Academic',
      index: true,
    },
    targetDate: {
      type: Date,
      required: [true, 'Target deadline date is required'],
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Achieved', 'Missed'],
      default: 'In Progress',
      index: true,
    },
    milestones: [milestoneSchema],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    achievedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate progress percentage from milestones if present, and sync status
goalSchema.pre('save', function (next) {
  if (this.milestones && this.milestones.length > 0) {
    const completed = this.milestones.filter((m) => m.isCompleted).length;
    this.progressPercentage = Math.round((completed / this.milestones.length) * 100);
  }

  if (this.progressPercentage >= 100) {
    this.progressPercentage = 100;
    this.status = 'Achieved';
    if (!this.achievedAt) this.achievedAt = new Date();
  } else if (this.progressPercentage === 0 && this.status === 'Achieved') {
    this.status = 'Not Started';
    this.achievedAt = null;
  } else if (this.progressPercentage > 0 && this.progressPercentage < 100 && this.status !== 'Missed') {
    this.status = 'In Progress';
    this.achievedAt = null;
  }

  next();
});

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
