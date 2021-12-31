const admin = require("firebase-admin");
const fs = require('fs');
const moment = require('moment');
let ServiceAccountfileName = process.argv[2]
let collectionName = process.argv[3];
// let subCollection = process.argv[3];
let startDate = process.argv[4]
let endDate = process.argv[5]
let dcName = process.argv[6];
let fileName = process.argv[7]
// const serviceAccount = require("./BJPR/bjprServiceAccountKey.json");
const serviceAccount = require(ServiceAccountfileName);
// You should replace databaseURL with your own
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ionic-firestore-dn.firebaseio.com"
});

let db = admin.firestore();
db.settings({
  timestampsInSnapshots: true
});

let data = [];
data[collectionName] = {};
console.log("fh", startDate, endDate);
let dateStart = moment(startDate, "YYYY-MM-DD")
  .startOf("day")
  .format("x"),
  dateEnd = moment(endDate, "YYYY-MM-DD").endOf("day").format("x");
console.log(typeof dateStart, typeof dateEnd, ServiceAccountfileName, collectionName, fileName);
// let dateStart= startDate,
//   dateEnd =enDate;
let results = db.collection(collectionName)
  // .where("timeStamp", "<=", "1630434599999")

  // // order
  // .where("createdAt", ">=", parseInt(dateStart))
  // .where("createdAt", "<=", parseInt(dateEnd))
  // // PROCUREMENT
  // .where("timeStamp", ">=", dateStart)
  // .where("timeStamp", "<=", dateEnd)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    })
    data.forEach(dt => {
      dt.dcName = dcName
    })
    console.log(data.length);
    return data;
  })

  .catch(error => {
    console.log(error);
  })

results.then(dt => {
  getSubCollection(dt).then(() => {
    // Write collection to JSON file
    // fs.writeFile("./BJPR/bjpr-firestore-export.json", JSON.stringify(data), function(err) {
    fs.writeFile(fileName, JSON.stringify(data), function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  })
})

async function getSubCollection(dt) {
  for (let [key, value] of Object.entries([dt[collectionName]][0])) {
    if (subCollection !== undefined) {
      data[collectionName][key]['subCollection'] = {};
      await addSubCollection(key, data[collectionName][key]['subCollection']);
    }
  }
}

function addSubCollection(key, subData) {
  return new Promise(resolve => {
    db.collection(collectionName).doc(key).collection(subCollection).get()
      .then(snapshot => {
        snapshot.forEach(subDoc => {
          subData[subDoc.id] = subDoc.data();
          resolve('Added data');
        })
      })
  })
}
