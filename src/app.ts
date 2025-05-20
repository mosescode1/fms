import express, { Express, Response, NextFunction, Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import authRoutes from './routes/v1/authRoutes/auth.routes';
import { globalError } from './controller/v1/error/error.controller';
import { AppError } from './lib';
//v1
import userRoutes from './routes/v1/userRoutes/user.routes';
import securityRoutes from './routes/v1/securitygroup/securityGroup.routes';
// import organizationRoutes from "./routes/v1/organizationRoutes/organization.routes";
// import filesRoutes from "./routes/v1/filesRoutes/files.routes";
import permissionRoutes from "./routes/v1/permissionRoutes/permission.routes"
// import auditLogRoutes from "./routes/v1/auditLog/audit.log";
// import trashRoutes from './routes/v1/trashRoutes/trash.routes';
// v2
import fileRoutesV2 from "./routes/v2/fileRoutes/files.routes";

const app: Express = express();

const limiter: RateLimitRequestHandler = rateLimit({
	windowMs: 60 * 1000,
	limit: 100,
	message: 'Exceeded Rate Limit Try Again After 1 minute',
});

// Middlewares
app.set('trust proxy', 1);
app.use(morgan('dev'));
app.use(compression());
app.use(helmet());
app.use(
	cors({
		origin: '*',
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(limiter);

// Routes
app.get('/api/v1/health', (_, res) => {
	res.status(200).json({ status: 'UP' });
});

// VERSION 1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/security-group', securityRoutes);
app.use("/api/v1/permissions", permissionRoutes)
// app.use("/api/v1/trash", trashRoutes)
// app.use("/api/v1/files", filesRoutes)
// app.use("/api/v1/auditlog",auditLogRoutes)
// VERSION 2
app.use("/api/v2/files", fileRoutesV2);

// Unhandled routes
app.use('/*splat', (req: Request, _: Response, next: NextFunction) => {
	next(
		new AppError({
			message: `Route Not Found ${req.originalUrl}`,
			statusCode: 404,
		})
	);
});

// Error handling middleware
app.use(globalError);

export default app;
