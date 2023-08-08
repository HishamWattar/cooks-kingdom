// Write your util function here
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.USER_EMAIL, // generated ethereal user
    pass: process.env.USER_PASSWORD, // generated ethereal password
  },
});

const sendApprovalEmail = (adminEmail, userId) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
          }

          h1 {
            color: #333;
            font-size: 24px;
          }

          p {
            color: #555;
            font-size: 16px;
          }

          .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 14px 20px;
            border: none;
            text-decoration: none;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
          }

          .btn:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <h1>Approval Needed: New Chef Request</h1>
        <p>Hello Admin,</p>
        <p>A user has requested to become a chef on our platform. Please review the request and approve it if appropriate.</p>
        <p>To approve the user, click the button below:</p>
        <a href="http://localhost:3000/api/admin/user/approve-chef/${userId}" class="btn">
          Approve
        </a>
        <p>If you have any questions or need further information, please contact our support team.</p>
        <p>Thank you!</p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: adminEmail,
    subject: 'Chef Request Approval Needed',
    html: htmlContent,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Email sent successfully: ${info.response}`);
    }
  });
};

const sendChefWelcomeEmail = (chefEmail) => {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: chefEmail,
    subject: 'Welcome to Our Platform as a Chef',
    text: `Dear Chef,\n\nWe are delighted to welcome you to our platform. You have been approved as a chef. Start showcasing your culinary skills and delight our customers with your delicious creations.\n\nBest regards,\nThe Admin Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Email sent successfully: ${info.response}`);
    }
  });
};

const sendSignUpWelcomeEmail = (email, firstName) => {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: 'Welcome to Our Platform!',
    text: `Dear ${firstName},\n\nWe are delighted to welcome you to our platform.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Email sent successfully: ${info.response}`);
    }
  });
};

module.exports = {
  sendApprovalEmail,
  sendChefWelcomeEmail,
  sendSignUpWelcomeEmail,
};
