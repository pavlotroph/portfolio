import { create as create$1 } from "@wroud/vite-plugin-ssg/react/server";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Html, Head, Body } from "@wroud/vite-plugin-ssg/react/components";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, Suspense, createContext, useContext, useRef } from "react";
import { NavLink, useLocation, Outlet, useNavigate, useParams, Link, Routes, Route, Navigate } from "react-router-dom";
import AOS from "aos";
import { useMediaQuery } from "react-responsive";
import styled, { css, styled as styled$1, keyframes } from "styled-components";
import { createClient } from "@supabase/supabase-js";
import { Helmet } from "react-helmet";
import Player from "@vimeo/player";
const LogoIcon = "data:image/svg+xml,%3csvg%20width='36'%20height='36'%20viewBox='0%200%2036%2036'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M36%2018C36%2027.9411%2027.9411%2036%2018%2036C8.05887%2036%200%2027.9411%200%2018C0%208.05887%208.05887%200%2018%200C27.9411%200%2036%208.05887%2036%2018ZM18%2034.6361C27.1878%2034.6361%2034.6361%2027.1878%2034.6361%2018C34.6361%208.81216%2027.1878%201.36395%2018%201.36395C8.81216%201.36395%201.36395%208.81216%201.36395%2018C1.36395%2027.1878%208.81216%2034.6361%2018%2034.6361Z'%20fill='white'/%3e%3cpath%20d='M18.0207%207.56372L21.6001%209.63031V13.7635L18.0207%2015.8301L14.4412%2013.7635V9.63031L18.0207%207.56372Z'%20fill='white'/%3e%3cpath%20d='M25.1711%2011.6969L28.7505%2013.7635V17.8967L25.1711%2019.9633L21.5916%2017.8967V13.7635L25.1711%2011.6969Z'%20fill='white'/%3e%3cpath%20d='M18.0207%2024.0964L19.8104%2025.1297V27.1963L18.0207%2028.2296L16.2309%2027.1963V25.1297L18.0207%2024.0964Z'%20fill='white'/%3e%3cpath%20d='M10.8703%2011.6969L14.4497%2013.7635V17.8967L10.8703%2019.9633L7.29082%2017.8967V13.7635L10.8703%2011.6969Z'%20fill='white'/%3e%3cpath%20d='M17.318%2015.0034H18.6957V25.4191H17.318V15.0034Z'%20fill='white'/%3e%3cpath%20d='M10.4156%2016.3529L11.1045%2015.1598L18.3349%2019.3343L17.6461%2020.5275L10.4156%2016.3529Z'%20fill='white'/%3e%3cpath%20d='M25.6024%2016.3529L24.9136%2015.1598L17.6831%2019.3343L18.372%2020.5275L25.6024%2016.3529Z'%20fill='white'/%3e%3c/svg%3e";
const Wrapper$1 = styled.div`
    display: flex;
    align-items: center;

        @media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){
display: none;

}
`;
const BurgerButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10;

      @media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
const Line = styled(motion.div)`
  width: 40px;
  height: 2px;
  background: white;
  border-radius: 0px;
   z-index: 10;

       @media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
const MenuOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.96);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1;
  overflow-y: auto;

      @media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
styled.div`
position: absolute;
width: 300px;
 left: 50%;
 transform: translateX(-50%);
 bottom: 10%;

     @media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
const MenuLink = styled(motion.span)`
 font-family: var(--font-family);
font-weight: 400;
font-size: 24px;
line-height: 135%;
text-align: center;
color: var(--white);
  margin: 12px 0;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.8s;
  &:hover {
    color: #fe5b14;
  }

      @media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){
font-family: var(--font-family);
font-weight: 400;
font-size: 18px;
line-height: 135%;
text-align: center;
color: var(--white);

}
`;
styled.img`
width: 20px;

`;
const NavbarContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
   background: rgb(0, 0, 0);
  padding: 14px 18px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  margin: 0 auto;
  transition: all 0.3s ease;
  z-index: 99;

  @media (max-width: 768px) {
    padding: 14px 18px;
    max-width: 768px;
  }
  
  @media screen and (min-width: 768px) {
    padding: 14px 24px;
    width: 100%;
    margin: 0 auto;
    }

  @media screen and (min-width: 1440px) {
    padding: 14px 24px;
    width: 100%;
    margin: 0 auto;
    }

  &:hover,
  &:focus,
  &.active {
  
    transition: all 0.4s ease-in-out;
  }
`;
const HeaderWrapper = styled.div`
      display: flex;
    width: 1440px;
    margin: 0 auto;
    justify-content: space-between;
    align-items: center;

`;
const Logo = styled(NavLink)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d1ff;
  text-decoration: none;
  
  img {
  height: 50px;
  overflov: hidden;

  }
  &:hover,
  &:focus,
  &.active {
    color: #00ffe7;
  }
`;
const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;
const NavItem = styled.li`
color:rgb(49, 46, 46);
  a {
    text-decoration: none;
   color: #808080;
   font-family: var(--font-family);
font-weight: 600;
font-size: 14px;
text-align: center;
    transition: color 0.3s ease;

    &:hover,
    &.active {
      color:rgb(255, 255, 255);
    }
  }
`;
const StyledNavLink = styled(NavLink)`
  text-decoration: none;
font-family: var(--font-family);
font-weight: 600;
font-size: 14px;
text-align: center;
color: #fff;
  transition: all 0.4s ease-in-out;
  position: relative;

    color: #808080;
  cursor: pointer;

  transition: all 0.4s ease-in-out;
  position: relative;

  &:hover {
    color:rgb(255, 255, 255);
  }

  &::bevore {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 0;
    height: 2px;
    background-color: #808080;
    transition: width 0.3s ease-in-out;
  }

  &.active {
   color:rgb(255, 255, 255);
    &::after {
      width: 100%;
    }
  }

  &:hover::after {
    width: 100%;
    color:rgb(255, 255, 255);
  }
`;
const topLineVariants = {
  open: { rotate: 45, y: 14 },
  closed: { rotate: 0, y: 0 }
};
const middleLineVariants = {
  open: { opacity: 0 },
  closed: { opacity: 1 }
};
const bottomLineVariants = {
  open: { rotate: -45, y: -14 },
  closed: { rotate: 0, y: 0 }
};
const menuVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: "-100%" }
};
const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  const navLinks = [
    // { to: '/home', label: 'WELCOME' },
    { to: "/work", label: "WORK" },
    { to: "/photography", label: "PHOTOGRAPHY" },
    { to: "/info", label: "INFO" },
    { to: "/contact", label: "CONTACTS" },
    { to: "/about", label: "ABOUT ME" }
  ];
  return /* @__PURE__ */ jsxs(Wrapper$1, { children: [
    /* @__PURE__ */ jsxs(BurgerButton, { onClick: () => setIsOpen(!isOpen), children: [
      /* @__PURE__ */ jsx(Line, { animate: isOpen ? "open" : "closed", variants: topLineVariants }),
      /* @__PURE__ */ jsx(Line, { animate: isOpen ? "open" : "closed", variants: middleLineVariants }),
      /* @__PURE__ */ jsx(Line, { animate: isOpen ? "open" : "closed", variants: bottomLineVariants })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsx(
      MenuOverlay,
      {
        initial: "closed",
        animate: "open",
        exit: "closed",
        variants: menuVariants,
        transition: { duration: 0.3 },
        children: navLinks.map((link, index) => /* @__PURE__ */ jsx(MenuLink, { onClick: () => setIsOpen(false), children: /* @__PURE__ */ jsx(StyledNavLink, { to: link.to, children: link.label }) }, index))
      }
    ) })
  ] });
};
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    AOS.init({ duration: 3e3 });
    AOS.refresh();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const isMobile = useMediaQuery({ query: "(max-width: 773px)" });
  return /* @__PURE__ */ jsx(NavbarContainer, { $isScrolled: isScrolled, children: /* @__PURE__ */ jsxs(HeaderWrapper, { children: [
    /* @__PURE__ */ jsx(Logo, { to: "/home", children: /* @__PURE__ */ jsx("img", { src: LogoIcon, alt: "Logo" }) }),
    /* @__PURE__ */ jsx(NavList, { children: isMobile ? /* @__PURE__ */ jsx(BurgerMenu, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(NavItem, { children: /* @__PURE__ */ jsx(StyledNavLink, { to: "/work", children: "WORK" }) }),
      " ",
      /* @__PURE__ */ jsx(NavItem, { children: /* @__PURE__ */ jsx(StyledNavLink, { to: "/photography", children: "PHOTOGRAPHY" }) }),
      " ",
      /* @__PURE__ */ jsx(NavItem, { children: /* @__PURE__ */ jsx(StyledNavLink, { to: "/info", children: "INFO" }) }),
      " ",
      /* @__PURE__ */ jsx(NavItem, { children: /* @__PURE__ */ jsx(StyledNavLink, { to: "/contact", children: "CONTACTS" }) }),
      " ",
      /* @__PURE__ */ jsx(NavItem, { children: /* @__PURE__ */ jsx(StyledNavLink, { to: "/about", children: "ABOUT ME" }) })
    ] }) })
  ] }) });
};
const supabaseUrl = "https://isglxygpyiuszrsqfttp.supabase.co";
const supabaseAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZ2x4eWdweWl1c3pyc3FmdHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTY1NDcsImV4cCI6MjA2MjY3MjU0N30.BTMA8nSggN3Ia6Ud_RgssY6dMwWl-h1t7_T7e-ct6sg";
const supabase = createClient(supabaseUrl, supabaseAnon);
const CollectionContainer = styled.div`
  width: 100%;
  margin: 78px auto;
  margin-bottom: 0px;
  @media (min-width: 1440px) {
    max-width: 100%;
  }
`;
const CollectionAdditionalWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  padding: 0px 18px;
  gap: 40px;

  @media (min-width: 744px) {
    padding: 0px 24px;
  }
