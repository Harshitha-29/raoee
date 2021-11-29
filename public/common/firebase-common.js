let retryDeleteStorage = 0;
const deleteStorage = async ({ ref, fileName }) => {
  try {
    await storage.ref(ref).child(fileName).delete();
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

// //////////////////////////////////

let retryDeleteDbDoc = 0;
const deleteDbDoc = async ({ collectionName, docId }) => {
  try {
    await db.collection(collectionName).doc(docId).delete();
    return {
      status: true,
      message: `Delete Succefully.`,
    };
  } catch (error) {
    console.error(error);
    if (retryDeleteDbDoc < 2) {
      retryDeleteDbDoc++;
      alert(`Retrying Attempt: ${retryDeleteDbDoc} Reason: ${error.message}`);
      deleteDbDoc({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to delete. Reason: ${error.message}`,
      };
    }
  }
};

// //////////////////////////

let retryUpdateDbDoc = 0;
const updateDbDoc = async ({ collectionName = false, docId = false, ref = false, docData = false, dataToUpdate = false, resetData = false }) => {
  try {
    if (!ref) {
      ref = await db.collection(collectionName).doc(docId);
      const docDoc = await docRef.get();
      docData = await docData.data();
    }

    if (resetData) {
      docData = dataToUpdate
    } else {
      docData = {
        ...docData,
        ...dataToUpdate
      }
    }

    await ref.update(docData);

    return {
      status: true,
      message: `Updated Succefully.`,
    };
  } catch (error) {
    console.error(error);
    if (retryUpdateDbDoc < 2) {
      retryUpdateDbDoc++;
      alert(
        `Retrying Attempt: ${retryUpdateDbDoc} Reason: ${error.message}`
      );
      updateDbDoc({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to update. Reason: ${error.message}`,
      };
    }
  }
};

// /////////////////////////////

let retryGetURL = 0;
const getUrlOfFile = async ({ ref, fileName }) => {
  try {
    const url = await storage.ref(fileName).child(fileName).getDownloadURL();
    return {
      status: true,
      message: "Success. Fetched the file url from storage.",
      data: {
        url,
      },
    };
  } catch (error) {
    console.error(error);
    if (retryGetURL < 2) {
      retryGetURL++;
      alert(`Retry. Attempt: ${retryGetURL} Reason: ${error.message} `);
      getUrlOfFile({ ref, fileName });
    } else {
      return {
        status: false,
        message: `Failed to fetch the file url from stoarge. Reason: ${error.message}`,
      };
    }
  }
};

// //////////////////////////////

let retryUploadStorage = 0;
const uploadFileToStorage = async ({ ref, fileName, file }) => {
  try {
    await storage.ref(ref).child(fileName).put(file);
    return {
      status: true,
      message: "Successfully uploaded to file to storage ",
    };
  } catch (error) {
    console.error(error);
    if (retryUploadStorage < 2) {
      retryUploadStorage++;
      alert(`Retry. Attempt: ${retryUploadStorage} Reason: ${error.message} `);
      uploadFileToStorage({ ref });
    } else {
      return {
        status: false,
        message: `Failed to upload file to stoarge. Reason: ${error.message}`,
      };
    }
  }
};

// //////////////////////////////

let retryLogout = 0;

function logoutUser({ redirectURL }) {
  auth
    .signOut()
    .then(() => {
      // Sign-out successful.
      // window.location.href = "./../authentication/auth.html";
      window.location.href = redirectURL;
    })
    .catch((error) => {
      console.error(error);
      if (retryLogout < 2) {
        retryLogout++;
        logoutUser({ redirectURL });
      } else {
        alert(`Unable to logout at moment. Reason: ${error.message}`);
      }
    });
}

// ///////////////////////////

let retryDbData = 0;
async function getDbData({ collectionName, docId }) {
  // console.log('getDbData :', collectionName, docId);
  try {
    const ref = await db.collection(collectionName).doc(docId);
    const doc = await ref.get();
    const data = await doc.data();

    return {
      status: true,
      data,
      ref,
      message: 'Successfully fetched the data'
    }

    // displayDbData();
    // displayAuthSigns();
  } catch (error) {
    console.error(error);
    if (retryDbData < 2) {
      retryDbData++;
      alert(`Attempt: ${retryDbData} Unable to fetch the data. Reason: ${error.message}`);
      getDbData({ collectionName, docId });
    } else {
      return {
        status: false,
        message: `Unable to fetch the data. Reson: ${error.message}`,
      };
    }
  }
}

// /////////////////////////

let retryDbSubCollData = 0;
async function getDbSubCollData({ collectionName, docId, subCollName, subDocId }) {
  // console.log('getDbSubCollData :', collectionName, docId, subCollName, subDocId);
  try {
    const ref = await db.collection(collectionName).doc(docId).collection(subCollName).doc(subDocId)
    const doc = await ref.get();
    const data = await doc.data();

    return {
      status: true,
      data,
      ref,
      message: 'Successfully fetched the data of sub collection document'
    }
    
  } catch (error) {
    console.error(error);
    if (retryDbSubCollData < 2) {
      retryDbSubCollData++;
      alert(`Attempt: ${retryDbSubCollData} Unable to fetch the data of sub collection document. Reason: ${error.message}`);
      getDbSubCollData({ collectionName, docId });
    } else {
      return {
        status: false,
        message: `Unable to fetch the data of sub collection document. Reson: ${error.message}`,
      };
    }
  }
}

// /////////////////////////

let retryDbCollData = 0;
async function getDbCollData({ collectionName }) {
  // console.log('getDbData :', collectionName, docId);
  try {
    const ref = await db.collection(collectionName);
    const snaps = await ref.get();
    const docs = await snaps.docs;
    const data = docs.map(d => {
      const data = d.data();
      return { data: data, _id: d.id }
    });
    return {
      status: true,
      data,
      message: 'Successfully fetched the collection data'
    }
  } catch (error) {
    console.error(error);
    if (retryDbCollData < 2) {
      retryDbCollData++;
      alert(`Attempt: ${retryDbCollData} Unable to fetch the collection data. Reason: ${error.message}`);
      getDbCollData({ collectionName });
    } else {
      return {
        status: false,
        message: `Unable to fetch user details. Reson: ${error.message}`,
      };
    }
  }
}

// /////////////////////////

// async function getUserAuthState() {
//   try {
//     let user = false;
//     await auth.onAuthStateChanged(user => {
//       if (user) {
//         const userRawData = user;
//         const userId = user.uid;
//         user = {
//           userRawData, userId
//         }
//         console.log(user);
//       }
//     });
//     console.log(user);

//     if (user) {
//       console.log(user);
//       return {
//         status: true,
//         ...user,
//       }
//     } else {
//       return {
//         status: false,
//         message: `User Not LoggedIn`
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     return {
//       status: false,
//       message: `User Not LoggedIn`
//     }
//   }
// }