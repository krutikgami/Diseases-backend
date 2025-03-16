import mongoose from "mongoose"

const diseaseSchema = new mongoose.Schema({
hospital_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hospital', 
    required: true 
},
name: { 
    type: String, 
    required: true 
},
description: { 
    type: String, 
    required:true
 },
  symptoms: { 
    type: [String], 
    required: true
},
  mild_cases: { 
    type: Number, 
    required: true 
},
  moderate_cases: { 
    type: Number, 
    required: true
 },
  severe_cases: {
     type: Number, 
     required: true 
  },
  total_case_registered: { 
    type: Number, 
    required: true 
},
active_case: { 
  type: Number, 
  required: true 
},
hotspot: { 
  type: [String], 
  required:true
},
disease_type: { 
  type: String, 
  required: true
},
disease_recovery_rate: { 
  type: Number, 
  required: true
},
total_deaths: { 
    type: Number, 
    required: true 
},
  occupied_beds: { 
    type: Number, 
    required: true 
},
  occupied_ventilators: { 
    type: Number, 
    required: true
 },
occupied_oxygen: { 
    type: Number, 
    required: true 
},
isolation_ward_status: {
  type: String,
  enum: ["Available", "Full", "Not Available"], 
  required: true
},
oxygen_supply_status: {
  type: String,
  enum: ["Stable", "Low", "Critical"],
  required: true
},
ppe_kit_availability: {
  type: String,
  enum: ["Sufficient", "Limited", "Out of Stock"], 
  required: true
},
mortality_rate: { 
  type: Number, 
  required: true 
},
 vaccinated_coverage: { 
    type: Number, 
    required: true 
},
symptoms_severity: { 
    type: String, 
    enum: ['Mild', 'Moderate', 'Severe', 'Critical'], 
    default: 'Mild',
    required: true 
  },
  seasonal_pattern: { 
    type: String, 
    enum: ['Winter', 'Summer', 'Monsoon', 'All Seasons'], 
    default: 'All Seasons',
    required: true
  },
  cases_by_age_gender: {
    "0-18": { male: Number, female: Number},
    "19-35": { male: Number, female: Number },
    "36-50": { male: Number, female: Number },
    "51-65": { male: Number, female: Number },
    "65+": { male: Number, female: Number}
},
  hospital_emergency_admission_rate: {
    type: Number,
    required: true
},
icu_utilization: {
    type: Number,
    required: true
},
date: {
    type: String,
    required: true
}
},{timestamps:true});
export const Disease = mongoose.model('Disease',diseaseSchema);