`;
const PlayerVimeo = styled.div`
  width: 100%;
  margin: 0 auto;
  background: #000;
  position: relative;
`;
const VimeoVideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.125%;
  overflow: hidden;
  background: #000;

  iframe {
    background: #000;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200%;
    transform: translateY(-25%);
  }

  video {
    object-fit: cover;
  }
`;
const VideoCaption = styled.div`
  color: #fff;
  text-align: center;
  padding: 20px 5%;
  width: 90%;
  margin: 0 auto;
  max-width: 1200px;
  line-height: 1.5;

  h3 {
    font-size: 1.5rem;
    margin-top: 12px;
  }
`;
const VimeoContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background: #000;

  iframe {
    background: #000;
    position: absolute;
    top: -10%;
    left: 0;
    width: 100vw;
    height: 50vh;
    background-size: cover;
  }
`;
const WorkTitelContainer$1 = styled.div`
  margin: 30px auto 50px;
`;
const WorkTitel$1 = styled.h1`
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 28px;
  line-height: 162%;
  color: #fff;
  text-align: center;

  @media (min-width: 744px) {
    font-size: 48px;
  }
`;
const WorkFilterWrapp$1 = styled.div`
  margin: 0 auto;
  display: flex;
  gap: 25px;
  justify-content: center;
`;
const activeStyles = css`
  color: rgb(255, 247, 247);
  pointer-events: none;
  cursor: default;
`;
const WorkTextFilter$1 = styled.a`
  font-family: var(--second-family);
  font-weight: 400;
  font-size: 13px;
  line-height: 162%;
  color: #808080;
  text-decoration: none;
  transition: all 0.3s ease-in-out;

  &.active {
    ${activeStyles};
  }

  @media (min-width: 744px) {
    font-size: 16px;
  }
`;
const COLLECTION_1SEC_TITLE = styled.h4`
  padding-bottom: 20px;

  @media (min-width: 1440px) {
    padding-bottom: 30px;
  }
`;
const COLLECTION_1SEC_DESCRIPTION = styled.div`
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 162%;
  color: #fff;

  @media (min-width: 1440px) {
    font-size: 16px;
  }

  h1 {
  }
  h2 {
  }
  h3 {
  }
  span {
  }
  a {
    text-decoration: underline;
  }
  a:hover {
  }
`;
const CollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: auto;
  padding-bottom: 32px;

  @media (min-width: 744px) {
    width: 50%;
  }

  @media (min-width: 1440px) {
    width: 300px;
  }
`;
const COLLECTION_4SEC_TITLE = styled.h4`
  color: #808080;

  @media (min-width: 1440px) {
    padding-bottom: 30px;
  }
`;
const COLLECTION_TEXT_TITLE_WRAPPER = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${({ align }) => align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"};
  align-items: center;
  padding: 20px 0;
  gap: 10px;

  position: relative;
  width: 100%;
  max-width: 1440px;
  height: 100px;

  background: #000;
  margin: 0 auto;
`;
const COLLECTION_TEXT_TITLE = styled.h1`
  margin: 0;
  flex: none;
  order: 0;
  flex-grow: 0;

  width: auto;
  height: auto;

  font-size: ${({ fontSize }) => fontSize ? `${fontSize}px` : "32px"};
  line-height: 1;
  text-align: ${({ align }) => align || "left"};
  color: #fff;
`;
const COLLECTION_4SEC_DESCRIPTION = styled.h1`
  padding-bottom: 8px;
`;
const CollectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 0px 40px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 744px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
    padding: 50px 0px;
    align-items: flex-start;
  }
`;
const CollectionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 20px 0px 40px;
  width: 100%;

  @media (min-width: 744px) {
    padding: 20px 0px 40px;
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
    padding: 20px 0px 60px;
  }
`;
const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || "16 / 9"};
  overflow: hidden;
  display: flex;
  align-items: center;

  touch-action: pan-y;
`;
const SliderContent = styled.div`
  display: flex;
  transition: ${({ animate, isDragging }) => !animate || isDragging ? "none" : "transform 0.5s cubic-bezier(0.25, 0, 0.2, 1)"};
  transform: ${({ index, offset }) => `translateX(calc(-${index * 100}% + ${offset}px))`};
`;
const Slide = styled.div`
  min-width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const Arrow = styled.button`
  position: absolute;
  top: 50%;
  ${({ left }) => left ? "left: 0px" : "right: 0px"};
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2;
  padding: 0;
  display: flex;
  align-items: center;
  width: 64px;
  height: 64px;
  justify-content: center;
  opacity: 0.66;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  @media (min-width: 1080px) {
    width: 96px;
    height: 96px;
  }

  img {
    width: 12px;
    height: auto;
    pointer-events: none;

    @media (min-width: 1080px) {
      width: 16px;
    }
  }
`;
const IMAGE_BASEGRID = styled.div`
  display: grid;
  width: 100%;
  gap: 3px;
  margin-bottom: 3rem;

  img {
    width: 100%;
    aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || "16 / 9"};
    object-fit: cover;
    cursor: pointer;
    display: block;
  }

  @media (max-width: 743px) {
    grid-template-columns: 1fr;
  }
`;
const IMAGE_DOUBLE = styled(IMAGE_BASEGRID).attrs({ as: "div" })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(2, 1fr)" : $itemsCount >= 2 ? "repeat(2, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(2, 1fr)" : $itemsCount >= 2 ? "repeat(2, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
`;
const IMAGE_TRIPLE = styled(IMAGE_BASEGRID).attrs({ as: "div" })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(3, 1fr)" : $itemsCount >= 3 ? "repeat(3, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(3, 1fr)" : $itemsCount >= 3 ? "repeat(3, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
`;
const IMAGE_QUADRUPLE = styled(IMAGE_BASEGRID).attrs({ as: "div" })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(4, 1fr)" : $itemsCount >= 4 ? "repeat(4, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(4, 1fr)" : $itemsCount >= 4 ? "repeat(4, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
`;
const IMAGE_QUINTUPLE = styled(IMAGE_BASEGRID).attrs({ as: "div" })`
  @media (min-width: 744px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(5, 1fr)" : $itemsCount >= 5 ? "repeat(5, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
  @media (min-width: 1440px) {
    grid-template-columns: ${({ $itemsCount }) => !$itemsCount ? "repeat(5, 1fr)" : $itemsCount >= 5 ? "repeat(5, 1fr)" : `repeat(${$itemsCount}, 1fr)`};
  }
`;
const CollectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 2rem 0;

  @media (min-width: 744px) {
    flex-direction: row;
    align-items: center;
    .image-container {
      max-width: 744px;
    }
  }

  @media (min-width: 1440px) {
    max-width: 1440px;
    margin: 0 auto;
  }
`;
const TextBlock$1 = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  aspect-ratio: 1;
  h1 {
    font-size: 32px;
  }

  @media (min-width: 744px) {
    width: 50%;
    text-align: center;
    align-items: center;
    margin: 0 auto;
    padding: 80px;

    h1 {
      font-size: 32px;
    }
  }
`;
const ImageBlock = styled.div`
  width: 100%;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    cursor: pointer;
  }

  @media (min-width: 744px) {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
  }
`;
const CUSTOM_SPLITTER = styled.div`
  /* внешний контейнер */
  width: 100%;
  display: flex;
  justify-content: center; /* центрируем линию */
  padding: 9px 18px;
  background: #000;

  @media (min-width: 744px) {
    padding: 0px 24px;
  }

  /* сама линия */
  &::after {
    content: '';
    width: 100%;
    max-width: 1440px;
    height: 1px;
    background: #d9d9d9;
  }
`;
const FooterContainer = styled.footer`
  width: 100%;
  background: #000;   /* фон футера */
  color: #fff;
`;
const Footer = () => {
  const [sections, setSections] = useState([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("footer_sections").select("*").order("position");
      if (error) {
        console.error("[Footer] fetch error:", error.message);
      } else {
        setSections(data);
      }
    })();
  }, []);
  if (!sections.length) return null;
  const grouped = sections.reduce((acc, sec) => {
    acc[sec.label] = acc[sec.label] ? [...acc[sec.label], sec] : [sec];
    return acc;
  }, {});
  return /* @__PURE__ */ jsxs(FooterContainer, { children: [
    "        ",
    /* @__PURE__ */ jsx(CUSTOM_SPLITTER, {}),
    "             ",
    /* @__PURE__ */ jsx(CollectionAdditionalWrapper, { children: /* @__PURE__ */ jsx(CollectionHeader, { children: Object.entries(grouped).map(([label, items]) => /* @__PURE__ */ jsxs(CollectionWrapper, { children: [
      /* @__PURE__ */ jsx(COLLECTION_4SEC_TITLE, { children: label }),
      items.length === 1 ? renderItem(items[0]) : /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: items.map(renderItem) })
    ] }, label)) }) })
  ] });
};
function renderItem(sec) {
  const Tag = sec.tag || "h3";
  if (sec.link) {
    const external = /^https?:\/\//i.test(sec.link);
    return /* @__PURE__ */ jsx(
      "a",
      {
        href: sec.link,
        target: external ? "_blank" : void 0,
        rel: external ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none" },
        children: /* @__PURE__ */ jsx(
          COLLECTION_4SEC_DESCRIPTION,
          {
            as: Tag,
            dangerouslySetInnerHTML: { __html: sec.text }
          }
        )
      },
      sec.id
    );
  }
  return /* @__PURE__ */ jsx(
    COLLECTION_4SEC_DESCRIPTION,
    {
      as: Tag,
      dangerouslySetInnerHTML: { __html: sec.text }
    },
    sec.id
  );
}
const Layout = () => {
  const location = useLocation();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx(Suspense, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
    location.pathname !== "/" && location.pathname !== "/home" && /* @__PURE__ */ jsx(Footer, {})
  ] });
};
const DisableContext = createContext(false);
const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};
const Reveal = ({
  children,
  className
}) => {
  const disabled = useContext(DisableContext);
  if (disabled) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className,
      initial: "hidden",
      whileInView: "show",
      viewport: { once: true, amount: 0.3 },
      variants: revealVariants,
      children
    }
  );
};
const AdditionalWrapper$1 = styled$1.div`
padding: 0px 18px;

@media screen and (min-width: 744px){
padding: 0px 24px;
}
`;
const AboutContainer = styled$1.div`
margin: 78px auto 10px;
height: 100%;
max-width: 1440px;
padding: 16px 32px;
display: flex;
flex-direction: column;
margin-bottom: 24px;
padding: 16px 0px;

@media screen and (min-width: 744px){
margin-bottom: 32px;
}

@media screen and (min-width: 1440px){

height: 100%;
max-width: 1440px;
display: flex;
flex-direction: column;
margin-bottom: 48px;
}
  `;
