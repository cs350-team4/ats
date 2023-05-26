window.onload = function() {
    var iframe = document.getElementById('emulated-website');
    var frameContainer = document.getElementById('frame-container');
    
    function resizeIframe() {
      iframe.style.height = frameContainer.offsetHeight + 'px';
    }
    
    window.onresize = function() {
      resizeIframe();
    };
    
    resizeIframe();
};
  