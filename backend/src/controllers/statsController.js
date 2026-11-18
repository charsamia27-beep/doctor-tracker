import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { PATIENT_CONDITIONS } from '../models/constants.js';

const RANGES = {
  '7d': { days: 7, unit: 'day' },
  '30d': { days: 30, unit: 'day' },
  '90d': { days: 90, unit: 'week' },
  '12m': { days: 365, unit: 'month' },
};

const startOfUTCDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** Generate every bucket key so the chart shows zero-days instead of gaps. */
function buildBuckets(start, end, unit) {
  const keys = [];
  const cur = new Date(start);
  if (unit === 'month') cur.setUTCDate(1);
  if (unit === 'week') cur.setUTCDate(cur.getUTCDate() - ((cur.getUTCDay() + 6) % 7)); // align to Monday (ISO week, matches $dateTrunc startOfWeek: 'monday')
  while (cur <= end) {
    keys.push(cur.toISOString().slice(0, 10));
    if (unit === 'day') cur.setUTCDate(cur.getUTCDate() + 1);
    else if (unit === 'week') cur.setUTCDate(cur.getUTCDate() + 7);
    else cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return keys;
}

/**
 * GET /api/stats/overview?range=30d
 * Independent aggregations run in parallel. Each starts with a $match/$sort on an
 * indexed field (or uses the denormalised patientCount) so none of them scans the
 * whole collection more than necessary.
 */
export async function overview(req, res) {
  const { range } = req.valid.query;
  const { days, unit } = RANGES[range];

  const end = new Date();
  const start = startOfUTCDay(new Date(end.getTime() - (days - 1) * 86400000));
  const prevStart = new Date(start.getTime() - days * 86400000);

  const [
    totalDoctors,
    totalPatients,
    newInRange,
    newInPrevRange,
    criticalCount,
    byCondition,
    topDoctors,
    bySpecialization,
    timeline,
    byGender,
    ageBuckets,
  ] = await Promise.all([
    Doctor.estimatedDocumentCount(),
    Patient.estimatedDocumentCount(),
    Patient.countDocuments({ admittedAt: { $gte: start, $lte: end } }),
    Patient.countDocuments({ admittedAt: { $gte: prevStart, $lt: start } }),
    Patient.countDocuments({ condition: 'Critical' }),

    Patient.aggregate([{ $group: { _id: '$condition', count: { $sum: 1 } } }]),

    // Uses the { patientCount: -1 } index — no $lookup or $group over patients needed.
    Doctor.find({}, 'name specialization patientCount').sort({ patientCount: -1 }).limit(50).lean(),

    Doctor.aggregate([
      { $group: { _id: '$specialization', doctors: { $sum: 1 }, patients: { $sum: '$patientCount' } } },
      { $sort: { patients: -1 } },
    ]),

    Patient.aggregate([
      { $match: { admittedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateTrunc: { date: '$admittedAt', unit, timezone: 'UTC', ...(unit === 'week' && { startOfWeek: 'monday' }) } },
          count: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$condition', 'Critical'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Patient.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]),

    Patient.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 13, 19, 31, 46, 61, 131],
          default: 'Unknown',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
  ]);

  // ---- shape for the client ----
  const timelineMap = new Map(timeline.map((t) => [t._id.toISOString().slice(0, 10), t]));
  const ageLabels = { 0: '0–12', 13: '13–18', 19: '19–30', 31: '31–45', 46: '46–60', 61: '60+' };
  const conditionMap = Object.fromEntries(byCondition.map((c) => [c._id, c.count]));

  const growth = newInPrevRange === 0 ? (newInRange > 0 ? 100 : 0) : ((newInRange - newInPrevRange) / newInPrevRange) * 100;

  res.json({
    success: true,
    data: {
      range,
      unit,
      totals: {
        doctors: totalDoctors,
        patients: totalPatients,
        avgPatientsPerDoctor: totalDoctors ? +(totalPatients / totalDoctors).toFixed(1) : 0,
        newPatients: newInRange,
        newPatientsGrowth: +growth.toFixed(1),
        critical: criticalCount,
      },
      timeline: buildBuckets(start, end, unit).map((date) => ({
        date,
        patients: timelineMap.get(date)?.count ?? 0,
        critical: timelineMap.get(date)?.critical ?? 0,
      })),
      patientsPerDoctor: topDoctors.map((d) => ({
        id: d._id, name: d.name, specialization: d.specialization, patients: d.patientCount,
      })),
      byCondition: PATIENT_CONDITIONS.map((name) => ({ name, value: conditionMap[name] ?? 0 })),
      bySpecialization: bySpecialization.map((s) => ({ name: s._id, doctors: s.doctors, patients: s.patients })),
      byGender: byGender.map((g) => ({ name: g._id, value: g.count })),
      byAge: ageBuckets.map((b) => ({ name: ageLabels[b._id] ?? 'Unknown', value: b.count })),
    },
  });
}
