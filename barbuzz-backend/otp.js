const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory storage for OTPs (for production, store these in a database with an expiration)
const otpStorage = {};

// Function to generate a random 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Function to send OTP to the provided email
async function sendOtp(email) {
  // Only allow Villanova email addresses
  if (!email.endsWith('@villanova.edu')) {
    throw new Error('Invalid email. Please use a Villanova email address.');
  }

  const otp = generateOTP();
  
  // Store the OTP for the email (consider adding an expiration in real-world usage)
  otpStorage[email] = otp;

  // Set up Nodemailer to send OTP via email
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'barbuzzteam@gmail.com', // Replace with your email
      pass: 'barbuzz123', // Replace with your email password
    },
  });

  let mailOptions = {
    from: 'barbuzzteam@gmail.com',
    to: email,
    subject: 'Your OTP for BarBuzz Signup',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  // Send email
  await transporter.sendMail(mailOptions);

  return { message: 'OTP sent successfully!' };
}

// Function to verify OTP
function verifyOtp(email, otp) {
  // Check if OTP matches
  if (otpStorage[email] && otpStorage[email] === otp) {
    delete otpStorage[email]; // Remove OTP after successful verification
    return { message: 'OTP verified successfully!' };
  } else {
    throw new Error('Invalid OTP or OTP expired.');
  }
}

module.exports = { sendOtp, verifyOtp };
