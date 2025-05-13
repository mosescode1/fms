import { google } from "googleapis";

const CLIENT_ID = "155876490592-m2usspr95vqe4d421dak3ca5ftvpnchu.apps.googleusercontent.com";
const CLIENT_SECRETS = "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";
const REDIRECT_URL = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04ZEdbpogqtiACgYIARAAGAQSNwF-L9IraV0Ey_T81XRjk853ze773aTeHJ4jMkBLd1OsRfBnbhtxvix643Zf9EY-D99NrLeQKKM";


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