const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //1 Create a transporter, setup the sending service

    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    });
    

    //Define the email options 
    const mailOptions = {
        from: 'Jonas Schemdtmann <hello@jonas.io>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        // html:
    };

    //Actually send the mail

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;