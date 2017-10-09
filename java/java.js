var database;

function alerts(){
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

  var ref = database.ref('nammess');
 ref.on('value', gotData, errData);
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

function gotData(data) {

  var messages = selectAll('.messText');
  for (var i = 0; i < messages.length; i++) {
    messages[i].remove();
  }

  //console.log(data.val());
  var namess = data.val();
  var keys = Object.keys(namess);
  //console.log(keys);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var na = nemess[k].na;
    var me = nemess[k].me;
    //console.log(initials, score);
    var li = createElement('li', na + ': ' + me);
    li.class('messText');
    li.parent('messArea');
  }
}

function errData(err) {
  console.log('Error!');
  console.log(err);
}



function sendMessage(){
  var messageBox = document.getElementById("messageBox");
  var nameBox = document.getElementById("namebox");
  var messageArea = document.getElementById("section");
  var errName = document.getElementById("errNa");
  var errMessage = document.getElementById("errMe");

  if (messageBox.value=="" && nameBox.value=="")
  {
    messageBox.focus();
    nameBox.focus();
    nameBox.innerHTML="";
    messageBox.innerHTML="";
    errMessage.innerHTML="Try again";
    errName.innerHTML=("Try again");
    return false;
  }
  if (messageBox.value=="")
  {
    messageBox.focus();
    messageBox.innerHTML="";
    errMessage.innerHTML="Try again";
    return false;
  }

  message = messageBox.value.toString();
  errMessage.innerHTML="";

  // messageArea.innerHTML += "<br>" + name + " said " + message;

  var data = {
    name: name,
    message: message}


  var ref = database.ref('namemess');
var result = ref.push(data);
messageBox.value="";

}
