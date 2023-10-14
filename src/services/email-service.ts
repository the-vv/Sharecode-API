import nodeMailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendPasswordResetEmail = async (email: string, token: string, userId: string) => {

    const mailOptions: Mail.Options = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            ${process.env.UI_PASSWORD_RESET_URL}/${userId}/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #06070A; text-align: center; padding: 50px; color: #ffffff;">
            <table style="max-width: 600px; margin: 0 auto; background-color: #121821; border-radius: 1rem; padding: 20px; box-shadow: 0 0 0px rgba(255, 255, 255, 0.1);">
                <tr>
                    <td style="text-align: center;">
                        <h1 style="margin-bottom: 20px; color: #CED0D4;"> &lt;ShareCode/&gt; </h1>
                        <!-- <img src="https://yourlogo.com/logo.png" alt="Your Logo" width="150"> -->
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px;">
                        <h2 style="font-size: 24px; margin-bottom: 20px; color: #CED0D4;">Forgot Your Password?</h2>
                        <p style="font-size: 16px; color: #aaaaaa;">To reset your password, click the button below:</p>
                        <a href="${process.env.UI_PASSWORD_RESET_URL}/${userId}/${token}" style="background-color: #049F8D; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 20px; font-size: 16px;">Reset Password</a>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; padding-top: 20px;">
                        <p style="font-size: 14px; color: #aaaaaa;">Contact our team at <a href="mailto:sharecodeapp@gmail.com" style="color: #007BFF;">sharecodeapp@gmail.com</a></p>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #aaaaaa; margin-top: 20px;">&copy; 2023 ShareCode. All rights reserved.</p>
        </body>
        </html>
        `
    };
    // return Promise.reject({ message: 'Email Services Temporarily Disabled' })
    await transporter.sendMail(mailOptions);
};
