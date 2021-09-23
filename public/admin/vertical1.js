const db = firebase.firestore();

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
      <i
        class="now-ui-icons ui-1_simple-remove"
        aria-hidden="true"
        style="cursor: pointer;"
      ></i>
    </li>
    `;
  });

  allVerticalsHTML.innerHTML += ` </ul>`;

  console.log(allVerticalsHTML);
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

  VERTICALS.map((ver) => {
    allSubVerticalsHTML.innerHTML += `<p style="font-weight: bolder;">For ${ver.name}</p><ul>`;
    let counter = 0;
    ver?.subVerticals.map((subVer) => {
      allSubVerticalsHTML.innerHTML += `
      <li>
        ${subVer}
        <i
          class="now-ui-icons ui-1_simple-remove"
          aria-hidden="true"
          style="cursor: pointer;"
        ></i>
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

  try {
    await db.collection("verticals").doc(name).set({
      name: name,
      subVerticals: []
    });
    nowuiDashboard.showNotification('top','center',"Vertical Added Successfully","primary");
    
  } catch (error) {
    console.error(error);
    nowuiDashboard.showNotification('top','center',"Some Error Occured ! try again","red");
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
    await db.collection("verticals").doc(name).collection(subVertical).doc(subVertical).set({
      name: subVertical,
      expertise: []
    })
    const ref =  await db.collection("verticals").doc(name)
    const refDoc = await ref.get();
    const refData = await refDoc.data();
    refData.subVerticals.push(subVertical);
    await ref.update(refData);

    nowuiDashboard.showNotification('top','center',"Sub-Vertical Added Successfully","primary");
  } catch (error) {
    console.error(error);
    nowuiDashboard.showNotification('top','center',"Error Occured`","primary");
  }
};

subVerticalFormHTML.addEventListener("submit", addSubVertical);

// //////////////////////////////////////////
