const db = firebase.firestore();
window.localStorage.removeItem("user")
const USER = undefined;

// //////////////////////////////

let cvCollections = [];

db.collection("miscellaneous")
  .doc("cvCollections")
  .onSnapshot(async (doc) => {
    cvCollections = await doc.data().cvCollections;

    collectCvData();
  });

// ////////////////////////////////////

async function extractCvs({ collectionName }) {
  return new Promise(async(resolve, reject) => {
    try {
      return await db.collection(collectionName).onSnapshot(async (snaps) => {
        const docs = await snaps.docs;

        return await docs.map((doc) => {
          const docData = doc.data();
          DATA.push(docData);
          console.log(DATA)
          return resolve();
        });
      });
    } catch (error) {
      console.error(error);
      return reject();
    }
  });
}

// ////////////////////////////////////

const DATA = [];
let reTry = 0;
async function collectCvData() {
  
  // await cvCollections.map(async(collectionName) => {
  let promises = [];
  for (let collectionName of cvCollections) {
    
    promises.push(extractCvs({ collectionName }));
    
  }
  console.log(DATA)
  await Promise.all(promises);
  console.log(DATA)

  
  displayDataTable();
}

// ////////////////////////////////////

const tableBodyHTML = document.querySelector("#tableBody");
const heading = document.querySelector("#heading");

function displayDataTable() {
  alert(88)
  let rows = "";
  let i=0;
  console.log(DATA)
  DATA.map((d) => {
    let allVerticals = "";
    d.verticals.map(v => {
      allVerticals += `, ${v.name}`
    })
    allVerticals = allVerticals.substring(2);

    let allSubVerticals = "";
    d.subVerticals.map(v => {
      // v.sver.map(sv => {
      //   allSubVerticals += `, ${sv}`
      // })
      allSubVerticals += v.sver.join(', ')
    })
  
    // allSubVerticals = allSubVerticals.substring(1, allSubVerticals.length)
  
    let allCategories = "";
    let allValues = "";
  
    d.expertise.map(v => {
      v.svers.map(sv => {
        sv.expertise.map(e => {
          allCategories += `${e.category}, `
          allValues += `${e.value}, `;
        })
      })
    })
    console.log(DATA)
    
    rows += `
    <tr>
      
      <td>${d.fname} ${d.lname}</td>
      <td>${allVerticals}</td>
      <td>${allSubVerticals}</td>
      <td>${allCategories}</td>
      <td>${allValues}</td>
      <td>
      <div class="dropdown">
      <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Actions
      </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="`+d.url+`" target="_blank">View CV</a>
            <a class="dropdown-item" href="#!" onclick=openProfile("`+d.userId+`")>View Profile</a>
            
        </div>
        <div class="modal fade" id="myModal`+d.fname+`+`+i+`" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-full" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Modal</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body p-4" id="result">
                    <p>The grid inside the modal is responsive too..</p>
                    <div class="row">
                        <div class="col-sm-6 col-lg-3"> Content </div>
                    
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">OK</button>
                </div>
            </div>
        </div>
      </div>
      </div>
      </td>
    </tr>

    `;
    i++;
    
  });


      
      tableBodyHTML.innerHTML = rows;
      
        $('#myTable').DataTable();
        $("#exporttable").click(function(e){
          var table = $("#myTable");
          if(table && table.length){
          $(table).table2excel({
          exclude: ".noExl",
          name: "Excel Document Name",
          filename: "LLLBBBootstrap" + new Date().toISOString().replace(/[\-\:\.]/g, "") + ".xls",
          fileext: ".xls",
          exclude_img: true,
          exclude_links: true,
          exclude_inputs: true,
          preserveColors: false
          });
          }
          });
  
      // $("#footer").load("footer.html");
  
      
      
}
  




      
    
    
   


