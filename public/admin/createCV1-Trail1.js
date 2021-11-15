const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

let RAW_USER = false;
let USER_CREATED_REF;
let USER_CREATED_ID;
let FORM_DATA = false;

const USER = undefined;

//checkIfAdmin();

// /////////////////////////////////////////////////////////

async function onStateChange() {
  return await auth.onAuthStateChanged((user) => {
    if (user) {
      if (user.displayName === "admin") {
        RAW_USER = user;
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

  //const workCountry = employeeFormHTML["country"].value;

  if (countrySelected===0 || statesSelected.length === 0) {
    alert(
      "enter the preffered country and state where user emplyee wants to work"
    );
    return {
      status: false,
    };
  }
  
  
  if (!RAW_USER.email) {
    await onStateChange();
  }

  if (email) {
    createRes = await createUserAuth(email, "raoeeEmployee", userType);
    if (!createRes.status) {
      alert(createRes.message);
      document.getElementById("progressBar").style.display = "none";
      return {
        status: false,
      };
    }
  }
  console.log("updateBasicInfo : user created : id", createRes.data.uid);

  USER_CREATED_ID = createRes.data.uid;
  USER_CREATED_REF = await db
    .collection(`${userType}s`)
    .doc(createRes.data.uid);

  console.log('updateBasicInfo : RAW_USER ', RAW_USER);

  const signinAdminRes = await signinAdmin({
    email: RAW_USER.email,
    password: pwd,
  });
  if (!signinAdminRes.status) {
    alert(signinAdminRes.message);
    return {
      status: false,
    };
  }
  console.log("updateBasicInfo : admin logged in");

  const fname = employeeFormHTML["fname"].value || "";
  const lname = employeeFormHTML["lname"].value || "";
  const phone = employeeFormHTML["phone"].value || "";
  const qualification = employeeFormHTML["qualification"].value || "";
  const employmentStatus = employeeFormHTML["employmentStatus"].value || "";
  const internStatus = employeeFormHTML["internStatus"].value || "";
  const certifiedDomestic = employeeFormHTML["certified-domestic"].value || "";
  const certifiedInternationally =
    employeeFormHTML["certified-internationally"].value || "";
  const gender = employeeFormHTML["gender"].value || "";

  FORM_DATA = {
    fname,
    lname,
    phone,
    email,
    userType,
    userCreatedAt : new Date(),
    userCreatedAtStr : `${new Date()}`,
    userCreatedByAdmin : true,
    uid: USER_CREATED_ID,
    basicInfo: {
      qualification,
      employmentStatus,
      internStatus,
      certifiedDomestic,
      certifiedInternationally,
      gender,
      aboutMe: "",
    },
  };

  FORM_DATA.basicInfoAdded = true;

  return {
    status: true,
  };
};

// /////////////////////////////////////////////////////////

async function createUserAuth(email, password, type) {
  document.getElementById("progressBar").style.display = "block";

  return await auth
    .createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
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
      // nowuiDashboard.showNotification(
      //   "top",
      //   "center",
      //   errorMessage.substring(9),
      //   "primary"
      // );
      return {
        status: false,
        message: `Please Retry : ${errorMessage}`,
      };
    });
}

// /////////////////////////////////////////////////////////

async function signinAdmin({ email, password }) {
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
    //await USER_CREATED_REF.get();
  } catch (error) {
    console.error(error);
  }
}

// /////////////////////////////////////////////////////////

function getUserPreferences() {
  const cvVerticals = [];
  //document.querySelectorAll(`input[name=designation_checkbox]:checked`).forEach((e) => {
    for(let i=0;i<document.querySelectorAll(`input[name=designation_checkbox]:checked`).length;i++){

    const e = document.querySelectorAll(`input[name=designation_checkbox]:checked`)[i];
    const all = e.id.split("__");
    const selectedVId = all[0];
    const selectedVName = all[1];
    const selectedSubV = all[2];
    const profession = all[3];
    const designation = all[4];
    const index = all[5];
    if(!document.querySelector(`input[name=slider_${index}]:checked`)  ){
      console.log(!document.querySelector(`input[name=slider_${index}]:checked`))
      continue ;
    }

    const value = document.querySelector(`select[name=expertise-${index}`).value;
      cvVerticals.push({
        verName: selectedVName,
        ver: selectedVId,
        subVertical: selectedSubV,
        profession,
        designation,
        value
      });
  }

  console.log('getUserPreferences : cvVerticals',cvVerticals);
  if(cvVerticals.length==0){
    document.getElementById("progressBar").style.display = "none";
    alert("Select atleast 1 Designation")
    return;
  }
  const vv = [];
  const sv = [];
  const prof = [];
  cvVerticals.map((cvv) => {
    
    console.log(vv)
    console.log(cvv)
    let vIndex = vv.findIndex((v) => v.id === cvv.ver);
    console.log(vIndex)
    if (vIndex === -1) {
      vv.push({ id: cvv.ver, name: cvv.verName });
      sv.push({
        ver: cvv.ver,
        sver: [
          
        ],
      });
      prof.push({
        ver: cvv.ver,
        svers: [],
      });
    }

    vIndex = sv.findIndex((v) => v.ver === cvv.ver);
    let svIndex = sv[vIndex].sver.findIndex((sv) => sv === cvv.subVertical);

    if (svIndex === -1) {
      sv[vIndex].sver.push(cvv.subVertical);
    } 

    const profvIndex = prof.findIndex(p => p.ver == cvv.ver);
    const profsvIndex = prof[profvIndex].svers.findIndex(p => p.sver === cvv.subVertical);

    if(profsvIndex === -1) {
      prof[profvIndex].svers.push({
        sver: cvv.subVertical,
        profs: [{
          prof: cvv.profession,
          designations: [cvv.designation],
          value: cvv.value
        }]
      })
    } else {
      let profIndex = prof[profvIndex].svers[profsvIndex].profs.findIndex(p => p.prof === cvv.profession);
      if(profIndex === -1) {
        prof[profvIndex].svers[profsvIndex].profs.push({
          prof: cvv.profession,
          designations: [cvv.designation],
          value: cvv.value
        })
      } else {
      const desigIndex = prof[profvIndex].svers[profsvIndex].profs[profIndex].designations.findIndex(d => d === cvv.designation);
      if(desigIndex === -1) {
        prof[profvIndex].svers[profsvIndex].profs[profIndex].designations.push(cvv.designation);
      }
      }
    }
  });

  console.log('getUserPreferences : vv',vv);
  console.log('getUserPreferences : sv',sv);
  console.log('getUserPreferences : prof',prof);

  return { verticals: vv, subVerticals: sv, professions: prof };
}

// /////////////////////////////////////////////////////////
let statesSelected = [];
let countrySelected = [];
function selectedState(e) {
 
  if (e) {
    
    statesSelected = Array.from(e.target.selectedOptions).map(
      (x) => x.value ?? x.text
    );
  }
}
function selectedCountry(e) {
  
  if (e) {
    countrySelected = Array.from(e.target.selectedOptions).map(
      (x) => x.value ?? x.text
    );
  }
}

// /////////////////////////////////////////////////////////

let FILE = false;
let FILE_NAME = false;

const updateCv = async (e) => {
  e.preventDefault();
  let funRes = await updateBasicInfo();
  if (!funRes.status) {
    return;
  }
  const userType = "employee";

  // const workCountry = employeeFormHTML["country"].value;
  //const workCountry:countrySelected = countrySelected;
  const workCity = employeeFormHTML["work-city"].value;
  const experienceYear = employeeFormHTML['experienceYear'].value;

  const { verticals, subVerticals, professions } = await getUserPreferences();
  console.log('updateCv : verticals ',verticals);
  console.log('updateCv : subVerticals',subVerticals);
  console.log('updateCv : expertise',professions);

  let resStorage, resURL;
  let data = {};

  if (FILE_NAME) {
    resStorage = await uploadFileToStorage({
      ref: `${userType}s/${USER_CREATED_ID}`,
      fileName: FILE_NAME,
      file: FILE,
    });
    retryStorage = 0;
    if (!resStorage.status) {
      alert(resStorage.message);
      return;
    }

    resURL = await getUrlOfFile({
      ref: `${userType}s/${USER_CREATED_ID}`,
      fileName: FILE_NAME,
    });
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
  data.professions = professions;
  data.userType = userType;
  data.userId = USER_CREATED_ID;
  data.fname = employeeFormHTML["fname"].value || "";
  data.lname = employeeFormHTML["lname"].value || "";
  data.workCountry= countrySelected;
  data.workStates = statesSelected;
  data.workCity = workCity;
  data.yearExpirence = experienceYear;

  const resDB = await uploadCVToDb({ data });
  retryDB = 0;
  if (!resDB.status) {
    alert(resDB.message);
    document.getElementById("progressBar").style.display = "none";
    return;
  }

  data = {
    verticals,
    subVerticals,
    professions,
    fileName: FILE_NAME,
    url: resURL.data.url,
    collectionName: resDB.data.collectionName,
    docId: resDB.data.docId,
    workCountry:countrySelected,
    workStates: statesSelected,
    workCity,
    yearExpirence : experienceYear
  };

  const resUpdateCvDb = await updateCollectionsDb({
    collectionName: resDB.data.collectionName,
  });

  if (!resUpdateCvDb.status) {
    alert(resDB.message);
  }

  FORM_DATA.cv = {
    ...data,
  };
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

  document.getElementById("progressBar").style.display = "none";
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
  // console.log('uploadCVToDb : data ',data);
  document.getElementById("progressBar").style.display = "block";
  let collectionName = ``;
  data.verticals.map((v) => {
    collectionName += `${v.id}_`;
  });
  // console.log('uploadCVToDb : collectionName ',collectionName);
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
      document.getElementById("progressBar").style.display = "none";
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
  const res = checkFileType({
    file: FILE,
    fileTypes: ["pdf", "ppt", "docx", "png", "pptx", "doc"],
  });
  if (!res.status) {
    alert(res.message);
    return;
  }

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

  // console.log('displaySubVerticalDropdown : userSelectedMainVerticals ',userSelectedMainVerticals);
  userSelectedMainVerticals.map((ver) => {
    ver.subVerticals.map((sv) => {
      
      let flag = "";
      for (let i = 0; i < subVerticalsSelected.length; i++) {
        if (subVerticalsSelected[i] === `${ver.name}__${sv.name}`) {
          flag = "selected";
          break;
        }
      }
      if(sv.expertise.length>0)
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
  let numId=(eleRowId.substring(6)) 
 
  const el = document.querySelector(`select[data-rowid="${eleRowId}"]`);
  
  document.addEventListener("click", (evt) => {
    const flyoutElement = document.querySelector(".select-list");
    let targetElement = evt.target; // clicked element
  
    do {
        if (targetElement == flyoutElement) {
            // This is a click inside. Do nothing, just return.
            

            return;
        }
        // Go up the DOM
        targetElement = targetElement.parentNode;
    } while (targetElement);
  
    // This is a click outside.
  
    document.querySelector(".select-options").style.display = "none";
   
    
  });
  var table_id= ("table_"+eleRowId.substring(6,8))
  if (e.target.checked) {

    for(let i=0;i<document.querySelectorAll(`input[cat=toggle_btns]`,`table[id="table_${eleRowId.substring(6,7)}"]`).length;i++){
      
      let tog_id= document.querySelectorAll(`input[cat=toggle_btns]`)[i].id

      if( tog_id !="toggle_"+eleRowId && table_id.substring(6) == tog_id.substring(13,15)) {
        
        document.getElementById(tog_id).disabled=true;
      }
    }
    document.getElementById("select-list_"+eleRowId).style.pointerEvents
   
    el.disabled=false;
    document.getElementById("select-list_"+eleRowId).style.pointerEvents = "all"
    document.getElementById("select-list_"+eleRowId).style.opacity = 1;
    document.getElementById(eleRowId).innerHTML = "Yes";
    optionSelected(false, { data: el.value, selected: true });

  } else {
    for(let i=0;i<document.querySelectorAll(`input[cat=toggle_btns]`).length;i++){
      
      let tog_id= document.querySelectorAll(`input[cat=toggle_btns]`)[i].id
      if(table_id.substring(6) == tog_id.substring(13,15))
        document.getElementById(tog_id).disabled=false;  
    }
    document.getElementById(eleRowId).innerHTML = "No";
    el.disabled = true;
    document.getElementById("select-list_"+eleRowId).style.pointerEvents = "none"
    document.getElementById("select-list_"+eleRowId).style.opacity = 0.4;
   
    document.getElementById("designation_"+eleRowId).style.display = "none";
    optionSelected(false, { data: el.value, selected: false });
  }
}

// /////////////////////////////////////////////////

function optionSelected(e = false, data = false) {
  let v, selected;
  if (e) {
    v = e.target.value;
    selected = true;
  } else {
    v = data.data;
    selected = data.selected;
  }

  const vid = v.split("__")[0];
  const svname = v.split("__")[2];
  const cat = v.split("__")[3];
  const val = v.split("__")[4];

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
              // console.log('optionSelected : userSelectedVerticals[i].subverticals[j].expertise[k]', 
              //   userSelectedVerticals[i].subverticals[j].expertise[k]
              // );
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

let commonExpirences = [];
let commonExpirencesOptions = ``;

async function extractCommonExpirences() {
  await db.collection("experienceTags").doc("tags").get().then(doc => {
    const data = doc.data();
    data.tags.map(t => {
      commonExpirences.push(t); 
    })
  })
  
}

function commonExpirencesFun() {
  console.log("came")
  commonExpirences.map(exp => {
    commonExpirencesOptions += 
    `<option  value="${exp}" >${exp}</option> `;
  })
}


// /////////////////////////////////////////////////

const tablesHolderHTML = document.querySelector("#tablesHolder");

async function displayExpertiseTable() {
  tablesHolderHTML.innerHTML = ``;
  let tables = ``;
  if(commonExpirences.length === 0) {
    await extractCommonExpirences();
    commonExpirencesFun();
  }
  
  
  userSelectedVerticals.map((v) => {
    let head = `
    <h6 style="font-weight: 600">
      Select Expertise (
      <b style="color: red">Vertical Selected : ${v.name}</b> )
    </h6>
    <label>Tick the box if applicable</label>`;
    let table = ``;
    v.subverticals.map((sv) => {
      // console.log("displayExpertiseTable : sv : ", sv);
      let isDisabled = true;
     

      let rows = ``;
      let tglTxt = "";
      let randNum = Math.round(Math.random() * (9999 - 1000) + 1000);
      
      var rowId;
      sv.expertise.map((exp, index) => {
        rowId = `rowId_${randNum + index}`;
        // console.log("displayExpertiseTable :sv : exp", exp);
        let options = "";
        isDisabled = true;
        if (exp.subCategory) {
          exp.subCategory.map((Iop, subIndex) => {
            // rowId = `rowId_${randNum + index}_${subIndex}`;
            // console.log("displayExpertiseTable : sv : exp : Iop ", Iop);
            // if (exp?.selected) {
            //   isDisabled = false;
            // } else {
            //   isDisabled = true;
            // }

            if (exp.value === Iop) {
           
              options += `
                <div class="option"  > 
                  <input  type="checkbox" class="plus-minus" checked name="designation_checkbox" id="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}"  data-rowID="${rowId}" value="${Iop.name}" />
                  <label for="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}">${Iop.name}</label>
                </div>
              `;
            } else {
             
                if(Iop.name!="None" && Iop.name!="none"){
            
                options += `
                <div class="option"> 
                  <input   type="checkbox" class="plus-minus" name="designation_checkbox" id="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}"  data-rowID="${rowId}"  value="${Iop.name}" />
                  <label for="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}">${Iop.name}</label>
                </div>
              `;
              }else{
                options += `
                <div class="option" hidden > 
                  <input hidden checked type="checkbox" class="plus-minus" name="designation_checkbox" id="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}"  data-rowID="${rowId}"  value="${Iop.name}" />
                  <label for="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}">"${Iop.name}"</label>
                </div>
              `;
              }
              
            }
          });

          if (isDisabled) {
            tglTxt = "No";
          } else {
            tglTxt = "Yes";
          }
     
          
          rows +=`
          <tr>
            <td>${exp.category}</td>
            <td>
              <label class="switch">
              <input type="checkbox" name="slider_${rowId}" cat="toggle_btns" id="toggle_${rowId}"  data-rowid="${rowId}"  ${
                isDisabled ? "" : "checked"
              }  onchange="sliderToggle(event)"   >
              <span class="slider round"></span>
              <span style="font-size: 12px;position: absolute;padding-top: 20px;padding-left: 10px;" id="${rowId}">${tglTxt}</span>
            </label>
            </td>
          
            <td style="">
              <div class="select-list" id="select-list_`+rowId+`" style="pointer-events:none;opacity:0.4"  >
                  <div class="title" id="title_`+rowId+`">Select Expertise</div>
                  <div class="select-options" style="max-height:300px;overflow-y:scroll;" disable onchange="optionSelected(event)" data-rowid="${rowId}" name="designation" id="designation_${rowId}">
                    ${options}
                  </div>
              </div>
            </td>
            <td>
              <select
                disabled
                data-rowid="${rowId}" 
                class="selectpicker"
                name="expertise-${rowId}"
                style="width:100%;border-radius:10px;border:none;background-color:lightgray;padding:5px"
              >
              ${commonExpirencesOptions}
              </select>
            </td>
          </tr>`;
          setTimeout(function(){
            if(options.includes("hidden")){
              
              document.getElementById("select-list_"+rowId).classList.remove("select-list")
              document.getElementById("title_"+rowId).innerHTML="----"
            }
          },500)
          
        }
       
      });
      let tableHead = `
      <table id="table_${rowId.substring(6,8)}" class="table table-bordered">
        <thead class="thead-dark">
          <tr style="text-align: center">
            <th
              style="text-align: center; font-weight: 600"
              scope="col center"
            >
              Designation 
              <br>
              (${sv.name})
            </th>
            <th  style="text-align: center; font-weight: 600"
            scope="col center">
              Applicable?
            </th>
            <th  style="text-align: center; font-weight: 600"
            scope="col center">
              Select Expertise
            </th>
            <th
              style="text-align: center; font-weight: 600"
              scope="col"
            >
              Your Maximum Experience
            </th>
          </tr>
        </thead>
        <tbody>`;
      let tableBody = rows;
      let tableEnd = ` </tbody>
      </table>`;

      table += tableHead + tableBody + tableEnd;
      // setTimeout(function () {
      //   $(function () {
      //     $(".multiselect-ui").multiselect({
      //       includeSelectAllOption: true,
      //       minWidth: 300,
      //       height: 150,
      //       header: false,
      //       noneSelectedText: "Select",
      //       selectedList: 3
      //     });
      //   });
      // }, 1000);
    });

    tables += head + table;
  });

  tablesHolderHTML.innerHTML = tables;

  (function ($) {
    $.fn.multiselect = function () {
      var selector = this;
      var options = $.extend(
        {
          onChange: function (val) {
            console.log(val);
          },
        },
        arguments[0] || {}
      );

      activate();

      /////////
      
      function activate() {
        //events
        $(selector)
          .find(".title")
          .on("click", function (e) {
            
            $(this).parent().find(".select-options").toggle();
          });

        $(selector)
          .find('input[type="checkbox"]')
          .change(function (e) {
            options.onChange.call(this);
          });
      }
    };
  })(jQuery);

  $(document).ready(function () {
    $(".select-list").multiselect({
      onChange: updateTable,
      disabled : true,
    });
  });

}

function updateTable() {
  var checkboxValue = $(this).val();
  var isChecked = $(this).is(":checked");
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



// /////////////////////////////////////////////////////////

function checkFileType({ file, fileTypes }) {
  // console.log('checkFileType : file ',file);
  let fExt = file.name.split(".");
  fExt = fExt[fExt.length - 1];

  const fileIndex = fileTypes.findIndex((type) => type === fExt);
  // console.log(`checkFileType : fileIndex `,fileIndex);
  if (fileIndex === -1) {
    return {
      status: false,
      message: "wrong file extension uploaded",
    };
  }

  if (file.size > 5000000) {
    return {
      status: false,
      message: "too large file",
    };
  }

  return {
    status: true,
  };
}

// /////////////////////////////////////////////////////////
// let retryLogout = 0;

// function logoutUser() {
//   auth
//     .signOut()
//     .then(() => {
//       // Sign-out successful.
//       window.location.href = "./../adminDash.html";
//     })
//     .catch((error) => {
//       console.error(error);
//       if (retryLogout < 2) {
//         retryLogout++;
//         logoutUser();
//       } else {
//         alert(`unable to logout at moment. Reason: ${error.message}`);
//       }
//     });
// }
