var fecha = new Date();
var dias = fecha.getMonth();
var desfase = new Date(fecha.getFullYear(), fecha.getMonth(), 1).getDay();
console.log("desfase: " + desfase);
console.log(dias);

switch (dias) {
  case 2:
    dias = 31;
}

var prueba = document.getElementById("coso");

for (var i = 0; i < dias + desfase; i++) {
  var casita = document.createElement("div");
  casita.setAttribute("class", "hola");
  if (i >= desfase) {
    casita.textContent = i - desfase + 1;
  }
  prueba.append(casita);
}
