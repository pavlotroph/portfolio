import styled from "styled-components";

export const AdditionalWrapper = styled.div`
padding: 0px 14px;

@media screen and (min-width: 744px){
padding: 0px 14px;
}
`;

export const ContactContainer = styled.div`
margin: 0px auto 10px;
height: 100%;
max-width: 1440px;
padding: 16px 0px;
display: flex;
flex-direction: column;
margin-bottom: 16px;

@media screen and (min-width: 744px){
margin-bottom: 20px;
}

@media screen and (min-width: 1440px){

height: 100%;
max-width: 1440px;
padding: 16px 0px;
display: flex;
flex-direction: column;
margin-bottom: 24px;
}
`;

export const ContactTitel = styled.h1`
font-family: var(--font-family);
font-weight: 600;
font-size: 32px;
line-height: 162%;
color: #fff;
`;

export const WrapperInfo = styled.div`
display: flex;
gap: 20%;
margin-top: 50px;
margin-bottom: 50px;

@media screen and (min-width: 744px){
  gap: 40%;
}

@media screen and (min-width: 1440px){
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 47.5%;
  margin-top: 50px;
  height: 30%;
}


`;

export const SocialContainerLink = styled.div`
display: flex;
flex-direction: column;
gap: 5px;
`;

export const TextContact = styled.p`
font-family: var(--second-family);
font-weight: 400;
font-size: 11px;
letter-spacing: -0.02em;
color: #808080;

 display: inline-block;
 will-change: transform, color, text-shadow;
 cursor: pointer;
@media screen and (min-width: 744px){
font-family: var(--second-family);
font-weight: 400;
font-size: 13px;
letter-spacing: -0.02em;
color: #808080;
margin-bottom: 30px;
}

@media screen and (min-width: 1440px){
font-size: 16px;
margin-bottom: 50px;

}
`;

export const EmailSocialLink = styled.a`
font-family: var(--font-family);
font-weight: 600;
font-size: 14px;
line-height: 162%;
color: #fff;
transition: color 180ms ease, text-shadow 180ms ease, transform 180ms ease;

&:hover,
&:focus {
  color: #2ea3ff;
  text-shadow: 0 0 10px rgba(46,163,255,0.25);
  transform: translateX(2px);
}

&:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(46,163,255,0.12);
  border-radius: 2px;
}
@media screen and (min-width: 744px){
font-size: 16px;

}

@media screen and (min-width: 1440px){
font-size: 20px;

}
`;

export const LocationContainer = styled.div`

display: flex;
flex-direction: column;
align-items: flex-start;
gap: 10px;
`;

export const LocationLink = styled.a`
font-family: var(--font-family);
font-weight: 600;
font-size: 14px;
line-height: 162%;
color: #fff;
@media screen and (min-width: 744px){
font-size: 16px;

}

@media screen and (min-width: 1440px){
font-size: 20px;

}
`;
