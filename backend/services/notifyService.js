const db = require('./../controllers/dbController');
const webpush = require('web-push')
webpush.setVapidDetails("https://achieve.spbu.ru",
    "BFfYWgmcjhhOoC9nue978vFsO3t06G3ePJXgDvTIJ8WZ_mSP_VQhnI-oTn6oJSmjFTHkzjyem4UTvXcGHWWj730",
    "e9gl2YUIbBRdSZ_GCJAwo8RwuOHNbDAE1TUfPCnEesQ");


module.exports.sendNotify = async function (userId, title, body) {
    db.getNotificationEndpoints(userId).then((endpoints) => {
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