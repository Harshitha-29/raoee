const db = firebase.firestore();
//window.localStorage.removeItem("user");
const USER = undefined;
checkIfAdmin();

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
  return new Promise(async (resolve, reject) => {
    return await db
      .collection(collectionName)
      .get()
      .then(async (snaps) => {
        const docs = await snaps.docs;
        if (docs.length === 0) {
          return resolve();
        }

        return await docs.map((doc) => {
          const docData = doc.data();
          DATA.push(docData);
          return resolve();
        });
      });
  });
}

// ////////////////////////////////////

const DATA = [];
let reTry = 0;
async function collectCvData() {
  let promises = [];
  for (let collectionName of cvCollections) {
    promises.push(extractCvs({ collectionName }));
  }
  Promise.all(promises)
    .then(() => {
      displayDataTable();
    })
    .catch((error) => {
      console.error(error.message);
    });
}

// ////////////////////////////////////

const tableBodyHTML = document.querySelector("#tableBody");
const heading = document.querySelector("#heading");

function displayDataTable() {
  let rows = "";
  let i = 0;
  DATA.map((d) => {
    let allVerticals = "";
    d.verticals.map((v) => {
      allVerticals += `, ${v.name}`;
    });
    allVerticals = allVerticals.substring(2);

    let allSubVerticals = "";
    d.subVerticals.map((v) => {
      // v.sver.map(sv => {
      //   allSubVerticals += `, ${sv}`
      // })
      allSubVerticals += v.sver.join(", ");
    });

    // allSubVerticals = allSubVerticals.substring(1, allSubVerticals.length)

    let allCategories = "";
    let allValues = "";

    d.expertise.map((v) => {
      v.svers.map((sv) => {
        sv.expertise.map((e) => {
          allCategories += `${e.category}, `;
          allValues += `${e.value}, `;
        });
      });
    });

    rows +=
    `<tr>
      <td>${d.fname} ${d.lname}</td>
      <td>${allVerticals}</td>
      <td>${allSubVerticals}</td>
      <td>${allCategories}</td>
      <td>${allValues}</td>
      <td>
      <div class="dropdown">
      <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Actions
      </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="` +
      d.url +
      `" target="_blank">View CV</a>
            <a class="dropdown-item" href="#!" onclick=openProfile("` +
      d.userId +
      `")>View Profile</a>
          <a class="dropdown-item" href="#!" >Edit Profile</a>
          <a class="dropdown-item" href="#!" >Delete Profile</a>
        </div>
        
      </div>
      </td>
    </tr>`;
    i++;
  });

  tableBodyHTML.innerHTML = rows;

  $("#myTable").DataTable();
  $("#exporttable").click(function (e) {
    var table = $("#myTable");
    if (table && table.length) {
      $(table).table2excel({
        exclude: ".noExl",
        name: "Excel Document Name",
        filename:
          "all-users" +
          new Date().toISOString().replace(/[\-\:\.]/g, "") +
          ".xls",
        fileext: ".xls",
        exclude_img: true,
        exclude_links: true,
        exclude_inputs: true,
        preserveColors: false,
      });
    }
  });

  // $("#footer").load("footer.html");
}
