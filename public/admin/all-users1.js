const db = firebase.firestore();
// //////////////////////////////

let cvCollections = [];

db.collection("miscellaneous")
  .doc("cvCollections")
  .onSnapshot(async (doc) => {
    cvCollections = await doc.data().cvCollections;

    collectCvData();
  });

// ////////////////////////////////////

async function extractCvs({ collectionName }) {
  return new Promise(async(resolve, reject) => {
    try {
      return await db.collection(collectionName).onSnapshot(async (snaps) => {
        const docs = await snaps.docs;
        await docs.map((doc) => {
          const docData = doc.data();
          DATA.push(docData);
         
          return resolve();
        });
      });
    } catch (error) {
      console.error(error);
      return reject();
    }
  });
}

// ////////////////////////////////////

const DATA = [];
let reTry = 0;
async function collectCvData() {
  // await cvCollections.map(async(collectionName) => {
  let promises = [];
  for (let collectionName of cvCollections) {
    promises.push(extractCvs({ collectionName }));
  }
  await Promise.all(promises);

  // for (let i = 0; i < cvCollections.length; i++) {
  //   let collectionName = cvCollections[i];
  //   console.log(collectionName);
  //   try {
  //     console.log(1);
  //     await extractCvs({collectionName})

  //   } catch (error) {
  //     console.error(error);
  //     if (reTry < 2) {
  //       reTry++;
  //       alert(`Retrying Attempt: ${reTry} Reason: ${error.message}`);
  //     } else {
  //       return {
  //         status: false,
  //         message: `Unable to fetch data. Reason: ${error.message}`,
  //       };
  //     }
  //   }
  // }
  
  displayDataTable();
}

// ////////////////////////////////////

const tableBodyHTML = document.querySelector("#tableBody");
const heading = document.querySelector("#heading");

function displayDataTable() {

  let rows = "";

  
  DATA.map((d) => {
    let allVerticals = "";
    d.verticals.map(v => {
      allVerticals += `, ${v.name}`
    })
    allVerticals = allVerticals.substring(2);

    let allSubVerticals = "";
    d.subVerticals.map(v => {
      // v.sver.map(sv => {
      //   allSubVerticals += `, ${sv}`
      // })
      allSubVerticals += v.sver.join(', ')
    })
  
    // allSubVerticals = allSubVerticals.substring(1, allSubVerticals.length)
  
    let allCategories = "";
    let allValues = "";
  
    d.expertise.map(v => {
      v.svers.map(sv => {
        sv.expertise.map(e => {
          allCategories += `${e.category}, `
          allValues += `${e.value}, `;
        })
      })
    })
    rows += `
    <tr>
      <td class="bs-checkbox">
        <input
          data-index="0"
          name="btSelectItem"
          type="checkbox"
        />
      </td>
      <td>${d.fname} ${d.lname}</td>
      <td>${allVerticals}</td>
      <td>${allSubVerticals}</td>
      <td>${allCategories}</td>
      <td>${allValues}</td>
    </tr>
    `;
  });


      
      tableBodyHTML.innerHTML = rows;
      
      $("#footer").load("footer.html");
  
      
}
  




      
    
    
   


