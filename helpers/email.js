const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const path = require("path");

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `Vinicius Baggio <${process.env.EMAIL_FROM}>`;
        this.transporter = this.#newTransport();
    }

    #newTransport() {
        // if (process.env.NODE_ENV === "production") {
        // Sendgrid
        // }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    /**
     * @param {string template
     * @param {string} subject
     * */
    async send(template, subject) {
        const html = pug.renderFile(
            path.join(__dirname, `../views/emails/${template}.pug`),
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            },
        );

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html),
        };

        return await this.transporter.sendMail(mailOptions);
    }

    async sendWelcome() {
        return await this.send("welcome", "Welcome to the Natours family!");
    }

    async sendPasswordReset() {
        return await this.send(
            "passwordReset",
            "Your password reset token (valid for only 10 minutes)",
        );
    }
};
