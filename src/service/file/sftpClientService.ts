import Client, {FileInfo} from 'ssh2-sftp-client';
import dotenv from "dotenv";
dotenv.config();


const VM_HOST="67.211.214.50";
const VM_PORT=6942
const VM_USERNAME="Administrator"
const VM_PASSWORD="*%G#5cJq"

class SftpClientService {
 private sftp: Client;
 private readonly host: string | undefined;
 private readonly port: number
 private readonly username: string | undefined
 private readonly  password: string | undefined
 private readonly rootPath: string | undefined

  private envCheck = () => {
    if (!process.env.VM_HOST && !process.env.SFTP_HOST) {
      throw new Error('VM_HOST or SFTP_HOST environment variable is required');
    }

    if (!process.env.VM_USERNAME && !process.env.SFTP_USER) {
      throw new Error('VM_USERNAME or SFTP_USER environment variable is required');
    }
    if (!process.env.VM_PASSWORD && !process.env.SFTP_PASS) {
      throw new Error('VM_PASSWORD or SFTP_PASS environment variable is required');
    }
  }

  constructor() {
    // this.envCheck();
    this.sftp = new Client()

    // TODO : Uncomment the following lines to use environment variables for production
    // this.host = process.env.VM_HOST || process.env.SFTP_HOST;
    // this.port = Number(process.env.VM_PORT || process.env.SFTP_PORT) || 22;
    // this.username = process.env.VM_USERNAME || process.env.SFTP_USER;
    // this.password = process.env.VM_PASSWORD || process.env.SFTP_PASS;

    // this is for testing purposes only
    this.host = VM_HOST;
    this.port = VM_PORT;
    this.username = VM_USERNAME;
    this.password = VM_PASSWORD;
    this.rootPath = "C:";
  }

  private async _connect() {
    await this.sftp.connect({
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      readyTimeout: 60000,
      keepaliveInterval: 30000
    });
    console.log(`Connected to ${this.host} on rootPath ${this.rootPath}`);
  }

  private async _safeEnd(isOperationSuccess:boolean) {
    try {
      await this.sftp.end();
    } catch (endErr: any) {
      if (endErr && endErr.message && endErr.message.includes('ECONNRESET')) {
        if (isOperationSuccess) {
        } else {
          throw endErr;
        }
      } else {
        if (!isOperationSuccess) {
          throw endErr;
        }
      }
    }
  }

  async  listFolders(remotePath:string) {
    let folders: string[] = [];
    try {
      await this._connect()
      const absPath = this.rootPath ? `${this.rootPath}${remotePath}` : remotePath;
      const list = await this.sftp.list(absPath);
      folders = list.map((item) => item.name);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error:any) {
      throw new Error(`Error listing folders on VM: ${error.message}`);
    } finally {
      await this._safeEnd(folders.length > 0);
    }
    return folders;
  }

  async createFolder(remotePath?:string) {
    let folderCreated = false;
    try {
      await this._connect();
      if (remotePath) {
        await this.sftp.mkdir(remotePath, true);
      }
      folderCreated = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error:any) {
      throw new Error(`Error creating folder on VM: ${error.message}`);
    } finally {
      await this._safeEnd(folderCreated);
    }
  }


  async uploadFile(localSource:string, remotePath:string) {
    let uploaded = false;
    try {
      await this._connect();
      await this.sftp.put(localSource, remotePath);
      uploaded = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error:any) {
      throw new Error(`Error uploading file to VM: ${error.message}`);
    } finally {
      await this._safeEnd(uploaded);
    }
  }

  async downloadFile(remotePath: string, localPath:string) {
    let downloaded = false;
    try {
      await this._connect();
      await this.sftp.get(remotePath, localPath);
      downloaded = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error:any) {
      throw new Error(`Error downloading file from VM: ${error.message}`);
    } finally {
      await this._safeEnd(downloaded);
    }
  }

  async deleteFileOrFolder(remotePath:string) {
    let deletedSomething = false;
    try {
      await this._connect();
      await this.sftp.delete(remotePath);
      deletedSomething = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (fileErr) {
      try {
        await this.sftp.rmdir(remotePath, true);
        deletedSomething = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (folderErr:any) {
        throw new Error(`Error deleting path on VM: ${folderErr.message}`);
      }
    } finally {
      await this._safeEnd(deletedSomething);
    }
  }
  async rename(oldRemotePath:string, newRemotePath:string) {
    let renamed = false;
    try {
      await this._connect();
      await this.sftp.rename(oldRemotePath, newRemotePath);
      renamed = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error:any) {
      throw new Error(`Error renaming on VM: ${error.message}`);
    } finally {
      await this._safeEnd(renamed);
    }
  }
}

const sftpClientService = new SftpClientService();
export default sftpClientService;