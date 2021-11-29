const db = firebase.firestore();
const storage = firebase.storage();
let teamEditor;
let ABOUT_REF = false;
let ABOUT_DATA = false;

const USER = undefined;
checkIfAdmin();
const aboutUsEditorHTML = document.querySelector("#editor"); 

ClassicEditor.create(aboutUsEditorHTML)
  .then((editor) => {
    teamEditor = editor;
  })
  .catch((error) => {
    console.error(error);
  });


  var files = [];
  document.getElementById("files").addEventListener("change", function(e) {
    files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      console.log(files[i]);
    }
  });
  var deig,Tname,teamDetail;
  document.getElementById("send").addEventListener("click", function() {
 
     desig =document.querySelector("#desig").value
     Tname = document.querySelector("#memName").value
     teamDetail = teamEditor.getData();
    

    //checks if files are selected
    if (files.length != 0) {
      //Loops through all the selected files
      for (let i = 0; i < files.length; i++) {
        //create a storage reference
        var storage = firebase.storage().ref("ourTeams").child(files[i].name);
  
        //upload file
        var upload = storage.put(files[i]);
  
        //update progress bar
        upload.on(
          "state_changed",
          function progress(snapshot) {
            var percentage =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById("progress").value = percentage;
          },
  
          function error() {
            alert("error uploading file");
          },
  
          function complete() {
              
            document.getElementById(
              "uploading"
            ).innerHTML += `${files[i].name} upoaded <br />`;
            getFileUrl(files[i].name)
           
          }
        );
      }
    } else {
      alert("No file chosen");
    }
    function getFileUrl(filename) {
        //create a storage reference
        var storage = firebase.storage().ref("ourTeams").child(filename);
      
        //get file url
        storage
          .getDownloadURL()
          .then(function(url) {
            console.log(url);
             db.collection('miscellaneous').doc("ourTeam").collection("teamData").add({
                url: url,
                name: Tname,
                details: teamDetail,
                designation:desig

              }).then(function(){
                   nowuiDashboard.showNotification(
                      "top",
                      "center",
                        "Member Data Added Successfully",
                      "primary"
                    );
              })
          })
          .catch(function(error) {
            console.log("error encountered");
          });
      }
  });
  