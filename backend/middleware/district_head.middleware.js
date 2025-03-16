import { User } from "../models/user.model";

export const protectDistrictHead = (req,res,next)=>{
    try {
        const {email,role} = req.body;
        
        if(!email || !role || email=="" || role == ""){
            return res.status(400).json({message:"All fields are required"});
        }
    
        if(role!="district-head"){
            return res.status(400).json({message:"Unauthorized role"});
        }
    
        const user = User.findOne({
            $and:[
                {email},
                {role}
            ]
        });
        if(!user){
            return res.status(401).json({message:"User not found"});
        }
    
        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({message:"Internal Server Error from protectedDistrict" ,error:error.message })
    }
}