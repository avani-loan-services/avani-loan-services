const nodemailer = require('nodemailer');

/**
 * Sends a simple enquiry email. This implementation uses a placeholder SMTP
 * configuration (host, port, user, pass) that you can replace with real
 * credentials later. The function returns a Promise that resolves when the
 * message is accepted by the transport.
 */
async function sendEnquiryEmail(enquiry) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'placeholder',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'placeholder',
      pass: process.env.SMTP_PASS || 'placeholder',
    },
  });

  const htmlBody = `
    <h3>New Enquiry Received</h3>
    <ul>
      <li><strong>Timestamp:</strong> ${enquiry.timestamp || ''}</li>
      <li><strong>Name:</strong> ${enquiry.name || ''}</li>
      <li><strong>Phone:</strong> ${enquiry.phone || ''}</li>
      <li><strong>Email:</strong> ${enquiry.email || ''}</li>
      <li><strong>Loan Type:</strong> ${enquiry.loanType || ''}</li>
      <li><strong>Amount:</strong> ${enquiry.amount || ''}</li>
      <li><strong>City:</strong> ${enquiry.city || ''}</li>
      <li><strong>Source:</strong> ${enquiry.source || ''}</li>
      <li><strong>Status:</strong> ${enquiry.status || ''}</li>
      <li><strong>AI Call ID:</strong> ${enquiry.aiCallId || ''}</li>
    </ul>
  `;

  const mailOptions = {
    from: `"Avani Eligibility" <${process.env.SMTP_USER || 'no-reply@example.com'}>`,
    to: 'enquiry@avanifinserv.com',
    subject: 'New Eligibility Enquiry',
    html: htmlBody,
  };

  await transporter.sendMail(mailOptions);
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'placeholder') {
    // Graceful no-op in test/serverless when SMTP is unconfigured
    return { success: true, simulated: true };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return await transporter.sendMail({
    from: `"Avani Loan Services" <${process.env.SMTP_USER || 'enquiry@avanifinserv.com'}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEnquiryEmail, sendEmail };
