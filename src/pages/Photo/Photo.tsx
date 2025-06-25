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
} from '../Work/Work.styled';
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
    filter === 'ALL' ? works : works.filter(w => w.folder.toUpperCase() === filter);

  useEffect(() => {
    const fetchWorks = async () => {
      const { data, error } = await supabase.from('photography').select('*');
      if (error) {
        console.error('Error loading photos:', error.message);
      } else {
        setWorks(data);
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
    <WorkContainer>
      <WorkTitelContainer>
        <WorkTitel>PHOTOGRAPHY</WorkTitel>
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
              >
                <WorkItemComponent work={work} source="photo" />
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

export default Photo;
