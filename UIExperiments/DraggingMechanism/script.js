
$(function() {

  canvas = document.querySelector("#timeline-canvas")
  var ctx = canvas.getContext("2d");
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight / 2;
  pastX1 = 0
  isMouseAboveTimeline = false

  console.log("init...")
  // $('.item').draggable(dragObjectLogic)
  
  $('.bottom-view').mousemove((event) => {
    ctx.clearRect(pastX1 - 2, 0, pastX1 + 2, 500);
    ctx.beginPath();
    ctx.moveTo(event.clientX, 0);
    ctx.lineTo(event.clientX, 500);
    ctx.lineWidth = 2;
    pastX1 = event.clientX 
    ctx.stroke();
  })
 
});

