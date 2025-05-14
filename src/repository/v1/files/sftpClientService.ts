import Client from 'ssh2-sftp-client';
import { createPool, Pool } from 'generic-pool';
import dotenv from 'dotenv';
dotenv.config();

interface SftpConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	rootPath: string;
}

interface PoolOptions {
	max?: number;
	min?: number;
	maxRetries?: number;
	retryDelay?: number;
}


function timeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
	let timeoutId: NodeJS.Timeout;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
	});

	return Promise.race([
		promise.then((value) => {
			clearTimeout(timeoutId);
			return value;
		}),
		timeoutPromise,
	]);
}

class SftpConnectionPoolService {
	private readonly config: SftpConfig;
	private readonly pool: Pool<Client>;
	private readonly maxRetries: number;
	private readonly retryDelay: number;

	constructor(options: PoolOptions = {}) {
		this.config = {
			host: process.env.VM_HOST || process.env.SFTP_HOST!,
			port: Number(process.env.VM_PORT || process.env.SFTP_PORT) || 22,
			username: process.env.VM_USERNAME || process.env.SFTP_USER!,
			password: process.env.VM_PASSWORD || process.env.SFTP_PASS!,
			rootPath: process.env.SFTP_ROOT_PATH || process.env.VM_ROOT_PATH!
		};

		console.log("Config for fileserver", this.config);
		this.maxRetries = options.maxRetries ?? 6;
		this.retryDelay = options.retryDelay ?? 500;

		const factory = {
			create: async () => {
				const client = new Client();
				await client.connect({
					host: this.config.host,
					port: this.config.port,
					username: this.config.username,
					password: this.config.password,
					readyTimeout: 60000,
					keepaliveInterval: 30000
				});
				return client;
			},
			destroy: async (client: Client) => {
				await client.end();
			}
		};

		this.pool = createPool<Client>(factory, {
			max: options.max ?? 5,
			min: options.min ?? 1
		});
	}

	private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
		let attempt = 0;
		while (attempt < this.maxRetries) {
			try {
				return await fn();
			} catch (err) {
				attempt++;
				if (attempt >= this.maxRetries) throw err;
				await new Promise((res) => setTimeout(res, this.retryDelay * Math.pow(2, attempt)));
			}
		}
		throw new Error('Retry failed after maximum attempts');
	}

	private async useClient<T>(callback: (client: Client) => Promise<T>): Promise<T> {
		const client = await this.pool.acquire();
		try {
			return await this.retryWithBackoff(() =>
				timeout(callback(client), 30000, 'SFTP operation timed out') // ⏱️ 30s hard timeout
			);
		} finally {
			await this.pool.release(client);
		}
	}

	async listFolders(remotePath: string): Promise<string[]> {
		return this.useClient(async (client) => {
			const absPath = `${this.config.rootPath}${remotePath}`;
			const list = await client.list(absPath);
			return list.map((item) => item.name);
		});
	}

	async createFolder(remotePath: string): Promise<any> {

		return this.useClient((client) => client.mkdir(remotePath, true));
	}


	async uploadFile(localSource: NodeJS.ReadableStream, remotePath: string): Promise<any> {
		return this.useClient((client) => client.put(localSource, remotePath));
	}

	async downloadFile(remotePath: string, localPath: string): Promise<any> {
		return this.useClient((client) => client.get(remotePath, localPath));
	}

	async deleteFileOrFolder(remotePath: string): Promise<any> {
		return this.useClient(async (client) => {
			try {
				await client.delete(remotePath);
			} catch {
				await client.rmdir(remotePath, true);
			}
		});
	}

	async rename(oldRemotePath: string, newRemotePath: string): Promise<any> {
		return this.useClient((client) => client.rename(oldRemotePath, newRemotePath));
	}

	async closePool(): Promise<void> {
		await this.pool.drain();
		await this.pool.clear();
	}
}

const sftpConnectionPoolService = SftpConnectionPoolService;
export default sftpConnectionPoolService;
