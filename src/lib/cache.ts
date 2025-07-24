import Redis from 'ioredis';
import config from '../config';


class RedisService {
	private readonly redis: Redis;
	private readonly TTL: number;

	constructor() {
		this.redis = new Redis({
			port: parseInt(<string>config.redis.port), // Redis port
			host: config.redis.host, // Redis host
			enableReadyCheck: true,
		})
		this.TTL = 60 * 60 * 60 * 24; // Default TTL of 24 hours

		this.redis.on('error', (err) => {
			console.log("Failed to connect to redis",err);
		})


		this.redis.on("connect", () => {
			console.log("Redis Connected");
		})

		this.redis.on("ready", () => {
			console.log("Redis Ready");
		})
	}

	/**
	 * Get a value from the cache
	 * @param key - Cache key
	 * @returns The cached value or undefined if not found
	 */
	public async get<T>(key: string) {
		return await this.redis.get(key);
	}

	/**
	 * Set a value in the cache
	 * @param key - Cache key
	 * @param value - Value to cache
	 * @param EX
	 * @returns true if successful, false otherwise
	 */
	public async set<T>(key: string, value:string, EX: number = this.TTL) {
		return await this.redis.set(key, JSON.stringify(value), 'EX', EX);
	}


	async delete<T>(key:string) {
		return await this.redis.del(key)
	}

}


const redisService = new RedisService();
export { redisService };