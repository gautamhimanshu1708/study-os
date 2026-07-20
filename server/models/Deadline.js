import mongoose from 'mongoose';

const deadlineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    deadlineDate: {
      type: Date,
      required: [true, 'Deadline date is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Exam', 'Assignment', 'Project', 'Placement', 'Internship', 'Personal'],
      default: 'Assignment',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

deadlineSchema.index({ user: 1, deadlineDate: 1 });

const Deadline = mongoose.model('Deadline', deadlineSchema);

export default Deadline;
