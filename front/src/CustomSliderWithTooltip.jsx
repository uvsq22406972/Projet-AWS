import React from 'react';
import './CustomSliderWithTooltip.css';

const CustomSliderWithTooltip = ({ value, onChange, min, max }) => {
  // Calcul du pourcentage de remplissage pour positionner le tooltip
  const percentage = ((value - min) / (max - min)) * 100;
  const sliderStyle = {
    background: `linear-gradient(90deg, #F48516 ${percentage}%, #e0e0e0 ${percentage}%)`
  };

  return (
    <div className="slider-container">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={sliderStyle}
        className="custom-slider"
      />
      <div className="tooltip" style={{ left: `calc(${percentage}% - 15px)` }}>
        {value}s
      </div>
    </div>
  );
};

export default CustomSliderWithTooltip;
