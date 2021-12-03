let VERTICALS_DATA = [];
let TEMP_VERTICALS_DATA = [];

getDbCollData({ collectionName: 'verticals' }).then(async (res) => {
  for (let i = 0; i < res.data.length; i++) {
    const data = res.data[i].data;
    VERTICALS_DATA.push({
      _id: data._id,
      name: data.name,
      subVerticals: data.subVerticals,
      allSubVerticals: []
    });
    for (let j = 0; j < data.subVerticals.length; j++) {
      const subCollDbData = await getDbSubCollData({
        collectionName: 'verticals',
        docId: data.name,
        subCollName: data.subVerticals[j],
        subDocId: data.subVerticals[j]
      })
      VERTICALS_DATA[i].allSubVerticals[j] = subCollDbData.data;
    }
  }

  console.log(VERTICALS_DATA);
  displayVerticalDropdown({isInital: false, data: false});
  // storeAllNamesIds();
  // displayCvDetails();
})

// /////////////////////////////////////

let expertiseOptions = [];

getDbData({ collectionName: 'experienceTags', docId: 'tags' }).then(res => {
  console.log(res);
  expertiseOptions = res.data.tags;
})

// /////////////////////////////////////

const verticalDropHolderHTML = document.querySelector("#verticalDropHolder");

function displayVerticalDropdown({isInital = false, data = false}) {
  let options = "";
  VERTICALS_DATA.map((ver) => {
    if(isInital) {
      let isPreset = data.filter(v => v === `${ver._id}__${ver.name}`);
      console.log(isPreset);
      if(isPreset.length > 0) {
        options += `<option selected value="${ver._id}__${ver.name}">${ver.name}</option>`;
        return;
      } 
    }
    options += `<option value="${ver._id}__${ver.name}">${ver.name}</option>`;
  });

  verticalDropHolderHTML.innerHTML = `
  <label>Select Vertical
    <span style="color: red">*</span>
  </label>
  <select
    id="verticals-dropdown"
    class="form-control"
    multiple
    name="verticals"
    onchange="verticalsSelected(event)"
    required
    selected
  >
    ${options}
  </select>
  `;

  new Choices("#verticals-dropdown", {
    removeItemButton: true,
    maxItemCount: 20,
    searchResultLimit: 10,
    renderChoiceLimit: 10,
  });
}

// ///////////////////////////////

let userVerticalsSelected = [];
let flag = false;

function verticalsSelected(e, isInital = false) {
  if (e) {
    userVerticalsSelected = Array.from(e.target.selectedOptions).map(
      (x) => x.value ?? x.text
    );
  } 


  if(isInital) {
    if(VERTICALS_DATA.length === 0) {
      const verDataInterval = setInterval(() => {
        if(VERTICALS_DATA.length === 0) return;
        userVerticalsSelected = USER.cv.verticals.map(v => `${v.vId}__${v.vName}`);
        //displayVerticalDropdown({isInital: true, data: userVerticalsSelected})
        clearInterval(verDataInterval);
      }, 500);
    } else {
      userVerticalsSelected = USER.cv.verticals.map(v => `${v.vId}__${v.vName}`);
      //displayVerticalDropdown({isInital: true, data: userVerticalsSelected})
    }
    setTimeout(function(){
      displayVerticalDropdown({isInital: true, data: userVerticalsSelected})
    },1000)
  
  }
  // console.log('verticalsSelected : userVerticalsSelected', userVerticalsSelected);
  // console.log('verticalsSelected : VERTICALS_DATA', VERTICALS_DATA);

  let subVerticalsToDisplay = [];

  TEMP_VERTICALS_DATA = []
  VERTICALS_DATA.map(v => {
    let vName = `${v._id}__${v.name}`;

    if (userVerticalsSelected.includes(vName)) {
      subVerticalsToDisplay.push({
        _id: v._id,
        name: v.name,
        subVerticals: v.subVerticals
      })
      TEMP_VERTICALS_DATA.push(v)
    }
  })
  console.log('verticalsSelected : TEMP_VERTICALS_DATA', TEMP_VERTICALS_DATA);
  console.log('verticalsSelected : subVerticalsToDisplay', subVerticalsToDisplay);

  if(isInital) {
    const d = [];
    console.log(USER.cv.svers);
    for(let j = 0; j < USER.cv.svers.length; j++) {
      const v = USER.cv.svers[j];

      for(let i = 0; i < v.svers.length; i++) {
        d.push(`${v.vId}__${v.vName}__${v.svers[i]}`); 
      }
    }
    console.log('verticalsSelected : d :', d);
    displaySubVerticalDropdown({ subVerticalsToDisplay: subVerticalsToDisplay, selectedSubV: d,  });
    flag = true;
    setTimeout(() => {
      subVerticalSelected(null, true);
    }, 500);
    return;
  } 

  if (!flag ) {
    displaySubVerticalDropdown({ subVerticalsToDisplay: subVerticalsToDisplay });
    flag = true;
    return;
  }
  subVerticalSelected();
  const selectedSubV = Array.from(
    document.querySelector("#subverticals-dropdown").selectedOptions
  ).map((x) => x.value ?? x.text)
  displaySubVerticalDropdown({ subVerticalsToDisplay: subVerticalsToDisplay, selectedSubV: selectedSubV });
}


