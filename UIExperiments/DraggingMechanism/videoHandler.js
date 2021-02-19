const SPACEBAR = ' '

/**
 * Linked list used to store 
 * the videos in the timeline 
 */
class TimelineNode {
  constructor(data) {
    this.data = data
    this.next = null                
  }
}



window.onload = () => {
  
  this.resources = {}
  this.resources[Math.random().toString(36).substr(2, 9)] = buildVideoResourceByPath('./GrahamScan.mov', 'Graham')
  this.resources[Math.random().toString(36).substr(2, 9)] = buildVideoResourceByPath('./PostItDemo.mp4', 'Post it')
  this.resources[Math.random().toString(36).substr(2, 9)] = buildVideoResourceByPath('./bunny.mp4', 'Bunny 1')
  this.resources[Math.random().toString(36).substr(2, 9)] = buildVideoResourceByPath('./bunny2.mp4', 'Bunny 2')
  
  document.body.onkeyup = spacebarPlayEvent

  timelineCanvas = document.querySelector("#timeline-canvas")
  timelineCanvasCtx = timelineCanvas.getContext('2d')

  // let iterator = null;
  // for (id in this.resources) {
  //   if (!this.timeline) {
  //     this.timeline = new TimelineNode(resources[id])
  //     iterator = this.timeline
  //   } else {
  //     iterator.next = new TimelineNode(resources[id])
  //     iterator = iterator.next
  //   }
  // }
  renderResourcesBlock()
}


/**
 * Method that handles the 
 * spacebar playback event
 * @param event context about the event
 */
function spacebarPlayEvent(event) {

  if (event.key == SPACEBAR) {
    
    canvas = document.querySelector('.preview-player')
    canvasWrapper = document.querySelector('.preview-player-wrapper')
    context = canvas.getContext('2d')
    console.log(window.timeline)
    if (window.timeline) {
      playVideo(window.timeline.data.videoCore, window.timeline.next)
    }
    
  }
}

// TODO: change the parameters to only use the current node
function playVideo(video, timelineNode) {
  loop = (videoStartCoordY) => {
    if (video.duration === video.currentTime && timelineNode) {
      playVideo(timelineNode.data.videoCore, timelineNode.next)
    } else {
      context.drawImage(video, 0, videoStartCoordY, canvas.width, videoStartCoordY + canvas.height)

      /**
       * rendering the current time bar
       */
      window.currentPlaybackTime = video.offsetLeft + (video.currentTime * video.clientWidth / video.duration)
      timelineCanvasCtx.clearRect(window.currentPlaybackTime - 2, 0, window.currentPlaybackTime + 2, timelineCanvas.height)
      timelineCanvasCtx.beginPath()
      timelineCanvasCtx.moveTo(window.currentPlaybackTime, 0)
      timelineCanvasCtx.lineTo(window.currentPlaybackTime, timelineCanvas.height)
      timelineCanvasCtx.lineWidth = 2;
      timelineCanvasCtx.stroke();


      setTimeout(()=> loop(videoStartCoordY), 1000 / 30) // drawing at 30fps
    }
  }
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  console.log(canvasWrapper.offsetHeight, canvas.offsetHeight)
  // TODO: find a formula to center the video based on w/h ratio
  videoStartCoordY = (canvasWrapper.offsetHeight / 2)// - (canvas.offsetHeight)
  
  loop(videoStartCoordY)
  video.play()
}

/**
 * Renders the items 
 * to the resources list
 */
function renderResourcesBlock() {
  
  for (id in resources) {
    elem = document.createElement('video')
    source = document.createElement('source')
    source.src = resources[id].metadata.path
    elem.classList.add('item')
    elem.classList.add(`id-${id}`)
    console.log(resources[id].videoCore, elem)
    // resources[id].videoCore.addEventListener('loadeddata', () => {
    //   console.log("resource loaded")
    //   getVideoThumbnail(resources[id].videoCore, elem)
    // })
    // getVideoThumbnail(resources[id].videoCore, elem)
    // elem.append(resources[id].metadata.title)
    elem.append(source)
    $('.resources-list').append(elem)
    $(`.id-${id}`).draggable(dragObjectLogic)
  }
}


/**
 * Method that returns an object with all
 * metadata necessary to use a video resource
 * @param path to the video resource
 * @param title of the video resource
 */
function buildVideoResourceByPath(path, title) {
  video = document.createElement('video')
  video.src = path
  
  return {
    videoCore: video,
    metadata: {
      path: path,
      title: title
    }
  }
}

/**
 * Method that returns an object with all
 * metadata necessary to use a video resource
 * @param element HTML video element
 * @param title of the video resource
 */
function buildVideoResource(video, title) {
  return {
    videoCore: video,
    metadata: {
      path: video.currentSrc,
      title: title
    }
  }
}

/**
 * This draws the first
 * frame from a video to a canvas 
 * @param video video source in html element
 * @param canvasContext canvas source in html element
 */
function getVideoThumbnail(video, canvas) {
  // context.drawImage(video, 0, videoStartCoordY, canvas.width, videoStartCoordY + canvas.height)
  let context = canvas.getContext('2d')
  
  console.log(canvas.width, canvas.height, video, canvas)
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
}


const dragObjectLogic = {

  start : function (event, helper){
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
    console.log(event)
    if (2 * event.pageY > $(window).height()) {
      event.target.classList.remove('item')
      event.target.classList.add('timeline-item')
      event.target.style.animation = 'fadein 0.5s'
      event.target.style.transition = '1s'
      event.target.style.width = `${event.target.duration*10}px`
      event.target.addEventListener('mousemove', (ctx) => {
        window.currentVideoTime = ctx.offsetX * ctx.target.duration / ctx.target.clientWidth
        /*
        ctx.target.clientWidth .... ctx.target.duration
        ctx.offsetX            .... ?
        ctx.offsetX * ctx.target.duration / ctx.target.clientWidth
        */
        // console.log((ctx.offsetX - ctx.target.offsetLeft) * 100 / ctx.target.duration)
        // const currentTime = ctx.offsetX

      })
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
        } else {
          $('.timeline').append(event.target)
        }
        event.target.style.transition = 'none'

      }
      // TODO: optimize linked list creation (IMPORTANT!)
      let iterator = null;
      window.timeline = null;
      childrenNodesTimeline = $('.timeline').children()
      for (child of childrenNodesTimeline) {
        resource = buildVideoResource(child, "***")
        if (!window.timeline) {
          window.timeline = new TimelineNode(resource)
          iterator = window.timeline
        } else {
          iterator.next = new TimelineNode(resource)
          iterator = iterator.next
        }
      }

    } else {
      event.target.style.transition = '0.5s'
    }

    event.target.style.left = '0';
    event.target.style.top = '0';
  }

};
