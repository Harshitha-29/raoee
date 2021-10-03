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
  console.log(userDetails)
   userDetails.sendEmailVerification().then(function() {

    nowuiDashboard.showNotification('top','center',"Email Sent Successfully","primary");
  })
}