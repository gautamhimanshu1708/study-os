import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    platform: {
      type: String,
      enum: ['Udemy', 'Coursera', 'YouTube', 'edX', 'NPTEL', 'Pluralsight', 'LinkedIn Learning', 'Custom'],
      default: 'Udemy',
      index: true,
    },
    courseLink: {
      type: String,
      trim: true,
      default: '',
    },
    instructorName: {
      type: String,
      trim: true,
      default: '',
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'In Progress',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to keep status and progressPercentage in sync
courseSchema.pre('save', function (next) {
  if (this.progressPercentage >= 100) {
    this.progressPercentage = 100;
    this.status = 'Completed';
    if (!this.completedAt) this.completedAt = new Date();
  } else if (this.progressPercentage === 0 && this.status === 'Completed') {
    this.status = 'Not Started';
    this.completedAt = null;
  } else if (this.progressPercentage > 0 && this.progressPercentage < 100) {
    this.status = 'In Progress';
    this.completedAt = null;
  }
  next();
});

// Compound index for fast queries by user and status
courseSchema.index({ user: 1, status: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;
