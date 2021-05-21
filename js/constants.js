var myapplication_name="PageEric";
var myAPI_key="6639a92311bbbc06dd40a075be240e27";
var myshared_secret="dff45169a9bd10061e6f7313a0595509";

function myLoginFunction(){
  /*
  params api_key ( my api key)
  cb the web that goes when user is authenticated relative path ( depends on the server is launched): http://localhost:3000/mainpage.ht*/
  var url= 'http://www.last.fm/api/auth/?api_key=6639a92311bbbc06dd40a075be240e27&cb=http://localhost:3000/mainpage.html';

  window.location.replace(url);
}
