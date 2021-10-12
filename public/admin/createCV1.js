const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

let RAW_USER = false;
let USER_CREATED_REF;
let USER_CREATED_ID;
let FORM_DATA = false;

// /////////////////////////////////////////////////////////

async function onStateChange() {
  return await auth.onAuthStateChanged((user) => {
    if (user) {
      console.log(user);
      if (user.displayName === "admin") {
        RAW_USER = user;
        console.log(RAW_USER);
      }
    }
  });
}

const pwd = window.localStorage.getItem("key_id");

if (!pwd) {
  alert("Please login again to add emploee");
  window.location.href = `./../authentication/auth.html`;
}

// /////////////////////////////////////////////////////////

const employeeFormHTML = document.querySelector("#employeeForm");

const updateBasicInfo = async () => {

  const email = employeeFormHTML["email"].value;

  const userType = "employee";
  let createRes;
  console.log(RAW_USER);

  if (!RAW_USER.email) {
    await onStateChange();
  }

  if (email) {
    createRes = await createUserAuth(email, "raoeeEmployee", userType);
    if (!createRes.status) {
      alert(createRes.message);
      return;
    }
  }
  console.log("user created");

  USER_CREATED_ID = createRes.data.uid;
  USER_CREATED_REF = await db
    .collection(`${userType}s`)
    .doc(createRes.data.uid);

  console.log(RAW_USER);

  const signinAdminRes = await signinAdmin({
    email: RAW_USER.email,
    password: pwd,
  });
  if (!signinAdminRes.status) {
    alert(signinAdminRes.message);
    return;
  }
  console.log("admin logged in");

  const fname = employeeFormHTML["fname"].value || "";
  const lname = employeeFormHTML["lname"].value || "";
  const phone = employeeFormHTML["phone"].value || "";

  const address = employeeFormHTML["address"].value || "";
  const city = employeeFormHTML["city"].value || "";
  const state = employeeFormHTML["state"].value || "";
  const country = employeeFormHTML["country"].value || "";
  const postalCode = employeeFormHTML["postal-code"].value || "";

  FORM_DATA = {
    fname,
    lname,
    phone,
    email,
    userType,
    uid: USER_CREATED_ID,
    basicInfo: {
      address,
      city,
      state,
      country,
      postalCode,
      aboutMe: "",
    },
  };

  if (address && city && state && country && postalCode) {
    FORM_DATA.basicInfoAdded = true;
  } else {
    FORM_DATA.basicInfoAdded = false;
  }

};

// /////////////////////////////////////////////////////////

async function createUserAuth(email, password, type) {
  document.getElementById("progressBar").style.display="block"
  console.log(email, password, type);
  const SHA256 = new Hashes.SHA256();
  password = SHA256.hex(password);
  return await auth.createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      console.log(userCredential);
      let user = userCredential.user;
      await user.updateProfile({
        displayName: type,
      });
      return {
        status: true,
        message: "user auth created ",
        data: {
          uid: user.uid,
        },
      };
    })
    .catch((error) => {
      console.error(error);
      var errorMessage = error.message;
      nowuiDashboard.showNotification(
        "top",
        "center",
        errorMessage.substring(9),
        "primary"
      );
      return {
        status: false,
        message: `Please Retry : ${errorMessage}`,
      };
    });
}

// /////////////////////////////////////////////////////////

async function signinAdmin({ email, password }) {
  console.log(email, password);
  return await auth
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      return {
        status: true,
      };
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("showMessage").innerHTML = " ";
      return {
        status: false,
        message: " Something went wrong ",
      };
    });
}

// /////////////////////////////////////////////////////////

async function getCreatedUser({ collectionName, uid }) {
  try {
    USER_CREATED_REF = await db.collection(collectionName).doc(uid);
    await USER_CREATED_REF.get();
  } catch (error) {
    console.error(error);
  }
}

// /////////////////////////////////////////////////////////

