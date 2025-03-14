import {Hospital} from '../models/hospital.model.js'

const HospitalRegister = async(req,res) =>{
    try {
        const {
            name, registration_number, email, phone_no, password, confirmPassword, district,
            address, total_beds, total_ventilators, total_oxygen, icu_bed_availability,
            covid_isolation_ward_status, oxygen_supply_status, ventilator_availability,
            oxygen_refill_time_estimation, ppe_kit_availability, hospital_emergency_admission_rate,
            icu_utilization_trend, medical_supply_chain_efficiency, total_doctor_availability,
            total_nurses_availability
        } = req.body;

        
        if ([
            name, registration_number, email, district, address, covid_isolation_ward_status, 
            oxygen_supply_status, oxygen_refill_time_estimation, ppe_kit_availability
        ].some(e => typeof e === "string" && e.trim() === "") || 
        [
            phone_no, total_beds, total_ventilators, total_oxygen, icu_bed_availability, ventilator_availability,
            hospital_emergency_admission_rate, icu_utilization_trend, medical_supply_chain_efficiency,
            total_doctor_availability, total_nurses_availability
        ].some(e => e === undefined || e === null || isNaN(e))) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const existingHospital = await Hospital.findOne({ registration_number });

        if (existingHospital) {
            return res.status(400).json({ message: "Hospital already exists!" });
        }

    
        const newHospital = new Hospital({
            name, registration_number, email, phone_no, password, confirmPassword, district,
            address, total_beds, total_ventilators, total_oxygen, icu_bed_availability,
            covid_isolation_ward_status, oxygen_supply_status, ventilator_availability,
            oxygen_refill_time_estimation, ppe_kit_availability, hospital_emergency_admission_rate,
            icu_utilization_trend, medical_supply_chain_efficiency, total_doctor_availability,
            total_nurses_availability
        });

        await newHospital.save();

        
        const createdHospital = await Hospital.findById(newHospital._id).select("-password -confirmPassword");

        return res.status(201).json({ data: createdHospital, message: "Hospital registered successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error from hospital register" });
    }
}

export {HospitalRegister}