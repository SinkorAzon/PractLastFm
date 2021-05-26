var myAPI_key="6639a92311bbbc06dd40a075be240e27";
var myshared_secret="dff45169a9bd10061e6f7313a0595509";

var url = window.location.href; // or window.location.href for current url
var captured = /token=([^&]+)/.exec(url)[1]; // Value is in [1] ('384' in our case)
var result = captured ? captured : 'myDefaultValue';
var sessionKey;
console.log(captured);

window.onload = function(){
  //if(localStorage.getItem("sessionKey") ==  null){
    //var captured = /token=([^&]+)/.exec(url)[1]; // Value is in [1] ('384' in our case)
    var dades = {
      method: "auth.getSession",
      api_key : myAPI_key,
      token: captured,
      format: "json"
    };
    dades["api_sig"] =  calculate_apisig(dades);

    $.ajax({
        type : 'GET',
        url : 'http://ws.audioscrobbler.com/2.0/?',
        data : dades,
        dataType : 'json',
        success : function(data) {
               call_userGetInfo(data.session.name);
               sessionKey = data.session.key;
               localStorage.setItem('sessionKey', sessionKey);
               console.log(sessionKey);
           },
        error : function(code, message){
             $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
        }
    });
  //}
}

function call_userGetInfo(usuari){
  var dadesGetInfo = {
    method: "user.getInfo",
    api_key : myAPI_key,
    user: usuari,
    format: "json"
  };

  $.ajax({
      type : 'GET',
      url : 'http://ws.audioscrobbler.com/2.0/?',
      data : dadesGetInfo,
      dataType : 'json',
      success : function(data) {
             $('#success #artistName').html(data.user.name);
             $('#success #artistImage').html('<img src="' + data.user.image[1]['#text'] + '" />');
         },
      error : function(code, message){
           $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
      }
  });
}

/*

*/
function loadTopTracksXml() {
  var xhttp;
  if (window.XMLHttpRequest) {
    // code for modern browsers
    xhttp = new XMLHttpRequest();
  } else {
    // code for old IE browsers
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhttp.onreadystatechange = function() {
    if (this.readyState == 0){
      console.log("0: request not initialized");
    } else if (this.readyState == 1){
      console.log("1: server connection established");
    } else if (this.readyState == 2){
      console.log("2: request received");
    } else if (this.readyState == 3){
      console.log("3: processing request");
    } else if (this.readyState == 4 && this.status == 200) {
      console.log("4: request finished and response is ready");
      getXmlQuery(this);
    }
  };
  xhttp.open("GET", "exQuery.xml", true);
  xhttp.send();
}

function getXmlQuery(xml) {
  var i;
  var xmlDoc = xml.responseXML;

  var table="<tr><th>Rank</th><th>Artist</th><th>Title</th><th>Playcount</th><th>Listeners</th></tr>";
  var x = xmlDoc.getElementsByTagName("track");
  var limitArt = 0;
  if(document.getElementById("limitArt1").checked == true) {
    limitArt = document.getElementById("limitArt1").value;
  } else if(document.getElementById("limitArt2").checked == true) {
    limitArt = document.getElementById("limitArt2").value;
  } else if(document.getElementById("limitArt3").checked == true) {
    limitArt = document.getElementById("limitArt3").value;
  }

  for (i = 0; i < limitArt; i++) {
    table += "<tr><td>" + (i+1) + "</td><td>" +
    x[i].getElementsByTagName("artist")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue +
    "</td><td>" +
    x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue +
    "</td><td>" +
    x[i].getElementsByTagName("playcount")[0].childNodes[0].nodeValue +
    "</td><td>" +
    x[i].getElementsByTagName("listeners")[0].childNodes[0].nodeValue +
    "</td></tr>";
  }
  document.getElementById("tabTopTracksXml").innerHTML = table;
}

function loadChartTopArtistsJSONDoc(){
  if (window.XMLHttpRequest) {
		// Mozilla, Safari, IE7+
		httpRequest = new XMLHttpRequest();
		console.log("Creat l'objecte a partir de XMLHttpRequest.");
	} else if (window.ActiveXObject) {
		// IE 6 i anteriors
		httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		console.log("Creat l'objecte a partir de ActiveXObject.");
	} else {
		console.error("Error: Aquest navegador no suporta AJAX.");
	}

	//httpRequest.onload = processarResposta;
	httpRequest.onprogress = mostrarProgres;

  var country = null;
  country = document.getElementById("country").value;

  var urlquery ="http://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=" + country + "&api_key=6639a92311bbbc06dd40a075be240e27&format=json";
  httpRequest.onreadystatechange = processarCanviEstat;

  httpRequest.open('GET', urlquery, true);
	httpRequest.overrideMimeType('text/plain');
	httpRequest.send(null);

  function processarCanviEstat() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      console.log("Exit transmissio.");
      processarResposta(httpRequest.responseText);
    }
  }

	function processarResposta(dades) {
	  var	myObj = JSON.parse(dades);
    var llista = document.createElement('ul');

    var limitCou = 0;
    if(document.getElementById("limitCou1").checked == true) {
      limitCou = document.getElementById("limitCou1").value;
    } else if(document.getElementById("limitCou2").checked == true) {
      limitCou = document.getElementById("limitCou2").value;
    } else if(document.getElementById("limitCou3").checked == true) {
      limitCou = document.getElementById("limitCou3").value;
    }

    var txt="";
    txt += "<table class=\"table table-dark\">";
    txt += "<tr><th>Nom</th><th>Listeners</th><th>URL</th></tr>";
    console.log("Cantidad de artistas:" + myObj.topartists.artist.length);
    for (var i=0; i < limitCou;i++) {
      txt += "<tr><td>" + myObj.topartists.artist[i].name +
      "</td><td>"+ myObj.topartists.artist[i].listeners +
      "</td><td>"+ myObj.topartists.artist[i].url +
      "</td></tr>";
    }

    txt += "</table>";
    document.getElementById("artist").innerHTML = txt;
  }
}

