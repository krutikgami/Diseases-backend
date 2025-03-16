import xlsx from "xlsx";
import bcrypt from "bcryptjs";
import { Hospital } from "../models/hospital.model.js";

const uploadHospitalData = async (req, res) => {
    try {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ message: "fileUrl is required" });
        }

        
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = xlsx.read(arrayBuffer, { type: "buffer" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return res.status(400).json({ message: "Excel file is empty" });
        }

        
        const hospitals = await Promise.all(
            data.map(async (item) => {
                const hashedPassword = await bcrypt.hash(item.password?.trim() || "defaultPass", 10);
                const hashedConfirmPassword = await bcrypt.hash(item.confirmPassword?.trim() || "defaultPass", 10);

                return {
                    name: item.name?.trim() || "",
                    registration_number: item.registration_number?.trim() || "",
                    email: item.email?.trim() || "",
                    phone_no: Number(item.phone_no) || 0,
                    password: hashedPassword,
                    confirmPassword: hashedConfirmPassword,
                    district: item.district?.trim() || "",
                    address: item.address?.trim() || "",
                    total_beds: Number(item.total_beds) || 0,
                    total_ventilators: Number(item.total_ventilators) || 0,
                    total_oxygen_capacity: Number(item.total_oxygen_capacity) || 0,
                    total_icu_bed: Number(item.total_icu_bed) || 0,
                    oxygen_refill_time_estimation: item.oxygen_refill_time_estimation || "",
                    total_ppe_kit: Number(item.total_ppe_kit) || 0,
                    total_doctors: Number(item.total_doctors) || 0,
                    total_nurses: Number(item.total_nurses) || 0,
                };
            })
        );

       
        await Hospital.insertMany(hospitals);

        res.status(201).json({
            message: "Hospitals uploaded successfully",
            cloudinary_url: fileUrl,
            data: hospitals
        });

    } catch (error) {
        console.error("Error in uploadHospitalData:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export { uploadHospitalData };
