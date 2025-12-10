import AOS from 'aos';
import 'aos/dist/aos.css';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import LogoIcon from '../../assets/icons/logo-portfolio.svg';
import BurgerMenu from '../MobileMenu/MobileMenu';
import {
  HeaderWrapper,
  Logo,
  NavbarContainer,
  NavItem,
  NavList,
  StyledNavLink,
} from './Header.styled';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 3000 });
    AOS.refresh();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMobile = useMediaQuery({ query: '(max-width: 773px)' });

  return (
    <NavbarContainer $isScrolled={isScrolled}>
    <HeaderWrapper>
      <Logo to="/home" aria-label="Home - Pavlo Troph Portfolio">
        <img src={LogoIcon} alt="Pavlo Troph Portfolio Logo" />
      </Logo>
      <nav aria-label="Main navigation">
      <NavList>
        {isMobile ? (
          <BurgerMenu />
        ) : (
          <>
            <NavItem>
              <StyledNavLink to="/home">HOME</StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/work">WORK</StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/photography">PHOTOGRAPHY</StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/info">INFO</StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/contact">CONTACTS</StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/about">ABOUT ME</StyledNavLink>
            </NavItem>
            <NavItem className="hidden">
              <a 
                href="/sitemap.html" 
                style={{ textDecoration: 'none', color: 'inherit' }}
                aria-label="View sitemap"
              >
                Sitemap
              </a>
            </NavItem>
          </>
        )}
      </NavList>
      </nav></HeaderWrapper>
    </NavbarContainer>
  );
};

export default Header;
