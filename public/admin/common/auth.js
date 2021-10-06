function checkIfAdmin() {
  if (USER) {
    if (USER_TYPE !== "admin") {
      window.location.href = `./../authentication/auth.html`;
    }
  } else {
    if (USER === undefined) {
      const auth = firebase.auth();

      auth.onAuthStateChanged((user) => {
        if (user) {
          if (user.displayName !== "admin") {
            window.location.href = `./../authentication/auth.html`;
          }
        } else {
          window.location.href = `./../authentication/auth.html`;
        }
      });
    } else {
      window.location.href = `./../authentication/auth.html`;
    }
  }
}

// /////////////////////////////

let retryLogout = 0;

function logoutUser() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    
    window.location.href="./../authentication/auth.html"
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

