import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function sendEmailOtp(email: string, code: string) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your LOKUS login OTP",
    html: `<p>Your OTP is <b>${code}</b>. It expires in 5 minutes.</p>`,
  });
}

export async function sendMobileOtp(mobile: string, code: string) {
  console.info(`Mobile OTP for ${mobile}: ${code}`);
}
