import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Modal, {
  MODAL_TITLE,
  MODAL_DESCRIPTION,
  CloseButton,
  MediaContainer,
  TextContainer,
} from '../Modal/Modal';
import Loading from '../../assets/video/logo_animated_hq.webm';
import { supabase, supabaseUrl } from '../../supabaseClient';

import CloseIcon from '../../assets/icons/c_cross.svg?react';
import Left from '../../assets/icons/icon_left.svg';
import Right from '../../assets/icons/icon_right.svg';
import { Reveal } from '../../pages/Reveal/Reveal';

import {
  IMAGE_GALLERY,
  SliderWrapper,
  SliderContent,
  Slide,
  Arrow,
  COLLECTION_TEXT_TITLE_WRAPPER,
  COLLECTION_TEXT_TITLE,
  COLLECTION_1SEC_TITLE,
  COLLECTION_1SEC_DESCRIPTION,
  CollectionContainer,
  CollectionHeader,
  CollectionBlock,
  TextBlock,
  CollectionWrapper,
  CollectionAdditionalWrapper,
  COLLECTION_4SEC_TITLE,
  COLLECTION_4SEC_DESCRIPTION,
  CollectionTextWrapper,
  ImageBlock,
  WorkTextFilter,
  WorkFilterWrapp,
  WorkTitelContainer,
  WorkTitel,
  CUSTOM_SPLITTER,
  YouTubePlayerWrapper,
  YouTubeIframeContainer,
  ContentBlockWrapper,
} from './CollectionComponent.styled';

/* ────────────────────────────────────────────── */
/* ТИПЫ                                           */
/* ────────────────────────────────────────────── */

export type BlockType =
  | 'IMAGE_SINGLE'
  | 'IMAGE_DOUBLE'
  | 'IMAGE_GALLERY'
  | 'IMAGE_TRIPLE'
  | 'IMAGE_QUADRUPLE'
  | 'IMAGE_QUINTUPLE'
  | 'SQUARE'
  | 'TEXT_4SEC' | 'TEXT_2SEC'
  | 'TEXT_1SEC' | 'TEXT_1SEC_LP' | 'TEXT_TITLE'
  | 'YOUTUBE_PLAYER'
  | 'SPLITTER' | 'SPLITTER_SPACE' | 'SPLITTER_DEFAULT';

export interface CollectionBlockDB {
  id: number;
  collection_id: number;
  type: BlockType;
  content: any;             // см. README
  description: string | null;
  position: number;
}

export interface CollectionData {
  id: number;
  folder: string;
  blocks: CollectionBlockDB[];

  // теперь main не обязателен
  main?: {
    label: string;
    text: string;
    tag?: 'h1' | 'h2' | 'h3';
  }[];

  // если вам больше не нужен work_title, можно убрать
  work_title?: string;
}


interface CollectionComponentProps {
  collection: CollectionData;
  source?: 'work' | 'photo';
}

