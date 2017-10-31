function preload(){
  var body = document.getElementById("body");
  body.style.background = "lightyellow";

}

function calculate(){
var example = document.getElementById("demo");
var i;
for (i = 1; i < 101; i++) {
    example.innerHTML += i + "<br>";
    console.log(i);
}
}
