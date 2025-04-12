"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
class SftpClientService {
    constructor() {
        this.envCheck = () => {
            if (!process.env.VM_HOST && !process.env.SFTP_HOST) {
                throw new Error('VM_HOST or SFTP_HOST environment variable is required');
            }
            if (!process.env.VM_USERNAME && !process.env.SFTP_USER) {
                throw new Error('VM_USERNAME or SFTP_USER environment variable is required');
            }
            if (!process.env.VM_PASSWORD && !process.env.SFTP_PASS) {
                throw new Error('VM_PASSWORD or SFTP_PASS environment variable is required');
            }
        };
        this.envCheck();
        this.sftp = new ssh2_sftp_client_1.default();
        this.host = process.env.VM_HOST || process.env.SFTP_HOST;
        this.port = Number(process.env.VM_PORT || process.env.SFTP_PORT) || 22;
        this.username = process.env.VM_USERNAME || process.env.SFTP_USER;
        this.password = process.env.VM_PASSWORD || process.env.SFTP_PASS;
        this.rootPath = "F:";
    }
    _connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sftp.connect({
                host: this.host,
                port: this.port,
                username: this.username,
                password: this.password,
                readyTimeout: 60000,
                keepaliveInterval: 30000
            });
            console.log(`Connected to ${this.host} on rootPath ${this.rootPath}`);
        });
    }
    _safeEnd(isOperationSuccess) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sftp.end();
            }
            catch (endErr) {
                if (endErr && endErr.message && endErr.message.includes('ECONNRESET')) {
                    if (isOperationSuccess) {
                    }
                    else {
                        throw endErr;
                    }
                }
                else {
                    if (!isOperationSuccess) {
                        throw endErr;
                    }
                }
            }
        });
    }
    listFolders(remotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let folders = [];
            try {
                yield this._connect();
                const absPath = this.rootPath ? `${this.rootPath}${remotePath}` : remotePath;
                const list = yield this.sftp.list(absPath);
                folders = list.map((item) => item.name);
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                throw new Error(`Error listing folders on VM: ${error.message}`);
            }
            finally {
                yield this._safeEnd(folders.length > 0);
            }
            return folders;
        });
    }
    createFolder(remotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let folderCreated = false;
            try {
                yield this._connect();
                yield this.sftp.mkdir(remotePath, true);
                folderCreated = true;
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                throw new Error(`Error creating folder on VM: ${error.message}`);
            }
            finally {
                yield this._safeEnd(folderCreated);
            }
        });
    }
    uploadFile(localSource, remotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let uploaded = false;
            try {
                yield this._connect();
                yield this.sftp.put(localSource, remotePath);
                uploaded = true;
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                throw new Error(`Error uploading file to VM: ${error.message}`);
            }
            finally {
                yield this._safeEnd(uploaded);
            }
        });
    }
    downloadFile(remotePath, localPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let downloaded = false;
            try {
                yield this._connect();
                yield this.sftp.get(remotePath, localPath);
                downloaded = true;
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                throw new Error(`Error downloading file from VM: ${error.message}`);
            }
            finally {
                yield this._safeEnd(downloaded);
            }
        });
    }
    deleteFileOrFolder(remotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let deletedSomething = false;
            try {
                yield this._connect();
                yield this.sftp.delete(remotePath);
                deletedSomething = true;
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (fileErr) {
                try {
                    yield this.sftp.rmdir(remotePath, true);
                    deletedSomething = true;
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                }
                catch (folderErr) {
                    throw new Error(`Error deleting path on VM: ${folderErr.message}`);
                }
            }
            finally {
                yield this._safeEnd(deletedSomething);
            }
        });
    }
    rename(oldRemotePath, newRemotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let renamed = false;
            try {
                yield this._connect();
                yield this.sftp.rename(oldRemotePath, newRemotePath);
                renamed = true;
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                throw new Error(`Error renaming on VM: ${error.message}`);
            }
            finally {
                yield this._safeEnd(renamed);
            }
        });
    }
}
const instance = new SftpClientService();
//# sourceMappingURL=sftpClientService.js.map