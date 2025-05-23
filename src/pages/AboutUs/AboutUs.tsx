import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Reveal } from '../Reveal/Reveal';

import {
  AboutContainer,
  AboutDescription,
  AboutItem,
  AboutText,
  AboutTitle,
} from './AboutUs.styled';

type AboutBlockDB = {
  id: number;
  title: string;
  content: { items: { text: string }[] };
};

const AboutUs: React.FC = () => {
  const [blocks, setBlocks] = useState<AboutBlockDB[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── загрузка блоков из about_blocks ─── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('about_blocks')
        .select('*')
        .order('id');               // порядок вывода
      if (error) console.error(error);
      setBlocks(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <AboutContainer>
        <AboutTitle>About Me</AboutTitle>
        <p style={{ color: '#fff' }}>Loading…</p>
      </AboutContainer>
    );
  }

  return (
    <AboutContainer>
      <AboutTitle>About Me</AboutTitle>

      {blocks.map(block => (
        <Reveal>
        <AboutItem key={block.id}>
          <AboutText>{block.title}</AboutText>

          {/* выводим каждую строку с переносами <br/> в content.items[0].text */}
          {block.content.items.map((it, idx) => (
            <AboutDescription key={idx}>
              {it.text.split('<br/>').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </AboutDescription>
          ))}
        </AboutItem>
        </Reveal>
      ))}
    </AboutContainer>
  );
};

export default AboutUs;
