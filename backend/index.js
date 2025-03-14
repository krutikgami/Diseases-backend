import app from "./app.js";
import connectDB from "./utils/db.js";
import UserRouter from "./routes/user.routes.js";

app.use("/api/v1",UserRouter);

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);  
    })
})
