const nodemailer = require("nodemailer");

/**
 * @typedef {Object} EmailOptions
 * @property {string} [from] - email address of sender
 * @property {string} to - email address of recipient
 * @property {string} subject - subject of email
 * @property {string} text - plain text version of email
 * @property {string} [html] - html version of email
 * */

/**
 * @param {EmailOptions} emailOptions
 * */
const sendEmail = async (emailOptions) => {
    emailOptions.from = emailOptions.from || process.env.EMAIL_FROM;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: emailOptions.from,
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
