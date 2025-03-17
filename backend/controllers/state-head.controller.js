import { Hospital } from "../models/hospital.model.js";
import { Disease } from "../models/disease.model.js";

const stateDashboardDateFilter = async (req, res) => {
    try {
        const { days = 7, district,disease } = req.body;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - (parseInt(days) || 7));

        let hospitalIds = [];
        let hospitalFilter = {};
        if (district) {
            const hospitals = await Hospital.find({ district }).select("_id");
            hospitalIds = hospitals.map(h => h._id);
        } else {
            const hospitals = await Hospital.find().select("_id");
            hospitalIds = hospitals.map(h => h._id);
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

        const stats = totalStats[0] || { total_cases: 0, active_cases: 0, recovered: 0, deaths: 0 };
        const recoveryRate = stats.recovered
        const mortalityRate = stats.total_cases > 0 ? (stats.deaths / stats.total_cases) * 100 : 0;
        
        const total_male_female = stats.male_cases + stats.female_cases;
        const total_male = stats.male_cases > 0 ? (stats.male_cases/total_male_female) * 100 : 0;
        const total_female = stats.female_cases > 0 ? (stats.female_cases/total_male_female) * 100 : 0;
        
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
                    total_cases: { $sum: "$total_case_registered" }
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

        return res.status(200).json({
            stats: {
                total_cases: stats.total_cases,
                active_cases: stats.active_cases,
                recovery_rate: recoveryRate.toFixed(2),
                mortality_rate: mortalityRate.toFixed(2),
                total_male: total_male.toFixed(2),
                total_female : total_female.toFixed(2),
                max_age_group: { age_range: max_age_group[0], cases: max_age_group[1] }
            },
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

export { stateDashboardDateFilter };