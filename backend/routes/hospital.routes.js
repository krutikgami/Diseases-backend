import { HospitalRegister,HospitalLogin } from "../controllers/hosptial.controller.js";
import { DiseasesRegister } from "../controllers/disease.controller.js";
import express from "express";

const router = express.Router();   
router.post("/register",HospitalRegister);
router.post("/disease/register",DiseasesRegister);
router.post("/login",HospitalLogin);

export default router;
