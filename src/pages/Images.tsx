import React, { useState, useRef } from 'react'
import { Image as ImageIcon, X, FileImage, Download } from 'lucide-react'

const ImagesConverter = () => {
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFormat, setSelectedFormat] = useState<string>('png')
  const [selectedQuality, setSelectedQuality] = useState<string>('original')
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
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff']
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || ''
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Unsupported file format! Please upload a valid image file.')
      return
    } 
    setFile(selectedFile)
    
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    
    setImagePreview(URL.createObjectURL(selectedFile))
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
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
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
          const convertedSize = Math.floor(file.size * (selectedQuality === 'high' ? 0.9 : selectedQuality === 'medium' ? 0.7 : selectedQuality === 'low' ? 0.5 : 1.0))
          
          setOutputFile({
            name: convertedName,
            size: convertedSize,
            url: imagePreview || '',
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
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          accept=".png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff" 
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
                ? 'border-indigo-500 bg-indigo-50/50 shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-350 hover:bg-slate-50'
            }`}
          >
            <div className="p-6 bg-white rounded-full border border-slate-100 text-indigo-600 shadow-sm">
              <ImageIcon className="w-14 h-14" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-lg">Drag & drop your image here</p>
              <p className="text-base text-slate-500 mt-2">or click to browse your files</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[340px]">
              {['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'BMP', 'TIFF'].map(ext => (
                <span key={ext} className="text-xs px-2 py-1 bg-white text-slate-500 rounded-md border border-slate-200 font-semibold shadow-xs">
                  {ext}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 flex-grow">
            <div className="relative rounded-[16px] overflow-hidden bg-slate-100 border border-slate-250/60 aspect-video flex items-center justify-center shadow-inner">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
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
                <span className="text-indigo-600 uppercase font-extrabold">{file.name.split('.').pop()}</span>
              </div>
            </div>

            <button
              onClick={clearFile}
              className="w-full mt-auto py-3.5 rounded-2xl text-sm font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <X className="w-4 h-4" />
              Remove Image
            </button>
          </div>
        )}
      </div>

      {/* Middle Column: Transcode Settings */}
      <div className="bg-white border border-slate-200 rounded-[24px] p-10 flex flex-col shadow-xl shadow-slate-100/50 h-fit">
        <div className="grid grid-cols-2 gap-5 my-auto">
          {/* Column 1: Target Format */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-400 tracking-wider uppercase">
              Target Format
            </label>
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full appearance-none py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer shadow-sm pr-10"
              >
                {['PNG', 'JPG', 'WEBP', 'GIF', 'BMP'].map((fmt) => (
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

          {/* Column 2: Quality */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-400 tracking-wider uppercase">
              Quality
            </label>
            <div className="relative">
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="w-full appearance-none py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer shadow-sm pr-10"
              >
                {['Original', 'High', 'Medium', 'Low'].map((q) => (
                  <option key={q.toLowerCase()} value={q.toLowerCase()}>
                    {q}
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
        {!outputFile ? (
          <div className="border border-slate-150 rounded-xl bg-slate-50/40 p-8 flex flex-col items-center justify-center text-center flex-grow min-h-[460px]">
            <FileImage className="w-14 h-14 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-400">Waiting for conversion...</p>
            <p className="text-sm text-slate-400/80 mt-2 max-w-[240px]">Your converted image file will appear here for download.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 flex-grow">
            {/* Converted media preview */}
            <div className="relative rounded-[16px] overflow-hidden bg-slate-100 border border-slate-250/60 aspect-video flex items-center justify-center shadow-inner">
              {outputFile.url && (
                <img src={outputFile.url} alt="Converted output" className="w-full h-full object-contain" />
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

export default ImagesConverter
