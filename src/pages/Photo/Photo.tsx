import React, { useEffect, useState } from 'react';
import {
  WorkContainer,
  WorkDescription,
  WorkTextDescription,
  WorkDescriptionWrapp,
  WorkFilterWrapp,
  WorkPhotoWrapp,
  WorkTextFilter,
  WorkTitel,
  WorkTitelContainer,
} from '../Work/Work.styled';
import { supabase } from '../../supabaseClient';
import { CUSTOM_SPLITTER } from '../../components/CollectionComponent/CollectionComponent.styled';
import WorkItemComponent from '../../components/WorkItemComponent/WorkItemComponent';
import Loading from '../../assets/video/logo_animated_hq.webm';
import { Link } from 'react-router-dom';

export type WorkItemData = {
  id: string;
  folder: string;
  image_name: string;
  title: string;
  description: string;
  preview_url: string | null;
};

type Quote = {
  id: number;
  text: string;
  author: string;
  source: string;
};

const Photo: React.FC = () => {
  const [works, setWorks] = useState<WorkItemData[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null); // Додаємо стан для поточної цитати
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>(
    'ALL'
  );
  const filteredWorks =
    filter === 'ALL'
      ? works
      : works.filter(work => work.folder.toUpperCase() === filter);

  useEffect(() => {
    const fetchWorks = async () => {
      console.log("ЗАПРОС ЗАПУЩЕН");
      const { data, error } = await supabase.from('photography').select('*');
      console.log("ОТВЕТ:", data);
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
      // Встановлюємо випадкову цитату при завантаженні
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
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
                if (quotes.length > 0) {
                  const randomIndex = Math.floor(Math.random() * quotes.length);
                  setCurrentQuote(quotes[randomIndex]);
                }
              }}
              className={filter === cat ? 'active' : ''} // Додаємо клас active до активного фільтра
            >
              {cat}
            </WorkTextFilter>
          ))}
        </WorkFilterWrapp>
      </WorkTitelContainer>

      <WorkPhotoWrapp>
        {filteredWorks.length > 0 ? (
          filteredWorks.map(work => (
            <Link
              key={work.id}
              to={`/photography/${work.id}?filter=${filter}`}
              style={{}}
            >
              {/* ← Здесь добавляем source="photo" */}
              <WorkItemComponent work={work} source="photo" />
            </Link>
          ))
        ) : (
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
              style={{ width: '150px', height: '150px' }}
            />
          </div>
        )}
      </WorkPhotoWrapp>
      <CUSTOM_SPLITTER />
      {currentQuote && (
        <WorkDescriptionWrapp>
          <WorkDescription>{currentQuote.text}</WorkDescription>
          <WorkTextDescription>
            — {currentQuote.author}, <i>{currentQuote.source}</i>
          </WorkTextDescription>
        </WorkDescriptionWrapp>
      )}
    </WorkContainer>
  );
};

export default Photo;
