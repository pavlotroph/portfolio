import styled from "styled-components";

export const WorkContainer = styled.div`
display: flex;
flex-direction: column;
margin: 0 auto;
max-width: 1440px;
padding: 0px 14px;

@media screen and (min-width: 744px){
  padding: 0px 14px;
}

@media screen and (min-width: 1440px){
  padding: 0px 14px;
}
`;

export const WorkTitelContainer = styled.div`
margin: 0 auto;
margin-top: 20px;
margin-bottom: 50px;
@media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;

export const WorkTitel = styled.h1`
font-family: var(--font-family);
font-weight: 600;
font-size: 28px;
line-height: 162%;
color: #fff;
text-align: center;
@media screen and (min-width: 744px){
font-size: 48px;

}

@media screen and (min-width: 1440px){


}
`;

export const WorkFilterWrapp = styled.div`
    margin: 0 auto;
    display: flex;
    gap: 0px;
    flex-direction: row;
    justify-content: center;
    flex-wrap: nowrap;
    width: 100%;
@media screen and (min-width: 744px){
    gap: 0px;
}

@media screen and (min-width: 1440px){
    gap: 0px;
}
`;

export const WorkTextFilter = styled.button`
  font-family: var(--second-family);
  font-weight: 400;
  font-size: 13px;
  line-height: 162%;
  color: #808080;
  cursor: pointer;
  text-decoration: none;
  background: transparent;
  border: none;
  min-height: 44px;
  padding: 10px 4px;
  transition: all 0.3s ease-in-out;
  position: relative;
  white-space: nowrap;

  &:hover {
    color:rgb(255, 255, 255);
  }

  &.active {
    color:rgb(255, 255, 255);
    &::after {
      width: 100%;
    }
  }

  &:hover::after {
    width: 100%;
  }

  @media screen and (min-width: 744px) {
    font-size: 16px;
    padding: 10px 6px;
  }

  @media screen and (min-width: 1440px) {
    padding: 10px 8px;
  }
`;



export const WorkItemContainer = styled.div`
  cursor: pointer;
  width: 100%;
  position: relative;
  overflow: hidden;
  margin-bottom: 1px;
  margin-top: 1px;
  aspect-ratio: 21/9;
  
  @media screen and (min-width: 744px) {
    aspect-ratio: 20/7;
    margin-bottom: 2px;
    margin-top: 2px;
  }
  
  @media screen and (min-width: 1440px) {
    aspect-ratio: 32/9;
    margin-bottom: 3px;
    margin-top: 3px;
  }
`;

export const PreviewLayer = styled.div<{ $isVisible: boolean; $imageUrl: string }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: opacity 3.4s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  z-index: 0;
  will-change: opacity;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const OriginalLayer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.4s ease-out;
  z-index: 1;             /* above preview */
  will-change: opacity;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* 👇 gradient lives here now */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.25) 40%,
      transparent 100%
    );
  }
`;

export const HoverGradient = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.4s ease-in-out;
  background: linear-gradient( 0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.6) 7%, rgba(0, 0, 0, 0.5) 14%, rgba(0, 0, 0, 0.3) 21%, rgba(0, 0, 0, 0.15) 28%, rgba(0, 0, 0, 0.06) 35%, transparent 50% );
  z-index: 2;
`;


export const VideoPreview = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-out;
  z-index: 1;
  will-change: opacity;
  background-color: #000;

  video,
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: none;
  }
`;



export const ImageDescription = styled.p<{ $isVisible: boolean }>`
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  position: absolute;
  bottom: 20px;
  left: 20px;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease-out;
  z-index: 3;
  will-change: opacity;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  
  @media screen and (min-width: 744px) {
    font-size: 22px;
  }
`;
export const WorkPhotoWrapp = styled.div`
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;

  @media screen and (min-width: 744px) {
    margin-bottom: 40px;
  }

  @media screen and (min-width: 1440px) {
    margin-bottom: 50px;
  }
`;

export const WorkItem = styled.div`
height: 200px;
width: 100vw;
margin-left: calc(-50vw + 50%);
@media screen and (min-width: 744px){
height: 270px;
position: relative;

}

@media screen and (min-width: 1440px){
height: 400px;

}
`;

export const WorkImage = styled.img`
  width: 100vw;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
@media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;


// export const WorkSpannImage = styled.span<{ $imageUrl: string }>`
//   position: relative;
//   overflow: hidden;
//   display: inline-block;
//   width: 100%;
//   height: 100%;
//   transition: all 0.6s ease-in-out;
//   background-image: url(${props => props.$imageUrl});
//   background-size: cover;
//   background-position: center;
//   z-index: 0;

//   img {
  
//   }

//   &::after {
//     content: "";
//     position: absolute;
//     inset: 0; /* top: 0; left: 0; right: 0; bottom: 0; */
//     background: linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
//     opacity: 0;
//     transition: opacity 0.6s ease-in-out;
//     z-index: 1;
//   }😄

//   &:hover::after {
//     opacity: 1;
//   }

//   &:hover ${ImageDescription},
//   &.hover ${ImageDescription} {
//     opacity: 1;
//     z-index: 2;
//   }
// `;


export const PreviewImage = styled.div<{ $src: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  transition: opacity 0.5s ease-in-out;
  z-index: 1;
`;

export const OriginalContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease-in-out;
  z-index: 0;
`;



export const WorkDescriptionWrapp = styled.div`
    display: flex;
    height: 200px;
    width: 100%;
    margin: 0 auto;
    margin-top: 50px;
    margin-bottom: 50px;
    max-width: 70%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
@media screen and (min-width: 744px){
height: 400px;

}

@media screen and (min-width: 1440px){


}
`;

export const WorkDescription = styled.h3`
font-family: var(--font-family);
font-weight: 600;
font-size: 18px;
text-align: center;
color: #fff;

@media screen and (min-width: 744px){

font-size: 32px;
max-width: 1440px;
}

@media screen and (min-width: 1440px){


}
`;

export const WorkTextDescription = styled.p`
font-family: var(--second-family);
font-weight: 400;
font-size: 12px;
text-align: center;
color: #808080;
@media screen and (min-width: 744px){
font-size: 16px;

}

@media screen and (min-width: 1440px){


}
`;

export const NotFoundWraperr = styled.div`
display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
margin: 0 auto;
height: 420px;
// padding: 46px 280px;
height: 200px;
width: 100%;
@media screen and (min-width: 744px){
height: 400px;

}

@media screen and (min-width: 1440px){
// padding: 146px 880px;

}
`;

export const NotFoundText = styled.p`
font-family: var(--third-family);
font-weight: 600;
font-size: 24px;
color: #404040;
    text-align: center;
    line-height: 162%;
@media screen and (min-width: 744px){

font-size: 42px;
}

@media screen and (min-width: 1440px){
font-size: 64px;

}
`;