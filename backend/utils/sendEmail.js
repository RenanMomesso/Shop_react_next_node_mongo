const nodemailer = require('nodemailer');

const sendEmail = async options => {

    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        port: 587, // port for secure SMTP
        auth: {
            user: 'renan_momesso@hotmail.com',
            pass: '986080abc'
        }
    });
    const message = {
        from:`renan_momesso@hotmail.com`,
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    await transporter.sendMail(message)
}

module.exports = sendEmail