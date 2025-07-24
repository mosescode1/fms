import dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config({ path: '.env' });

const Config = {
	db: {
		url:
			process.env.NODE_ENV === 'development'
				? ''
				: process.env.DATABASE_URL || '',
	},
	jwt: {
		accessSecretToken:
			process.env.NODE_ENV === 'development'
				? 'Jesusmystrongtowerandmypersonalsavior'
				: process.env.SECRET_KEY_JWT || '',
		refreshSecretToken:
			process.env.NODE_ENV === 'development'
				? 'Jesusismylife2024'
				: process.env.REFRESH_SECRET_KEY_JWT || '',
		expiry:
			process.env.NODE_ENV === 'development'
				? '1d'
				: process.env.SECRET_KEY_JWT_EXPIRES || '1d',
		refreshExpiry:
			process.env.NODE_ENV === 'development'
				? '1d'
				: process.env.REFRESH_SECRET_KEY_JWT_EXPIRES || '1d',
	},
	redis: {
		port: process.env.REDIS_PORT || 6379,
		host: process.env.REDIS_HOST || "localhost"
	},
	port: process.env.PORT || 5000,
	environment: process.env.NODE_ENV || 'development',
};


export default Config;