const AboutTitle = styled$1.h1`

font-family: var(--font-family);
font-weight: 600;
font-size: 32px;
line-height: 162%;
color: #fff;
    `;
const AboutItem = styled$1.div`
display: flex;    
flex-direction: column;
gap: 10px;
align-items: flex-start;
margin-top: 30px;
`;
const AboutText = styled$1.p`
font-family: var(--second-family);
font-weight: 400;
font-size: 16px;
letter-spacing: -0.02em;
color: #808080;
padding: 10px 0;
`;
const AboutDescription = styled$1.p`
font-family: var(--font-family);
font-weight: 600;
font-size: 18px;
line-height: 162%;
color: #fff;
`;
const AboutUs = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("about_blocks").select("*").order("id");
      if (error) console.error(error);
      setBlocks(data || []);
      setLoading(false);
    })();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxs(AboutContainer, { children: [
      /* @__PURE__ */ jsx(AboutTitle, { children: "About Me" }),
      /* @__PURE__ */ jsx("p", { style: { color: "#fff" }, children: "Loading…" })
    ] });
  }
  return /* @__PURE__ */ jsx(AdditionalWrapper$1, { children: /* @__PURE__ */ jsxs(AboutContainer, { children: [
    /* @__PURE__ */ jsx(AboutTitle, { children: "About Me" }),
    blocks.map((block) => /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsxs(AboutItem, { children: [
      /* @__PURE__ */ jsx(AboutText, { children: block.title }),
      block.content.items.map((it, idx) => /* @__PURE__ */ jsx(AboutDescription, { children: it.text.split("<br/>").map((line, i) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
        line,
        /* @__PURE__ */ jsx("br", {})
      ] }, i)) }, idx))
    ] }) }, block.id))
  ] }) });
};
const fadeInScale = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  animation: ${fadeInScale} 0.15s ease-out;
`;
const ModalContent = styled.div`
  position: relative;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  animation: ${fadeInScale} 0.15s ease-out;
