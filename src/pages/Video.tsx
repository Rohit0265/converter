import React, { useState, useRef } from 'react'
import { Video, X, FileVideo, Music, Download } from 'lucide-react'

const VideoConverter = () => {
  const [file, setFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFormat, setSelectedFormat] = useState<string>('mp4')
  const [selectedResolution, setSelectedResolution] = useState<string>('original')
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [outputFile, setOutputFile] = useState<{ name: string; size: number; url: string; format: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Size Formatter
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle new file upload
  const handleFileChange = (selectedFile: File) => {
    const allowedExtensions = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'flv', 'wmv', 'mpeg', 'm4v'  ]
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || ''
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Unsupported file format! Please upload a valid video file.')
      return
    } 
    setFile(selectedFile)
    
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    
    // Only set video preview if it is a video file, otherwise set null
    if (selectedFile.type.startsWith('video/')) {
      setVideoPreview(URL.createObjectURL(selectedFile))
    } else {
      setVideoPreview(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const clearFile = () => {
    setFile(null)
    setIsConverting(false)
    setProgress(0)
    setOutputFile(null)
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
      setVideoPreview(null)
    }
  }

  const handleConvert = () => {
    if (!file) return
    setIsConverting(true)
    setProgress(0)
    setOutputFile(null)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsConverting(false)
          
          const convertedName = `${file.name.substring(0, file.name.lastIndexOf('.'))}_converted.${selectedFormat}`
          const convertedSize = Math.floor(file.size * (['mp3', 'm4a', 'aac', 'wav', 'flac'].includes(selectedFormat.toLowerCase()) ? 0.15 : selectedResolution === '1080p' ? 1.2 : selectedResolution === '720p' ? 0.8 : 0.5))
          
          setOutputFile({
            name: convertedName,
            size: convertedSize,
            url: videoPreview || '',
            format: selectedFormat
          })
          
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 w-full">
        {/* Left Column: Upload */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-10 flex flex-col shadow-xl shadow-slate-100/50">
          {/* <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Upload Your Video</h2>
          </div> */}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept=".mp4,.mov,.mkv,.avi,.webm,.flv,.wmv,.mpeg,.m4v,.mp3,.m4a,.aac,.wav,.flac" 
            className="hidden" 
          />

          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-[20px] p-10 flex flex-col items-center justify-center gap-6 cursor-pointer min-h-[460px] transition-all duration-300 ${
                isDragging 
                  ? 'border-cyan-500 bg-cyan-50/50 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-350 hover:bg-slate-50'
              }`}
            >
              <div className="p-6 bg-white rounded-full border border-slate-100 text-cyan-600 shadow-sm">
                <Video className="w-14 h-14" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 text-lg">Drag & drop your file here</p>
                <p className="text-base text-slate-500 mt-2">or click to browse your files</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[340px]">
                {['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'FLV', 'WMV', 'MPEG', 'M4V', 'MP3', 'M4A', 'AAC', 'WAV', 'FLAC'].map(ext => (
                  <span key={ext} className="text-xs px-2 py-1 bg-white text-slate-500 rounded-md border border-slate-200 font-semibold shadow-xs">
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 flex-grow">
              <div className="relative rounded-[16px] overflow-hidden bg-slate-100 border border-slate-250/60 aspect-video flex items-center justify-center shadow-inner">
                {videoPreview ? (
                  <video 
                    src={videoPreview} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-slate-400 gap-2">
                    <Music className="w-8 h-8 text-cyan-500" />
                    <span className="font-semibold text-xs">Audio File Loaded</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Filename</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[240px]">{file.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">File Size</span>
                  <span className="text-slate-700 font-bold">{formatSize(file.size)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Format</span>
                  <span className="text-cyan-600 uppercase font-extrabold">{file.name.split('.').pop()}</span>
                </div>
              </div>

              <button
                onClick={clearFile}
                className="w-full mt-auto py-3.5 rounded-2xl text-sm font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
                Remove Video
              </button>
            </div>
          )}
        </div>

        {/* Middle Column Placeholder */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-10 flex flex-col shadow-xl shadow-slate-100/50 h-fit">
          {/* <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <Film className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Transcode Settings</h2>
          </div> */}
          
          <div className="grid grid-cols-2 gap-5 my-auto">
            {/* Column 1: Target Format */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 tracking-wider uppercase">
                Quality Format
              </label>
              <div className="relative">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full appearance-none py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer shadow-sm pr-10"
                >
                  {['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'FLV', 'WMV', 'MPEG', 'M4V', 'MP3', 'M4A', 'AAC', 'WAV', 'FLAC'].map((fmt) => (
                    <option key={fmt.toLowerCase()} value={fmt.toLowerCase()}>
                      {fmt}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Column 2: Resolution */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 tracking-wider uppercase">
                Resolution
              </label>
              <div className="relative">
                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  disabled={['mp3', 'm4a', 'aac', 'wav', 'flac'].includes(selectedFormat.toLowerCase())}
                  className="w-full appearance-none py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer shadow-sm pr-10 disabled:opacity-30 disabled:bg-slate-50/20 disabled:cursor-not-allowed"
                >
                  {['Original', '1080p', '720p', '480p'].map((res) => (
                    <option key={res.toLowerCase()} value={res.toLowerCase()}>
                      {res}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Convert Button & Progress Section */}
            <div className="col-span-2 mt-6 pt-3 flex flex-col gap-4">
              {isConverting && (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Uploading file...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleConvert}
                disabled={isConverting || !file}
                className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  isConverting
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    : !file
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-100 hover:shadow-lg hover:shadow-violet-200/50 active:scale-[0.98]'
                }`}
              >
                {isConverting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Converting...
                  </>
                ) : (
                  'Convert File'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output Sandbox */}
        <div className={`bg-white border border-slate-200 rounded-[24px] p-10 flex flex-col shadow-xl shadow-slate-100/50 transition-all duration-300 ${!outputFile ? 'opacity-60' : ''}`}>
          {/* <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <FileVideo className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Output Sandbox</h2>
          </div> */}

          {!outputFile ? (
            <div className="border border-slate-150 rounded-xl bg-slate-50/40 p-8 flex flex-col items-center justify-center text-center flex-grow min-h-[460px]">
              <FileVideo className="w-14 h-14 text-slate-300 mb-3" />
              <p className="text-base font-semibold text-slate-400">Waiting for conversion...</p>
              <p className="text-sm text-slate-400/80 mt-2 max-w-[240px]">Your converted video or audio file will appear here for download.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 flex-grow">
              {/* Converted media preview */}
              <div className="relative rounded-[16px] overflow-hidden bg-slate-100 border border-slate-250/60 aspect-video flex items-center justify-center shadow-inner">
                {['mp3', 'm4a', 'aac', 'wav', 'flac'].includes(outputFile.format.toLowerCase()) ? (
                  <div className="flex flex-col items-center justify-center p-6 text-slate-400 gap-2">
                    <Music className="w-10 h-10 text-emerald-500" />
                    <span className="font-semibold text-sm">Audio File Ready</span>
                  </div>
                ) : outputFile.url ? (
                  <video 
                    src={outputFile.url} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-slate-400 gap-2">
                    <Video className="w-10 h-10 text-emerald-500" />
                    <span className="font-semibold text-sm">Video File Ready</span>
                  </div>
                )}
              </div>

              {/* Converted media details */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Filename</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[240px]">{outputFile.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">File Size</span>
                  <span className="text-slate-700 font-bold">{formatSize(outputFile.size)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Format</span>
                  <span className="text-emerald-600 uppercase font-extrabold">{outputFile.format}</span>
                </div>
              </div>

              {/* Download Button */}
              <a
                href={outputFile.url}
                download={outputFile.name}
                className="w-full mt-auto py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                Download File
              </a>
            </div>
          )}
      </div>
    </div>
  )
}

export default VideoConverter