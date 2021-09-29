const db = firebase.firestore();
const storage = firebase.storage();

let ABOUT_EDITOR;
let WHY_EDITOR;

ClassicEditor.create(document.querySelector("#editor"))
  .then((editor) => {
    ABOUT_EDITOR = editor;
  })
  .catch((error) => {
    console.error(error);
  });
ClassicEditor.create(document.querySelector("#editor2"))
  .then((editor) => {
    WHY_EDITOR = editor;
  })
  .catch((error) => {
    console.error(error);
  });

// /////////////////////////////////////////////

let ABOUT_REF = false;
let ABOUT_DATA = false;
let WHY_REF = false;
let WHY_DATA = false;

async function fetchAboutData() {
  ABOUT_REF = await db.collection('miscellaneous').doc('aboutUs');
  const refDoc = await ABOUT_REF.get();
  ABOUT_DATA = await refDoc.data()
  displayAboutData();
}

async function fetchWhyData() {
  WHY_REF = await db.collection('miscellaneous').doc('aboutUs');
  const refDoc = await ABOUT_REF.get();
  WHY_DATA = await refDoc.data();
  displayWhyData();
}

// /////////////////////////////////////////////

function displayAboutData() {
  
}

function displayWhyData() {

}

// /////////////////////////////////////////////

let retryFileStorage = 0;
async function uploadFileToStorage({ ref, fileName, file }) {
  console.log(ref, fileName, file);
  try {
    await storage.ref(ref).child(fileName).put(file);
    return {
      status: true,
      message: "Uplading to file to storage success",
    };
  } catch (error) {
    console.error(error);
    if (retryImgStorage < 2) {
      retryImgStorage++;
      alert(`Retry. Attempt: ${retryImgStorage} Reason: ${error.message} `);
      uploadFileToStorage({ ref });
    } else {
      return {
        status: false,
        message: `Failed to upload file to stoarge. Reason: ${error.message}`,
      };
    }
  }
}

// /////////////////////////////////////////////////////////

let retryFileURL = 0;
async function getUrlOfFile({ ref, imgName }) {
  console.log("getUrlOfFile: inside", ref);
  try {
    const url = await storage.ref(ref).child(imgName).getDownloadURL();
    console.log(url);
    return {
      status: true,
      message: "Success. Fetched the file from storage.",
      data: {
        url,
      },
    };
  } catch (error) {
    console.error(error);
    if (retryFileURL < 2) {
      retryFileURL++;
      alert(`Retry. Attempt: ${retryFileURL} Reason: ${error.message} `);
      getUrlOfFile({ ref });
    } else {
      return {
        status: false,
        message: `Failed to fetch the file from stoarge. Reason: ${error.message}`,
      };
    }
  }
}

// /////////////////////////////////////////////

let retryDB = 0;
const uploadToUserDb = async ({ data, collectionName, doc, ref = false }) => {
  try {
    if (!ref) {
      ref = await db.collection(collectionName).doc(doc);
      const rDoc = await r.get();
      const rData = await rDoc.data();
      rData = { ...rData, ...data };
      await r.update(rData);
    } else {
      await ref.update(data);
    }

    return {
      status: true,
      message: "Successfully added the record.",
    };
  } catch (error) {
    console.error(error);
    if (retryDB < 2) {
      retryDB++;
      alert(`Retry. Attempt: ${retryDB} Reason: ${error.message} `);
      uploadToUserDb({ data });
    } else {
      USER.cvAdded = false;
      return {
        status: false,
        message: `Failed to add the record. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////

let ABOUT_IMG = false;
let ABOUT_IMG_NAME = false;
let WHY_IMG = false;
let WHY_IMG_NAME = false;

const aboutFileHTML = document.querySelector("#aboutFile");

const uploadAboutFileLocal = (e) => {
  ABOUT_IMG = e.target.files[0];
  ABOUT_IMG_NAME = `${new Date().valueOf()}__${ABOUT_IMG.name}`;
};

aboutFileHTML.addEventListener("change", uploadAboutFileLocal);

// /////////////////////////////////////////////
const whyFileHTML = document.querySelector("#whyFile");

const uploadWhyFileLocal = (e) => {
  WHY_IMG = e.target.files[0];
  WHY_IMG_NAME = `${new Date().valueOf()}__${WHY_IMG.name}`;
};

whyFileHTML.addEventListener("change", uploadWhyFileLocal);

// /////////////////////////////////////////////

const aboutFileRemoveHTML = document.querySelector("#aboutFileRemove");

aboutFileRemoveHTML.addEventListener("click", (e) => {
  ABOUT_IMG = false;
  ABOUT_IMG_NAME = false;
});

const whyFileRemoveHTML = document.querySelector("#whyFileRemove");

whyFileRemoveHTML.addEventListener("click", (e) => {
  WHY_IMG = false;
  WHY_IMG_NAME = false;
});

// /////////////////////////////////////////////

const aboutUsFormHTML = document.querySelector("#aboutUsForm");

const submitAboutUs = (e) => {
  console.log(e);
  e.preventDefault();
  // console.log(ABOUT_EDITOR.getData());
  let aboutUs = ABOUT_EDITOR.getData();

  if(ABOUT_IMG) {
    const res
  }

};

aboutUsFormHTML.addEventListener("submit", submitAboutUs);

// ////////////////////////////////////////////////////
