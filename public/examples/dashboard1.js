

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ////////////////////////////////////////////
let USER = false;
let USER_REF = false;
let USER_ID = false;
var userDetails;
auth.onAuthStateChanged((user) => {
  USER_ID = user.uid;
  userDetails = user

  console.log(user)
  if(user.emailVerified==false){

     $('#exampleModalCenter').modal({backdrop: 'static', keyboard: false,show:true}) 
     document.getElementById("emailID").innerHTML=user.email
    
    
  }
});
////To Send Email again/////
function sendEmail(){
  
   userDetails.sendEmailVerification().then(function() {

    nowuiDashboard.showNotification('top','center',"Email Sent Successfully","primary");
  })
}

db.collection("sliders").onSnapshot((snaps) => {
    const docs = snaps.docs;
    let trow = ``;
    document.getElementById("slidersData").innerHTML="" 
    docs.map((doc, index) => {
      let docData = doc.data();
       console.log(docData.url)
        title="";
        if(docData.title){
           title = docData.title; 
        }
  //     console.log(docData +" "+)
        if(index==0){
            document.getElementById("slidersData").innerHTML += `

                <div class="carousel-item active">
                    <img
                        class="d-block center-image"
                        src="`+docData.url+`"
                        alt="First slide"
                    />
                    <div class="carousel-caption d-none d-md-block">
                        <h5 class="slider-txt">`+title+`</h5>
                        <p class="slidersm-txt">Here</p>
                    </div>
                </div>
                ` 
        }else{
            document.getElementById("slidersData").innerHTML += `

                <div class="carousel-item ">
                    <img
                        class="d-block center-image"
                        src="`+docData.url+`"
                        alt="First slide"
                    />
                    <div class="carousel-caption d-none d-md-block">
                        <h5 class="slider-txt">`+docData.title+`</h5>
                        <p class="slidersm-txt">Here</p>
                    </div>
                </div>
                ` 
        }
       
    });

  });

  db.collection("miscellaneous").onSnapshot((snaps) => {

    const docs = snaps.docs;

    docs.map((doc, index) => {
        let docData = doc.data();

        if(docData.aboutUs){
            document.getElementById("aboutTxt").innerHTML= docData.aboutUs
        }
    })
  });