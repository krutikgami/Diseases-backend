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
  disease_type: { 
    type: String, 
    required: true
 },
  hotspot: { 
    type: [String], 
    required:true
 },
  total_case_registered: { 
    type: Number, 
    required: true 
},
  recovered_rate: { 
    type: Number, 
    required: true
 },
  mortality_rate: { 
    type: Number, 
    required: true 
},
  active_case: { 
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
  disease_recovery_rate: { 
    type: Number, 
    required: true
 }
},{timestamps:true})

export const Disease = mongoose.model('Disease',diseaseSchema);