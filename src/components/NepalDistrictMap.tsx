import React, { useState, useEffect } from 'react';

const NepalDistrictMap: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [startDistrict, setStartDistrict] = useState<string>('kathmandu');
  const [endDistrict, setEndDistrict] = useState<string>('sindhupalchok');

  useEffect(() => {
    const handleDistrictClick = (event: Event) => {
      const target = event.target as SVGElement;
      const districtId = target.getAttribute('id');
      
      if (districtId) {
        setSelectedDistrict(districtId);
      }
    };

    const districts = document.querySelectorAll('.district');
    districts.forEach(district => {
      district.addEventListener('click', handleDistrictClick);
    });

    // Add specific styling for start and end districts
    const startDistrictElement = document.getElementById(startDistrict);
    const endDistrictElement = document.getElementById(endDistrict);

    if (startDistrictElement) {
      startDistrictElement.style.fill = '#4CAF50'; // Green color for start district
      startDistrictElement.style.stroke = '#2E7D32';
      startDistrictElement.style.strokeWidth = '2';
    }

    if (endDistrictElement) {
      endDistrictElement.style.fill = '#F44336'; // Red color for end district
      endDistrictElement.style.stroke = '#C62828';
      endDistrictElement.style.strokeWidth = '2';
    }

    return () => {
      districts.forEach(district => {
        district.removeEventListener('click', handleDistrictClick);
      });
    };
  }, [startDistrict, endDistrict]);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        <g id="nepal-map">
          {/* Add a title for the map */}
          <text
            x="400"
            y="30"
            textAnchor="middle"
            className="text-lg font-bold fill-current"
          >
            Nepal District Map
          </text>

          {/* Add a legend */}
          <g transform="translate(20, 60)">
            <rect x="0" y="0" width="20" height="20" fill="#4CAF50" />
            <text x="30" y="15" className="text-sm fill-current">Start District</text>
            
            <rect x="0" y="30" width="20" height="20" fill="#F44336" />
            <text x="30" y="45" className="text-sm fill-current">End District</text>
            
            <rect x="0" y="60" width="20" height="20" fill="#2196F3" />
            <text x="30" y="75" className="text-sm fill-current">Selected District</text>
          </g>

          {/* Map content */}
          <g id="map-content">
            {/* ... existing map content ... */}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default NepalDistrictMap; 