import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const NavbarContainer = styled.header<{ $isScrolled: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ $isScrolled }) =>
    $isScrolled ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.2)'};
  backdrop-filter: ${({ $isScrolled }) =>
    $isScrolled ? 'blur(24px)' : 'blur(6px)'};
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  margin: 0;
  border: none;
  outline: none;
  box-shadow: none;
  transition: all 0.6s ease;
  z-index: 99;
  will-change: transform;

  &:hover,
  &:focus,
  &.active {
  
    transition: all 0.4s ease-in-out;
  }
`;

export const HeaderWrapper = styled.div`
  display: flex;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 14px 14px;
  justify-content: space-between;
  align-items: center;
  border: none;
  outline: none;
  position: relative;
`;
export const Logo = styled(NavLink)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d1ff;
  text-decoration: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  margin: 0;
  margin-left: 0;
  padding: 0;
  z-index: 101;
  
  @media screen and (min-width: 768px) {
    margin-left: -1px;
  }
  
  img {
    height: 50px;
    width: auto;
    display: block;
    overflow: hidden;
    border: none;
    outline: none;
    margin: 0;
    padding: 0;
  }
  &:hover,
  &:focus,
  &.active {
    color: #00ffe7;
    outline: none;
    border: none;
  }
  &:focus-visible {
    outline: 2px solid #00d1ff;
    outline-offset: 2px;
  }
  &::before,
  &::after {
    display: none;
    content: none;
  }
`;



export const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const NavItem = styled.li`
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
  
  &.hidden {
    display: none;
  }
`;

export const StyledNavLink = styled(NavLink)`
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

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 0;
    height: 2px;
    background-color: #808080;
    transition: width 0.3s ease-in-out;
  }

  &::after {
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
    color: rgb(255, 255, 255);
    &::after {
      width: 100%;
    }
  }

  &:hover::after {
    width: 100%;
    color: rgb(255, 255, 255);
  }
`;
