import { Router } from 'express';
import * as doctors from '../controllers/doctorController.js';
import * as patients from '../controllers/patientController.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { idParam, objectId } from '../validators/common.js';
import { doctorBody, doctorListQuery, doctorUpdate } from '../validators/doctor.js';
import { patientForDoctorBody, patientListQuery } from '../validators/patient.js';
import { z } from 'zod';

const router = Router();

router.get('/', validate({ query: doctorListQuery }), h(doctors.listDoctors));
router.get('/meta', h(doctors.doctorMeta));
router.get('/options', h(doctors.doctorOptions));
router.post('/', validate({ body: doctorBody }), h(doctors.createDoctor));
router.get('/:id', validate({ params: idParam }), h(doctors.getDoctor));
router.patch('/:id', validate({ params: idParam, body: doctorUpdate }), h(doctors.updateDoctor));
router.delete('/:id', validate({ params: idParam }), h(doctors.deleteDoctor));

// Nested patient resources
router.get('/:id/patients', validate({ params: idParam, query: patientListQuery }), h(patients.listDoctorPatients));
router.post('/:id/patients', validate({ params: idParam, body: patientForDoctorBody }), h(patients.addPatientToDoctor));
router.delete(
  '/:id/patients/:patientId',
  validate({ params: z.object({ id: objectId, patientId: objectId }) }),
  h(patients.removePatientFromDoctor)
);

export default router;
