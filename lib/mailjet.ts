import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
    apiKey: process.env.EMAIL_SERVER_USER,
    apiSecret: process.env.EMAIL_SERVER_PASSWORD
});


const sender = (messages: any) => {
  return mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: messages,
    })
    .then((result) => {
        console.log(result)
    })
    .catch((err) => {
        console.log(err)
    });
}


export const sendEmail = async (recipient: string, subject: string, text: string, html: string) => {
    return sender([
        {
            From: {
                Email: "no-reply@simplyforro.dance",
                Name: "SimplyForró",
            },
            To: [
                {
                    Email: recipient,
                },
            ],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
        },
    ])
}


export const sendBulkEmails = async (recipients: string[], subject: string, text: string, html: string) => {
    return sender([
        {
            From: {
                Email: "no-reply@simplyforro.dance",
                Name: "SimplyForró",
            },
            To: [...recipients.map((recipient) => { return {Email: recipient}})],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
        },
    ])
}
