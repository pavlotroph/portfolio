// src/pages/Contact.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Loading from '../assets/video/logo_animated_hq.webm';

export interface ContactBlock {
  id: number;
  type: string;       // keep generic so new block‐types just flow through
  content: string;    // assume HTML or markdown
  position: number;
}

const ContactPage: React.FC = () => {
  const [blocks, setBlocks] = useState<ContactBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('contact_blocks')
          .select('*')
          .order('position', { ascending: true });

        if (error) throw error;
        setBlocks(data ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
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

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'red',
        }}
      >
        Error loading contact blocks: {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      {/* ——— Header ——— */}
      <header style={{ marginBottom: '2rem' }}>
        <h1>Contact</h1>
      </header>

      {/* ——— Blocks from contact_blocks ——— */}
      <main>
        {blocks.map((b) => (
          <section
            key={b.id}
            className={`contact-block contact-block--${b.type.toLowerCase()}`}
            style={{ marginBottom: '1.5rem' }}
          >
            {/*
              By default we just render `content` as HTML.
              If you later add new block types (e.g. maps, forms, sliders), 
              you can switch on `b.type` here.
            */}
            <div
              dangerouslySetInnerHTML={{ __html: b.content }}
            />
          </section>
        ))}
      </main>
    </div>
  );
};

export default ContactPage;