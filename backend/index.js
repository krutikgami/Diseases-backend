import app from "./app.js";
import connectDB from "./utils/db.js";
import UserRouter from "./routes/user.routes.js";
import HospitalRouter from "./routes/hospital.routes.js";

app.use("/api/v1",UserRouter);
app.use("/api/v1/hospital",HospitalRouter);

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);  
    })
})
