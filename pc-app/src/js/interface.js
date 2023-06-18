window.onload = () => {
    var iframe = document.getElementById('emulated-website');
    var frameContainer = document.getElementById('frame-container');
    
    const resizeIframe = () => {
      iframe.style.height = frameContainer.offsetHeight + 'px';
    }
    
    window.onresize = () => {
      resizeIframe();
    };
    
    resizeIframe();
};
  