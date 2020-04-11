import {} from "./styles.css";
import {} from "./botonera.css";

const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};




document.getElementById("btnMicro").onclick = (e) => {
  if (e.currentTarget.hasAttribute("prendido")) {
    connection.streamEvents[localStreamId].stream.mute("audio");
    e.currentTarget.removeAttribute("prendido");
  } else {
    connection.streamEvents[localStreamId].stream.unmute("audio");
    document.querySelector("#video-local").firstChild.muted = true
    document.querySelector("#video-local").firstChild.volume = 0;
    e.currentTarget.setAttribute("prendido", "");
  }
};

document.getElementById("btnVideo").onclick = (e) => {
  if (e.currentTarget.hasAttribute("prendido")) {
    connection.streamEvents[localStreamId].stream.mute("video");
    e.currentTarget.removeAttribute("prendido");
  } else {
    connection.streamEvents[localStreamId].stream.unmute("video");

    e.currentTarget.setAttribute("prendido", "");
  }
};

document.getElementById("btnPantalla").onclick = (e) => {
  connection.addStream({
    screen: true,
  });
};

document.querySelector(".trigger").addEventListener("click", (e) => {
  if (document.querySelector(".menu").hasAttribute("hablando")) {
    document.querySelector(".menu").classList.toggle("active");
  } else {
    document.querySelector("#conectando").removeAttribute("conectado");
    conectar();
  }
});

document.getElementById("btnCerrar").onclick = (e) => {
  if (document.querySelector(".menu").hasAttribute("hablando")) {
    let mediaElementLocal = document.getElementById("video-local");
    if (mediaElementLocal) {
      mediaElementLocal.innerHTML = "";
    }
    let mediaElementRemoto = document.getElementById("video-remoto");
    if (mediaElementRemoto) {
      mediaElementRemoto.innerHTML = "";
    }
    connection.attachStreams.forEach(function (stream) {
      stream.stop();
    });
    document.querySelector(".menu").removeAttribute("hablando", "");
    document.querySelector(".menu").classList.toggle("active");
    document.querySelector("#formulario").removeAttribute("conectado", "");
    document.querySelector("#svgSala").innerHTML = ""
    connection.close();
    connection = null;
  }
};

let connection = null;
let localStreamId = null;

const conectar = (conPantalla) => {
  connection = new RTCMultiConnection();

  connection.onunmute = (e) => {
    if (e.muteType == "video") {
      e.session.audio = true
    }
  }
  connection.onmute = (e) => {
    if (e.muteType == "video") {
      e.session.audio = true
    }
  }

  connection.socketURL = "https://stormy-ridge-51639.herokuapp.com:443/";

  connection.iceServers = [{
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun.l.google.com:19302?transport=udp",
    ],
  }, ];


  connection.session = {
    audio: true,
    video: true,
  };
  connection.mediaConstraints = {
    audio: true,
    video: {
      mandatory: {
        // minWidth: 480,
        // maxWidth: 480,
        // minHeight: 270,
        // maxHeight: 270,
        // maxFrameRate: 10,
        // minAspectRatio: 1.77,
        echoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true

      },
      optional: [{
        facingMode: "user", // or "application"
      }, ],
    },
  };



  connection.onleave = function (event) {
    let mediaElements = document.querySelectorAll(".vc");
    mediaElements.forEach((elm) => {
      if (elm.__userId == event.userid) elm.parentNode.removeChild(elm);
    });
  };

  connection.onstreamended = function (event) {
    let mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
      mediaElement.parentNode.removeChild(mediaElement);
    }
  };

  connection.onstream = async function (event) {
    document.querySelector("#codecs").innerHTML = connection.codecs.audio + "-" + connection.codecs.video;
    document.querySelector("#conectando").setAttribute("conectado", "");
    document.querySelector("#formulario").setAttribute("conectado", "");
    document.querySelector(".menu").setAttribute("hablando", "");
    if (event.mediaElement.tagName == "VIDEO") {
      let titulo = document.createElement("div");
      titulo.classList.add("titulo");
      titulo.innerHTML = event.userid.split("-")[0];
      if (event.type == "local") {
        localStreamId = event.streamid;
        event.mediaElement.muted = true;
        event.mediaElement.volume = 0;
        event.mediaElement.controls = false;
        document.querySelector("#video-local").appendChild(event.mediaElement);
      }
      if (event.type == "remote") {
        event.mediaElement.muted = false;
        var mediaElement = document.getElementById(event.streamid);
        if (!mediaElement) {
          let vc = document.createElement("div");
          vc.id = event.streamid;
          vc.__userId = event.userid;
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

  const sala = document.querySelector("#sala").value.replace(/ /g, "") || getParameterByName("sala") || "miSala";
  const usuario = document.querySelector("#usuario").value.replace(/ /g, "") || getParameterByName("usuario") || "yo";
  document.querySelector("#svgSala").innerHTML = sala
  connection.userid = usuario + "-" + new Date().getTime();
  connection.openOrJoin(sala);
};

/* 
setTimeout(() => {
  conectar();
}, 1000); */