import { Router } from 'express';
import * as patients from '../controllers/patientController.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { idParam } from '../validators/common.js';
import { patientBody, patientListQuery, patientUpdate } from '../validators/patient.js';

const router = Router();

router.get('/', validate({ query: patientListQuery }), h(patients.listPatients));
router.post('/', validate({ body: patientBody }), h(patients.createPatient));
router.get('/:id', validate({ params: idParam }), h(patients.getPatient));
router.patch('/:id', validate({ params: idParam, body: patientUpdate }), h(patients.updatePatient));
router.delete('/:id', validate({ params: idParam }), h(patients.deletePatient));

export default router;
