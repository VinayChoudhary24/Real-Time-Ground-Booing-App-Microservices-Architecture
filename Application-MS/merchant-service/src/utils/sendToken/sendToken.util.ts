import { appConfig } from "../../config/appConfig";

const time = Number(appConfig.cookieExpiresIN) || 1;

// create token and save into cookie
export const sendToken = async (user: any, res: any, statusCode: number) => {
  const token = user.getJWTToken();
  const cookieOptions = {
    expires: new Date(
      Date.now() + time * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({ 
      success: true, 
      response: user, 
      token 
    });
};
