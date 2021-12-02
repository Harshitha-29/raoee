const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ////////////////////////////////////////////

// UI
let empStatusDrop = new Choices("#employmentStatus", {
  removeItemButton: true,
  maxItemCount: 100,
  searchResultLimit: 100,
  renderChoiceLimit: 100,
}).disable();
let internStatusDrop = new Choices("#internStatus", {
  removeItemButton: true,
  maxItemCount: 100,
  searchResultLimit: 100,
  renderChoiceLimit: 100,
}).disable();
let qualificationDrop = new Choices("#qualification", {
  removeItemButton: true,
  maxItemCount: 100,
  searchResultLimit: 100,
  renderChoiceLimit: 100,
}).disable();


// ////////////////////////////////////////////

let USER = false;
let USER_REF = false;
let USER_ID = false;
let USER_RAW = false;

// //////////////////////////////////////////////

auth.onAuthStateChanged(async (user) => {
  if (!user) { 
    window.location.href =  `./../authentication/auth.html`
  }

  USER_RAW = user;
  USER_ID = user.uid;
  // console.log('onAuthStateChanged : user.displayName :',user.displayName);
  // if (user.emailVerified === false) {
  //   $("#exampleModalCenter").modal({
  //     backdrop: "static",
  //     keyboard: false,
  //     show: true,
  //   });
  //   document.getElementById("emailID").innerHTML = user.email;
  //   return;
  // }

  const userDetailsRes = await getDbData({
    collectionName: 'employees',
    docId: USER_ID
  });
  USER_REF = userDetailsRes.ref;
  USER = userDetailsRes.data;
  displayAuthSigns();
  displayUserDetails();
  if(USER.cv) {
    displayUserCvDetails();
  }
});


// //////////////////////////////////////////////

const topbarUsernameHTML = document.querySelector("#topbar-username");
const topbarImgHTML = document.querySelector("#topbar-img");

function displayAuthSigns() {
  topbarUsernameHTML.innerHTML = `Welcome ${USER.fname}`;
  if (USER.basicInfoAdded && USER.basicInfo.imgUrl) {
    topbarImgHTML.src = USER.basicInfo.imgUrl;
  }
}

// ////////////////////////////////////////////

const fullNameProfileHTML = document.querySelector("#fullNameProfile");
const aboutMeProfileHTML = document.querySelector("#aboutMeProfile");
const blahHTML = document.querySelector("#blah");
const editCvBtnHTML = document.querySelector("#editCvBtn");
const uploadViewCvSliderHTML = document.querySelector("#upload-view-cv-slider");
const cvInfoHolderHTML = document.querySelector("#cvInfoHolder");
const cvEditHolderHTML = document.querySelector("#cvEditHolder");

function displayUserDetails() {
  topbarImgHTML.src = USER.img;
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
  }
  blahHTML.src = USER.img || `../assets/img/userProfile.png`;

  if (!USER.cvAdded) {
    editCvBtnHTML.checked = true;
    cvEditHolderHTML.style.display = "block";
    cvInfoHolderHTML.style.display = "none";
    editCvBtnHTML.disabled = true;
  } else {
    setTimeout(() => {
      verticalsSelected(null, true);
    }, 1500);
  }
}

// ////////////////////////////////////////////

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
//editCvBtnHTML.disabled = true;

uploadViewCvSliderHTML.addEventListener("change", toggleUploadCvDisplay);

// setTimeout(() => {
//   //editCvBtnHTML.disabled = false;
//   if(!USER.cvAdded) {
//     uploadViewCvSliderHTML.checked = true;
//     uploadViewCvSliderHTML.disabled = true;
//   } else {
//     document.getElementById("cv-file").style.display = "none";
//     document.getElementById("uploadNewCv").style.display = "none";
//     document.getElementById("editCvUrlHolder").style.display = "block";
//   }
// }, 2000);


// ////////////////////////////////////////////

function displayCountriesStates() {
  let optionsState = ""
  let optionsCountry="";
  document.getElementById("sts").innerHTML = `
		<select onchange="selectedState(event)" style="padding: 7px;" name ="state"  id="state" multiple >`;
   
  document.getElementById("cts").innerHTML=`
    <select style="padding: 7px;width: 85%;"  id="country" name ="country" multiple></select> 
  `

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
      placeholder: 'Chosse Country first',
    });
    
    document.getElementById("stateOpt").style.display = "block";
  }, 500);
}
displayCountriesStates();
// ////////////////////////////////////////////

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

editBasicInfoBtnHTML.addEventListener("change", toggleBasicInfoDisplay);

// ////////////////////////////////////////////
const userImageHTML = document.querySelector("#userImage");

