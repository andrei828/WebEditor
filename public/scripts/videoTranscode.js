
$(document).ready(() => {
  render()
})



async function render() {
  const { createFFmpeg, fetchFile } = FFmpeg
  const ffmpeg = createFFmpeg({ log: false })
  
  ffmpeg.load((_) => {
    let currentPart = 1
    let totalParts = 0
    
    const downloadHref = document.getElementById('download-button')
    $('.default-modal-content-before-download').remove()
    const elm = document.getElementById("start-render")
    elm.style.cursor = 'pointer'
    elm.style.backgroundColor = '#1a1a1a'
    defaultModalContent.style.display = 'grid'

    /*
    * type can be one of following:
    *
    * info: internal workflow debug messages
    * fferr: ffmpeg native stderr output
    * ffout: ffmpeg native stdout output
    */
    ffmpeg.setLogger(({ type, message }) => {
      
      if (type == "fferr" && message.includes("Error")) {
        return
      }
      try {
        logText.innerHTML = `<b>Part ${currentPart} out of ${totalParts}<b><br><br>`
        logText.innerHTML += message
      } catch (_) {
        /* logText is not defined */
      }
    })

    /*
    * ratio is a float number between 0 to 1.
    */
    ffmpeg.setProgress(({ ratio, time, duration }) => {
      if (currentPart === totalParts && time) {
        progressBar.ldBar.set(time / window.timelineDuration * 100)
      } else {
        progressBar.ldBar.set(ratio * 100)
      }
    })

    const transcode = async (event) => {

      if (!window.timeline) {
        return
      }

      elm.style.display = 'none'
      downloadHref.style.display = 'none'
      defaultModalContent.style.display = 'none'
      loadingWrapper.classList.remove('loading-wrapper')
      loadingWrapper.classList.add('loading-wrapper-active')

      // await ffmpeg.load();
      const inputPaths = [];
      
      totalParts = 0
      let iterator = window.timeline
      while (iterator) {
        totalParts += 1
        iterator = iterator.next
      }
      totalParts += 1
      currentPart = 1
      
      iterator = window.timeline
      while (iterator) {
          const fileBlob = iterator.data.videoCore.currentSrc
          const fileName = `${iterator.data.videoCore.id}-${iterator.data.metadata.title}`
          const startTime = iterator.data.metadata.startTime
          const endTime = iterator.data.metadata.endTime

          const wi = window.FFMPEG_RESOLUTION_WIDTH
          const he = FFMPEG_RESOLUTION_HEIGHT

          ffmpeg.FS('writeFile', fileName, await fetchFile(fileBlob))
          if (iterator.data.metadata.ratio === 'fit') {
            // await ffmpeg.run('-i', fileName, '-f', 'lavfi', '-i', 'anullsrc', '-shortest', '-map', '0:v', '-map', '0:a?', '-map', '1:a', '-vf', 
            //   `scale='min(${wi},iw)':min'(${he},ih)':force_original_aspect_ratio\=decrease,pad=${wi}:${he}:(ow-iw)/2:(oh-ih)/2`,
            //   '-ss', `${startTime}`, '-to', `${endTime}`, 'tmp.mp4'
            // )
            await ffmpeg.run('-i', fileName, '-vf', 
              `scale='min(${wi},iw)':min'(${he},ih)':force_original_aspect_ratio\=decrease,pad=${wi}:${he}:(ow-iw)/2:(oh-ih)/2`,
              '-ss', `${startTime}`, '-to', `${endTime}`, `tmp${currentPart}.mpg`
            )
          } else if (iterator.data.metadata.ratio === 'strech') {
            // await ffmpeg.run('-i', fileName, '-f', 'lavfi', '-i', 'anullsrc', '-shortest', '-map', '0:v', '-map', '0:a?', '-map', '1:a',
            //   '-vf', `scale=${wi}:${he}`,
            //   '-ss', `${startTime}`, '-to', `${endTime}`, `tmp${currentPart}.mpg`
            // )

            await ffmpeg.run('-i', fileName, 
              '-vf', `scale=${wi}:${he}`,
              '-ss', `${startTime}`, '-to', `${endTime}`, `tmp${currentPart}.mpg`
            )
            
          }
          
          // const data = ffmpeg.FS('readFile', 'tmp.mp4')
          // ffmpeg.FS('writeFile', fileName, await fetchFile(
          //     new Blob([data.buffer], {
          //       type: "video/mp4"
          //     })
          //   ))
          inputPaths.push(`tmp${currentPart}.mpg`);
          currentPart += 1 
          // inputPaths.push(`file ${fileName}`);
          

          iterator = iterator.next
      }
      console.log(inputPaths)
      // ffmpeg.FS('writeFile', 'concat_list.txt', inputPaths.join('\n'));
      // await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', 'output.mp4');
      console.log(`concat:${inputPaths.join('|')}`)
      await ffmpeg.run('-i', `concat:${inputPaths.join('|')}`, '-c', 'copy', 'intermediate_all.mpg');
      await ffmpeg.run('-i', 'intermediate_all.mpg', '-qscale:v', '2', 'output.mp4');
      /* resetting the current part variable */
      // ffmpeg -i concat:"intermediate1.mpg|intermediate2.mpg" -c copy intermediate_all.mpg && \
      // ffmpeg -i intermediate_all.mpg -qscale:v 2 output.mp4
      const data = ffmpeg.FS('readFile', 'output.mp4');
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(
        new Blob([data.buffer], {
          type: "video/mp4"
        })
      );
      
      elm.style.display = 'block'
      elm.innerText = 'Render new'
      downloadHref.style.display = 'block';
      downloadHref.href = imageUrl
      downloadHref.download = 'sample.mp4'
      
      delete ffmpeg;
    }

    elm.addEventListener("click", transcode)
    
  })
  
}