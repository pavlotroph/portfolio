import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import WorkItemComponent from '../../components/WorkItemComponent/WorkItemComponent';
import {
  WorkContainer,
  WorkFilterWrapp,
  WorkPhotoWrapp,
  WorkTextFilter,
  WorkTitel,
  WorkTitelContainer,
} from './Work.styled';
import { CUSTOM_SPLITTER } from '../../components/CollectionComponent/CollectionComponent.styled';
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
  vimeo_id?: string;
};

export type Quote = {
  id: number;
  text: string;
  author: string;
  source: string;
};

const Work: React.FC = () => {
  const [works, setWorks] = useState<WorkItemData[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>(
    'ALL'
  );

  const filteredWorks =
    filter === 'ALL'
      ? works
      : works.filter(work => work.folder.toUpperCase() === filter);

  useEffect(() => {
    const fetchWorks = async () => {
      const { data, error } = await supabase.from('work').select('*');
      if (error) {
        console.error('Помилка при отриманні робіт:', error.message);
      } else {
        setWorks(data);
      }
    };

    const fetchQuotes = async () => {
      const { data, error } = await supabase.from('quotes').select('*');
      if (error) {
        console.error('Помилка при отриманні цитат:', error.message);
      } else {
        setQuotes(data);
      }
    };

    fetchWorks();
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [quotes]);
  return (
    <WorkContainer>
      <WorkTitelContainer>
        <WorkTitel>WORK</WorkTitel>
        <WorkFilterWrapp>
          {['ALL', 'COMMERCIAL', 'PERSONAL'].map(cat => (
            <WorkTextFilter
              key={cat}
              onClick={() => {
                setFilter(cat as 'ALL' | 'COMMERCIAL' | 'PERSONAL');
                if (quotes.length > 0) {
                  const randomIndex = Math.floor(Math.random() * quotes.length);
                  setCurrentQuote(quotes[randomIndex]);
                }
              }}
              className={filter === cat ? 'active' : ''}
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
          to={`/work/${work.id}?filter=${filter}`}
          style={{ width: '100%', height: '100%' }}
        >
          <WorkItemComponent work={work} source="work" />
        </Link>
      </motion.div>
    ))}
  </AnimatePresence>
      </WorkPhotoWrapp>
      <CUSTOM_SPLITTER />

      {currentQuote && <QuoteBlock quote={currentQuote} />}

    </WorkContainer>
  );
};

export default Work;
