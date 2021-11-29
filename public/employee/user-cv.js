const cvUrlHTML = document.querySelector("#cvUrl");
const verticalsBtnsHTML = document.querySelector("#verticalsBtns");
const verticalsTablesHTML = document.querySelector("#verticalsTables");
const editCvUrlHolderHTML = document.querySelector('#editCvUrlHolder');
const workCountryHTML = document.querySelector('#work-country');
const workStatesHTML = document.querySelector('#work-states');
const workCitiesHTML = document.querySelector('#work-cities');
const stsHTML = document.querySelector('#sts');

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
  displayVerticalDropdown();
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

function displayVerticalDropdown() {
  let options = "";

  VERTICALS_DATA.map((ver) => {
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

function verticalDeleted({ previousVerticals, newVerticals }) {
  const updatedVerticals = previousVerticals.filter(
    (element) => !newVerticals.includes(element)
  );

}

// ///////////////////////////////

let userVerticalsSelected = [];
let flag = false;

function verticalsSelected(e) {
  let prevUserVerticalsSelected = userVerticalsSelected;

  if (e) {
    userVerticalsSelected = Array.from(e.target.selectedOptions).map(
      (x) => x.value ?? x.text
    );
  }
  console.log('verticalsSelected : userVerticalsSelected', userVerticalsSelected);


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




  if (!flag) {
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
  console.log('displaySubVerticalDropdown : subVerticalsToDisplay', subVerticalsToDisplay);
  subVerticalsToDisplay.map((ver) => {
    ver.subVerticals.map(v => {
      let name = `${ver._id}__${ver.name}__${v}`;
      if (selectedSubV) {
        console.log(selectedSubV);
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

function subVerticalSelected(e) {
  if (e) {
    userSubVerticalsSelected = Array.from(e.target.selectedOptions).map((x) => x.value ?? x.text);
  } else {
    userSubVerticalsSelected = Array.from(
      document.querySelector("#subverticals-dropdown").selectedOptions
    ).map((x) => x.value ?? x.text);
  }
  // console.log('subVerticalSelected : userSubVerticalsSelected :', userSubVerticalsSelected);
  // console.log('subVerticalSelected : TEMP_VERTICALS_DATA :', TEMP_VERTICALS_DATA);

  let professtionsToDisplay = [];

  TEMP_VERTICALS_DATA.map((v, i) => {
    v.subVerticals.map(sv => {
      let vName = `${v._id}__${v.name}__${sv}`;
      let usvIndex = userSubVerticalsSelected.findIndex(name => name === vName);
      if (usvIndex === -1) return;
      let vIndex = professtionsToDisplay.findIndex(vv => vv._id === v._id);
      let allProfs = TEMP_VERTICALS_DATA[i].allSubVerticals.filter(svv => svv.name === sv);
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
  // console.log(`subVerticalSelected : professtionsToDisplay :`, professtionsToDisplay);
  displayExpertiseTable({ professtionsToDisplay: professtionsToDisplay })
}

// ///////////////////////

const tablesHolderHTML = document.querySelector("#tablesHolder");

function displayExpertiseTable({ professtionsToDisplay }) {
  let tables = ``;
  let head = ``;
  let table = ``;

  console.log('displayExpertiseTable : professtionsToDisplay ', professtionsToDisplay);
  for (let i = 0; i < professtionsToDisplay.length; i++) {
    const v = professtionsToDisplay[i];
    head = `
    <h6 style="font-weight: 600">
      Select Expertise (
      <b style="color: red">Vertical Selected : ${v.name}</b> )
    </h6>
    <label>Tick the box if applicable</label>`;

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
          vName: v.name });
      }
      tableBody = allRows;
      let tableEnd = `</tbody></table>`;

      table += tableHead + tableBody + tableEnd;
    }

  }
  tables += head + table;
  tablesHolderHTML.innerHTML = tables;
  $('select').selectpicker();
  activeDesDropdownFun();
  
  // exeJquery();
}

// ////////////////////////

function exeJquery() {
  (function ($) {
    $.fn.multiselect = function () {
      var selector = this;
      var options = $.extend(
        {
          onChange: function (val) {
            console.log(val);
          },
        },
        arguments[0] || {}
      );
      activate();

      /////////

      function activate() {
        //events
        $(selector)
          .find(".title")
          .on("click", function (e) {
            $(this).parent().find(".select-options").toggle();
          });

        $(selector)
          .find('input[type="checkbox"]')
          .change(function (e) {
            options.onChange.call(this);
          });
      }
    };
  })(jQuery);

  $(document).ready(function () {
    $(".select-list").multiselect({
      onChange: () => {
        var checkboxValue = $(this).val();
        var isChecked = $(this).is(":checked");
      },
      disabled: true,
    });
  });
}

// ////////////////////////

function expirencesFun() {
  let eOptions = '';
  expertiseOptions.map((exp) => {
    eOptions += `<option  value="${exp}" >${exp}</option> `;
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
      isChecked = 'checked';
    } else {
      isChecked = '';
    }
    options += `<option data-checkdata="${vId}__${vName}__${svName}__${prof}__${d}">${d}</option>`;
  })
  return options;
}

// ////////////////////////

let userSliderChecked = [];

function sliderToggle(e, self) {
  const value = e.target.checked;
  const targetElement = self.parentNode.parentNode.nextElementSibling.childNodes[1];
  const metaData = e.target.dataset.sliderdata;

  if (value) {
    targetElement.style.pointerEvents = "all";
    targetElement.style.opacity = 1;
    self.parentNode.childNodes[5].innerHTML = 'Yes';
    userSliderChecked.push(metaData);

  } else {
    const updatedDes = userSelectedDesignation.filter(d => !d.includes(metaData));
    userSelectedDesignation = updatedDes;
    targetElement.style.pointerEvents = "none"
    targetElement.style.opacity = 0.4;
    console.log(targetElement.childNodes);
    targetElement.childNodes[3].style.display = "none";
    self.parentNode.childNodes[5].innerHTML = 'No';
    const sliderIndex = userSliderChecked.findIndex(s => s.includes(metaData));
    userSliderChecked.splice(sliderIndex, 1);
  }
}

// // ////////////////////////

function activeDesDropdownFun() {
  
}

// ////////////////////////

function sliderFun({vId, vName, svName, prof, rowId}) {
  let isChecked = ``;
  let fullName = `${vId}__${vName}__${svName}__${prof}`;

  if(userSliderChecked.includes(fullName)) {
    isChecked = `checked`;
    sliderToggle(null, )
  } else {
    isChecked = '';
  }

  let slider = `
  <label id="${rowId}_switch" class="switch">
    <input type="checkbox" ${isChecked} data-sliderdata="${vId}__${vName}__${svName}__${prof}" onchange="sliderToggle(event, this)" >
    <span class="slider round"></span>
    <span id="sliderText" style="font-size: 12px;position: absolute;padding-top: 20px;padding-left: 10px;">No</span>
  </label>`;

  return slider;
}

// ////////////////////////

function profEachRow({ designations, professionTitle, vId, vName, svName }) {
  const rowId = Math.round(Math.random() * (9999 - 1000 +1) + 1000);
  let row = `
  <tr>
    <td>${professionTitle}</td>
    <td>
      ${sliderFun({vId: vId, vName: vName, svName: svName, prof: professionTitle, rowId: rowId})}
    </td>

    <td>
      <select id="${rowId}_des" class="selectpicker" multiple data-live-search="true" >
        ${designationFun({ designations: designations, prof: professionTitle, vId: vId, vName: vName, svName: svName })}
      </select>
    </td>
    <td>
      <select
        class="selectpicker" 
        style="width:100%;border-radius:10px;border:none;background-color:lightgray;padding:5px"
      >
      ${expirencesFun()}
      </select>
    </td>
  </tr>`;
  
 
  return row;
}

// //////////////////////

let userSelectedDesignation = []
function toggleDesignation(e) {
  const metaData = e.target.dataset.checkdata;
  const value = e.target.checked;

  const vId = metaData.split('__')[0];
  const vName = metaData.split('__')[1];
  const svName = metaData.split('__')[2];
  const prof = metaData.split('__')[3];
  const des = metaData.split('__')[4];
  if(value) {
    userSelectedDesignation.push(metaData)
  }

  console.log(metaData);
  console.log(value);
}

// ////////////////////////////
