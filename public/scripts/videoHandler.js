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

  RATIO = 1.77 // 4:3=1.33 1:2=0.5
  window.FFMPEG_RESOLUTION_WIDTH = 1920
  window.FFMPEG_RESOLUTION_HEIGHT = 1080
  
  this.resources = {}
  /* Currently hardcoding the default video items */
  this.resources[getUniqueID()] = buildVideoResourceByPath('./resources/GrahamScan.mov', 'GrahamScan.mov')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./resources/PostItDemo.mp4', 'PostItDemo.mp4')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./resources/bunny.mp4', 'bunny.mp4')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./resources/bunny2.mp4', 'bunny2.mp4')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./resources/portait.mp4', 'portait.mp4')
  this.resources[getUniqueID()] = buildVideoResourceByPath('./resources/bunny10sec.mp4', 'bunny10sec.mp4')

  document.body.onkeyup = keyUpEvent
  document.body.onkeydown = keyDownEvent

  window.currentMouseDownEvent = null;

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
  playButton = document.querySelector('.preview-play')
  pauseButton = document.querySelector('.preview-pause')
  backwardButton = document.querySelector('.preview-back')
  forwardButton = document.querySelector('.preview-forward')

  /* Setting the event listeners for backward and forward buttons */
  backAndForwardButtonLogic(backwardButton, forwardButton)

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

  fitStrechBtn = document.querySelector('#fit-strech-video')
  fitStrechBtn.addEventListener('click', () => changeRatio(window.rightClickCtx))

  /* In the beginning, no video is currently playing */
  window.currentVideoSelectedForPlayback = null

  timelinePlaybackBar = document.querySelector('#timeline-playback-bar')

  /* Hash table with references to nodes in the linked 
     list will elaborate after further implementations */
  window.references = {}
  
  window.rerenderFrame = renderUIAfterFrameChange

  /* Rendering the video resources */
  renderResourcesBlock()
  window.renderResources = renderResourcesBlock
  window.buildResource = buildVideoResourceByPath

  /* No video is playing by default */
  setCurrentlyPlaying(false)

  /* Playing and pausing will trigger the
     same action as hitting the space bar*/
  playButton.addEventListener('click', triggerPlayVideo)
  pauseButton.addEventListener('click', triggerPlayVideo)
 
  /* Video duration selectors */
  finalVideoDurationLabel = document.querySelector('#full-video-duration')
  currentVideoDurationLabel = document.querySelector('#current-video-duration')
  
  modalWrapper = document.querySelector('.modal-wrapper')
  donePreview = document.querySelector('#preview-done')
  closeModalBtn = document.querySelector('.close-modal')

  modalWrapper.addEventListener('click', closeModal)
  closeModalBtn.addEventListener('click', closeModal)
  donePreview.addEventListener('click' , donePreviewClicked)

  logText = document.getElementById('load-logs')
  progressBar = document.getElementById('progress-bar')
  loadingWrapper = document.querySelector('.loading-wrapper')
  defaultModalContent = document.querySelector('.default-modal-content')

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
 * Method for rendering the playback
 * bar on the timeline canvas
 * @param videoElement TimelineNode element
 */
function renderCurrentPlaybackBar(videoNode) {
  let videoElement = videoNode.data.videoCore
  
  let currentTime = videoNode.data.videoCore.currentTime - videoNode.data.metadata.startTime

  window.currentPlaybackTime = videoElement.offsetLeft + 
    (currentTime * videoElement.clientWidth / videoNode.data.metadata.duration)
  
  timelinePlaybackBar.style.left = `${window.currentPlaybackTime}px`
}








function doneTrimming(ctx) {
  modal = document.querySelector('#trim-modal')
  modal.style.display = 'none'
  
  startTimeModal = document.querySelector('#trim-modal-start-time')
  endTimeModal = document.querySelector('#trim-modal-end-time')
  window.timelineDuration -= window.references[window.currentlyTimming.id].data.metadata.duration - Number(endTimeModal.innerText) + Number(startTimeModal.innerText)
  window.references[window.currentlyTimming.id].data.metadata.startTime = Number(startTimeModal.innerText)
  window.references[window.currentlyTimming.id].data.metadata.endTime = Number(endTimeModal.innerText)
  window.references[window.currentlyTimming.id].data.metadata.duration = Number(endTimeModal.innerText) - Number(startTimeModal.innerText)
  // window.currentlyTimming.style.width = `${window.references[window.currentlyTimming.id].data.metadata.duration*10}px`

  renderPreviousTimelineDimensions()
  // HREF
  finalVideoDurationLabel.innerText = formatTimeFromSeconds(window.timelineDuration.toFixed(2))
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
 * Method that replaces the dot with ':'
 * and converts the current time to string
 * @param time double with two decimals
 */
function formatTimeFromSeconds(time) {
  const totalSeconds = time | 0
  const minutes = parseInt(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const secondsString = (seconds < 10) ? `0${seconds}` : `${seconds}`
  return `${minutes}:${secondsString}`
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

  window.currentVideoSelectedForPlayback = window.references[ctx.target.id]
  renderUIAfterFrameChange(window.currentVideoSelectedForPlayback)
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
            resource = buildVideoResource(child, window.resources[child.id] ? window.resources[child.id].metadata.title : "***")
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
          if (iterator.prev) {
            iterator.data.metadata.baseDuration = iterator.prev.data.metadata.baseDuration + iterator.prev.data.metadata.duration
          }
          
          window.timelineDuration += iterator.data.metadata.duration
          /* Removing previous links if necessary */
          iterator.next = null
        }
      }
      finalVideoDurationLabel.innerText = formatTimeFromSeconds(window.timelineDuration.toFixed(2))
      // event.target.style.width = event.target.getBoundingClientRect().width

      window.currentVideoSelectedForPlayback = window.timeline
      window.currentVideoSelectedForPlayback.data.videoCore.currentTime = window.currentVideoSelectedForPlayback.data.metadata.startTime
      setTimeout(() => 
        renderCurrentPlaybackBar(window.currentVideoSelectedForPlayback), 50)
    } else {
      event.target.style.transition = '0.5s'  
    }

    renderPreviousTimelineDimensions()
    event.target.style.left = '0'
    event.target.style.top = '0'
    
  }

};
