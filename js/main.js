/**
 * @author Eric Quintana Muñoz <equintana@almata.cat>
 *
 * @param const  myAPI_key - Constant que emmagatzema la Api key
 * @param const  myshared_secret - Constant que emmagatzema la Secret Key
 * @param const  captured - Constant que crea i emmagatzema el Token.
 * @param const sessionKey -  Constant que contindra la Session Key del User.
 */

var myAPI_key="6639a92311bbbc06dd40a075be240e27";
var myshared_secret="dff45169a9bd10061e6f7313a0595509";

var url = window.location.href;
var captured = /token=([^&]+)/.exec(url)[1];
var result = captured ? captured : 'myDefaultValue';
var sessionKey;


/**
 * Call window.onload - Funcion que s'executa al inici on cridem a la metode
 * auth.getSession on obtindrem la clau de sessió per al usuari.
 *
 * @param dades - Tupla que conte l'informació que necessaria per funcionar
 * (methode, api_key, token, format). El param dades[api_sig] s'afegeix mes tard
 * a la tupla, ja que s'ha de calcular la api_sig.
 * @param sessionKey - Recollim la Session Key.
 *
 */
window.onload = function(){
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
             sessionKey = data.session.key;
             sessionStorage.setItem('sessionKey', sessionKey);
             call_userGetInfo(data.session.name);
             console.log(sessionKey);
         },
      error : function(code, message){
           $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
      }
  });
}

/**
 * Call_userGetInfo - Funcio que crida al metode user.getInfo on obtindrem
 * la informació del user que a iniciat Sessió a LastFm.
 *
 * @param usuari - Variable que rebra el nom de usuari i que despres
 * s'utilitzara com a parametre per el metode user.getInfo.
 * @param dadesGetInfo - Tupla que conte l'informació que necessaria per
 * funcionar (methode, api_key, user, format).
 *
 */
function call_userGetInfo(usuari){
  var dadesGetInfo = {
    method: "user.getInfo",
    api_key: myAPI_key,
    user: usuari,
    format: "json"
  };

  $.ajax({
      type : 'GET',
      url : 'http://ws.audioscrobbler.com/2.0/?',
      data : dadesGetInfo,
      dataType : 'json',
      success : function(data) {
             //trackLoveJquery();
             $('#success #artistName').html(data.user.name);
             $('#success #artistImage').html('<img src="' + data.user.image[1]['#text'] + '" />');
         },
      error : function(code, message){
           $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
      }
  });
}


/**
 * Call trackLoveJquery - Funcio que crida al metode track.love, aquesta funció
 * agrega el Track del artirsta com a favorita.
 *
 * @param dadestl - Tupla que conte l'informació que necessaria per funcionar
 * (methode, api_key, user, format). El param dades[api_sig] s'afegeix mes tard
 * a la tupla, ja que s'ha de calcular la api_sig.
 * @param last_url - Url que s'utilitzara per afegir a favorit el Track del
 * artista.
 *
 */
function trackLoveJquery() {
    if (sessionStorage.getItem("sessionKey") == null) {
      console.log("Error no estas authenticat");
    } else {
        var last_url="http://ws.audioscrobbler.com/2.0/";
        var dadestl = {
            method: 'track.love',
            track: Utf8.encode('Domain'), // Others Tracks For Test : Millions, Ares, Complicated
            artist: Utf8.encode('Ksi'),
            api_key: myAPI_key,
            sk: sessionStorage.getItem("sessionKey")
        };
        dadestl["api_sig"] =  calculate_apisig(dadestl);
        console.log("La apiSig de Track love es: " + dadestl['api_sig']);

        $.ajax({
            type: "POST",
            url: last_url,
            data: dadestl,
            dataType: "xml",
            success: function(res){
                processarRespostaLoveTrackJquery(res);
            },
            error : function(xhr, ajaxOptions, thrownError){
                console.log("Error en Love Track to track " + dadestl.track + " de l'artista " + dadestl.artist);
                document.getElementById("tagDemo").innerHTML = "<h2>Failure</h2>";
            }
         });

         /**
          * Call processarRespostaLoveTrackJquery - Funcio que processa l'informació
          * i ens retorna un document.
          *
          * @param  xml - Cerca dintre de lfm.status on es guardara dintre de
          * la variable txt el valor de ok.
          *
          */
         function processarRespostaLoveTrackJquery(xml) {
             txt = $(xml).find('lfm').attr('status');
             if( txt == "ok") {
               document.getElementById("tagDemo").innerHTML = "<h2>Added Track Love Correct</h2>";
             } else document.getElementById("tagDemo").innerHTML = "<h2>Failure Track Love</h2>";
         }
    }
}


