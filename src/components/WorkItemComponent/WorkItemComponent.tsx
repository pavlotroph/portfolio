import React, { useEffect, useRef, useState } from 'react';
import {
  ImageDescription,
  VideoPreview,
  WorkItemContainer,
  PreviewLayer,
  OriginalLayer,
  HoverGradient
} from '../../pages/Work/Work.styled';
import LoadingWebm from '../../assets/video/logo_animated_hq.webm';
import LoadingMp4 from '../../assets/video/logo.mp4';
import { WorkItemData } from '../../pages/Work/Work';

interface WorkItemComponentProps {
  work: WorkItemData;
  source: 'work' | 'photo';
  priority?: boolean;
}

const WorkItemComponent: React.FC<WorkItemComponentProps> = ({
  work,
  source,
  priority = false,
}) => {
  const bucket = source === 'work' ? 'work-images' : 'photography-images';

  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isOriginalLoaded, setIsOriginalLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(priority);
  const [hasActivatedHoverMedia, setHasActivatedHoverMedia] = useState(false);

  const itemRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingVideoRef = useRef<HTMLVideoElement>(null);

  const { folder, image_name, title, preview_url, vimeo_id } = work;
  const isVimeo = Boolean(vimeo_id);

  const src = `https://isglxygpyiuszrsqfttp.supabase.co/storage/v1/object/public/${bucket}/${folder}/${image_name}`;
  const isVideo = image_name.toLowerCase().endsWith('.mp4');

  const getPreviewUrl = () => {
    if (!preview_url) return src;
    return preview_url.startsWith('http')
      ? preview_url
      : `https://isglxygpyiuszrsqfttp.supabase.co/storage/v1/object/public/${bucket}/${folder}/${preview_url}`;
  };

  const previewSrc = getPreviewUrl();
  const sameStaticImage = !isVideo && previewSrc === src;

  useEffect(() => {
    if (priority) {
      setIsNearViewport(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

    const node = itemRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '350px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isNearViewport) return;
    setIsLoading(true);
  }, [isNearViewport, previewSrc]);

  useEffect(() => {
    if (!hasActivatedHoverMedia) return;

    if (isHovered && isVideo && !isVimeo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Video play interrupted:', error);
        }
      });
    } else if ((!isHovered || isVimeo) && isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  }, [hasActivatedHoverMedia, isHovered, isVideo, isVimeo]);

  const showHoverVideoLoader =
    isHovered && (isVideo || isVimeo) && hasActivatedHoverMedia && !isVideoReady;

  const showLoaderOverlay = (isNearViewport && isLoading) || showHoverVideoLoader;

  useEffect(() => {
    if (showLoaderOverlay && loadingVideoRef.current) {
      loadingVideoRef.current.play().catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Loading video play error:', error);
        }
      });
    }
  }, [showLoaderOverlay]);

  const handleMouseEnter = () => {
    setIsHovered(true);

    if (isVideo || isVimeo) {
      setHasActivatedHoverMedia(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (isVideo && !isVimeo) {
      setIsVideoReady(false);
    }
  };

  const shouldLoadOriginalImage =
    !isVideo && !sameStaticImage && (isHovered || isOriginalLoaded);

  return (
    <WorkItemContainer
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="work-item"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          zIndex: 900,
          opacity: showLoaderOverlay ? 1 : 0,
          pointerEvents: showLoaderOverlay ? 'auto' : 'none',
          transition: 'opacity 0.6s ease-in-out',
        }}
      >
        <video
          ref={loadingVideoRef}
          loop
          muted
          playsInline
          aria-label="Loading animation"
          style={{ width: '100px', height: '100px' }}
        >
          <source src={LoadingWebm} type="video/webm" />
          <source src={LoadingMp4} type="video/mp4" />
        </video>
      </div>

      <PreviewLayer $isVisible={isNearViewport && !isLoading} $imageUrl={previewSrc}>
        <img
          src={isNearViewport ? previewSrc : undefined}
          alt={title || `Preview image for ${work.title || 'work item'}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            console.error('Failed to load preview image:', previewSrc);
            setIsLoading(false);
          }}
        />
      </PreviewLayer>

      {!isVideo && !sameStaticImage && (
        <OriginalLayer $isVisible={isHovered && isOriginalLoaded}>
          <img
            src={shouldLoadOriginalImage ? src : undefined}
            alt={title || `Full image for ${work.title || 'work item'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsOriginalLoaded(true)}
          />
        </OriginalLayer>
      )}

      {(isVideo || isVimeo) && (
        <VideoPreview $isVisible={isHovered}>
          {isVimeo ? (
            hasActivatedHoverMedia ? (
              <iframe
                src={`https://player.vimeo.com/video/${vimeo_id}?autoplay=1&muted=1&loop=1&background=1`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={title || `Video player for ${work.title || 'work item'}`}
                aria-label={title || `Video player for ${work.title || 'work item'}`}
                onLoad={() => setIsVideoReady(true)}
              />
            ) : null
          ) : (
            <video
              ref={videoRef}
              src={hasActivatedHoverMedia ? src : undefined}
              muted
              loop
              preload={isHovered ? 'auto' : 'none'}
              playsInline
              disablePictureInPicture
              aria-label={title || `Video preview for ${work.title || 'work item'}`}
              onCanPlay={() => setIsVideoReady(true)}
              onPlaying={() => setIsVideoReady(true)}
            />
          )}
        </VideoPreview>
      )}

      <HoverGradient $isVisible={isHovered} />

      <ImageDescription
        $isVisible={
          isHovered &&
          (
            (!isVideo && !isVimeo) ||
            isVideoReady
          )
        }
      >
        {title}
      </ImageDescription>
    </WorkItemContainer>
  );
};

export default WorkItemComponent;
