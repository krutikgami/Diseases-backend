import { Disease } from "../models/disease.model.js";
import { Hospital } from "../models/hospital.model.js";
import mongoose from "mongoose";

const DiseasesRegister = async (req, res) => {
    try {
        const {
            hospital_id, name, description, symptoms, mild_cases, moderate_cases, severe_cases,
            total_deaths, occupied_beds, occupied_ventilators, occupied_oxygen, disease_type,
            hotspot, total_case_registered, recovered_rate, mortality_rate, active_case,
            vaccinated_coverage, symptoms_severity, seasonal_pattern, disease_recovery_rate
        } = req.body;

        
        if (
            [hospital_id, name, description, disease_type, symptoms_severity, seasonal_pattern]
                .some(e => typeof e !== "string" || e.trim() === "") ||
            !Array.isArray(symptoms) || symptoms.length === 0 ||
            !Array.isArray(hotspot) || hotspot.length === 0 ||
            [mild_cases, moderate_cases, severe_cases, total_deaths, occupied_beds, occupied_ventilators,
                occupied_oxygen, total_case_registered, recovered_rate, mortality_rate, active_case,
                vaccinated_coverage, disease_recovery_rate]
                .some(e => e === undefined || e === null || isNaN(Number(e)))
        ) {
            return res.status(400).json({ message: "All fields are required and must be valid." });
        }

        
        if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
            return res.status(400).json({ message: "Invalid hospital ID format." });
        }

        const existHospital = await Hospital.findById(new mongoose.Types.ObjectId(hospital_id));
        if (!existHospital) {
            return res.status(400).json({ message: "Hospital is not registered." });
        }

        const newDisease = new Disease({
            hospital_id, name, description, symptoms, mild_cases, moderate_cases, severe_cases,
            total_deaths, occupied_beds, occupied_ventilators, occupied_oxygen, disease_type,
            hotspot, total_case_registered, recovered_rate, mortality_rate, active_case,
            vaccinated_coverage, symptoms_severity, seasonal_pattern, disease_recovery_rate
        });

        await newDisease.save();

        return res.status(201).json({ data: newDisease, message: "Disease is created successfully" });

    } catch (error) {
        console.error("Error in DiseasesRegister:", error);
        return res.status(500).json({ message: "Internal Server Error from the disease register" });
    }
};

export { DiseasesRegister };
