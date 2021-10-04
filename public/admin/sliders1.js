const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let FILE = null;
let FILE_NAME = null;

const imageResultHTML = document.querySelector("#imageResult");

// //////////////////////////////////////////////////////

const uploadFileHTML = document.querySelector("#uploadFile");

const uploadFile = (e) => {
  e.preventDefault();
  FILE = e.target.files[0];
};

uploadFileHTML.addEventListener("change", uploadFile);

// ///////////////////////////////////////////////

const sliderFormHTML = document.querySelector("#sliderForm");

const sliderForm = async (e) => {
  e.preventDefault();

  const title = sliderFormHTML["title"].value;
  const valueOf = new Date().getTime();

  FILE_NAME = `${valueOf}__${FILE.name}`;
  const storageRes = await uploadFileToStorage();
  if (!storageRes.status) {
    alert(storageRes.message);
    return;
  }

  const urlRes = await getFileURL();
  if (!urlRes.status) {
    alert(urlRes.message);
    return;
  }

  const dbRes = await uploadToDB({ title, url: urlRes.data.url });

  if (!dbRes.status) {
    alert(dbRes.message);
    return;
  }

  sliderFormHTML.reset();
  FILE = null;
  FILE_NAME = null;
  uploadFileHTML.value = null;
  imageResultHTML.src = "";
};

sliderFormHTML.addEventListener("submit", sliderForm);

// ///////////////////////////////////////////////

let DbReTry = 0;
const uploadToDB = async ({ title, url }) => {
  try {
    console.log(title, url, FILE.name);
    await db.collection("sliders").add({
      title,
      url,
      imgName: FILE_NAME,
    });
    nowuiDashboard.showNotification('top','center',"Slider is live now ","primary");
    return {
      status: true,
      message: `Uploaded Successfully`,
    };
  } catch (error) {
    console.error(error);
    if (DbReTry) {
      DbReTry++;
      alert(`ReTry Attempt: ${DbReTry} Reason: ${error.message}`);
      uploadToDB();
    } else {
      return {
        status: false,
        message: `Failed to get the URL: ${error.message}`,
      };
    }
  }
};

// ///////////////////////////////////////////////

let storageReTry = 0;
const uploadFileToStorage = async () => {
  try {
    await storage.ref("sliders").child(FILE_NAME).put(FILE);
    return {
      status: true,
      message: `${FILE.name} uploaded to storage`,
    };
  } catch (error) {
    console.error(error);
    if (storageReTry < 2) {
      storageReTry++;
      alert(`ReTry Attempt: ${storageReTry} Reason: ${error.message}`);
      uploadFileToStorage();
    } else {
      return {
        status: false,
        message: `Retry Uploading file: ${error.message}`,
      };
    }
  }
};

// ///////////////////////////////////////////////

let fileURLReTry = 0;
const getFileURL = async () => {
  try {
    const url = await storage.ref("sliders").child(FILE_NAME).getDownloadURL();
    return {
      status: true,
      message: `Got the URL`,
      data: {
        url: url,
      },
    };
  } catch (error) {
    console.error(error.message);
    if (fileURLReTry) {
      fileURLReTry++;
      alert(`ReTry Attempt: ${storageReTry} Reason: ${error.message}`);
      getFileURL();
    } else {
      return {
        status: false,
        message: `Failed to get the URL: ${error.message}`,
      };
    }
  }
};

// ///////////////////////////////////////////////

// display all imgs

const tbodyHTML = document.querySelector("#tbody");
const SLIDERS = [];

db.collection("sliders").onSnapshot((snaps) => {
  const docs = snaps.docs;
  let trow = ``;
  SLIDERS.length = 0;
  docs.map((doc, index) => {
    let docData = doc.data();
    SLIDERS.push({id: doc.id, ...docData})
    trow += `
    <tr>
      <td>
        <img
          src="${docData.url}"
          alt=""
          style="width: 80px; object-fit: contain"
        />
      </td>
      <td>${docData.title}</td>
      <td>
        <button type="button" class="btn btn-danger" onclick=deleteImg(${index}) >
          <i class="far fa-trash-alt"></i>
        </button>
      </td>
    </tr>
    `;
  });
  tbodyHTML.innerHTML = "";
  tbodyHTML.innerHTML = trow;
});

// ///////////////////////////////////////////////

// delete img

async function deleteImg(index) {
  console.log(index);
  try {
    await storage.ref("sliders").child(SLIDERS[index].imgName).delete();
    await db.collection("sliders").doc(SLIDERS[index].id).delete();

    nowuiDashboard.showNotification('top','center',"Slideer Images Deleted","primary");
    return;
  } catch (error) {
    console.error(error);
    alert(`Cound not delete, Try Again. Reason: ${error.message}`);
  }
}

// ///////////////////////////////////////////////

