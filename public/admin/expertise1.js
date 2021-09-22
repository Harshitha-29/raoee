const db = firebase.firestore();

const VERTICALS = [];
const verticalsDropdownHTML = document.querySelector("#verticalsDropdown");
const subVerticalsDropdownHTML = document.querySelector(
  "#subVerticalsDropdown"
);
// const subVerticalsHolder = document.querySelector("#subVerticalsHolder");

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
  subVerticalsDropdownHTML.innerHTML = "";
  VERTICALS[0].subVerticals.map((subVer) => {
    subVerticalsDropdownHTML.innerHTML += `<option value="${subVer}">${subVer}</option>`;
  });
  // subVerticalsHolder.innerHTML = `
  // <label>Select Sub-Vertical
  //   <span style="color: red">*</span>
  // </label>
  // <select
  //   id="choices-multiple-remove-button"
  //   class="form-control"
  //   multiple
  //   required
  //   style="overflow-y: scroll">
  //   ${subOptions}
  // </select>
  // `;
  console.log(subVerticalsDropdownHTML);
});

// ///////////////////////////////////////////////

const expertiseFormHTML = document.querySelector("#expertiseForm");
const expertisesBtnHTML = document.querySelector("#expertisesBtn");

const expertiseForm = async (e) => {
  e.preventDefault();

  const vertical = expertiseFormHTML["vertical"].value;
  const expertises = expertiseFormHTML["expertises"].value;

  console.log(vertical);
  console.log(expertises);
  console.log(subV);

  const expertiseList = expertises.split(",").map((str) => str);
console.log(expertiseList);
  try {
    for (let i = 0; i < subV.length; i++) {
      console.log(subV[i]);
      const ref = await db
        .collection("verticals")
        .doc(vertical)
        .collection(subV[i])
        .doc(subV[i]);
      const refDoc = await ref.get();
      const refData = await refDoc.data();
      console.log(refData);
      refData.expertise.push(...expertiseList);
      await ref.update(refData);
      alert("Expertises Saved");
    }
  } catch (error) {
    console.error(error);
    alert(`Retry: ${error.message}`);
  }
};

// expertiseFormHTML.addEventListener('submit', expertiseForm)
expertisesBtnHTML.addEventListener("click", expertiseForm);

// /////////////////////////////////////////////

let subV = [];

expertiseFormHTML.addEventListener("change", (e) => {
  subV = Array.from(e.target.selectedOptions).map((x) => x.value ?? x.text);
});
