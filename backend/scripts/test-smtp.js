const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.MAIL_HOST;
const port = Number(process.env.MAIL_PORT) || 587;
const user = process.env.MAIL_USERNAME;
const pass = process.env.MAIL_PASSWORD;
const from = process.env.MAIL_FROM || '"Camzy Jobs Security" <info@camzyjobs.com>';

console.log('==============================================');
console.log(' Camzy Jobs - Standalone SMTP Tester');
console.log('==============================================');
console.log('Host    :', host);
console.log('Port    :', port);
console.log('Username:', user);
console.log('Password:', pass ? `${pass.slice(0, 2)}***${pass.slice(-2)} (length: ${pass.length})` : 'MISSING');
console.log('From    :', from);
console.log('----------------------------------------------');

if (!host || !user || !pass) {
  console.error('ERROR: Missing required SMTP environment variables in .env (MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD)');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  logger: true,
  debug: true,
});

async function main() {
  const recipient = process.argv[2] || 'nilesh.choubisa@dexpertsystems.com';

  console.log(`Step 1: Verifying SMTP connection to ${host}:${port}...`);
  try {
    await transporter.verify();
    console.log('✓ SMTP Handshake & Authentication Successful!\n');
  } catch (err) {
    console.error('✗ SMTP VERIFICATION FAILED:');
    console.error(err);
    process.exit(1);
  }

  console.log(`Step 2: Sending test email to ${recipient}...`);
  try {
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject: 'Camzy Jobs SMTP Diagnostics Test',
      text: 'This is a test email sent from Camzy Jobs to verify SMTP functionality.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Camzy Jobs SMTP Test</h2>
          <p>Your SMTP mailer is working properly!</p>
          <p><strong>Recipient:</strong> ${recipient}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });
    console.log('✓ EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    console.log('Response  :', info.response);
  } catch (err) {
    console.error('✗ FAILED TO SEND EMAIL:');
    console.error(err);
    process.exit(1);
  }
}

main();

