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

// Set up credentials with refresh token
oauth2Client.setCredentials({
	refresh_token: REFRESH_TOKEN,
});

// Set up token refresh callback
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    // Store the new refresh token if provided
    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token
    });
    console.log('New refresh token received and stored');
  }

  if (tokens.access_token) {
    // Update the access token
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: REFRESH_TOKEN // Keep the existing refresh token
    });
    console.log('Access token refreshed');
  }
});

google.options({ auth: oauth2Client });

// Function to manually refresh the token
export async function refreshAccessToken() {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    console.log('Access token manually refreshed');
    return true;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return false;
  }
}

const googleDrive = google.drive("v3");
export { googleDrive };



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
