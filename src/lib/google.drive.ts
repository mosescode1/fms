import {drive_v3, google} from "googleapis";
// import path from "path"
import dotenv from "dotenv";
// import { JWT } from "google-auth-library";

// Load environment variables
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRETS = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL || "";
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || "";

if (!CLIENT_ID || !CLIENT_SECRETS || !REDIRECT_URL || !REFRESH_TOKEN) {
  console.error("Google Drive API credentials are missing in environment variables");
}

const oauth2Client = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRETS,
	REDIRECT_URL
);

oauth2Client.setCredentials({
	refresh_token: REFRESH_TOKEN,
});

google.options({ auth: oauth2Client });


const googleDrive = google.drive("v3");
export  { googleDrive};



// const auth = new google.auth.GoogleAuth({
// 	keyFile: path.join(__dirname, "service.json"),
// 	scopes: ["https://www.googleapis.com/auth/drive"],
// });
//
//
// const drive: Promise<drive_v3.Drive> = (async () => {
// 	const authClient = (await auth.getClient()) as JWT;
// 	return  google.drive({ version: "v3", auth: authClient });
// })();
//
// let googleDrive ;
// (async () => {
// 	googleDrive = await drive;
// })()
//
// export { googleDrive };