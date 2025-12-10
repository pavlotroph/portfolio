import React, { useState, useRef, useEffect } from 'react';
import {
  ImageDescription,
  VideoPreview,
  // WorkSpannImage,
  WorkItemContainer,
  PreviewLayer,
  OriginalLayer,
  HoverGradient
} from '../../pages/Work/Work.styled';
import Loading from '../../assets/video/logo_animated_hq.webm';
import { WorkItemData } from '../../pages/Work/Work';

interface WorkItemComponentProps {
  work: WorkItemData;
  source: 'work' | 'photo';
}

const WorkItemComponent: React.FC<WorkItemComponentProps> = ({ work, source }) => {
    const bucket = source === 'work' 
    ? 'work-images' 
    : 'photography-images';
  
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isOriginalLoaded, setIsOriginalLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
  const img = new Image();
  img.src = previewSrc;
  img.onload = () => {
    setIsLoading(false);
  };
  img.onerror = () => {
    console.error('Failed to load preview image:', previewSrc);
    setIsLoading(false);
  };
}, [previewSrc]); // 👈 no src / isVideo deps


  useEffect(() => {
    if (isHovered && isVideo && !isVimeo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    } else if ((!isHovered || isVimeo) && isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, isVideo, isVimeo]);

  const showHoverVideoLoader =
  isHovered && (isVideo || isVimeo) && !isVideoReady;

  const showLoaderOverlay = isLoading || showHoverVideoLoader;

  const handleMouseEnter = () => {
  setIsHovered(true);
};

const handleMouseLeave = () => {
  setIsHovered(false);
  setIsVideoReady(false); // 👈 reset for the next hover
};
  
  return (
    <WorkItemContainer
     onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    className="work-item"
  >
    {/* 🔹 Loader overlay while preview is loading */}
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
    src={Loading}
    autoPlay
    loop
    muted
    playsInline
    aria-label="Loading animation"
    style={{ width: '100px', height: '100px' }}
  />
</div>
      {/* Base layer – preview stays visible once loaded */}
<PreviewLayer
  $isVisible={!isLoading}
  $imageUrl={previewSrc}
>
  <img
    src={previewSrc}
    alt={title || `Preview image for ${work.title || 'work item'}`}
    loading="lazy"
  />
</PreviewLayer>

{/* Hover layer – original fades in/out on hover */}
{!isVideo && !sameStaticImage && (
  <OriginalLayer $isVisible={isHovered && isOriginalLoaded}>
    <img
      src={src}
      alt={title || `Full image for ${work.title || 'work item'}`}
      loading="eager"
      onLoad={() => setIsOriginalLoaded(true)}
    />
  </OriginalLayer>
)}
      
      {/* Шар для відео (завжди в DOM для відео) */}
{(isVideo || isVimeo) && (
  <VideoPreview $isVisible={isHovered}>
    {isVimeo ? (
      <iframe
        src={`https://player.vimeo.com/video/${vimeo_id}?autoplay=1&muted=1&loop=1&background=1`}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || `Video player for ${work.title || 'work item'}`}
        aria-label={title || `Video player for ${work.title || 'work item'}`}
      />
    ) : (
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        preload="auto"
        playsInline
        disablePictureInPicture
        aria-label={title || `Video preview for ${work.title || 'work item'}`}
        onPlaying={() => setIsVideoReady(true)}
      />
    )}
  </VideoPreview>
)}

{/* Прозорий градієнт поверх зображення при наведенні (тільки для статичних зображень) */}
      <HoverGradient $isVisible={isHovered} />

      {/* Заголовок (завжди присутній, але з анімацією) */}
      <ImageDescription
  $isVisible={
    isHovered &&
    (
      (!isVideo && !isVimeo) || // images: show immediately
      isVideoReady              // video: wait until ready
    )
  }
>
  {title}
</ImageDescription>
    </WorkItemContainer>
  );
};

export default WorkItemComponent;