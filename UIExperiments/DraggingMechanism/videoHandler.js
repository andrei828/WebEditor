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
  this.resources[getUniqueID()] = buildVideoResourceByPath('./portait.mp4', 'Portait')

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

  /* Context menu HTML element */
  contextMenu = document.querySelector('#context-menu')
  $(document).bind('click', function() { 
    $(contextMenu).hide()
  })

  splitVideoBtn = document.querySelector('#split-video')
  splitVideoBtn.addEventListener('click', () => splitVideo(window.rightClickCtx))

  trimVideoBtn = document.querySelector('#trim-video')
  trimVideoBtn.addEventListener('click', () => renderTrimBars(window.rightClickCtx))

  trimDoneBtn = document.querySelector('#trim-modal-done')
  trimDoneBtn.addEventListener('click', doneTrimming)

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
  alpha1 = canvas.width * video.videoHeight / canvas.height - video.videoWidth
  alpha2 = video.videoWidth * canvas.height / canvas.width - video.videoHeight

  if (alpha1 < alpha2) {
    canvas.width = video.videoWidth + alpha1
    canvas.height = video.videoHeight
  } else {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight + alpha2
  }

  canvasRatio = canvas.width / canvas.height
  videoRatio = video.videoWidth / video.videoHeight

  // console.log(alpha1, Math.abs(alpha2))
  // console.log(canvas.width, canvas.height, canvas.width / canvas.height)
  // console.log(video.videoWidth, video.videoHeight, video.videoWidth / video.videoHeight)
  // console.log((video.videoHeight - canvas.height) / 2)
  // console.log('-------------')

  if (videoNode.data.metadata.ratio == 'fit') {
    context.drawImage(
      video, canvas.width / 2 - videoRatio * canvas.height / 2, 0, videoRatio * canvas.height, canvas.height
    ) 
  } else if (videoNode.data.metadata.ratio == 'strech') {
    context.drawImage(
      video, 0, 0, canvas.width, canvas.height
    )
  }

  // context.drawImage(
  //   video, canvas.width / 2 - (canvas.width * videoRatio / canvasRatio) / 2, 0, canvas.width * videoRatio / canvasRatio, canvas.height
  // )

  /* Rendering the video on the preview canvas */
  // context.drawImage(
  //   video, 0, 0, canvas.width, canvas.height
  // )
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

  alpha1 = canvas.width * video.videoHeight / canvas.height - video.videoWidth
  alpha2 = video.videoWidth * canvas.height / canvas.width - video.videoHeight

  if (alpha1 < alpha2) {
    canvas.width = video.videoWidth + alpha1
    canvas.height = video.videoHeight
  } else {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight + alpha2
  }
  
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
  // elem.style.width = `${videoObject.data.metadata.duration*10}px`
  // HREF
  elem.style.flexGrow = videoObject.data.metadata.duration / window.timelineDuration
  // elem.style.flexGrow = `${10}`
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
    $(contextMenu).hide()
    timelineClick(ctx)
    rightClickMenu(ctx)
  }, false);

  return elem
}

function doneTrimming(ctx) {
  modal = document.querySelector('#trim-modal')
  modal.style.display = 'none'
  
  startTimeModal = document.querySelector('#trim-modal-start-time')
  endTimeModal = document.querySelector('#trim-modal-end-time')
  // window.timelineDuration -= window.references[window.currentlyTimming.id].data.metadata.duration - Number(endTimeModal.innerText) + Number(startTimeModal.innerText)
  window.references[window.currentlyTimming.id].data.metadata.startTime = Number(startTimeModal.innerText)
  window.references[window.currentlyTimming.id].data.metadata.endTime = Number(endTimeModal.innerText)
  window.references[window.currentlyTimming.id].data.metadata.duration = Number(endTimeModal.innerText) - Number(startTimeModal.innerText)
  // window.currentlyTimming.style.width = `${window.references[window.currentlyTimming.id].data.metadata.duration*10}px`

  renderPreviousTimelineDimensions()
  // HREF

  console.log(window.references[window.currentlyTimming.id])
  modal.parentNode.replaceChild(modal.cloneNode(true), modal)
  window.currentlyTimming = undefined
  trimDoneBtn = document.querySelector('#trim-modal-done')
  trimDoneBtn.addEventListener('click', doneTrimming)
}

