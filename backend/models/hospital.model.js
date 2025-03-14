import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    registration_number: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone_no: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    total_beds: {
        type: Number,
        required: true
    },
    total_ventilators: {
        type: Number,
        required: true
    },
    total_oxygen_capacity: {
        type: Number,
        required: true
    },
    total_icu_bed: {
        type: Number,
        required: true
    },
    oxygen_refill_time_estimation: {
        type: String,
        required: true
    },
    total_ppe_kit:{
        type: Number,
        required: true
    },
    total_doctors: {
        type: Number,
        required: true
    },
    total_nurses: {
        type: Number,
        required: true
    }
},{
    timestamps: true
})

hospitalSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    if(!this.isModified("confirmPassword")) return next();
    this.password = await bcrypt.hash(this.password,10);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword,10);
    next();
})

hospitalSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

hospitalSchema.methods.matchPassword = async function(confirmPassword){
    return await bcrypt.compare(confirmPassword,this.confirmPassword);
}

export const Hospital  = mongoose.model("Hospital",hospitalSchema);


