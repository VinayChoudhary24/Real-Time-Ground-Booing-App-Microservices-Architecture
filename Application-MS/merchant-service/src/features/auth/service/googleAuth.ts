import { OAuth2Client } from 'google-auth-library';
import { appConfig } from '../../../config/appConfig';

// Create OAuth2 client
const oauth2Client = new OAuth2Client(
  appConfig.googleClientId,
  appConfig.googleClientSecret,
  appConfig.googleRedirectUri,
);

// Scopes for Google OAuth
const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

// Generate Google OAuth URL for Frontend
export const generateAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    redirect_uri: appConfig.googleRedirectUri,
  });
};

// 2. utility function to get user info from Google
export const getUserInfoGoogle = async (code: string) => {
  try {
    // Exchange code for tokens and get user info
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Get user information using access token
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`,
    );
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};
