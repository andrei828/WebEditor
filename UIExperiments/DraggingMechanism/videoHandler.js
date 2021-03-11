const SPACEBAR = ' '

const NONE = 'none'
const INLINE = 'inline'

/**
 * Linked list used to store 
 * the videos in the timeline 
 */
class TimelineNode {
  constructor(data) {
    this.data = data
    this.next = null
    this.prev = null              
  }
}

window.onload = () => {
  
  this.resources = {}
  /* Currently hardcoding the default video items */
  this.resources[getUniqueID()] = buildVideoResourceByPath('./GrahamScan.mov', 'Graham')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./PostItDemo.mp4', 'Post it')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./bunny.mp4', 'Bunny 1')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./bunny2.mp4', 'Bunny 2')
  
  /* Listener for playback triggered by the spacebar */
  document.body.onkeyup = spacebarPlayEvent

  timelinePlaceholder = document.createElement('div')
  timelinePlaceholder.classList.add('timeline-item')
  
  /* References to the timeline canvas */
  timelineCanvas = document.querySelector('#timeline-canvas')
  timelineCanvasCtx = timelineCanvas.getContext('2d')

  /* References to the video preview canvas */
  canvasWrapper = document.querySelector('.preview-player-wrapper')
  canvas = document.querySelector('.preview-player')
  context = canvas.getContext('2d')

  /* References to the playback controls */
  backButton = document.querySelector('.preview-back')
  playButton = document.querySelector('.preview-play')
  pauseButton = document.querySelector('.preview-pause')
  forwardButton = document.querySelector('.preview-forward')

  /* In the beginning, no video is currently playing */
  currentVideoSelectedForPlayback = null
  
  /* Hash table with references to nodes in the linked 
     list will elaborate after further implementations */
  window.references = {}
  
  /* Rendering the video resources */
  renderResourcesBlock()

  /* No video is playing by default */
  setCurrentlyPlaying(false)

  /* Playing and pausing will trigger the
     same action as hitting the space bar*/
  playButton.addEventListener('click', triggerPlayVideo)
  pauseButton.addEventListener('click', triggerPlayVideo)


  backButton.addEventListener('click', () => {
    // TODO: go back 10 seconds...
  })

  forwardButton.addEventListener('click', () => {
    // TODO: skip 10 seconds forward...
  })

  /**
   * Trying to override the scrolling mechanism for the timeline
   */
  /*document.querySelector('.bottom-scrollable').addEventListener('wheel', function (event, delta) {
    console.log(event)
    this.scrollLeft += (delta * 30);
    // event.preventDefault();
  })*/
}

/**
 * Generates a random string
 * that acts as a unique ID
 */
function getUniqueID() {
  return Math.random().toString(36).substr(2, 9)
}
/**
 * Method that handles the 
 * spacebar playback event
 * @param event context about the event
 */
function spacebarPlayEvent(event) {
  if (event.key == SPACEBAR) {
    triggerPlayVideo()
  }
}

/**
 * Logic that toggles the video
 * playback based on the global variables.
 */
function triggerPlayVideo() {
  if (window.timeline) {

    setCurrentlyPlaying(!window.currentlyPlaying)
    
    const video = currentVideoSelectedForPlayback ?? window.timeline
    
    if (window.currentlyPlaying) {
      playVideo(video)
    } else {
      video.data.videoCore.pause()
    }
  }
}

/**
 * Draws the time bar in the timeline
 * and updates the preview canvas 
 * @param video TimelineNode element
 */
function renderUIAfterFrameChange(videoNode) {

  let video = videoNode.data.videoCore

  /* Rendering the current time bar */
  renderCurrentPlaybackBar(videoNode)

  /* Updating the canvas resolution */
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  /* Rendering the video on the preview canvas */
  context.drawImage(
    video, 0, 0, canvas.width, canvas.height
  )
}

