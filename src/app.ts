import express, {Express, Response, NextFunction, Request} from "express";
import cors from "cors";
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan";
import rateLimit, {RateLimitRequestHandler} from "express-rate-limit";
import authRoutes from "./routes/authRoutes/auth.routes";
import {globalError} from "./controller/error/error.controller";
import {AppError} from "./lib";
import userRoutes from "./routes/userRoutes/user.routes";
import organizationRoutes from "./routes/organizationRoutes/organization.routes";
import filesRoutes from "./routes/filesRoutes/files.routes";
import auditLogRoutes from "./routes/auditLog/audit.log";



const app: Express = express();

const limiter:RateLimitRequestHandler = rateLimit({
	windowMs: 60 * 1000,
	limit: 100,
	message: "Exceeded Rate Limit Try Again After 1 minute",
})

// Middlewares
app.set('trust proxy', 1);
app.use(morgan("common"));
app.use(compression());
app.use(helmet());
app.use(cors({
	origin: "*",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(limiter);

// Routes
app.get("/api/v1/health", (_, res) => {
	res.status(200).json({status: "UP"});
})
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/organization", organizationRoutes)
app.use("/api/v1/files", filesRoutes)
app.use("/api/v1/auditlog",auditLogRoutes)



// Unhandled routes
app.use('/*splat', (req:Request, _:Response, next:NextFunction) => {
	next(
		new AppError({
			message: `Route Not Found ${req.originalUrl}`,
			statusCode: 404,
		})
	);
});


// Error handling middleware
app.use(globalError)


export default app;