const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const axios = require('axios')

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
    transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
    const msg = {from: config.email.from, to, subject, text};
    await transport.sendMail(msg);
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
  * @param {string} html
 * @returns {Promise}
 */
const sendHtmlEmail = async (to, subject, text, html) => {
    const msg = {from: config.email.from, to, subject, text, html};
    await transport.sendMail(msg);
};


const sendNotification = async (tokens, title, text) => {
    const notification = {title, body: text};
    const key = 'AAAA6Zcatf0:APA91bFWzQ0Fq_71q23gTncK0myhprIyK27Te3JNi4K8MqReJy5xHhj1pb933TbCOQrhoa3N_sdGZJAVQik7dWYnqdUG81SKIWWcMpx00axoz3Tb22CQBSPcWc9I4VOVhYUU-LfygBuN';
    const body = {notification, registration_ids: Array.isArray(tokens) ? tokens : [tokens]};
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `key=${key}`
    }
    try {
	console.log('FCM Body', body, headers);
        const response = await axios.post('https://fcm.googleapis.com/fcm/send', body, {
            headers: headers
        });
	console.log(response.data);
    } catch (e) {
	console.log(e);
    }
};

/**
 * Send welcome email
 * @param {string} to
 * @param {string} link which user will use to reset pass
 * @returns {Promise}
 */
const sendWelcomeEmail = async (to, link) => {
    const subject = 'Welcome To Pianto';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `http://tilaus.pianto.io/reset-password?token=${link}`;
    const welcomeHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>th{height:40px}.t-center{text-align:center}.container{width:50%;margin:30px auto;background:white}@media (max-width: 600px){.container{width:95%;background:white}}hr{margin:30px 10%;color:#1d1d1d;background:#1d1d1d;height:1px}.user-details td{border:none;padding:3px}.card{box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition:0.3s;background:white}.button{background:#a51fff;color:white;border-radius:8px;padding:12px 22px;font-size:16px;border:none}</style></head><body style="background: #eaf0f6"><div class="container" style="padding: 0"><div style="text-align: center;"> <img src="https://cdn2.hubspot.net/hub/9412756/hubfs/pianto%20(3).png?width=1200&upscale=true&name=pianto%20(3).png" style="width: 100%"></div></div><div class="container card"><div style="padding: 25px"><div class="t-center"><h2>Pianto toivottaa sinut tervetulleeksi!</h2><h3>Kiitos rekisteröitymisestä!</h3><h3>Pääset kirjautumaan tilillesi alla olevasta painikkeesta.</h3></div><div class="t-center"> <a href="${resetPasswordUrl}"><button class="button">Minun tilini</button></a></div><hr><div class="t-center"><h3>Kuinka tilaat ensimmäisen virityksesi</h3><h3>1. Mene alla olevan painikkeen avulla tilaus-sivulle</h3><div class="t-center"> <a href="https://tilaus.pianto.io/my-orders"><button class="button">Minun tilini</button></a></div><h3>2. Syötä soittimesi tiedot ja valitse haluamasi palvelut.</h3><h3>3. Varaa itsellesi sopivin ajankohta.</h3><h3>4. Täytä yhteystietosi ja suorita maksu turvallisesti. Virittäjä saapuu luoksesi valittuna ajankohtana.</h3></div><div class="t-center"> <img src="https://cdn2.hubspot.net/hub/9412756/hubfs/pianto.png?width=200&upscale=true&name=pianto.png" alt="" style="width: 100px"></div></div></div></body></html>`
    const text = link.length > 0 ? `Dear user,
  Welcome to pianto.io, you can click this link ${resetPasswordUrl} to generate your password` :
        'Welcome to pianto.io, we welcome you.';

    const welcomeMsg = {to, subject,  text: welcomeHtml};

    // await sendEmail(to, subject , welcomeHtml);

    await sendHtmlEmail(to, subject , text, welcomeHtml);

    console.log('Welcome email should be sent to ', to);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
    const subject = 'Reset password';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `http://tilaus.pianto.io/reset-password?token=${token}`;
    const text = `Dear user,
  To reset your password, click on this link: ${resetPasswordUrl}
  If you did not request any password resets, then ignore this email.`;
    await sendEmail(to, subject, text);
};

module.exports = {
    transport,
    sendEmail,
    sendHtmlEmail,
    sendWelcomeEmail,
    sendResetPasswordEmail,
    sendNotification
};