/* ────────────────────────────────────────────── */
/* КОМПОНЕНТ                                      */
/* ────────────────────────────────────────────── */
const CollectionComponent: React.FC<CollectionComponentProps> = ({
  collection,
  source,
}) => {
  /* ────────── фильтр в URL (оставил как было) ────────── */
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>(
    (searchParams.get('filter') as any) || 'ALL'
  );
  const updateUrlFilter = (newFilter: string) => {
    const params = new URLSearchParams(location.search);
    params.set('filter', newFilter);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
  };
  const showFilter = location.pathname === '/work' || location.pathname === '/photo';
  const bucket = source === 'work'
    ? 'work-images'
    : 'photography-images';

  /* ────────── стейт блоков ────────── */
  const [blocks, setBlocks] = useState<CollectionBlockDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ────────── модалка ────────── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    altText: string;
    title?: string;
    description: string;
  }>({
    url: '',
    type: 'image',
    altText: '',
    title: '',
    description: '',
  });

  const failedMedia = useRef<Set<string>>(new Set());

  /* ────────── helpers ────────── */
  const imageUrl = (fileName: string) =>
    `${supabaseUrl}/storage/v1/object/public/${bucket}/${collection.folder}/${fileName}`;

  /* Validate tag to ensure it's a valid HTML tag and not a data URI */
  const isValidTag = (tag: any): tag is keyof JSX.IntrinsicElements => {
    if (typeof tag !== 'string') return false;
    // Prevent data URIs and other invalid tag names
    return /^[a-z][a-z0-9]*$/.test(tag) && !tag.includes(':') && !tag.includes('/');
  };

  const getYouTubeId = (value: string): string | null => {
    if (!value) return null;

    const trimmed = value.trim();

    // If it's already an ID-like string
    const idPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (idPattern.test(trimmed)) return trimmed;

    // Try to parse as URL
    try {
      const url = new URL(trimmed);

      if (url.hostname === 'youtu.be') {
        return url.pathname.slice(1);
      }

      if (url.hostname.endsWith('youtube.com')) {
        if (url.pathname === '/watch') {
          return url.searchParams.get('v');
        }
        if (url.pathname.startsWith('/embed/')) {
          return url.pathname.split('/embed/')[1];
        }
        if (url.pathname.startsWith('/shorts/')) {
          return url.pathname.split('/shorts/')[1];
        }
      }
    } catch {
      // Not a valid URL, last chance: look for an ID inside string
      const match = value.match(/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
    }

    return null;
  };


  const openModal = (
    src: string,
    type: 'image' | 'video',
    title = '',
    description = ''
  ) => {
    if (failedMedia.current.has(src)) return;

    setCurrentMedia({
      url: src,
      type,
      altText: title,
      title,
      description,
    });
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
  };

  /* ────────── загрузка блоков ────────── */
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      // work → project_blocks, photo → collection_blocks
      const blocksTable =
        source === 'work' ? 'project_blocks' : 'collection_blocks';

      const { data, error } = await supabase
        .from(blocksTable)
        .select('*')
        .eq('collection_id', collection.id)
        .order('position');

      if (error) console.error(error);
      setBlocks(data || []);
      setIsLoading(false);
    })();
  }, [collection.id, source]);



  /* ────────────────────────────────────────────── */
  /* HELPER                                         */
  /* ────────────────────────────────────────────── */

  interface ImageItem {
    src: string;
    title?: string;
    description?: string;
    row?: number | string;
  }

  interface ImageSliderProps {
    images: ImageItem[];
    aspectRatio?: string;
  }

  interface ImageSliderProps {
    images: ImageItem[];
    aspectRatio?: string;
  }

  const ImageSlider: React.FC<ImageSliderProps> = ({ images, aspectRatio }) => {
    const slides = [images[images.length - 1], ...images, images[0]];

    const [index, setIndex] = useState(1);
    const [animate, setAnimate] = useState(true);
    const [offset, setOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const transitioningRef = useRef(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const slideWidthRef = useRef(0);

    // для рассчёта мгновенной скорости
    const startXRef = useRef(0);
    const lastXRef = useRef(0);
    const startTimeRef = useRef(0);
    const lastTimeRef = useRef(0);
    const lastVelocityRef = useRef(0);

    // интервал автоплей
    const autoPlayRef = useRef<number>();

    // Стрелки
    const prevSlide = () => {
      if (transitioningRef.current) return;
      setAnimate(true);
      setIndex(i => i - 1);
      transitioningRef.current = true;
    };
    const nextSlide = () => {
      if (transitioningRef.current) return;
      setAnimate(true);
      setIndex(i => i + 1);
      transitioningRef.current = true;
    };

    // Drag logic
    const onPointerDown = (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('button') || transitioningRef.current) return;
      const el = sliderRef.current!;
      el.setPointerCapture(e.pointerId);

      setIsDragging(true);
      slideWidthRef.current = el.clientWidth;
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX;
      startTimeRef.current = Date.now();
      lastTimeRef.current = Date.now();
      lastVelocityRef.current = 0;
      setAnimate(false);
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (!isDragging || transitioningRef.current) return;
      const now = Date.now();
      const dxLocal = e.clientX - lastXRef.current;
      const dtLocal = now - lastTimeRef.current;
      if (dtLocal > 0) lastVelocityRef.current = dxLocal / dtLocal;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;

      const dx = e.clientX - startXRef.current;
      setOffset(dx);
    };

    const onPointerUp = (e: React.PointerEvent) => {
      if (!isDragging) return;
      const el = sliderRef.current!;
      el.releasePointerCapture(e.pointerId);

      setIsDragging(false);

      const dx = offset;
      const vel = lastVelocityRef.current; // 👉 signed velocity
      const threshold = slideWidthRef.current * 0.3; // a bit softer than 0.5 feels nicer

      let newIdx = index;

      const passedRight = dx > threshold || vel > 0.3;   // swipe right → previous slide
      const passedLeft = dx < -threshold || vel < -0.3; // swipe left  → next slide

      if (passedRight && !passedLeft) {
        newIdx = index - 1;
      } else if (passedLeft && !passedRight) {
        newIdx = index + 1;
      }
      // if both or neither → newIdx stays index (no slide change)

      setAnimate(true);
      setOffset(0);

      // (keep the click-fix logic we added earlier)
      if (newIdx !== index && !transitioningRef.current) {
        setIndex(newIdx);
        transitioningRef.current = true;
      } else {
        transitioningRef.current = false;
      }
    };



    const handleTransitionEnd = () => {
      transitioningRef.current = false;
      if (index === 0) {
        setAnimate(false);
        setIndex(images.length);
      } else if (index === slides.length - 1) {
        setAnimate(false);
        setIndex(1);
      }
    };

    // восстановление animate после программного сброса
    useEffect(() => {
      if (!animate) requestAnimationFrame(() => setAnimate(true));
    }, [animate]);

    // IntersectionObserver для видимости
    useEffect(() => {
      const obs = new IntersectionObserver(
        ([entry]) => setIsVisible(entry.isIntersecting),
        { threshold: 0.5 }
      );
      if (sliderRef.current) obs.observe(sliderRef.current);
      return () => obs.disconnect();
    }, []);

    // Автоплей каждые 2 сек, когда видим и не драгаем и не анимируем
    useEffect(() => {
      if (isVisible && !isDragging && !transitioningRef.current) {
        autoPlayRef.current = window.setInterval(() => {
          nextSlide();
        }, 3000);
      } else {
        window.clearInterval(autoPlayRef.current);
      }
      return () => window.clearInterval(autoPlayRef.current);
    }, [isVisible, isDragging]);

    return (
      <SliderWrapper
        ref={sliderRef}
        $aspectRatio={aspectRatio}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Arrow $left onClick={prevSlide} aria-label="Previous slide" role="button" tabIndex={0}>
          <img src={Left} alt="Previous slide" />
        </Arrow>
        <Arrow onClick={nextSlide} aria-label="Next slide" role="button" tabIndex={0}>
          <img src={Right} alt="Next slide" />
        </Arrow>

        <SliderContent
          $index={index}
          $animate={animate}
          $offset={offset}
          $isDragging={isDragging}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((img, i) => (
            <Slide key={i}>
              <img src={img.src} alt={img.title || `Slide ${i + 1} of ${slides.length}`} draggable={false} />
            </Slide>
          ))}
        </SliderContent>
      </SliderWrapper>
    );
  };




  /* ────────── рендер одного блока ────────── */
  const renderImageGalleryBlock = (b: CollectionBlockDB) => {
    const rawItems = b.content?.items || [];
    const aspectRatio = b.content?.aspectRatio || '16 / 9';

    if (!rawItems.length) return null;

    // Do we have any `row` info in items?
    const hasRowInfo = rawItems.some(
      (item: any) => item.row !== undefined && item.row !== null && item.row !== ''
    );

    // If we have rows → compute row/col placement per item
    let itemsForRender = rawItems as any[];
    let columnsForGrid: number | undefined = b.content?.columns as number | undefined;

    if (hasRowInfo) {
      const rowOrder: string[] = [];                // preserves order of rows (1,2,3,...)
      const rowCounters = new Map<string, number>(); // how many items per row so far

      itemsForRender = rawItems.map((item: any) => {
        const rawRow = String(item.row ?? '1');

        if (!rowOrder.includes(rawRow)) {
          rowOrder.push(rawRow);
        }

        const rowIdx = rowOrder.indexOf(rawRow) + 1; // grid row index (1-based)
        const currentCount = rowCounters.get(rawRow) ?? 0;
        const colIdx = currentCount + 1;

        rowCounters.set(rawRow, colIdx);

        return {
          ...item,
          _gridRow: rowIdx,
          _gridCol: colIdx,
        };
      });

      const maxCols = Array.from(rowCounters.values()).reduce(
        (max, n) => (n > max ? n : max),
        1
      );

      // In row-mode, our "column count" is the max items in a row
      columnsForGrid = maxCols;
    }

    // What we pass to styled grid as "columns" – fallback to items.length if nothing else
    const itemsCountForGrid = columnsForGrid ?? itemsForRender.length;

    return (
      <IMAGE_GALLERY
        key={b.id}
        $itemsCount={itemsCountForGrid}
        $aspectRatio={aspectRatio}
      >
        {itemsForRender.map((item: any, i: number) => (
          <div
            key={i}
            style={
              hasRowInfo
                ? { gridRow: item._gridRow, gridColumn: item._gridCol }
                : undefined
            }
          >
            <img
              src={imageUrl(item.src)}
              alt={item.title || `Image ${i + 1} from collection`}
              onClick={() =>
                openModal(
                  imageUrl(item.src),
                  'image',
                  item.title || '',
                  item.description || ''
                )
              }
              role="button"
              tabIndex={0}
              aria-label={item.title ? `View ${item.title}` : `View image ${i + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(
                    imageUrl(item.src),
                    'image',
                    item.title || '',
                    item.description || ''
                  );
                }
              }}
            />
          </div>
        ))}
      </IMAGE_GALLERY>
    );
  };




  const renderBlock = (b: CollectionBlockDB) => {
    switch (b.type) {
      case 'IMAGE_SINGLE': {
        const aspectRatio = b.content?.aspectRatio || '2 / 1';
        const images: ImageItem[] = b.content.items?.map((image: any) => ({
          src: imageUrl(image.src),
          title: image.title,
          description: image.description,
        })) || [];

        if (images.length === 0) return null;

        return <ImageSlider images={images} aspectRatio={aspectRatio} />;
      }

      case 'IMAGE_GALLERY':
        return renderImageGalleryBlock(b);

      /* ----- SQUARE: картинка + заголовок ----- */
      // one block in DB, can render 1–2 rows

      case 'SQUARE': {
        const items = (b.content?.items || []) as {
          src: string;
          label?: string;
          title?: string;
          description?: string;
        }[];

        if (!items.length) return null;

        // 👇 new flag from Supabase JSON
        const startWithText = !!b.content?.startWithText;

        return (
          <>
            {items.map((item, index) => {
              const isEven = index % 2 === 0;

              // default: image|text on first row
              // startWithText: text|image on first row
              const textFirst = startWithText ? isEven : !isEven;

              const Pic = (
                <ImageBlock key={`pic-${index}`}>
                  <img
                    src={imageUrl(item.src)}
                    alt={item.title || 'Collection image'}
                    onClick={() =>
                      openModal(
                        imageUrl(item.src),
                        'image',
                        item.title || '',
                        item.description || ''
                      )
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={
                      item.title ? `View ${item.title}` : 'View collection image'
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openModal(
                          imageUrl(item.src),
                          'image',
                          item.title || '',
                          item.description || ''
                        );
                      }
                    }}
                  />
                </ImageBlock>
              );

              const Txt = (
                <TextBlock key={`txt-${index}`}>
                  {item.label && (
                    <h1>
                      {item.label.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </h1>
                  )}
                </TextBlock>
              );

              return (
                <CollectionBlock key={`${b.id}-${index}`}>
                  {textFirst ? Txt : Pic}
                  {textFirst ? Pic : Txt}
                </CollectionBlock>
              );
            })}
          </>
        );
      }

        /* ----- текстовые секции ----- */

        interface Section {
          label: string;
          text: string;
          tag?: 'h1' | 'h2' | 'h3';
        }


      case 'TEXT_4SEC':
        return (
          <CollectionAdditionalWrapper>
            <CollectionHeader
              key={b.id}
              style={b.type.endsWith('_LP') ? { padding: '10px 0' } : {}}
            >
              {b.content.sections.map((s: Section, i: number) => (
                <CollectionWrapper key={i}>
                  <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
                  <COLLECTION_4SEC_DESCRIPTION as={isValidTag(s.tag) ? (s.tag as any) : 'h2'}>
                    {s.text.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </COLLECTION_4SEC_DESCRIPTION>
                </CollectionWrapper>
              ))}
            </CollectionHeader>
          </CollectionAdditionalWrapper>
        );

      case 'TEXT_2SEC':
        return (
          <CollectionAdditionalWrapper>
            <CollectionHeader
              key={b.id}
              style={b.type.endsWith('_LP') ? { padding: '10px 0' } : {}}
            >
              {b.content.sections.map((s: Section, i: number) => (
                <CollectionWrapper key={i}>
                  <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
                  <COLLECTION_4SEC_DESCRIPTION as={isValidTag(s.tag) ? (s.tag as any) : 'h2'}>
                    {s.text.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </COLLECTION_4SEC_DESCRIPTION>
                </CollectionWrapper>
              ))}
            </CollectionHeader>
          </CollectionAdditionalWrapper>
        );

        interface TextSegmentB {
          text: string;
          tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
          link?: string;
        }
        interface SectionB {
          label?: string;
          segments: TextSegmentB[];
        }
      case 'TEXT_1SEC':
      case 'TEXT_1SEC_LP': {
        const normalizeSegmentTag = (tag?: string): keyof JSX.IntrinsicElements => {
          if (typeof tag !== 'string') return 'span';
          const lower = tag.toLowerCase();
          if (lower.startsWith('data:') || lower.includes('/')) return 'span';
          if (lower === 'h1') return 'h3';
          if (lower === 'h2') return 'h4';
          const allowed: Array<keyof JSX.IntrinsicElements> = [
            'h3',
            'h4',
            'h5',
            'h6',
            'p',
            'span',
            'strong',
            'em',
          ];
          return allowed.includes(lower as keyof JSX.IntrinsicElements)
            ? (lower as keyof JSX.IntrinsicElements)
            : 'span';
        };

        const renderTextWithBreaks = (text: string) =>
          text.split('\n').map((line, lineIdx, arr) => (
            <React.Fragment key={lineIdx}>
              {line}
              {lineIdx < arr.length - 1 && <br />}
            </React.Fragment>
          ));

        return (
          <CollectionAdditionalWrapper>
            <CollectionTextWrapper key={b.id}>
              {b.content.sections.map((section: SectionB, i: number) => {
                const hasLabel =
                  typeof section.label === 'string' && section.label.trim().length > 0;

                return (
                  <div key={i}>
                    {hasLabel && (
                      <COLLECTION_1SEC_TITLE>{section.label}</COLLECTION_1SEC_TITLE>
                    )}

                    <COLLECTION_1SEC_DESCRIPTION>
                      {section.segments.map((seg, idx) => {
                        const Tag = normalizeSegmentTag(seg.tag);

                        const element = (
                          <Tag key={idx} style={{ display: 'inline' }}>
                            {renderTextWithBreaks(seg.text)}
                          </Tag>
                        );

                        return seg.link ? (
                          <a
                            key={idx}
                            href={seg.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${seg.text} (opens in new tab)`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {element}
                          </a>
                        ) : (
                          element
                        );
                      })}
                    </COLLECTION_1SEC_DESCRIPTION>
                  </div>
                );
              })}
            </CollectionTextWrapper>
          </CollectionAdditionalWrapper>
        );
      }

      case 'TEXT_TITLE': {
        // предполагаем, что content имеет именно такую форму:
        // { style: 'h1'|'h2'|'h3', text: string, fontsize: string, align: 'left'|'center'|'right' }
        const { text, fontsize, align } = b.content as {
          style?: 'h1' | 'h2' | 'h3' | string;
          text: string;
          fontsize: string;
          align: 'left' | 'center' | 'right';
        };

        // Always render as h1 for SEO/semantics, regardless of stored style
        const headingTag: 'h1' = 'h1';

        return (
          <COLLECTION_TEXT_TITLE_WRAPPER key={b.id} align={align}>
            <COLLECTION_TEXT_TITLE as={headingTag} fontSize={fontsize} align={align}>
              {text}
            </COLLECTION_TEXT_TITLE>
          </COLLECTION_TEXT_TITLE_WRAPPER>
        );
      }


      /* ----- YouTube ----- */
      case 'YOUTUBE_PLAYER': {
        const content = b.content || {};
        const rawIdOrUrl = (content.youtubeId || content.youtubeUrl || '') as string;

        const videoId = getYouTubeId(rawIdOrUrl);
        if (!videoId) {
          console.warn('YOUTUBE_PLAYER block has no valid youtubeId/youtubeUrl', b);
          return null;
        }

        // still ok to keep internal title for iframe accessibility
        const title: string = content.title || 'YouTube video';

        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0`;

        return (
          <YouTubePlayerWrapper key={b.id}>
            <YouTubeIframeContainer>
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </YouTubeIframeContainer>
          </YouTubePlayerWrapper>
        );
      }


      /* ----- разделители ----- */
      case 'SPLITTER_DEFAULT':
        return <hr key={b.id} style={{ margin: '20px 0', borderColor: '#444' }} />;
      case 'SPLITTER':
        // Hide SPLITTER blocks for photography pages since we have TopSplitter at the top
        if (source === 'photo') {
          return null;
        }
        return <CUSTOM_SPLITTER key={b.id} />;
      case 'SPLITTER_SPACE': {
        const height = b.content?.size || '100px'; // fallback if no size is defined
        return <div key={b.id} style={{ height }} />;
      }

      default:
        return null;
    }
  };

  /* ────────── LOADING ────────── */
  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <video
          src={Loading}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: 150, height: 150 }}
        />
      </div>
    );
  }

  /* ────────── MAIN JSX ────────── */
  const isPhoto = source === 'photo';
  return (
    <CollectionContainer $isPhoto={isPhoto}>
      {/* ——— верхний титул и фильтр ——— */}
      {showFilter && (
        <WorkTitelContainer>
          <WorkTitel>{source === 'photo' ? 'PHOTOGRAPHY' : 'WORK'}</WorkTitel>
          <WorkFilterWrapp>
            {['ALL', 'COMMERCIAL', 'PERSONAL'].map(cat => (
              <WorkTextFilter
                key={cat}
                onClick={() => {
                  if (filter !== cat) {
                    setFilter(cat as any);
                    updateUrlFilter(cat);
                  }
                }}
                className={filter === cat ? 'active' : ''}
                aria-label={`Filter by ${cat}`}
                aria-pressed={filter === cat}
                role="button"
              >
                {cat}
              </WorkTextFilter>
            ))}
          </WorkFilterWrapp>
        </WorkTitelContainer>
      )}

      {/* ——— хедер коллекции ——— */}
      {collection.main && (
        <CollectionAdditionalWrapper $isPhoto={isPhoto}>
          <CollectionHeader $isPhoto={isPhoto}>
            {collection.main.map(
              (
                s: {
                  label: string;
                  text: string;
                  tag?: 'h1' | 'h2' | 'h3';
                },
                i: number
              ) => {
                const normalizeTag = (tag?: string): keyof JSX.IntrinsicElements => {
                  if (typeof tag !== 'string') return 'p';
                  const lower = tag.toLowerCase();
                  if (lower === 'h1') return 'h3';
                  if (lower === 'h2') return 'h4';
                  const allowed: Array<keyof JSX.IntrinsicElements> = ['h3', 'h4', 'h5', 'p', 'span'];
                  return allowed.includes(lower as keyof JSX.IntrinsicElements)
                    ? (lower as keyof JSX.IntrinsicElements)
                    : 'p';
                };

                return (
                  <CollectionWrapper key={i} $isPhoto={isPhoto}>
                    <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
                    <COLLECTION_4SEC_DESCRIPTION
                      as={normalizeTag(s.tag)}
                      dangerouslySetInnerHTML={{ __html: s.text }}
                    />
                  </CollectionWrapper>
                );
              }
            )}
          </CollectionHeader>
        </CollectionAdditionalWrapper>
      )}


      {/* ——— контент из collection_blocks ——— */}
      {blocks.map((b) => {
        const node = renderBlock(b);
        if (!node) return null;

        const isGallery = b.type === 'IMAGE_GALLERY';

        return (
          <Reveal
            key={b.id}
            amount={isGallery ? 0.08 : undefined}  // 👈 tall galleries trigger almost immediately
          >
            <ContentBlockWrapper>{node}</ContentBlockWrapper>
          </Reveal>
        );
      })}

      {/* ——— модалка ——— */}
      {isModalOpen && (
        <>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <CloseButton
              onClick={closeModal}
              aria-label="Close modal"
              title="Close modal (Press Escape)"
            >
              {typeof CloseIcon === 'string' ? (
                <img src={CloseIcon} alt="Close" style={{ width: '24px', height: '24px' }} />
              ) : (
                <CloseIcon />
              )}
            </CloseButton>
            <MediaContainer>
              {currentMedia.type === 'image' && (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.altText}
                  data-modal-img
                  onLoad={() => { }}
                  onError={() => {
                    console.error('❌ Image failed to load:', currentMedia.url);
                    failedMedia.current.add(currentMedia.url);
                  }}
                />
              )}

              {currentMedia.type === 'video' && currentMedia.url && (
                <video
                  src={currentMedia.url}
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                  }}
                />
              )}
            </MediaContainer>
            {(currentMedia.title || currentMedia.description || collection.work_title) && (
              <TextContainer>
                {currentMedia.title && (
                  <MODAL_TITLE style={{ paddingTop: '20px', paddingBottom: '5px' }}>
                    {currentMedia.title}
                  </MODAL_TITLE>
                )}
                {currentMedia.description && (
                  <MODAL_DESCRIPTION style={{ paddingTop: '10px', paddingBottom: '30px' }}>
                    {currentMedia.description}
                  </MODAL_DESCRIPTION>
                )}
              </TextContainer>
            )}


          </Modal>
        </>
      )}
    </CollectionContainer>
  );
};

export default CollectionComponent;