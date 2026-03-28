import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { useTouchHoverItem } from '../../hooks/useTouchHoverItem';
import { fetchPortfolioItems, WorkItemData } from '../../lib/portfolioMedia';

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

const Photo: React.FC = () => {
  const [works, setWorks] = useState<WorkItemData[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>('ALL');
  const [sequentialUnlockedCount, setSequentialUnlockedCount] = useState(0);
  const { setPageReady } = useOutletContext<LayoutCtx>();
  const [isWorksLoading, setIsWorksLoading] = useState(true);
  const [isQuotesLoading, setIsQuotesLoading] = useState(true);
  
  const isPageReady = !isWorksLoading && !isQuotesLoading;

  const filteredWorks =
    filter === 'ALL'
      ? works
      : works.filter(w => (w.category || '').toUpperCase() === filter);
  const sequentialFilterKey = `${filter}:${filteredWorks.length}`;
  const activeSequentialFilterKeyRef = useRef(sequentialFilterKey);
  const workPhotoWrappRef = useRef<HTMLDivElement>(null);
  const activeTouchHoverId = useTouchHoverItem(workPhotoWrappRef);

  useEffect(() => {
    let cancelled = false;
  
    const fetchWorks = async () => {
      try {
        const data = await fetchPortfolioItems('photo');
        if (!cancelled) {
          setWorks(data);
        }
      } catch (error) {
        console.error('Failed to fetch photography items:', error);
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

  useLayoutEffect(() => {
    activeSequentialFilterKeyRef.current = sequentialFilterKey;
    setSequentialUnlockedCount(filteredWorks.length > 0 ? 1 : 0);
  }, [sequentialFilterKey, filteredWorks.length]);

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
                  if (filter === cat) return;
                  setFilter(cat as 'ALL' | 'COMMERCIAL' | 'PERSONAL');
                  setSequentialUnlockedCount(1);
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

        <WorkPhotoWrapp ref={workPhotoWrappRef}>
          <AnimatePresence>
            {filteredWorks.map((work, index) => {
              const slugOrId = work.slug || work.id;  
              const itemSequentialFilterKey = sequentialFilterKey;

              return (
                <motion.div
                  key={`${filter}-${slugOrId}`}
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
                      loadEnabled={index < sequentialUnlockedCount}
                      touchActive={activeTouchHoverId === String(work.id)}
                      onPreviewSettled={() => {
                        if (activeSequentialFilterKeyRef.current !== itemSequentialFilterKey) return;
                        setSequentialUnlockedCount(prev =>
                          Math.min(filteredWorks.length, Math.max(prev, index + 2))
                        );
                      }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </WorkPhotoWrapp>

        <div
          style={{
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
