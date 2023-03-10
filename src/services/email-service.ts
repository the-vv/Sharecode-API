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
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    return Promise.reject({ message: 'Email Services Temporarily Disabled' })
    await transporter.sendMail(mailOptions);
};
