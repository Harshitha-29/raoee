const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ////////////////////////////////////////////

let USER = false;
let USER_ID = false;
let USER_RAW = false;
let USER_TYPE = false;

auth.onAuthStateChanged((user) => {
  if(user) {
   
    USER_ID = user.uid;
    USER_RAW = user;
    USER_TYPE = user.displayName;
  
    if (user.emailVerified == false) {
      $("#exampleModalCenter").modal({
        backdrop: "static",
        keyboard: false,
        show: true,
      });
      document.getElementById("emailID").innerHTML = user.email;
    }
    getUserInfo()
  } else {
    displayAuthSigns()
  }

});

// //////////////////////////////////

const topbarUsernameHTML = document.querySelector('#topbar-username');
const topbarImgHTML = document.querySelector('#topbar-img');
const toolbarOpsHTML = document.querySelector('#toolbarOps');
const navLoginHTML = document.querySelector('#nav-login');
const loginRegisterSectionHTML = document.querySelector('#login-register-section');

function displayAuthSigns() {
  let toolbarOps;
  if(!USER) {
    loginRegisterSectionHTML.style.display = 'block';
    toolbarOps = `
    <a class="dropdown-item" href="./authentication/auth.html"> <i class="now-ui-icons objects_key-25"><span style="color:black;"></span></i>Login</a>
    `;
    navLoginHTML.innerHTML = `<li>
    <a href="./authentication/auth.html">
      <i class="now-ui-icons objects_key-25"></i>
      <p>Login / Register</p>
    </a>
  </li>`;
  } else {
    if(USER_TYPE ==  "admin"){
      window.location = "./admin/adminDash.html"
    }

    toolbarOps = `
    <a class="dropdown-item" href="./${USER_TYPE}/user.html"><i class="now-ui-icons ui-1_settings-gear-63"><span style="color:black;"></span></i>My Profile</a>
    <a onclick="logoutUser()" class="dropdown-item" href="#"><i class="now-ui-icons arrows-1_minimal-left"><span style="color:black;"></span></i>Logout</a>
    `;
    topbarUsernameHTML.innerHTML = `Welcome ${USER.fname}`
    if(USER.img) {
      topbarImgHTML.src = USER.img;
    }
    navLoginHTML.innerHTML = `
    <li class="ace">
      <a href="./${USER_TYPE}/user.html">
        <i class="now-ui-icons users_single-02"></i>
        <p>User Profile</p>
      </a>
    </li>
    <li>
      <a href="#" onclick="logoutUser()" >
        <i class="now-ui-icons objects_key-25"></i>
        <p>LogOut</p>
      </a>
    </li>
    `;
  }
  toolbarOpsHTML.innerHTML = toolbarOps;
}

// //////////////////////////////////

async function getUserInfo() {

  await db.collection(`${USER_TYPE}s`).doc(USER_ID).get().then(doc => {
    USER = doc.data();
  })
 
  displayAuthSigns();
}

// //////////////////////////////////

////To Send Email again/////
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

// ///////////////////////////////

db.collection("sliders").onSnapshot((snaps) => {
  const docs = snaps.docs;
  let trow = ``;
  document.getElementById("slidersData").innerHTML = "";
  docs.map((doc, index) => {
    let docData = doc.data();
    title = "";
    if (docData.title) {
      title = docData.title;
    }
    
    if (index == 0) {
      document.getElementById("slidersData").innerHTML +=
        `

                  <div class="carousel-item active">
                      <img
                          class="d-block center-image"
                          src="` +
        docData.url +
        `"
                          alt="First slide"
                      />
                      <div class="carousel-caption d-none d-md-block">
                          <h5 class="slider-txt " id="title-txt">` +
        title +
        `</h5>
                        
                      </div>
                  </div>
                  `;
                  if (!docData.title) {
                    document.getElementById("title-txt").style.display = "none"
                  }
        
    } 
    
    else {
      document.getElementById("slidersData").innerHTML +=
        `

                  <div class="carousel-item ">
                      <img
                          class="d-block center-image"
                          src="` +
        docData.url +
        `"
                          alt="First slide"
                      />
                      <div class="carousel-caption d-none d-md-block">
                          <h5 class="slider-txt" id="title-txt2">` +
        docData.title +
        `</h5>
                         
                      </div>
                  </div>
                  `;
                  if (!docData.title) {
                    document.getElementById("title-txt2").style.display = "none"
                  }
    }
    
  });
});


// //////////////////////////////

db.collection("miscellaneous")
  .doc("aboutUs")
  .get()
  .then((doc) => {
    const data = doc.data();
    document.getElementById("aboutTxt").innerHTML = data.aboutUs;
    document.getElementById("aboutImg").src = data.url;
  });

// //////////////////////////////

db.collection("miscellaneous")
  .doc("whyUs")
  .get()
  .then((doc) => {
    const data = doc.data();
    document.getElementById("whyTxt").innerHTML = data.whyUs;
    document.getElementById("whyImg").src = data.url;
  });

// /////////////////////////////

const allTestimonialsHTML = document.querySelector('#all-testimonials');

db.collection('testimonials').onSnapshot(snaps => {
  const docs = snaps.docs;

  let testimonials = "";
  docs.map(doc => {
    const docData = doc.data();
    testimonials += `
    
    <div class="card testimonails ">
      <div class="card-body">
        <h4 class="card-title"><img src="https://img.icons8.com/ultraviolet/40/000000/quote-left.png"></h4>
        <div class="template-demo">
            <p>${docData.message}</p>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-4"> <img class="profile-pic" src="https://img.icons8.com/bubbles/100/000000/edit-user.png"> </div>
            <div class="col-sm-8">
              <div class="profile">
                <h4 class="cust-name">${docData.name}</h4>
                  <p class="cust-profession">${docData.designation}</p>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

  })
  allTestimonialsHTML.innerHTML = testimonials;
  $('.items').slick({
    dots: true,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
    {
    breakpoint: 1024,
    settings: {
    slidesToShow: 3,
    slidesToScroll: 3,
    infinite: true,
    dots: true
    }
    },
    {
    breakpoint: 600,
    settings: {
    slidesToShow: 2,
    slidesToScroll: 2
    }
    },
    {
    breakpoint: 480,
    settings: {
    slidesToShow: 1,
    slidesToScroll: 1
    }
    }

    ]
  });
  
})

// /////////////////////////////

let retryLogout = 0;

function logoutUser() {
  auth.signOut().then(() => {
    // Sign-out successful.
    
    window.location.href="./index.html"
  }).catch((error) => {
    console.error(error);
    if(retryLogout < 2) {
      retryLogout++;
      logoutUser();
    } else {
      alert(`unable to logout at moment. Reason: ${error.message}`)
    }
  });
}


// /////////////////////////////////////

db.collection("site-control").doc("status")
.onSnapshot((doc) => {
    // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
  
    if(doc.data().status == true ){
      $("#modalProgress").modal({
        backdrop: "static",
        keyboard: false,
        show: false,
      });
    }else{
 
      $("#modalProgress").modal({
        backdrop: "static",
        keyboard: false,
        show: true,
      });
      document.getElementById("statusMessage").innerText=doc.data().message
    }
});