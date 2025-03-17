import {stateDashboardDateFilter} from "../controllers/state-head.controller.js"
import express from "express";
import { protectStateHead } from "../middleware/state_head.middleware.js";

const router = express.Router();

router.post("/disease-records",protectStateHead,stateDashboardDateFilter);

export default router;