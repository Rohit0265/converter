import { useState } from 'react'
import VideoConverter from './pages/Video'
import MusicConverter from './pages/Music'
import ImagesConverter from './pages/Images'
import { Video, Music, Image as ImageIcon } from 'lucide-react'

const App = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'music' | 'images'>('video')

  return (
    <main className="min-h-screen bg-green-50 text-slate-800 flex flex-col items-center py-12 px-4 relative overflow-hidden transition-all duration-500">
      {/* Background glow graphics */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-violet-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[130px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="w-full max-w-[1400px] mb-14 flex flex-col md:flex-row justify-between items-center gap-6 px-4 z-20">
        <div className="text-center md:text-left">
          <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            VORTEX CONVERTER
          </h1>
          <p className="text-slate-500 text-lg mt-4 font-medium transition-all duration-300">
            {activeTab === 'video' && 'Transcode and optimize your videos directly in your browser.'}
            {activeTab === 'music' && 'Transcode and optimize your music and audio files directly.'}
            {activeTab === 'images' && 'Convert and compress your image formats in seconds.'}
          </p>
        </div>

        {/* Tab Buttons (Routing without site params) */}
        <div className="flex bg-slate-200/40 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-inner">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5 ${
              activeTab === 'video'
                ? 'bg-white text-slate-800 shadow-md border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5 ${
              activeTab === 'music'
                ? 'bg-white text-slate-800 shadow-md border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            Music
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5 ${
              activeTab === 'images'
                ? 'bg-white text-slate-800 shadow-md border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Images
          </button>
        </div>
      </header>

      {/* Main dashboard content container wrapper */}
      <div className="w-full max-w-[1400px] bg-white border border-slate-200 rounded-[40px] p-10 md:p-12 shadow-2xl shadow-slate-200/40 z-10">
        {activeTab === 'video' && <VideoConverter />}
        {activeTab === 'music' && <MusicConverter />}
        {activeTab === 'images' && <ImagesConverter />}
      </div>
    </main>
  )
}

export default App