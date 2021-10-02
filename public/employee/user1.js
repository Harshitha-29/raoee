const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ////////////////////////////////////////////
let USER = false;
let USER_REF = false;
let USER_ID = false;

auth.onAuthStateChanged((user) => {
  USER_ID = user.uid;
  getUserDetails({ uid: user.uid, userType: user.displayName });
});
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
    // $('#username').text(USER.fname)
    // $('#userimg').attr('src',USER.basicInfo.imgUrl);
    displayUserDetails();
    
  } catch (error) {
    console.error(error);
    if (retryUser < 2) {
      retryUser++;
      alert(`Retrying.  Attempt: ${retryUser}`);
      getUserDetails({ uid, userType });
    } else {
      return (window.location.href = `./../authentication/auth.html`);
    }
  }
}

// /////////////////////////////////////////////
const editCvBtnHTML = document.querySelector("#editCvBtn");
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

editCvBtnHTML.addEventListener("change", toggleCvDisplay);

// ////////////////////////////////////////
const userBasicFormHTML = document.querySelector("#userBasicForm");
const editBasicInfoBtnHTML = document.querySelector("#editBasicInfoBtn");
const updateBasicInfoBtnHTML = document.querySelector("#updateBasicInfoBtn");

const toggleBasicInfoDisplay = (e) => {
  if (e?.target?.checked) {
    userBasicFormHTML["fname"].readOnly = false;
    userBasicFormHTML["lname"].readOnly = false;
    userBasicFormHTML["phone"].readOnly = false;
    userBasicFormHTML["address"].readOnly = false;
    userBasicFormHTML["city"].readOnly = false;
    userBasicFormHTML["state"].readOnly = false;
    userBasicFormHTML["country"].readOnly = false;
    userBasicFormHTML["postal-code"].readOnly = false;
    userBasicFormHTML["about-me"].readOnly = false;
    updateBasicInfoBtnHTML.style.display = "block";
  } else {
    userBasicFormHTML["fname"].readOnly = true;
    userBasicFormHTML["lname"].readOnly = true;
    userBasicFormHTML["phone"].readOnly = true;
    userBasicFormHTML["address"].readOnly = true;
    userBasicFormHTML["city"].readOnly = true;
    userBasicFormHTML["state"].readOnly = true;
    userBasicFormHTML["country"].readOnly = true;
    userBasicFormHTML["postal-code"].readOnly = true;
    userBasicFormHTML["about-me"].readOnly = true;
    updateBasicInfoBtnHTML.style.display = "none";
  }
};

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
  fullNameProfileHTML.innerHTML = `<h5 class="title" style="color: black">${USER.fname} ${USER.lname}</h5>`;
  if (USER.basicInfoAdded) {
    aboutMeProfileHTML.innerText = USER.basicInfo.aboutMe;
    userBasicFormHTML["address"].value = USER.basicInfo.address;
    userBasicFormHTML["city"].value = USER.basicInfo.city;
    userBasicFormHTML["state"].value = USER.basicInfo.state;
    userBasicFormHTML["country"].value = USER.basicInfo.country;
    userBasicFormHTML["postal-code"].value = USER.basicInfo.postalCode;
    userBasicFormHTML["about-me"].value = USER.basicInfo.aboutMe;
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

  const address = userBasicFormHTML["address"].value;
  const city = userBasicFormHTML["city"].value;
  const state = userBasicFormHTML["state"].value;
  const country = userBasicFormHTML["country"].value;
  const postalCode = userBasicFormHTML["postal-code"].value;
  const aboutMe = userBasicFormHTML["about-me"].value;

  const data = {
    ...USER,
    fname,
    lname,
    phone,
    basicInfo: {
      address,
      city,
      state,
      country,
      postalCode,
      aboutMe,
    },
    basicInfoAdded: true,
  };

  try {
    await USER_REF.update(data);
    alert("Info updated Successfully");

    getUserDetails({ uid: USER_ID, userType: USER.userType });
  } catch (error) {
    console.error(errpr);
    alert(`Try again. Reason: ${error.message}`);
  }
};

