import React from 'react';
import { GoogleSearchWrapper, SearchForm, SearchInput, SearchButton } from './GoogleSearch.styled';

const GoogleSearch: React.FC = () => {
  return (
    <GoogleSearchWrapper role="search" aria-label="Site search">
      <SearchForm action="https://www.google.com/search" method="get">
        <input type="hidden" name="sitesearch" value="pavlotroph.com" />
        <label htmlFor="site-search-input" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          Search this site
        </label>
        <SearchInput 
          id="site-search-input"
          type="search" 
          name="q" 
          placeholder="Search this site..." 
          aria-label="Search this site"
        />
        <SearchButton type="submit" aria-label="Submit search">Search</SearchButton>
      </SearchForm>
    </GoogleSearchWrapper>
  );
};

export default GoogleSearch;

