const dragObjectLogic = {

  
  start : function (event, helper){
    // console.log(event, helper)
    event.target.style.zIndex = '500'
    event.target.style.animation = 'pickup 0.5s'
    event.target.style.boxShadow = '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22'
    event.target.style.transform = 'scale(1.15)'
    event.target.style.transition = 'none'
    
  },

  // drag: function (event, helper) {
      
  // },

  
  stop : function (event, helper) {
    event.target.style.boxShadow = 'none'
    event.target.style.transform = 'scale(1)'

    
    if (2 * event.pageY > $(window).height()) {
      event.target.classList.remove('item')
      event.target.classList.add('timeline-item')
      event.target.style.animation = 'fadein 0.5s'
      event.target.style.transition = '1s'
      
      childrenNodesTimeline = $('.timeline').children()
      if (!childrenNodesTimeline.length) {
        $('.timeline').prepend(event.target)
      } else {
        let refNode = null;
        for (child of childrenNodesTimeline) {
          
          if (child.offsetLeft > helper.offset.left) {
            refNode = child
            break;
          }
        }
        if (refNode) {
          $(event.target).insertBefore(child)
          // $('.timeline').insertAfter(event.target, child)
        } else {
          $('.timeline').append(event.target)
        }
        event.target.style.transition = 'none'

      }
    } else {
      event.target.style.transition = '0.5s'
    }

    event.target.style.left = '0';
    event.target.style.top = '0';
  }

};

$(function() {
 
  canvas = document.querySelector("#timeline-canvas")
  var ctx = canvas.getContext("2d");
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight / 2;
  pastX1 = 0
  isMouseAboveTimeline = false

  console.log("init...")
  $('.item').draggable(dragObjectLogic)
  
  $('.bottom-view').mousemove((event) => {
    ctx.clearRect(pastX1 - 2, 0, pastX1 + 2, 500);
    ctx.beginPath();
    ctx.moveTo(event.clientX, 0);
    ctx.lineTo(event.clientX, 500);
    ctx.lineWidth = 2;
    pastX1 = event.clientX 
    ctx.stroke();
  })
  var videos = [
    {
      id: 1324351,
      length: 1332,
      title: 'sample.mp4'
    },
    {
      id: 2135324,
      length: 1332,
      title: 'sample.mp4'
    },
    {
      id: 8765465,
      length: 1332,
      title: 'sample.mp4'
    },
    {
      id: 34565437,
      length: 1332,
      title: 'sample.mp4'
    }
  ]

  for (video of videos) {
    elem = document.createElement('div')
    elem.classList.add('item')
    elem.classList.add(video.id)
    elem.append(video.title)
    $('.resources-list').append(elem)
    $(`.${video.id}`).draggable(dragObjectLogic)
  }
});

