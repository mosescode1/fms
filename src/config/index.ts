import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const Config = {
	db: {
		url:
			process.env.NODE_ENV === 'development'
				? ''
				: process.env.DATABASE_URL || '',
	},
	redis: {
		url:
			process.env.NODE_ENV === 'development'
				? 'redis://localhost:6379'
				: process.env.REDIS_URL || '',
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
	port: process.env.PORT || 5000,
	environment: process.env.NODE_ENV || 'development',
};


export default Config;