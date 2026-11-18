import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { ApiError } from '../utils/ApiError.js';
import { audit } from '../utils/audit.js';
import { dateRange, escapeRegex, paginate, prefix } from '../utils/query.js';

const PROJECTION = 'name age gender phone email condition diagnosis admittedAt doctor createdAt';
const DOCTOR_POPULATE = { path: 'doctor', select: 'name specialization' };

const SORTS = {
  admittedAt: (d) => ({ admittedAt: d, _id: d }),
  name: (d) => ({ nameLower: d, _id: d }),
  age: (d) => ({ age: d, _id: d }),
};

const bumpCount = (doctorId, by) => Doctor.updateOne({ _id: doctorId }, { $inc: { patientCount: by } });

async function assertDoctorExists(id) {
  const exists = await Doctor.exists({ _id: id });
  if (!exists) throw ApiError.badRequest('Validation failed', { doctor: ['Doctor does not exist'] });
}

function buildFilter({ search, from, to, condition, gender, doctor }) {
  const filter = {};
  if (search) {
    filter.$or = [{ nameLower: prefix(search) }, { phone: new RegExp('^' + escapeRegex(search)) }];
  }
  if (condition) filter.condition = condition;
  if (gender) filter.gender = gender;
  if (doctor) filter.doctor = doctor;
  const admitted = dateRange(from, to);
  if (admitted) filter.admittedAt = admitted;
  return filter;
}

async function sendList(res, query, extra = {}) {
  const { page, limit, sort, order } = query;
  const dir = order === 'asc' ? 1 : -1;
  const result = await paginate(Patient, buildFilter({ ...query, ...extra }), {
    page, limit, sort: SORTS[sort](dir), projection: PROJECTION, populate: DOCTOR_POPULATE,
  });
  res.json({ success: true, data: result.items, pagination: result.pagination });
}

// ---------- /patients ----------

export const listPatients = (req, res) => sendList(res, req.valid.query);

export async function getPatient(req, res) {
  const patient = await Patient.findById(req.valid.params.id, PROJECTION).populate(DOCTOR_POPULATE).lean();
  if (!patient) throw ApiError.notFound('Patient not found');
  res.json({ success: true, data: patient });
}

export async function createPatient(req, res) {
  await assertDoctorExists(req.valid.body.doctor);
  const patient = await Patient.create(req.valid.body);
  await bumpCount(patient.doctor, 1);
  await audit(req, { action: 'create', entity: 'patient', entityId: patient._id, summary: `Added patient ${patient.name}` });
  res.status(201).json({ success: true, data: patient });
}

export async function updatePatient(req, res) {
  const patient = await Patient.findById(req.valid.params.id);
  if (!patient) throw ApiError.notFound('Patient not found');

  const previousDoctor = patient.doctor.toString();
  const nextDoctor = req.valid.body.doctor;
  if (nextDoctor && nextDoctor !== previousDoctor) await assertDoctorExists(nextDoctor);

  patient.set(req.valid.body);
  const changedFields = patient.modifiedPaths().filter((p) => p !== 'nameLower');
  await patient.save();

  if (nextDoctor && nextDoctor !== previousDoctor) {
    await Promise.all([bumpCount(previousDoctor, -1), bumpCount(nextDoctor, 1)]);
  }
  if (changedFields.length) {
    await audit(req, { action: 'update', entity: 'patient', entityId: patient._id, summary: `Updated patient ${patient.name}`, changedFields });
  }
  await patient.populate(DOCTOR_POPULATE);
  res.json({ success: true, data: patient });
}

export async function deletePatient(req, res) {
  const patient = await Patient.findByIdAndDelete(req.valid.params.id);
  if (!patient) throw ApiError.notFound('Patient not found');
  await bumpCount(patient.doctor, -1);
  await audit(req, { action: 'delete', entity: 'patient', entityId: patient._id, summary: `Deleted patient ${patient.name}` });
  res.json({ success: true, message: 'Patient deleted' });
}

// ---------- /doctors/:id/patients ----------

export async function listDoctorPatients(req, res) {
  await assertDoctorExists(req.valid.params.id);
  return sendList(res, req.valid.query, { doctor: req.valid.params.id });
}

export async function addPatientToDoctor(req, res) {
  const doctorId = req.valid.params.id;
  const doctor = await Doctor.exists({ _id: doctorId });
  if (!doctor) throw ApiError.notFound('Doctor not found');
  const patient = await Patient.create({ ...req.valid.body, doctor: doctorId });
  await bumpCount(doctorId, 1);
  await audit(req, { action: 'create', entity: 'patient', entityId: patient._id, summary: `Added patient ${patient.name} under a doctor` });
  res.status(201).json({ success: true, data: patient });
}

export async function removePatientFromDoctor(req, res) {
  const { id, patientId } = req.valid.params;
  // Scoped delete: only removes the patient if they belong to this doctor.
  const patient = await Patient.findOneAndDelete({ _id: patientId, doctor: id });
  if (!patient) throw ApiError.notFound('Patient not found for this doctor');
  await bumpCount(id, -1);
  await audit(req, { action: 'delete', entity: 'patient', entityId: patient._id, summary: `Removed patient ${patient.name} from doctor` });
  res.json({ success: true, message: 'Patient removed' });
}