/**
 * Call loadTopTracksXml - FUncio que recull l'informació d'un fitxer Xml
 * mitjançant el HttpRequest
 *
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

  /**
   * xhttp.onreadystatechange - Funcio que si no troba cap error durant
   * l'execució cridara a una funció que ens mostrara el xml obtingut via Html.
   *
   */
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


/**
 * Call getXmlQuery - Funcio que crea la taula Top Tracks Artist mitjançant el
 * fitxer Xml que li ha arribat.
 *
 * @param xml - Parametre que conte l'informació del Fitxer Xml.
 * @param table - Crea la taula Html introduint les dades que li arribe
 * del param xml.
 */
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


/**
 * Call loadChartTopArtistsJSONDoc - Funció que crida al metode geo.gettopartists,
 * on mitjançant una url obtindra les dades de la crida. Aquesta funció
 * retornarà les Tracks mes escoltades per al pais que s'hagi seleccionat.
 *
 * @param country - Parametre que contidra el pais seleccionat al form select
 * del Html.
 * @param urlquery - Url que conte el metode geo.gettopartists, el pais i la
 * Api_Key. Aquest param obtindra el fitxer json.
 *
 */
function loadChartTopArtistsJSONDoc() {
  if (window.XMLHttpRequest) {
		httpRequest = new XMLHttpRequest();
		console.log("Creat l'objecte a partir de XMLHttpRequest.");
	} else if (window.ActiveXObject) {
		httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		console.log("Creat l'objecte a partir de ActiveXObject.");
	} else {
		console.error("Error: Aquest navegador no suporta AJAX.");
	}

	httpRequest.onprogress = mostrarProgres;

  var country = null;
  country = document.getElementById("country").value;

  var urlquery ="http://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=" + country + "&api_key=6639a92311bbbc06dd40a075be240e27&format=json";
  httpRequest.onreadystatechange = processarCanviEstat;

  httpRequest.open('GET', urlquery, true);
	httpRequest.overrideMimeType('text/plain');
	httpRequest.send(null);

  /**
   * Call processarCanviEstat - Funcio que processa l'estat i crida a la Funció
   * processarResposta
   *
   */
  function processarCanviEstat() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      console.log("Exit transmissio.");
      processarResposta(httpRequest.responseText);
    }
  }

	/**
	 * Call processarResposta - Funció que crida al metode geo.gettopartists,
   * on mitjançant una url obtindra dades amb format Json. Aquesta funció
   * retornarà les Tracks mes escoltades per al pais que s'hagi seleccionat.
	 *
	 * @param dades - Parametre que conté les dades enviades mitjançant
   * httpRequest.
	 * @param myObj - Parametre que parseja el param dades a Json.
   * @param limit - Parametre que obte un valor numeric que limitara el
   * numero de Tracks a mostrar al a taula Html.
   * @param txt - Crea la taula Html introduint les dades que li arribe
   * del param myObj.
   *
	 */
	function processarResposta(dades) {
	  var	myObj = JSON.parse(dades);

    var limit = 0;
    if(document.getElementById("limitCou1").checked == true) {
      limit = document.getElementById("limitCou1").value;
    } else if(document.getElementById("limitCou2").checked == true) {
      limit = document.getElementById("limitCou2").value;
    } else if(document.getElementById("limitCou3").checked == true) {
      limit = document.getElementById("limitCou3").value;
    }

    var txt="";
    txt += "<table class=\"table table-dark\">";
    txt += "<tr><th>Nom</th><th>Listeners</th><th>URL</th></tr>";
    console.log("Cantidad de artistas:" + myObj.topartists.artist.length);
    for (var i=0; i < limit;i++) {
      txt += "<tr><td>" + myObj.topartists.artist[i].name +
      "</td><td>"+ myObj.topartists.artist[i].listeners +
      "</td><td>"+ myObj.topartists.artist[i].url +
      "</td></tr>";
    }

    txt += "</table>";
    document.getElementById("artist").innerHTML = txt;
  }
}

/**
 * Call loadTopAlbumJSON - Funció que crida al metode geo.gettopalbums,
 * on mitjançant una url obtindra les dades de la crida. Aquesta funció
 * retornarà les Tracks mes escoltades per al pais que s'hagi seleccionat.
 *
 * @param urlquery - Url que conte el metode geo.gettopalbums, artista, api_Key
 * i el format. Aquest param obtindra el fitxer json.
 *
 */
