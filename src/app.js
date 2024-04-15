import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"1tb"}));
app.use(express.urlencoded({extended:true,limit:`${process.env.LIMIT_DATA}`}));
app.use(express.static("public"));
app.use(cookieParser());


// routes import
import userRoute from "./routes/user.routes.js";


// route declearation
app.use("/api/v1/users",userRoute);



export default app;