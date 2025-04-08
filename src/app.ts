import express, {Express} from "express";
import cors from "cors";
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan";
import rateLimit, {RateLimitRequestHandler} from "express-rate-limit";


const app: Express = express();

const limiter:RateLimitRequestHandler = rateLimit({
	windowMs: 60 * 1000,
	max: 1000,
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
app.use(express.urlencoded({ extended: true }));
app.use(limiter);



export default app;