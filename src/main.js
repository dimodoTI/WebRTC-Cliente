import {} from "./styles.css";


const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

document.getElementById("btnPantalla").onclick = e => {
  connection.addStream({
    screen: true
  });
};

document.getElementById("btnCerrar").onclick = e => {
  if (e.currentTarget.hasAttribute("hablando")) {
    if (confirm("¿ Desea terminar la videollamada ?")) {
      
      let divAnfitrion = document.getElementById("anfitrion");
      divAnfitrion.hidden = true ;

      let mediaElement1 = document.getElementById("video-local");
      if (mediaElement1) {
        mediaElement1.innerHTML = ""
      }
      connection.attachStreams.forEach(function (stream) {
        stream.stop();
      });
      e.currentTarget.removeAttribute("hablando", "")
      connection.close()
      connection = null
    }
  } else {
    conectar()
    let divAnfitrion = document.getElementById("anfitrion");
    divAnfitrion.hidden = false ;                                                                                                                                                                                                                                                                                                                            
    e.currentTarget.setAttribute("hablando", "")
  }
};


let connection = null;

const conectar = conPantalla => {
  connection = new RTCMultiConnection();

  connection.socketURL = "https://stormy-ridge-51639.herokuapp.com:443/";

  connection.iceServers = [{
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun.l.google.com:19302?transport=udp"
    ]
  }];

  // if you want audio+video conferencing
  connection.session = {
    audio: true,
    video: true
  };

  connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  };

  connection.onleave = function (event) {
    let mediaElements = document.querySelectorAll(".vc");
    mediaElements.forEach(elm => {
      if (elm.__userId == event.userid) elm.parentNode.removeChild(elm);
    })
    let remotos = document.querySelectorAll(".vc");
    if (remotos.length == 0 ){
      let divAnfitrion = document.getElementById("anfitrion");
      divAnfitrion.hidden = false ;     
    }
    
  };

  connection.onstreamended = function (event) {
    let mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
      mediaElement.parentNode.removeChild(mediaElement);
    }
  };

  connection.onstream = async function (event) {

    if (event.mediaElement.tagName == "VIDEO") {
      let titulo = document.createElement("div");
      titulo.classList.add("titulo");
      titulo.innerHTML = event.userid.split("-")[0];
      if (event.type == "local") {
        event.mediaElement.muted = true
        event.mediaElement.controls = false
        document.querySelector("#video-local").appendChild(event.mediaElement);
      }
      if (event.type == "remote") {
        let divAnfitrion = document.getElementById("anfitrion");
        divAnfitrion.hidden = true ;
        event.mediaElement.muted = false
        var mediaElement = document.getElementById(event.streamid);
        if (!mediaElement) {
          let vc = document.createElement("div");
          vc.id = event.streamid;
          vc.__userId = event.userid
          vc.appendChild(titulo);
          vc.appendChild(event.mediaElement);
          vc.classList.add("vc");
          document.querySelector("#video-remoto").appendChild(vc);
        }
      } else {
        connection.removeStream(event.streamid);
      }
    }
  };

  const sala = getParameterByName("sala") || "miSalaLocal";
  const usuario = getParameterByName("usuario") || "yo";
  connection.userid = usuario + "-" + new Date().getTime();
  connection.openOrJoin(sala);
};

conectar();