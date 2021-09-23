const db = firebase.firestore();

const VERTICALS = [];
const verticalsDropdownHTML = document.querySelector("#verticalsDropdown");
// const subVerticalsDropdownHTML = document.querySelector(
//   "#subVerticalsDropdown"
// );
const subVerticalsHolderHTML = document.querySelector("#subVerticalsHolder");

// ///////////////////////////////////////

db.collection("verticals").onSnapshot((snaps) => {
  const docs = snaps.docs;
  VERTICALS.length = 0;
  verticalsDropdownHTML.innerHTML = "";
  docs.map((doc) => {
    if (!doc) {
      return;
    }
    const docData = doc.data();
    VERTICALS.push({ name: docData.name, subVerticals: docData.subVerticals });
    verticalsDropdownHTML.innerHTML += `<option value="${docData.name}">${docData.name}</option>`;
  });

  verticalsDropdownHTML.classList.add("selectpicker");

  if (VERTICALS.length === 0) {
    return;
  }

  let subOptions = "";
  // subVerticalsDropdownHTML.innerHTML = "";
  VERTICALS[0].subVerticals.map((subVer) => {
    // subVerticalsDropdownHTML.innerHTML += `<option value="${subVer}">${subVer}</option>`;
    subOptions += `<option value="${subVer}">${subVer}</option>`;
  });

  subVerticalsHolderHTML.innerHTML = `
    <label>Select Sub-Vertical
      <span style="color: red">*</span>
    </label>
    <select
      id="choices-multiple-remove-button"
      class="form-control"
      multiple
      required >
      ${subOptions}
    </select>
    `;
  // console.log(subVerticalsDropdownHTML);
});

// ///////////////////////////////////////////////

const expertiseFormHTML = document.querySelector("#expertiseForm");
const expertisesFromBtnHTML = document.querySelector("#expertisesFormBtn");

const expertiseForm = async (e) => {
  e.preventDefault();

  const vertical = expertiseFormHTML["vertical"].value;
  const expertiseCategory = expertiseFormHTML["expertiseCategory"].value;
  const expertisesTags = expertiseFormHTML["expertisesTags"].value;

  const expertiseTagList = expertisesTags.split(",").map((str) => str);
  try {
    for (let i = 0; i < subVerticalsSelected.length; i++) {
      const ref = await db
        .collection("verticals")
        .doc(vertical)
        .collection(subVerticalsSelected[i])
        .doc(subVerticalsSelected[i]);
      const refDoc = await ref.get();
      const refData = await refDoc.data();
      refData.expertise.push({
        tags: [...expertiseTagList],
        category: expertiseCategory,
      });
      await ref.update(refData);
      expertiseFormHTML.reset();
      alert("Expertises Saved");
    }
  } catch (error) {
    console.error(error);
    alert(`Retry: ${error.message}`);
  }
};

expertisesFromBtnHTML.addEventListener("click", expertiseForm);

// /////////////////////////////////////////////

let subVerticalsSelected = [];

expertiseFormHTML.addEventListener("change", (e) => {
  subVerticalsSelected = Array.from(e.target.selectedOptions).map(
    (x) => x.value ?? x.text
  );
});

// /////////////////////////////////////////////

const changeSubVertical = (e) => {
  e.preventDefault();
  console.log(e.target.value);
  console.log(VERTICALS);
  const verticalIndex = VERTICALS.findIndex(ver => ver.name === e.target.value)
  console.log(verticalIndex);
  let subOptions = "";
  // subVerticalsDropdownHTML.innerHTML = "";
  VERTICALS[verticalIndex].subVerticals.map((subVer) => {
    // subVerticalsDropdownHTML.innerHTML += `<option value="${subVer}">${subVer}</option>`;
    subOptions += `<option value="${subVer}">${subVer}</option>`;
  });

  subVerticalsHolderHTML.innerHTML = `
    <label>Select Sub-Vertical
      <span style="color: red">*</span>
    </label>
    <select
      id="choices-multiple-remove-button"
      class="form-control"
      multiple
      required >
      ${subOptions}
    </select>
    `;
};

expertiseFormHTML["vertical"].addEventListener("change", changeSubVertical);
