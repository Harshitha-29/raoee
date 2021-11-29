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
const editCvBtnHTML2 = document.querySelector("#editCvBtn2");
const cvInfoHolderHTML = document.querySelector("#cvInfoHolder");
const cvEditHolderHTML = document.querySelector("#cvEditHolder");

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
editCvBtnHTML2.addEventListener("change", toggleUploadCvDisplay);

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

// let IMG = false;
// let IMG_NAME = false;

const userImageHTML = document.querySelector("#userImage");

const uploadImgLocal = (e) => {
  if (!USER.basicInfoAdded) {
    // nowuiDashboard.showNotification('top','center',"Please add all your details in order to update the profile image","primary");
    blahHTML.src = `../assets/img/userProfile.png`;
    return;
  }
  readURL(e);
  IMG = e.target.files[0];
  IMG_NAME = `${new Date().valueOf()}__${IMG.name}`;
  // uploadImgToDB();
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

    // await USER_REF.update(data);

    // nowuiDashboard.showNotification(
    //   "top",
    //   "center",
    //   "Basic Data updated Successfully",
    //   "primary"
    // );
    // getDbData({ uid: USER_ID, userType: USER.userType });
  } catch (error) {
    console.error(error);
    alert(`Try again. Reason: ${error.message}`);
  }
};

userBasicFormHTML.addEventListener("submit", updateBasicInfo);

// ////////////////////////////////////