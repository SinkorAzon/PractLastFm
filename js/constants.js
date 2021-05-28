/**
 * @author Eric Quintana Muñoz <equintana@almata.cat>
 *
 * @param const  myAPI_key - Constant que emmagatzema la Api key
 * @param const  myshared_secret - Constant que emmagatzema la Secret Key
 * @param const  myapplication_name - Constant que emmagatzema el nom de la
 * aplicació.
 *
 */

var myapplication_name="PageEric";
var myAPI_key="6639a92311bbbc06dd40a075be240e27";
var myshared_secret="dff45169a9bd10061e6f7313a0595509";


/**
 * Call myLoginFunction - Funcio que connecta amb la pagina Last Fm, on si no hi
 * ha cap problema, despres de fer clic a Si ens redireccionara a la notra
 * pagina local.
 *
 * @param url - Conte la url que ens redireccione a les pagines web respectives.
 * 
 */
function myLoginFunction(){
  var url= 'http://www.last.fm/api/auth/?api_key=6639a92311bbbc06dd40a075be240e27&cb=https://sinkorazon.github.io/PractLastFm/mainpage.html';

  window.location.replace(url);
}
