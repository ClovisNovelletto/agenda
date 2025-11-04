// mailer.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // seu e-mail Gmail
    pass: process.env.MAIL_PASS, // senha de app, não a senha normal
  },
});

export async function sendMail(to, subject, html) {
  await transporter.sendMail({
    from: `"h2u Agenda" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}
