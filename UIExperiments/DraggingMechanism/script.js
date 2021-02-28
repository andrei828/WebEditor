
$(function() {
  tooltipDuration = document.querySelector('.tooltip-duration')
  
  canvas = document.querySelector("#timeline-canvas")
  var ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight / 2 - 40
  

  pastX1 = 0
  isMouseAboveTimeline = false

  console.log("init...")
  // $('.item').draggable(dragObjectLogic)
  
  $('.bottom-view').mousemove((event) => {
    // TODO: remove this quick fix and make the two bars independent from one another
    ctx.clearRect(pastX1 - 1, 0, pastX1 + 1, canvas.height);
    if (window.currentPlaybackTime) {
      ctx.clearRect(
        window.currentPlaybackTime - 5, 0, 
        window.currentPlaybackTime + 2, ctx.canvas.height
      )
      ctx.beginPath()
      ctx.moveTo(window.currentPlaybackTime, 0)
      ctx.lineTo(window.currentPlaybackTime, ctx.canvas.height)
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    
    ctx.beginPath();
    ctx.moveTo(event.clientX, 0);
    ctx.lineTo(event.clientX, ctx.canvas.height);
    ctx.lineWidth = 1;
    pastX1 = event.clientX 
    ctx.stroke();
    
    /**
     * Label for current video time
     */
    ctx.font = "10px";
    if (window.currentVideoTime) {
      // ctx.fillText(`${window.currentVideoTime.toFixed(2)} seconds`, event.clientX + 20, 20)
      tooltipDuration.style.display = 'block'
      tooltipDuration.style.left = `${pastX1 - 2}px`
      tooltipDuration.innerText = `${window.currentVideoTime.toFixed(2)} seconds`
    } else {
      tooltipDuration.style.display = 'none'
    }
  })

  playerControls = document.querySelector('.preview-player-controls-wrapper')
  playerCanvas = document.querySelector('.preview-player')
  playerContext = playerCanvas.getContext('2d')
  $('.preview-player-wrapper').mouseover((event) => {
    playerControls.style.display = 'block';
    console.log("Hello")
    playerContext.moveTo(0, 0);
    playerContext.lineTo(100, 100);
    playerContext.lineWidth = 1;
    playerContext.strokeStyle = '#808000';
    playerContext.stroke();
  })

  $('.preview-player-wrapper').mouseleave((event) => {
    console.log("Hello")
    playerControls.style.display = 'none';
    playerContext.moveTo(0, 0);
    playerContext.lineTo(100, 100);
    playerContext.lineWidth = 1;
    playerContext.strokeStyle = '#808000';
    playerContext.stroke();
  })

});

