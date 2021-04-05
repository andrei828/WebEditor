/*
  Helper functions for rendering the
  editting UI and parsing data for transcoding.
*/


/**
 * Renders the items 
 * to the resources list
 */
 function renderResourcesBlock() {
  for (id in resources) {
    const wrapper = document.createElement('div')
    wrapper.classList.add('item-wrapper')
    const title = document.createElement('span')
    title.innerText = resources[id].metadata.title
    title.classList.add('item-title')



    const elem = document.createElement('video')
    const source = document.createElement('source')
    source.src = resources[id].metadata.path
    elem.classList.add('item')
    elem.id = id
    elem.appendChild(source)
    wrapper.appendChild(elem)
    wrapper.appendChild(title)
    // wrapper.append('03:21')
    $('.resources-list').append(wrapper)
    $(elem).draggable(dragObjectLogic)
  }
}


/**
 * Method that handles the order of
 * items in the window.timeline variable
 */
function arrangeWindowTimeline() {
  let iterator = null;
  window.timeline = null;
  window.timelineDuration = 0
  childrenNodesTimeline = $('.timeline').children()
  for (child of childrenNodesTimeline) {
    if (child !== timelinePlaceholder) {
      if (window.references[child.id]) {
        if (!window.timeline) {
          window.timeline = window.references[child.id]
          window.timeline.prev = null
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
      } else {
        iterator.data.metadata.baseDuration = 0
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
}


/**
 * Renders given item
 * to the resources list
 * @param videoFile uploaded .mp4 file
 */
function renderResourceBlock(videoFile) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('item-wrapper')
  const title = document.createElement('span')
  title.innerText = resources[videoFile.id].metadata.title
  title.classList.add('item-title')

  videoFile.classList.add('item')
  $(videoFile).draggable(dragObjectLogic)

  wrapper.appendChild(videoFile)
  wrapper.appendChild(title)
  $('.resources-list').append(wrapper)
  
}


/**
 * Method that returns an object with all
 * metadata necessary to use a video resource
 * @param path to the video resource
 * @param title of the video resource
 * @param baseDuration offset time 
 * from the previous video in the timeline
 */
function buildVideoResourceByPath(path, title, baseDuration = 0) {
  video = document.createElement('video')
  video.id = getUniqueID()
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
      duration: video.duration,
      baseDuration: baseDuration
    }
  }
}


/**
 * Method that returns an object with all
 * metadata necessary to use a video resource
 * @param path to the video resource
 * @param title of the video resource
 * @param baseDuration offset time 
 * from the previous video in the timeline
 */
 function buildVideoResourceByFile(file, title, baseDuration = 0) {
  video = document.createElement('video')
  video.src = URL.createObjectURL(file)
  video.id = getUniqueID()
  
  return {
    id: video.classList,
    videoCore: video,
    metadata: {
      path: file.name,
      title: title,
      startTime: 0,
      ratio: 'strech',
      endTime: video.duration,
      duration: video.duration,
      baseDuration: baseDuration
    }
  }
}


/**
 * Method that returns an object with all
 * metadata necessary to use a video resource
 * @param video HTML video element
 * @param title of the video resource
 */
function buildVideoResource(video, title, baseDuration = 0, startTime = 0, endTime = 0) {
  const duration = (window.references[video.id]) 
    ? window.references[video.id].data.metadata.duration : video.duration
  return {
    videoCore: video,
    metadata: {
      path: video.currentSrc,
      title: title,
      ratio: 'strech',
      startTime: startTime,
      baseDuration: baseDuration,
      endTime: (endTime) ? endTime : duration, 
      duration: (endTime) ? endTime - startTime : duration - startTime,
    }
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
  currentVideoDurationLabel.innerText = formatTimeFromSeconds((
    videoNode.data.metadata.baseDuration - videoNode.data.metadata.startTime + video.currentTime
  ).toFixed(2))
  
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
 * Method that handles the UI ratio switch
 * @param togglingLayer HTML element
 */
function handleTogglingLayer(togglingLayer) {
    
  const cords = this.getBoundingClientRect();
  const { width, height } = cords;
  const offsetFromLeft = this.offsetLeft;

  togglingLayer.style.width = width + "px";
  togglingLayer.style.height = height + "px";
  togglingLayer.style.left = offsetFromLeft + "px";
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
 * Method that handles new video uploads
 * @param files the uploaded video files 
 */
async function fileUpload({ target: { files } }) {
  console.log(files)
  for (const file of files) {
    const videoResource = buildVideoResourceByFile(file, file.name)
    window.resources[videoResource.videoCore.id] = videoResource
    renderResourceBlock(videoResource.videoCore)
  }
}


/**
 * Renders an item
 * on the timeline canvas
 */
function renderTimelineBlock(videoObject, id) {
  const elem = document.createElement('video')
  const source = document.createElement('source')
  source.src = videoObject.data.metadata.path
  // elem.style.width = `${videoObject.data.metadata.duration*10}px`
  // HREF
  elem.style.flexGrow = videoObject.data.metadata.duration / window.timelineDuration
  // elem.style.flexGrow = `${10}`
  elem.classList.add('timeline-item')
  elem.id = id
  elem.appendChild(source)
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


/**
 * Handles the add operation for the timeline section
 * @param target HTML element dropped on timeline
 */
function replaceTimelinePlaceholder(target) {
  target.style.animation = 'popwidth 0.2s'
  target.style.transition = '0.5s'
  target.style.left = '0'
  target.style.top = '0'
  target.style.width = 'unset'
  $(timelinePlaceholder).replaceWith(target)
}


/**
 * Logic for switching 
 * between the strech and fit ratio
 * @param ctx Timeline videoCore element
 */
function changeRatio(ctx) {
  if (window.references[ctx.target.id].data.metadata.ratio == 'fit') {
    window.currentRatio = 'strech'
    document.querySelector('.toogle-strech').click()
    window.references[ctx.target.id].data.metadata.ratio = 'strech'
  } else if (window.references[ctx.target.id].data.metadata.ratio == 'strech') {
    window.currentRatio = 'fit'
    document.querySelector('.toogle-fit').click()
    window.references[ctx.target.id].data.metadata.ratio = 'fit'
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
    window.currentVideoSelectedForPlayback.data.videoCore.pause()
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


/**
 * Runs when trying to open the context menu
 * @param ctx context for the right click menu
 */
 function rightClickMenu(ctx) {
  window.rightClickCtx = ctx
  $(fitStrechBtn).text(
    window
      .references[ctx.target.id]
      .data.metadata.ratio === 'fit' ? 
      'Strech ratio' : 'Fit ratio'
  )

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
    buildVideoResource(
      ctx.target, window.references[ctx.target.id].data.metadata.title,
      (targetNode.prev) ? 
        targetNode.prev.data.metadata.baseDuration + targetNode.prev.data.metadata.duration : 
        0,
      targetNodeStart, splitTime)
  )
  const secondHalfNode = new TimelineNode(
    buildVideoResource(ctx.target, window.references[ctx.target.id].data.metadata.title,
      firstHalfNode.data.metadata.baseDuration + firstHalfNode.data.metadata.duration, 
      splitTime, targetNodeEnd)
  )

  /* Generating the new HTML elements */
  const firstHalfElement = renderTimelineBlock(firstHalfNode, firstHalfId)
  const secondHalfElement = renderTimelineBlock(secondHalfNode, secondHalfId)
  
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
  window.rightClickCtx = null
  delete window.references[ctx.target.id]

  /* Restarting the timeline playback */
  window.currentVideoSelectedForPlayback = window.timeline
  window.currentVideoSelectedForPlayback.data.videoCore.currentTime = 
    window.currentVideoSelectedForPlayback.data.metadata.startTime

  renderCurrentPlaybackBar(window.currentVideoSelectedForPlayback)
}


/**
 * Method that triggers the modal
 */
function donePreviewClicked(_) {
  modalWrapper.classList.remove('modal-wrapper')
  modalWrapper.classList.add('modal-wrapper-active')
}


/**
 * Method that handles 
 * closing the modal 
 * @param ctx click context
 */
function closeModal(ctx) {
  if (ctx.target === modalWrapper || ctx.target == closeModalBtn) {
    modalWrapper.classList.add('modal-wrapper')
    modalWrapper.classList.remove('modal-wrapper-active')
  }
}