// TODO: change the parameters to only use the current node
function playVideo(videoTimeline) {

  const timelineNode = videoTimeline.next
  const video = videoTimeline.data.videoCore
  const videoEndTime = videoTimeline.data.metadata.endTime
  
  loop = () => {
    if (!window.currentlyPlaying) {
      return
    }

    if (videoEndTime < video.currentTime + 0.01) {
      /* Pausing the current video if necessary */
      video.pause()

      if (timelineNode) {
        /* Starting next video from the beginning */
        timelineNode.data.videoCore.currentTime = timelineNode.data.metadata.startTime

        /* Updating the currentVideoSelectedForPlayback variable */
        currentVideoSelectedForPlayback = timelineNode

        /* Playing the next frame */
        playVideo(timelineNode)
      }
    } else {
      /* Updating the UI */
      renderUIAfterFrameChange(videoTimeline)

      /* Drawing at 30fps (1000 / 30 = 33,3333..)*/
      setTimeout(loop, 33.3333333) 
    }
  }
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  loop()
  video.play()
}

/**
 * Method for rendering the playback
 * bar on the timeline canvas
 * @param videoElement TimelineNode element
 */
function renderCurrentPlaybackBar(videoNode) {
  let videoElement = videoNode.data.videoCore
  
  timelineCanvasCtx.clearRect(
    window.currentPlaybackTime - 5, 0, 
    window.currentPlaybackTime + 2, timelineCanvas.height
  )
  
  let currentTime = videoNode.data.videoCore.currentTime - videoNode.data.metadata.startTime

  window.currentPlaybackTime = videoElement.offsetLeft + 
    (currentTime * videoElement.clientWidth / videoNode.data.metadata.duration)
  

  timelineCanvasCtx.beginPath()
  timelineCanvasCtx.moveTo(window.currentPlaybackTime, 0)
  timelineCanvasCtx.lineTo(window.currentPlaybackTime, timelineCanvas.height)
  timelineCanvasCtx.lineWidth = 2;
  timelineCanvasCtx.stroke();
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
    elem.id = id
    elem.append(source)
    $('.resources-list').append(elem)
    $(elem).draggable(dragObjectLogic)
  }
}

/**
 * Renders an item
 * on the timeline canvas
 */
function renderTimelineBlock(videoObject, id) {
  elem = document.createElement('video')
  source = document.createElement('source')
  source.src = videoObject.data.metadata.path
  elem.style.width = `${videoObject.data.metadata.duration*10}px`
  elem.classList.add('timeline-item')
  elem.id = id
  elem.append(source)
  elem.currentTime = videoObject.data.metadata.startTime
  elem.style.left = '0';
  elem.style.top = '0';
  $(elem).draggable(dragObjectLogic)
  elem.addEventListener('mousemove', (ctx) => {
    timelineMove(ctx)
  })
  elem.addEventListener('mouseleave', (ctx) => {
    timelineLeave(ctx)
  })
  elem.addEventListener('click', (ctx) => {
    timelineClick(ctx)
  })
  elem.addEventListener('contextmenu', function(ctx) {
    timelineRightClick(ctx)
  }, false);

  return elem
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
    id: video.classList,
    videoCore: video,
    metadata: {
      path: path,
      title: title,
      startTime: 0,
      endTime: video.duration,
      duration: video.duration
    }
  }
}

/**
 * Method that returns an object with all
 * metadata necessary to use a video resource
 * @param element HTML video element
 * @param title of the video resource
 */
