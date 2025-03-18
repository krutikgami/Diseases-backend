import express from 'express';
import { districtDashboardDateFilter } from '../controllers/district-head.controller.js';
import { protectDistrictHead } from '../middleware/district_head.middleware.js';
const router = express.Router();

router.post('/disease-records',protectDistrictHead,districtDashboardDateFilter);

export default router;