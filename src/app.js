import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";


const app = express();
// it's used for the given the pormition to access our backend from the frontend
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"1tb"}));
app.use(express.urlencoded({extended:true,limit:`${process.env.LIMIT_DATA}`}));
app.use(express.static("public"));
app.use(cookieParser());

// import the routes
import userRouter from "./routes/user.routes.js";

// route dicreation 
app.use('/api/v1/users',userRouter)


export default app;