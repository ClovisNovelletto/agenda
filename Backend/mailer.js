// mailer.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to, subject, html) {
  try {
    const data = await resend.emails.send({
      from: 'h2u Agenda <no-reply@h2uagenda.com.br>', // pode mudar o domínio depois
      to,
      subject,
      html,
    });
    console.log('E-mail enviado com sucesso:', data);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Falha ao enviar e-mail');
  }
}


/*
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
*/