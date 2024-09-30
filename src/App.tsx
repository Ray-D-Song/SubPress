import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import '@/utils/i18n'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { FileVideo, Captions, Check, X, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import useFFmpeg from "./utils/ffmpeg"

export default function Component() {
  const { t } = useTranslation()
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [uploadedSubtitle, setUploadedSubtitle] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDropVideo = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedVideo(acceptedFiles[0])
    }
  }, [])

  const onDropSubtitle = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedSubtitle(acceptedFiles[0])
    }
  }, [])

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({
    onDrop: onDropVideo,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    multiple: false
  })

  const { getRootProps: getSubtitleRootProps, getInputProps: getSubtitleInputProps, isDragActive: isSubtitleDragActive } = useDropzone({
    onDrop: onDropSubtitle,
    accept: {
      'text/plain': ['.srt', '.vtt']
    },
    multiple: false
  })


  const handleBurn = async () => {
    if (!uploadedVideo || !uploadedSubtitle) {
      return
    }

    setIsProcessing(true)
    setProgress(0)

    const burnedVideo = await useFFmpeg(uploadedVideo, uploadedSubtitle, {
      onProgress: (progress) => {
        setProgress(progress)
      },
      onTip: (tip) => {
        console.warn(tip)
      }
    })
    if (burnedVideo) {
      const url = URL.createObjectURL(burnedVideo)
      const a = document.createElement('a')
      a.href = url
      a.download = `${uploadedVideo.name.replace(`.${uploadedVideo.name.split('.').pop()}`, '')}-burned.${uploadedVideo.name.split('.').pop()}`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      console.error('Failed to burn subtitles')
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-8">
      <Button
        onClick={() => {
          i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')
        }}
        className='absolute top-10 right-10 bg-blue-600 hover:bg-blue-700'
      >
        <Languages className="h-6 w-6" />
      </Button>

      <div className="max-w-3xl mx-auto space-y-4 mt-32">
        <h1 className="text-3xl font-bold text-center">{t('title')}</h1>
        <h3 className="text-lg text-center">{t('description')}</h3>
        
        <div 
          {...getVideoRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isVideoDragActive ? "border-blue-500 bg-blue-500 bg-opacity-10" : "border-gray-700 hover:border-gray-600"
          }`}
        >
          <input {...getVideoInputProps()} />
          {uploadedVideo ? (
            <div className="flex items-center justify-center space-x-2">
              <Check className="text-green-500" />
              <span>{uploadedVideo.name}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setUploadedVideo(null)
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
              <p>{t('dropVideoHere')}</p>
              <p className="text-sm text-gray-500">{t('supportedVideoFormats')}</p>
            </div>
          )}
        </div>

        <div 
          {...getSubtitleRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isSubtitleDragActive ? "border-blue-500 bg-blue-500 bg-opacity-10" : "border-gray-700 hover:border-gray-600"
          }`}
        >
          <input {...getSubtitleInputProps()} />
          {uploadedSubtitle ? (
            <div className="flex items-center justify-center space-x-2">
              <Check className="text-green-500" />
            <span>{uploadedSubtitle.name}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setUploadedSubtitle(null)
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove subtitle file</span>
            </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Captions className="mx-auto h-12 w-12 text-gray-400" />
              <p>{t('dropSubtitleHere')}</p>
              <p className="text-sm text-gray-500">{t('supportedSubtitleFormats')}</p>
            </div>
          )}
        </div>

        <div className="relative">
          <Button 
            onClick={handleBurn} 
            className='w-full bg-white hover:bg-gray-100 text-black disabled:bg-gray-200 disabled:text-gray-500 relative overflow-hidden' 
            disabled={!uploadedVideo || !uploadedSubtitle || isProcessing}
          >
            <span className="relative z-10">
              {isProcessing ? `${progress.toFixed(0)}%` : t('burnSubtitles')}
            </span>
            {isProcessing && (
              <div 
                className="absolute inset-0 bg-blue-500"
                style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
              />
            )}
          </Button>
        </div>
      </div>
      <footer className="text-center text-sm text-gray-500 fixed bottom-4 w-full">
        <p>
          <a href="https://subpress.jenrays.com" target="_blank" rel="noopener noreferrer">SubPress</a>
        </p>
        <p>
          &copy; {new Date().getFullYear()} Ray-D-Song. {t('allRightsReserved')}
        </p>
      </footer>
    </div>
  )
}