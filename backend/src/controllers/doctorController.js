import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { SPECIALIZATIONS } from '../models/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { audit } from '../utils/audit.js';
import { dateRange, escapeRegex, paginate, prefix } from '../utils/query.js';

const LIST_PROJECTION = 'name specialization hospital phone email patientCount createdAt';

const SORTS = {
  createdAt: (d) => ({ createdAt: d, _id: d }),
  name: (d) => ({ nameLower: d, _id: d }),
  patientCount: (d) => ({ patientCount: d, _id: d }),
};

export async function listDoctors(req, res) {
  const { page, limit, search, from, to, specialization, hospital, sort, order } = req.valid.query;
  const filter = {};

  if (search) {
    // Each branch hits its own index; MongoDB merges them with an OR plan.
    filter.$or = [
      { nameLower: prefix(search) },
      { email: prefix(search) },
      { phone: new RegExp('^' + escapeRegex(search)) },
    ];
  }
  if (specialization) filter.specialization = specialization;
  if (hospital) filter.hospital = hospital;
  const created = dateRange(from, to);
  if (created) filter.createdAt = created;

  const dir = order === 'asc' ? 1 : -1;
  const result = await paginate(Doctor, filter, { page, limit, sort: SORTS[sort](dir), projection: LIST_PROJECTION });
  res.json({ success: true, data: result.items, pagination: result.pagination });
}

/** Options for filter dropdowns. `distinct` on an indexed field is answered from the index. */
export async function doctorMeta(_req, res) {
  const hospitals = await Doctor.distinct('hospital');
  res.json({ success: true, data: { specializations: SPECIALIZATIONS, hospitals: hospitals.sort() } });
}

/** Lightweight list for <select> inputs (e.g. assigning a patient to a doctor). */
export async function doctorOptions(_req, res) {
  const doctors = await Doctor.find({}, 'name specialization').sort({ nameLower: 1 }).lean();
  res.json({ success: true, data: doctors });
}

export async function getDoctor(req, res) {
  const doctor = await Doctor.findById(req.valid.params.id, LIST_PROJECTION + ' updatedAt').lean();
  if (!doctor) throw ApiError.notFound('Doctor not found');
  res.json({ success: true, data: doctor });
}

export async function createDoctor(req, res) {
  const doctor = await Doctor.create(req.valid.body);
  await audit(req, { action: 'create', entity: 'doctor', entityId: doctor._id, summary: `Added ${doctor.name}` });
  res.status(201).json({ success: true, data: doctor });
}

export async function updateDoctor(req, res) {
  const doctor = await Doctor.findById(req.valid.params.id);
  if (!doctor) throw ApiError.notFound('Doctor not found');
  doctor.set(req.valid.body);
  const changedFields = doctor.modifiedPaths().filter((p) => p !== 'nameLower');
  await doctor.save(); // runs validators + the nameLower hook
  if (changedFields.length) {
    await audit(req, { action: 'update', entity: 'doctor', entityId: doctor._id, summary: `Updated ${doctor.name}`, changedFields });
  }
  res.json({ success: true, data: doctor });
}

export async function deleteDoctor(req, res) {
  const { id } = req.valid.params;
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) throw ApiError.notFound('Doctor not found');
  const { deletedCount } = await Patient.deleteMany({ doctor: id });
  await audit(req, { action: 'delete', entity: 'doctor', entityId: doctor._id, summary: `Deleted ${doctor.name} and ${deletedCount} patient(s)` });
  res.json({ success: true, message: `Doctor deleted along with ${deletedCount} patient(s)` });
}