`;
const MediaContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
  max-height: calc(100vh - 150px);
  width: 100%;
  overflow: hidden;

  img {
    height: auto;
    max-height: 100%;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    align-self: stretch;
  }
`;
const TextContainer = styled.div`
  color: #fff;
  text-align: center;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  position: sticky;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  padding: 15px;
`;
const CloseButton = styled.button`
  position: fixed;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  top: 36px;
  right: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 100;
  isolation: isolate; /* нужно для ::before */

  &::before {
    content: '';
    position: absolute;
    inset: -50px; /* расширяем зону наведения */
    border-radius: 50%;
    z-index: -1;
  }

  svg path {
    fill: rgb(128, 128, 128);
    transition: fill 0.3s ease;
  }

  &:hover svg path {
    fill: #fff;
  }

  svg {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
`;
const MODAL_DESCRIPTION = styled.p`
  font-family: var(--second-family);
  font-size: 12px;
  color: #808080;

  @media (min-width: 1440px) {
    font-size: 16px;
    padding-bottom: 30px;
  }
`;
const MODAL_TITLE = styled.h1`
  font-family: var(--font-family);
  font-size: 18px;
  color: #fff;
  padding-bottom: 32px;

  @media (min-width: 744px) {
    font-size: 20px;
  }
  @media (min-width: 1440px) {
    font-size: 24px;
  }
`;
const Modal = ({ onClose, children, preventScroll = true }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (preventScroll) {
      const y = window.scrollY;
      document.body.dataset.scrollY = String(y);
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (preventScroll) {
        const y = parseInt(document.body.dataset.scrollY || "0", 10);
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        delete document.body.dataset.scrollY;
        const html = document.documentElement;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, y);
        html.style.scrollBehavior = "";
      }
    };
  }, [onClose, preventScroll]);
  return /* @__PURE__ */ jsx(ModalOverlay, { onClick: onClose, children: /* @__PURE__ */ jsx(ModalContent, { children }) });
};
const Loading = "E:/Upwork/portfolio/src/assets/video/logo_animated_hq.webm";
const CloseIcon = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M30.1176%200L32%201.88235L1.88235%2032L0%2030.1176L30.1176%200Z'%20fill='white'/%3e%3cpath%20d='M32.0002%2030.1177L30.1178%2032L0.000217307%201.88241L1.88257%205.89487e-05L32.0002%2030.1177Z'%20fill='white'/%3e%3c/svg%3e";
const Left = "data:image/svg+xml,%3csvg%20width='18'%20height='33'%20viewBox='0%200%2018%2033'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20x='16'%20y='0.5'%20width='2.26274'%20height='22.6274'%20transform='rotate(45%2016%200.5)'%20fill='white'/%3e%3crect%20x='17.5996'%20y='30.8999'%20width='2.26274'%20height='22.6274'%20transform='rotate(135%2017.5996%2030.8999)'%20fill='white'/%3e%3c/svg%3e";
const Right = "data:image/svg+xml,%3csvg%20width='18'%20height='33'%20viewBox='0%200%2018%2033'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20x='2'%20y='32.5'%20width='2.26274'%20height='22.6274'%20transform='rotate(-135%202%2032.5)'%20fill='white'/%3e%3crect%20x='0.400391'%20y='2.1001'%20width='2.26274'%20height='22.6274'%20transform='rotate(-45%200.400391%202.1001)'%20fill='white'/%3e%3c/svg%3e";
const CollectionComponent = ({
  collection,
  source
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [filter, setFilter] = useState(
    searchParams.get("filter") || "ALL"
  );
  const updateUrlFilter = (newFilter) => {
    const params = new URLSearchParams(location.search);
    params.set("filter", newFilter);
    window.history.replaceState({}, "", `${location.pathname}?${params}`);
  };
  const showFilter = location.pathname === "/work" || location.pathname === "/photo";
  const bucket = source === "work" ? "work-images" : "photography-images";
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState({
    url: "",
    type: "image",
    altText: "",
    title: "",
    description: ""
  });
  const failedMedia = useRef(/* @__PURE__ */ new Set());
  const vimeoPlayerRef = useRef(null);
  const vimeoContainerRef = useRef(null);
  const imageUrl = (fileName) => `${supabaseUrl}/storage/v1/object/public/${bucket}/${collection.folder}/${fileName}`;
  const openModal = (src, type, title = "", description = "") => {
    if (failedMedia.current.has(src)) return;
    setCurrentMedia({
      url: src,
      type,
      altText: title,
      title,
      description
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const blocksTable = source === "work" ? "project_blocks" : "collection_blocks";
      const { data, error } = await supabase.from(blocksTable).select("*").eq("collection_id", collection.id).order("position");
      if (error) console.error(error);
      setBlocks(data || []);
      setIsLoading(false);
    })();
  }, [collection.id, source]);
  useEffect(() => {
    if (isModalOpen && currentMedia.type === "video" && currentMedia.vimeoId && vimeoContainerRef.current) {
      vimeoPlayerRef.current = new Player(vimeoContainerRef.current, {
        id: Number(currentMedia.vimeoId),
        width: 1280,
        height: 720,
        autoplay: true
      });
      return () => {
        if (vimeoPlayerRef.current) {
          vimeoPlayerRef.current.destroy().catch(() => {
          });
          vimeoPlayerRef.current = null;
        }
      };
    }
  }, [isModalOpen, currentMedia]);
  const ImageSlider = ({ images, aspectRatio }) => {
    const slides = [images[images.length - 1], ...images, images[0]];
    const [index, setIndex] = useState(1);
    const [animate, setAnimate] = useState(true);
    const [offset, setOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const transitioningRef = useRef(false);
    const sliderRef = useRef(null);
    const slideWidthRef = useRef(0);
    const startXRef = useRef(0);
    const lastXRef = useRef(0);
    const startTimeRef = useRef(0);
    const lastTimeRef = useRef(0);
    const lastVelocityRef = useRef(0);
    const autoPlayRef = useRef();
    const prevSlide = () => {
      if (transitioningRef.current) return;
      setAnimate(true);
      setIndex((i) => i - 1);
      transitioningRef.current = true;
    };
    const nextSlide = () => {
      if (transitioningRef.current) return;
      setAnimate(true);
      setIndex((i) => i + 1);
      transitioningRef.current = true;
    };
    const onPointerDown = (e) => {
      if (e.target.closest("button") || transitioningRef.current) return;
      const el = sliderRef.current;
      el.setPointerCapture(e.pointerId);
      setIsDragging(true);
      slideWidthRef.current = el.clientWidth;
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX;
      startTimeRef.current = Date.now();
      lastTimeRef.current = Date.now();
      lastVelocityRef.current = 0;
      setAnimate(false);
    };
    const onPointerMove = (e) => {
      if (!isDragging || transitioningRef.current) return;
      const now = Date.now();
      const dxLocal = e.clientX - lastXRef.current;
      const dtLocal = now - lastTimeRef.current;
      if (dtLocal > 0) lastVelocityRef.current = dxLocal / dtLocal;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
      const dx = e.clientX - startXRef.current;
      setOffset(dx);
    };
    const onPointerUp = (e) => {
      if (!isDragging) return;
      const el = sliderRef.current;
      el.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      const dx = offset;
      const vel = Math.abs(lastVelocityRef.current);
      const threshold = slideWidthRef.current * 0.5;
      let newIdx = index;
      if (dx > threshold || vel > 0.2) newIdx = index - 1;
      if (dx < -threshold || vel > 0.2) newIdx = index + 1;
      setAnimate(true);
      setOffset(0);
      if (!transitioningRef.current) {
        setIndex(newIdx);
        transitioningRef.current = true;
      }
    };
    const handleTransitionEnd = () => {
      transitioningRef.current = false;
      if (index === 0) {
        setAnimate(false);
        setIndex(images.length);
      } else if (index === slides.length - 1) {
        setAnimate(false);
        setIndex(1);
      }
    };
    useEffect(() => {
      if (!animate) requestAnimationFrame(() => setAnimate(true));
    }, [animate]);
    useEffect(() => {
      const obs = new IntersectionObserver(
        ([entry]) => setIsVisible(entry.isIntersecting),
        { threshold: 0.5 }
      );
      if (sliderRef.current) obs.observe(sliderRef.current);
      return () => obs.disconnect();
    }, []);
    useEffect(() => {
      if (isVisible && !isDragging && !transitioningRef.current) {
        autoPlayRef.current = window.setInterval(() => {
          nextSlide();
        }, 3e3);
      } else {
        window.clearInterval(autoPlayRef.current);
      }
      return () => window.clearInterval(autoPlayRef.current);
    }, [isVisible, isDragging]);
    return /* @__PURE__ */ jsxs(
      SliderWrapper,
      {
        ref: sliderRef,
        $aspectRatio: aspectRatio,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerLeave: onPointerUp,
        children: [
          /* @__PURE__ */ jsx(Arrow, { left: true, onClick: prevSlide, children: /* @__PURE__ */ jsx("img", { src: Left, alt: "Prev" }) }),
          /* @__PURE__ */ jsx(Arrow, { onClick: nextSlide, children: /* @__PURE__ */ jsx("img", { src: Right, alt: "Next" }) }),
          /* @__PURE__ */ jsx(
            SliderContent,
            {
              index,
              animate,
              offset,
              isDragging,
              onTransitionEnd: handleTransitionEnd,
              children: slides.map((img, i) => /* @__PURE__ */ jsx(Slide, { children: /* @__PURE__ */ jsx("img", { src: img.src, alt: img.title || "", draggable: false }) }, i))
            }
          )
        ]
      }
    );
  };
  const blockTypeToWrapper = {
    IMAGE_DOUBLE,
    IMAGE_TRIPLE,
    IMAGE_QUADRUPLE,
    IMAGE_QUINTUPLE
  };
  const renderImageGridBlock = (b) => {
    var _a, _b;
    const items = ((_a = b.content) == null ? void 0 : _a.items) || [];
    const aspectRatio = ((_b = b.content) == null ? void 0 : _b.aspectRatio) || "16 / 9";
    if (!items.length) return null;
    const Wrapper2 = blockTypeToWrapper[b.type];
    if (!Wrapper2) return null;
    return /* @__PURE__ */ jsx(
      Wrapper2,
      {
        $itemsCount: items.length,
        $aspectRatio: aspectRatio,
        children: items.map((item, i) => /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          "img",
          {
            src: imageUrl(item.src),
            alt: item.title || "",
            onClick: () => openModal(
              imageUrl(item.src),
              "image",
              item.title || "",
              item.description || ""
            )
          }
        ) }, i))
      },
      b.id
    );
  };
  const renderBlock = (b) => {
    var _a, _b, _c, _d;
    switch (b.type) {
      case "IMAGE_SINGLE": {
        const aspectRatio = ((_a = b.content) == null ? void 0 : _a.aspectRatio) || "2 / 1";
        const images = ((_b = b.content.items) == null ? void 0 : _b.map((image) => ({
          src: imageUrl(image.src),
          title: image.title,
          description: image.description
        }))) || [];
        if (images.length === 0) return null;
        return /* @__PURE__ */ jsx(ImageSlider, { images, aspectRatio });
      }
      case "IMAGE_DOUBLE":
      case "IMAGE_TRIPLE":
      case "IMAGE_QUADRUPLE":
      case "IMAGE_QUINTUPLE":
        return renderImageGridBlock(b);
      /* ----- квадрат + текст ----- */
      /* ----- квадрат + текст ----- */
      case "SQUARES_2_1":
      case "SQUARES_1_2": {
        const item = (_c = b.content.items) == null ? void 0 : _c[0];
        if (!item) return null;
        const Pic = /* @__PURE__ */ jsx(ImageBlock, { children: /* @__PURE__ */ jsx(
          "img",
          {
            src: imageUrl(item.src),
            alt: item.title || "",
            onClick: () => openModal(
              imageUrl(item.src),
              "image",
              item.title || "",
              // <-- это заголовок внутри модалки
              item.description || ""
              // <-- это описание внутри модалки
            )
          }
        ) });
        const Txt = /* @__PURE__ */ jsx(TextBlock$1, { children: item.label && /* @__PURE__ */ jsx("h1", { children: item.label.split("\n").map((line, i) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
          line,
          /* @__PURE__ */ jsx("br", {})
        ] }, i)) }) });
        return /* @__PURE__ */ jsxs(CollectionBlock, { children: [
          b.type === "SQUARES_1_2" ? Txt : Pic,
          b.type === "SQUARES_1_2" ? Pic : Txt
        ] }, b.id);
      }
      case "TEXT_4SEC":
        return /* @__PURE__ */ jsx(CollectionAdditionalWrapper, { children: /* @__PURE__ */ jsx(
          CollectionHeader,
          {
            style: b.type.endsWith("_LP") ? { padding: "10px 0" } : {},
            children: b.content.sections.map((s, i) => /* @__PURE__ */ jsxs(CollectionWrapper, { children: [
              /* @__PURE__ */ jsx(COLLECTION_4SEC_TITLE, { children: s.label }),
              /* @__PURE__ */ jsx(COLLECTION_4SEC_DESCRIPTION, { as: s.tag || "h1", children: s.text.split("\n").map((line, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
                line,
                /* @__PURE__ */ jsx("br", {})
              ] }, index)) })
            ] }, i))
          },
          b.id
        ) });
      case "TEXT_2SEC":
        return /* @__PURE__ */ jsx(CollectionAdditionalWrapper, { children: /* @__PURE__ */ jsx(
          CollectionHeader,
          {
            style: b.type.endsWith("_LP") ? { padding: "10px 0" } : {},
            children: b.content.sections.map((s, i) => /* @__PURE__ */ jsxs(CollectionWrapper, { children: [
              /* @__PURE__ */ jsx(COLLECTION_4SEC_TITLE, { children: s.label }),
              /* @__PURE__ */ jsx(COLLECTION_4SEC_DESCRIPTION, { as: s.tag || "h1", children: s.text.split("\n").map((line, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
                line,
                /* @__PURE__ */ jsx("br", {})
              ] }, index)) })
            ] }, i))
          },
          b.id
        ) });
      case "TEXT_1SEC":
      case "TEXT_1SEC_LP":
        return /* @__PURE__ */ jsx(CollectionAdditionalWrapper, { children: /* @__PURE__ */ jsx(CollectionTextWrapper, { children: b.content.sections.map((section, i) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(COLLECTION_1SEC_TITLE, { children: section.label }),
          /* @__PURE__ */ jsx(COLLECTION_1SEC_DESCRIPTION, { children: section.segments.map((seg, idx) => {
            const Tag = seg.tag || "span";
            const renderTextWithBreaks = (text) => text.split("\n").map((line, lineIdx) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
              line,
              lineIdx < text.split("\n").length - 1 && /* @__PURE__ */ jsx("br", {})
            ] }, lineIdx));
            const element = /* @__PURE__ */ jsx(Tag, { style: { display: "inline" }, children: renderTextWithBreaks(seg.text) }, idx);
            return seg.link ? /* @__PURE__ */ jsx(
              "a",
              {
                href: seg.link,
                target: "_blank",
                rel: "noopener noreferrer",
                children: element
              },
              idx
            ) : element;
          }) })
        ] }, i)) }, b.id) });
      case "TEXT_TITLE": {
        const { style, text, fontsize, align } = b.content;
        return /* @__PURE__ */ jsx(COLLECTION_TEXT_TITLE_WRAPPER, { align, children: /* @__PURE__ */ jsx(
          COLLECTION_TEXT_TITLE,
          {
            as: style,
            fontSize: fontsize,
            align,
            children: text
          }
        ) }, b.id);
      }
      /* ----- Vimeo ----- */
      case "VIMEO_PLAYER":
        return /* @__PURE__ */ jsxs(PlayerVimeo, { children: [
          /* @__PURE__ */ jsx(VimeoVideoContainer, { children: /* @__PURE__ */ jsx(
            "iframe",
            {
              src: `https://player.vimeo.com/video/${b.content.vimeoId}?autoplay=0&loop=0&title=0&byline=0&portrait=0&controls=1&share=1`,
              allow: "autoplay; fullscreen; picture-in-picture",
              allowFullScreen: true,
              frameBorder: 0
            }
          ) }),
          b.description && /* @__PURE__ */ jsxs(VideoCaption, { children: [
            /* @__PURE__ */ jsx("p", { children: b.description }),
            collection.work_title && /* @__PURE__ */ jsx("h3", { children: collection.work_title })
          ] })
        ] }, b.id);
      /* ----- разделители ----- */
      case "SPLITTER_DEFAULT":
        return /* @__PURE__ */ jsx("hr", { style: { margin: "20px 0", borderColor: "#444" } }, b.id);
      case "SPLITTER":
        return /* @__PURE__ */ jsx(CUSTOM_SPLITTER, {});
      case "SPLITTER_SPACE": {
        const height = ((_d = b.content) == null ? void 0 : _d.size) || "100px";
        return /* @__PURE__ */ jsx("div", { style: { height } }, b.id);
      }
      default:
        return null;
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000"
        },
        children: /* @__PURE__ */ jsx(
          "video",
          {
            src: Loading,
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            style: { width: 150, height: 150 }
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsxs(CollectionContainer, { children: [
    showFilter && /* @__PURE__ */ jsxs(WorkTitelContainer$1, { children: [
      /* @__PURE__ */ jsx(WorkTitel$1, { children: source === "photo" ? "PHOTOGRAPHY" : "WORK" }),
      /* @__PURE__ */ jsx(WorkFilterWrapp$1, { children: ["ALL", "COMMERCIAL", "PERSONAL"].map((cat) => /* @__PURE__ */ jsx(
        WorkTextFilter$1,
        {
          onClick: () => {
            if (filter !== cat) {
              setFilter(cat);
              updateUrlFilter(cat);
            }
          },
          className: filter === cat ? "active" : "",
          children: cat
        },
        cat
      )) })
    ] }),
    collection.main && /* @__PURE__ */ jsx(CollectionAdditionalWrapper, { children: /* @__PURE__ */ jsx(CollectionHeader, { children: collection.main.map(
      (s, i) => /* @__PURE__ */ jsxs(CollectionWrapper, { children: [
        /* @__PURE__ */ jsx(COLLECTION_4SEC_TITLE, { children: s.label }),
        /* @__PURE__ */ jsx(
          COLLECTION_4SEC_DESCRIPTION,
          {
            as: s.tag || "h1",
            dangerouslySetInnerHTML: { __html: s.text }
          }
        )
      ] }, i)
    ) }) }),
    blocks.map((b) => /* @__PURE__ */ jsx(Reveal, { children: renderBlock(b) }, b.id)),
    isModalOpen && /* @__PURE__ */ jsxs(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), children: [
      /* @__PURE__ */ jsx(CloseButton, { onClick: closeModal, children: /* @__PURE__ */ jsx(CloseIcon, {}) }),
      /* @__PURE__ */ jsx(MediaContainer, { children: currentMedia.type === "image" ? /* @__PURE__ */ jsx(
        "img",
        {
          src: currentMedia.url,
          alt: currentMedia.altText,
          "data-modal-img": true
        }
      ) : currentMedia.vimeoId ? /* @__PURE__ */ jsx(VimeoContainer, { ref: vimeoContainerRef }) : /* @__PURE__ */ jsx(
        "video",
        {
          src: currentMedia.url,
          controls: true,
          autoPlay: true,
          style: { maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }
        }
      ) }),
      (currentMedia.title || currentMedia.description || collection.work_title) && /* @__PURE__ */ jsxs(TextContainer, { children: [
        currentMedia.title && /* @__PURE__ */ jsx(MODAL_TITLE, { style: { paddingTop: "20px", paddingBottom: "5px" }, children: currentMedia.title }),
        currentMedia.description && /* @__PURE__ */ jsx(MODAL_DESCRIPTION, { style: { paddingTop: "10px", paddingBottom: "30px" }, children: currentMedia.description })
      ] })
    ] })
  ] });
};
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
const ArrowButton = styled.button`
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
  justify-content: ${({ side }) => side === "left" ? "flex-start" : "flex-end"};
  transition: all 0.3s;

  &:hover {
    color: rgba(98, 98, 98, 0.9);
    fill: rgba(98, 98, 98, 0.9);
  }
`;
const ArrowImage = styled.img`
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
const CollectionSlider = ({
  source,
  currentId,
  collectionIds,
  collectionName
}) => {
  const navigate = useNavigate();
  const currentIndex = collectionIds.findIndex((id) => id === currentId);
  const navigateTo = (newIndex) => {
    if (collectionIds.length === 0) return;
    const idx = (newIndex + collectionIds.length) % collectionIds.length;
    const base = source === "work" ? "/work" : "/photography";
    navigate(`${base}/${collectionIds[idx]}`);
  };
  if (collectionIds.length <= 1) return null;
  return /* @__PURE__ */ jsx(CollectionAdditionalWrapper, { children: /* @__PURE__ */ jsxs(NavigationWrapper, { children: [
    /* @__PURE__ */ jsx(ArrowButton, { side: "left", onClick: () => navigateTo(currentIndex - 1), children: /* @__PURE__ */ jsx(ArrowImage, { src: Left, alt: "Previous" }) }),
    /* @__PURE__ */ jsx(CollectionName, { children: collectionName }),
    /* @__PURE__ */ jsx(ArrowButton, { side: "right", onClick: () => navigateTo(currentIndex + 1), children: /* @__PURE__ */ jsx(ArrowImage, { src: Right, alt: "Next" }) })
  ] }) });
};
const WorkContainer = styled.div`

