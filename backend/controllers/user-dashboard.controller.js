import {Disease} from "../models/disease.model.js"
import {Hospital} from "../models/hospital.model.js"

const userDashboard=async(req,res)=>{
    try {
        const { days = 7, district,disease} = req.body;
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
                }
            }
        ]);

        const stats = totalStats[0] || { total_cases: 0, active_cases: 0, recovered: 0, deaths: 0 };
        const recoveryRate = stats.recovered
        const mortalityRate = stats.total_cases > 0 ? (stats.deaths / stats.total_cases) * 100 : 0;
        
        const monthlyData = await Disease.aggregate([
            {
                $match: {
                    date: { $gte: daysAgo },
                    ...hospitalFilter,
                    ...diseaseFilter
                }
            },
            {
                $addFields: { 
                month: { $month: "$date" },
                recovered_cases: { $subtract: ["$total_case_registered", "$active_case"] }
                }
            },
            {
                $group: {
                    _id: { month: "$month"},
                    total_cases: { $sum: "$total_case_registered" },
                    active: { $sum: "$active_case" }, 
                    recovered: { $sum: "$recovered_cases" }
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    diseases: {
                        $push: {
                            name: "$_id.disease",
                            cases: "$total_cases",
                            active_cases:"$active",
                            recovered_cases:"$recovered"
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
}

export {userDashboard};