import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },

    // ---- security state ----
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    // Embedded in every JWT. Incrementing it revokes all existing sessions (logout, password change).
    tokenVersion: { type: Number, default: 0 },
    passwordChangedAt: { type: Date },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function isLocked() {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.failedLoginAttempts;
    delete ret.lockUntil;
    delete ret.lastLoginIp;
    delete ret.tokenVersion;
    delete ret.__v;
    return ret;
  },
});

// Pre-computed hash compared against when the email doesn't exist, so a login for an
// unknown account takes the same time as a wrong password (prevents user enumeration by timing).
export const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing-safety', BCRYPT_ROUNDS);

export const User = mongoose.model('User', userSchema);
