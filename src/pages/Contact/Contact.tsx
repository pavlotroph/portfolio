import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '../../supabaseClient';
import Loading from '../../assets/video/logo_animated_hq.webm';
import { NotFoundWraperr, NotFoundText } from '../Work/Work.styled';

import CollectionComponent from '../../components/CollectionComponent/CollectionComponent';
import { BlockType } from '../../components/CollectionComponent/CollectionComponent';

export interface ContactBlockDB {
  id: number;
  type: BlockType;
  content: any;          
  position: number;
}

const Contact: React.FC = () => {
  const [blocks, setBlocks] = useState<ContactBlockDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('contact_blocks')
          .select('*')
          .order('position', { ascending: true });

        if (error) throw error;
        setBlocks(data || []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}>
        <video src={Loading} autoPlay loop muted playsInline style={{ width: 150, height: 150 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}>
        <p style={{ color: '#fff' }}>Error: {error}</p>
      </div>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <NotFoundWraperr>
        <NotFoundText>
          Контактная<br />страница пуста
        </NotFoundText>
      </NotFoundWraperr>
    );
  }

  const firstTextBlock = blocks.find(b => b.type.startsWith('TEXT_'));
  const metaDescription = firstTextBlock
    ? (firstTextBlock.content?.sections?.[0]?.text ?? '').slice(0, 160)
    : 'Контактная информация';

  return (
    <>
      <Helmet>
        <title>Contact — MySite</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content="Contact" />
        <meta property="og:description" content={metaDescription} />
      </Helmet>

      <CollectionComponent
        collection={{
          id: 0,
          folder: 'contact',
          blocks: blocks as any, // быстро, но грязно
        }}
      />
    </>
  );
};

export default Contact;