const db = firebase.firestore();

const USER = undefined;
checkIfAdmin();

const VERTICALS = [];
var allExpArr = [];
const verticalsDropdownHTML = document.querySelector("#verticalsDropdown");
var subVerId=""
// const subVerticalsDropdownHTML = document.querySelector(
//   "#subVerticalsDropdown"
// );
const subVerticalsHolderHTML = document.querySelector("#subVerticalsHolder");
document.getElementById("expertiseDropdown").disabled = true
document.getElementById("editExpertise").disabled = true
document.getElementById("exp").disabled = true
// ///////////////////////////////////////

db.collection("verticals").onSnapshot((snaps) => {
  const docs = snaps.docs;
  VERTICALS.length = 0;
  verticalsDropdownHTML.innerHTML = "";
  var docData;
  // document.getElementById("treeview").innerHTML=""
  docs.map((doc) => {
    if (!doc) {
      return;
    }
    
    docData = doc.data();
    console.log(doc.data())
    VERTICALS.push({ name: docData.name, subVerticals: docData.subVerticals,id : docData._id });
    verticalsDropdownHTML.innerHTML += `<option value="${docData.name}">${docData.name}</option>`;
  
    
    document.getElementById("treeview").innerHTML +=`
    <li style="color:blue" data-icon-cls="fa fa-inbox"  data-expanded="true">`+docData.name+`
        <ul id="`+docData._id.split(" ").join("")
        +`">
            
          
        </ul>
    </li>
    `
 
 
   
  });
  
  verticalsDropdownHTML.classList.add("selectpicker");

  if (VERTICALS.length === 0) {
    return;
  }

  let subOptions = "";
  
  let sbvr=""
  // subVerticalsDropdownHTML.innerHTML = "";
  VERTICALS[0].subVerticals.map((subVer) => {
    // subVerticalsDropdownHTML.innerHTML += `<option value="${subVer}">${subVer}</option>`;
    subOptions += `<option value="${subVer}">${subVer}</option>`;
   
    
  });
  for(let k in VERTICALS){
   
    VERTICALS[k].subVerticals.map((subVer) => {
      document.getElementById(VERTICALS[k].id.split(" ").join("")).innerHTML+=`
      <li style="color:black" data-icon-cls="fa fa-inbox" data-expanded="true"><b>`+subVer+` </b>
        <ul id="`+VERTICALS[k].id.split(" ").join("")+"_"+subVer.split(" ").join("")+`">
       
          
        
        </ul>
      </li>`
    });
  
    
  }
  
  for(let k in VERTICALS){
   
    VERTICALS[k].subVerticals.map((subVer) => {
     
      let docRef = db.collection("verticals").doc(VERTICALS[k].name);

    
      let subDocRef = docRef.collection(subVer).doc(subVer);
      subDocRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          
          for (let i in doc.data().expertise) {
            document.getElementById(VERTICALS[k].id.split(" ").join("")+"_"+subVer.split(" ").join("")).innerHTML+=` <li style="color:purple">`+doc.data().expertise[i].category+`&nbsp;<i  ></i>
            <ul id="`+VERTICALS[k].id.split(" ").join("")+"_"+subVer.split(" ").join("")+"_"+doc.data().expertise[i].category.split(" ").join("")+`">
            </ul>
            </li>`
            
          }
        }
        
      });
      
    });
     
    
  }
  for(let k in VERTICALS){
   
    VERTICALS[k].subVerticals.map((subVer) => {
     
      let docRef = db.collection("verticals").doc(VERTICALS[k].name);

    
      let subDocRef = docRef.collection(subVer).doc(subVer);
      subDocRef
      .get()
      .then((doc) => {
        if (doc.exists) {
  
          for (let i in doc.data().expertise) {
            
            for(let j in doc.data().expertise[i].subCategory){
             
                console.log(doc.data().expertise[i].subCategory[j].name)
       
                document.getElementById(VERTICALS[k].id.split(" ").join("")+"_"+subVer.split(" ").join("")+"_"+doc.data().expertise[i].category.split(" ").join("")).innerHTML+=` 
               
                <li style="color:green"><span style="color:red">*</span>`+doc.data().expertise[i].subCategory[j].name+`</li>
                <ul id="`+VERTICALS[k].id.split(" ").join("")+"_"+subVer.split(" ").join("")+"_"+doc.data().expertise[i].category.split(" ").join("")+"_"+doc.data().expertise[i].subCategory[j].name.split(" ").join("")+"_"+j+`">
                </ul>
                </li>`
              
            
          
            }
           
            
          }
        }
        
      });
      
    });
     
    
  }
  
  // let docRef = db.collection("verticals").doc(docData.name);
  // let subDocRef = docRef.collection(subVer).doc(subVer);
  // subDocRef
  // .get()
  // .then((doc) => {
  //   if (doc.exists) {
  //     console.log("Document data:", doc.data());
  //     console.log(subVer)
  //     for (let i in doc.data().expertise) {
  //       console.log(doc.data().expertise[i].category)
  //       document.getElementById(subVer).innerHTML=`
  //       <li >"dsf"<i class="fa fa-trash"></i></li>
  //       `
      
  //     }
  //   }
  // });
  
  subVerticalsHolderHTML.innerHTML = `
    <label>Select Sub-Vertical
      <span style="color: red">*</span>
    </label>
    <select
      id="choices-multiple-remove-button"
      class="form-control"
      multiple
      name="subVertical"
      required >
      ${subOptions}
    </select>
    
    `;
  
  new Choices("#choices-multiple-remove-button", {
    removeItemButton: true,
    maxItemCount: 10,
    searchResultLimit: 10,
    renderChoiceLimit: 10,
  });
  document.getElementById("choices-multiple-remove-button").addEventListener("change", (e) => {
    changeExpertise2(e);
     
   });
  
  // console.log(subVerticalsDropdownHTML);
});

