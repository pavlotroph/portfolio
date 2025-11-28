import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
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

export type WorkItemData = {
  id: string;
  folder: string;
  image_name: string;
  title: string;
  description: string;
  preview_url: string | null;
  category?: 'PERSONAL' | 'COMMERCIAL' | null; // <-- NEW
};


export type Quote = {
  id: number;
  text: string;
  author: string;
  source: string;
};

const Photo: React.FC = () => {
  const [works, setWorks] = useState<WorkItemData[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>('ALL');

  const filteredWorks =
    filter === 'ALL'
      ? works
      : works.filter(w => (w.category || '').toUpperCase() === filter);


  useEffect(() => {
    const fetchWorks = async () => {
      const { data, error } = await supabase.from('photography').select('*');
      if (!error && data) {
        setWorks(data as WorkItemData[]);
      }
    };
    const fetchQuotes = async () => {
      const { data, error } = await supabase.from('quotes').select('*');
      if (!error && data) setQuotes(data);
    };

    fetchWorks();
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length) {
      const idx = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[idx]);
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
          <AnimatePresence mode="wait">
            {filteredWorks.map(work => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ width: '100%', height: '100%' }}
              >
                <Link
                  to={`/photography/${work.id}?filter=${filter}`}
                  style={{ width: '100%', height: '100%' }}
                  aria-label={`View ${work.title || 'photography item'}`}
                >
                  <WorkItemComponent work={work} source="photo" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </WorkPhotoWrapp>
        {currentQuote && <QuoteBlock quote={currentQuote} />}
      </WorkContainer>
    </>
  );
};

export default Photo;
