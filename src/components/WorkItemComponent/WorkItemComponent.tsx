import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

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
    // Завантажуємо прев'ю
    const img = new Image();
    img.src = previewSrc;
    img.onload = () => {
      setIsLoading(false);
      
      // Попередньо завантажуємо оригінал
      if (!isVideo) {
        const originalImg = new Image();
        originalImg.src = src;
        originalImg.onload = () => setIsOriginalLoaded(true);
        originalImg.onerror = () => console.error('Failed to preload original image:', src);
      }
    };
    img.onerror = () => {
      console.error('Failed to load preview image:', previewSrc);
      setIsLoading(false);
    };
  }, [previewSrc, src, isVideo]);

  useEffect(() => {
    if (isHovered && isVideo && !isVimeo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    } else if ((!isHovered || isVimeo) && isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, isVideo, isVimeo]);

  const handleClick = () => {
    const base = source === 'work' ? '/work' : '/photography';
    navigate(`${base}/${work.id}`);
  };

  return (
    <WorkItemContainer
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    onClick={handleClick}
    className="work-item"
    role="button"
    tabIndex={0}
    aria-label={`View ${title || 'work item'}`}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    }}
  >
    {/* 🔹 Loader overlay while preview is loading */}
    {isLoading && (
      <div
  style={{
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    zIndex: 900, // higher than gradients/text
    opacity: isLoading ? 1 : 0,
    pointerEvents: isLoading ? 'auto' : 'none',
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
    style={{ width: '80px', height: '80px' }}
  />
</div>
    )}
      {/* Базовий шар - прев'ю */}
      <PreviewLayer
        $isVisible={!isLoading && (sameStaticImage ? true : !isHovered)}
        $imageUrl={previewSrc}
      >
        <img
          src={previewSrc}
          alt={title || `Preview image for ${work.title || 'work item'}`}
          loading="eager"
        />
      </PreviewLayer>

      {/* Шар для зображень (показується при наведенні) */}
      {!isVideo && !sameStaticImage && (
        <OriginalLayer $isVisible={isHovered && isOriginalLoaded}>
          <img
            src={src}
            alt={title || `Full image for ${work.title || 'work item'}`}
            loading={isOriginalLoaded ? 'eager' : 'lazy'}
          />
        </OriginalLayer>
      )}
      
      {/* Шар для відео (показується при наведенні) */}
      {isHovered && (isVideo || isVimeo) && (
  <VideoPreview $isVisible={isHovered} $imageUrl={previewSrc}>
    {isVimeo ? (
      <iframe
        src={`https://player.vimeo.com/video/${vimeo_id}?autoplay=1&muted=1&loop=1&background=1`}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || `Video player for ${work.title || 'work item'}`}
        aria-label={title || `Video player for ${work.title || 'work item'}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: 1,
        }}
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
      />
    )}
  </VideoPreview>
)}

{/* Прозорий градієнт поверх зображення при наведенні (тільки для статичних зображень) */}
      <HoverGradient
        $isVisible={isHovered && !isVideo && !isVimeo}
      />

      {/* Заголовок (завжди присутній, але з анімацією) */}
      <ImageDescription $isVisible={isHovered}>
        {title}
      </ImageDescription>
    </WorkItemContainer>
  );
};

export default WorkItemComponent;