const nodemailer = require('nodemailer')
const development = require('config')
const ejs = require('ejs')
import path from "path";
import axios from "axios";

const sendMailOTP = (to: string, subject: string, message: string, otp: any) => {
    var smtpConfig = {
        host: "smtp.mailtrap.io",
        port: 2525,
        secure: false, // use SSL
        auth: {
            user: development.MAIL_USER,
            pass: development.MAIL_PASSWORD
        }
    };

    var transporter = nodemailer.createTransport(smtpConfig);
    const url_path = path.join(__dirname, '/views/emailsend.ejs')
    ejs.renderFile(url_path, { otp: otp, message: message }, async function (err: any, data: any) {
        if (err) {
            console.log(err);
        } else {
            const mailOptions = {
                from: development.MAIL_USER,
                to: to,
                subject: subject,
                html: data
            };

            await transporter.sendMail(mailOptions, function (error: any, info: any) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    })
};

const verifyMail = (to: string, subject: string, text_body: string, sender: string, otp: any, message: string) => {
    const url_path = path.join(__dirname, '/views/emailsend.ejs')

    ejs.renderFile(url_path, { otp: otp, message: message }, async function (err: any, data: any) {
        axios({
            method: 'post',
            url: 'https://api.smtp2go.com/v3/email/send',
            data: {
                api_key: "api-F66EF9760CA211EDAE01F23C91BBF4A0",
                to: [to],
                sender: "BeemZ <norepy@zeemz.com>",
                subject: subject,
                text_body: text_body,
                html_body: data,
                custom_headers: [
                    {
                        "header": "Reply-To",
                        "value": "Beemz <norepy@zeemz.com>"
                    }
                ]
            }
        })
    })
}

export default { sendMailOTP, verifyMail };
