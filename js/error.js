
/**
 * @author Eric Quintana Muñoz <equintana@almata.cat>
 *
 */
 
/**
 * Call errorStage - Funcio que mitjançant el codi d'error que arribi mostrara
 * el missatge d'eeror respectiu.
 *
 * @param errorCode - Parametre que conte el numero de error.
 *
 * @return {string} missError - Missatge de error.
 *
 */
function errorStage(errorCode){
  switch (errorCode) {
    case 0:
      missError = "0: request not initialized"
      break;
    case 1:
      missError = "1: server connection established"
      break;
    case 2:
      missError = "2: request received"
      break;
    case 3:
      missError = "3: processing request"
      break;
    case 4:
      missError = "4: request finished and response is ready"
      break;
    default:
      missError = "?: error undefined"
  }

  return missError;
}
