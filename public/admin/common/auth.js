
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
