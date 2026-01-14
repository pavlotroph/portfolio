import React, { useEffect, useState } from 'react';
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

const Photo: React.FC = () => {
  const [works, setWorks] = useState<WorkItemData[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>('ALL');
  const { setPageReady } = useOutletContext<LayoutCtx>();
  const [isWorksLoading, setIsWorksLoading] = useState(true);
  const [isQuotesLoading, setIsQuotesLoading] = useState(true);
  
  const isPageReady = !isWorksLoading && !isQuotesLoading;

  const filteredWorks =
    filter === 'ALL'
      ? works
      : works.filter(w => (w.category || '').toUpperCase() === filter);

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
        <meta property="og:url" content="https://pavlo-protfolio.vercel.app/photography" />
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
            {filteredWorks.map(work => {
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
                    <WorkItemComponent work={work} source="photo" />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </WorkPhotoWrapp>

        {currentQuote && <QuoteBlock quote={currentQuote} />}
        
      </WorkContainer>
    </>
  );
};

export default Photo;
