import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeContainer,
  HOME_BUTTON_MAIN,
  HOME_BUTTON_RESIZABLE_BAR,
  HOME_BUTTON_TEXT
} from './HomePage.styled';

const Home: React.FC = () => {
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
      <HOME_BUTTON_MAIN onClick={handleClick} isClicked={isClicked}>
        <HOME_BUTTON_RESIZABLE_BAR isClicked={isClicked} />
        <HOME_BUTTON_TEXT isClicked={isClicked}>{label}</HOME_BUTTON_TEXT>
      </HOME_BUTTON_MAIN>
    );
  };

  return (
    <HomeContainer>
      <HOME_BUTTON to="/work" label="WORK" />
      <HOME_BUTTON to="/photography" label="PHOTOGRAPHY" />
      <HOME_BUTTON to="/info" label="INFO" />
      <HOME_BUTTON to="/contact" label="CONTACTS" />
      <HOME_BUTTON to="/about" label="ABOUT ME" />
    </HomeContainer>
  );
};

export default Home;