// //////////////////////////////////

const subVerticalDropHolderHTML = document.querySelector("#subVerticalDropHolder");

function displaySubVerticalDropdown({ subVerticalsToDisplay, selectedSubV = false }) {
  let options = "";
  // console.log('displaySubVerticalDropdown : subVerticalsToDisplay', subVerticalsToDisplay);
  // console.log('displaySubVerticalDropdown : selectedSubV', selectedSubV);
  
  subVerticalsToDisplay.map((ver) => {
    ver.subVerticals.map(v => {
      let name = `${ver._id}__${ver.name}__${v}`;
      if (selectedSubV) {
        if (selectedSubV.includes(name)) {
          options += `<option selected value="${name}">${v}</option>`;
        } else {
          options += `<option value="${name}">${v}</option>`;
        }
      } else {
        options += `<option value="${name}">${v}</option>`;
      }
    })
  });

  subVerticalDropHolderHTML.innerHTML = `
  <label>Select Sub Vertical
    <span style="color: red">*</span>
  </label>
  <select
    id="subverticals-dropdown"
    class="form-control"
    multiple
    name="sub-verticals"
    required
    onchange="subVerticalSelected(event)"
  >
    ${options}
  </select>
  `;

  new Choices("#subverticals-dropdown", {
    removeItemButton: true,
    maxItemCount: 20,
    searchResultLimit: 10,
    renderChoiceLimit: 10,
  });

}

// ////////////////////////////////////

let userSubVerticalsSelected = [];

function subVerticalSelected(e, isInital = false) {
  if (e) {
    userSubVerticalsSelected = Array.from(e.target.selectedOptions).map((x) => x.value ?? x.text);
  } else {
    userSubVerticalsSelected = Array.from(
      document.querySelector("#subverticals-dropdown").selectedOptions
    ).map((x) => x.value ?? x.text);
  }

  console.log('subVerticalSelected : userSubVerticalsSelected :', userSubVerticalsSelected);
  console.log('subVerticalSelected : TEMP_VERTICALS_DATA :', TEMP_VERTICALS_DATA);

  let professtionsToDisplay = [];

  TEMP_VERTICALS_DATA.map((v, i) => {
    v.subVerticals.map(sv => {
      let vName = `${v._id}__${v.name}__${sv}`;
      let usvIndex = userSubVerticalsSelected.findIndex(name => name === vName);
      if (usvIndex === -1) return;
      let vIndex = professtionsToDisplay.findIndex(vv => vv._id === v._id);
      let allProfs = TEMP_VERTICALS_DATA[i].allSubVerticals.filter(svv => svv.name === sv);
      console.log('subVerticalSelected : allProfs', allProfs);
      if(allProfs.length==0){
        window.location.reload();
      }
      allProfs = allProfs[0].professions;
      if (vIndex === -1) {
        professtionsToDisplay.push({
          _id: v._id,
          name: v.name,
          subVerticals: [{
            name: sv,
            professions: [...allProfs]
          }]
        })
        // console.log(`subVerticalSelected : professtionsToDisplay`, professtionsToDisplay);
      } else {
        // console.log(`subVerticalSelected : professtionsToDisplay[i]`, professtionsToDisplay[i]);
        let svIndex = professtionsToDisplay[i].subVerticals.findIndex(svv => svv.name === sv);
        if (svIndex === -1) {
          professtionsToDisplay[i].subVerticals.push({
            name: sv,
            professions: [...allProfs]
          });
        } else {
          professtionsToDisplay[i].subVerticals[svIndex].professions.push(...allProfs);
        }
        // console.log(`subVerticalSelected : professtionsToDisplay`, professtionsToDisplay);
      }
    })
  })
  console.log(`subVerticalSelected : professtionsToDisplay :`, professtionsToDisplay);

  if(isInital) {
    displayExpertiseTable({ professtionsToDisplay: professtionsToDisplay, isInital: true })
  } else {
    displayExpertiseTable({ professtionsToDisplay: professtionsToDisplay, isInital: false })
  }
}