display: flex;
    flex-direction: column;
margin: 78px 0px auto;
@media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
const WorkTitelContainer = styled.div`
margin: 0 auto;
margin-top: 30px;
margin-bottom: 50px;
@media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
const WorkTitel = styled.h1`
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
const WorkFilterWrapp = styled.div`
    margin: 0 auto;
    display: flex;
    gap: 8%;
    flex-direction: row;
    justify-content: center;
@media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
const WorkTextFilter = styled.a`
  font-family: var(--second-family);
  font-weight: 400;
  font-size: 13px;
  line-height: 162%;
   color: #808080;
  cursor: pointer;
  text-decoration: none;

  transition: all 0.3s ease-in-out;
  position: relative;

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
  }

  @media screen and (min-width: 1440px) {
    // Можна додавати додаткові стилі для великих екранів
  }
`;
const WorkItemContainer = styled.div`
  cursor: pointer;
  width: 100%;
  position: relative;
  overflow: hidden;
  margin-bottom: 4px;
  margin-top: 4px;
  aspect-ratio: 21/9;
  
  @media screen and (min-width: 744px) {
    aspect-ratio: 32/9;
    margin-bottom: 5px;
    margin-top: 5px;
  }
  
  @media screen and (min-width: 1440px) {
    aspect-ratio: 48/9;
    margin-bottom: 6px;
    margin-top: 6px;
  }
