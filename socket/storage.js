const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


module.exports.registerSensor = async function (address) {

  const docRef = db.collection('sensors').doc(address);

  const sensor = {
    address: address,
    date: Date.now(),
  }

  await docRef.get().then((snapshotDoc)=> {
    if (!snapshotDoc.exists)
      docRef.set(sensor);
    else
      docRef.update(sensor);
  })
}

module.exports.registerButtonEvent = async function (address, event) {

  const docRefGameInProgress = db.collection('escapeGame');
  docRefGameInProgress.get().then((value) => {
     value.forEach((snap) => {
       console.log(snap.data().gameInProgress);
     })
  });
  if (false) {
    const docRef = db.collection('currentGame/buttonEvents').doc(address);

    const button = {
      address: address,
      color: event.color,
      date: Date.now(),
      event: event,
    }

    await docRef.get().then((snapshotDoc)=> {
      if (!snapshotDoc.exists)
        docRef.set(button);
      else
        docRef.update(button);
    })
  }
}

module.exports.registerSample = async function (address, sample) {

  const docRef = db.collection('sensors').doc(address)
    .collection('samples').doc(Date.now().toString());

  const data = {
    value: sample,
    date: Date.now(),
  }
  await docRef.set(data);


}

module.exports.listSensors = function () {

  const docRef = db.collection('sensors');

  return docRef.get()

}

module.exports.observeLaunchingGame = function (func) {

  const docRef = db.collection('currentGame').doc('state');

  return docRef.onSnapshot((snapshot) => {
    if (snapshot.data().gameInProgress) {
      func();
    }
  })
}

module.exports.isGameInProgress = function () {

  const docRef = db.collection('currentGame').doc('state');
  let isGameInProgress;
  docRef.get().then((snapshot) => {
    isGameInProgress = snapshot.data().gameInProgress;
  })
  return isGameInProgress
}

module.exports.switchGameInProgressToFalse = function () {

  const docRef = db.collection('currentGame').doc('state');
  docRef.update({
    gameInProgress: false,
  })
}

module.exports.registerColorSequence = async function () {
  const listColorSequence = [];
  for (let i = 0; i < 6; i++) {
    listColorSequence.push(getRandomColor())
  }
  await db.collection('currentGame').doc('active_buttons').update({
    "buttonList": ["", "", "", "", "", ""]
  });
  await db.collection('currentGame').doc('soluce').update({
    "buttonList": listColorSequence
  });
}

module.exports.addColorToSequence = async function (color, triggerCommands) {
  const docRefActiveButtons = db.collection('currentGame').doc('active_buttons');
  const docRefSoluce = db.collection('currentGame').doc('soluce');

  await docRefActiveButtons.get().then((snapshot) => {
    console.log(snapshot.data().buttonList);
    const buttonList = snapshot.data().buttonList;
    const index = buttonList.indexOf("");
    buttonList[index] = color;
    console.log("buttonList", buttonList);
    docRefActiveButtons.update({
      "buttonList": buttonList
    });
    if (buttonList[5] !== "") {
      docRefSoluce.get().then((snapshot) => {
        const soluce = snapshot.data().buttonList;
        if (buttonList.toString() === soluce.toString()) {
          docRefSoluce.update({
            "buttonList": ["", "", "", "", "", ""]
          });
          triggerCommands();
        }
        docRefActiveButtons.update({
          "buttonList": ["", "", "", "", "", ""]
        });
      })
    }
  });
}

function getRandomColor() {
  const colors = ['Rouge', 'Bleu', 'Jaune', 'Noir', 'Blanc'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
