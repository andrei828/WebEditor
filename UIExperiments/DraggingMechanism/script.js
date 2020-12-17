const dragObjectLogic = {

  
  start : function (event, helper){
    // console.log(event, helper)
    event.target.style.transition = 'none';
  },

  // drag: function (event, helper) {
      
  // },

  
  stop : function (event, helper) {
    
    
    if (2 * event.pageY > $(window).height()) {
      event.target.classList.remove('item')
      event.target.classList.add('timeline-item')
      event.target.style.animation = 'fadein 0.5s';
      event.target.style.transition = '1s';
      $('.timeline').prepend(event.target)
      
    } else {
      
    }

    event.target.style.left = '0';
      event.target.style.top = '0';
  }

};

$(function() {
 
  isMouseAboveTimeline = false

  console.log("init...")
  $('.item').draggable(dragObjectLogic)
  
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

