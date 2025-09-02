import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetLink(to: string, userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });

  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Reset your password",
    text: `Click the link to reset your password: ${resetUrl}`,
    html: `<p>Click below to reset your password:</p>
           <p><a href="${resetUrl}">Reset Password</a></p>
           <p>This link will expire in 15 minutes.</p>`,
  });

  return info;
}
