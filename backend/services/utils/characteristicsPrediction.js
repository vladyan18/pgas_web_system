const db = require('../../dataLayer');
const natural = require('natural');

const plainEK3Crits = [];
let roots = [];
function getCrit(crits, arr) {
    const critNames = Object.keys(crits);

    if (!isNaN(crits[critNames[0]])) {
        plainEK3Crits.push(arr);
        return;
    }

    for (const key of critNames) {
        getCrit(crits[key], [...arr, key]);
    }
}


const classifiers = {};
async function initClassifier(plainCrits, facultyName) {
    const users = await db.getCompletelyAllUsersAchievements(facultyName);
    const classifier = new natural.BayesClassifier(natural.PorterStemmerRu);
    plainCrits.forEach((x, index) => classifier.addDocument(x, index));
    let count = 0;
    for (const user of users) {
        if (!user.Achievement) continue;
        for (const ach of user.Achievement) {
            let str = '';
            for (let i = 0; i < ach.chars.length; i++) {
                str += ' ' + ach.chars[i];
            }
            const id = plainCrits.indexOf(str);
            if (id === -1 || !ach.achievement || ach.achievement.length === 0) continue;
            count += 1;
            classifier.addDocument(ach.achievement, id);
        }
    }

    console.log(facultyName, 'COUNT:', count);
    classifier.train();
    classifiers[facultyName] = [null, classifier];
}

async function initAllClassifiers(facultiesList) {
    const crit = await db.getCriteriasObject('ПМ-ПУ');
    roots = Object.keys(crit);
    getCrit(crit, []);
    const plainCrits = plainEK3Crits.map((x) => {
        let str = '';
        for (let i = 0; i < x.length; i++) {
            str += ' ' + x[i];
        }
        return str;
    });
    facultiesList.forEach((fac) => initClassifier(plainCrits, fac).then());
}

initAllClassifiers(['ПМ-ПУ']).then();

module.exports.classify = function(description, faculty) {
    if (!classifiers[faculty]) return undefined;
    return { root: null, classifier: plainEK3Crits[Number(classifiers[faculty][1].classify(description))] };
};
