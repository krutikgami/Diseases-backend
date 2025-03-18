import { Hospital } from "../models/hospital.model.js";
import { Disease } from "../models/disease.model.js";

const districtDashboardDateFilter = async (req, res) => {
    try {
        const { days = 7, district,disease } = req.body;
        const daysAgo = new Date();
        const lastMonth = new Date();
        const today = new Date();
        lastMonth.setDate(lastMonth.getMonth()-1);
        daysAgo.setDate(daysAgo.getDate() - (parseInt(days) || 7));

        let hospitalIds = [];
        let hospitalFilter = {};

        if(!district || district == ""){
            return res.status(400).json({message:"Unauthorizated access!!!"});
        }

        if (district) {
            const hospitals = await Hospital.find({ district }).select("_id");
            hospitalIds = hospitals.map(h => h._id);
        }

        if(hospitalIds.length === 0){
            return res.status(400).json({message:"District is not found!!"});
        }
        
        if (hospitalIds.length > 0) {
            hospitalFilter = { hospital_id: { $in: hospitalIds } };
        }
        let diseaseFilter = {};
        if (disease) {
            diseaseFilter = { name: disease };
        }

        const totalStats = await Disease.aggregate([
            { 
                $match: { 
                    date: { $gte: daysAgo },
                    ...hospitalFilter,
                    ...diseaseFilter
                }
            },
            {
                $group: { 
                    _id: null,
                    total_cases: { $sum: "$total_case_registered" },
                    active_cases: { $sum: "$active_case" },
                    recovered: { $avg: "$disease_recovery_rate" },
                    deaths: { $sum: "$total_deaths" },
                    male_cases : {
                        $sum: {
                            $add: [
                                "$cases_by_age_gender.0-18.male",
                                "$cases_by_age_gender.19-35.male",
                                "$cases_by_age_gender.36-50.male",
                                "$cases_by_age_gender.51-65.male",
                                "$cases_by_age_gender.65+.male"
                                ]
                            }
                    },
                    female_cases : {
                        $sum: {
                            $add: [
                                "$cases_by_age_gender.0-18.female",
                                "$cases_by_age_gender.19-35.female",
                                "$cases_by_age_gender.36-50.female",
                                "$cases_by_age_gender.51-65.female",
                                "$cases_by_age_gender.65+.female"
                                ]
                            }
                    },
                    
                  age_0_18:{
                    $sum:{
                        $add:[
                            { $ifNull: ["$cases_by_age_gender.0-18.male", 0] },
                            { $ifNull: ["$cases_by_age_gender.0-18.female", 0] }
                        ]
                    }
                  },
                  age_19_35:{
                    $sum:{
                        $add:[
                            { $ifNull: ["$cases_by_age_gender.19-35.male", 0] },
                            { $ifNull: ["$cases_by_age_gender.19-35.female", 0] }
                        ]
                    }
                  },
                  age_36_50:{
                    $sum:{
                        $add:[
                            { $ifNull: ["$cases_by_age_gender.36-50.male", 0] },
                            { $ifNull: ["$cases_by_age_gender.36-50.female", 0] }
                        ]
                    }
                 },
                    age_51_65:{
                        $sum:{
                            $add:[
                                { $ifNull: ["$cases_by_age_gender.51-65.male", 0] },
                                { $ifNull: ["$cases_by_age_gender.51-65.female", 0] }
                            ]
                        }
                    },
                    age_65_plus:{
                        $sum:{
                            $add:[
                                { $ifNull: ["$cases_by_age_gender.65+.male", 0] },
                                { $ifNull: ["$cases_by_age_gender.65+.female", 0] }
                            ]
                        }
                    }
                }
            },
        ]);


        //fetch the stats PERCENTAGE OF THE MONTH
        const fetchmonthStats = async(today,lastMonth)=>{
           const fetchstats = await Disease.aggregate([
            {
                $match: {
                    date: { $gte: today, $lt: lastMonth },
                    ...hospitalFilter,
                    ...diseaseFilter
                }
            },
            {
                $group:{
                    _id:null,
                    total_cases:{$sum:"$total_case_registered"},
                    active_cases: { $sum: "$active_case" },
                    recovered: { $avg: "$disease_recovery_rate" },
                    deaths: { $sum: "$total_deaths" },
                }
            }
           ])
           return fetchstats[0] || { total_cases: 0};
        }


        const stats = totalStats[0] || { total_cases: 0, active_cases: 0, recovered: 0, deaths: 0 };
        const recoveryRate = stats.recovered
        const mortalityRate = stats.total_cases > 0 ? (stats.deaths / stats.total_cases) * 100 : 0;
        
        const total_male_female = stats.male_cases + stats.female_cases;
        const total_male = stats.male_cases > 0 ? (stats.male_cases/total_male_female) * 100 : 0;
        const total_female = stats.female_cases > 0 ? (stats.female_cases/total_male_female) * 100 : 0;

        const currentMonthStats = await fetchmonthStats(new Date(today.getFullYear(), today.getMonth(), 1), today);
        const lastMonthStats = await fetchmonthStats(
            new Date(today.getFullYear(), today.getMonth() - 1, 1),
            new Date(today.getFullYear(), today.getMonth(), 1)
        );


        const calculatePercentageChange = (current, previous) => {
            if (previous === 0) return "N/A"; 
            return (((current - previous) / previous) * 100).toFixed(2);
        };

         //percentage for the total_cases
        const total_month_cases = calculatePercentageChange(currentMonthStats.total_cases,lastMonthStats.total_cases);
        const total_month_active_cases = calculatePercentageChange(currentMonthStats.active_cases,lastMonthStats.active_cases);
        const total_month_recovered_rate = calculatePercentageChange(currentMonthStats.recovered,lastMonthStats.recovered);
        const curr_mortality_rate =  currentMonthStats.total_cases > 0 ? (currentMonthStats.deaths / currentMonthStats.total_cases) * 100 : 0;
        const last_mortality_rate =  lastMonthStats.total_cases > 0 ? (lastMonthStats.deaths / lastMonthStats.total_cases) * 100 : 0;
        const total_month_mortality_rate = calculatePercentageChange(curr_mortality_rate,last_mortality_rate);
        
        
        const ageGroupCases = {
            "0-18": stats.age_0_18 || 0,
            "19-35": stats.age_19_35 || 0,
            "36-50": stats.age_36_50 || 0,
            "51-65": stats.age_51_65 || 0,
            "65+": stats.age_65_plus || 0
        };
        let max_age_group = Object.entries(ageGroupCases).reduce((max, curr) => (curr[1] > max[1] ? curr : max), ["", 0]);


        const monthlyData = await Disease.aggregate([
            {
                $match: {
                    date: { $gte: daysAgo },
                    ...hospitalFilter,
                    ...diseaseFilter
                }
            },
            {
                $addFields: { month: { $month: "$date" } }
            },
            {
                $group: {
                    _id: { month: "$month", disease: "$name" },
                    total_cases: { $sum: "$total_case_registered" }, 
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    diseases: {
                        $push: {
                            name: "$_id.disease",
                            cases: "$total_cases"
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

       
        const districtData = await Disease.aggregate([
            {
                $match: {
                    date: { $gte: daysAgo },
                    ...hospitalFilter,
                    ...diseaseFilter
                }
            },
            {
                $lookup: {
                    from: "hospitals",
                    localField: "hospital_id",
                    foreignField: "_id",
                    as: "hospital"
                }
            },
            { $unwind: "$hospital" },
            {
                $group: {
                    _id: "$hospital.district",
                    total_cases: { $sum: "$total_case_registered" }
                }
            },
            { $sort: { total_cases: -1 } }
        ]);

        
        const outbreakAlerts = await Disease.aggregate([
            {
                $match: {
                    date: { $gte: daysAgo },
                    ...hospitalFilter,
                    ...diseaseFilter,
                    total_case_registered: { $gte: 25 } 
                }
            },
            {
                $lookup: {
                    from: "hospitals",
                    localField: "hospital_id",
                    foreignField: "_id",
                    as: "hospital"
                }
            },
            { $unwind: "$hospital" },
            {
                $project: {
                    _id: 0,
                    disease: "$name",
                    district: "$hospital.district",
                    cases: "$total_case_registered",
                    date: 1
                }
            },
            { $sort: { cases: -1, date: -1 } },
            { $limit: 3 }
        ]);



        //RESOURCE-ALLOCATION
        const occupiedResources = await Disease.aggregate([
            {
                $match: {
                    date: { $gte: today },
                    ...hospitalFilter,
                    ...diseaseFilter
                }
            },
            {
                $group: {
                    _id: null,
                    total_occupied_beds: { $sum: "$occupied_beds" },
                    total_occupied_ventilators: { $sum: "$occupied_ventilators" },
                    total_occupied_oxygen: { $sum: "$occupied_oxygen" }
                }
            }
        ]);
        
        const occupiedData = occupiedResources[0] || {
            total_occupied_beds: 0,
            total_occupied_ventilators: 0,
            total_occupied_oxygen: 0
        };
        
        
        const totalHospitalResources = await Hospital.aggregate([
            {
                $match: { _id: { $in: hospitalIds } }
            },
            {
                $group: {
                    _id: null,
                    total_beds: { $sum: "$total_beds" },
                    total_ventilators: { $sum: "$total_ventilators" },
                    total_oxygen_capacity: { $sum: "$total_oxygen_capacity" }
                }
            }
        ]);
        
        const totalResources = totalHospitalResources[0] || {
            total_beds: 0,
            total_ventilators: 0,
            total_oxygen_capacity: 0
        };
        
        
        const availableResources = {
            total_occupied_beds:  occupiedData.total_occupied_beds,
            total_occupied_ventilators:  occupiedData.total_occupied_ventilators,
            total_occupied_oxygen:  occupiedData.total_occupied_oxygen,
            total_beds:totalResources.total_beds,
            total_ventilators:totalResources.total_ventilators,
            total_oxygen_capacity:totalResources.total_oxygen_capacity
        };
        
       
        availableResources.total_occupied_beds = Math.max(0, availableResources.total_occupied_beds);
        availableResources.total_occupied_ventilators = Math.max(0, availableResources.total_occupied_ventilators);
        availableResources.total_occupied_oxygen = Math.max(0, availableResources.total_occupied_oxygen);
        availableResources.total_beds = Math.max(0,  availableResources.total_beds);
        availableResources.total_ventilators = Math.max(0, availableResources.total_ventilators);
        availableResources.total_oxygen_capacity = Math.max(0, availableResources.total_oxygen_capacity);


        return res.status(200).json({
            stats: {
                total_cases: stats.total_cases,
                total_month_cases,
                active_cases: stats.active_cases,
                total_month_active_cases,
                recovery_rate: recoveryRate.toFixed(2),
                total_month_recovered_rate,
                mortality_rate: mortalityRate.toFixed(2),
                total_month_mortality_rate,
                total_male: total_male.toFixed(2),
                total_female : total_female.toFixed(2),
                max_age_group: { age_range: max_age_group[0], cases: max_age_group[1] }
            },
            availableResources,
            monthlyData,
            districtData,
            outbreakAlerts,
            message: "Data fetched successfully"
        });

    } catch (error) {
        console.error("Error fetching records:", error);
        return res.status(500).json({ message: "Error fetching records", error });
    }
};

export { districtDashboardDateFilter };