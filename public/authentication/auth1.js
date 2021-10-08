const auth = firebase.auth();
const db = firebase.firestore();

const emplyeeFormHTML = document.querySelector("#employeeForm");
const employerFormHTML = document.querySelector("#employerForm");
let AUTH_FLAG = true;

// //////////////////////////////////////////

const signupEmployee = async (e) => {
  e.preventDefault();
  AUTH_FLAG = false;
  const password = emplyeeFormHTML["password"].value;
  const cpassword = emplyeeFormHTML["cpassword"].value;

  if (password !== cpassword) {
    document.getElementById("showMessage2").innerHTML = "";

    nowuiDashboard.showNotification(
      "top",
      "center",
      "Password Mis-Matched",
      "primary"
    );
    return;
  }
  let userType = "employee";
  const fname = emplyeeFormHTML["fname"].value;
  const lname = emplyeeFormHTML["lname"].value;
  const email = emplyeeFormHTML["email"].value;
  const phone = emplyeeFormHTML["phone"].value;
  const gender = emplyeeFormHTML["gender"].value;

  document.getElementById("showMessage2").innerHTML =
    "Creating new account ! Please Wait .....";
  let authRes = await createUserAuth(email, password, userType);

  if (!authRes.status) {
    document.getElementById("showMessage2").innerHTML = "";
    nowuiDashboard.showNotification(
      "top",
      "center",
      authRes.message,
      "primary"
    );
    return;
  }

  const data = {
    fname,
    lname,
    email,
    phone,
    gender,
    userType,
    uid: authRes.data.uid,
    basicInfoAdded: false,
    cvAdded: false,
    createdAt: new Date(),
  };

  let dbRes = await createUserDB(`${userType}s`, authRes.data.uid, data);

  if (!dbRes) {
    document.getElementById("showMessage2").innerHTML = "";
    nowuiDashboard.showNotification("top", "center", dbRes.message, "primary");
    return;
  }
  emplyeeFormHTML.reset();
  AUTH_FLAG = true;
  window.location = "./../dashboard.html";
};

emplyeeFormHTML.addEventListener("submit", signupEmployee);

// //////////////////////////////////////////

const signupEmployer = async (e) => {
  e.preventDefault();
  AUTH_FLAG = false;

  const password = employerFormHTML["password"].value;
  const cpassword = employerFormHTML["cpassword"].value;

  if (password !== cpassword) {
    nowuiDashboard.showNotification(
      "top",
      "center",
      "Password Missed Match",
      "primary"
    );
    return;
  }
  let userType = "employer";
  const fname = employerFormHTML["fname"].value;
  const lname = employerFormHTML["lname"].value;
  const email = employerFormHTML["email"].value;
  const phone = employerFormHTML["phone"].value;
  // const gender = employerFormHTML["gender"].value;
  const question = employerFormHTML["question"].value;
  const answer = employerFormHTML["answer"].value;

  let authRes = await createUserAuth(email, password, userType);

  if (!authRes) {
    alert(authRes.message);
    return;
  }

  const data = {
    fname,
    lname,
    email,
    phone,
    // gender,
    question,
    answer,
    userType,
    uid: authRes.data.uid,
    basicInfoAdded: false,
    cvAdded: false,
    createdAt: new Date(),
  };

  let dbRes = await createUserDB(`${userType}s`, authRes.data.uid, data);

  if (!dbRes) {
    alert(dbRes.message);
    return;
  }
  employerFormHTML.reset();
  alert("Employer Added");
  AUTH_FLAG = true;
  window.location = "./../dashboard.html";

};

employerFormHTML.addEventListener("submit", signupEmployer);

// //////////////////////////////////////////

let dbRetry = 0;

const createUserDB = async (collection, uid, data) => {
  try {
    await db.collection(collection).doc(uid).set(data);
    return {
      status: true,
    };
  } catch (error) {
    console.error(error);
    if (dbRetry > 2) {
      dbRetry++;
      console.log(`Retring ${dbRetry}`);
      console.log(error.message);
      createUserDB(uid, collection, data);
    } else {
      return {
        status: false,
        message: `create account with differnt Email Id: ${error.message}`,
      };
    }
  }
};

// //////////////////////////////////////////

const createUserAuth = async (email, password, type) => {
  return await auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      var user = userCredential.user;
      console.log(user);
      console.log(type);
      // user.providerData[0].userType = type;
      return user;
    })
    .then(async (user) => {
      console.log(type);
      await user.updateProfile({
        displayName: type,
      });
      return user;
    })
    .then((user) => {
      console.log(user);
      return {
        status: true,
        message: "user auth created",
        data: {
          uid: user.uid,
        },
      };
    })
    .catch((error) => {
      var errorMessage = error.message;
      nowuiDashboard.showNotification(
        "top",
        "center",
        errorMessage.substring(9),
        "primary"
      );
      setTimeout(function () {
        document.getElementById("showMessage2").innerHTML = " ";
      }, 1000);
      return {
        status: false,
        message: `Please Retry: ${errorMessage}`,
      };
    });
};

// //////////////////////////////////////////

// login

const signinFormHTML = document.querySelector("#signinForm");

const login = (e) => {
  e.preventDefault();
  document.getElementById("showMessage").innerHTML = "Verifying Details ... ";
  const email = signinFormHTML["email"].value;
  const password = signinFormHTML["password"].value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      let userType = user.user.displayName;
      console.log(userType);
      // if(userType === 'employee') {
      //   window.location.href = `./../employee/user.html`;
      // }
      if (userType === "admin") {
        window.location.href = `./../admin/dashboard.html`;
      } else {
        window.location.href = `./../dashboard.html`;
      }
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("showMessage").innerHTML = " ";

      nowuiDashboard.showNotification(
        "top",
        "center",
        error.message,
        "primary"
      );
    });
};

signinFormHTML.addEventListener("submit", login);

// //////////////////////////

auth.onAuthStateChanged(async (user) => {
  if (user && AUTH_FLAG) {
    console.log(user.displayName);
    if (user.displayName === "admin") {
      window.location.href = `./../admin/dashboard.html`;
    } else {
      window.location.href = `./../dashboard.html`;
    }
  }
});

// //////////////////////////

function AllowOnlyNumbers(e) {
  e = e ? e : window.event;
  var clipboardData = e.clipboardData ? e.clipboardData : window.clipboardData;
  var key = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
  var str =
    e.type && e.type == "paste"
      ? clipboardData.getData("Text")
      : String.fromCharCode(key);

  return /^\d+$/.test(str);
}

// //////////////////////////

// const registerAdmin = async() => {

//   const email = `raoeeproject@gmail.com`;
//   const password = `raoee@project`
//   let userType = "admin";
//   const fname = `admin`;
//   const lname = `raoee`;

//   let authRes = await createUserAuth(email, password, userType);

//   if (!authRes) {
//     alert(authRes.message);
//     return;
//   }

//   const data = {
//     fname,
//     lname,
//     email,
//     userType,
//     uid: authRes.data.uid,
//     basicInfoAdded: false,
//     createdAt: new Date()
//   };

//   let dbRes = await createUserDB(`${userType}s`, authRes.data.uid, data);

//   if (!dbRes) {
//     alert(dbRes.message);
//     return;
//   }
//   alert('Admin Added')
// };
// registerAdmin()
