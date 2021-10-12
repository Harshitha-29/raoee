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
    console.log(user);
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
    checkIfAdmin()
  }

});

// //////////////////////////////////

async function getUserInfo() {

  await db.collection(`${USER_TYPE}s`).doc(USER_ID).get().then(doc => {
    USER = doc.data();
  })
  checkIfAdmin();
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
    //     console.log(docData +" "+)
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
                          <h5 class="slider-txt">` +
        title +
        `</h5>
                          <p class="slidersm-txt">Here</p>
                      </div>
                  </div>
                  `;
    } else {
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
                          <h5 class="slider-txt">` +
        docData.title +
        `</h5>
                          <p class="slidersm-txt">Here</p>
                      </div>
                  </div>
                  `;
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

// let retryLogout2 = 0;

// function logoutUser() {
//   auth.signOut().then(() => {
//     // Sign-out successful.
    
//     window.location.href="./adminDash.html"
//   }).catch((error) => {
//     console.error(error);
//     if(retryLogout2 < 2) {
//       retryLogout2++;
//       logoutUser();
//     } else {
//       alert(`unable to logout at moment. Reason: ${error.message}`)
//     }
//   });
// }
