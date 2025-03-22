import express from 'express';
import { districtDashboardDateFilter,fetchHotspot } from '../controllers/district-head.controller.js';
import { protectDistrictHead } from '../middleware/district_head.middleware.js';
const router = express.Router();

router.post('/disease-records',protectDistrictHead,districtDashboardDateFilter);
router.post('/hotspots',protectDistrictHead,fetchHotspot);
export default router;