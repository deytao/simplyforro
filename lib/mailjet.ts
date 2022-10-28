import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
    apiKey: process.env.EMAIL_SERVER_USER,
    apiSecret: process.env.EMAIL_SERVER_PASSWORD
});


const sender = async (messages: any) => {
    return mailjet
        .post("send", { version: "v3.1" })
        .request({
            Globals: {
                From: {
                    Email: process.env.EMAIL_FROM,
                    Name: "SimplyForró",
                },
            },
            Messages: messages,
        })
        .then((result) => {
            console.log("success")
        })
        .catch((err) => {
            console.log(err)
        });
}


export const sendEmail = async (recipient: string, subject: string, text: string, html: string) => {
    return await sender([
        {
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


export const sendBulkEmails = async (template_id: number, recipients: string[], data: any | undefined = {}) => {
    return await sender([
        {
            TemplateID: template_id,
            TemplateLanguage: true,
            //TemplateErrorReporting: {
                //Email: "",
                //Name: "Admin",
            //},
            To: [...recipients.map((recipient) => { return {Email: recipient}})],
            Variables: {
                ...data,
                base_url: process.env.BASE_URL,
            },
        },
    ])
}
