const db = firebase.firestore();
// //////////////////////////////

let cvCollections = [];

db.collection('miscellaneous').doc('cvCollections').onSnapshot(snaps => {
  const docs = snaps.docs;
  // cvCollections.length = 0;

  docs.map(doc => {
    cvCollections = doc.data().cvCollections;

  })
  extractCvData();
})

// ////////////////////////////////////

let DATA = [];

function extractCvData() {
  cvCollections.map(c => {
    
  })
}

// ////////////////////////////////////

