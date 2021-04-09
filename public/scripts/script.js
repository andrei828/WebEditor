
$(function() {
  
  $('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);
  });
  $('.dropdown').focusout(function () {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
  });
  $('.dropdown .dropdown-menu li').click(function () {
    $(this).parents('.dropdown').find('span').text($(this).text().split(' ')[0]);
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
  });
/*End Dropdown Menu*/
  


  $('.dropdown-menu li').click(function () {
    const resolution = $(this).parents('.dropdown').find('input').val().split(' ')[0]
    console.log(resolution)
    
    if (resolution === '1920x1080') {
      RATIO = 1.77
      window.FFMPEG_RESOLUTION_WIDTH = 1920
      window.FFMPEG_RESOLUTION_HEIGHT = 1080
    } else if (resolution === '1280x720') {
      RATIO = 1.77
      window.FFMPEG_RESOLUTION_WIDTH = 1280
      window.FFMPEG_RESOLUTION_HEIGHT = 720
    } else if (resolution === '854x480') {
      RATIO = 1.77
      window.FFMPEG_RESOLUTION_WIDTH = 854
      window.FFMPEG_RESOLUTION_HEIGHT = 480
    } else if (resolution === '640x360') {
      RATIO = 1.77
      window.FFMPEG_RESOLUTION_WIDTH = 640
      window.FFMPEG_RESOLUTION_HEIGHT = 360
    } else if (resolution === '1080x1920') {
      RATIO = 0.56
      window.FFMPEG_RESOLUTION_WIDTH = 1080
      window.FFMPEG_RESOLUTION_HEIGHT = 1920
    } else if (resolution === '720x1280') {
      RATIO = 0.56
      window.FFMPEG_RESOLUTION_WIDTH = 720
      window.FFMPEG_RESOLUTION_HEIGHT = 1280
    } else if (resolution === '480x854') {
      RATIO = 0.56
      window.FFMPEG_RESOLUTION_WIDTH = 480
      window.FFMPEG_RESOLUTION_HEIGHT = 854
    } else if (resolution === '360x640') {
      RATIO = 0.56
      window.FFMPEG_RESOLUTION_WIDTH = 360
      window.FFMPEG_RESOLUTION_HEIGHT = 640
    }

    const canvas = document.querySelector('.preview-player')
    const currentHeight = canvas.getBoundingClientRect().height
    const maxHeight = document
      .querySelector('.preview-player-wrapper')
      .getBoundingClientRect()
      .height

    if (maxHeight * 0.7)  
      canvas.style.width = canvas.getBoundingClientRect().height * window.RATIO
  }); 

  buttonSwitchLogic()
  
	$(document).bind('click', function() {
		$("#contextmenu").hide();
	})

  $(window).resize(function() {
    // buttonSwitchLogic()
    const toggleActive = document.querySelector('.toggle-active')
    const toggleSetting = document.querySelector('.toggling-layer')
    handleTogglingLayer.call(toggleActive, toggleSetting)
    
    const canvas =document.querySelector('.preview-player')
    canvas.style.width = canvas.getBoundingClientRect().height * RATIO
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
  
  
  
  const toggleButtons = document.querySelectorAll(".btn-toggle-js");
  
  toggleButtons.forEach((toggleBtn) => {
    const toggleTriggeringElements = toggleBtn.querySelectorAll("span");
    const togglingLayer = toggleBtn.querySelector('.toggling-layer');
  
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
      window.handleTogglingLayer.call(el, togglingLayer);
  
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
    // setTimeout(() => handleAction(initiallyActiveElm), 500)
    
  });
}