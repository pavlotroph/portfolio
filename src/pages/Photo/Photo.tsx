import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../supabaseClient';
import WorkItemComponent from '../../components/WorkItemComponent/WorkItemComponent';
import {
  WorkContainer,
  WorkFilterWrapp,
  WorkPhotoWrapp,
  WorkTextFilter,
  WorkTitel,
  WorkTitelContainer,
} from '../Work/Work.styled';
import { Link } from 'react-router-dom';
import QuoteBlock from '../../components/Quote/QuoteBlock';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutletContext } from "react-router-dom";

export type WorkItemData = {
  slug?: string | null;   
  id: string;
  folder: string;
  image_name: string;
  title: string;
  description: string;
  preview_url: string | null;
  vimeo_id?: string;
  category?: 'PERSONAL' | 'COMMERCIAL' | null; // <-- NEW
};

export type Quote = {
  id: number;
  text: string;
  author: string;
  source: string;
};

type LayoutCtx = {
  pageReady: boolean;
  setPageReady: (v: boolean) => void;
};

const INITIAL_VISIBLE_ITEMS = 6;
const VISIBLE_ITEMS_STEP = 4;

const Photo: React.FC = () => {
  const [works, setWorks] = useState<WorkItemData[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>('ALL');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ITEMS);
  const { setPageReady } = useOutletContext<LayoutCtx>();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isWorksLoading, setIsWorksLoading] = useState(true);
  const [isQuotesLoading, setIsQuotesLoading] = useState(true);
  
  const isPageReady = !isWorksLoading && !isQuotesLoading;

  const filteredWorks =
    filter === 'ALL'
      ? works
      : works.filter(w => (w.category || '').toUpperCase() === filter);
  const renderedWorks = filteredWorks.slice(0, visibleCount);

  useEffect(() => {
    let cancelled = false;
  
    const fetchWorks = async () => {
      try {
        const { data, error } = await supabase
          .from('photography')
          .select('*')
          .order('id', { ascending: false });
  
        if (!cancelled && !error && data) {
          setWorks(data as WorkItemData[]);
        }
      } finally {
        if (!cancelled) setIsWorksLoading(false);
      }
    };
  
    const fetchQuotes = async () => {
      try {
        const { data, error } = await supabase.from('quotes').select('*');
        if (error) console.error('Помилка при отриманні цитат:', error.message);
        else if (!cancelled) setQuotes(data);
      } finally {
        if (!cancelled) setIsQuotesLoading(false);
      }
    };
  
    fetchWorks();
    fetchQuotes();
  
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    setPageReady(isPageReady);
  }, [isPageReady, setPageReady]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_ITEMS);
  }, [filter, filteredWorks.length]);

  useEffect(() => {
    if (visibleCount >= filteredWorks.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisibleCount(filteredWorks.length);
      return;
    }

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        observer.disconnect();
        setVisibleCount(prev => Math.min(prev + VISIBLE_ITEMS_STEP, filteredWorks.length));
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredWorks.length, visibleCount]);

  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [quotes]);

  return (
    <>
      <Helmet>
        <title>Photography</title>
        <meta property="og:title" content="Photography" />
        <meta name="description" content="Photography portfolio by Pavlo Troph — automotive, cinematic frames, and environment studies." />
        <meta property="og:description" content="Photography portfolio by Pavlo Troph — automotive, cinematic frames, and environment studies." />
        <meta property="og:url" content="https://pavlotroph.com/photography" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Photography | Pavlo Troph Portfolio" />
        <meta name="twitter:description" content="Photography portfolio by Pavlo Troph — automotive, cinematic frames, and environment studies." />
      </Helmet>

      <WorkContainer>
        <WorkTitelContainer>
          <WorkTitel as="h1">PHOTOGRAPHY</WorkTitel>
          <WorkFilterWrapp>
            {['ALL', 'COMMERCIAL', 'PERSONAL'].map(cat => (
              <WorkTextFilter
                key={cat}
                onClick={() => {
                  setFilter(cat as 'ALL' | 'COMMERCIAL' | 'PERSONAL');
                  if (quotes.length) {
                    const idx = Math.floor(Math.random() * quotes.length);
                    setCurrentQuote(quotes[idx]);
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

        <WorkPhotoWrapp>
          <AnimatePresence>
            {renderedWorks.map((work, index) => {
              const slugOrId = work.slug || work.id;  

              return (
                <motion.div
                  key={slugOrId}                        // you can also use it as key
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Link
                    to={`/photography/${slugOrId}`}
                    style={{ width: '100%', height: '100%' }}
                    aria-label={`View ${work.title || 'photography item'}`}
                  >
                    <WorkItemComponent
                      work={work}
                      source="photo"
                      priority={index < 4}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {visibleCount < filteredWorks.length ? (
            <div
              ref={loadMoreRef}
              aria-hidden
              style={{ width: '100%', height: 1 }}
            />
          ) : null}
        </WorkPhotoWrapp>

        <div
          style={{
            minHeight: 180, // reserve space so it won't push layout
            opacity: isPageReady && currentQuote ? 1 : 0,
            transition: "opacity 250ms ease",
            pointerEvents: isPageReady && currentQuote ? "auto" : "none",
          }}
        >
          {isPageReady && currentQuote ? <QuoteBlock quote={currentQuote} /> : null}
        </div>

        
      </WorkContainer>
    </>
  );
};

export default Photo;
