import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password in queries
    },
    securityQuestion: {
      type: String,
      required: [true, 'Security question is required'],
      trim: true,
    },
    securityAnswer: {
      type: String,
      required: [true, 'Security answer is required'],
      select: false, // stored securely hashed
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: hash password and securityAnswer before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('securityAnswer')) {
    const salt = await bcrypt.genSalt(12);
    // Normalize security answer to lowercase trimmed string before hashing
    const normalizedAnswer = this.securityAnswer.trim().toLowerCase();
    this.securityAnswer = await bcrypt.hash(normalizedAnswer, salt);
  }
  next();
});

// Instance method: compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method: compare entered security answer with hashed answer
userSchema.methods.matchSecurityAnswer = async function (enteredAnswer) {
  if (!enteredAnswer || !this.securityAnswer) return false;
  const normalizedAnswer = enteredAnswer.trim().toLowerCase();
  return await bcrypt.compare(normalizedAnswer, this.securityAnswer);
};

// Instance method: get user's initials for avatar fallback
userSchema.methods.getInitials = function () {
  return this.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const User = mongoose.model('User', userSchema);
export default User;
