// Logo loader: local file first, then KidSTART's hosted logo, then a text wordmark.
(function(){
  var REMOTE = "https://kidstart.sg/wp-content/uploads/2025/05/cropped-atreehousestudio-kidstart-footer-footer-logo.png";
  document.querySelectorAll("img.logo").forEach(function(img){
    var tried = false;
    img.addEventListener("error", function(){
      if(!tried){ tried = true; img.src = REMOTE; return; }
      img.style.display = "none";
      var wm = img.parentNode.querySelector(".wordmark");
      if(wm) wm.style.display = "inline";
    });
    if(img.complete && img.naturalWidth === 0 && img.src) img.dispatchEvent(new Event("error"));
  });
})();
