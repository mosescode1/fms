import ssh from "ssh2"

class StorageService {
   private ssh: ssh.Client;
   private  host: string | undefined;
   private port: number;
   private username: string | undefined;
   private password: string | undefined;


    constructor() {
        this.ssh = new ssh.Client();
        this.host = process.env.VM_HOST || process.env.SFTP_HOST;
        this.port = Number(process.env.VM_PORT || process.env.SFTP_PORT) || 22;
        this.username = process.env.VM_USERNAME || process.env.SFTP_USER;
        this.password = process.env.VM_PASSWORD || process.env.SFTP_PASS;



    }

    async getStorageSize(){
        // Implement logic to get storage size

    }
}