function buildVideoResource(video, title, startTime = 0, endTime = 0) {
  const duration = (window.references[video.id]) ? window.references[video.id].data.metadata.duration : video.duration
  return {
    videoCore: video,
    metadata: {
      path: video.currentSrc,
      title: title,
      startTime: startTime,
      endTime: (endTime) ? endTime : duration, 
      duration: (endTime) ? endTime - startTime : duration - startTime
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
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
}

/**
 * Sets the global variable currentlyPlaying 
 * that decides the current state of the UI
 * @param value boolean value
 */
function setCurrentlyPlaying(value) {
  window.currentlyPlaying = value

  try {
    currentVideoSelectedForPlayback.data.videoCore.pause()
  } catch (error) {
    /* No video is currently playing */
  }

  /* Updating the controls from the preview canvas */
  setPlaybackControlState(value)
}

/**
 * Method decides whether the play button
 * or pause button has to be displayed
 * @param value boolean value
 */
function setPlaybackControlState(value) {
  if (value) {
    /* video is playing */
    playButton.style.display = NONE
    pauseButton.style.display = INLINE
  } else {
    /* video is paused */
    playButton.style.display = INLINE
    pauseButton.style.display = NONE
  }
}

function timelineMove(ctx) {
  
  window.currentVideoTime = ctx.offsetX * window.references[ctx.target.id].data.metadata.duration / ctx.target.clientWidth
  // window.currentVideoTime = ctx.offsetX * ctx.target.duration / ctx.target.clientWidth
}

function timelineLeave(ctx) {
  window.currentVideoTime = null
}

function timelineClick(ctx) {
  ctx.target.currentTime = window.references[ctx.target.id].data.metadata.startTime + 
    ctx.offsetX * window.references[ctx.target.id].data.metadata.duration / ctx.target.clientWidth
  // ctx.target.currentTime = ctx.offsetX * ctx.target.duration / ctx.target.clientWidth
      
  setCurrentlyPlaying(false)

  currentVideoSelectedForPlayback = window.references[ctx.target.id]
  renderUIAfterFrameChange(currentVideoSelectedForPlayback)
}

function timelineRightClick(ctx) {
  ctx.preventDefault()
  const id = getUniqueID()
  const firstId = getUniqueID()
  const newStartTime = ctx.offsetX * window.references[ctx.target.id].data.metadata.duration / ctx.target.clientWidth
  // const newStartTime = ctx.offsetX * ctx.target.duration / ctx.target.clientWidth;
  const splitItem = new TimelineNode(buildVideoResource(ctx.target, "***", window.references[ctx.target.id].data.metadata.startTime + newStartTime, window.references[ctx.target.id].data.metadata.endTime))
  const firstSplitItem = new TimelineNode(buildVideoResource(ctx.target, "***", window.references[ctx.target.id].data.metadata.startTime, window.references[ctx.target.id].data.metadata.endTime - newStartTime))
  const htmlElem = renderTimelineBlock(splitItem, id)
  const firstHtmlElem = renderTimelineBlock(firstSplitItem, firstId)
  firstSplitItem.data.videoCore = firstHtmlElem
  splitItem.data.videoCore = htmlElem

  
  
  window.references[id] = splitItem
  window.references[firstId] = firstSplitItem
  $(ctx.target).after(firstHtmlElem)
  $(firstHtmlElem).after(htmlElem)
  
  firstSplitItem.next = splitItem
  splitItem.prev = firstSplitItem

  let previous = window.references[ctx.target.id].prev
  if (previous) {
    splitItem.next = previous.next.next
    previous.next = firstSplitItem
    firstSplitItem.prev = previous
  } else {
    firstSplitItem.prev = null
    window.timeline = firstSplitItem
  }

  $(ctx.target).remove()

  currentVideoSelectedForPlayback = window.timeline
  currentVideoSelectedForPlayback.data.videoCore.currentTime = currentVideoSelectedForPlayback.data.metadata.startTime
  
}

/**
 * Object that has the logic responsible
 * for dragging and dropping all video items
 */
const dragObjectLogic = {

  start : function (event, helper) {
    if (2 * event.pageY > $(window).height()) {
      document.querySelector('.dragging-item').style.top = `${helper.offset.top}px`
      document.querySelector('.dragging-item').style.left = `${helper.offset.left}px`
      $('.dragging-item').append(event.target)
    }
    setCurrentlyPlaying(false)
    if (window.references[event.target.id]) {
      timelinePlaceholder.style.width = `${window.references[event.target.id].data.metadata.duration*10}px`
    } else {
      timelinePlaceholder.style.width = `${event.target.duration*10}px`
    }
    // timelinePlaceholder.style.width = `${event.target.duration*10}px`
    event.target.style.zIndex = '150'
    event.target.style.animation = 'pickup 0.5s'
    event.target.style.boxShadow = '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22'
    event.target.style.transform = 'scale(1.15)'
    event.target.style.transition = 'none'
  },

  
  drag: function (event, helper) {
    if (2 * event.pageY > $(window).height()) {
      timelinePlaceholder.style.display = 'block'
      childrenNodesTimeline = $('.timeline').children()
      if (!childrenNodesTimeline.length) {
        if ($('.timeline').last()[0] !== timelinePlaceholder) {
          $('.timeline').prepend(timelinePlaceholder)
        }
      } else {

        let refNode = null;
        for (child of childrenNodesTimeline) {
          if (child != event.target && child.offsetLeft + child.clientWidth / 2 > helper.offset.left) {
            refNode = child
            break;
          }
        }

        if (refNode) {
          if ($(child).prev()[0] !== timelinePlaceholder) {
            $(timelinePlaceholder).insertBefore(child)
          }
        } else {
          if (childrenNodesTimeline.last()[0] !== timelinePlaceholder) {
            $('.timeline').append(timelinePlaceholder)
          }
        }
      }
    }
  },
  

  stop : function (event, helper) {
    timelinePlaceholder.style.display = 'none'
    event.target.style.position = 'relative'
    event.target.style.boxShadow = 'none'
    event.target.style.transform = 'scale(1)'
    
    if (2 * event.pageY > $(window).height()) {
      $(timelinePlaceholder).replaceWith(event.target)
      event.target.classList.remove('item')
      event.target.classList.add('timeline-item')
      event.target.style.animation = 'fadein 0.5s'
      event.target.style.transition = '1s'
      if (window.references[event.target.id]) {
        event.target.style.width = `${window.references[event.target.id].data.metadata.duration*10}px`
      } else {
        event.target.style.width = `${event.target.duration*10}px`
      }
      
      event.target.addEventListener('mousemove', (ctx) => {
        timelineMove(ctx)
      })
      event.target.addEventListener('mouseleave', (ctx) => {
        timelineLeave(ctx)
      })
      event.target.addEventListener('click', (ctx) => {
        timelineClick(ctx)
      })
      event.target.addEventListener('contextmenu', function(ctx) {
        timelineRightClick(ctx)
      }, false);

      childrenNodesTimeline = $('.timeline').children()

      // TODO: optimize linked list creation (IMPORTANT!)
      let iterator = null;
      window.timeline = null;
      childrenNodesTimeline = $('.timeline').children()
      for (child of childrenNodesTimeline) {
        if (child !== timelinePlaceholder) {

          if (window.references[child.id]) {
            if (!window.timeline) {
              window.timeline = window.references[child.id]
              iterator = window.timeline
            } else {
              iterator.next = window.references[child.id]
              iterator.next.prev = iterator
              iterator = iterator.next
            }
          } else {
            resource = buildVideoResource(child, "***")
            if (!window.timeline) {
              window.timeline = new TimelineNode(resource)
              iterator = window.timeline
            } else {
              iterator.next = new TimelineNode(resource)
              iterator.next.prev = iterator
              iterator = iterator.next
            }
            window.references[iterator.data.videoCore.id] = iterator
          }
          /* Removing previous links if necessary */
          iterator.next = null
        }
      }
      
    } else {
      event.target.style.transition = '0.5s'
    }

    event.target.style.left = '0';
    event.target.style.top = '0';

    currentVideoSelectedForPlayback = window.timeline
    currentVideoSelectedForPlayback.data.videoCore.currentTime = currentVideoSelectedForPlayback.data.metadata.startTime
  }

};
