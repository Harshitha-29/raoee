const db = firebase.firestore();
const auth = firebase.auth();

// ////////////////////////////////////////////
let USER = false;

auth.onAuthStateChanged(user => {
    console.log(user.user);
})
// ////////////////////////////////////////////


