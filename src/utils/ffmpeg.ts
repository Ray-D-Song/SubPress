import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

async function useFFmpeg(video: File, subtitle: File, {
  onProgress,
  onTip,
}: {
  onProgress: (progress: number) => void
  onTip: (tip: string) => void
}) {
  let data: File | null = null
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
  const ffmpeg = new FFmpeg()

  try {
    ffmpeg.on('progress', ({progress}) => {
      onProgress(progress * 100)
    })
    ffmpeg.on('log', ({message}) => {
      console.log(message)
    })

    onTip('loading ffmpeg')
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
    onTip('ffmpeg core js loaded')
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    onTip('ffmpeg wasm loaded')

    await ffmpeg.load({
      coreURL,
      wasmURL,
    })
    onTip('writing video and subtitle to ffmpeg')
    const videoBuffer = new Uint8Array(await video.arrayBuffer())
    const subtitleBuffer = new Uint8Array(await subtitle.arrayBuffer())
    await ffmpeg.writeFile(video.name, videoBuffer)
    await ffmpeg.writeFile(subtitle.name, subtitleBuffer)
    const res = await fetch('/Yahei.ttf')
    if (!res.ok) {
      throw new Error('Failed to load font')
    }
    const fontBuffer = await res.arrayBuffer()
    await ffmpeg.writeFile('/tmp/yahei', new Uint8Array(fontBuffer))
    const videoExt = video.name.split('.').pop()
    const outputFileName = `${video.name.replace(`.${videoExt}`, '')}-burned.${videoExt}`
    onTip('executing ffmpeg')
    await ffmpeg.exec([
      '-i', `${video.name}`,
      '-i', `${subtitle.name}`,
      '-vf', `subtitles=${subtitle.name}:fontsdir=/tmp:force_style='Fontname=Microsoft YaHei,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Bold=0,Italic=0,Underline=0,StrikeOut=0'`,
      outputFileName
    ])
    // ,Fontsize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Bold=0,Italic=0,Underline=0,StrikeOut=0
    const f = await ffmpeg.readFile(outputFileName)
    data = new File([f], outputFileName, { type: `video/${videoExt}` })
  } catch (error) {
    console.error(error)
    onTip('failed to burn subtitles')
  }
  return data
}

export default useFFmpeg