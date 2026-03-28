import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  HOME_BUTTON_MAIN,
  HOME_BUTTON_RESIZABLE_BAR,
  HOME_BUTTON_TEXT,
  HomeContainer,
} from './HomePage.styled';
import { startPortfolioMediaPreload } from '../../lib/portfolioMediaPreload';

const Home: React.FC = () => {
  useEffect(() => {
    startPortfolioMediaPreload();
  }, []);

  type HomeButtonProps = {
    to: string;
    label: string;
  };

  const HOME_BUTTON: React.FC<HomeButtonProps> = ({ to, label }) => {
    const [isClicked, setIsClicked] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
      if (isClicked) return;
      setIsClicked(true);
      setTimeout(() => navigate(to), 200);
    };

    return (
      <HOME_BUTTON_MAIN 
        onClick={handleClick} 
        $isClicked={isClicked}
        role="button"
        tabIndex={0}
        aria-label={`Navigate to ${label}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <HOME_BUTTON_RESIZABLE_BAR $isClicked={isClicked} />
        <HOME_BUTTON_TEXT $isClicked={isClicked}>{label}</HOME_BUTTON_TEXT>
      </HOME_BUTTON_MAIN>
    );
  };

  return (
    <>
      <Helmet>
        <title>Pavlo Troph - Portfolio | Home</title>
        <meta property="og:title" content="Pavlo Troph - Portfolio" />
        <meta property="og:description" content="Pavlo Troph is a multidisciplinary artist: Graphic Design, CGI, Photography, Cinematography, Art Direction." />
        <meta property="og:url" content="https://pavlotroph.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pavlo Troph - Portfolio" />
        <meta name="twitter:description" content="Multidisciplinary artist based in Toronto specializing in CGI, Graphic Design & Cinematography." />
      </Helmet>
      <HomeContainer>
        {/* h1 is in static HTML for SEO - this is a duplicate that React will render */}
        <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
          Pavlo Troph Portfolio
        </h1>
        <HOME_BUTTON to="/work" label="WORK" />
        <HOME_BUTTON to="/photography" label="PHOTOGRAPHY" />
        <HOME_BUTTON to="/info" label="INFO" />
        <HOME_BUTTON to="/contact" label="CONTACTS" />
        <HOME_BUTTON to="/about" label="ABOUT ME" />
      </HomeContainer>
    </>
  );
};

export default Home;
