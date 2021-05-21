var myAPI_key="6639a92311bbbc06dd40a075be240e27";
var myshared_secret="dff45169a9bd10061e6f7313a0595509";

var url = window.location.href; // or window.location.href for current url
var captured = /token=([^&]+)/.exec(url)[1]; // Value is in [1] ('384' in our case)
var result = captured ? captured : 'myDefaultValue';
console.log(captured);

$.ajax({
    type : 'GET',
    url : 'http://ws.audioscrobbler.com/2.0/?',
    data : 'method=user.getinfo&' +
           'user=SinkorAzon&'+
           //'user=' + name + '&'+
           'api_key=6639a92311bbbc06dd40a075be240e27&' +
           'format=json',
    dataType : 'json',
    success : function(data) {
            $('#success #artistName').html(data.user.name);
           $('#success #artistImage').html('<img src="' + data.user.image[1]['#text'] + '" />');
       },
    error : function(code, message){
         $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
    }
});

function calculateApiSignatureStack() {
    // Set elsewhere but hacked into this example:
    var last_fm_data = {
        'last_token': captured,
        'user': 'SinkorAzon',
        'secret': 'dff45169a9bd10061e6f7313a0595509'
    };

    // Kick it off.
    lastFmCall('auth.getSession', {'token': last_fm_data['last_token']});


    // Low level API call, purely builds a POSTable object and calls it.
    function lastFmCall(method, data){
        //data seria {'token': last_fm_data['last_token']} que seria captured o sessionStoragemyToken
        // param data - dictionary.Populate Values on the Object s you'll see below the Key values can be any object and are not limited to Strings.
        last_fm_data[method] = false;
        // Somewhere to put the result after callback.

        // Append some static variables
        data.api_key = "6639a92311bbbc06dd40a075be240e27";
        //data['format'] = 'json';
        data['method'] = method;

        post_data = lastFmCalculateApisig(data);
        console.log("Post data: Last token " + post_data.token + "ApiKey: "+ post_data.api_key + "ApiSig: " + post_data.api_sig);
        sessionStorage.setItem("myApiSig", post_data.api_sig );

        var last_url="http://ws.audioscrobbler.com/2.0/?";
        $.ajax({
          type: "GET",
          url: last_url,
          data : 'method=auth.getSession' +
                 '&token=' + captured +
                 '&api_key=6639a92311bbbc06dd40a075be240e27' +
                 '&api_sig=' + post_data.api_sig +
                 '&format=json',
          //data: post_data,
          dataType: 'json',
          //"success" gets called when the returned code is a "200" (successfull request). "error" gets called whenever another code is returned (e.g. 404, 500).
          success: function(res){
              //No caldria aquesta instrucció perque ja guaredem els que ens convé en sessionStorage
              last_fm_data[method] = res;
              //var	myresposta = JSON.parse(res);
              console.log("Resposta: Name " + res.session.name);// Should return session key.
              console.log("Resposta: Key " + res.session.key);

              //store session key for further authenticate operations...
              sessionStorage.setItem("mySessionUser", res.session.name);
              sessionStorage.setItem("mySessionKey", res.session.key);
          },
          error : function(xhr, status, error){
                var errorMessage = xhr.status + ': ' + xhr.statusText
                console.log('Error - ' + errorMessage);
          }
         });
    }

    function lastFmCalculateApisig(params){
        //Crec que només necessitem apikey, token i secret i no necessitem params, els podem treure de sessionStorage
        //Calcula l'apiSig a partir dels valors d'abans...
        ss = "";
        st = [];
        so = {};
        so['api_key'] = params['api_key'];
        so['token'] = params['token'];
        Object.keys(params).forEach(function(key){
            st.push(key); // Get list of object keys
        });
        st.sort(); // Alphabetise it
        st.forEach(function(std){
            ss = ss + std + params[std]; // build string
        });
        ss += last_fm_data['secret'];
            // console.log(ss + last_fm_data['secret']);
            //Segons documentacio : https://www.last.fm/api/webauth
            //api signature = md5("api_keyxxxxxxxxmethodauth.getSessiontokenxxxxxxxmysecret")
            //OBJECTIU NOSTRE SERA ACONSEGUIR UNA LINEA COM AQUESTA
            // api_keyAPIKEY1323454formatjsonmethodauth.getSessiontokenTOKEN876234876SECRET348264386
        //hashed_sec = $.md5(unescape(encodeURIComponent(ss)));
        var hashed_sec = md5(unescape(encodeURIComponent(ss))); // "2063c1608d6e0baf80249c42e2be5804"
        console.log("La apiSig es: " + hashed_sec);
        so['api_sig'] = hashed_sec; // Correct when calculated elsewhere.
        return so; // Returns signed POSTable object
    }
}

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
      limitCou = document.getElementById("limitArt2").value;
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

function mostrarProgres(event) {
  if (event.lengthComputable) {
    var progres = 100 * event.loaded / event.total;
    console.log("Completat: " + progres + "%");
  } else {
    console.log("No es pot calcular el progrés");
  }
}
