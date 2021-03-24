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
 * Method for rendering the current video
 * @param videoTimeline TimelineNode element
 */
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

        /* Setting the current switch value */
        if (timelineNode.data.metadata.ratio == 'fit') {
          window.currentRatio = 'fit'
          document.querySelector('.toogle-fit').click()
        } else if (timelineNode.data.metadata.ratio == 'strech') {
          window.currentRatio = 'strech'
          document.querySelector('.toogle-strech').click()
        }

        /* Starting next video from the beginning */
        timelineNode.data.videoCore.currentTime = timelineNode.data.metadata.startTime

        /* Updating the window.currentVideoSelectedForPlayback variable */
        window.currentVideoSelectedForPlayback = timelineNode

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
 * Generates a random string
 * that acts as a unique ID
 */
function getUniqueID() {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Method that handles the 
 * all keyup event on body
 * @param event context about the event
 */
function keyUpEvent(event) {
  /* Listener for playback triggered by the spacebar */
  if (event.key === SPACEBAR) {
    triggerPlayVideo()
  /* Left or Right keyup events */
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    clearTimeout(window.currentMouseDownEvent)
  }
}

/**
 * Method that handles the 
 * all keydown event on body
 * @param event context about the event
 */
function keyDownEvent(event) {
  /* Left keydown event */
  if (event.key === 'ArrowLeft') {
    backButtonTrigger()
    window.currentMouseDownEvent = setTimeout(() => backButtonTrigger(), 100)
  /* Right keydown event */
  } else if (event.key === 'ArrowRight') {
    forwardButtonTrigger()
    window.currentMouseDownEvent = setTimeout(() => forwardButtonTrigger(), 100)
  }
}

/**
 * Logic that toggles the video
 * playback based on the global variables.
 */
 function triggerPlayVideo() {
  if (window.timeline) {

    setCurrentlyPlaying(!window.currentlyPlaying)
    
    const video = window.currentVideoSelectedForPlayback ?? window.timeline
    
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

  const video = videoNode.data.videoCore

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
  currentVideoDurationLabel.innerText = formatTimeFromSeconds((videoNode.data.metadata.baseDuration + video.currentTime).toFixed(2))
  
  if (videoNode.data.metadata.ratio == 'fit') {
    if (window.currentRatio == 'strech') {
      document.querySelector('.toogle-fit').click()
    }
    context.drawImage(
      video, canvas.width / 2 - videoRatio * canvas.height / 2, 0, videoRatio * canvas.height, canvas.height
    ) 
  } else if (videoNode.data.metadata.ratio == 'strech') {
    if (window.currentRatio === 'fit') {
      document.querySelector('.toogle-strech').click()
    }
    context.drawImage(
      video, 0, 0, canvas.width, canvas.height
    )
  }
}

/**
 * Method that handles the back button
 * event and moves the video 1 second
 */
function backButtonTrigger() {
  if (window.currentVideoSelectedForPlayback) {
    setCurrentlyPlaying(false)
    const currentNode = window.currentVideoSelectedForPlayback
    const currentTime = currentNode.data.videoCore.currentTime
    const currentVideoStart = currentNode.data.metadata.startTime

    if (currentTime - currentVideoStart > 1) {
      currentNode.data.videoCore.currentTime -= 1
    } else if (currentNode.prev) {
      const remainingTime = 1 - currentTime
      window.currentVideoSelectedForPlayback = currentNode.prev
      const prevEndTime = window.currentVideoSelectedForPlayback.data.metadata.endTime
      window.currentVideoSelectedForPlayback.data.videoCore.currentTime = prevEndTime - remainingTime
    } else {
      window.currentVideoSelectedForPlayback.data.videoCore.currentTime = currentVideoStart
    }
    renderUIAfterFrameChange(window.currentVideoSelectedForPlayback)
  }
}

/**
 * Method that handles the forward button
 * event and moves the video ahead 1 second
 */
function forwardButtonTrigger() {
  if (window.currentVideoSelectedForPlayback) {
    setCurrentlyPlaying(false)
    const currentNode = window.currentVideoSelectedForPlayback
    const currentTime = currentNode.data.videoCore.currentTime
    const currentVideoEnd = currentNode.data.metadata.endTime

    if (currentTime + 1 < currentVideoEnd) {
      currentNode.data.videoCore.currentTime += 1
    } else if (currentNode.next) {
      const remainingTime = 1 - currentTime
      window.currentVideoSelectedForPlayback = currentNode.next
      const nextStartTime = window.currentVideoSelectedForPlayback.data.metadata.startTime
      window.currentVideoSelectedForPlayback.data.videoCore.currentTime = nextStartTime + remainingTime
    } else {
      window.currentVideoSelectedForPlayback.data.videoCore.currentTime = currentVideoEnd
    }
    renderUIAfterFrameChange(window.currentVideoSelectedForPlayback)
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
    window.rightClickCtx = null
    timelineClick(ctx)
    rightClickMenu(ctx)
  }, false);

  return elem
}

/**
 * Method that handles the logic for 
 * skipping forward and backward in the timeline
 */
function backAndForwardButtonLogic(backwardButton, forwardButton) {
  let currentMouseDownEvent = null;
  backwardButton.addEventListener('mousedown', () => {
    backButtonTrigger()
    currentMouseDownEvent = setInterval(() => backButtonTrigger(), 100)
  })
  backwardButton.addEventListener('mouseup', () => {
    clearInterval(currentMouseDownEvent)
  })
  forwardButton.addEventListener('mousedown', () => {
    forwardButtonTrigger()
    currentMouseDownEvent = setInterval(() => forwardButtonTrigger(), 100)
  })
  forwardButton.addEventListener('mouseup', () => {
    clearInterval(currentMouseDownEvent)
  })
}