function renderTrimBars(ctx) {
  window.currentlyTimming = ctx.target

  modal = document.querySelector('#trim-modal')
  startTimeModal = document.querySelector('#trim-modal-start-time')
  endTimeModal = document.querySelector('#trim-modal-end-time')
  startTimeModal.innerText = '0.00'
  endTimeModal.innerText = window.references[ctx.target.id].data.metadata.duration.toFixed(2)
  modal.style.display = 'block'
  modal.style.left = `${ctx.target.getBoundingClientRect().left}px`
  modal.style.top = `${ctx.target.getBoundingClientRect().top}px`
  modal.style.width = `${ctx.target.clientWidth}px`
  const BORDER_SIZE = 10;
  var panel = modal
  let m_pos;

  function resizeLeft(mouseEvent) {
    var panelSizes = getComputedStyle(panel, '')
    var targetSizes = ctx.target.getBoundingClientRect()

      if (mouseEvent.x >= targetSizes.left && 
          mouseEvent.x < parseInt(panelSizes.left) + (parseInt(panelSizes.width))) {

        var dx = m_pos - mouseEvent.x
        m_pos = mouseEvent.x
        panel.style.left = `${parseInt(panelSizes.left) - dx}px`
        panel.style.width = `${parseInt(panelSizes.width) + dx}px`

        startTimeModal.innerText = (
          (mouseEvent.x - ctx.target.offsetLeft) *
          window.references[ctx.target.id].data.metadata.duration /
          ctx.target.clientWidth
        ).toFixed(2)
    }
  }

  function resizeRight(mouseEvent) {
    let panelSizes = getComputedStyle(panel, '')
    let targetSizes = ctx.target.getBoundingClientRect()
    if (mouseEvent.x <= targetSizes.right && 
        mouseEvent.x > (parseInt(panelSizes.left))) {
      
      const dx = m_pos - mouseEvent.x
      m_pos = mouseEvent.x
      panel.style.width = `${parseInt(panelSizes.width) - dx}px`
      
      endTimeModal.innerText = (
        (mouseEvent.x - ctx.target.offsetLeft) * 
        window.references[ctx.target.id].data.metadata.duration /
        ctx.target.clientWidth
      ).toFixed(2)
    }
  }

  function mouseDown(e) {
    if (e.offsetX < BORDER_SIZE) {
      m_pos = e.x
      document.addEventListener("mousemove", resizeLeft, false)
    } else if (e.offsetX > parseInt(getComputedStyle(panel, '').width) - BORDER_SIZE) {
      m_pos = e.x
      document.addEventListener("mousemove", resizeRight, false)
    }
  }
  
  panel.addEventListener("mousedown", mouseDown, false);

  document.addEventListener("mouseup", function() {
    document.removeEventListener("mousemove", resizeLeft, false);
    document.removeEventListener("mousemove", resizeRight, false);
  }, false);
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
      ratio: 'strech',
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
      ratio: 'strech',
      startTime: startTime,
      endTime: (endTime) ? endTime : duration, 
      duration: (endTime) ? endTime - startTime : duration - startTime
    }
  }
}
/* *************************************************************************************************************************************************************************************************************************** */
function renderTimelineDimensions(currentItemDuration) {
  let iterator = window.timeline    
  if (!iterator) {
    return 1
  }

  const currentDuration = window.timelineDuration + currentItemDuration
  while (iterator) {
    iterator.data.videoCore.style.flexGrow = iterator.data.metadata.duration / currentDuration
    iterator = iterator.next
  }
  return currentItemDuration / currentDuration
}