userBasicFormHTML.addEventListener("submit", updateBasicInfo);

// /////////////////////////////////////////////////////////

function getUserPreferences() {
  const cvVerticals = [];

  cvFormHTML.querySelectorAll(`select[name="expertise"]`).forEach((e) => {
    const all = e.value.split("__");
    const selectedVId = all[0];
    const selectedVName = all[1];
    const selectedSubV = all[2];
    const category = all[3];
    const value = all[4];

    cvVerticals.push({
      verName: selectedVName,
      ver: selectedVId,
      subVertical: selectedSubV,
      category,
      value,
    });
  });

  const vv = [];
  const sv = [];
  const ee = [];
  cvVerticals.map((cvv) => {
    new Error("Stop");
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

const cvFormHTML = document.querySelector("#cvForm");
let FILE = false;
let FILE_NAME = false;

const updateCv = async (e) => {
  e.preventDefault();

  const { verticals, subVerticals, expertise } = getUserPreferences();

  const resStorage = await uploadFileToStorage({ ref: `${USER.userType}s` });
  retryStorage = 0;
  if (!resStorage.status) {
    alert(resStorage.message);
    return;
  }

  const resURL = await getUrlOfFile({ ref: `${USER.userType}s` });
  retryURL = 0;
  if (!resURL.status) {
    alert(resURL.message);
    return;
  }


  let data = {
    verticals,
    subVerticals,
    expertise,
    fileName: FILE_NAME,
    url: resURL.data.url,
    userType: USER.userType,
    userId: USER.uid,
    fname: USER.fname,
    lname: USER.lname,
  };

  const resDB = await uploadCVToDb({ data });
  retryDB = 0;
  if (!resDB.status) {
    alert(resDB.message);
    return;
  }

  data = {
    verticals,
    subVerticals,
    expertise,
    fileName: FILE_NAME,
    url: resURL.data.url,
    collectionName: resDB.data.collectionName,
    docId: resDB.data.docId,
  };

  const resUpdateCvDb = await updateCollectionsDb({
    collectionName: resDB.data.collectionName,
  });
  if (!resUpdateCvDb.status) {
    alert(resDB.message);
    // return;
  }

  if (USER.cvAdded) {
    const resDeleteStorage = await deleteStorage({
      ref: `${USER.userType}s/${USER.uid}`,
      fileName: USER.cv.fileName,
    });
    if (!resDeleteStorage.status) {
      alert(resDB.message);
      // return;
    }

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

  alert("Record Added Successfully");
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
  FILE_NAME = `${new Date().valueOf()}__${FILE.name}`;
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
      VERTICALS_DATA[i].subVerticals[j] = { name: VERTICALS_DATA[i].subVerticals[j] };
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

  VERTICALS = VERTICALS_DATA.map(v => v);

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
      displaySubVerticalDropdown(true)
    }, 2000);
  } else {
    VERTICALS.map((ver) => {
      options += `<option value="${ver.name}">${ver.name}</option>`;
    });
  }

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


  $("#choices-multiple-remove-button").selectedIndex = "1";
}

// ///////////////////////////////////////////

let verticalsSelected = [];
let userSelectedMainVerticals = [];
let prevVerticals = [];

function verticalSelected(e) {
  userSelectedMainVerticals.length = 0;

  if(e) {
    verticalsSelected = Array.from(e.target.selectedOptions).map(
      (x) => x.value ?? x.text
    );
  } else {
    verticalsSelected = Array.from(document.querySelector('#choices-multiple-remove-button').selectedOptions).map(
      (x) => x.value ?? x.text
    );
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
  console.log(userSelectedMainVerticals);
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

  if(initial) {
    if(USER.cvAdded) {
      USER.cv.subVerticals.map(sv => {
        const name = getNameOfId(sv.ver);
        sv.sver.map(svv => {
          subVerticalsSelected.push(`${name}__${svv}`)
        })
      })
    }
  }
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

  if(initial) {
    subVerticalSelected(false, true);
  }

  // console.log(subVerticalsSelected);
  // if(subVerticalsSelected.length > 0) {
  //   console.log('if', subVerticalsSelected);
  //   getSelectedVerticals();
  // }
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
// add dedlet funtionailty
  subVerticalsSelected.push(...svs);
  console.log(subVerticalsSelected);
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

    // console.log(userSelectedMainVerticals);
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
  if(initial) {
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

  if(initial) {
  displayExpertiseTable(true);
  } else {
    displayExpertiseTable();

  }

}

// /////////////////////////////////////////////////

const tablesHolderHTML = document.querySelector("#tablesHolder");

function displayExpertiseTable(initial = false) {
  tablesHolderHTML.innerHTML = ``;
  let tables = ``;
  userSelectedVerticals.map((v) => {
    let head = `
    <h6 style="font-weight: 600">
      Select Expertise (
      <b style="color: red">Vertical Selected : ${v.name}</b> )
    </h6>
    <label>Tick the box if applicable</label>`;
    let table = ``;
    v.subverticals.map((sv) => {
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
      let i=0;
      var Gop="";
      sv.expertise.map((exp) => {
        let options = "";
        
        exp.tags.map((op) => {
          Gop=op;
          if(initial) {
            if(USER.cvAdded) {
              // USER.cv.
              let flag = false;
              for(let i = 0; i < USER.cv.expertise.length; i++) {
                const eachSelectedVExpertise = USER.cv.expertise[i];
                const cvv = eachSelectedVExpertise.ver;
                if(flag) {
                  break;
                }

                for(let j = 0; j < eachSelectedVExpertise.svers.length; j++) {
                  const eachSelectedVSExpertise = eachSelectedVExpertise.svers[j];
                  const cvsv = eachSelectedVSExpertise.sver;
                  if(flag) {
                    break;
                  }
                  for(let k = 0; k < eachSelectedVSExpertise.expertise.length; k++) {
                   const eachSelectedExpertise = eachSelectedVSExpertise.expertise[k];
                    const cvCat = eachSelectedExpertise.category;
                    const cvVal = eachSelectedExpertise.value;

                    if(flag) {
                      break;
                    }

                    if(cvv === v._id && sv.name === cvsv && exp.category === cvCat && op === cvVal) {
                      flag = true;
                      break;
                    }
                  }

                }
              }

              if(flag) {
                options += `
                <option value="${v._id}__${v.name}__${sv.name}__${exp.category}__${op}" selected >${op}</option>
              `;
              } else {
                options += `
                <option value="${v._id}__${v.name}__${sv.name}__${exp.category}__${op}" >${op}</option>
              `;
              }
            }
            
          } else {
            options += `
            <option value="${v._id}__${v.name}__${sv.name}__${exp.category}__${op}" >${op}</option>
          `;
          }
          
        });
      
        rows += `
        <tr>
        <td>${exp.category}</td>
        <td>
          <label class="switch">
            <input type="checkbox" id="switch+`+v._id+`+`+i+`+`+sv.name.split(" ").join("")+`+`+exp.category.split(" ").join("")+`+`+Gop.split(" ").join("")+`" onclick=enableSwitch("switch+`+v._id+`+`+i+`+`+sv.name.split(" ").join("")+`+`+exp.category.split(" ").join("")+`+`+Gop.split(" ").join("")+`","options+`+v._id+`+`+i+`+`+sv.name.split(" ").join("")+`+`+exp.category.split(" ").join("")+`+`+Gop.split(" ").join("")+`") >
            <span class="slider round"></span>
            <span style="font-size: 12px;position: absolute;padding-top: 20px;padding-left: 10px;">No</span>
          </label>
        </td>
        <td>
          <select
            class="selectpicker"
            name="expertise"
            disabled
            id="options+`+v._id+`+`+i+`+`+sv.name.split(" ").join("")+`+`+exp.category.split(" ").join("")+`+`+Gop.split(" ").join("")+`"
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
const cvUrlHTML = document.querySelector("#cvUrl");
const verticalsBtnsHTML = document.querySelector("#verticalsBtns");
const verticalsTablesHTML = document.querySelector("#verticalsTables");

async function displayCvDetails() {
  if (USER.cvAdded) {
    cvUrlHTML.href = USER.cv.url;
    verticalsBtnsHTML.innerHTML = ``;

    USER.cv.verticals.map((v, i) => {
      verticalsBtnsHTML.innerHTML += `
      <button type="button" class="btn btn-info" style="background-color: rgb(31, 126, 189);" data-parent="#acd" data-toggle="collapse" href="#${v.id}">${v.name} ></button>
      `;
    });

    USER.cv.expertise.map(async (v) => {
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
                Expertise
              </th>
              <th
                style="text-align: center; font-weight: 600"
                scope="col"
              >
                Experience
              </th>
            </tr>
          </thead>
          <tbody>
      `;

      let body = ``;
      let rows = "";
      v.svers.map((sv) => {
        sv.expertise.map((e) => {
          rows += `
          <tr>
            <td>
            ${sv.sver}
            </td>
            <td>
              ${e.category}
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
  }
}

// //////////////////////////////////////////

let ID_NAME_VERTICALS = [];

async function storeAllNamesIds() {
  ID_NAME_VERTICALS = VERTICALS.map(v => {return{name: v.name, id: v._id}});
}

// function storeNameOfId({ name, id }) {
//   if(ID_NAME_VERTICALS.length === 0) storeAllNamesIds(); 
//   let flag = true;
//   for (let i = 0; i < ID_NAME_VERTICALS.length; i++) {
//     const v = ID_NAME_VERTICALS[i];
//     if (v.id === id) {
//       flag = false;
//     }
//   }

//   if (flag) {
//     ID_NAME_VERTICALS.push({ name, id });
//   }
// }

// //////////////////////////////////////////

function getNameOfId(id) {
  // if(ID_NAME_VERTICALS.length === 0) await storeAllNamesIds();

  let name = ID_NAME_VERTICALS.filter((v) => v.id === id);
  name = name[0].name;
  console.log(name);
  return name;
}

// //////////////////////////////////////////

let IMG = false;
let IMG_NAME = false;

const userImageHTML = document.querySelector("#userImage");

const uploadImgLocal = (e) => {
  if (!USER.basicInfoAdded) {
    alert("Please add all your details in order to update the profile image");
    return;
  }
  IMG = e.target.files[0];
  IMG_NAME = `${new Date().valueOf()}__${IMG.name}`;
  uploadImgToDB();
};

userImageHTML.addEventListener("change", uploadImgLocal);
// //////////////////////////////////////////

let retryImgStorage = 0;
const uploadImgToStorage = async ({ ref }) => {
  try {
    await storage.ref(`${ref}/${USER.uid}`).child(IMG_NAME).put(IMG);
    return {
      status: true,
      message: "Uplading to file to storage success",
    };
  } catch (error) {
    console.error(error);
    if (retryImgStorage < 2) {
      retryImgStorage++;
      alert(`Retry. Attempt: ${retryImgStorage} Reason: ${error.message} `);
      uploadImgToStorage({ ref });
    } else {
      return {
        status: false,
        message: `Failed to upload file to stoarge. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////

let retryImgURL = 0;
const getUrlOfImg = async ({ ref }) => {
  try {
    const url = await storage
      .ref(`${ref}/${USER.uid}`)
      .child(IMG_NAME)
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
    if (retryImgURL < 2) {
      retryImgURL++;
      alert(`Retry. Attempt: ${retryImgURL} Reason: ${error.message} `);
      getUrlOfImg({ ref });
    } else {
      return {
        status: false,
        message: `Failed to fetch the file from stoarge. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////

async function uploadImgToDB() {
  const data = USER;

  if (USER.basicInfo.imgUrl) {
    const resDelete = await deleteStorage({
      ref: `${USER.userType}s/${USER_ID}`,
      fileName: USER.basicInfo.imgName,
    });
  }

  const resStorage = await uploadImgToStorage({ ref: `${USER.userType}s` });

  if (!resStorage.status) {
    alert(resStorage.message);
    return;
  }
  const resUrl = await getUrlOfImg({ ref: `${USER.userType}s` });
  if (!resUrl.status) {
    alert(resUrl.message);
    return;
  }

  data.basicInfo.imgName = IMG_NAME;
  data.basicInfo.imgUrl = resUrl.data.url;

  await USER_REF.update(data);
  getUserDetails({ uid: USER_ID, userType: USER.userType });
  alert("Successfully updated");
}

// /////////////////////////////////////////////////////////

function fillUpCvDetails() {}

// /////////////////////////////////////////////////////////

// NOT TO BE DELETED-----

// let vIndex = cvVerticals.findIndex((v) => v === selectedV);

// if (vIndex === -1) {
//   cvVerticals.push(selectedV);
//   console.log(cvVerticals);
//   console.log(cvSubVerticals);
//   cvSubVerticals.push({
//     ver: selectedV,
//     subVerticals: [],
//   });
//   console.log(cvSubVerticals);
// }

// console.log(cvSubVerticals);
// vIndex = cvSubVerticals.findIndex((v) => v.ver === selectedV);
// console.log(vIndex);
// let svIndex = cvSubVerticals[vIndex].subVerticals.findIndex((sv) => {
//   console.log(sv);
//   console.log(selectedSubV);
//   return sv === selectedSubV;
// });
// console.log(svIndex);
// if (svIndex === -1) {
//   cvSubVerticals[vIndex].subVerticals.push(selectedSubV);
//   console.log(cvSubVerticals);
//   cvExpertise.push({
//     ver: selectedV,
//     subVerticals: [{ subVertical: selectedSubV, extertise: [] }],
//   });
// }

// vIndex = cvExpertise.findIndex((v) => v.ver === selectedV);
// svIndex = cvExpertise[vIndex].subVerticals.findIndex(
//   (sv) => sv.subVertical === selectedSubV
// );
// console.log(cvExpertise);
// console.log(cvExpertise[vIndex].subVerticals);
// console.log(cvExpertise[vIndex].subVerticals[svIndex]);
// cvExpertise[vIndex].subVerticals[svIndex].extertise.push({ category, value });

// ////////////////////////////////////////////////////////


var arr=[];
function enableSwitch(swithId,optionsId){
  // alert(id)
  // alert(df)
 
  // alert(document.getElementById(optionsId).value)  


  if(document.getElementById(swithId).checked==true){
    document.getElementById(optionsId).disabled=false;
      if(!arr.includes(optionsId))
        arr.push(optionsId)
  }
  //arr=["id1","id2","id3"]
  //id2 index=1
  else{
    document.getElementById(optionsId).disabled=true;
   // arr.pop(optionsId)
   
      const index = arr.indexOf(optionsId);
      if (index > -1) {
        arr.splice(index, 1);
      }
    
  }
  console.log(arr) //Array 
  console.log(document.getElementById(arr[0]).value) // Value
  var { verticals, subVerticals, expertise } = getUserPreferences1();
  console.log(verticals, subVerticals, expertise)
}

function getUserPreferences1() {
  

  const cvVerticals = [];

    arr.forEach((ee) => {
      console.log("-----------------")
      console.log(ee)
    var e = document.getElementById(ee).value
   
    console.log(e)

    const all = e.split("__");
    const selectedVId = all[0];
    const selectedVName = all[1];
    const selectedSubV = all[2];
    const category = all[3];
    const value = all[4];

    cvVerticals.push({
      verName: selectedVName,
      ver: selectedVId,
      subVertical: selectedSubV,
      category,
      value,
    });
  });

  const vv = [];
  const sv = [];
  const ee = [];
  cvVerticals.map((cvv) => {
    new Error("Stop");
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