`;
const PreviewLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: ${(props) => props.$isVisible ? 1 : 0};
  z-index: 1;
  will-change: opacity;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
    opacity: ${(props) => props.$isVisible ? 0 : 1};
    transition: opacity 0.6s ease-in-out;
    z-index: 1;
    pointer-events: none;
  }
`;
const OriginalLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: ${(props) => props.$isVisible ? 1 : 0};
  z-index: 0;
  will-change: opacity;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const VideoPreview = styled.div`
  position: absolute;        // 👈 fixed — прив’язка до viewport
  top: 0;
  left: 0;
  width: 100vw;           // 👈 повна ширина екрана
  height: 100vh;          // 👈 повна висота екрана
  overflow: hidden;     /* 👈 або фіксована висота */
  z-index: 1000;     /* 👈 поверх усього */
  transition: opacity 0.3s ease-out;
  opacity: ${(props) => props.$isVisible ? 1 : 0};
  z-index: 0;
  will-change: opacity;
  background-color: #000;

  video {
    position: absolute;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    top: 0;
    left: 0;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${(props) => props.$isVisible ? "47%" : "100%"};
    background: ${(props) => props.$isVisible ? "linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%)" : `url(${props.$imageUrl})`};
    background-size: cover;
    background-position: center;
    transition: all 0.6s ease-in-out;
    z-index: 1;
    pointer-events: none;
  }
`;
const ImageDescription = styled.p`
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  position: absolute;
  bottom: 20px;
  left: 20px;
  opacity: ${(props) => props.$isVisible ? 1 : 0};
  transition: opacity 0.4s ease-out;
  z-index: 2;
  will-change: opacity;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  
  @media screen and (min-width: 744px) {
    font-size: 22px;
  }
`;
const WorkPhotoWrapp = styled.div`
margin-bottom: 50px;
@media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
styled.div`
height: 200px;
width: 100%;
@media screen and (min-width: 744px){
height: 270px
position: relative;

}

@media screen and (min-width: 1440px){
height: 400px;

}
`;
styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
@media screen and (min-width: 744px){


}

@media screen and (min-width: 1440px){


}
`;
styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.$src});
  background-size: cover;
  background-position: center;
  transition: opacity 0.5s ease-in-out;
  z-index: 1;
`;
styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease-in-out;
  z-index: 0;
`;
styled.div`
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
styled.h3`
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
styled.p`
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
const NotFoundWraperr = styled.div`
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
const NotFoundText = styled.p`
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
const CollectionPage = ({ source }) => {
  var _a, _b;
  const { id } = useParams();
  const blocksTable = source === "work" ? "project_blocks" : "collection_blocks";
  const parentTable = source === "work" ? "work" : "photography";
  const [project, setProject] = useState(null);
  const [allIds, setAllIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: workData, error: workErr } = await supabase.from(parentTable).select("id, title, folder").eq("id", id).single();
        if (workErr) throw workErr;
        if (!workData) {
          setProject(null);
          return;
        }
        const { data: workList, error: listErr } = await supabase.from(parentTable).select("id");
        if (listErr) throw listErr;
        setAllIds((workList == null ? void 0 : workList.map((w) => w.id)) || []);
        const { data: blocks, error: blocksErr } = await supabase.from(blocksTable).select("*").eq("collection_id", workData.id).order("position", { ascending: true });
        if (blocksErr) throw blocksErr;
        setProject({
          ...workData,
          blocks: blocks || []
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [loading]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { style: {
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#000"
    }, children: /* @__PURE__ */ jsx("video", { src: Loading, autoPlay: true, loop: true, muted: true, playsInline: true, style: { width: 150, height: 150 } }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { style: {
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#000"
    }, children: /* @__PURE__ */ jsxs("p", { style: { color: "#fff" }, children: [
      "Error: ",
      error
    ] }) });
  }
  if (!project) {
    return /* @__PURE__ */ jsx(NotFoundWraperr, { children: /* @__PURE__ */ jsxs(NotFoundText, { children: [
      "404",
      /* @__PURE__ */ jsx("br", {}),
      "NOT FOUND"
    ] }) });
  }
  const firstTextBlock = project.blocks.find((b) => b.type.startsWith("TEXT_"));
  const metaDescription = firstTextBlock ? (((_b = (_a = firstTextBlock.content.sections) == null ? void 0 : _a[0]) == null ? void 0 : _b.text) ?? "").slice(0, 160) : `Просмотр проекта ${project.title}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxs("title", { children: [
        project.title,
        " — MySite"
      ] }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: metaDescription }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: project.title }),
      /* @__PURE__ */ jsx("meta", { property: "og:description", content: metaDescription })
    ] }),
    /* @__PURE__ */ jsx(
      CollectionComponent,
      {
        collection: {
          id: project.id,
          folder: project.folder,
          blocks: project.blocks
        },
        source
      }
    ),
    /* @__PURE__ */ jsx(
      CollectionSlider,
      {
        source,
        currentId: project.id,
        collectionIds: allIds,
        collectionName: project.title
      }
    )
  ] });
};
const FormContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: 1440px;
`;
const FormGroup = styled.div``;
const Input = styled.input`
  font-family: var(--third-family);
  font-weight: 600;
  font-size: 16px;
  color: rgb(250, 250, 250);
  width: 100%;
  padding: 13px 20px;
  margin: 5px 0;
  background: #0c0c0c;
  border: 1px solid ${(props) => props.$hasError ? "#ff4d4f" : "transparent"};
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.$hasError ? "#ff4d4f" : "#1890ff"};
  }
`;
const Textarea = styled.textarea`
  font-family: var(--third-family);
  font-weight: 600;
  font-size: 16px;
  color: rgb(255, 255, 255);
  width: 100%;
  padding: 20px;
  margin: 5px 0;
  border: none;
  height: 100px;
  background: #0d0d0d;
  resize: none;
  overflow-y: auto;
`;
const Button = styled.button`
  width: 100%;
  padding: 10px 20px;
  background: #fff;
  font-family: var(--third-family);
  font-weight: 600;
  font-size: 16px;
  color: #000;
  border: none;
  cursor: pointer;

  &:hover {
    color: #808080;
    background: #0d0d0d;
  }
`;
styled.p`
  color: red;
`;
const Success = styled.p`
  color: green;
`;
const ContactForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const validateEmail = (email2) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email2);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!fullName || !email || !validateEmail(email)) {
      setError("Please fill out the required fields correctly.");
      return;
    }
    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          full_name: fullName,
          email,
          subject,
          message,
          created_at: /* @__PURE__ */ new Date()
        }
      ]);
      if (error) throw error;
      setSuccess(true);
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setError(null);
      setSubmitted(false);
    } catch (error) {
      setError("Something went wrong. Please try again later.");
      setSuccess(false);
    }
  };
  return /* @__PURE__ */ jsxs(FormContainer, { children: [
    success && /* @__PURE__ */ jsx(Success, { children: "Your message has been sent successfully!" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, id: "contactus", children: [
      /* @__PURE__ */ jsx(FormGroup, { children: /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Full Name (required)",
          value: fullName,
          onChange: (e) => setFullName(e.target.value),
          $hasError: submitted && !fullName,
          id: "fullName"
        }
      ) }),
      /* @__PURE__ */ jsx(FormGroup, { children: /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Email (required)",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          $hasError: submitted && (!email || !validateEmail(email)),
          id: "email",
          autoComplete: "email"
        }
      ) }),
      /* @__PURE__ */ jsx(FormGroup, { children: /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Subject",
          value: subject,
          onChange: (e) => setSubject(e.target.value),
          id: "subject"
        }
      ) }),
      /* @__PURE__ */ jsx(FormGroup, { children: /* @__PURE__ */ jsx(
        Textarea,
        {
          placeholder: "Message",
          value: message,
          onChange: (e) => setMessage(e.target.value),
          id: "message"
        }
      ) }),
      /* @__PURE__ */ jsx(Button, { type: "submit", children: "Send a Message" })
    ] })
  ] });
};
const AdditionalWrapper = styled.div`
padding: 0px 18px;

