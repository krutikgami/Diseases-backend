import { Disease } from "../models/disease.model.js";
import { Hospital } from "../models/hospital.model.js";
import mongoose from "mongoose";

const DiseasesRegister = async (req, res) => {
    try {
        const {
            hospital_id, name, description, symptoms, mild_cases, moderate_cases, severe_cases,
            total_case_registered, active_case, hotspot, disease_type, disease_recovery_rate,
            total_deaths, occupied_beds, occupied_ventilators, occupied_oxygen, isolation_ward_status,
            oxygen_supply_status, ppe_kit_availability, mortality_rate, vaccinated_coverage,
            symptoms_severity, seasonal_pattern, hospital_emergency_admission_rate, icu_utilization, date,
            cases_by_age_gender
        } = req.body;

        
        if (
            [hospital_id, name, description, disease_type, symptoms_severity, seasonal_pattern,
             isolation_ward_status, oxygen_supply_status, ppe_kit_availability,date]
                .some(e => typeof e !== "string" || e.trim() === "") ||
            !Array.isArray(symptoms) || symptoms.length === 0 ||
            !Array.isArray(hotspot) || hotspot.length === 0 ||
            [mild_cases, moderate_cases, severe_cases, total_case_registered, active_case,
                total_deaths, occupied_beds, occupied_ventilators, occupied_oxygen,
                disease_recovery_rate, mortality_rate, vaccinated_coverage,
                hospital_emergency_admission_rate, icu_utilization]
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

       
        const formattedCasesByAgeGender = {
            "0-18": {
                male: cases_by_age_gender?.["0-18"]?.male || 0,
                female: cases_by_age_gender?.["0-18"]?.female || 0,
            
            },
            "19-35": {
                male: cases_by_age_gender?.["19-35"]?.male || 0,
                female: cases_by_age_gender?.["19-35"]?.female || 0,
                
            },
            "36-50": {
                male: cases_by_age_gender?.["36-50"]?.male || 0,
                female: cases_by_age_gender?.["36-50"]?.female || 0,
               
            },
            "51-65": {
                male: cases_by_age_gender?.["51-65"]?.male || 0,
                female: cases_by_age_gender?.["51-65"]?.female || 0,
               
            },
            "65+": {
                male: cases_by_age_gender?.["65+"]?.male || 0,
                female: cases_by_age_gender?.["65+"]?.female || 0,
                
            }
        };

        const newDisease = new Disease({
            hospital_id, name, description, symptoms, mild_cases, moderate_cases, severe_cases,
            total_case_registered, active_case, hotspot, disease_type, disease_recovery_rate,
            total_deaths, occupied_beds, occupied_ventilators, occupied_oxygen, isolation_ward_status,
            oxygen_supply_status, ppe_kit_availability, mortality_rate, vaccinated_coverage,
            symptoms_severity, seasonal_pattern, hospital_emergency_admission_rate, icu_utilization,
            cases_by_age_gender: formattedCasesByAgeGender,
            date: new Date(date)
        });

        await newDisease.save();

        return res.status(201).json({ data: newDisease, message: "Disease created successfully" });

    } catch (error) {
        console.error("Error in DiseasesRegister:", error);
        return res.status(500).json({ message: "Internal Server Error from the disease register" });
    }
};

export { DiseasesRegister };