// ///////////////////////

const tablesHolderHTML = document.querySelector("#tablesHolder");

function displayExpertiseTable({ professtionsToDisplay, isInital= false }) {
  let tables = ``;
  let head = ``;
  let table = ``;
  isInital = isInital ? isInital : false;

  // console.log('displayExpertiseTable : professtionsToDisplay ', professtionsToDisplay);
  // console.log('displayExpertiseTable : isInital ', isInital);
  for (let i = 0; i < professtionsToDisplay.length; i++) {
    const v = professtionsToDisplay[i];
    // head = `
    // <h6 style="font-weight: 600">
    //   Select Expertise (
    //   <b style="color: red">Vertical Selected : ${v.name}</b> )
    // </h6>
    // <label>Tick the box if applicable</label>`;

    let tableHead, tableBody;

    for (let j = 0; j < v.subVerticals.length; j++) {
      const sv = v.subVerticals[j];
      tableHead = `
      <table class="table table-bordered">
        <thead class="thead-dark">
          <tr style="text-align: center">
            <th
              style="text-align: center; font-weight: 600"
              scope="col center"
            >
              Designation 
              <br>
              (${sv.name})
            </th>
            <th  style="text-align: center; font-weight: 600"
            scope="col center">
              Applicable?
            </th>
            <th  style="text-align: center; font-weight: 600"
            scope="col center">
              Select Expertise
            </th>
            <th
              style="text-align: center; font-weight: 600"
              scope="col"
            >
              Your Maximum Experience
            </th>
          </tr>
        </thead>
        <tbody>`;
      let allRows = '';
      for (let k = 0; k < sv.professions.length; k++) {
        const prof = sv.professions[k];
        allRows += profEachRow({ 
          designations: prof.designation, 
          professionTitle: prof.prof, 
          vId: v._id, 
          svName: sv.name, 
          vName: v.name, 
          isInital});

      }
      tableBody = allRows;
      let tableEnd = `</tbody></table>`;

      table += tableHead + tableBody + tableEnd;
    }

  }
  tables += head + table;
  tablesHolderHTML.innerHTML = tables;
  $('select').selectpicker();
}

// ////////////////////////

function expirencesFun({isInital = false, value = false}) {
  let eOptions = '';
  expertiseOptions.map((exp) => {
    if(isInital && exp === value) {
      eOptions += `<option selected value="${exp}" >${exp}</option> `;
    } else {
      eOptions += `<option  value="${exp}" >${exp}</option> `;
    }
  });
  return eOptions;
}


// ////////////////////////

function designationFun({ designations, vId, vName, svName, prof }) {
  let options = '';
  designations.map(d => {
    let fullName = `${vId}__${vName}__${svName}__${prof}__${d}`;
    let isChecked = '';
    if(userSelectedDesignation.includes(fullName)) {
      isChecked = 'selected';
    } else {
      isChecked = '';
    }
    options += `<option ${isChecked} data-checkdata="${vId}__${vName}__${svName}__${prof}__${d}">${d}</option>`;
  })
  return options;
}

// ////////////////////////

let userSliderChecked = [];

function sliderToggle(e, self) {
  const value = e.target.checked;
  const metaData = e.target.dataset.sliderdata;
  let id = self.parentNode.id.split('_')[1];
  id = `r_${id}`;
  if (value) {
    userSliderChecked.push(metaData);
    document.getElementById("sliderText"+id).innerHTML="Yes";
    document.querySelector(`#${id}_des`).parentElement.classList.remove('disabled');
    document.querySelector(`#${id}_des`).parentElement.childNodes[0].classList.remove('disabled');
    document.querySelector(`#${id}_exp`).parentElement.childNodes[0].classList.remove('disabled');
    document.querySelector(`#${id}_des`).disabled = false;
    document.querySelector(`#${id}_exp`).disabled = false;
  } else {
    const updatedDes = userSelectedDesignation.filter(d => !d.includes(metaData));
    userSelectedDesignation = updatedDes;
    document.getElementById("sliderText"+id).innerHTML="No";
    document.querySelector(`#${id}_des`).parentElement.classList.add('disabled');
    document.querySelector(`#${id}_des`).parentElement.childNodes[0].classList.add('disabled');
    document.querySelector(`#${id}_exp`).parentElement.childNodes[0].classList.add('disabled');
    document.querySelector(`#${id}_des`).parentElement.disabled = true;
    document.querySelector(`#${id}_des`).disabled = true;
    document.querySelector(`#${id}_exp`).disabled = true;
    const sliderIndex = userSliderChecked.findIndex(s => s.includes(metaData));
    userSliderChecked.splice(sliderIndex, 1);
  }
}

