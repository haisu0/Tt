"use client"

import { useState, useEffect, useRef } from "react"
import {
  Download,
  Play,
  Music,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

interface TikTokData {
  status: boolean
  title: string
  taken_at: string
  region: string
  id: string
  duration: string
  cover: string
  data: Array<{
    type: string
    url: string
  }>
  music_info: {
    id: string
    title: string
    author: string
    url: string
  }
  stats: {
    views: string
    likes: string
    comment: string
    share: string
    download: string
  }
  author: {
    id: string
    fullname: string
    nickname: string
    avatar: string
  }
}

export default function TikTokDownloader() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TikTokData | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Auto fullscreen on load
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (error) {
        console.log("Fullscreen not supported or denied")
      }
    }

    // Try to enter fullscreen after a short delay
    const timer = setTimeout(enterFullscreen, 1000)

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      toast({
        title: "Fullscreen Error",
        description: "Unable to toggle fullscreen mode",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a TikTok URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
        toast({
          title: "Success!",
          description: "TikTok content loaded successfully",
        })
      } else {
        throw new Error(result.error || "Failed to fetch content data")
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Download Started",
        description: "File download has begun",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download file",
        variant: "destructive",
      })
    }
  }

  const toggleAudio = () => {
    if (audioRef.current) {
      if (playingAudio) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setPlayingAudio(!playingAudio)
    }
  }

  const handleVideoPlay = (videoId: string) => {
    setPlayingVideo(videoId)
  }

  const handleVideoPause = () => {
    setPlayingVideo(null)
  }

  const photos = data?.data.filter((item) => item.type === "photo") || []
  const videos = data?.data.filter((item) => item.type !== "photo") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Button
        onClick={toggleFullscreen}
        className="fixed top-4 left-4 z-50 bg-black/50 hover:bg-black/70 border border-red-500/50 text-red-400 hover:text-red-300 p-2"
        size="sm"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </Button>

      {/* Creator Credit */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://instagram.com/al_azet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black/50 hover:bg-black/70 border border-cyan-500/50 text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm"
        >
          <ExternalLink size={16} />
          <span className="text-sm font-medium">Created by AL AZET</span>
        </a>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
            TikTok
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Downloader</h2>
          <p className="text-gray-400 text-base md:text-lg">Download TikTok videos and photos without watermark</p>
        </div>

        {/* Download Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="url"
                  placeholder="Paste TikTok URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                  onKeyPress={(e) => e.key === "Enter" && handleDownload()}
                />
                <Button
                  onClick={handleDownload}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-8 py-2 min-w-[120px]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download size={18} />
                      Download
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {data && (
          <div className="max-w-6xl mx-auto space-y-8">
            {data.music_info && (
              <Card className="bg-black/40 border-pink-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Music className="w-6 h-6 text-pink-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{data.music_info.title}</h3>
                        <p className="text-gray-400 text-sm">{data.music_info.author}</p>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-3">
                      {data.music_info.url && (
                        <>
                          <audio
                            ref={audioRef}
                            src={data.music_info.url}
                            onEnded={() => setPlayingAudio(false)}
                            className="hidden"
                          />
                          <Button
                            onClick={toggleAudio}
                            className="bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/50 text-pink-400"
                            size="sm"
                          >
                            {playingAudio ? <Pause size={16} /> : <Play size={16} />}
                          </Button>
                          <Button
                            onClick={() => downloadFile(data.music_info.url, `music_${data.music_info.id}.mp3`)}
                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                            size="sm"
                          >
                            <Download size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {videos.length > 0 && (
              <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Play className="w-6 h-6 text-cyan-400" />
                    Videos
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video, index) => (
                      <div key={index} className="space-y-4">
                        <div className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden">
                          <video
                            src={video.url}
                            poster={playingVideo === `video-${index}` ? undefined : data.cover}
                            className="w-full h-full object-cover"
                            controls
                            onPlay={() => handleVideoPlay(`video-${index}`)}
                            onPause={handleVideoPause}
                            onEnded={handleVideoPause}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-sm font-medium text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full">
                              {video.type === "watermark"
                                ? "With Watermark"
                                : video.type === "nowatermark"
                                  ? "Standard Quality"
                                  : "HD Quality"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(video.url)}
                              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <Copy size={14} className="mr-2" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => downloadFile(video.url, `tiktok_${data.id}_${video.type}.mp4`)}
                              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                            >
                              <Download size={14} className="mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {photos.length > 0 && (
              <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-green-400" />
                    Photos ({photos.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="space-y-3">
                        <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
                          <img
                            src={photo.url || "/placeholder.svg"}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(photo.url)}
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <Copy size={14} className="mr-2" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadFile(photo.url, `tiktok_photo_${data.id}_${index + 1}.jpg`)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            <Download size={14} className="mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Info */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title and Author */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{data.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {data.taken_at} • {data.duration}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
                      <img
                        src={data.author.avatar || "/placeholder.svg"}
                        alt={data.author.nickname}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-white">{data.author.nickname}</p>
                        <p className="text-gray-400 text-sm">@{data.author.fullname}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Views</p>
                        <p className="font-semibold text-white">{data.stats.views}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg">
                      <Heart className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-sm text-gray-400">Likes</p>
                        <p className="font-semibold text-white">{data.stats.likes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Comments</p>
                        <p className="font-semibold text-white">{data.stats.comment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg">
                      <Share className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Shares</p>
                        <p className="font-semibold text-white">{data.stats.share}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
