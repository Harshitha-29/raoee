const db = firebase.firestore();

const editorHTML = document.querySelector("#editor");
let EDITOR;

const USER = undefined;

ClassicEditor.create(editorHTML)
  .then((editor) => {
    EDITOR = editor;
  })
  .catch((error) => {
    console.error(error);
  });
// /////////////////////////////////////

const formHTML = document.querySelector("#form");

const submitForm = async (e) => {
  e.preventDefault();

  const message = EDITOR.getData();
  const name = formHTML["name"].value;
  const designation = formHTML["designation"].value;

  const resDb = await uploadToDb({
    collectionName: "testimonials",
    data: { message, name, designation, createdOn: new Date() },
  });
  if (!resDb.status) {
    alert(resDb.message);
    return;
  }

  alert("Record added successfully.");
  formHTML.reset();
  EDITOR.data.set("");
};

formHTML.addEventListener("submit", submitForm);

// /////////////////////////////////////

let retryDB = 0;
async function uploadToDb({ collectionName, data }) {
  try {
    await db.collection(collectionName).add(data);
    return {
      status: true,
      message: `Record added successfully`,
    };
  } catch (error) {
    console.error(error);
    if (retryDB < 2) {
      retryDB++;
      alert(`Retrying... Attempt: ${retryDB} Reason: ${error.message} `);
    } else {
      return {
        status: false,
        message: `Failed to uplaod. ${error.message}`,
      };
    }
  }
}

// ////////////////////////////////////////

const ALL_TESTIMONIALS = [];

db.collection('testimonials').onSnapshot(snaps => {
  const docs = snaps.docs;
  ALL_TESTIMONIALS.length = 0;
  docs.map(doc => {
    ALL_TESTIMONIALS.push({...doc.data(), id: doc.id}); 
  })
  displayTestimonials();
})

// //////////////////////////////////

function displayTestimonials() {

}

// ////////////////////////////////

async function deleteTestimonials({arrayIndex}) {
  const docId = ALL_TESTIMONIALS[arrayIndex];

  try {
    await db.collection('testimonials').doc(docId).delete();
    alert('Deleted Successfully');
  } catch(error) {
    console.error(error);
    alert(`Failed to delete. Reason: ${error.message}`)
  }
}

// ////////////////////////////////////