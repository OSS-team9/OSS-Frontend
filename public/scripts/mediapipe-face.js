(function () {
  let loaded = {
    face: false,
    draw: false,
    cam: false,
  };

  function checkAllLoaded() {
    if (loaded.face && loaded.draw && loaded.cam) {
      console.log("✅ All Mediapipe scripts loaded!");
      window.__mp_ready__ = true;
    }
  }

  const s1 = document.createElement("script");
  s1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
  s1.onload = () => {
    console.log("FaceMesh loaded");
    loaded.face = true;
    checkAllLoaded();
  };
  document.head.appendChild(s1);

  const s2 = document.createElement("script");
  s2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
  s2.onload = () => {
    console.log("drawing_utils loaded");
    loaded.draw = true;
    checkAllLoaded();
  };
  document.head.appendChild(s2);

  const s3 = document.createElement("script");
  s3.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
  s3.onload = () => {
    console.log("camera_utils loaded");
    loaded.cam = true;
    checkAllLoaded();
  };
  document.head.appendChild(s3);
})();