@media screen and (min-width: 744px){
padding: 0px 24px;
}
`;
const ContactContainer = styled.div`
margin: 78px auto 10px;
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
const ContactTitel = styled.h1`
font-family: var(--font-family);
font-weight: 600;
font-size: 32px;
line-height: 162%;
color: #fff;
`;
const WrapperInfo = styled.div`
display: flex;
gap: 20%;
 margin-top: 50px;
 margin-bottom: 50px;
@media screen and (min-width: 744px){
  gap: 50%;
}

@media screen and (min-width: 1440px){

display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 50%;
    margin-top: 50px;
    height: 30%;
}


`;
const SocialContainerLink = styled.div`
display: flex;
flex-direction: column;
gap: 5px;
`;
const TextContact = styled.p`
font-family: var(--second-family);
font-weight: 400;
font-size: 11px;
letter-spacing: -0.02em;
color: #808080;

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
const EmailSocialLink = styled.a`
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
const LocationContainer = styled.div`

display: flex;
flex-direction: column;
align-items: flex-start;
gap: 10px;
`;
const LocationLink = styled.a`
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
const Contact = () => {
  return /* @__PURE__ */ jsx(AdditionalWrapper, { children: /* @__PURE__ */ jsxs(ContactContainer, { children: [
    /* @__PURE__ */ jsx(ContactTitel, { children: "Let’s Talk" }),
    /* @__PURE__ */ jsxs(WrapperInfo, { children: [
      /* @__PURE__ */ jsxs(SocialContainerLink, { children: [
        /* @__PURE__ */ jsx(TextContact, { children: "Contact" }),
        /* @__PURE__ */ jsx(EmailSocialLink, { href: "mailto:info@pavlotroph.com", children: "info@pavlotroph.com" }),
        /* @__PURE__ */ jsx(EmailSocialLink, { href: "https://www.linkedin.com/in/pavlo-trofimenko/", children: "LinkedIn" }),
        /* @__PURE__ */ jsx(EmailSocialLink, { href: "https://t.me/pavlotroph", children: "Telegram" }),
        /* @__PURE__ */ jsx(EmailSocialLink, { href: "https://www.instagram.com/", children: "Instagram" })
      ] }),
      /* @__PURE__ */ jsxs(LocationContainer, { children: [
        /* @__PURE__ */ jsx(TextContact, { children: "Location" }),
        /* @__PURE__ */ jsx(
          LocationLink,
          {
            href: "https://maps.app.goo.gl/b7UCDY41c7FuzzFC6",
            target: "_blank",
            rel: "noopener noreferrer",
            children: "Toronto, ON, CA"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(ContactForm, {})
  ] }) });
};
const HomeContainer = styled.div`
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
styled.span``;
const HOME_BUTTON_MAIN = styled.div`
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
const HOME_BUTTON_RESIZABLE_BAR = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 64px;
  width: ${({ $isClicked }) => $isClicked ? "100%" : "0"};
  background-color: rgb(255, 255, 255);
  z-index: 0;
  transition: width 0.2s ease;
`;
const HOME_BUTTON_TEXT = styled.span`
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  font-size: 24px;
  line-height: 64px;
  color: ${({ $isClicked }) => $isClicked ? "#000000" : "#FFFFFF"};
  z-index: 1;
  pointer-events: none;
`;
const Home = () => {
  const HOME_BUTTON = ({ to, label }) => {
    const [isClicked, setIsClicked] = useState(false);
    const navigate = useNavigate();
    const handleClick = () => {
      if (isClicked) return;
      setIsClicked(true);
      setTimeout(() => navigate(to), 200);
    };
    return /* @__PURE__ */ jsxs(HOME_BUTTON_MAIN, { onClick: handleClick, $isClicked: isClicked, children: [
      /* @__PURE__ */ jsx(HOME_BUTTON_RESIZABLE_BAR, { $isClicked: isClicked }),
      /* @__PURE__ */ jsx(HOME_BUTTON_TEXT, { $isClicked: isClicked, children: label })
    ] });
  };
  return /* @__PURE__ */ jsxs(HomeContainer, { children: [
    /* @__PURE__ */ jsx(HOME_BUTTON, { to: "/work", label: "WORK" }),
    /* @__PURE__ */ jsx(HOME_BUTTON, { to: "/photography", label: "PHOTOGRAPHY" }),
    /* @__PURE__ */ jsx(HOME_BUTTON, { to: "/info", label: "INFO" }),
    /* @__PURE__ */ jsx(HOME_BUTTON, { to: "/contact", label: "CONTACTS" }),
    /* @__PURE__ */ jsx(HOME_BUTTON, { to: "/about", label: "ABOUT ME" })
  ] });
};
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 48px 24px;
  gap: 10px;
  width: 100%;
  max-width: 1920px;
  background: #000;
  margin: 0 auto;

  @media screen and (min-width: 744px){
    padding: 72px 24px;
  }

    transition: padding 0.4s ease-in-out, gap 0.4s ease-in-out;

  @media screen and (min-width: 1440px){
    padding: 96px 24px;
  }
