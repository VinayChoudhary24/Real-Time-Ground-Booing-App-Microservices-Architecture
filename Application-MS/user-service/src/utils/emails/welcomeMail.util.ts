import nodemailer from "nodemailer";
import { appConfig } from "../../config/appConfig/app.config";

export const sendWelcomeEmail = async (user: any) => {
  const transporter = nodemailer.createTransport({
    service: appConfig.smtp_service,
    auth: {
      user: appConfig.defi_smtp_mail,
      pass: appConfig.defi_smtp_mail_pass,
    },
  });

  const mailOptions = {
    from: process.env.STORFLEET_MAIL,
    to: user.email,
    subject: "Welcome to DEFI!",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  text-align: center;
              }
              .logo {
                  max-width: 150px;
              }
              .content {
                  margin-top: 20px;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #20d49a;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 5px;
              }
              @media only screen and (max-width: 600px) {
                  .container {
                      padding: 10px;
                  }
                  .logo {
                      max-width: 100px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img class="logo" src="https://files.codingninjas.in/logo1-32230.png" alt="DEFI Logo">
                  <h1>Welcome to DEFI!</h1>
              </div>
              <div class="content">
                  <p>Hello, ${user.name}</p>
                  <p>We're thrilled to have you on board. Your account has been created successfully.</p>
                  <p>Start exploring and make the most out of our platform!</p>
                  <p>If you have any questions, feel free to reach out to our support team.</p>
                  <p>Happy journey with DEFI! 🎉</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
