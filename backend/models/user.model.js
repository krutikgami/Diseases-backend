import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true,    
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    mobile_no:{
        type:Number,
        required:true,
        unique:true,
    },
    district:{
        type: String,
        required: true,
    },
    role:{
        type:String,
        default:"district-head"
    },
    password:{
        type:String,
        required:true,
    },
    confirmPassword:{
        type:String,
        required:true,
    }

},{timestamps: true});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    if(!this.isModified("confirmPassword")) return next();
    this.password = await bcrypt.hash(this.password,10);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword,10);
    next();
})

userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.matchConfirmPassword = async function(confirmPassword){
    return await bcrypt.compare(confirmPassword,this.confirmPassword);
}

export const User = mongoose.model("User",userSchema);




