import express from 'express';
import { getStatus } from '../controllers/statusController.js';
import { symptomCheck, medscanAI, treatmentMap, hospitalIntel } from '../controllers/aiController.js';
import { getVerifiedHospitals } from '../controllers/appointmentController.js';

const router = express.Router();

// Basic health check endpoint
router.get('/status', getStatus);

// AI endpoints
router.post('/symptom-check', symptomCheck);
router.post('/medscan-ai', medscanAI);
router.post('/treatment-map', treatmentMap);
router.post('/hospital-intel', hospitalIntel);

// Appointment endpoints
router.get('/appointments', getVerifiedHospitals);

export default router;
