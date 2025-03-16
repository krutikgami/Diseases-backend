import {stateDashboardDateFilter} from "../controllers/state-head.controller.js"
import express from "express";

const router = express.Router();

router.post("/disease-records",stateDashboardDateFilter);

export default router;