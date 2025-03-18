import { User } from "../models/user.model.js";

export const protectDistrictHead = async(req,res,next)=>{
    try {
        const {email,role,district} = req.body;
        
        if(!email || !role || email=="" || role == ""){
            return res.status(400).json({message:"All fields are required"});
        }
        
        if (!district || district == "") {
            return res.status(400).json({message:"District is Mandatory!"});
        }
        
        if(role!="district-head"){
            return res.status(400).json({message:"Unauthorized Access!"});
        }
    
        const user = await User.findOne({
            $and:[
                {email},
                {role},
                {district}
            ]
        });
        if(!user){
            return res.status(401).json({message:"Unauthorized Access!"});
        }
    
        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({message:"Internal Server Error from protectedDistrict" ,error:error.message })
    }
}