
$(function() {
  
  buttonSwitchLogic()
  
	$(document).bind('click', function() {
		$("#contextmenu").hide();
	})

  $(window).resize(function() {
    buttonSwitchLogic()
  });
  
  tooltipDuration = document.querySelector('.tooltip-duration')
  
  var canvas = document.querySelector("#timeline-canvas")
  var ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight / 2 - 40
  

  pastX1 = 0
  isMouseAboveTimeline = false

  console.log("init...")
  // $('.item').draggable(dragObjectLogic)
  
  $('.bottom-view').mousemove((event) => {
    timelineRendering(event)
  })
  $('.bottom-view').mouseleave((event) => {
    ctx.clearRect(pastX1 - 1, 0, pastX1 + 1, canvas.height);
  })
  $('.bottom-view').click((event) => {
    window.rightClickCtx = undefined 
    timelineRendering(event)
  })

  function timelineRendering(event) {
    // TODO: remove this quick fix and make the two bars independent from one another
    ctx.clearRect(pastX1 - 1, 0, pastX1 + 1, canvas.height);
  
    if (!window.rightClickCtx) {
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(event.clientX, 0);
      ctx.lineTo(event.clientX, ctx.canvas.height);
      ctx.lineWidth = 1;
      pastX1 = event.clientX 
      ctx.stroke();
    }
    /**
     * Label for current video time
     */
    if (window.currentVideoTime && !window.rightClickCtx) {
      // ctx.fillText(`${window.currentVideoTime.toFixed(2)} seconds`, event.clientX + 20, 20)
      tooltipDuration.style.display = 'block'
      if (pastX1 + 200 > window.innerWidth) {
        tooltipDuration.style.left = `${pastX1 - 150}px`
      } else {
        tooltipDuration.style.left = `${pastX1 - 2}px`
      }
      
      tooltipDuration.innerText = `${window.currentVideoTime.toFixed(2)} seconds`
    } else  {
      tooltipDuration.style.display = 'none'
    }
  }

  // playerControls = document.querySelector('.preview-player-controls-wrapper')
  // playerCanvas = document.querySelector('.preview-player')
  // playerContext = playerCanvas.getContext('2d')
  // $('.preview-player-wrapper').mouseover((event) => {
  //   playerControls.style.display = 'block';
  // })

  // $('.preview-player-wrapper').mouseleave((event) => {
  //   playerControls.style.display = 'none';
  // })

})




function buttonSwitchLogic() {
  function handleClass(node, className, action = "add") {
    node.classList[action](className);
  }
  
  function handleTogglingLayer(togglingLayer) {
    const cords = this.getBoundingClientRect();
    const { width, height } = cords;
    const offsetFromLeft = this.offsetLeft;
  
    togglingLayer.style.width = width + "px";
    togglingLayer.style.height = height + "px";
    togglingLayer.style.left = offsetFromLeft + "px";
  }
  
  const toggleButtons = document.querySelectorAll(".btn-toggle-js");
  
  toggleButtons.forEach((toggleBtn) => {
    const toggleTriggeringElements = toggleBtn.querySelectorAll("span");
    const togglingLayer = toggleBtn.querySelector(".toggling-layer");
  
    const initiallyActiveElm =
      toggleBtn.querySelector(".toggle-active") || toggleTriggeringElements[0];
  
    toggleTriggeringElements.forEach((toggleTriggeringElement) => {
      toggleTriggeringElement.addEventListener("click", function () {
        handleAction(this);
      });
    });
  
    function handleAction(el) {
      
      toggleTriggeringElements.forEach((toggleTriggeringElement) =>
        handleClass(toggleTriggeringElement, "toggle-active", "remove")
      );
  
      handleClass(el, "toggle-active");
      handleTogglingLayer.call(el, togglingLayer);
  
      // your different required action for the elements here
      
      if (el.dataset.actionType === "fit") {
        // action when clicking on more
        window.currentRatio = 'fit'
        if (window.currentVideoSelectedForPlayback) {
          window.currentVideoSelectedForPlayback.data.metadata.ratio = 'fit'
          window.rerenderFrame(window.currentVideoSelectedForPlayback)
        }
      } else {
        // action when clicking on less
        window.currentRatio = 'strech'
        if (window.currentVideoSelectedForPlayback) {
          window.currentVideoSelectedForPlayback.data.metadata.ratio = 'strech'
          window.rerenderFrame(window.currentVideoSelectedForPlayback)
        }
      }
      
    
    }
  
    //    when initially loading
    setTimeout(() => handleAction(initiallyActiveElm), 50)
    
  });
}