import { Hospital } from '../models/hospital.model.js'

const HospitalRegister = async (req, res) => {
    try {
        const {
            name, registration_number, email, phone_no, password, confirmPassword, district,
            address, total_beds, total_ventilators, total_oxygen_capacity, total_icu_bed,
            oxygen_refill_time_estimation, total_ppe_kit, total_doctors, total_nurses
        } = req.body;

        if ([
            name, registration_number, email, district, address, oxygen_refill_time_estimation
        ].some(e => typeof e === "string" && e.trim() === "") ||
        [
            phone_no, total_beds, total_ventilators, total_oxygen_capacity, total_icu_bed,
            total_ppe_kit, total_doctors, total_nurses
        ].some(e => e === undefined || e === null || isNaN(e))) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingHospital = await Hospital.findOne({ 
            $or: [
                { registration_number },
                { phone_no },
                { email }
            ]
        });

        if (existingHospital) {
            return res.status(400).json({ message: "Hospital already exists!" });
        }

        const newHospital = new Hospital({
            name, registration_number, email, phone_no, password, confirmPassword, district,
            address, total_beds, total_ventilators, total_oxygen_capacity, total_icu_bed,
            oxygen_refill_time_estimation, total_ppe_kit, total_doctors, total_nurses
        });

        await newHospital.save();

        const createdHospital = await Hospital.findById(newHospital._id).select("-password -confirmPassword");

        return res.status(201).json({ data: createdHospital, message: "Hospital registered successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error from hospital register" });
    }
}

export { HospitalRegister };