function renderPreviousTimelineDimensions() {
  let iterator = window.timeline    
  if (!iterator) {
   return
  }

  const currentDuration = window.timelineDuration
  while (iterator) {
    iterator.data.videoCore.style.flexGrow = iterator.data.metadata.duration / currentDuration
    iterator = iterator.next
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

/**
 * Runs when trying to open the context menu
 * @param ctx context for the right click menu
 */
function rightClickMenu(ctx) {
  window.rightClickCtx = ctx
  $(contextMenu).css({
    'top': `${ctx.pageY - 15}px`, 
    'left': `${ctx.pageX + 15}px`
  }).show();
  ctx.preventDefault();
}

/**
 * Splits the selected video with relative sizes
 * @param ctx context for the right click menu
 */
function splitVideo(ctx) {
  /* Generating the unique ids for the elements */
  const firstHalfId = getUniqueID()
  const secondHalfId = getUniqueID()
  
  /* Accessing key members for rendering */
  const targetNode = window.references[ctx.target.id]
  const targetNodeEnd = targetNode.data.metadata.endTime
  const targetNodeStart = targetNode.data.metadata.startTime
  
  /* Calculating the split moment relative to the current target */
  const newStartTime = ctx.offsetX * 
    targetNode.data.metadata.duration / ctx.target.clientWidth
  
  /* Generating the new TimelineNodes */
  const splitTime = targetNodeStart + newStartTime
  const firstHalfNode = new TimelineNode(
    buildVideoResource(ctx.target, "***", targetNodeStart, splitTime)
  )
  const secondHalfNode = new TimelineNode(
    buildVideoResource(ctx.target, "***", splitTime, targetNodeEnd)
  )

  /* Generating the new HTML elements */
  const firstHalfElement = renderTimelineBlock(firstHalfNode, firstHalfId)
  const secondHalfElement = renderTimelineBlock(secondHalfNode, secondHalfId)
  
  let totalFlexGrow = Number(ctx.target.style.flexGrow)
  ratio = splitTime / targetNode.data.metadata.duration
  // firstHalfElement.style.flexGrow = totalFlexGrow * firstHalfNode.data.metadata.duration / targetNode.data.metadata.duration 
  // secondHalfElement.style.flexGrow = totalFlexGrow - Number(firstHalfElement.style.flexGrow)
  // console.log(targetNode.data.metadata.duration, splitTime, (ratio * 100).toFixed(2) )
console.log('---------')
  console.log(ctx.target.style.flexGrow)
  console.log(firstHalfElement.style.flexGrow)
  console.log(secondHalfElement.style.flexGrow)
  console.log(Number(firstHalfElement.style.flexGrow) + Number(secondHalfElement.style.flexGrow))
  // firstHalfElement
  /* Assigning the videoCore value to the new generated elements */
  firstHalfNode.data.videoCore = firstHalfElement
  secondHalfNode.data.videoCore = secondHalfElement

  /* Updating the refereneces hashmap */
  window.references[firstHalfId] = firstHalfNode
  window.references[secondHalfId] = secondHalfNode

  /* Appending the new elements to DOM */
  $(ctx.target).after(firstHalfElement)
  $(firstHalfElement).after(secondHalfElement)

  /* Linking the new nodes to the timeline doubly linked list */
  firstHalfNode.next = secondHalfNode
  firstHalfNode.prev = targetNode.prev
  secondHalfNode.prev = firstHalfNode
  secondHalfNode.next = targetNode.next
  
  /* If there exists an element after the split */
  if (targetNode.next) {
    targetNode.next.prev = secondHalfNode
  }

  /* If there exists an element before the split */
  if (previous = targetNode.prev) {
    previous.next = firstHalfNode
  } else {
    window.timeline = firstHalfNode
    window.timelineDuration = targetNode.data.metadata.duration
  }

  /* Removing the current target */
  $(ctx.target).remove()
  delete window.references[ctx.target.id]

  /* Restarting the timeline playback */
  currentVideoSelectedForPlayback = window.timeline
  currentVideoSelectedForPlayback.data.videoCore.currentTime = 
    currentVideoSelectedForPlayback.data.metadata.startTime
}

/**
 * Object that has the logic responsible
 * for dragging and dropping all video items
 */
const dragObjectLogic = {

  scroll: false,
  
  start : function (event, helper) {
    if (2 * event.pageY > $(window).height()) {
      timelinePlaceholder.style.flexGrow = event.target.style.flexGrow
      event.target.style.width = event.target.getBoundingClientRect().width
      document.querySelector('.dragging-item').style.top = `${helper.offset.top}px`
      document.querySelector('.dragging-item').style.left = `${helper.offset.left}px`
      $('.dragging-item').append(event.target)
    }
    setCurrentlyPlaying(false)
    if (window.references[event.target.id]) {
      // timelinePlaceholder.style.width = `${window.references[event.target.id].data.metadata.duration*10}px`
      // HREF
      // timelinePlaceholder.style.flexGrow = `${10}`
      // timelinePlaceholder.style.flexGrow = event.target.style.flexGrow
      //renderTimelineDimensions(0)
      // console.log(event.target.style.flexGrow)
      // console.log('hereee')
    } else {
      // timelinePlaceholder.style.width = `${event.target.duration*10}px`
      timelinePlaceholder.style.flexGrow = renderTimelineDimensions(event.target.duration)
      // timelinePlaceholder.style.flexGrow = `${10}`
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
      event.target.style.transition = '0.5s'
      if (window.references[event.target.id]) {
        event.target.style.width = 'unset'
        // event.target.style.width = `${window.references[event.target.id].data.metadata.duration*10}px`
        // HREF
        //event.target.style.flexGrow = timelinePlaceholder.style.flexGrow//window.timelineDuration / window.references[event.target.id].data.metadata.duration
        // event.target.style.flexGrow = `${10}`
      } else {
        // event.target.style.width = `${event.target.duration*10}px`
        //event.target.style.flexGrow = timelinePlaceholder.style.flexGrow//window.timelineDuration / event.target.duration
        // event.target.style.flexGrow = `${10}`
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
      event.target.addEventListener('contextmenu', (ctx) => {
        $(contextMenu).hide()
        timelineClick(ctx)
        rightClickMenu(ctx)
      }, false);

      childrenNodesTimeline = $('.timeline').children()

      // TODO: optimize linked list creation (IMPORTANT!)
      let iterator = null;
      window.timeline = null;
      window.timelineDuration = 0
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
          window.timelineDuration += iterator.data.metadata.duration
          /* Removing previous links if necessary */
          iterator.next = null
        }
      }
      
      // event.target.style.width = event.target.getBoundingClientRect().width
      currentVideoSelectedForPlayback = window.timeline
      currentVideoSelectedForPlayback.data.videoCore.currentTime = currentVideoSelectedForPlayback.data.metadata.startTime
    } else {
      event.target.style.transition = '0.5s'  
    }

    renderPreviousTimelineDimensions()
    event.target.style.left = '0'
    event.target.style.top = '0'
    
  }

};
