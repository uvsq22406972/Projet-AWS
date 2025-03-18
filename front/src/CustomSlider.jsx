// CustomSlider.jsx
import React from 'react';
import './CustomSlider.css';

const CustomSlider = ({ value, onChange, min = 1, max = 5 }) => {
  // Crée un tableau de valeurs de min à max (ici 1 à 5)
  const values = [];
  for (let i = min; i <= max; i++) {
    values.push(i);
  }

  return (
    <div className="custom-slider-container">
      {values.map((val) => (
        <div
          key={val}
          className={`slider-tick ${val === value ? 'active' : ''}`}
          onClick={() => onChange(val)}
        />
      ))}
    </div>
  );
};

export default CustomSlider;