const uploadImgLocal = async(e) => {
  if (!USER.basicInfoAdded) {
    // nowuiDashboard.showNotification('top','center',"Please add all your details in order to update the profile image","primary");
    blahHTML.src = `../assets/img/userProfile.png`;
    return;
  }
  readURL(e);
  document.getElementById("progressBar").style.display="block"
  let img = e.target.files[0];
  let imgName = `${new Date().valueOf()}__${img.name}`;
  await uploadFileToStorage({ref: `employees/${USER_ID}`, fileName: imgName, file: img});
  const imgRes = await getUrlOfFile({ref: `employees/${USER_ID}`, fileName: imgName });
  if(!imgRes.status) {
    alert(imgRes.message);
    return;
  }
  const link = imgRes.data.url;
  await updateDbDoc({ref: USER_REF, docData: USER, dataToUpdate: {imgName: imgName, img: link}})
  document.getElementById("progressBar").style.display="none"
  blahHTML.src=link;
  
};

userImageHTML.addEventListener("change", uploadImgLocal);

// /////////////////////////////////////////////
const userBasicFormHTML = document.querySelector("#userBasicForm");

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

  if (USER.cvAdded) {
    if (
      fname !== USER.fname ||
      lname !== USER.lname ||
      lname !== USER.lname
    ) {
      const updateRes = await updateDbDoc({collectionName: USER.cv.collectionName, docId: USER.cv.docId, dataToUpdate: {
        fname, lname
      }, resetData: false})
      // if(updateRes.status) {
        
      // }
    }
  }

  const res = await updateDbDoc({ref: USER_REF, dataToUpdate: data, resetData: false});
  if(res.status) {
    nowuiDashboard.showNotification(
      "top",
      "center",
      "Basic Data updated Successfully",
      "primary"
    );
  }

};

userBasicFormHTML.addEventListener("submit", updateBasicInfo);

// ////////////////////////////////////


const cvUrlHTML = document.querySelector("#cvUrl");
const verticalsBtnsHTML = document.querySelector("#verticalsBtns");
const verticalsTablesHTML = document.querySelector("#verticalsTables");
const editCvUrlHolderHTML = document.querySelector('#editCvUrlHolder');
const workCountryHTML = document.querySelector('#work-country');
const workStatesHTML = document.querySelector('#work-states');
const workCitiesHTML = document.querySelector('#work-cities');
const stsHTML = document.querySelector('#sts');
let USER_SELECTED_COUNT= []
let USER_SELECTED_STATE= []

function displayUserCvDetails() {
    
  document.getElementById("cv-file").style.display = "none";
  document.getElementById("uploadNewCv").style.display = "none";
  document.getElementById("editCvUrlHolder").style.display = "block";
  USER_SELECTED_COUNT=USER.cv.workCountry;
  USER_SELECTED_STATE = USER.cv.workStates;
  cvUrlHTML.href = USER.cv.url;
  verticalsBtnsHTML.innerHTML = ``;
  workCountryHTML.innerText = USER.cv.workCountry;
  let states ="<ul>";
  USER.cv.workStates.map(s => {
    states += `<li>${s}</li>`
  })
  states += `</ul>`;

  workStatesHTML.innerHTML = states;
  workCitiesHTML.innerHTML = `<p>${USER.cv.workCity}</p>`


  //console.log(USER.cv.workCountry)
  //cvFormHTML['country'].value = USER.cv.workCountry;
  let optionsState = ""
  let optionsCountry="";
  document.getElementById("sts").innerHTML = `
  <select onchange="selectedState(event)" style="padding: 7px;" name ="state"  id="state" multiple >`;
  USER.cv.workStates.map((s) => {
    optionsState += `<option value="${s}" selected>${s}</option>`;
    USER_SELECTED_STATE.push(s)
  });
  document.getElementById("cts").innerHTML=`
   <select style="padding: 7px;width: 85%;"  id="country" name ="country" multiple></select> 
  `
  USER.cv.workCountry.map((c) => {
    optionsCountry+= `<option value="${c}" selected>${c}</option>`;
    USER_SELECTED_COUNT.push(c)
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
    <button type="button" class="btn btn-info" style="background-color: rgb(31, 126, 189);" data-parent="#acd" data-toggle="collapse" href="#${v.vId}">${v.vName} ></button>
    `;
  });
  
  // console.log('displayCvDetails : cv', USER.cv);
  USER.cv.all.map(async (v) => {
    let head = `
    <div id="${v.vId}" class="collapse">
      <table class="table table-bordered">
        <thead class="thead-dark">
          <tr style="text-align: center">
            <th
              style="text-align: center; font-weight: 600"
              scope="col"
            >
              Sub-Vertical [${v.vName}]
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
        rows += `
        <tr>
          <td>
          ${sv.svName}
          </td>
          <td>
          ${sv.prof}
          </td>
          <td>
            ${sv.des.join(', ')}
          </td>
          <td>
            ${sv.exp}
          </td>
        </tr>
        `;
      });
      body = rows;

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
  </a>`;
}