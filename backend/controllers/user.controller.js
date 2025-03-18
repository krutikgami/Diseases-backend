import { User } from "../models/user.model.js";


const registerUser = async(req,res) => {
   try {
     const {name,email,mobile_no,district,password,confirmPassword} = req.body;
     if(!name || !email || !mobile_no || !district || !password || !confirmPassword){
         return res.status(400).json({message:"All fields are required"});
     }
     if(password !== confirmPassword){
         return res.status(400).json({message:"Confirm Password do not match"});
     }
     const user = await User.findOne({
         email
     })
     if(user){
         return res.status(400).json({message:"User already exists"});
     }
     const newUser = new User({
         name,
         email,
         mobile_no,
         district,
         password,
         confirmPassword
     })
     await newUser.save();
     const createdUser = await User.findById(newUser._id).select("-password -confirmPassword");
     return res.status(201).json({data:createdUser,message:"User registered successfully"});  
     
   } catch (error) {
        return res.status(500).json({message:"Internal Server Error"});
   }
}

const loginUser = async(req,res) =>{
    try {
        const {email,password} = req.body;
    
        if(!email || !password || email == "" || password =="" ){
            return res.status(404).json({message:"All fields are required"});
        }
    
        const user = await User.findOne({
            email
        });
    
        if(!user){
            return res.status(404).json({message:"User not Exist"});
        }
        const passwordMatch  = await user.matchPassword(password);
        if(!passwordMatch){
            return res.status(404).json({message:"Invalid Credentials"});
        }
        
        const createdUser = await User.findById(user._id).select("-password -confirmPassword");
        
        return res.status(200).json({data: createdUser,message:"User LoggedIn successfully"});
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"});
    }
}

const getUser = async(req,res)=>{
    try {
        const users = await User.find({
            role: "district-head"
        }).select("-password -confirmPassword");
        if(!users){
            return res.status(404).json({message:"No Users Found"});
        }
        return res.status(200).json({data:users});
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"});
    }
}

const districtHeadDelete = async(req,res)=>{
    try{
        const {email} = req.body;
        if(!email || email==""){
            return res.status(400).json({message:"Email is required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        await User.findByIdAndDelete(user._id);
        return res.status(200).json({message:"District Head Deleted Successfully"});
    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
}

export {registerUser,loginUser,getUser,districtHeadDelete};