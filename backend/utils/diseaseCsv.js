import { Disease } from "../models/disease.model.js";
import xlsx from "xlsx";

const uploadDiseaseFile = async (req, res) => {
    try {
        const { hospital_id,fileUrl } = req.body; 

        if ( !hospital_id,!fileUrl) {
            return res.status(400).json({ message: "hospital_id and fileUrl are required" });
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
        const convertExcelDateToISO = (excelSerial) => {
            if (!isNaN(excelSerial)) {
            
                const excelEpoch = new Date(1900, 0, 1);
                return new Date(excelEpoch.getTime() + (excelSerial - 2) * 86400000)
                    .toISOString()
                    .split("T")[0]; 
            }
            return excelSerial;
        };
      
        const diseaseRecords = data.map((item) => ({
            hospital_id,
            name: item.name || "",
            description: item.description || "",
            symptoms: item.symptoms ? item.symptoms.split(",") : [],
            mild_cases: item.mild_cases || 0,
            moderate_cases: item.moderate_cases || 0,
            severe_cases: item.severe_cases || 0,
            total_case_registered: item.total_case_registered || 0,
            active_case: item.active_case || 0,
            hotspot: item.hotspot ? item.hotspot.split(",") : [],
            disease_type: item.disease_type || "",
            disease_recovery_rate: item.disease_recovery_rate || 0,
            total_deaths: item.total_deaths || 0,
            occupied_beds: item.occupied_beds || 0,
            occupied_ventilators: item.occupied_ventilators || 0,
            occupied_oxygen: item.occupied_oxygen || 0,
            isolation_ward_status: item.isolation_ward_status || "",
            oxygen_supply_status: item.oxygen_supply_status || "",
            ppe_kit_availability: item.ppe_kit_availability || "",
            mortality_rate: item.mortality_rate || 0,
            vaccinated_coverage: item.vaccinated_coverage || 0,
            symptoms_severity: item.symptoms_severity || "",
            seasonal_pattern: item.seasonal_pattern || "",
            cases_by_age_gender: {
                "0-18": { male: item["0-18 (M)"] || 0, female: item["0-18 (F)"] || 0 },
                "19-35": { male: item["19-35 (M)"] || 0, female: item["19-35 (F)"] || 0 },
                "36-50": { male: item["36-50 (M)"] || 0, female: item["36-50 (F)"] || 0 },
                "51-65": { male: item["51-65 (M)"] || 0, female: item["51-65 (F)"] || 0 },
                "65+": { male: item["65+ (M)"] || 0, female: item["65+ (F)"] || 0 }
            },
            hospital_emergency_admission_rate: item.hospital_emergency_admission_rate || 0,
            icu_utilization: item.icu_utilization || 0,
            date: new Date(convertExcelDateToISO(item.date))
        }));

        
        await Disease.insertMany(diseaseRecords);

        return res.status(201).json({
            message: "Disease data uploaded successfully",
            cloudinary_url: fileUrl,
            data: diseaseRecords
        });
    } catch (error) {
        console.error("Error in uploadDiseaseFile:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export { uploadDiseaseFile };
