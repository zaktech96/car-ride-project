import { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { MotionDiv } from "~/lib/safe-framer-motion";

interface VideoDemoProps {
  // Support multiple video sources
  videoSrc?: string; // Self-hosted video URL
  youtubeId?: string; // YouTube video ID
  vimeoId?: string; // Vimeo video ID
  thumbnailSrc?: string; // Custom thumbnail
  title?: string;
  description?: string;
}

export default function VideoDemo({
  videoSrc,
  youtubeId,
  vimeoId,
  thumbnailSrc,
  title = "See How It Works",
  description = "Watch our product demo to see how easy it is to book your ride in Saudi Arabia.",
}: VideoDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine video source
  const getVideoSource = () => {
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=0&controls=1&modestbranding=1&rel=0`;
    }
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=0&controls=1`;
    }
    return videoSrc;
  };

  const hasEmbeddedVideo = youtubeId || vimeoId;
  const videoSource = getVideoSource();

  const togglePlay = async () => {
    console.log("togglePlay called, isPlaying:", isPlaying, "videoRef:", videoRef.current);
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          // Ensure video is ready
          if (videoRef.current.readyState < 2) {
            videoRef.current.load();
          }
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsPlaying(true);
          }
        }
      } catch (error) {
        console.error("Error playing video:", error);
        // If autoplay fails, try with muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          try {
            await videoRef.current.play();
            setIsPlaying(true);
          } catch (err) {
            console.error("Failed to play video even when muted:", err);
          }
        }
      }
    } else {
      console.warn("videoRef.current is null");
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        await videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Product Demo</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </MotionDiv>

        {/* Video Container */}
        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto relative"
          style={{ zIndex: 1, isolation: 'isolate' }}
        >
          <Card className="overflow-hidden border-border bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300 relative" style={{ zIndex: 1, isolation: 'isolate', position: 'relative' }}>
            <div className="relative aspect-video bg-muted overflow-hidden" style={{ zIndex: 1, isolation: 'isolate', position: 'relative' }}>
              {hasEmbeddedVideo ? (
                // YouTube or Vimeo embed
                <iframe
                  src={videoSource}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Product Demo Video"
                />
              ) : videoSrc ? (
                // Self-hosted video
                <>
                  <video
                    ref={videoRef}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = isMuted;
                      }
                    }}
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    poster={thumbnailSrc}
                    loop
                    preload="metadata"
                    playsInline
                    controls={false}
                  />
                  {/* Custom video controls overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 group" style={{ zIndex: 2, pointerEvents: 'none' }}>
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-3" style={{ zIndex: 3, pointerEvents: 'auto' }}>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="h-12 w-12 rounded-full bg-card/90 dark:bg-card/80 hover:bg-card text-foreground shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 backdrop-blur-sm border-2 border-border/50 relative"
                        style={{ pointerEvents: 'auto', zIndex: 4, position: 'relative' }}
                        type="button"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="h-10 w-10 rounded-full bg-card/90 dark:bg-card/80 hover:bg-card text-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 backdrop-blur-sm border border-border/50 relative"
                        style={{ pointerEvents: 'auto', zIndex: 4, position: 'relative' }}
                        type="button"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFullscreen();
                        }}
                        className="h-10 w-10 rounded-full bg-card/90 dark:bg-card/80 hover:bg-card text-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 backdrop-blur-sm border border-border/50 relative"
                        style={{ pointerEvents: 'auto', zIndex: 4, position: 'relative' }}
                        type="button"
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Play button overlay when paused - scoped to video container only */}
                  {!isPlaying && (
                    <>
                      {/* Background overlay - clickable but doesn't block button */}
                      <div 
                        className="absolute inset-0 bg-black/10 backdrop-blur-[1px] cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePlay();
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePlay();
                          }
                        }}
                        style={{ 
                          pointerEvents: 'auto', 
                          zIndex: 5, 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0
                        }}
                      />
                      {/* Play button - above overlay */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ zIndex: 10, position: 'absolute' }}
                      >
                        <Button
                          size="lg"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePlay();
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePlay();
                          }}
                          className="rounded-full w-24 h-24 bg-card/95 dark:bg-card/90 hover:bg-card text-foreground shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 border-4 border-border/60 backdrop-blur-sm group"
                          style={{ 
                            pointerEvents: 'auto', 
                            zIndex: 11, 
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                          type="button"
                        >
                          <Play className="w-10 h-10 ml-1.5 text-primary group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                        {/* Animated ring effect */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 9 }}>
                          <div className="w-24 h-24 rounded-full border-4 border-border/30 animate-ping"></div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                // Placeholder when no video is provided
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Video Demo Coming Soon
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Add your video URL, YouTube ID, or Vimeo ID to display the
                      product demo here.
                    </p>
                    <div className="mt-6 text-xs text-muted-foreground space-y-1">
                      <p>
                        <code className="bg-muted px-2 py-1 rounded">
                          videoSrc="/path/to/video.mp4"
                        </code>
                      </p>
                      <p>or</p>
                      <p>
                        <code className="bg-muted px-2 py-1 rounded">
                          youtubeId="dQw4w9WgXcQ"
                        </code>
                      </p>
                      <p>or</p>
                      <p>
                        <code className="bg-muted px-2 py-1 rounded">
                          vimeoId="123456789"
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Features Callout */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                title: "Easy Booking",
                description:
                  "Book your ride in seconds with our intuitive interface",
              },
              {
                title: "Real-Time Pricing",
                description: "See transparent pricing before you book",
              },
              {
                title: "Track Your Ride",
                description: "Monitor your driver's location in real-time",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </MotionDiv>
        </MotionDiv>
      </div>
    </section>
  );
}
