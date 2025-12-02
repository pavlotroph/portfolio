import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../supabaseClient';
import { Reveal } from '../Reveal/Reveal';

import {
  AboutContainer,
  AboutDescription,
  AboutItem,
  AboutText,
  AboutTitle,
  AdditionalWrapper,
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
        .order('id'); // порядок вывода
      if (error) console.error(error);
      setBlocks(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>About </title>
        </Helmet>
        <AdditionalWrapper>
          <AboutContainer>
            <AboutTitle>About Me</AboutTitle>
            <p style={{ color: '#fff' }}>Loading…</p>
          </AboutContainer>
        </AdditionalWrapper>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>About</title>
        <meta property="og:title" content="About" />
        <meta name="description" content="About Pavlo Troph — Toronto-based designer creating graphic design, 3D, video, and photography for games and brands." />
        <meta property="og:description" content="About Pavlo Troph — Toronto-based designer creating graphic design, 3D, video, and photography for games and brands." />
        <meta property="og:url" content="https://pavlo-protfolio.vercel.app/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About | Pavlo Troph Portfolio" />
        <meta name="twitter:description" content="About Pavlo Troph — Toronto-based designer creating graphic design, 3D, video, and photography for games and brands." />
      </Helmet>
      
      <AdditionalWrapper>
        <AboutContainer>
          <AboutTitle as="h1">About Me</AboutTitle>

          {blocks.map(block => (
          <Reveal key={block.id}>
            <AboutItem>
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
    </AdditionalWrapper>
    </>
  );
};

export default AboutUs;
