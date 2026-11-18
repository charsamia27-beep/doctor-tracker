/* Seed the database with an admin user and realistic demo data.
   Usage: npm run seed            (keeps existing data, only ensures admin)
          npm run seed -- --reset (wipes doctors/patients and regenerates) */
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { AuditLog } from '../models/AuditLog.js';
import { GENDERS, PATIENT_CONDITIONS, SPECIALIZATIONS } from '../models/constants.js';

const reset = process.argv.includes('--reset');
const DOCTORS = 40;
const PATIENTS = 900;

const firstNames = ['Ayesha', 'Rahim', 'Nusrat', 'Tanvir', 'Farhana', 'Imran', 'Sadia', 'Arif', 'Mehnaz', 'Kamal',
  'Sabrina', 'Hasan', 'Tasnim', 'Rafiq', 'Jannat', 'Shakib', 'Lamia', 'Nayeem', 'Rumana', 'Fahim', 'Priya', 'David',
  'Sara', 'Omar', 'Lina', 'Yusuf', 'Maya', 'Adnan', 'Zara', 'Karim'];
const lastNames = ['Rahman', 'Hossain', 'Ahmed', 'Chowdhury', 'Islam', 'Khan', 'Sarker', 'Uddin', 'Akter', 'Begum',
  'Das', 'Roy', 'Haque', 'Mahmud', 'Siddiqui', 'Karim', 'Alam', 'Talukder'];
const hospitals = ['Square Hospital', 'Evercare Hospital', 'United Hospital', 'Labaid Specialized', 'Popular Medical College',
  'Dhaka Medical College', 'Ibn Sina Hospital', 'BIRDEM General'];
const diagnoses = ['Hypertension', 'Type 2 Diabetes', 'Migraine', 'Fractured wrist', 'Asthma', 'Seasonal flu',
  'Dermatitis', 'Anxiety disorder', 'Arrhythmia', 'Sinusitis', 'Back pain', 'Post-operative care', 'Dengue fever'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const phone = () => `+8801${int(3, 9)}${String(int(0, 99999999)).padStart(8, '0')}`;
const daysAgo = (n) => new Date(Date.now() - n * 86400000 - int(0, 86399) * 1000);
// Skew dates towards recent days so charts look alive.
const recentBiasedDaysAgo = (max) => Math.floor(max * Math.pow(Math.random(), 1.6));
const conditionWeights = ['Stable', 'Stable', 'Stable', 'Recovering', 'Recovering', 'Under Observation', 'Critical'];

async function run() {
  await connectDB();
  await Promise.all([User.init(), Doctor.init(), Patient.init(), AuditLog.init()]); // make sure indexes exist

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@doctortracker.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  if (!(await User.exists({ email }))) {
    await User.create({ name: 'Admin', email, password, role: 'admin' });
    console.log(`👤 Admin created → ${email} / ${password}`);
  } else {
    console.log(`👤 Admin already exists → ${email}`);
  }

  if (reset) await Promise.all([Doctor.deleteMany({}), Patient.deleteMany({})]);
  if ((await Doctor.estimatedDocumentCount()) > 0) {
    console.log('ℹ️  Doctors already present — run with --reset to regenerate demo data.');
    return;
  }

  const doctorDocs = Array.from({ length: DOCTORS }, (_, i) => {
    const name = `Dr. ${pick(firstNames)} ${pick(lastNames)}`;
    const createdAt = daysAgo(int(0, 365));
    return {
      name,
      nameLower: name.toLowerCase(),
      specialization: SPECIALIZATIONS[i % SPECIALIZATIONS.length],
      hospital: pick(hospitals),
      phone: phone(),
      email: `doctor${i + 1}@demo-hospital.com`,
      patientCount: 0,
      createdAt,
      updatedAt: createdAt,
    };
  });
  const doctors = await Doctor.insertMany(doctorDocs, { lean: true });

  const counts = new Map();
  // Uneven distribution: some doctors are much busier than others.
  const weighted = doctors.flatMap((d, i) => Array(1 + (i % 7)).fill(d._id));
  const patientDocs = Array.from({ length: PATIENTS }, () => {
    const doctor = pick(weighted);
    counts.set(String(doctor), (counts.get(String(doctor)) || 0) + 1);
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    const admittedAt = daysAgo(recentBiasedDaysAgo(365));
    return {
      name,
      nameLower: name.toLowerCase(),
      age: int(1, 90),
      gender: Math.random() < 0.04 ? GENDERS[2] : pick(GENDERS.slice(0, 2)),
      phone: phone(),
      email: Math.random() < 0.7 ? `${name.split(' ')[0].toLowerCase()}${int(1, 999)}@mail.com` : undefined,
      condition: pick(conditionWeights),
      diagnosis: pick(diagnoses),
      admittedAt,
      doctor,
      createdAt: admittedAt,
      updatedAt: admittedAt,
    };
  });
  await Patient.insertMany(patientDocs, { lean: true });

  await Doctor.bulkWrite(
    [...counts].map(([id, n]) => ({ updateOne: { filter: { _id: id }, update: { $set: { patientCount: n } } } }))
  );

  console.log(`🌱 Seeded ${DOCTORS} doctors and ${PATIENTS} patients (${PATIENT_CONDITIONS.length} conditions).`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
