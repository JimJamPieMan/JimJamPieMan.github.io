var database;


function setup(){
  alert("This messaging service is in no way encrypted. Do not say anything incriminating or harmful to other people. By clicking close you agree to the previous statement.");
  var config = {
    apiKey: "AIzaSyCWZugJWhKfWxA-mudw4-lQq9Lf2ruBqPo",
    authDomain: "achat-7607e.firebaseapp.com",
    databaseURL: "https://achat-7607e.firebaseio.com",
    projectId: "achat-7607e",
    storageBucket: "achat-7607e.appspot.com",
    messagingSenderId: "454081060002"
  };
  firebase.initializeApp(config);
  database = firebase.database();
  loadDatabase();
}



  function loadDatabase(){
    var ref = database.ref("namemess");
    ref.once("value", gotData, errData);



}

function sendToFirebase(){
  var data = {
    name: name,
    message: message}


    var ref = database.ref('namemess');
    var result = ref.push(data);
    console.log(result.key);
  }

function errData(err) {
  console.log('Error!');
  console.log(err);
}
function gotData(data) {
var messageArea = document.getElementById("section");

  //
  // console.log(data.val());

  var namemessage = data.val();
  var keys = Object.keys(namemessage);


   console.log(keys);
   for (var i = 0; i < keys.length; i++) {
     var k = keys[i];
     var name = namemessage[k].name;
     var message = namemessage[k].message;
     //console.log(initials, score);
    messageArea.innerHTML += "<br>" + name + " said " + message;
   }

 }




function enterName(){
  var nameBox = document.getElementById("namebox");
  var errName = document.getElementById("errNa");
  var nameInput = document.getElementById("nameInput");
  if (nameBox.value=="")
  {
    nameBox.focus();
    nameBox.innerHTML="";
    errName.innerHTML=("Try again");
    return false;
  }
  name = nameBox.value.toString();
  errName.innerHTML=("");
  nameInput.innerHTML=name + " is your name.";
}

function sendMessage(){
  var messageBox = document.getElementById("messageBox");
  var nameBox = document.getElementById("namebox");
  var messageArea = document.getElementById("section");
  var errName = document.getElementById("errNa");
  var errMessage = document.getElementById("errMe");

  if (messageBox.value=="")
  {
    messageBox.focus();
    errMessage.innerHTML="Try again";
    return false;
  }
  if (messageBox.value=="")
  {
    messageBox.focus();
    errMessage.innerHTML="Try again";
    return false;
  }

  message = messageBox.value.toString();
  messageArea.innerHTML += "<br>" + name + " said " + message;

sendToFirebase();

errMessage.innerHTML="";
messageBox.value="";


}
