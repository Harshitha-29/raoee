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

// ///////////////////////////////

const cvFormHTML = document.querySelector("#cvForm");
// let FILE = false;
// let FILE_NAME = false;

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
  // nowuiDashboard.showNotification(
  //   "top",
  //   "center",
  //   "Data updated successfully",
  //   "primary"
  // );
  getUserDetails({ uid: USER_ID, userType: USER.userType });
  setTimeout(function () {
    location.reload();
  }, 2000);
};

cvFormHTML.addEventListener("submit", updateCv);

// ////////////////////////////////////////////////////////////


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

// ///////////////////////

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

// ////////////////////////////

function checkFileType({ file, fileTypes }) {
  // console.log('checkFileType : file ',file);
  let fExt = file.name.split(".");
  fExt = fExt[fExt.length - 1];

  const fileIndex = fileTypes.findIndex((type) => type === fExt);
  // console.log(`checkFileType : fileIndex `,fileIndex);
  if (fileIndex === -1) {
    return {
      status: false,
      message: "Wrong file extension uploaded",
    };
  }

  if (file.size > 5000000) {
    return {
      status: false,
      message: "File too large",
    };
  }

  return {
    status: true,
  };
}

// ////////////////////////////



