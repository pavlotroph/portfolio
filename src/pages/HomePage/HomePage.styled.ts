import styled from 'styled-components';

export const HomeContainer = styled.div`
  max-width: 100%;
  margin: 0px;
  background: #000;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 78px);
  padding: 78px 0px 0px 0px;
`;

export const SpanTitel = styled.span``;

export const HOME_BUTTON_MAIN = styled.div<{ $isClicked: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 64px;
  padding: 0;
  background-color: #000000;
  border: none;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.2s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.05);
    opacity: 0;
    transition: opacity 0.15s ease-out;
    z-index: 0;
  }

  &:hover::before {
    opacity: 1;
    transition: none;
  }
`;

export const HOME_BUTTON_RESIZABLE_BAR = styled.div<{ $isClicked: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 64px;
  width: ${({ $isClicked }) => ($isClicked ? '100%' : '0')};
  background-color: rgb(255, 255, 255);
  z-index: 0;
  transition: width 0.2s ease;
`;

export const HOME_BUTTON_TEXT = styled.span<{ $isClicked: boolean }>`
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  font-size: 24px;
  line-height: 64px;
  color: ${({ $isClicked }) => ($isClicked ? '#000000' : '#FFFFFF')};
  z-index: 1;
  pointer-events: none;
`;
