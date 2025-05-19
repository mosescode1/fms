import { AppError } from '../../../lib';
import userService from '../../../service/v1/user/user.service';
import reqValidator from '../../../lib/reqValidator';
import AuthService from '../../../service/v1/auth/auth.service';

class UserController {
	/**
	 * Validate email format using regex
	 * @param email - The email address to validate
	 * @return boolean - Returns true if the email format is valid, false otherwise
	 * */
	static validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Validate password format using regex
	 * @param password - The password to validate
	 * @return boolean - Returns true if the password format is valid, false otherwise
	 * */
	static validatePassword(password: string): boolean {
		// Password must be at least 8 characters long and contain at least one number
		const passwordRegex = /^(?=.*[0-9]).{8,}$/;
		return passwordRegex.test(password);
	}

	async userProfile(req: any, res: any) {
		const user = await userService.userProfile(req.user.userId);

		if (!user) {
			throw new AppError({ message: 'User not found', statusCode: 404 });
		}

		res.status(200).json({
			status: 'success',
			data: {
				user,
			},
		});
	}

	async getAllUsers(req: any, res: any) {
		const users = await userService.getAllUsers();

		if (!users) {
			throw new AppError({ message: 'No users found', statusCode: 404 });
		}

		res.status(200).json({
			status: 'success',
			data: {
				users,
			},
		});
	}

	async createNewUser(req: any, res: any) {
		const required = reqValidator(req, [
			'fullName',
			'password',
			'email',
			'role',
		]);
		if (!required.status) {
			throw new AppError({ message: required.message, statusCode: 400 });
		}

		if (
			req.body.role !== 'ADMIN' &&
			req.body.role !== 'SUPER_ADMIN' &&
			req.body.role !== 'MEMBER'
		)
			throw new AppError({
				message: 'please Enter A valid role',
				statusCode: 400,
			});

		// check if email is valid
		if (!UserController.validateEmail(req.body.email)) {
			throw new AppError({ message: 'Invalid email address', statusCode: 400 });
		}
		// check if password is valid
		if (!UserController.validatePassword(req.body.password)) {
			throw new AppError({
				message:
					'Password must be at least 8 characters long and contain at least one number',
				statusCode: 400,
			});
		}

		// check if email exist on user and members
		const existingUser = await userService.findUserbyEmail(req.body.email);
		if (existingUser)
			throw new AppError({
				message: 'user with this email exist',
				statusCode: 409,
			});

		// Hash password
		let hashedPassword;
		try {
			hashedPassword = await AuthService.createHashPassword(req.body.password);
		} catch (err: any) {
			throw new AppError({ message: err.message, statusCode: 500 });
		}

		// create User
		const user = {
			fullName: req.body.fullName,
			email: req.body.email,
			password: hashedPassword,
			role: req.body.role,
		};

		const newMember = await userService.createNewUser(user);

		if (!newMember) {
			throw new AppError({
				message: 'Failed to create new member',
				statusCode: 500,
			});
		}

		(newMember.password as any) = undefined;

		res.status(201).json({
			status: 'success',
			message: `${req.body.role} created successfully`,
			data: {
				member: newMember,
			},
		});
	}
}

const userControllerInstance = new UserController();
export default userControllerInstance;
