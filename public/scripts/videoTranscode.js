
$(document).ready(() => {
  render()
})



function render() {
  const { createFFmpeg, fetchFile } = FFmpeg
  const ffmpeg = createFFmpeg({ log: false, corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js', })
  
  ffmpeg.load((_) => {
    let currentPart = 1
    let totalParts = 0
    let fractionPart = 0

    const downloadHref = document.getElementById('download-button')
    $('.default-modal-content-before-download').remove()
    const elm = document.getElementById("start-render")
    elm.style.cursor = 'pointer'
    elm.style.backgroundColor = '#1a1a1a'
    try {
      defaultModalContent.style.display = 'grid'
    } catch (_) {
      /* default modal is not defined yet */
    }

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
        logText.innerHTML += message.slice(0, 150)
      } catch (_) {
        /* logText is not defined */
      }
    })

    /*
    * ratio is a float number between 0 to 1.
    */
    ffmpeg.setProgress(({ ratio, time, duration }) => {
      // if (currentPart === totalParts && time) {
        // progressBar.ldBar.set(time / window.timelineDuration * 100)
        // progressBar.ldBar.set(Math.min(100, fractionPart * (currentPart - 1) + fracionPart / time * window.timelineDuration / 100))
      // } else {
        if (isNaN(ratio) || ratio < 0) {
          ratio = 1
        }
        // console.log(fractionPart, currentPart, ratio, fractionPart * (currentPart - 1) + Math.min(fractionPart, fractionPart * ratio / 100))
        progressBar.ldBar.set(fractionPart * (currentPart - 2) + Math.min(fractionPart, fractionPart * ratio / 100))
        // console.log(fractionPart * currentPart + fractionPart / ratio * 100)
      // }
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
      const inputPaths = []
      const videoAudioStreams = []

      totalParts = 0
      let iterator = window.timeline
      while (iterator) {
        totalParts += 1
        iterator = iterator.next
      }
      totalParts += 1
      currentPart = 1
      fractionPart = 100 / (totalParts - 1)
      iterator = window.timeline
      while (iterator) {
          const fileBlob = iterator.data.videoCore.currentSrc
          const fileName = `${iterator.data.videoCore.id}-${iterator.data.metadata.title}`
          const startTime = iterator.data.metadata.startTime
          const endTime = iterator.data.metadata.endTime

          const wi = window.FFMPEG_RESOLUTION_WIDTH
          const he = window.FFMPEG_RESOLUTION_HEIGHT

          ffmpeg.FS('writeFile', fileName, await fetchFile(fileBlob))
          const currentItemNumber = currentPart - 1
          if (iterator.data.metadata.ratio === 'fit') {
            // await ffmpeg.run('-i', fileName, '-f', 'lavfi', '-i', 'anullsrc', '-shortest', '-map', '0:v', '-map', '0:a?', '-map', '1:a', '-vf', 
            //   `scale='min(${wi},iw)':min'(${he},ih)':force_original_aspect_ratio\=decrease,pad=${wi}:${he}:(ow-iw)/2:(oh-ih)/2`,
            //   '-ss', `${startTime}`, '-to', `${endTime}`, 'tmp.mp4'
            // )
            // await ffmpeg.run('-i', fileName, '-f', 'lavfi', '-i', 'anullsrc', '-shortest', '-filter:v', 'fps=30', '-vf', 
            //   `scale='min(${wi},iw)':min'(${he},ih)':force_original_aspect_ratio\=decrease,pad=${wi}:${he}:(ow-iw)/2:(oh-ih)/2`,
            //   '-ss', `${startTime}`, '-to', `${endTime}`, 
            //   '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-c:v', 'copy', '-c:a', 'aac', '-shortest',
            //   `tmp${currentItemNumber}.mp4`
            // )

            await ffmpeg.run(
              '-f', 'lavfi', '-i', 'anullsrc',
              '-i', fileName,
              '-ar', '44100',
              // '-vf', `[1:v]scale='min(${wi},iw)':min'(${he},ih)':force_original_aspect_ratio\=decrease,pad=${wi}:${he}:(ow-iw)/2:(oh-ih)/2,fps=30`,
              '-vf', `[1:v]scale=w=${wi}:h=${he}:force_original_aspect_ratio=1,pad=${wi}:${he}:(ow-iw)/2:(oh-ih)/2,fps=30`,
              '-ss', `${startTime}`, '-to', `${endTime}`,
              '-map', '1:v', '-map', '1:a?', '-map', '0:a', '-c:a', 'aac', '-shortest',
              `tmp${currentItemNumber}.mp4`,
            )
          } else if (iterator.data.metadata.ratio === 'strech') {
            // await ffmpeg.run('-i', fileName, '-f', 'lavfi', '-i', 'anullsrc', '-shortest', '-map', '0:v', '-map', '0:a?', '-map', '1:a',
            //   '-vf', `scale=${wi}:${he}`,
            //   '-ss', `${startTime}`, '-to', `${endTime}`, `tmp${currentPart}.mpg`
            // )

            // await ffmpeg.run('-f', 'lavfi', '-i', 'anullsrc',
            //   '-i', fileName,
            //   '-filter:v', 'fps=30',
            //   '-vf', `scale=${wi}:${he},setdar=1:1`,
            //   '-ss', `${startTime}`, '-to', `${endTime}`,
            //   '-map', '0', '-map', '1:a', '-c:v', 'copy', '-shortest',
            //   `tmp${currentItemNumber}.mp4`
            // )
            
            await ffmpeg.run(
              '-f', 'lavfi', '-i', 'anullsrc',
              '-i', fileName,
              '-ar', '44100',
              // '-filter:v', '[1:v]fps=30',
              '-vf', `[1:v]scale=${wi}:${he},setdar=ratio=16/9:max=1000,fps=30`,
              '-ss', `${startTime}`, '-to', `${endTime}`,
              '-map', '1:v', '-map', '1:a?', '-map', '0:a', '-c:a', 'aac', '-shortest',
              `tmp${currentItemNumber}.mp4`,
            )

            // '-map', '0:a?', '-c:a', 'aac',
          }
          
          // const data = ffmpeg.FS('readFile', 'tmp.mp4')
          // ffmpeg.FS('writeFile', fileName, await fetchFile(
          //     new Blob([data.buffer], {
          //       type: "video/mp4"
          //     })
          //   ))
          inputPaths.push('-i')
          inputPaths.push(`tmp${currentItemNumber}.mp4`)
          videoAudioStreams.push(`[${currentItemNumber}:v:0][${currentItemNumber}:a:0]`)
          currentPart += 1 
          // inputPaths.push(`file ${fileName}`);
          

          iterator = iterator.next
      }
      console.log(inputPaths)
      console.log('ffmpeg ')
      // ffmpeg.FS('writeFile', 'concat_list.txt', inputPaths.join('\n'));
      // await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', 'output.mp4');
      console.log(`concat:${inputPaths.join('|')}`)

      
      // `${inputPaths.join(' -i ')}`
      await ffmpeg.run(...inputPaths, '-filter_complex', `${videoAudioStreams.join('')}concat=n=${currentPart - 1}:v=1:a=1[outv][outa]`,
                       '-map', `[outv]`, '-map', `[outa]`, 'output.mp4');

      // await ffmpeg.run('-i', 'tmp0.mp4', '-i', 'tmp1.mp4', '-filter_complex', '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]',
      //                  '-map', `[outv]`, '-map', `[outa]`, 'output.mp4');

//         ffmpeg -i input1.mp4 -i input2.webm -i input3.mov \
//            -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0][2:v:0][2:a:0]concat=n=3:v=1:a=1[outv][outa]" \
//            -map "[outv]" -map "[outa]" output.mkv

      // await ffmpeg.run('-i', `concat:${inputPaths.join('|')}`, '-c', 'copy', 'intermediate_all.mpg');
      // await ffmpeg.run('-i', 'intermediate_all.mpg', '-qscale:v', '2', 'output.mp4');
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
      
      progressBar.ldBar.set(100)
      elm.style.display = 'block'
      elm.innerText = 'Render new'
      downloadHref.style.display = 'block';
      downloadHref.href = imageUrl
      downloadHref.download = document.querySelector('.preview-input-title').value
      
      delete ffmpeg;
    }

    elm.addEventListener("click", transcode)
    
  })
  
}