const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express();

// ADD THIS LINE RIGHT HERE:
app.set("trust proxy", 1);

const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));

// require all the routes here
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

// using all the routes here
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)


module.exports = app
