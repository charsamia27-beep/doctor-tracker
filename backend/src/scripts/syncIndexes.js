// Production deploy step: create/drop indexes so they exactly match the schemas.
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { AuditLog } from '../models/AuditLog.js';

await connectDB();
for (const model of [User, Doctor, Patient, AuditLog]) {
  const dropped = await model.syncIndexes();
  console.log(`✔ ${model.modelName}: indexes in sync${dropped.length ? ` (dropped ${dropped.join(', ')})` : ''}`);
}
await disconnectDB();
