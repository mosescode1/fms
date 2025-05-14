import { google } from "googleapis";

const CLIENT_ID = "91882017575-p341q9fnapvmjqtfsfj5l0gacsc9em3k.apps.googleusercontent.com";
const CLIENT_SECRETS = "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";
const REDIRECT_URL = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//040Bgs82Jicu1CgYIARAAGAQSNwF-L9Ir0K5g3rCu-DdMQ_SnfOnPk95AdVaamDALXpEoAX4lk3Khq6T-aY3epo6ljrxih0Ury20"


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