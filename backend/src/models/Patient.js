import mongoose from 'mongoose';
import { GENDERS, PATIENT_CONDITIONS } from './constants.js';

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    nameLower: { type: String, select: false },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, required: true, enum: GENDERS },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    condition: { type: String, required: true, enum: PATIENT_CONDITIONS, default: 'Stable' },
    diagnosis: { type: String, trim: true, maxlength: 300 },
    admittedAt: { type: Date, required: true, default: Date.now },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  },
  { timestamps: true, versionKey: false }
);

patientSchema.pre('validate', function normalise(next) {
  if (this.isModified('name')) this.nameLower = this.name.toLowerCase();
  next();
});

// ---- Indexes ----
// ESR rule (Equality, Sort, Range): equality fields first, then the sort/range field.
patientSchema.index({ doctor: 1, admittedAt: -1 });     // a doctor's patients, newest first
patientSchema.index({ condition: 1, admittedAt: -1 });  // filter by condition + date range
patientSchema.index({ admittedAt: -1 });                // default sort, date range, time-series stats
patientSchema.index({ nameLower: 1 });                  // prefix search
patientSchema.index({ phone: 1 });

export const Patient = mongoose.model('Patient', patientSchema);
