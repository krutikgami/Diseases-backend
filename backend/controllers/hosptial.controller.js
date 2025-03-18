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

const HospitalLogin = async(req,res)=>{
    try {
        const {credential,password} = req.body;
        if(!credential || !password || credential == "" || password ==""){
            return res.status(404).json({message:"All fields are required"});
        }
        
        const hospital = await Hospital.findOne({
            $or:[
                {registration_number:credential},
                {email:credential},
            ]
        })
        if(!hospital){
            return res.status(404).json({message:"Hospital not Exist"});
        }

        const passwordMatch  = await hospital.matchPassword(password);
        
        
        if(!passwordMatch){
            return res.status(404).json({message:"Invalid Credentials"});
        }
        
        const createdHospital = await Hospital.findById(hospital._id).select("-password -confirmPassword");

        return res.status(200).json({data: createdHospital,message:"Hospital LoggedIn successfully"});

    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"});
    }
}

const hospitalDelete = async(req,res)=>{
    try{
        const {email} = req.body;
        if(!email || email==""){
            return res.status(400).json({message:"Email is required"});
        }
        const hospital = await Hospital.findOne({email});
        if(!hospital){
            return res.status(404).json({message:"Hospital not found"});
        }
        await Hospital.findByIdAndDelete(hospital._id);
        return res.status(200).json({message:"Hospital Deleted Successfully"});
    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
}
export { HospitalRegister,HospitalLogin,hospitalDelete};