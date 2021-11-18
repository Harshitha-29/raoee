const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ////////////////////////////////////////////
let USER = false;
let USER_REF = false;
let USER_ID = false;
let USER_RAW = false;
var oldStateArr = [];
var oldCountryArr=[];
var empStatusDrop = new Choices("#employmentStatus", {
  removeItemButton: true,
  maxItemCount: 100,
  searchResultLimit: 100,
  renderChoiceLimit: 100,
}).disable();
var internStatusDrop = new Choices("#internStatus", {
  removeItemButton: true,
  maxItemCount: 100,
  searchResultLimit: 100,
  renderChoiceLimit: 100,
}).disable();
var qualificationDrop = new Choices("#qualification", {
  removeItemButton: true,
  maxItemCount: 100,
  searchResultLimit: 100,
  renderChoiceLimit: 100,
}).disable();
auth.onAuthStateChanged(async (user) => {
  if (user) {
    USER_RAW = user;
    USER_ID = user.uid;
    if (user.emailVerified == false) {
      $("#exampleModalCenter").modal({
        backdrop: "static",
        keyboard: false,
        show: true,
      });
      document.getElementById("emailID").innerHTML = user.email;
    }
    getUserDetails({ uid: user.uid, userType: user.displayName });
  } else {
    return (window.location.href = `./../authentication/auth.html`);
  }
});

const topbarUsernameHTML = document.querySelector("#topbar-username");
const topbarImgHTML = document.querySelector("#topbar-img");

function displayAuthSigns() {
  topbarUsernameHTML.innerHTML = `Welcome ${USER.fname}`;
  if (USER.basicInfoAdded) {
    if (USER.basicInfo.imgUrl) {
      topbarImgHTML.src = USER.basicInfo.imgUrl;
    }
  }
}

function sendEmail() {
  USER_RAW.sendEmailVerification().then(function () {
    nowuiDashboard.showNotification(
      "top",
      "center",
      "Email Sent Successfully",
      "primary"
    );
  });
}

// ////////////////////////////////////////////
let retryUser = 0;
async function getUserDetails({ uid, userType }) {
  if (userType === "employee") {
    userType = `${userType}s`;
  }
  try {
    USER_REF = await db.collection(userType).doc(uid);
    const refDoc = await USER_REF.get();
    USER = await refDoc.data();

    displayUserDetails();
    displayAuthSigns();
  } catch (error) {
    console.error(error);
    if (retryUser < 2) {
      retryUser++;
      alert(`Retrying.  Attempt: ${retryUser}`);
      getUserDetails({ uid, userType });
    } else {
      return {
        status: false,
        message: `Canoy Fetch. Reson: ${error.message}`,
      };
    }
  }
}

// /////////////////////////////////////////////
const editCvBtnHTML = document.querySelector("#editCvBtn");
const editCvBtnHTML2 = document.querySelector("#editCvBtn2");
const cvInfoHolderHTML = document.querySelector("#cvInfoHolder");
const cvEditHolderHTML = document.querySelector("#cvEditHolder");

const toggleCvDisplay = (e) => {
  if (e?.target?.checked) {
    cvEditHolderHTML.style.display = "block";
    cvInfoHolderHTML.style.display = "none";
  } else {
    cvEditHolderHTML.style.display = "none";
    cvInfoHolderHTML.style.display = "block";
  }
};
const toggleUploadCvDisplay = (e) => {
  if (e?.target?.checked) {
    document.getElementById("cv-file").style.display = "block";
    document.getElementById("uploadNewCv").style.display = "block";
    document.getElementById("editCvUrlHolder").style.display = "none";
  } else {
    document.getElementById("cv-file").style.display = "none";
    document.getElementById("uploadNewCv").style.display = "none";
    document.getElementById("editCvUrlHolder").style.display = "block";
  }
};

editCvBtnHTML.addEventListener("change", toggleCvDisplay);
editCvBtnHTML2.addEventListener("change", toggleUploadCvDisplay);
// ////////////////////////////////////////
const userBasicFormHTML = document.querySelector("#userBasicForm");
const editBasicInfoBtnHTML = document.querySelector("#editBasicInfoBtn");
const updateBasicInfoBtnHTML = document.querySelector("#updateBasicInfoBtn");

