// src/lib/districtMapping.ts - Debug utility to help map district names
export interface DistrictMapping {
  gameName: string;    // Name used in your game logic
  svgId: string;      // Actual ID in the SVG
  alternatives: string[]; // Alternative names/IDs to try
}

// This helps debug and map district names between your game logic and SVG IDs
export function createDistrictMappingTable(): DistrictMapping[] {
  // Common district name variations in Nepal
  return [
    { gameName: 'kathmandu', svgId: 'Kathmandu', alternatives: ['kathmandu', 'ktm'] },
    { gameName: 'lalitpur', svgId: 'Lalitpur', alternatives: ['lalitpur', 'patan'] },
    { gameName: 'bhaktapur', svgId: 'Bhaktapur', alternatives: ['bhaktapur', 'bhadgaon'] },
    { gameName: 'chitwan', svgId: 'Chitwan', alternatives: ['chitwan', 'chitawan'] },
    { gameName: 'pokhara', svgId: 'Kaski', alternatives: ['kaski', 'pokhara'] }, // Pokhara is in Kaski
    { gameName: 'rupandehi', svgId: 'Rupandehi', alternatives: ['rupandehi', 'butwal'] },
    { gameName: 'jhapa', svgId: 'Jhapa', alternatives: ['jhapa'] },
    { gameName: 'morang', svgId: 'Morang', alternatives: ['morang', 'biratnagar'] },
    { gameName: 'sunsari', svgId: 'Sunsari', alternatives: ['sunsari', 'inaruwa'] },
    { gameName: 'dhankuta', svgId: 'Dhankuta', alternatives: ['dhankuta'] },
    { gameName: 'panchthar', svgId: 'Panchthar', alternatives: ['panchthar', 'phidim'] },
    { gameName: 'ilam', svgId: 'Ilam', alternatives: ['ilam'] },
    { gameName: 'gulmi', svgId: 'Gulmi', alternatives: ['gulmi', 'tamghas'] },
    { gameName: 'palpa', svgId: 'Palpa', alternatives: ['palpa', 'tansen'] },
    { gameName: 'baglung', svgId: 'Baglung', alternatives: ['baglung'] },
    { gameName: 'myagdi', svgId: 'Myagdi', alternatives: ['myagdi', 'beni'] },
    { gameName: 'mustang', svgId: 'Mustang', alternatives: ['mustang', 'lomanthang'] },
    { gameName: 'dolpa', svgId: 'Dolpa', alternatives: ['dolpa', 'dunai'] },
    { gameName: 'jumla', svgId: 'Jumla', alternatives: ['jumla', 'khalanga'] },
    { gameName: 'mugu', svgId: 'Mugu', alternatives: ['mugu', 'gamgadhi'] },
    { gameName: 'humla', svgId: 'Humla', alternatives: ['humla', 'simikot'] },
    { gameName: 'bajura', svgId: 'Bajura', alternatives: ['bajura', 'martadi'] },
    { gameName: 'bajhang', svgId: 'Bajhang', alternatives: ['bajhang', 'chainpur'] },
    { gameName: 'doti', svgId: 'Doti', alternatives: ['doti', 'silgadhi'] },
    { gameName: 'achham', svgId: 'Achham', alternatives: ['achham', 'mangalsen'] },
    { gameName: 'dadeldhura', svgId: 'Dadeldhura', alternatives: ['dadeldhura'] },
    { gameName: 'baitadi', svgId: 'Baitadi', alternatives: ['baitadi', 'dasharathchand'] },
    { gameName: 'darchula', svgId: 'Darchula', alternatives: ['darchula', 'khalanga'] },
    { gameName: 'kailali', svgId: 'Kailali', alternatives: ['kailali', 'dhangadhi'] },
    { gameName: 'kanchanpur', svgId: 'Kanchanpur', alternatives: ['kanchanpur', 'mahendranagar'] },
    { gameName: 'bardiya', svgId: 'Bardiya', alternatives: ['bardiya', 'gulariya'] },
    { gameName: 'banke', svgId: 'Banke', alternatives: ['banke', 'nepalgunj'] },
    { gameName: 'dang', svgId: 'Dang', alternatives: ['dang', 'ghorahi'] },
    { gameName: 'pyuthan', svgId: 'Pyuthan', alternatives: ['pyuthan'] },
    { gameName: 'rolpa', svgId: 'Rolpa', alternatives: ['rolpa', 'liwang'] },
    { gameName: 'rukum', svgId: 'Rukum_West', alternatives: ['rukum_west', 'rukum-west', 'rukumwest', 'rukum'] },
    { gameName: 'salyan', svgId: 'Salyan', alternatives: ['salyan', 'khalanga'] },
    { gameName: 'surkhet', svgId: 'Surkhet', alternatives: ['surkhet', 'birendranagar'] },
    { gameName: 'dailekh', svgId: 'Dailekh', alternatives: ['dailekh', 'narayan'] },
    { gameName: 'jajarkot', svgId: 'Jajarkot', alternatives: ['jajarkot', 'khalanga'] },
    { gameName: 'kalikot', svgId: 'Kalikot', alternatives: ['kalikot', 'manma'] },
    // Add more mappings as needed...
  ];
}

// Debug function to help identify missing district mappings
export function debugDistrictMapping(svgElement: SVGSVGElement): void {
  console.log('=== District Mapping Debug ===');
  
  // Find all elements with IDs
  const elementsWithIds = Array.from(svgElement.querySelectorAll('[id]'));
  console.log('Elements with IDs:', elementsWithIds.map(el => el.id));
  
  // Find all elements with data-name attributes
  const elementsWithDataName = Array.from(svgElement.querySelectorAll('[data-name]'));
  console.log('Elements with data-name:', elementsWithDataName.map(el => el.getAttribute('data-name')));
  
  // Find all path elements
  const pathElements = Array.from(svgElement.querySelectorAll('path'));
  console.log('Path elements:', pathElements.length);
  
  // Find all group elements
  const groupElements = Array.from(svgElement.querySelectorAll('g'));
  console.log('Group elements:', groupElements.length);
  
  // List potential district identifiers
  const potentialDistricts = [
    ...elementsWithIds.map(el => el.id).filter(Boolean),
    ...elementsWithDataName.map(el => el.getAttribute('data-name')).filter(Boolean)
  ];
  
  console.log('Potential district identifiers:', [...new Set(potentialDistricts)].sort());
  
  // Check against our game districts
  const gameDistricts = [
    'kathmandu', 'lalitpur', 'bhaktapur', 'chitwan', 'rupandehi', 'gulmi', 'palpa',
    'jhapa', 'morang', 'sunsari', 'dhankuta', 'panchthar', 'ilam'
  ];
  
  console.log('Missing mappings:');
  gameDistricts.forEach(district => {
    const found = potentialDistricts.some(id => {
      if (!id) return false;
      return id.toLowerCase().includes(district.toLowerCase()) || 
        district.toLowerCase().includes(id.toLowerCase());
    });
    if (!found) {
      console.log(`❌ ${district} - No matching SVG element found`);
    } else {
      console.log(`✅ ${district} - Mapping found`);
    }
  });
}

// Usage in your component:
// useEffect(() => {
//   if (svgRef.current && process.env.NODE_ENV === 'development') {
//     debugDistrictMapping(svgRef.current);
//   }
// }, []); 