import app from "./app.js";
import connectDB from "./utils/db.js";
import UserRouter from "./routes/user.routes.js";
import HospitalRouter from "./routes/hospital.routes.js";
import StateDashboard from "./routes/state-dashboard.routes.js";
import DistrictDashboard from "./routes/district-dashboard.routes.js"
import UserDashboard from "./routes/user-dashboard.routes.js";

app.use("/api/v1",UserRouter);
app.use("/api/v1/hospital",HospitalRouter);
app.use("/api/v1/state-head/dashboard",StateDashboard);
app.use("/api/v1/district-head/dashboard",DistrictDashboard);
app.use("/api/v1/user/dashboard",UserDashboard);

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);  
    })
}).catch((error)=>{
    console.log("Server failed to start",error);
});

