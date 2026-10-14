import React, { useState } from 'react';
import Search from '../Search/Search';

export function MeterSearch({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleSearch = (e) => {
    setTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return <Search value={term} onChange={handleSearch} placeholder="Search by Meter SN, Batch or Model..." />;
}

export default MeterSearch;