function loadTopAlbumJSON(){
  if (window.XMLHttpRequest) {
		// Mozilla, Safari, IE7+
		httpRequest = new XMLHttpRequest();
		console.log("Creat l'objecte a partir de XMLHttpRequest.");
	} else if (window.ActiveXObject) {
		// IE 6 i anteriors
		httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		console.log("Creat l'objecte a partir de ActiveXObject.");
	} else {
		console.error("Error: Aquest navegador no suporta AJAX.");
	}

	//httpRequest.onload = processarResposta;
	httpRequest.onprogress = mostrarProgres;

  var urlquery ="http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=Ksi&api_key=6639a92311bbbc06dd40a075be240e27&format=json";
  httpRequest.onreadystatechange = processarCanviEstat;

  httpRequest.open('GET', urlquery, true);
	httpRequest.overrideMimeType('text/plain');
	httpRequest.send(null);

  function processarCanviEstat() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      console.log("Exit transmissio.");
      processarResposta(httpRequest.responseText);
    }
  }

	function processarResposta(dades) {
	  var	myObj = JSON.parse(dades);
    var llista = document.createElement('ul');

    var limitCou = 0;
    if(document.getElementById("limitAlb1").checked == true) {
      limitCou = document.getElementById("limitAlb1").value;
    } else if(document.getElementById("limitAlb2").checked == true) {
      limitCou = document.getElementById("limitAlb2").value;
    } else if(document.getElementById("limitAlb3").checked == true) {
      limitCou = document.getElementById("limitAlb3").value;
    }

    var txt="";
    txt += "<table class=\"table table-dark\">";
    txt += "<tr><th>Rank</th><th>Artist</th><th>Nom</th><th>PlayCount</th><th>URL</th></tr>";
    console.log("Cantidad de artistas:" + myObj.topalbums.album.length);
    for (var i=0; i < limitCou;i++) {
      txt += "<tr><td>" + (i+1) +
      "</td><td>" + myObj.topalbums.album[i].artist.name +
      "</td><td>" + myObj.topalbums.album[i].name +
      "</td><td>"+ myObj.topalbums.album[i].playcount +
      "</td><td>"+ myObj.topalbums.album[i].url +
      "</td></tr>";
    }

    txt += "</table>";
    document.getElementById("tabTopAlbumsJson").innerHTML = txt;
  }
}

function mostrarProgres(event) {
  if (event.lengthComputable) {
    var progres = 100 * event.loaded / event.total;
    console.log("Completat: " + progres + "%");
  } else {
    console.log("No es pot calcular el progrés");
  }
}

function calculate_apisig(params){
  let stringActual = "";
  let arrayKeysAuxiliar = [];

  Object.keys(params).forEach(function(key){
    if ( key !== 'format' && key !== 'callback') {
      arrayKeysAuxiliar.push(key);
    }
  });

  arrayKeysAuxiliar.sort();
  arrayKeysAuxiliar.forEach(function(Key){
    stringActual = stringActual + Key + params[Key];
  });

  stringActual = stringActual + myshared_secret;
  stringActual = unescape(encodeURIComponent(stringActual));
  var myapisig = md5(unescape(encodeURIComponent(stringActual)))

  return myapisig;
}

function addTrackTagJquery() {
  console.log(sessionKey);
  if (sessionKey == null) {
    console.log("Error no estas authenticat");
  } else {
    //O be aixi i despres utilitzem una funcio per convertir-lo en string ( convertirenParametresDades del ioc)
    var dades = {
      method: "track.addTags",
      artist : "Ksi",
      track : "Beerus",
      //A comma delimited list of user supplied tags to apply to this track. Accepts a maximum of 10 tags.
      //  tags : [tag1,tag2], but i think "tag1,tag2, tag3..." SHOULD WORK (  maximum of 10 tags)
      //Tags as other parameters should be utf8-encoded two or more parameters seems doesnt work
      tags : "Intense",
      api_key : myAPI_key,
      sk : sessionKey,
      format: "json"
    };

    var last_url="http://ws.audioscrobbler.com/2.0/";
    //Hauria de poder esborrar token perque no ho necessita en teoria pero si no no funciona
    //delete dades["token"];
    dades['api_sig'] = calculate_apisig(dades);

    $.ajax({
      type: "POST", //both are same, in new version of jQuery type renamed to method
      url: last_url,
      data: dades,
      dataType: "json", //datatype especifica el tipus de dada que s'espera rebre del servidor
      success: function(res){
          document.getElementById("tagDemo").innerHTML = "<h2>Added Tag Correct</h2>";
      },
      error : function(){
          console.log("Error en addTag to track " + dades.track + " de l'artista " + dades.artist);
          document.getElementById("tagDemo").innerHTML = "<h2>Failure</h2>";
      }
    });
  }
}
