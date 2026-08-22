const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendExpenseEmail(toEmail, subject, message) {
  try {
    await transporter.sendMail({
      from: `"Smart Split" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Smart Split ??</h2>
          <p style="color: #444; font-size: 15px;">${message}</p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">You received this because you are a member of a Smart Split group.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

module.exports = { sendExpenseEmail };