const toggleBasicInfoDisplay = (e) => {
  if (e?.target?.checked) {
    userBasicFormHTML["fname"].readOnly = false;
    userBasicFormHTML["lname"].readOnly = false;
    userBasicFormHTML["phone"].readOnly = false;
    userBasicFormHTML["experienceYear"].readOnly = false;
    empStatusDrop.enable();
    internStatusDrop.enable();
    qualificationDrop.enable();
    // userBasicFormHTML["certified-domestic"].disabled = false;
    document.getElementById("radioDom1").disabled = false;
    document.getElementById("radioDom2").disabled = false;
    document.getElementById("radioInt1").disabled = false;
    document.getElementById("radioInt2").disabled = false;
    document.getElementById("radioGen1").disabled = false;
    document.getElementById("radioGen2").disabled = false;
    document.getElementById("radioGen3").disabled = false;
    updateBasicInfoBtnHTML.style.display = "block";
  } else {
    empStatusDrop.disable();
    internStatusDrop.disable();
    qualificationDrop.disable();
    userBasicFormHTML["fname"].readOnly = true;
    userBasicFormHTML["lname"].readOnly = true;
    userBasicFormHTML["phone"].readOnly = true;
    userBasicFormHTML["experienceYear"].readOnly = true;
    document.getElementById("radioDom1").disabled = true;
    document.getElementById("radioDom2").disabled = true;
    document.getElementById("radioInt1").disabled = true;
    document.getElementById("radioInt2").disabled = true;
    document.getElementById("radioGen1").disabled = true;
    document.getElementById("radioGen2").disabled = true;
    document.getElementById("radioGen3").disabled = true;
    updateBasicInfoBtnHTML.style.display = "none";
  }
};

// toggleBasicInfoDisplay(null, false)

editBasicInfoBtnHTML.addEventListener("change", toggleBasicInfoDisplay);

// ////////////////////////////////////////

const fullNameProfileHTML = document.querySelector("#fullNameProfile");
const aboutMeProfileHTML = document.querySelector("#aboutMeProfile");
const blahHTML = document.querySelector("#blah");

function displayUserDetails() {
  userBasicFormHTML["fname"].value = USER.fname;
  userBasicFormHTML["lname"].value = USER.lname;
  userBasicFormHTML["email"].value = USER.email;
  userBasicFormHTML["phone"].value = USER.phone;

  if(USER?.basicInfo?.experienceYear)
    userBasicFormHTML["experienceYear"].value = USER.basicInfo.experienceYear;
  fullNameProfileHTML.innerHTML = `<h5 class="title" style="color: black">${USER.fname} ${USER.lname}</h5>`;
  if (USER.basicInfoAdded) {

    userBasicFormHTML["qualification"].value = USER.basicInfo.qualification;
    userBasicFormHTML["employmentStatus"].value =
      USER.basicInfo.employmentStatus;
    userBasicFormHTML["internStatus"].value = USER.basicInfo.internStatus;
    userBasicFormHTML["certified-domestic"].value =
      USER.basicInfo.certifiedDomestic;
    userBasicFormHTML["certified-internationally"].value =
      USER.basicInfo.certifiedInternationally;
    userBasicFormHTML["gender"].value = USER.basicInfo.gender;
    blahHTML.src = USER?.basicInfo?.imgUrl || `../assets/img/userProfile.png`;
  }

  if (!USER.cvAdded) {
    editCvBtnHTML.checked = true;
    cvEditHolderHTML.style.display = "block";
    cvInfoHolderHTML.style.display = "none";
    editCvBtnHTML.disabled = true;
  }
}

// /////////////////////////////////////////////////////////

const updateBasicInfo = async (e) => {
  e.preventDefault();
  const fname = userBasicFormHTML["fname"].value;
  const lname = userBasicFormHTML["lname"].value;
  const phone = userBasicFormHTML["phone"].value;

  const qualification = userBasicFormHTML["qualification"].value;
  const employmentStatus = userBasicFormHTML["employmentStatus"].value;
  const internStatus = userBasicFormHTML["internStatus"].value;
  const certifiedDomestic = userBasicFormHTML["certified-domestic"].value;
  const certifiedInternationally =
    userBasicFormHTML["certified-internationally"].value;
  const gender = userBasicFormHTML["gender"].value;
  const experienceYear = userBasicFormHTML['experienceYear'].value;

  const data = {
    ...USER,
    fname,
    lname,
    phone,
    basicInfo: {
      ...USER.basicInfo,
      qualification,
      employmentStatus,
      internStatus,
      certifiedDomestic,
      certifiedInternationally,
      gender,
      experienceYear
    },
    basicInfoAdded: true,
  };

  try {
    if (USER.cvAdded) {
      if (
        fname !== USER.fname ||
        lname !== USER.lname ||
        lname !== USER.lname
      ) {
        const cvRef = await db
          .collection(USER.cv.collectionName)
          .doc(USER.cv.docId);
        const cvDoc = await cvRef.get();
        const cvData = await cvDoc.data();
        cvData.fname = fname;
        cvData.lname = lname;
        await cvRef.update(cvData);
      }
    }

    await USER_REF.update(data);

    nowuiDashboard.showNotification(
      "top",
      "center",
      "Basic Data updated Successfully",
      "primary"
    );
    getUserDetails({ uid: USER_ID, userType: USER.userType });
  } catch (error) {
    console.error(error);
    alert(`Try again. Reason: ${error.message}`);
  }
};

