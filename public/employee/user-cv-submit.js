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

let FILE = false;
let FILE_NAME = false;
const cvFormHTML = document.querySelector("#cvForm");

const updateCv = async (e) => {
  e.preventDefault();

  if (!USER.basicInfoAdded) {
    alert("Before adding CV, Please add basic information first .");
    return;
  }

  document.getElementById("progressBar2").style.display = "block";

  const workCity = cvFormHTML["work-city"].value;

  if (countrySelected.length === 0) {
    // countrySelected = USER_SELECTED_COUNT;
    // statesSelected = USER_SELECTED_STATE;
    if(countrySelected.length==0){
      nowuiDashboard.showNotification('top','center',"Please select country","primary");
      return;
    }
    //alert('Enter country');
    // nowuiDashboard.showNotification('top','center',"Please enter the state where user emplyee wants to work","primary");
    //return;

    // if (oldStateArr.length == 0) {
    //   document.getElementById("progressBar2").style.display = "none";
    //   // nowuiDashboard.showNotification('top','center',"Please enter the state where user emplyee wants to work","primary");
    //   return;
    // } else {
    //   statesSelected = oldStateArr.map((s) => s);
    // }
    // if (oldCountryArr.length == 0) {
    //   document.getElementById("progressBar2").style.display = "none";
    //   // nowuiDashboard.showNotification('top','center',"Please enter the state where user emplyee wants to work","primary");
    //   return;
    // } else {
    //   countrySelected = oldCountryArr.map((s) => s);
    // }
  }

  const {allSelected, allSelectedSv, allSelectedV} = getUserPreferences();
  let resStorage, resURL;
  let data = {};

  if (FILE_NAME) {
    resStorage = await uploadFileToStorage({ ref: `employees/${USER_ID}`, fileName: FILE_NAME, file: FILE  });
    if (!resStorage.status) {
      alert(resStorage.message);
      return;
    }

    resURL = await getUrlOfFile({ ref: `employees/${USER_ID}`, fileName: FILE_NAME });
    if (!resURL.status) {
      alert(resURL.message);
      return;
    }

    data.url = resURL.data.url;
    data.fileName = FILE_NAME;

    if (USER.cvAdded) {
      // const resDeleteStorage = await deleteStorage({
      //   ref: `employees/${USER_ID}`,
      //   fileName: USER.cv.fileName,
      // });
      // if (!resDeleteStorage.status) {
      //   alert(resDB.message);
      // }
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

  data.verticals = allSelectedV;
  data.svers = allSelectedSv;
  data.all = allSelected;
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

  let cvCollectionName = ``;
  data.verticals.map((v) => {
    cvCollectionName += `${v.vId}_`;
  });


  const resDB = await setDbData({ collectionName: cvCollectionName, docId: USER_ID, dataToUpdate: data  });
  if (!resDB.status) {
    alert(resDB.message);
    return;
  }

  data = {
    verticals : allSelectedV,
    svers : allSelectedSv,
    all: allSelected,
    fileName: FILE_NAME ? FILE_NAME : USER.cv.fileName,
    url: FILE_NAME ? resURL.data.url : USER.cv.url,
    collectionName: cvCollectionName,
    docId: USER_ID,
    workCountry: countrySelected,
    workStates: statesSelected,
    workCity: workCity,
  };

  const resUpdateCvDb = await updateDbDoc({
    ref: USER_REF, dataToUpdate: {...USER, cv: {...data}, cvAdded: true}, resetData: true
  });

  if (!resUpdateCvDb.status) {
    alert(resDB.message);
    // return;
  }

  // if (USER.cvAdded) {
  //   const resDeleteCvDb = await deleteDbDoc({
  //     collectionName: USER.cv.collectionName,
  //     docId: USER.cv.docId,
  //   });
  //   if (!resDeleteCvDb.status) {
  //     alert(resDB.message);
  //     // return;
  //   }
  // }


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
  // getUserDetails({ uid: USER_ID, userType: USER.userType });
  // setTimeout(function () {
    location.reload();
  // }, 2000);
};

cvFormHTML.addEventListener("submit", updateCv);

// ////////////////////////////////////////////////////////////


function getUserPreferences() {
  const all = [];
  const allSelectedV = [];
  const allSelectedSv = [];

  const allEles = document.querySelectorAll(`input[name=slider_checkbox]:checked`);
  for (let i = 0; i < allEles.length; i++) { 
    const e = allEles[i];
    let id = e.parentElement.id;
    id = id.split('_')[1];
    let idNum = id;
    id = `r_${idNum}_des`;
    let des = document.querySelector(`#${id}`);
    let allDesSelected = [];
    for(let  i = 0; i < des.selectedOptions.length; i++) {
      const node = des.selectedOptions[i];
      const dataset = node.dataset.checkdata;
      const vId = dataset.split('__')[0];
      const vName = dataset.split('__')[1];
      const svName = dataset.split('__')[2];

      const vIndex = allSelectedV.findIndex(v => v.vId === vId);
      if(vIndex === -1) {
        allSelectedV.push({vId, vName})
        allSelectedSv.push({
          vId,
          vName,
          svers: [svName]
        })
      }

      const svIndex = allSelectedSv.findIndex(v => v.vId === vId);
      if(svIndex !== -1) {
        console.log(allSelectedSv[svIndex].svers);
        const i = allSelectedSv[svIndex].svers.findIndex(v => v === svName);
        console.log(i);
        if(i === -1) {
          allSelectedSv[svIndex].svers.push(svName)
        }
      } 
      console.log('allSelectedSv', allSelectedSv);

      // const prof = dataset.split('__')[3];
      // const des = dataset.split('__')[4];
      allDesSelected.push(dataset)
    }
    id = `r_${idNum}_exp`;
    const exp = document.querySelector(`#${id}`);
    all.push({des: allDesSelected, exp: exp.value})
  }

  const allSelected = [];
  all.map((wholeValue, i) => {
    console.log('wholeValue', wholeValue);

    wholeValue.des.map(d => {
      console.log('d', d);
      const vId = d.split('__')[0];
      const vName = d.split('__')[1];
      const svName = d.split('__')[2];
      const prof = d.split('__')[3];
      const des = d.split('__')[4];

      console.log('allSelected', allSelected);
      const vIndex = allSelected.findIndex((cv, index) => cv.vId === vId);
      console.log('vIndex', vIndex);
      if(vIndex > -1) {
        const svIndex = allSelected[vIndex].svers.findIndex(cv => cv.svName === svName);
        console.log('svIndex', svIndex);
        if(svIndex > -1) {
          allSelected[vIndex].svers[svIndex].des.push(des);
        } else {
          allSelected[vIndex].svers.push({
            svName: svName,
            prof: prof,
            des: [des],
            exp: wholeValue.exp
          })
        }
      } else {
        allSelected.push({
          vId: vId,
          vName: vName,
          svers : [{
            svName: svName,
            prof: prof,
            des: [des],
            exp: wholeValue.exp
          }]
        })
      }
      console.log('allSelected', allSelected);
    })
  })


  return {allSelected, allSelectedSv, allSelectedV };
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



