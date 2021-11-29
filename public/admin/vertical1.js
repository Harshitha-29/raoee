const db = firebase.firestore();

const USER = undefined;
checkIfAdmin();

const VERTICALS = [];
const allVerticalsHTML = document.querySelector("#allVerticals");
const allSubVerticalsHTML = document.querySelector("#allSubVerticals");
const verticalsDropdownHTML = document.querySelector("#verticalsDropdown");

// //////////////////////////////////////////

db.collection("verticals").onSnapshot((snaps) => {
  const docs = snaps.docs;
  VERTICALS.length = 0;
  verticalsDropdownHTML.innerHTML = "";
  docs.map((doc) => {
    if (!doc) {
      return;
    }
    const docData = doc.data();
    VERTICALS.push({ name: docData.name, subVerticals: docData.subVerticals });
    verticalsDropdownHTML.innerHTML += `<option value="${docData.name}">${docData.name}</option>`;
  });
  // console.log(verticalsDropdownHTML);
  verticalsDropdownHTML.classList.add("selectpicker");

  displayAllVericals();
  displaySubVerticals();
});

// //////////////////////////////////////////

function displayAllVericals() {
  if (VERTICALS.length === 0) {
    allVerticalsHTML.innerHTML = ` <p>No Vertical Added</p>`;
    return;
  }

  allVerticalsHTML.innerHTML = ``;
  allVerticalsHTML.innerHTML = ` <ul>`;

  VERTICALS.map((ver) => {
    allVerticalsHTML.innerHTML += `
    <li>
      ${ver.name}
      <span  onclick="deleteVertical('${ver.name}')" >
      <i
        class="now-ui-icons ui-1_simple-remove"
        aria-hidden="true"
        style="cursor: pointer;"
      ></i>
      </span>
    </li>
    `;
  });

  allVerticalsHTML.innerHTML += ` </ul>`;
}
displayAllVericals();

// //////////////////////////////////////////

function displaySubVerticals() {
  if (VERTICALS.length === 0) {
    allSubVerticalsHTML.innerHTML = ` <p>No Vertical Added</p>`;
    return;
  }

  allSubVerticalsHTML.innerHTML = ``;
  allSubVerticalsHTML.innerHTML = ` <div>`;

  VERTICALS.map((ver, verIndex) => {
    allSubVerticalsHTML.innerHTML += `<p style="font-weight: bolder;">For ${ver.name}</p><ul>`;
    let counter = 0;
    ver?.subVerticals.map((subVer) => {
      allSubVerticalsHTML.innerHTML += `
      <li>
        ${subVer}
        <span onclick="deleteSubVertical('${ver.name}',' ${subVer}')">
        <i
          class="now-ui-icons ui-1_simple-remove"
          aria-hidden="true"
          style="cursor: pointer;"
        ></i>
        </span>
      </li>`;
      counter++;
    });
    allSubVerticalsHTML.innerHTML += `</ul>`;
    if (counter === 0) {
      allSubVerticalsHTML.innerHTML += `
      <li><i> No SubVertical Added </i></li>
      `;
    }
  });

  allSubVerticalsHTML.innerHTML += ` </div>`;
}
displaySubVerticals();

// //////////////////////////////////////////

const verticalFormHTML = document.querySelector("#verticalForm");

const addVertical = async (e) => {
  e.preventDefault();
  const name = verticalFormHTML["name"].value;
  const id = verticalFormHTML["id"].value;

  try {
    await db.collection("verticals").doc(name).set({
      name: name,
      _id: id,
      subVerticals: [],
    });
    nowuiDashboard.showNotification(
      "top",
      "center",
      "Vertical Added Successfully",
      "primary"
    );
    verticalFormHTML.reset();
  } catch (error) {
    console.error(error);
    nowuiDashboard.showNotification(
      "top",
      "center",
      "Some Error Occured ! try again",
      "red"
    );
  }
};

verticalFormHTML.addEventListener("submit", addVertical);

// //////////////////////////////////////////

const subVerticalFormHTML = document.querySelector("#subVerticalForm");

const addSubVertical = async (e) => {
  e.preventDefault();
  const name = subVerticalFormHTML["name"].value;
  const subVertical = subVerticalFormHTML["subVertical-name"].value;

  try {
    await db
      .collection("verticals")
      .doc(name)
      .collection(subVertical)
      .doc(subVertical)
      .set({
        name: subVertical,
       
      });
    const ref = await db.collection("verticals").doc(name);
    const refDoc = await ref.get();
    const refData = await refDoc.data();
    refData.subVerticals.push(subVertical);
    await ref.update(refData);

    nowuiDashboard.showNotification(
      "top",
      "center",
      "Sub-Vertical Added Successfully",
      "primary"
    );
    subVerticalFormHTML.reset();
  } catch (error) {
    console.error(error);
    nowuiDashboard.showNotification(
      "top",
      "center",
      "Error Occured`",
      "primary"
    );
  }
};

subVerticalFormHTML.addEventListener("submit", addSubVertical);

// //////////////////////////////////////////

async function deleteVertical(ver) {
  console.log("deleteVertical", ver);
  try {
    await db.collection("verticals").doc(ver).delete();
    alert(`Deleted Successfully`);
  } catch (error) {
    console.error(error);
    alert(`Unable to delete. Reason: ${error.message}`);
  }
}

// ///////////////////////////////////////

async function deleteSubVertical(ver, subVer) {
  console.log("deleteSubVertical", ver, subVer);
  try {
    const ref = await db.collection("verticals").doc(`${ver}`);
    const refDoc = await ref.get();
    const refData = refDoc.data();
    const res = refData.subVerticals.filter((v) => v.trim() !== subVer.trim());
    refData.subVerticals = res;
    await ref.update(refData);
    alert(`Deleted Successfully`);
  } catch (error) {
    console.error(error);
    alert(`Unable to delete. Reason: ${error.message}`);
  }
}

// ///////////////////////////////////////