`;
const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 1440px;
  /* let the content decide the height */
  height: auto;
`;
const QuoteText = styled.div`
  width: 100%;
  max-width: 1440px;

  /* typography */
  font-family: 'Geist', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 140%;
  text-align: center;
  color: #fff;

  /* preserve manual line breaks from the DB */
  white-space: pre-line;

  /* multi-line clamp */
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;          /* show ≤ 5 lines */
`;
const QuoteSource = styled.div`
  width: 100%;
  max-width: 1440px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 400;
  font-size: 16px;
  line-height: 161.8%;
  text-align: center;
  color: #808080;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;
const QuoteBlock = ({ quote }) => /* @__PURE__ */ jsx(Wrapper, { children: /* @__PURE__ */ jsxs(TextBlock, { children: [
  /* @__PURE__ */ jsx(QuoteText, { children: quote.text }),
  /* @__PURE__ */ jsxs(QuoteSource, { children: [
    "— ",
    quote.author,
    ", ",
    /* @__PURE__ */ jsx("i", { children: quote.source })
  ] })
] }) });
const Info = () => {
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const fetchQuotes = async () => {
    const { data, error } = await supabase.from("quotes").select("*");
    if (error) {
      console.error("Помилка при отриманні цитат:", error.message);
    } else {
      setQuotes(data);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchQuotes();
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [quotes]);
  return /* @__PURE__ */ jsxs(CollectionContainer, { children: [
    /* @__PURE__ */ jsxs(CollectionAdditionalWrapper, { children: [
      /* @__PURE__ */ jsx(CollectionHeader, { children: [
        { tag: "h1", text: "Pavlo Troph", label: "Artist Name" },
        { tag: "h3", text: "Graphic Design\nCGI\nPhotography\nCinematography\nArt Direction", label: "Specialization" },
        { tag: "h3", text: "Toronto, ON, CA", label: "Location" },
        { tag: "h3", text: "info@pavlotroph.com", label: "Contact" }
      ].map((s, i) => /* @__PURE__ */ jsxs(CollectionWrapper, { children: [
        /* @__PURE__ */ jsx(COLLECTION_4SEC_TITLE, { children: s.label }),
        /* @__PURE__ */ jsx(COLLECTION_4SEC_DESCRIPTION, { as: s.tag, children: s.text.split("\n").map((line, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
          line,
          /* @__PURE__ */ jsx("br", {})
        ] }, index)) })
      ] }, i)) }),
      /* @__PURE__ */ jsx(CollectionTextWrapper, { children: [
        {
          label: "Description",
          segments: [
            {
              tag: "h1",
              link: "https://www.instagram.com/pavlotroph/",
              text: "Pavlo Troph"
            },
            {
              tag: "span",
              text: " is a multidisciplinary artist dedicated to creating impactful and emotionally resonant experiences. By skillfully blending visuals, sound, and storytelling, he transforms ideas into memorable and engaging products. "
            }
          ]
        },
        {
          label: "Companies",
          segments: [
            {
              tag: "h1",
              link: "https://www.instagram.com/pavlotroph/",
              text: "FiveMods"
            },
            {
              "text": "\n"
            },
            {
              tag: "h1",
              link: "https://www.instagram.com/pavlotroph/",
              text: "Network Graphics"
            },
            {
              "text": "\n"
            },
            {
              tag: "h1",
              link: "https://www.instagram.com/pavlotroph/",
              text: "Meta Network"
            }
          ]
        },
        {
          label: "Software Skills",
          segments: [
            {
              tag: "h1",
              text: "Adobe Suite"
            },
            {
              "text": "\n"
            },
            {
              tag: "h1",
              text: "Blender"
            },
            {
              "text": "\n"
            },
            {
              tag: "h1",
              text: "Figma"
            }
          ]
        }
      ].map((section, i) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(COLLECTION_1SEC_TITLE, { children: section.label }),
        /* @__PURE__ */ jsx(COLLECTION_1SEC_DESCRIPTION, { children: section.segments.map((seg, idx) => {
          const Tag = seg.tag || "span";
          const renderTextWithBreaks = (text) => text.split("\n").map((line, lineIdx) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
            line,
            lineIdx < text.split("\n").length - 1 && /* @__PURE__ */ jsx("br", {})
          ] }, lineIdx));
          const element = /* @__PURE__ */ jsx(Tag, { style: { display: "inline" }, children: renderTextWithBreaks(seg.text) }, idx);
          return seg.link ? /* @__PURE__ */ jsx(
            "a",
            {
              href: seg.link,
              target: "_blank",
              rel: "noopener noreferrer",
              children: element
            },
            idx
          ) : element;
        }) })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsx(CUSTOM_SPLITTER, {}),
    currentQuote && /* @__PURE__ */ jsx(QuoteBlock, { quote: currentQuote })
  ] });
};
const WorkItemComponent = ({ work, source }) => {
  const bucket = source === "work" ? "work-images" : "photography-images";
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isOriginalLoaded, setIsOriginalLoaded] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { folder, image_name, title, preview_url, vimeo_id } = work;
  const isVimeo = Boolean(vimeo_id);
  const src = `https://isglxygpyiuszrsqfttp.supabase.co/storage/v1/object/public/${bucket}/${folder}/${image_name}`;
  const isVideo = image_name.toLowerCase().endsWith(".mp4");
  const getPreviewUrl = () => {
    if (!preview_url) return src;
    return preview_url.startsWith("http") ? preview_url : `https://isglxygpyiuszrsqfttp.supabase.co/storage/v1/object/public/${bucket}/${folder}/${preview_url}`;
  };
  const previewSrc = getPreviewUrl();
  useEffect(() => {
    const img = new Image();
    img.src = previewSrc;
    img.onload = () => {
      setIsLoading(false);
      if (!isVideo) {
        const originalImg = new Image();
        originalImg.src = src;
        originalImg.onload = () => setIsOriginalLoaded(true);
        originalImg.onerror = () => console.error("Failed to preload original image:", src);
      }
    };
    img.onerror = () => {
      console.error("Failed to load preview image:", previewSrc);
      setIsLoading(false);
    };
  }, [previewSrc, src, isVideo]);
  useEffect(() => {
    if (isHovered && isVideo && !isVimeo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    } else if ((!isHovered || isVimeo) && isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, isVideo, isVimeo]);
  const handleClick = () => {
    const base = source === "work" ? "/work" : "/photography";
    navigate(`${base}/${work.id}`);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { style: {
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#000"
    }, children: /* @__PURE__ */ jsx(
      "video",
      {
        src: Loading,
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        style: { width: "150px", height: "150px" }
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    WorkItemContainer,
    {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: handleClick,
      className: "work-item",
      children: [
        /* @__PURE__ */ jsx(PreviewLayer, { $isVisible: !isHovered, $imageUrl: previewSrc, children: /* @__PURE__ */ jsx(
          "img",
          {
            src: previewSrc,
            alt: "preview",
            loading: "eager"
          }
        ) }),
        !isVideo && /* @__PURE__ */ jsx(OriginalLayer, { $isVisible: isHovered && isOriginalLoaded, children: /* @__PURE__ */ jsx(
          "img",
          {
            src,
            alt: "original",
            loading: isOriginalLoaded ? "eager" : "lazy"
          }
        ) }),
        isHovered && (isVideo || isVimeo) && /* @__PURE__ */ jsx(VideoPreview, { $isVisible: isHovered, $imageUrl: previewSrc, children: isVimeo ? /* @__PURE__ */ jsx(
          "iframe",
          {
            src: `https://player.vimeo.com/video/${vimeo_id}?autoplay=1&muted=1&loop=1&background=1`,
            width: "100%",
            height: "100%",
            frameBorder: "0",
            allow: "autoplay; fullscreen; picture-in-picture",
            allowFullScreen: true,
            style: {
              position: "absolute",
              top: "-15%",
              left: 0,
              width: "100vw",
              // 👈 ключовий момент — viewport ширина
              height: "100vh",
              maxWidth: "none",
              maxHeight: "none",
              border: "none",
              zIndex: 1
            }
          }
        ) : /* @__PURE__ */ jsx(
          "video",
          {
            ref: videoRef,
            src,
            muted: true,
            loop: true,
            preload: "auto",
            playsInline: true,
            disablePictureInPicture: true
          }
        ) }),
        /* @__PURE__ */ jsx(ImageDescription, { $isVisible: isHovered, children: title })
      ]
    }
  );
};
const Photo = () => {
  const [works, setWorks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const filteredWorks = filter === "ALL" ? works : works.filter((w) => w.folder.toUpperCase() === filter);
  useEffect(() => {
    const fetchWorks = async () => {
      const { data, error } = await supabase.from("photography").select("*");
      if (error) {
        console.error("Error loading photos:", error.message);
      } else {
        setWorks(data);
      }
    };
    const fetchQuotes = async () => {
      const { data, error } = await supabase.from("quotes").select("*");
      if (!error && data) setQuotes(data);
    };
    fetchWorks();
    fetchQuotes();
  }, []);
  useEffect(() => {
    if (quotes.length) {
      const idx = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[idx]);
    }
  }, [quotes]);
  return /* @__PURE__ */ jsxs(WorkContainer, { children: [
    /* @__PURE__ */ jsxs(WorkTitelContainer, { children: [
      /* @__PURE__ */ jsx(WorkTitel, { children: "PHOTOGRAPHY" }),
      /* @__PURE__ */ jsx(WorkFilterWrapp, { children: ["ALL", "COMMERCIAL", "PERSONAL"].map((cat) => /* @__PURE__ */ jsx(
        WorkTextFilter,
        {
          onClick: () => {
            setFilter(cat);
            if (quotes.length) {
              const idx = Math.floor(Math.random() * quotes.length);
              setCurrentQuote(quotes[idx]);
            }
          },
          className: filter === cat ? "active" : "",
          children: cat
        },
        cat
      )) })
    ] }),
    /* @__PURE__ */ jsx(WorkPhotoWrapp, { children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: filteredWorks.map((work) => /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
        style: { width: "100%", height: "100%" },
        children: /* @__PURE__ */ jsx(
          Link,
          {
            to: `/photography/${work.id}?filter=${filter}`,
            style: { width: "100%", height: "100%" },
            children: /* @__PURE__ */ jsx(WorkItemComponent, { work, source: "photo" })
          }
        )
      },
      work.id
    )) }) }),
    /* @__PURE__ */ jsx(CUSTOM_SPLITTER, {}),
    currentQuote && /* @__PURE__ */ jsx(QuoteBlock, { quote: currentQuote })
  ] });
};
const Work = () => {
  const [works, setWorks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [filter, setFilter] = useState(
    "ALL"
  );
  const filteredWorks = filter === "ALL" ? works : works.filter((work) => work.folder.toUpperCase() === filter);
  useEffect(() => {
    const fetchWorks = async () => {
      const { data, error } = await supabase.from("work").select("*");
      if (error) {
        console.error("Помилка при отриманні робіт:", error.message);
      } else {
        setWorks(data);
      }
    };
    const fetchQuotes = async () => {
      const { data, error } = await supabase.from("quotes").select("*");
      if (error) {
        console.error("Помилка при отриманні цитат:", error.message);
      } else {
        setQuotes(data);
      }
    };
    fetchWorks();
    fetchQuotes();
  }, []);
  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [quotes]);
  return /* @__PURE__ */ jsxs(WorkContainer, { children: [
    /* @__PURE__ */ jsxs(WorkTitelContainer, { children: [
      /* @__PURE__ */ jsx(WorkTitel, { children: "WORK" }),
      /* @__PURE__ */ jsx(WorkFilterWrapp, { children: ["ALL", "COMMERCIAL", "PERSONAL"].map((cat) => /* @__PURE__ */ jsx(
        WorkTextFilter,
        {
          onClick: () => {
            setFilter(cat);
            if (quotes.length > 0) {
              const randomIndex = Math.floor(Math.random() * quotes.length);
              setCurrentQuote(quotes[randomIndex]);
            }
          },
          className: filter === cat ? "active" : "",
          children: cat
        },
        cat
      )) })
    ] }),
    /* @__PURE__ */ jsx(WorkPhotoWrapp, { children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: filteredWorks.map((work) => /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
        style: { width: "100%", height: "100%" },
        children: /* @__PURE__ */ jsx(
          Link,
          {
            to: `/work/${work.id}?filter=${filter}`,
            style: { width: "100%", height: "100%" },
            children: /* @__PURE__ */ jsx(WorkItemComponent, { work, source: "work" })
          }
        )
      },
      work.id
    )) }) }),
    /* @__PURE__ */ jsx(CUSTOM_SPLITTER, {}),
    currentQuote && /* @__PURE__ */ jsx(QuoteBlock, { quote: currentQuote })
  ] });
};
const AnimatedPage = ({ children }) => {
  useEffect(() => window.scrollTo(0, 0), []);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 100 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -100 },
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      style: { width: "100%", top: 0 },
      children
    }
  );
};
const App = () => {
  const location = useLocation();
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);
  useEffect(() => window.scrollTo(0, 0), [location.pathname]);
  return /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(Routes, { location, children: [
    /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Navigate, { to: "/home" }) }),
    /* @__PURE__ */ jsxs(
      Route,
      {
        path: "/",
        element: /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            children: /* @__PURE__ */ jsx(Layout, {})
          }
        ),
        children: [
          /* @__PURE__ */ jsx(
            Route,
            {
              index: true,
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(Home, {}) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "home",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(Home, {}) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "work",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(Work, {}) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "work/:id",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(CollectionPage, { source: "work" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "photography",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(Photo, {}) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "photography/:id",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(CollectionPage, { source: "photo" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "info",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(Info, {}) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "contact",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(Contact, {}) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "about",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(AboutUs, {}) })
            }
          ),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "*",
              element: /* @__PURE__ */ jsx(AnimatedPage, { children: /* @__PURE__ */ jsx(Home, {}) })
            }
          )
        ]
      }
    )
  ] }, location.pathname) });
};
function Index() {
  return /* @__PURE__ */ jsxs(Html, { lang: "en", children: [
    /* @__PURE__ */ jsxs(Head, { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("title", { children: "My App" })
    ] }),
    /* @__PURE__ */ jsx(Body, { children: /* @__PURE__ */ jsx(App, {}) })
  ] });
}
const mainScriptUrl = "E:/Upwork/portfolio/src/index.tsx?ssg-client-entry";
async function create(context) {
  return await create$1(Index, context, mainScriptUrl);
}
export {
  create
};
