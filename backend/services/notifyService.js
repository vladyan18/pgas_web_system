'use strict';

const db = require('./../controllers/dbController');
const nodemailer = require("nodemailer");

const webpush = require('web-push')
webpush.setVapidDetails("https://achieve.spbu.ru",
    "BFfYWgmcjhhOoC9nue978vFsO3t06G3ePJXgDvTIJ8WZ_mSP_VQhnI-oTn6oJSmjFTHkzjyem4UTvXcGHWWj730",
    "e9gl2YUIbBRdSZ_GCJAwo8RwuOHNbDAE1TUfPCnEesQ");

const mailer = createMailer();


function createMessageAboutNewStatus(email, {_id}, {status, achievement, comment, chars}) {
    const message = {};
    let charsString = ''
    for (let i = 0; i < chars.length; i++) {
        charsString += chars[i] + (i !== chars.length - 1 ? ', ' : '');
    }
    const unsubscribeUrl = `https://achieve.spbu.ru/api/unsubscribe_email?key=${_id}&email=${email}`;
    const unsubscribeLink = `<a style="color: grey" href="${unsubscribeUrl}">Отписаться</a>`;

    message.headers = {"List-Unsubscribe": `<${unsubscribeUrl}>`};
    if (status === 'Принято') {
        message.subject = 'Достижение принято! ✔';
        message.html = `<div>
        Достижение было <b>принято</b>. 
        <br/>
        <br/>
        <b>Достижение: </b> ${achievement ? achievement : ''}
        <br/>
        <b>Новый статус: </b> ${status}
        <br/>
        <b>Характеристики: </b> <i>${charsString}</i>
        <br/>
        <br/>
        <a href="https://achieve.spbu.ru">Перейти в систему</a>
        <br/>
        <br/>
        <span style="color: grey">Вы получили это сообщение, так как подписаны на оповещения от Системы достижений СПбГУ.</span>
        <br/>
        ${unsubscribeLink}
        </div>
        `

        message.text = `
        Достижение ${achievement} было принято. 
        
        https://achieve.spbu.ru
        `

    } else if (status === 'Отказано') {
        message.subject = 'Достижение отклонено ❌';
        message.html = `<div>
        Достижение было <b>отклонено</b>. 
        <br/>
        <br/>
        <b>Достижение: </b> ${achievement ? achievement : ''}
        <br/>
        <b>Новый статус: </b> ${status}
        <br/>
        <b>Характеристики: </b> <i>${charsString}</i>
        <br/>
        <b>Комментарий: </b> ${comment}
        <br/>
        <a href="https://achieve.spbu.ru">Перейти в систему</a>
        <br/>
        <br/>
        <span style="color: grey">Вы получили это сообщение, так как подписаны на оповещения от Системы достижений СПбГУ.</span>
        <br/>
        ${unsubscribeLink}
        </div>
        `;

        message.text = `
        Достижение ${achievement} было отклонено. 
        Комментарий: ${comment}
        
        https://achieve.spbu.ru
        
        `;
    }

    return message;
}

const emailQueue = [];
module.exports.notifyUserAboutNewAchieveStatus = async function(userId, achId) {
    const indexInQueue = emailQueue.findIndex(x => x.achId === achId);
    if (indexInQueue > -1) {
        clearTimeout(emailQueue[indexInQueue].timeout);
        emailQueue.splice(indexInQueue, 1);
    }

    const timeout = setTimeout(async () => {
        const [user, userSettings, achievement] = await Promise.all([db.findUserById(userId), db.getNotificationSettings(userId), db.findAchieveById(achId)]);
        if (!userSettings || !achievement) return;

        if (userSettings.email && userSettings.email !== '') {
            const {subject, html, text, headers} = createMessageAboutNewStatus(userSettings.email, user, achievement);
            if (subject && subject !== '') {
                module.exports.sendEmail(userSettings.email, subject, html, text, headers).then().catch();
            }
        }

        const indexInQueue = emailQueue.findIndex(x => x.achId === achId);
        if (indexInQueue > -1) {
            emailQueue.splice(indexInQueue, 1);
        }
    }, 1000*60*10);

    emailQueue.push({achId, timeout});
};

module.exports.sendNotify = async function (userId, title, body) {
    db.getNotificationSettings(userId).then((endpoints) => {
        if (!endpoints || endpoints.length === 0) return;

        const payload = JSON.stringify({
            title: title,
            body: body,
            icon: '/logo_bss_push.png',
            data: {
                url: '/home'
            }
        });

        for (let endpoint of endpoints) {
            db.checkSessionValidity(endpoint.sessionId).then(res => {
                if (!res) return;

                webpush.sendNotification(endpoint.endpoint, payload)
                    .then()
                    .catch(e => console.log(e.stack));
            })
        }
    })
};

module.exports.sendEmail = async function (email, subject, html, text, headers) {
    await mailer.sendMail({
        from: '"Система учета достижений СПбГУ" <achieve.spbu@gmail.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
        headers: headers
    });
};

function createMailer() {
    // create reusable transporter object using the default SMTP transport
   return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'achieve.spbu@gmail.com', // generated ethereal user
            pass: 'pgastest231197', // generated ethereal password
        },
    });
}