function loadTopAlbumJSON(){
  if (window.XMLHttpRequest) {
		httpRequest = new XMLHttpRequest();
		console.log("Creat l'objecte a partir de XMLHttpRequest.");
	} else if (window.ActiveXObject) {
		httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		console.log("Creat l'objecte a partir de ActiveXObject.");
	} else {
		console.error("Error: Aquest navegador no suporta AJAX.");
	}

	httpRequest.onprogress = mostrarProgres;

  var urlquery ="http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=Ksi&api_key=6639a92311bbbc06dd40a075be240e27&format=json";
  httpRequest.onreadystatechange = processarCanviEstat;

  httpRequest.open('GET', urlquery, true);
	httpRequest.overrideMimeType('text/plain');
	httpRequest.send(null);

  /**
   * Call processarCanviEstat - Funcio que processa l'estat i crida a la Funció
   * processarResposta
   *
   */
  function processarCanviEstat() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      console.log("Exit transmissio.");
      processarResposta(httpRequest.responseText);
    }
  }

  /**
	 * Call processarResposta - Funció que crida al metode geo.gettopalbums,
   * on mitjançant una url obtindra dades amb format Json. Aquesta funció
   * retornarà els almbums mes famosos del artista.
	 *
	 * @param dades - Parametre que conté les dades enviades mitjançant
   * httpRequest.
	 * @param myObj - Parametre que parseja el param dades a Json.
   * @param limit - Parametre que obte un valor numeric que limitara el
   * numero de Tracks a mostrar al a taula Html.
   * @param txt - Crea la taula Html introduint les dades que li arribe
   * del param myObj.
   *
	 */
	function processarResposta(dades) {
	  var	myObj = JSON.parse(dades);

    var limit = 0;
    if(document.getElementById("limitAlb1").checked == true) {
      limit = document.getElementById("limitAlb1").value;
    } else if(document.getElementById("limitAlb2").checked == true) {
      limit = document.getElementById("limitAlb2").value;
    } else if(document.getElementById("limitAlb3").checked == true) {
      limit = document.getElementById("limitAlb3").value;
    }

    var txt="";
    txt += "<table class=\"table table-dark\">";
    txt += "<tr><th>Rank</th><th>Artist</th><th>Nom</th><th>PlayCount</th><th>URL</th></tr>";
    console.log("Cantidad de artistas:" + myObj.topalbums.album.length);
    for (var i=0; i < limit;i++) {
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


/**
 * Call mostrarProgres - Funcio que mostra el proces d'execució.
 *
 */
function mostrarProgres(event) {
  if (event.lengthComputable) {
    var progres = 100 * event.loaded / event.total;
    console.log("Completat: " + progres + "%");
  } else {
    console.log("No es pot calcular el progrés");
  }
}


/**
 * Call calculate_apisig - Funcio que creara la api_Key mitjançant els params
 * que li arribin.
 *
 * @param  params - Parametre que conté una tupla amb la api_key, el metode, el
 * format i el token. Aquest parametre s'ordenara de forma alfabetica i
 * s'encriptara i es desara dintre del parametre myapisig.
 *
 * @return myapisig - Parametre encriptat que conte la api_sig.
 */
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


/**
 * Call addTrackTagJquery - Funcio que crida al metode track.addTags, on
 * aquesta funcio creara un tag al Track del artista introduit.
 *
 * @param dades - Tupla que conte l'informació necessaria per per crear la api_sig
 * (methode, artist, track, tags, api_key, sk, format). El param dades[api_sig]
 * s'afegeix mes tard a la tupla, ja que s'ha de calcular la api_sig.
 * @param last_url - Url que s'utilitzara per afegir el tag a la canço del
 * artista.
 * 
 */
function addTrackTagJquery() {
  if (sessionKey == null) {
    console.log("Error no estas authenticat");
  } else {
    var dades = {
      method: "track.addTags",
      artist : "Ksi",
      track : "Beerus",
      tags : "Intense",
      api_key : myAPI_key,
      sk : sessionKey,
      format: "json"
    };

    var last_url="http://ws.audioscrobbler.com/2.0/";
    dades['api_sig'] = calculate_apisig(dades);

    $.ajax({
      type: "POST",
      url: last_url,
      data: dades,
      dataType: "json",
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