function getUserPreferences() {
  const cvVerticals = [];

  employeeFormHTML.querySelectorAll(`select[name="expertise"]`).forEach((e) => {
    const all = e.value.split("__");
    const selectedVId = all[0];
    const selectedVName = all[1];
    const selectedSubV = all[2];
    const category = all[3];
    const value = all[4];
    const rowId = all[5];

    if (document.querySelector(`input[data-rowid="${rowId}"]`).checked) {
      cvVerticals.push({
        verName: selectedVName,
        ver: selectedVId,
        subVertical: selectedSubV,
        category,
        value,
      });
    }

    console.log(cvVerticals);
  });

  const vv = [];
  const sv = [];
  const ee = [];
  cvVerticals.map((cvv) => {
    let vIndex = vv.findIndex((v) => v.id === cvv.ver);
    if (vIndex === -1) {
      vv.push({ id: cvv.ver, name: cvv.verName });
      sv.push({
        ver: cvv.ver,
        sver: [],
      });
      ee.push({
        ver: cvv.ver,
        svers: [],
      });
    }

    vIndex = sv.findIndex((v) => v.ver === cvv.ver);
    let svIndex = sv[vIndex].sver.findIndex((sv) => sv === cvv.subVertical);

    if (svIndex === -1) {
      sv[vIndex].sver.push(cvv.subVertical);
      vIndex = ee.findIndex((v) => v.ver === cvv.ver);

      ee[vIndex].svers.push({
        sver: cvv.subVertical,
        expertise: [{ category: cvv.category, value: cvv.value }],
      });
    } else {
      vIndex = ee.findIndex((v) => v.ver === cvv.ver);
      svIndex = ee[vIndex].svers.findIndex((sv) => sv.sver === cvv.subVertical);
      ee[vIndex].svers[svIndex].expertise.push({
        category: cvv.category,
        value: cvv.value,
      });
    }
  });

  return { verticals: vv, subVerticals: sv, expertise: ee };
}

// /////////////////////////////////////////////////////////

// const employeeFormHTML = document.querySelector("#cvForm");
let FILE = false;
let FILE_NAME = false;

const updateCv = async (e) => {
  e.preventDefault();
  await updateBasicInfo();
  const userType = 'employee';

  const { verticals, subVerticals, expertise } = getUserPreferences();


  let resStorage, resURL;
  let data = {};

  if (FILE_NAME) {
    resStorage = await uploadFileToStorage({ ref: `${userType}s/${USER_CREATED_ID}`, fileName: FILE_NAME, file: FILE });
    retryStorage = 0;
    if (!resStorage.status) {
      alert(resStorage.message);
      return;
    }

    resURL = await getUrlOfFile({ ref: `${userType}s/${USER_CREATED_ID}`, fileName: FILE_NAME});
    retryURL = 0;
    if (!resURL.status) {
      alert(resURL.message);
      return;
    }
    data.url = resURL.data.url;
    data.fileName = FILE_NAME; 
  }
  
  data.verticals = verticals;
  data.subVerticals = subVerticals;
  data.expertise = expertise;
  data.userType = userType;
  data.userId = USER_CREATED_ID;
  data.fname = employeeFormHTML["fname"].value || "";
  data.lname = employeeFormHTML["lname"].value || "";

  const resDB = await uploadCVToDb({ data });
  retryDB = 0;
  if (!resDB.status) {
    alert(resDB.message);
    document.getElementById("progressBar").style.display="none"
    return;
  }

  data = {
    verticals,
    subVerticals,
    expertise,
    fileName: FILE_NAME ,
    url: resURL.data.url,
    collectionName: resDB.data.collectionName,
    docId: resDB.data.docId,
  };

  const resUpdateCvDb = await updateCollectionsDb({
    collectionName: resDB.data.collectionName,
  });

  if (!resUpdateCvDb.status) {
    alert(resDB.message);
  }

  FORM_DATA.cv = {
    ...data
  }
  FORM_DATA.cvAdded = true;

  await USER_CREATED_REF.set(FORM_DATA);

  nowuiDashboard.showNotification(
    "top",
    "center",
    "Record Added Successfully",
    "primary"
  );
  employeeFormHTML.reset();
  FILE_NAME = false;
  FILE = false;

  // setTimeout(function () {
  //   location.reload();
  // }, 2000);
  document.getElementById("progressBar").style.display="none"
};

employeeFormHTML.addEventListener("submit", updateCv);