// ///////////////////////////////////////////////

const expertiseFormHTML = document.querySelector("#expertiseForm");
const expertisesFromBtnHTML = document.querySelector("#expertisesFormBtn");

const expertiseForm = async (e) => {
  e.preventDefault();

  const vertical = expertiseFormHTML["vertical"].value;
  var expertiseCategorySelected = document.getElementById("exp").value;
  //const expertisesTags = expertiseFormHTML["expertisesTags"].value;

  //const expertiseTagList = expertisesTags.split(",").map((str) => str);
  const subCat = document.getElementById("subCatDropdown").value;
  try {
    for (let i = 0; i < subVerticalsSelected.length; i++) {
      // const ref = await db
      //   .collection("verticals")
      //   .doc(vertical)
      //   .collection(subVerticalsSelected[i])
      //   .doc(subVerticalsSelected[i]);     
      let ver = document.getElementById("verticalsDropdown").value;
      let subVer = document.getElementById(
        subVerId
      ).value;
      console.log(subVer)     
      let docRef = db.collection("verticals").doc(ver);

      let fetchedArr = [];
      let updatedTagsArr = [];
      let subDocRef = docRef.collection(subVer).doc(subVer);
      let subCatFetchedArr = []
      expertiseCategory = document.getElementById("expertiseDropdown").value;

      subDocRef
        .get()
        .then((doc) => {
          if (doc.exists) {
          
            for (let i in doc.data().expertise) {
              fetchedArr.push(doc.data().expertise[i]);
              if (
                doc.data().expertise[i].category ==
                document.getElementById("expertiseDropdown").value
              ) {
                // alert(doc.data().expertise[i].category)
                for (let j in doc.data().expertise[i].subCategory) {
                  subCatFetchedArr.push(doc.data().expertise[i].subCategory[j]);
                  
                }
                for (let j in doc.data().expertise[i].tags) {
                  updatedTagsArr.push(doc.data().expertise[i].tags[j]);
                  $('#tags').tagsinput('add', doc.data().expertise[i].tags[j]);
                }
                // for (let j in expertiseTagList) {
                //   updatedTagsArr.push(expertiseTagList[j]);
                
                // }
              }
            }
          
            if(document.getElementById("subCatInput").value && !document.getElementById("subCatInput").value.trim()=='' ){
              
              if (document.getElementById("editExpertise").checked == true) {
            
                let updatedObject = {};
                let subExpObj = {}
                let subExpArr = [];
                console.log(subCatFetchedArr)
                // subExpObj["name"] = subCat
                // subExpObj["tags"] = expertiseTagList
                // subExpArr.push(subExpObj)
                console.log( subExpArr)
                for (let i in fetchedArr) {
                  if (
                    fetchedArr[i].category ==
                    document.getElementById("expertiseDropdown").value
                  ) {                   
                    updatedObject["category"] = fetchedArr[i].category;  
                    delete fetchedArr[i];
                    if(subCatFetchedArr.length!=0){
                      for(let j in subCatFetchedArr){                    
                        if(subCatFetchedArr[j].name == document.getElementById("subCatDropdown").value && document.getElementById("toggleSubExpertise").checked){                       
                          subExpObj["name"] = subCat
                          //subExpObj["tags"] = expertiseTagList                         
                          delete subCatFetchedArr[j];    
                          subCatFetchedArr.splice(j, 1, subExpObj);
                          console.log(subExpObj)
                          break;
                        }else if(subCatFetchedArr[j].name == document.getElementById("subCatInput").value && document.getElementById("toggleSubExpertise").checked==false){
                          alert("Expertise Already Present .")
                          return;
                        }else if(!document.getElementById("toggleSubExpertise").checked){                        
                          subExpObj["name"] = document.getElementById("subCatInput").value
                          //subExpObj["tags"] = expertiseTagList
                              // subExpArr.push(subExpObj)
                          console.log(document.getElementById("subCatInput").value)                 
                          subCatFetchedArr.push(subExpObj)
                          break;
                        }
                      }
                    }else{
                      if(!document.getElementById("toggleSubExpertise").checked){
                        subExpObj["name"] = document.getElementById("subCatInput").value
                        //subExpObj["tags"] = expertiseTagList
                            // subExpArr.push(subExpObj)
                        console.log(document.getElementById("subCatInput").value)                         
                        subCatFetchedArr.push(subExpObj)  
                      }                  
                    }                  
                    console.log(subCatFetchedArr)
                    updatedObject["subCategory"] =  subCatFetchedArr  
                    fetchedArr.splice(i, 1, updatedObject);                   
                  }
                }
                
                let finalUpdatedObj = {};
                finalUpdatedObj["expertise"] = fetchedArr;
                finalUpdatedObj["name"] = subVer;
                subDocRef.update(finalUpdatedObj);
                nowuiDashboard.showNotification(
                  "top",
                  "center",
                  "Expertise Updated Succesfully",
                  "primary"
                );
                $('#tags').tagsinput('removeAll');
  
              } else {
                let subExpObj = {}
                let subExpArr = [];
                let newExpertiseObj = {};
                let finalUpdatedObj = {};
                let nameVal = ""
                if(!document.getElementById("subCatInput").value || document.getElementById("subCatInput").value ==""){
                  nameVal = document.getElementById("subCatDropdown").value
                }else{
                  nameVal = document.getElementById("subCatInput").value
                }
                subExpObj["name"] = nameVal
                //subExpObj["tags"] = expertiseTagList
                subExpArr.push(subExpObj)
                console.log(subExpArr)
                
                newExpertiseObj["category"] = expertiseCategorySelected;
                newExpertiseObj["subCategory"] = subExpArr; 
                fetchedArr.push(newExpertiseObj);
                console.log(newExpertiseObj);
                console.log(fetchedArr);
                finalUpdatedObj["expertise"] = fetchedArr;
                finalUpdatedObj["name"] = subVer;
                subDocRef.update(finalUpdatedObj);
                nowuiDashboard.showNotification(
                  "top",
                  "center",
                  "Expertise Added Succesfully",
                  "primary"
                );
                $('#tags').tagsinput('removeAll');
              }
            }else{
              alert("Designation Field cannot be empty")
            }
            
          }else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
  } catch (error) {
    console.error(error);
    alert(`Retry: ${error.message}`);
  }
};

expertisesFromBtnHTML.addEventListener("click", expertiseForm);
document.getElementById("expertisesdeleteBtn").addEventListener('click',confirmDelete)
// /////////////////////////////////////////////


////////////////////DELETE EXPERTISE//////////////////////////
function confirmDelete(){
 let ans =  confirm("Are you sure to delete the expertise ? ")
 if(ans){
  deleteExpertise()
  
 }
}
function deleteExpertise(){
  let ver = document.getElementById("verticalsDropdown").value;
  let subVer = document.getElementById(
    subVerId
  ).value;
  console.log(subVer)
 
  let docRef = db.collection("verticals").doc(ver);

  let fetchedArr = [];
  let subDocRef = docRef.collection(subVer).doc(subVer);

  expertiseCategory = document.getElementById("expertiseDropdown").value;

  subDocRef
    .get()
    .then(async (doc) => {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        for (let i in doc.data().expertise) {
          fetchedArr.push(doc.data().expertise[i]);
        }
        console.log(fetchedArr)
        if(fetchedArr.length>0){
          if (document.getElementById("editExpertise").checked == true) {
            
            let updatedObject = {};
            for (let i in fetchedArr) {
              if (
                fetchedArr[i].category ==
                document.getElementById("expertiseDropdown").value
              ) {
              
                const index = fetchedArr.indexOf(fetchedArr[i]);
                if (index > -1) {
                  fetchedArr.splice(index, 1);
                }
  
              }
            }
            console.log(fetchedArr)
            let finalUpdatedObj = {};
            finalUpdatedObj["expertise"] = fetchedArr;
            finalUpdatedObj["name"] = subVer;
            await subDocRef.update(finalUpdatedObj).then(function(){
              nowuiDashboard.showNotification(
                "top",
                "center",
                "Expertise Deleted Succesfully",
                "primary"
              );
              setTimeout(function(){
                location.reload();
              },800)
            }).catch(function(error){
              nowuiDashboard.showNotification(
                "top",
                "center",
                  error,
                "primary"
              );
            })
           
           
          }
        }else{
          nowuiDashboard.showNotification(
            "top",
            "center",
            "No Expertise Found To Delete",
            "primary"
          );
        }
        
      }
    });
}


/////////////////////////////////////////////////////////////


let subVerticalsSelected = [];

expertiseFormHTML.addEventListener("change", (e) => {
  subVerticalsSelected = Array.from(e.target.selectedOptions).map(
    (x) => x.value ?? x.text
  );
});
///////////////// Trigger Expertise Func////////
function triggerExpertise(subVer2) {
  subVerId = subVer2;
  let ver = document.getElementById("verticalsDropdown").value;
  let subVer = document.getElementById(subVer2).value;
  let docRef = db.collection("verticals").doc(ver);
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("Document data:", doc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });

  document.getElementById("expertiseDropdown").innerHTML = "";
  let subDocRef = docRef.collection(subVer).doc(subVer);
  subDocRef.get().then((doc) => {
    if (doc.exists) {
      console.log("Document data:", doc.data());
      for (let i in doc.data().expertise) {
        console.log(doc.data().expertise[i].category);
        document.getElementById("expertiseDropdown").innerHTML +=
          `
                <option>` +
          doc.data().expertise[i].category +
          `</option>
            `;
      }
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  });
}
///////////////////////////////////////////////
// /////////////////////////////////////////////

const changeSubVertical = (e) => {
  
  e.preventDefault();
  console.log(e.target.value);
  console.log(VERTICALS);
  const verticalIndex = VERTICALS.findIndex(
    (ver) => ver.name === e.target.value
  );
  console.log(verticalIndex);
  let subOptions = "";
  // subVerticalsDropdownHTML.innerHTML = "";
  console.log(VERTICALS[verticalIndex])
  VERTICALS[verticalIndex].subVerticals.map((subVer) => {
    // subVerticalsDropdownHTML.innerHTML += `<option value="${subVer}">${subVer}</option>`;
    subOptions += `<option value="${subVer}">${subVer}</option>`;
   
    
  });
 
  subVerticalsHolderHTML.innerHTML = `
    <label>Select Sub-Vertical
      <span style="color: red">*</span>
    </label>
    <select
      id="choices"
      class="form-control"
      multiple
      required >
      ${subOptions}
    </select>
    `;
  new Choices("#choices", {
    removeItemButton: true,
    maxItemCount: 10,
    searchResultLimit: 10,
    renderChoiceLimit: 10,
  });
  document.getElementById("choices").addEventListener("change", (e) => {
   changeExpertise(e);
    
  });
};

expertiseFormHTML["vertical"].addEventListener("change", changeSubVertical);

function changeExpertise(e){
  
  if( document.getElementById("choices").length>1){
    document.getElementById("editExpertise").disabled = true
    document.getElementById("expertiseDropdown").disabled = true
    document.getElementById("editExpertise").checked = false
     $('#tags').tagsinput('removeAll');
  }else{
    document.getElementById("editExpertise").disabled = false
    document.getElementById("expertisesdeleteBtn").style.display="none"
  }
  if(document.getElementById("choices").length == 0 ){
    
    document.getElementById("exp").disabled = true 
    document.getElementById("exp") .value = ""
    document.getElementById("editExpertise").disabled = true
    document.getElementById("expertiseDropdown").disabled = true
    document.getElementById("editExpertise").checked = false
     $('#tags').tagsinput('removeAll');
  }else{
    document.getElementById("exp").disabled = false  
    document.getElementById("subCatInput").disabled = false 
    document.getElementById("toggleSubExpertise").disabled = false 
    document.getElementById("expertisesdeleteBtn").style.display="none"
  }
  subid="choices"
  triggerExpertise(subid);
  

  subVerticalsSelected = Array.from(e.target.selectedOptions).map(
    (x) => x.value ?? x.text
  );
}
function changeExpertise2(e){
  
  if( document.getElementById("choices-multiple-remove-button").length>1){
    document.getElementById("editExpertise").disabled = true
    document.getElementById("expertiseDropdown").disabled = true
    document.getElementById("editExpertise").checked = false
     $('#tags').tagsinput('removeAll');
  }else{
    document.getElementById("editExpertise").disabled = false
    document.getElementById("expertisesdeleteBtn").style.display="none"
 
  }
  if(document.getElementById("choices-multiple-remove-button").length == 0 ){
    
    document.getElementById("exp").disabled = true 
   
    document.getElementById("exp") .value = ""
    document.getElementById("editExpertise").disabled = true
    document.getElementById("expertiseDropdown").disabled = true
    document.getElementById("editExpertise").checked = false
     $('#tags').tagsinput('removeAll');
  }else{
    document.getElementById("exp").disabled = false
    document.getElementById("toggleSubExpertise").disabled = false  
    document.getElementById("subCatInput").disabled = false 
    document.getElementById("expertisesdeleteBtn").style.display="none" 
  }
  subid="choices-multiple-remove-button"
  triggerExpertise(subid);

  subVerticalsSelected = Array.from(e.target.selectedOptions).map(
    (x) => x.value ?? x.text
  );
}
function toggleEditExpertise(e){
  if (e?.target?.checked) {
    document.getElementById("exp").disabled = true
    document.getElementById("expertiseDropdown").disabled = false
    //getSetTagsFromDb();
    
    document.getElementById("expertisesdeleteBtn").style.display="inline-block"

  } else {
    document.getElementById("expertiseDropdown").disabled = true
    document.getElementById("exp").disabled = false
    document.getElementById("toggleSubExpertise").disabled = false 
    document.getElementById("subCatInput").disabled = false 
    $('#tags').tagsinput('removeAll');
    document.getElementById("expertisesdeleteBtn").style.display="none"
  }
}

function toggleSubExpertise(e){
  if (e?.target?.checked) {
    // document.getElementById("exp").disabled = true
    document.getElementById("subCatInput").disabled = true
    document.getElementById("subCatDropdown").disabled = false
    // getSetTagsFromDb();
    // document.getElementById("expertisesdeleteBtn").style.display="inline-block"
    
    //getSetSubTagsFromDb()
  } else {
    document.getElementById("subCatInput").disabled = false;
    document.getElementById("subCatDropdown").disabled = true
    // getSetTagsFromDb();
    // getSetTagsFromDb();
    // document.getElementById("expertiseDropdown").disabled = true
    // document.getElementById("exp").disabled = false
    // $('#tags').tagsinput('removeAll');
    // document.getElementById("expertisesdeleteBtn").style.display="none"
  }
}


function pushExperience(){
  const expertisesTags = document.getElementById("tags").value;
  const expertiseTagList = expertisesTags.split(",").map((str) => str);
  
  db.collection("experienceTags").doc("tags").set({
    tags:expertiseTagList
  })
  .then(() => {
    nowuiDashboard.showNotification(
      "top",
      "center",
      "Experience Updated Succesfully",
      "primary"
    );
  })
  .catch((error) => {
      console.error("Error writing document: ", error);
  });
}
let docRef = db.collection("experienceTags").doc("tags");

docRef.get().then((doc) => {
    if (doc.exists) {
        console.log("Document data:", doc.data());
        for(let k in doc.data().tags){
          
          $('#tags').tagsinput('add',doc.data().tags[k]);
        }
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});
document.getElementById("editExpertise").addEventListener("change", toggleEditExpertise);
document.getElementById("toggleSubExpertise").addEventListener("change", toggleSubExpertise);
// document.getElementById("expertiseDropdown").addEventListener("change", getSetTagsFromDb);
//document.getElementById("subCatDropdown").addEventListener("change", getSetSubTagsFromDb);
subCatDropdown

function deleteExp(obj,index,subVer){
  console.log(obj)
  console.log(index)
  console.log(subVer)
}