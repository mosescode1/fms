import {Response, Request, NextFunction} from "express";


type Func = (Req: Request, res: Response, next: NextFunction) => Promise<any>;



const catchAsync = (fn:Func) => {
	return (request: Request, response: Response, next: NextFunction):Promise<any>=> {
		return fn(request, response, next).catch(next);
	}
}

export   { catchAsync };