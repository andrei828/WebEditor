
$(function() {
  canvas = document.querySelector("#timeline-canvas")
  var ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight / 2 - 40
  

  pastX1 = 0
  isMouseAboveTimeline = false

  console.log("init...")
  // $('.item').draggable(dragObjectLogic)
  
  $('.bottom-view').mousemove((event) => {
    ctx.clearRect(pastX1 - 2, 0, pastX1 + 2, ctx.canvas.height);
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
      ctx.fillText(`${window.currentVideoTime.toFixed(2)} seconds`, event.clientX + 20, 20)
    }
  })

  playerCanvas = document.querySelector('.preview-player')
  playerContext = playerCanvas.getContext('2d')
  $('.preview-player-wrapper').mouseover((event) => {
    console.log("Hello")
    playerContext.moveTo(0, 0);
    playerContext.lineTo(100, 100);
    playerContext.lineWidth = 1;
    playerContext.strokeStyle = '#808000';
    playerContext.stroke();
  })

  $('.preview-player-wrapper').mouseleave((event) => {
    console.log("Hello")
    playerContext.moveTo(0, 0);
    playerContext.lineTo(100, 100);
    playerContext.lineWidth = 1;
    playerContext.strokeStyle = '#808000';
    playerContext.stroke();
  })

});

