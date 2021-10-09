const db = firebase.firestore();
const storage = firebase.storage();



let ABOUT_EDITOR;
let WHY_EDITOR;
const USER = undefined;

const aboutUsEditorHTML = document.querySelector("#editor"); 
const whyUsEditorHTML = document.querySelector("#editor2"); 

ClassicEditor.create(aboutUsEditorHTML)
  .then((editor) => {
    ABOUT_EDITOR = editor;
  })
  .catch((error) => {
    console.error(error);
  });

ClassicEditor.create(whyUsEditorHTML)
  .then((editor) => {
    WHY_EDITOR = editor;
  })
  .catch((error) => {
    console.error(error);
  });

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

let ABOUT_REF = false;
let ABOUT_DATA = false;
let WHY_REF = false;
let WHY_DATA = false;

async function fetchAboutData() {
  ABOUT_REF = await db.collection("miscellaneous").doc("aboutUs");
  const refDoc = await ABOUT_REF.get();
  ABOUT_DATA = await refDoc.data();
  displayAboutData();
}
fetchAboutData();

async function fetchWhyData() {
  WHY_REF = await db.collection("miscellaneous").doc("whyUs");
  const refDoc = await WHY_REF.get();
  WHY_DATA = await refDoc.data();
  console.log(WHY_DATA);
  displayWhyData();
}
fetchWhyData();

// /////////////////////////////////////////////
const imgResAboutHTML = document.querySelector('#imgResAbout');

function displayAboutData() {
  ABOUT_EDITOR.data.set(ABOUT_DATA.aboutUs);
  imgResAboutHTML.src = ABOUT_DATA.url;
}

const imgResWhyHTML = document.querySelector('#imgResWhy');

function displayWhyData() {
  WHY_EDITOR.data.set(WHY_DATA.whyUs);
  imgResWhyHTML.src = WHY_DATA.url;
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
const uploadToUserDb = async ({
  data = false,
  collectionName = false,
  doc = false,
  ref = false,
}) => {
  const d = data;
  const cN = collectionName;
  const docc = doc;
  const r = ref;
  try {
    if (!ref) {
      ref = await db.collection(collectionName).doc(doc);
      const rDoc = await ref.get();
      const rData = await rDoc.data();
      rData = { ...rData, ...data };
      await ref.update(rData);
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
      uploadToUserDb({ data: d, collectionName: cN, doc: docc, ref: r });
    } else {
      return {
        status: false,
        message: `Failed to add the record. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////////////////
let retryDeleteStorage = 0;
const deleteStorage = async ({ ref, fileName }) => {
  try {
    await storage.ref(ref).child(fileName).delete();
    console.log("delete img");
    return {
      status: true,
      message: `Delete Succefully.`,
    };
  } catch (error) {
    console.error(error);
    if (retryDeleteStorage < 2) {
      retryDeleteStorage++;
      alert(`Retrying Attempt: ${retryDeleteStorage} Reason: ${error.message}`);
      deleteStorage({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to delete. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////////////////////

const aboutUsFormHTML = document.querySelector("#aboutUsForm");

const submitAboutUs = async (e) => {
  console.log(e);
  e.preventDefault();
  // console.log(ABOUT_EDITOR.getData());
  let resStorage, resURL, resDelete;
  const data = {};
  data.imgName = ABOUT_DATA.imgName;
  data.url = ABOUT_DATA.url;

  if (ABOUT_IMG) {
    resDelete = await deleteStorage({ref: 'aboutUs', fileName: ABOUT_DATA.imgName});
    if (!resDelete.status) {
      alert(resDelete.message);
      return;
    }

    resStorage = await uploadFileToStorage({
      ref: `aboutUs`,
      fileName: ABOUT_IMG_NAME,
      file: ABOUT_IMG,
    });
    if (!resStorage.status) {
      alert(resStorage.message);
      return;
    }

    resURL = await getUrlOfFile({ ref: "aboutUs", imgName: ABOUT_IMG_NAME });
    if (!resURL.status) {
      alert(resURL.message);
      return;
    }

    data.imgName = ABOUT_IMG_NAME;
    data.url = resURL?.data?.url;
  }
  let aboutUs = ABOUT_EDITOR.getData();

  data.aboutUs = aboutUs;

  const resDb = await uploadToUserDb({ data: data, ref: ABOUT_REF });

  if (!resDb.status) {
    alert(resDb.message);
    return;
  }

  alert('done')
  ABOUT_IMG = false;
  ABOUT_IMG_NAME = false;
};

aboutUsFormHTML.addEventListener("submit", submitAboutUs);

// ////////////////////////////////////////////////////

const whyUsFormHTML = document.querySelector("#whyUsForm");

const submitWhyUs = async (e) => {
  console.log(e);
  e.preventDefault();
  // console.log(ABOUT_EDITOR.getData());
  let resStorage, resURL, resDelete;
  const data = {};
  data.imgName = WHY_DATA.imgName;
  data.url = WHY_DATA.url;

  if (WHY_IMG) {
    resDelete = await deleteStorage({ref: 'whyUs', fileName: WHY_DATA.imgName});
    if (!resDelete.status) {
      alert(resDelete.message);
      return;
    }
    resStorage = await uploadFileToStorage({
      ref: `whyUs`,
      fileName: WHY_IMG_NAME,
      file: WHY_IMG,
    });

    if (!resStorage.status) {
      alert(resStorage.message);
      return;
    }

    resURL = await getUrlOfFile({ ref: "whyUs", imgName: WHY_IMG_NAME });
    if (!resURL.status) {
      alert(resURL.message);
      return;
    }

    data.imgName = WHY_IMG_NAME;
    data.url = resURL?.data?.url;
  }
  let whyUs = WHY_EDITOR.getData();

  data.whyUs = whyUs;

  const resDb = await uploadToUserDb({ data: data, ref: WHY_REF });

  if (!resDb.status) {
    alert(resDb.message);
    return;
  }

  alert('done');
  WHY_IMG = false;
  WHY_IMG_NAME = false;
};

whyUsFormHTML.addEventListener("submit", submitWhyUs);