userBasicFormHTML.addEventListener("submit", updateBasicInfo);

// /////////////////////////////////////////////////////////

function getUserPreferences() {
  const cvVerticals = [];

  for (
    let i = 0;
    i <
    document.querySelectorAll(`input[name=designation_checkbox]:checked`)
      .length;
    i++
  ) {
    const e = document.querySelectorAll(
      `input[name=designation_checkbox]:checked`
    )[i];
    const all = e.id.split("__");
    const selectedVId = all[0];
    const selectedVName = all[1];
    const selectedSubV = all[2];
    const profession = all[3];
    const designation = all[4];
    const index = all[5];
    if (!document.querySelector(`input[name=slider_${index}]:checked`)) {
      console.log(
        !document.querySelector(`input[name=slider_${index}]:checked`)
      );
      continue;
    }

    const value = document.querySelector(
      `select[name=expertise-${index}`
    ).value;
    cvVerticals.push({
      verName: selectedVName,
      ver: selectedVId,
      subVertical: selectedSubV,
      profession,
      designation,
      value,
    });
  }

  console.log("getUserPreferences : cvVerticals", cvVerticals);
  if (cvVerticals.length == 0) {
    document.getElementById("progressBar").style.display = "none";
    alert("Select atleast 1 Designation");
    return;
  }

  const vv = [];
  const sv = [];
  const prof = [];
  cvVerticals.map((cvv) => {
    console.log(vv);
    console.log(cvv);
    let vIndex = vv.findIndex((v) => v.id === cvv.ver);
    console.log(vIndex);
    if (vIndex === -1) {
      vv.push({ id: cvv.ver, name: cvv.verName });
      sv.push({
        ver: cvv.ver,
        sver: [],
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

    const profvIndex = prof.findIndex((p) => p.ver == cvv.ver);
    const profsvIndex = prof[profvIndex].svers.findIndex(
      (p) => p.sver === cvv.subVertical
    );
    if (profsvIndex === -1) {
      prof[profvIndex].svers.push({
        sver: cvv.subVertical,
        profs: [
          {
            prof: cvv.profession,
            designations: [cvv.designation],
            value: cvv.value,
          },
        ],
      });
    } else {
      let profIndex = prof[profvIndex].svers[profsvIndex].profs.findIndex(
        (p) => p.prof === cvv.profession
      );
      if (profIndex === -1) {
        prof[profvIndex].svers[profsvIndex].profs.push({
          prof: cvv.profession,
          designations: [cvv.designation],
          value: cvv.value,
        });
      } else {
        const desigIndex = prof[profvIndex].svers[profsvIndex].profs[
          profIndex
        ].designations.findIndex((d) => d === cvv.designation);
        if (desigIndex === -1) {
          prof[profvIndex].svers[profsvIndex].profs[
            profIndex
          ].designations.push(cvv.designation);
        }
      }
    }
  });

  console.log("getUserPreferences : vv", vv);
  console.log("getUserPreferences : sv", sv);
  console.log("getUserPreferences : prof", prof);

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

const cvFormHTML = document.querySelector("#cvForm");
let FILE = false;
let FILE_NAME = false;

const updateCv = async (e) => {
  e.preventDefault();

  if (!USER.basicInfoAdded) {
    alert("Before adding CV, Please add basic information first .");
    return;
  }

  document.getElementById("progressBar2").style.display = "block";

  const workCity = cvFormHTML["work-city"].value;

  if (countrySelected === 0 || statesSelected.length === 0) {
    if (oldStateArr.length == 0) {
      document.getElementById("progressBar2").style.display = "none";
      // nowuiDashboard.showNotification('top','center',"Please enter the state where user emplyee wants to work","primary");
      return;
    } else {
      statesSelected = oldStateArr.map((s) => s);
    }
    if (oldCountryArr.length == 0) {
      document.getElementById("progressBar2").style.display = "none";
      // nowuiDashboard.showNotification('top','center',"Please enter the state where user emplyee wants to work","primary");
      return;
    } else {
      countrySelected = oldCountryArr.map((s) => s);
    }
  }

  const { verticals, subVerticals, professions } = getUserPreferences();
  console.log("updateCv : verticals", verticals);
  console.log("updateCv : subVerticals", subVerticals);
  console.log("updateCv : professions", professions);

  let resStorage, resURL;
  let data = {};

  if (FILE_NAME) {
    resStorage = await uploadFileToStorage({ ref: `${USER.userType}s` });
    retryStorage = 0;
    if (!resStorage.status) {
      alert(resStorage.message);
      return;
    }

    resURL = await getUrlOfFile({ ref: `${USER.userType}s` });
    retryURL = 0;
    if (!resURL.status) {
      alert(resURL.message);
      return;
    }
    data.url = resURL.data.url;
    data.fileName = FILE_NAME;

    if (USER.cvAdded) {
      const resDeleteStorage = await deleteStorage({
        ref: `${USER.userType}s/${USER.uid}`,
        fileName: USER.cv.fileName,
      });
      if (!resDeleteStorage.status) {
        alert(resDB.message);
        // return;
      }
    }
  } else {
    if (USER.cvAdded) {
      data.url = USER.cv.url;
      data.fileName = USER.cv.fileName;
    } else {
      // nowuiDashboard.showNotification(
      //   "top",
      //   "center",
      //   "Please Update the CV File ",
      //   "primary"
      // );
      return;
    }
  }

  data.verticals = verticals;
  data.subVerticals = subVerticals;
  data.professions = professions;
  data.userType = USER.userType;
  data.userId = USER.uid;
  data.fname = USER.fname;
  data.lname = USER.lname;
  data.phone = USER.phone;
  data.email = USER.email;
  data.createdAt = USER.createdAt;
  data.createdAtStr = USER.createdAtStr;
  data.createdByAdmin = USER?.createdByAdmin ? USER.createdByAdmin : false;
  data.workCountry = countrySelected;
  data.workStates = statesSelected;
  data.workCity = workCity;
  data.qualification = USER.basicInfo.qualification;
  data.employmentStatus = USER.basicInfo.employmentStatus;
  data.internStatus = USER.basicInfo.internStatus;
  data.certifiedDomestic = USER.basicInfo.certifiedDomestic;
  data.certifiedInternationally = USER.basicInfo.certifiedInternationally;
  data.gender = USER.basicInfo.gender;

  const resDB = await uploadCVToDb({ data });
  retryDB = 0;
  if (!resDB.status) {
    alert(resDB.message);
    return;
  }

  data = {
    verticals,
    subVerticals,
    professions,
    fileName: FILE_NAME ? FILE_NAME : USER.cv.fileName,
    url: FILE_NAME ? resURL.data.url : USER.cv.url,
    collectionName: resDB.data.collectionName,
    docId: resDB.data.docId,
    workCountry: countrySelected,
    workStates: statesSelected,
    workCity: workCity,
  };

  const resUpdateCvDb = await updateCollectionsDb({
    collectionName: resDB.data.collectionName,
  });
  if (!resUpdateCvDb.status) {
    alert(resDB.message);
    // return;
  }

  if (USER.cvAdded) {
    const resDeleteCvDb = await deleteCvDb({
      collectionName: USER.cv.collectionName,
      docId: USER.cv.docId,
    });
    if (!resDeleteCvDb.status) {
      alert(resDB.message);
      // return;
    }
  }

  const resUserDB = await uploadToUserDb({ data });
  retryUserDB = 0;
  if (!resUserDB.status) {
    alert(resUserDB.message);
    return;
  }

  // nowuiDashboard.showNotification('top','center',"Verticals Added Successfully","primary");
  document.getElementById("progressBar2").style.display = "none";
  cvEditHolderHTML.style.display = "none";
  cvInfoHolderHTML.style.display = "block";
  editCvBtnHTML.checked = false;
  nowuiDashboard.showNotification(
    "top",
    "center",
    "Data updated successfully",
    "primary"
  );
  getUserDetails({ uid: USER_ID, userType: USER.userType });
  setTimeout(function () {
    location.reload();
  }, 2000);
};

cvFormHTML.addEventListener("submit", updateCv);

// /////////////////////////////////////////////////////////
let retryDeleteStorage = 0;
const deleteStorage = async ({ ref, fileName }) => {
  try {
    await storage.ref(ref).child(fileName).delete();
    return {
      status: true,
      message: `Delete Succefully.`,
    };
  } catch (error) {
    console.error(error);
    if (retryDeleteStorage < 2) {
      retryDeleteStorage++;
      alert(`Retrying Attempt: ${retryDeleteStorage} Reason: ${error.message}`);
      deleteStorage({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to delete. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////

let retryDeleteCvDb = 0;
const deleteCvDb = async ({ collectionName, docId }) => {
  try {
    await db.collection(collectionName).doc(docId).delete();
    return {
      status: true,
      message: `Delete Succefully.`,
    };
  } catch (error) {
    console.error(error);
    if (retryDeleteCvDb < 2) {
      retryDeleteCvDb++;
      alert(`Retrying Attempt: ${retryDeleteCvDb} Reason: ${error.message}`);
      deleteStorage({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to delete. Reason: ${error.message}`,
      };
    }
  }
};

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
  console.log('uploadCVToDb : data :', data);
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
    } else {
      return {
        status: false,
        message: `Failed to add the CV record. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////

let retryUserDB = 0;
const uploadToUserDb = async ({ data }) => {
  try {
    USER.cv = {
      ...data,
    };
    USER.cvAdded = true;
    await USER_REF.update(USER);

    return {
      status: true,
      message: "Successfully added the record.",
    };
  } catch (error) {
    console.error(error);
    if (retryUserDB < 2) {
      retryUserDB++;
      alert(`Retry. Attempt: ${retryUserDB} Reason: ${error.message} `);
      uploadToUserDb({ data });
    } else {
      USER.cvAdded = false;
      return {
        status: false,
        message: `Failed to add the record. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////
let retryURL = 0;
const getUrlOfFile = async ({ ref }) => {
  try {
    const url = await storage
      .ref(`${ref}/${USER.uid}`)
      .child(FILE_NAME)
      .getDownloadURL();
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
      getUrlOfFile({ ref });
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
const uploadFileToStorage = async ({ ref }) => {
  try {
    await storage.ref(`${ref}/${USER.uid}`).child(FILE_NAME).put(FILE);
    return {
      status: true,
      message: "Uplading to file to storage success",
    };
  } catch (error) {
    console.error(error);
    if (retryStorage < 2) {
      retryStorage++;
      alert(`Retry. Attempt: ${retryStorage} Reason: ${error.message} `);
      uploadFileToStorage({ ref });
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

cvFormHTML["cv-file"].addEventListener("change", uploadCVFile);

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
  displayCvDetails();
});

// /////////////////////////////////////////////////////////

// vertical dropdown

const verticalDropHolderHTML = document.querySelector("#verticalDropHolder");

function displayVerticalDropdown() {
  let options = "";

  if (USER.cvAdded) {
    document.getElementById("editResumeBtn").style.display="block"
    document.getElementById("cv-file").style.display="none"
    document.getElementById("uploadNewCv").style.display="none"
    VERTICALS.map((ver) => {
      let isVPresent = USER.cv.verticals.filter((v) => v.name === ver.name);
      if (isVPresent.length > 0) {
        options += `<option value="${ver.name}" selected>${ver.name}</option>`;
      } else {
        options += `<option value="${ver.name}">${ver.name}</option>`;
      }
    });
    setTimeout(() => {
      verticalSelected();
      displaySubVerticalDropdown(true);
    }, 2000);
  } else {
    
    document.getElementById("editResumeBtn").style.display="none"
    VERTICALS.map((ver) => {
      options += `<option value="${ver.name}">${ver.name}</option>`;
    });
  }

  // VERTICALS.map((ver) => {
  //   options += `<option value="${ver.name}">${ver.name}</option>`;
  // });

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

function displaySubVerticalDropdown(initial = false) {
  let options = "";
  subVerticalDropHolderHTML.innerHTML = ``;

  if (initial) {
    if (USER.cvAdded) {
      USER.cv.subVerticals.map((sv) => {
        const name = getNameOfId(sv.ver);
        sv.sver.map((svv) => {
          subVerticalsSelected.push(`${name}__${svv}`);
        });
      });
    }
  }

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

  if (initial) {
    subVerticalSelected(false, true);
  }
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

  // console.log('getSelectedVerticals : userSelectedMainVerticals', userSelectedMainVerticals);
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
  // console.log('getSelectedVerticals : userSelectedVerticals',userSelectedVerticals);

  if (initial) {
    displayExpertiseTable(true);
  } else {
    displayExpertiseTable();
  }
}

// /////////////////////////////////////////////////

function sliderToggle(e) {
  
  const eleRowId = e.target.dataset.rowid;
  //console.log(eleRowId)
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
  await db
    .collection("experienceTags")
    .doc("tags")
    .get()
    .then((doc) => {
      const data = doc.data();
      data.tags.map((t) => {
        commonExpirences.push(t);
      });
    });
  
}

function commonExpirencesFun() {
  commonExpirences.map((exp) => {
    commonExpirencesOptions += `<option  value="${exp}" >${exp}</option> `;
  });
}

function commonSelectExpirencesFun(selectedOP) {
  
  console.log(selectedOP);
  commonExpirences.map((exp) => {
    //console.log(exp)
    if(selectedOP === exp) {
      console.log(selectedOP);
      console.log(exp);
      commonExpirencesOptions += `<option selected value="${exp}" >${exp}</option> `;
    } else {
      commonExpirencesOptions += `<option  value="${exp}" >${exp}</option> `;
    }
  });
}



// /////////////////////////////////////////////////

const tablesHolderHTML = document.querySelector("#tablesHolder");

async function displayExpertiseTable(initial = false) {
  tablesHolderHTML.innerHTML = ``;
  let tables = ``;
  if (commonExpirences.length === 0) {
    await extractCommonExpirences();
    commonExpirencesFun();
  }

  console.log(
    "displayExpertiseTable : userSelectedVerticals",
    userSelectedVerticals
  );
  userSelectedVerticals.map((v) => {
    console.log("displayExpertiseTable : userSelectedVerticals : v", v);
    let head = `
    <h6 style="font-weight: 600">
      Select Expertise (
      <b style="color: red">Vertical Selected : ${v.name}</b> )
    </h6>
    <label>Tick the box if applicable</label>`;
    let table = ``;
    v.subverticals.map((sv) => {
      console.log("displayExpertiseTable : userSelectedVerticals : sv", sv);
      let isDisabled = true;
      

      let rows = ``;
      let tglTxt = "";
      let randNum = Math.round(Math.random() * (9999 - 1000) + 1000);
      let rowIdT;
      sv.expertise.map((exp, index) => {
        let rowId = `rowId_${randNum + index}`;
        rowIdT = `rowId_${randNum + index}`;
        // console.log("displayExpertiseTable : userSelectedVerticals : exp", exp);
        let options = "";
        isDisabled = true;
        if (exp.subCategory) {
          exp.subCategory.map((Iop, subIndex) => {
            // rowId = `rowId_${randNum + index}_${subIndex}`;
            // console.log("displayExpertiseTable : sv : exp : Iop ", Iop);
            if (exp?.selected) {
              isDisabled = false;
            } else {
              isDisabled = true;
            }
            if (initial) {
              if (USER.cvAdded) {
                let flag = false;
                // console.log('USER.cv :', USER.cv);
                for (let i = 0; i < USER.cv.professions.length; i++) {
                  rowId = `rowId_${randNum + index}`;
                  const eachSelectedVExpertise = USER.cv.professions[i];
                  const cvv = eachSelectedVExpertise.ver;
                  if (flag) {
                    break;
                  }
                  // console.log('eachSelectedVExpertise', eachSelectedVExpertise);
                  for (let j = 0; j < eachSelectedVExpertise.svers.length; j++) {
                    const eachSelectedVSExpertise =
                      eachSelectedVExpertise.svers[j];
                    const cvsv = eachSelectedVSExpertise.sver;
                    if (flag) {
                      break;
                    }
                    // console.log('eachSelectedVSExpertise :', eachSelectedVSExpertise);
                    for (
                      let k = 0;
                      k < eachSelectedVSExpertise.profs.length;
                      k++
                    ) {
                      const eachSelectedExpertise =
                        eachSelectedVSExpertise.profs[k];
                        // console.log(eachSelectedExpertise);

                      const cvProf = eachSelectedExpertise.prof;
                      const cvDesigations = eachSelectedExpertise.designations;
                      const cvVal = eachSelectedExpertise.value;
  
                      // if (flag) {
                      //   break;
                      // }

                      for(let l = 0; l < eachSelectedExpertise.designations.length; l++) {
                        // console.log(eachSelectedExpertise.designations[l]);
                        const des = eachSelectedExpertise.designations[l];
                        // console.log(cvv, v._id);
                        // console.log(cvsv, sv.name);
                        // console.log(exp.category, cvProf);
                        //console.log(eachSelectedExpertise.designations[l], cvDesigations[l], cvDesigations.includes(des));

                        if (
                          cvv === v._id &&
                          sv.name === cvsv &&
                          exp.category === cvProf &&
                          cvDesigations.includes(des) 
                          // &&
                          // op === cvVal
                        ) {
                          commonSelectExpirencesFun(des)
                          // exp.value = op;
                          exp.selected = true;
                          isDisabled = false;
                          flag = true;
                          break;
                        }
                      }
  
                    }
                  }
                }

                if (flag) {
             
                  options += `
                  <div class="option"  > 
                    <input  type="checkbox" class="plus-minus" checked name="designation_checkbox" id="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}"  data-rowID="${rowId}" value="${Iop.name}" />
                    <label for="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}">${Iop.name}</label>
                  </div>
                `;

                

                } else {
                 
                  options += `
                  <div class="option"  > 
                    <input  type="checkbox" class="plus-minus" name="designation_checkbox" id="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}"  data-rowID="${rowId}" value="${Iop.name}" />
                    <label for="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}">${Iop.name}</label>
                  </div>
                `;
                }
              }
            } else {
              // console.log('exp.value', exp.value);
              // console.log('Iop', Iop);
              if(exp.value === Iop) {
                options += `
                  <div class="option"  > 
                    <input checked type="checkbox" class="plus-minus" checked name="designation_checkbox" id="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}"  data-rowID="${rowId}" value="${Iop.name}" />
                    <label for="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}">${Iop.name}</label>
                  </div>
                `;
              } else {
                if(Iop.name!="None" && Iop.name!="none" && Iop.name!="N"){
            
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
                    <label hidden for="${v._id}__${v.name}__${sv.name}__${exp.category}__${Iop.name}__${rowId}">Not Listed/Required</label>
                  </div>
                `;
                }
              }
            }
          });

          if (isDisabled) {
            
            tglTxt = "No";
          } else {
            console.log("came")
            tglTxt = "Yes";
          }
         
          rows +=
          `<tr>
            <td>${exp.category}</td>
            <td>
              <label class="switch">
              <input type="checkbox" name="slider_${rowId}" cat="toggle_btns" id="toggle_${rowId}"  data-rowid="${rowId}"  ${
                isDisabled ? "" : checkMe("toggle_"+rowId)
              }  onchange="sliderToggle(event)">
              <span class="slider round"></span>
              <span style="font-size: 12px;position: absolute;padding-top: 20px;padding-left: 10px;" id="${rowId}">${tglTxt}</span>
            </label>
            </td>
          
            <td style="">
              <div class="select-list" id="select-list_` +
            rowId +
            `" style="pointer-events:none;opacity:0.4"  >
                  <div class="title" id="title_` +
            rowId +
            
            `">Select Designation</div>
                  <div class="select-options" style="max-height:250px;overflow-y:scroll" disable onchange="optionSelected(event)" data-rowid="${rowId}" name="designation" id="designation_${rowId}">
                    ${options}
                  </div>
              </div>
            </td>
            <td>
              <select
                disabled
                id="exper_${rowId}"
                data-rowid="${rowId}" 
                class="selectpicker"
                name="expertise-${rowId}"
                style="width:100%;border-radius:10px;border:none;background-color:lightgray;padding:5px"
              >
              ${commonExpirencesOptions}
              </select>
            </td>
          </tr>`;
          function checkMe(id){
            
            setTimeout(function(){
              document.getElementById(id).checked="true"
              openDesignationDropdown(id,rowId)
            },500)
            
          }
          setTimeout(function(){
            if(options.includes("hidden")){
              document.getElementById("select-list_"+rowId).classList.remove("select-list")
              document.getElementById("title_"+rowId).innerHTML="----"
              document.getElementById("toggle_"+rowId)
            }
          },500)
          
        }
      });
      let tableHead = `
      <table id="table_${rowIdT.substring(6,8)}" class="table table-bordered">
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
      disabled: true,
    });
  });
}
function openDesignationDropdown(toggleId,rowId){
  document.getElementById("select-list_"+rowId).style.pointerEvents="all";
  document.getElementById("select-list_"+rowId).style.opacity=1;
  document.getElementById("exper_"+rowId).disabled=false;
  let eleRowId = rowId
  var table_id= ("table_"+eleRowId.substring(6,8))
  for(let i=0;i<document.querySelectorAll(`input[cat=toggle_btns]`,`table[id="table_${eleRowId.substring(6,7)}"]`).length;i++){
      
    let tog_id= document.querySelectorAll(`input[cat=toggle_btns]`)[i].id

    if( tog_id !="toggle_"+eleRowId && table_id.substring(6) == tog_id.substring(13,15)) {
      
      document.getElementById(tog_id).disabled=true;
    }
  }
  
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

const cvUrlHTML = document.querySelector("#cvUrl");
const verticalsBtnsHTML = document.querySelector("#verticalsBtns");
const verticalsTablesHTML = document.querySelector("#verticalsTables");
const editCvUrlHolderHTML = document.querySelector('#editCvUrlHolder');
const workCountryHTML = document.querySelector('#work-country');
const workStatesHTML = document.querySelector('#work-states');
const stsHTML = document.querySelector('#sts');

async function displayCvDetails() {
  if (USER.cvAdded) {
    cvUrlHTML.href = USER.cv.url;
    verticalsBtnsHTML.innerHTML = ``;
    workCountryHTML.innerText = USER.cv.workCountry;
    let states ="<ul>";
    USER.cv.workStates.map(s => {
      states += `<li>${s}</li>`
    })
    states += `</ul>`;
    workStatesHTML.innerHTML = states;
    console.log(USER.cv.workCountry)
    //cvFormHTML['country'].value = USER.cv.workCountry;
    let optionsState = ""
    let optionsCountry="";
    document.getElementById("sts").innerHTML = `
		<select onchange="selectedState(event)" style="padding: 7px;" name ="state"  id="state" multiple >`;
    USER.cv.workStates.map((s) => {
      optionsState += `<option value="${s}" selected>${s}</option>`;
      oldStateArr.push(s)
    });
    document.getElementById("cts").innerHTML=`
     <select style="padding: 7px;width: 85%;"  id="country" name ="country" multiple></select> 
    `
    USER.cv.workCountry.map((c) => {
      optionsCountry+= `<option value="${c}" selected>${c}</option>`;
      oldCountryArr.push(c)
    });
  
   
 
    document.getElementById('country').innerHTML+=optionsCountry
    populateCountries("country", "state");
    
   // populateStates("country","state")
    setTimeout(function () {
   
      document.getElementById("state").innerHTML += optionsState
      new Choices("#state", {
        removeItemButton: true,
        maxItemCount: 100,
        searchResultLimit: 100,
        renderChoiceLimit: 100,
      });
      
      document.getElementById("stateOpt").style.display = "block";
    }, 500);
      
    USER.cv.verticals.map((v, i) => {
      verticalsBtnsHTML.innerHTML += `
      <button type="button" class="btn btn-info" style="background-color: rgb(31, 126, 189);" data-parent="#acd" data-toggle="collapse" href="#${v.id}">${v.name} ></button>
      `;
    });
    
    // console.log('displayCvDetails : cv', USER.cv);
    USER.cv.professions.map(async (v) => {
      console.log('displayCvDetails : cv : v', v);
      let name = await getNameOfId(v.ver);
      let head = `
      <div id="${v.ver}" class="collapse">
        <table class="table table-bordered">
          <thead class="thead-dark">
            <tr style="text-align: center">
              <th
                style="text-align: center; font-weight: 600"
                scope="col"
              >
                Sub-Vertical [${name}]
              </th>
              <th
                style="text-align: center; font-weight: 600"
                scope="col"
              >
                Proffestions
              </th>
              <th
                style="text-align: center; font-weight: 600"
                scope="col"
              >
                Designations
              </th>
              <th
                style="text-align: center; font-weight: 600"
                scope="col"
              >
                Expertice
              </th>
            </tr>
          </thead>
          <tbody>
      `;

      let body = ``;
      let rows = "";
      v.svers.map((sv) => {
        sv.profs.map((e) => {
          rows += `
          <tr>
            <td>
            ${sv.sver}
            </td>
            <td>
            ${e.prof}
            </td>
            <td>
              ${e.designations.join(', ')}
            </td>
            <td>
              ${e.value}
            </td>
          </tr>
          `;
        });
        body = rows;
      });

      let end = `
        </table>
      </div>
      `;

      let whole = head + body + end;
      verticalsTablesHTML.innerHTML += whole;
    });

      
    editCvUrlHolderHTML.innerHTML = `
    <a target="_blank" href="${USER.cv.url}" >
      <label
        class="btn btn-tertiary js-labelFile"
        style="background-color: transparent"
      >
        <i class="icon fa fa-eye"></i>
        <span class="js-fileName"
          >View Your CSV</span
        >
      </label>
    </a>
    
    `
    ;
  }
}

// //////////////////////////////////////////

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
