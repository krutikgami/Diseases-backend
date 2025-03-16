import app from "./app.js";
import connectDB from "./utils/db.js";
import UserRouter from "./routes/user.routes.js";
import HospitalRouter from "./routes/hospital.routes.js";
import Dashboard from "./routes/dashboard.route.js";

app.use("/api/v1",UserRouter);
app.use("/api/v1/hospital",HospitalRouter);
app.use("/api/v1/state-head/dashboard",Dashboard);

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);  
    })
}).catch((error)=>{
    console.log("Server failed to start",error);
});

