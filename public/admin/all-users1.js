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
const DATA = [];
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
          DATA.push({
            ...docData,
            docId: doc.id,
            collectionName: collectionName,
          });
          return resolve();
        });
      });
  });
}

// ////////////////////////////////////

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

async function deleteProfile(index) {
  const doc = DATA[index];
  const res = confirm("Are you sure to delete the user profile?")
  if(!res){
    return;
  }
  const deleteUserRes = await deleteUser({
    collectionName: doc.userType,
    docId: doc.userId,
  });
  if (!deleteUserRes.status) {
    alert(deleteUserRes.message);
    return;
  }

  const deleteUserCvRes = await deleteCv({
    collectionName: doc.collectionName,
    docId: doc.docId,
  });
  if (!deleteUserCvRes.status) {
    alert(deleteUserCvRes.message);
    return;
  }

  DATA.splice(index, 1);
  document.querySelector(`#user-row-${index}`).remove();

  nowuiDashboard.showNotification(
    "top",
    "center",
    "User Deleted Successfully",
    "primary"
  );
}

// ////////////////////////////////////

let retryDeleteCv = 0;

function deleteCv({ collectionName, docId }) {
  return db
    .collection(collectionName)
    .doc(docId)
    .delete()
    .then(() => {
      
      return {
        status: true,
        message: `User CV deleted successfully.`,
      };
    })
    .catch((error) => {
      console.error(error);
      if (retryDeleteCv < 2) {
        alert(error.message);
        retryDeleteCv++;
        deleteCv({ collectionName, docId });
      } else {
        return {
          status: false,
          message: `Low network, Unable to delete. ${error.message}`,
        };
      }
    });
}

// ////////////////////////////////////

let retryDeleteUser = 0;

async function deleteUser({ collectionName, docId }) {
  try {
    const uRef = await db.collection(`${collectionName}s`).doc(docId);
    const rawData = await uRef.get();
    const uData = await rawData.data();
    uData.cv = {};
    uData.cvAdded = false;
    await uRef.update(uData);
    return {
      status: true,
      message: `User deleted successfully.`,
    };
  } catch (error) {
    console.error(error);
    if (retryDeleteUser < 2) {
      alert(error.message);
      retryDeleteUser++;
      deleteUser({ collectionName, docId });
    } else {
      return {
        status: false,
        message: `Low network, Unable to delete. ${error.message}`,
      };
    }
  }
}

// ////////////////////////////////////

const tableBodyHTML = document.querySelector("#tableBody");
const heading = document.querySelector("#heading");

function displayDataTable() {
  let rows = "";
  let i = 0;
  DATA.map((d, index) => {
    console.log(d);
    let allVerticals = "";
    d.verticals.map((v) => {
      allVerticals += `,${v.name}`;
    });
    allVerticals = allVerticals.substring(1);

    let allSubVerticals = "";
    d.subVerticals.map((v) => {
      // v.sver.map(sv => {
      //   allSubVerticals += `, ${sv}`
      // })
      console.log(v.sver)
      allSubVerticals += `,${v.sver}`;
      console.log(allSubVerticals )
    });
    allSubVerticals = allSubVerticals.substring(1);

    // allSubVerticals = allSubVerticals.substring(1, allSubVerticals.length)

    let allCategories = "";
    let allValues = "";

    d.professions.map((v) => {
      v.svers.map((sv) => {
        sv.profs.map((e) => {
          allCategories += `, ${e.prof}`;
         
        });
      });
    });
    allCategories = allCategories.substring(1);
    allValues = allValues.substring(1);
    rows +=
      `<tr id="user-row-${index}">
      <td>${d.fname} ${d.lname}</td>
      <td>${allVerticals}</td>
      <td>${allSubVerticals}</td>
      <td>${allCategories}</td>
      <td>${d.workCity}</td>
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
          <a class="dropdown-item" href="./edit-employee-profile.html?id=${d.userId}&&utype=${d.userType}" >Edit Profile</a>
          <a class="dropdown-item" href="#!" onclick="deleteProfile(${index})" >Delete Profile</a>
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
