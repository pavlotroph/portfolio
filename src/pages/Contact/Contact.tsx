import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Loading from '../../assets/video/logo_animated_hq.webm';

// Define the shape of a contact-block row
interface ContactBlock {
  id: number;             // primary key in contact_blocks
  type: string;           // e.g. 'TEXT', 'IMAGE', 'FORM', etc.
  content: any;           // arbitrary content (string, JSON, etc.)
  position: number;       // ordering
}

const Contact: React.FC = () => {
  const [blocks, setBlocks] = useState<ContactBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlocks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_blocks')
        .select('id, type, content, position')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading contact blocks:', error);
        setError(error.message);
      } else {
        setBlocks(data || []);
      }
      setLoading(false);
    }

    fetchBlocks();
  }, []);

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
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Error loading page</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main style={{ padding: '2rem 1rem' }}>
        {blocks.map(block => {
          switch (block.type) {
            case 'TEXT':
              return <p key={block.id}>{block.content}</p>;

            case 'HEADING':
              return <h2 key={block.id}>{block.content}</h2>;

            case 'IMAGE':
              // content assumed to be an object { src: string, alt?: string }
              return (
                <img
                  key={block.id}
                  src={block.content.src}
                  alt={block.content.alt || ''}
                  style={{ maxWidth: '100%', margin: '1rem 0' }}
                />
              );

            case 'FORM':
              // content assumed to be HTML string for embedding
              return (
                <div
                  key={block.id}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              );

            default:
              return null;
          }
        })}
      </main>

      <Footer />
    </>
  );
};

export default Contact;
