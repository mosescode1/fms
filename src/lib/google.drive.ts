import { google } from "googleapis";
import dotenv from "dotenv";

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