// /////////////////////////////////////////////////////////
let retryUpdateCollectionsDb = 0;
const updateCollectionsDb = async ({ collectionName }) => {
  try {
    const ref = await db.collection("miscellaneous").doc("cvCollections");
    const doc = await ref.get();
    const data = await doc.data();
    let flag = true;
    for (let i = 0; i < data.cvCollections.length; i++) {
      const coll = data.cvCollections[i];
      if (coll === collectionName) {
        flag = false;
        break;
      }
    }

    if (flag) {
      data.cvCollections.push(collectionName);
      await ref.update(data);
    }

    return {
      status: true,
      message: `Updated Succefully.`,
    };
  } catch (error) {
    console.error(error);
    if (retryUpdateCollectionsDb < 2) {
      retryUpdateCollectionsDb++;
      alert(
        `Retrying Attempt: ${retryUpdateCollectionsDb} Reason: ${error.message}`
      );
      deleteStorage({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to update. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////

let retryDB = 0;
const uploadCVToDb = async ({ data }) => {
  document.getElementById("progressBar").style.display="block"
  let collectionName = ``;
  data.verticals.map((v) => {
    collectionName += `${v.id}_`;
  });

  try {
    const ref = await db.collection(collectionName).add({ ...data });
    return {
      status: true,
      message: "Successfully added the CV record.",
      data: {
        collectionName: collectionName,
        docId: ref.id,
      },
    };
    
  } catch (error) {
    console.error(error);
    if (retryDB < 2) {
      retryDB++;
      alert(`Retry. Attempt: ${retryDB} Reason: ${error.message} `);
      uploadCVToDb({ data });
      document.getElementById("progressBar").style.display="none"
    } else {
      return {
        status: false,
        message: `Failed to add the CV record. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////

let retryURL = 0;
const getUrlOfFile = async ({ ref, fileName }) => {
  try {
    const url = await storage.ref(ref).child(fileName).getDownloadURL();
    return {
      status: true,
      message: "Success. Fetched the file from storage.",
      data: {
        url,
      },
    };
  } catch (error) {
    console.error(error);
    if (retryURL < 2) {
      retryURL++;
      alert(`Retry. Attempt: ${retryURL} Reason: ${error.message} `);
      getUrlOfFile({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to fetch the file from stoarge. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////
let retryStorage = 0;
const uploadFileToStorage = async ({ ref, fileName, file }) => {
  try {
    await storage.ref(ref).child(fileName).put(file);
    return {
      status: true,
      message: "Uplading to file to storage success",
    };
  } catch (error) {
    console.error(error);
    if (retryStorage < 2) {
      retryStorage++;
      alert(`Retry. Attempt: ${retryStorage} Reason: ${error.message} `);
      uploadFileToStorage({ ref, fileName, file });
    } else {
      return {
        status: false,
        message: `Failed to upload file to stoarge. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////

function uploadCVFile(e) {
  FILE = e.target.files[0];
  if (FILE) {
    FILE_NAME = `${new Date().valueOf()}__${FILE.name}`;
  }
}

employeeFormHTML["cv-file"].addEventListener("change", uploadCVFile);

// /////////////////////////////////////////////////////////

let VERTICALS = [];

db.collection("verticals").onSnapshot(async (snaps) => {
  const docs = snaps.docs;
  let VERTICALS_DATA = [];
  VERTICALS.length = 0;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const data = await doc.data();
    VERTICALS_DATA.push({
      _id: data._id,
      name: data.name,
      subVerticals: data.subVerticals,
    });
    for (let j = 0; j < data.subVerticals.length; j++) {
      VERTICALS_DATA[i].subVerticals[j] = {
        name: VERTICALS_DATA[i].subVerticals[j],
      };
      try {
        const subVerRef = await db
          .collection("verticals")
          .doc(doc.id)
          .collection(VERTICALS_DATA[i].subVerticals[j].name)
          .doc(VERTICALS_DATA[i].subVerticals[j].name);
        const subVerDoc = await subVerRef.get();
        const subVerData = await subVerDoc.data();
        VERTICALS_DATA[i].subVerticals[j]["expertise"] = subVerData.expertise;
      } catch (error) {
        console.error(error);
      }
    }
  }

  VERTICALS = VERTICALS_DATA.map((v) => v);

  displayVerticalDropdown();
  storeAllNamesIds();
});

// /////////////////////////////////////////////////////////

// vertical dropdown

const verticalDropHolderHTML = document.querySelector("#verticalDropHolder");

function displayVerticalDropdown() {
  let options = "";

  VERTICALS.map((ver) => {
    options += `<option value="${ver.name}">${ver.name}</option>`;
  });

  verticalDropHolderHTML.innerHTML = `
  <label>Select Vertical
    <span style="color: red">*</span>
  </label>
  <select
    id="choices-multiple-remove-button"
    class="form-control"
    multiple
    name="verticals"
    onchange="verticalSelected(event)"
    required
    selected
  >
    ${options}
  </select>
  `;

  new Choices("#choices-multiple-remove-button", {
    removeItemButton: true,
    maxItemCount: 20,
    searchResultLimit: 10,
    renderChoiceLimit: 10,
  });

  // $("#choices-multiple-remove-button").selectedIndex = "1";
}

// ///////////////////////////////////////////

let verticalsSelected = [];
let userSelectedMainVerticals = [];
let prevVerticals = [];

function verticalSelected(e) {
  userSelectedMainVerticals.length = 0;

  if (e) {
    verticalsSelected = Array.from(e.target.selectedOptions).map(
      (x) => x.value ?? x.text
    );
  } else {
    verticalsSelected = Array.from(
      document.querySelector("#choices-multiple-remove-button").selectedOptions
    ).map((x) => x.value ?? x.text);
  }

  const resDeleted = deletedVertical({
    previousVerticals: prevVerticals,
    newVerticals: verticalsSelected,
  });
  prevVerticals = verticalsSelected.map((v) => v);

  verticalsSelected.map((ver) => {
    let indexOfVer = VERTICALS.findIndex((v) => {
      return v.name === ver;
    });
    userSelectedMainVerticals.push(VERTICALS[indexOfVer]);
  });

  // getSelectedVerticals();
  userSelectedVerticals.length = 0;
  userSelectedMainVerticals.map((uv) => {
    if (resDeleted && resDeleted[0] === uv.name) {
      uv.subVerticals.map((svv) => {
        if (svv?.selected) {
          svv.selected = false;
        }
      });
    }
  });

  displaySubVerticalDropdown();

  if (resDeleted) {
    subVerticalSelected();
  }
  getSelectedVerticals();
}

// ///////////////////////////////////////////
let subVerticalsSelected = [];
let userSelectedVerticals = [];

function deletedVertical({ previousVerticals, newVerticals }) {
  const oldLength = previousVerticals.length;
  const newLength = newVerticals.length;

  if (oldLength < newLength) return;

  const dVer = previousVerticals.filter(
    (element) => !newVerticals.includes(element)
  );

  subVerticalsSelected = subVerticalsSelected.filter(
    (sv) => !sv.includes(dVer[0])
  );

  return dVer;
}

function deletedSubVertical({ previousVerticals, newVerticals }) {
  const oldLength = previousVerticals.length;
  const newLength = newVerticals.length;

  if (oldLength < newLength) return;

  const dVer = previousVerticals.filter(
    (element) => !newVerticals.includes(element)
  );

  return dVer;
}

// ///////////////////////////////////////////

const subVerticalDropHolderHTML = document.querySelector(
  "#subVerticalDropHolder"
);

function displaySubVerticalDropdown() {
  let options = "";
  subVerticalDropHolderHTML.innerHTML = ``;

  // console.log(userSelectedMainVerticals);
  userSelectedMainVerticals.map((ver) => {
    ver.subVerticals.map((sv) => {
      // subVerticalsSelected.map(selected )
      let flag = "";
      for (let i = 0; i < subVerticalsSelected.length; i++) {
        if (subVerticalsSelected[i] === `${ver.name}__${sv.name}`) {
          flag = "selected";
          break;
        }
      }
      options += `<option value="${ver.name}__${sv.name}" ${flag}>${ver.name} : ${sv.name}</option>`;
    });
  });

  subVerticalDropHolderHTML.innerHTML = `
  <label>Select Sub Vertical
    <span style="color: red">*</span>
  </label>
  <select
    id="choices-multiple-remove-button1"
    class="form-control"
    multiple
    name="sub-verticals"
    required
    onchange="subVerticalSelected(event)"
  >
    ${options}
  </select>
  `;

  // $("#choices-multiple-remove-button1").hide()
  new Choices("#choices-multiple-remove-button1", {
    removeItemButton: true,
    maxItemCount: 20,
    searchResultLimit: 10,
    renderChoiceLimit: 10,
  });

}

// ///////////////////////////////////////////
let previousSubVerticals = [];

function subVerticalSelected(e = false, initial = false) {
  subVerticalsSelected = [];
  let svs;
  if (e) {
    svs = Array.from(e.target.selectedOptions).map((x) => x.value ?? x.text);
  } else {
    svs = Array.from(
      document.querySelector("#choices-multiple-remove-button1").selectedOptions
    ).map((x) => x.value ?? x.text);
  }

  subVerticalsSelected.push(...svs);

  const deleteRes = deletedSubVertical({
    previousVerticals: previousSubVerticals,
    newVerticals: subVerticalsSelected,
  });

  previousSubVerticals = subVerticalsSelected.map((e) => e);

  if (deleteRes) {
    deleteRes.map((dsv) => {
      const dV = dsv.split("__")[0];
      const dSv = dsv.split("__")[1];
      for (let i = 0; i < userSelectedMainVerticals.length; i++) {
        const eachSelected = userSelectedMainVerticals[i];

        if (eachSelected.name === dV) {
          for (let j = 0; j < eachSelected.subVerticals.length; j++) {
            if (eachSelected.subVerticals[j].name === dSv) {
              eachSelected.subVerticals[j].selected = false;
              eachSelected.subVerticals[j].expertise.map((ex) => {
                if (ex?.value) {
                  delete ex.value;
                  delete ex.selected;
                }
              });
              break;
            }
          }
        }
      }
    });
  }

  subVerticalsSelected.map((v) => {
    let vv = v.split("__")[0];
    let sv = v.split("__")[1];

    userSelectedMainVerticals.map((uv) => {
      if (uv.name === vv) {
        uv.subVerticals.map((svv) => {
          if (svv.name == sv) {
            svv.selected = true;
          }
        });
      }
    });
  });

  if (subVerticalsSelected.length === 0) {
    userSelectedMainVerticals.map((uv) => {
      uv.subVerticals.map((svv) => {
        if (svv?.selected) {
          svv.selected = false;
        }
      });
    });
  }

  getSelectedVerticals();
  if (initial) {
    getSelectedVerticals(true);
  }
}

// /////////////////////////////////////////////////

function getSelectedVerticals(initial = false) {
  userSelectedVerticals = [];

  userSelectedMainVerticals.map((v) => {
    let flag = false;
    for (let i = 0; i < subVerticalsSelected.length; i++) {
      if (subVerticalsSelected[i].includes(v.name)) {
        flag = true;
      }
    }

    if (!flag) {
      v.subVerticals.map((sv) => {
        sv.selected = false;
      });
    } else {
      v.subVerticals.map((sv) => {
        if (sv.selected) {
          let index = userSelectedVerticals.findIndex(
            (vv) => v.name === vv.name
          );
          if (index > -1) {
            userSelectedVerticals[index].subverticals.push(sv);
          } else {
            userSelectedVerticals.push({
              name: v.name,
              _id: v._id,
              subverticals: [{ ...sv }],
            });
          }
        }
      });
    }
  });

  if (initial) {
    displayExpertiseTable(true);
  } else {
    displayExpertiseTable();
  }
}

// /////////////////////////////////////////////////

function sliderToggle(e) {
  const eleRowId = e.target.dataset.rowid;
  console.log(eleRowId)
  const el = document.querySelector(`select[data-rowid="${eleRowId}"]`);
  if (e.target.checked) {
    el.disabled = false;
    document.getElementById(eleRowId).innerHTML="Yes"
    optionSelected(false, { data: el.value, selected: true });
  } else {
    document.getElementById(eleRowId).innerHTML="No"
    el.disabled = true;
    optionSelected(false, { data: el.value, selected: false });
  }
}

// /////////////////////////////////////////////////

function optionSelected(e = false, data = false) {
  let v, selected;
  if (e) {
    console.log(e.target.value);
    v = e.target.value;
    selected = true;
  } else {
    v = data.data;
    selected = data.selected;
  }

  const vid = v.split("__")[0];
  const vname = v.split("__")[1];
  const svname = v.split("__")[2];
  const cat = v.split("__")[3];
  const val = v.split("__")[4];
  const rowId = v.split("__")[5];

  console.log(vid, svname, cat, val);

  let flag = false;
  for (let i = 0; i < userSelectedVerticals.length; i++) {
    if (flag == true) {
      break;
    }
    if (vid === userSelectedVerticals[i]._id) {
      for (let j = 0; j < userSelectedVerticals[i].subverticals.length; j++) {
        if (flag == true) {
          break;
        }
        if (userSelectedVerticals[i].subverticals[j].name === svname) {
          for (
            let k = 0;
            k < userSelectedVerticals[i].subverticals[j].expertise.length;
            k++
          ) {
            if (
              userSelectedVerticals[i].subverticals[j].expertise[k].category ===
              cat
            ) {
              userSelectedVerticals[i].subverticals[j].expertise[k].value = val;
              userSelectedVerticals[i].subverticals[j].expertise[k].selected =
                selected;
              console.log(
                userSelectedVerticals[i].subverticals[j].expertise[k]
              );
              flag = true;
              break;
            }
          }
        }
      }
    }
  }
}

// /////////////////////////////////////////////////

const tablesHolderHTML = document.querySelector("#tablesHolder");

function displayExpertiseTable(initial = false) {
  tablesHolderHTML.innerHTML = ``;
  let tables = ``;

  console.log(userSelectedVerticals);
  userSelectedVerticals.map((v) => {
    let head = `
    <h6 style="font-weight: 600">
      Select Expertise (
      <b style="color: red">Vertical Selected : ${v.name}</b> )
    </h6>
    <label>Tick the box if applicable</label>`;
    let table = ``;
    v.subverticals.map((sv) => {
      let isDisabled = true;
      let tableHead = `
      <table class="table table-bordered">
        <thead class="thead-dark">
          <tr style="text-align: center">
            <th
              style="text-align: center; font-weight: 600"
              scope="col center"
            >
              Area of Expertises
              <br>
              (${sv.name})
            </th>
            <th>
              Applicable?
            </th>
            <th
              style="text-align: center; font-weight: 600"
              scope="col"
            >
              Your Profession / Experience
            </th>
          </tr>
        </thead>
        <tbody>`;

      let rows = ``;
      let i = 0;
      let tglTxt = "";
      sv.expertise.map((exp) => {
        let options = "";
        let rowId = `rowId${Math.random()}_${Math.random()}`;
        isDisabled = true;
        exp.tags.map((op) => {
          if (exp?.selected) {
            isDisabled = false;
          } else {
            isDisabled = true;
          }
       
            if (exp.value === op) {
              options += `
              <option selected value="${v._id}__${v.name}__${sv.name}__${exp.category}__${op}__${rowId}" >${op}</option>
            `;
            } else {
              options += `
            <option value="${v._id}__${v.name}__${sv.name}__${exp.category}__${op}__${rowId}" >${op}</option>
          `;
            }
          
        });
        if (isDisabled) {
          tglTxt = "No";
        } else {
          tglTxt = "Yes";
        }
        rows +=
          `
        <tr>
          <td>${exp.category}</td>
          <td>
          <label class="switch">
          <input type="checkbox" data-rowid="${rowId}"  ${
            isDisabled ? "" : "checked"
          }  onchange="sliderToggle(event)"   >
          <span class="slider round"></span>
          <span style="font-size: 12px;position: absolute;padding-top: 20px;padding-left: 10px;" id="${rowId}">` +
          tglTxt +
          `</span>
        </label>
          </td>
          <td>
            <select
              onchange="optionSelected(event)"
              data-rowid="${rowId}" 
              class="selectpicker"
              name="expertise"
              ${isDisabled ? "disabled" : ""} 
              style="width:100%;border-radius:10px;border:none;background-color:lightgray;padding:5px"
            >
              ${options}
            </select>
          </td>
        </tr>
          `;
        i++;
      });

      let tableBody = rows;
      let tableEnd = ` </tbody>
      </table>`;

      table += tableHead + tableBody + tableEnd;
    });

    tables += head + table;
  });
  tablesHolderHTML.innerHTML = tables;
}

// //////////////////////////////////////////

let ID_NAME_VERTICALS = [];

async function storeAllNamesIds() {
  ID_NAME_VERTICALS = VERTICALS.map((v) => {
    return { name: v.name, id: v._id };
  });
}

// //////////////////////////////////////////

function getNameOfId(id) {
  // if(ID_NAME_VERTICALS.length === 0) await storeAllNamesIds();

  let name = ID_NAME_VERTICALS.filter((v) => v.id === id);
  name = name[0].name;
  return name;
}

// //////////////////////////////////////////

// /////////////////////////////////////////////////////////
let retryLogout = 0;

function logoutUser() {
  auth
    .signOut()
    .then(() => {
      // Sign-out successful.
      window.location.href = "./../adminDash.html";
    })
    .catch((error) => {
      console.error(error);
      if (retryLogout < 2) {
        retryLogout++;
        logoutUser();
      } else {
        alert(`unable to logout at moment. Reason: ${error.message}`);
      }
    });
}
