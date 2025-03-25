// sendEmail.js
const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

async function sendVerificationEmail(toEmail, verificationLink) {
  // This is the structure required by Mailjet's v3.1 API
  const requestBody = {
    Messages: [
      {
        From: {
          Email: 'noreply@barbuzz.co', // MUST match the verified sender
          Name: 'BarBuzz Team',
        },
        To: [{ Email: toEmail }],
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

  // 2) Pass requestBody to mailjet
  const response = await mailjet
  .post('send', { version: 'v3.1' })
  .request(requestBody);

  console.log('Mailjet response:', response.body);

}

module.exports = { sendVerificationEmail };