import { Hospital } from "../models/hospital.model.js";
import { Disease } from "../models/disease.model.js";

const stateDashboardDateFilter = async(req,res)=>{
        try {
            const { days } = req.body; 
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - (parseInt(days) || 7)); 
            console.log(daysAgo);
            
            const diseaseRecords = await Disease.find({
                date: { $gte: daysAgo.toISOString().split("T")[0] }
            });

            if(!diseaseRecords || diseaseRecords.length == 0){
                return res.status(404).json({message:"Data is not found"});
            }
            
           return res.status(200).json({data:diseaseRecords,message:"Data found Succe"});
        } catch (error) {
           return res.status(500).json({ message: "Error fetching records", error });
        }    
}
export {stateDashboardDateFilter};