// ////////////////////////

function sliderFun({vId, vName, svName, prof, rowId}) {
  let isChecked = ``;
  let fullName = `${vId}__${vName}__${svName}__${prof}`;

  if(userSliderChecked.includes(fullName)) {
    isChecked = `checked`;
    setTimeout(function(){
      document.getElementById("sliderText"+rowId).innerHTML="Yes";
    },400)
  
  } else {
    isChecked = '';
  }

  let slider = `
  <label id="${rowId}_switch" class="switch">
    <input name="slider_checkbox" type="checkbox" ${isChecked} data-sliderdata="${vId}__${vName}__${svName}__${prof}" onchange="sliderToggle(event, this)" >
    <span class="slider round"></span>
    <span id="sliderText`+rowId+`" style="font-size: 12px;position: absolute;padding-top: 20px;padding-left: 10px;">No</span>
  </label>`;

  return slider;
}

// ////////////////////////

let userSelectedDesignation = []
function toggleDesignation(e, data = false) {
  userSelectedDesignation = [];
  if(e) {
    for(let  i = 0; i < e.target.selectedOptions.length; i++) {
      const node = e.target.selectedOptions[i];
      const dataset = node.dataset.checkdata;
      const vId = dataset.split('__')[0];
      const vName = dataset.split('__')[1];
      const svName = dataset.split('__')[2];
      const prof = dataset.split('__')[3];
      const des = dataset.split('__')[4];
      userSelectedDesignation.push(dataset)
    }
  }
  console.log('toggleDesignation : userSelectedDesignation',userSelectedDesignation);
}

// ////////////////////////////

function profEachRow({ designations, professionTitle, vId, vName, svName, isInital = false }) {
  // console.log('profEachRow : designations, professionTitle, vId, vName, svName', designations, professionTitle, vId, vName, svName, isInital);
  let rowId = Math.round(Math.random() * (9999 - 1000 +1) + 1000);
  rowId = `r_${rowId}`;
  const vn = `${vId}__${vName}__${svName}__${professionTitle}`;
  let isDisabled = ``;

  let row = '';
  let isPreset = false;
  if(userSliderChecked.includes(vn)) {
    isDisabled = '';
  } else {
    isDisabled = 'disabled';
  }
  let props = {
    isInital: false,
    value: false
  }

  if(isInital) {
    for(let i = 0; i < USER.cv.all.length; i++) {
      const v = USER.cv.all[i];
      for(let j = 0; j < v.svers.length; j++) {
        const sv = v.svers[j];
        // console.log(v.vId, vId);
        // console.log(sv.svName, svName);
        // console.log(sv.prof, professionTitle);
        if(v.vId === vId && sv.svName === svName && sv.prof === professionTitle) {
          let fullName = `${vId}__${vName}__${svName}__${professionTitle}`;
          userSliderChecked.push(fullName);
          isPreset = true;
          isDisabled = '';
          props = {
            isInital: true,
            value: sv.exp
          }
          for(let k = 0; k < sv.des.length; k++) {
            const des = sv.des[k];
            let fullNameDes = `${fullName}__${des}`;
            userSelectedDesignation.push(fullNameDes);
          }
          break;
        }
      }
    }
  }

  row = `
  <tr>
    <td>${professionTitle}</td>
    <td>
      ${sliderFun({vId: vId, vName: vName, svName: svName, prof: professionTitle, rowId: rowId})}
    </td>

    <td>
      <select ${isDisabled} id="${rowId}_des" multiple data-live-search="true" onchange="toggleDesignation(event)"  >
        ${designationFun({ designations: designations, prof: professionTitle, vId: vId, vName: vName, svName: svName })}
      </select>
    </td>
    <td>
      <select
        ${isDisabled}
        id="${rowId}_exp"
        style="width:100%;border-radius:10px;border:none;background-color:lightgray;padding:5px"
      >
      ${expirencesFun({...props})}
      </select>
    </td>
  </tr>`;
  return row;
}

// //////////////////////


