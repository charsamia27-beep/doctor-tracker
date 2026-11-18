import mongoose from 'mongoose';
import { SPECIALIZATIONS } from './constants.js';

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    // Lowercase copy used for index-backed prefix search.
    nameLower: { type: String, select: false },
    specialization: { type: String, required: true, enum: SPECIALIZATIONS },
    hospital: { type: String, required: true, trim: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Denormalised counter: avoids a $lookup/count on every list request.
    patientCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

doctorSchema.pre('validate', function normalise(next) {
  if (this.isModified('name')) this.nameLower = this.name.toLowerCase();
  next();
});

// ---- Indexes (match the query shapes used by GET /doctors) ----
doctorSchema.index({ createdAt: -1 });                       // default list sort + date filter
doctorSchema.index({ specialization: 1, createdAt: -1 });    // filter by specialization, sorted
doctorSchema.index({ hospital: 1, createdAt: -1 });          // filter by hospital, sorted
doctorSchema.index({ nameLower: 1 });                         // prefix search by name
doctorSchema.index({ phone: 1 });                             // prefix search by phone
doctorSchema.index({ patientCount: -1 });                     // "most patients" sort / dashboard

export const Doctor = mongoose.model('Doctor', doctorSchema);
