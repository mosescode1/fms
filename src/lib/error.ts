//ts-node-ignore
type ErrorCode = string
//const InvalidRequest: ErrorCode = "INVALID_REQUEST"
//const InvalidInput: ErrorCode = "INVALID_INPUT"
// const AlreadyExist: ErrorCode = "ALREADY_EXIST"
// const InternalServerError: ErrorCode = "INTERNAL_SERVER_ERROR"
// const UnprocessableEntityError: ErrorCode = "UnprocessableEntityError"
// const ReadError: ErrorCode = "PERMISSION_DENIED"
// const NotFoundError: ErrorCode = "NOT_FOUND"
// const CannotDelete: ErrorCode = "REQUIRED_ADMIN_PERMISSION"




export class AppError extends Error {
	message: string;
	statusCode: number;
	status: ErrorCode;
	isOperationalError: boolean;
	
	
	constructor({message, statusCode, status} :{message: string, status: string, statusCode: number}) {
		super(message);
		this.message = message;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.statusCode = statusCode;
		this.isOperationalError = true;
		
		Error.captureStackTrace(this, AppError);
	}
	

}