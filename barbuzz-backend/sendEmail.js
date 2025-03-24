// sendEmail.js
const mailjet = require('./mailjet');

async function sendVerificationEmail(toEmail, verificationLink) {
  // This is the structure required by Mailjet's v3.1 API
  const requestBody = {
    Messages: [
      {
        From: {
          Email: 'barbuzzteam@gmail.com', // MUST match the verified sender
          Name: 'BarBuzz Team',
        },
        To: [
          {
            Email: toEmail,
            Name: '', // optional
          },
        ],
        Subject: 'Verify Your Email for BarBuzz',
        TextPart: `Please verify your email by clicking the link: ${verificationLink}`,
        HTMLPart: `
          <p>Welcome to BarBuzz!</p>
          <p>Please verify your email by clicking 
            <a href="${verificationLink}">this link</a>.
          </p>
        `,
      },
    ],
  };

  try {
    const response = await mailjet.post('send', { version: 'v3.1' }).request(requestBody);
    console.log('Mailjet response:', response.body);
    console.log(`Verification email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

module.exports = { sendVerificationEmail };