import { HospitalRegister,HospitalLogin,hospitalDelete,getHospital } from "../controllers/hosptial.controller.js";
import { DiseasesRegister } from "../controllers/disease.controller.js";
import {uploadHospitalData} from "../utils/hospitalCsv.js";
import { uploadDiseaseFile } from "../utils/diseaseCsv.js";
import { protectDistrictHead } from "../middleware/district_head.middleware.js";
import express from "express";

const router = express.Router();   
router.post("/register",HospitalRegister);
router.post("/disease/register",DiseasesRegister);
router.post("/login",HospitalLogin);
router.post("/upload", uploadHospitalData);
router.post("/disease/upload",uploadDiseaseFile);
router.delete("/delete",hospitalDelete);
router.post('/getHospitals',protectDistrictHead,getHospital);

export default router;
