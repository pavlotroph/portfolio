// src/components/CollectionsSwiper/CollectionsSwiper.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Left from "../../assets/icons/icon_left.svg";
import Right from "../../assets/icons/icon_right.svg";
import { CollectionAdditionalWrapper } from '../../components/CollectionComponent/CollectionComponent.styled';

const NavigationWrapper = styled.div`
  position: relative;
  bottom: 0px;
  max-width: 1440px;
  height: 20vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  z-index: 1;
  margin: 0 auto;
  width: 100%;
`;

const ArrowButton = styled.button<{ side: 'left' | 'right' }>`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${({ side }) => (side === 'left' ? 'flex-start' : 'flex-end')};
  transition: all 0.3s;

  &:hover {
    color: rgba(98, 98, 98, 0.9);
    fill: rgba(98, 98, 98, 0.9);
  }
`;

export const ArrowImage = styled.img`
  width: 16px;  
  height: auto;
`;

const CollectionName = styled.h1`
  color: white;
  font-size: 16px;
  text-align: center;
  flex-grow: 1;
  padding: 0 40px;

  @media (min-width: 744px) {
    font-size: 18px;
  }

  @media (min-width: 1440px) {
    font-size: 20px;
  }
`;

interface CollectionSliderProps {
  source: 'work' | 'photo';
  currentId: number;
  collectionIds: number[];
  collectionName: string;
}

const CollectionSlider: React.FC<CollectionSliderProps> = ({
  source,
  currentId,
  collectionIds,
  collectionName,
}) => {
  const navigate = useNavigate();
  const currentIndex = collectionIds.findIndex(id => id === currentId);

  const navigateTo = (newIndex: number) => {
    if (collectionIds.length === 0) return;
    const idx = (newIndex + collectionIds.length) % collectionIds.length;
    const base = source === 'work' ? '/work' : '/photography';
    navigate(`${base}/${collectionIds[idx]}`);
  };

  if (collectionIds.length <= 1) return null;

  return (
    <CollectionAdditionalWrapper>
      <NavigationWrapper>
        <ArrowButton side="left" onClick={() => navigateTo(currentIndex - 1)}>
          <ArrowImage src={Left} alt="Previous" />
        </ArrowButton>

        <CollectionName>{collectionName}</CollectionName>

        <ArrowButton side="right" onClick={() => navigateTo(currentIndex + 1)}>
          <ArrowImage src={Right} alt="Next" />
        </ArrowButton>
      </NavigationWrapper>
    </CollectionAdditionalWrapper>
  );
};

export default CollectionSlider;
