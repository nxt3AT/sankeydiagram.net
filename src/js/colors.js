import * as d3 from 'd3';

export const CSS3_NAMES_TO_HEX = {
  'aliceblue': '#f0f8ff',
  'antiquewhite': '#faebd7',
  'aqua': '#00ffff',
  'aquamarine': '#7fffd4',
  'azure': '#f0ffff',
  'beige': '#f5f5dc',
  'bisque': '#ffe4c4',
  'black': '#000000',
  'blanchedalmond': '#ffebcd',
  'blue': '#0000ff',
  'blueviolet': '#8a2be2',
  'brown': '#a52a2a',
  'burlywood': '#deb887',
  'cadetblue': '#5f9ea0',
  'chartreuse': '#7fff00',
  'chocolate': '#d2691e',
  'coral': '#ff7f50',
  'cornflowerblue': '#6495ed',
  'cornsilk': '#fff8dc',
  'crimson': '#dc143c',
  'cyan': '#00ffff',
  'darkblue': '#00008b',
  'darkcyan': '#008b8b',
  'darkgoldenrod': '#b8860b',
  'darkgray': '#a9a9a9',
  'darkgrey': '#a9a9a9',
  'darkgreen': '#006400',
  'darkkhaki': '#bdb76b',
  'darkmagenta': '#8b008b',
  'darkolivegreen': '#556b2f',
  'darkorange': '#ff8c00',
  'darkorchid': '#9932cc',
  'darkred': '#8b0000',
  'darksalmon': '#e9967a',
  'darkseagreen': '#8fbc8f',
  'darkslateblue': '#483d8b',
  'darkslategray': '#2f4f4f',
  'darkslategrey': '#2f4f4f',
  'darkturquoise': '#00ced1',
  'darkviolet': '#9400d3',
  'deeppink': '#ff1493',
  'deepskyblue': '#00bfff',
  'dimgray': '#696969',
  'dimgrey': '#696969',
  'dodgerblue': '#1e90ff',
  'firebrick': '#b22222',
  'floralwhite': '#fffaf0',
  'forestgreen': '#228b22',
  'fuchsia': '#ff00ff',
  'gainsboro': '#dcdcdc',
  'ghostwhite': '#f8f8ff',
  'gold': '#ffd700',
  'goldenrod': '#daa520',
  'gray': '#808080',
  'grey': '#808080',
  'green': '#008000',
  'greenyellow': '#adff2f',
  'honeydew': '#f0fff0',
  'hotpink': '#ff69b4',
  'indianred': '#cd5c5c',
  'indigo': '#4b0082',
  'ivory': '#fffff0',
  'khaki': '#f0e68c',
  'lavender': '#e6e6fa',
  'lavenderblush': '#fff0f5',
  'lawngreen': '#7cfc00',
  'lemonchiffon': '#fffacd',
  'lightblue': '#add8e6',
  'lightcoral': '#f08080',
  'lightcyan': '#e0ffff',
  'lightgoldenrodyellow': '#fafad2',
  'lightgray': '#d3d3d3',
  'lightgrey': '#d3d3d3',
  'lightgreen': '#90ee90',
  'lightpink': '#ffb6c1',
  'lightsalmon': '#ffa07a',
  'lightseagreen': '#20b2aa',
  'lightskyblue': '#87cefa',
  'lightslategray': '#778899',
  'lightslategrey': '#778899',
  'lightsteelblue': '#b0c4de',
  'lightyellow': '#ffffe0',
  'lime': '#00ff00',
  'limegreen': '#32cd32',
  'linen': '#faf0e6',
  'magenta': '#ff00ff',
  'maroon': '#800000',
  'mediumaquamarine': '#66cdaa',
  'mediumblue': '#0000cd',
  'mediumorchid': '#ba55d3',
  'mediumpurple': '#9370db',
  'mediumseagreen': '#3cb371',
  'mediumslateblue': '#7b68ee',
  'mediumspringgreen': '#00fa9a',
  'mediumturquoise': '#48d1cc',
  'mediumvioletred': '#c71585',
  'midnightblue': '#191970',
  'mintcream': '#f5fffa',
  'mistyrose': '#ffe4e1',
  'moccasin': '#ffe4b5',
  'navajowhite': '#ffdead',
  'navy': '#000080',
  'oldlace': '#fdf5e6',
  'olive': '#808000',
  'olivedrab': '#6b8e23',
  'orange': '#ffa500',
  'orangered': '#ff4500',
  'orchid': '#da70d6',
  'palegoldenrod': '#eee8aa',
  'palegreen': '#98fb98',
  'paleturquoise': '#afeeee',
  'palevioletred': '#db7093',
  'papayawhip': '#ffefd5',
  'peachpuff': '#ffdab9',
  'peru': '#cd853f',
  'pink': '#ffc0cb',
  'plum': '#dda0dd',
  'powderblue': '#b0e0e6',
  'purple': '#800080',
  'red': '#ff0000',
  'rosybrown': '#bc8f8f',
  'royalblue': '#4169e1',
  'saddlebrown': '#8b4513',
  'salmon': '#fa8072',
  'sandybrown': '#f4a460',
  'seagreen': '#2e8b57',
  'seashell': '#fff5ee',
  'sienna': '#a0522d',
  'silver': '#c0c0c0',
  'skyblue': '#87ceeb',
  'slateblue': '#6a5acd',
  'slategray': '#708090',
  'slategrey': '#708090',
  'snow': '#fffafa',
  'springgreen': '#00ff7f',
  'steelblue': '#4682b4',
  'tan': '#d2b48c',
  'teal': '#008080',
  'thistle': '#d8bfd8',
  'tomato': '#ff6347',
  'turquoise': '#40e0d0',
  'violet': '#ee82ee',
  'wheat': '#f5deb3',
  'white': '#ffffff',
  'whitesmoke': '#f5f5f5',
  'yellow': '#ffff00',
  'yellowgreen': '#9acd32',
};

export const palettePaired = d3.scaleOrdinal(d3.schemePaired);
export const paletteCat10 = d3.scaleOrdinal(d3.schemeCategory10);
export const palettePastel1 = d3.scaleOrdinal(d3.schemePastel1);
export const paletteSet2 = d3.scaleOrdinal(d3.schemeSet2);
export const paletteSet3 = d3.scaleOrdinal(d3.schemeSet3);
export const paletteAccent = d3.scaleOrdinal(d3.schemeAccent);

export const paletteNested = [
  '#3182bd',
  '#48d1cc',
  '#6baed6',
  '#9ecae1',
  '#c6dbef',
  '#e6550d',
  '#ff6347',
  '#fd8d3c',
  '#fdae6b',
  '#fdd0a2',
  '#31a354',
  '#74c476',
  '#a1d99b',
  '#637939',
  '#8ca252',
  '#c7e9c0',
  '#d6616b',
  '#e7969c',
  '#a55194',
  '#ce6dbd',
  '#de9ed6',
  '#9e9ac8',
  '#bcbddc',
  '#dadaeb',
  '#bd9e39',
  '#e7ba52',
  '#eeff00',
  '#b5cf6b',
  '#cedb9c',
  '#878787',
  '#969696',
  '#bdbdbd',
  '#d9d9d9',
];

export const paletteDefault = d3.scaleOrdinal([
  '#17becf',
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22'
]);

let sankeyColorpaletteSetting = document.getElementById('sankey-settings-colorscheme');
const sankeyColorFlowsBasedOnFirstWordSetting = document.getElementById('sankey-settings-flow-color-based-on-first-word');
const sankeyFlowOpacitySettings = document.getElementsByClassName('sankey-settings-flow-opacity');

let colorIndex = 0;

/**
 * resets the variable colorIndex to zero
 */
export function resetColorIndex() {
  colorIndex = 0;
}

for (const sankeyFlowOpacitySetting of sankeyFlowOpacitySettings) {
  sankeyFlowOpacitySetting.addEventListener('input', (evt) => {
    // keep the slider and number input both in-sync
    for (let sankeyFlowOpacitySettings2 of sankeyFlowOpacitySettings) {
      if(sankeyFlowOpacitySetting === sankeyFlowOpacitySettings2) continue;
      sankeyFlowOpacitySettings2.value = evt.target.value;
    }

    document.documentElement.style.setProperty(
      '--flow-opacity',
      `${(isNaN(evt.target.value) || isNaN(parseFloat(evt.target.value))) ? '0.5' : evt.target.value/100}`,
    );
  });
}

/**
 * returns the palette with the given name
 * @param {string} key
 * @return {any}
 */
export function getColor(rawKey) {
  if (sankeyColorpaletteSetting === undefined) {
    sankeyColorpaletteSetting = document.getElementById('sankey-settings-colorscheme');
  }

  // cut the first non-empty word of the string out and use as key if enabled
  const key = sankeyColorFlowsBasedOnFirstWordSetting?.checked
    ? ((rawKey.match(/\b\w+\b/)[0]) ?? '')
    : rawKey;

  switch (sankeyColorpaletteSetting.value) {
    case 'paired':
      return palettePaired(key);
    case 'cat10':
      return paletteCat10(key);
    case 'pastel1':
      return palettePastel1(key);
    case 'set3':
      return paletteSet3(key);
    case 'accent':
      return paletteAccent(key);
    case 'set2':
      return paletteSet2(key);
    case 'nested':
      return paletteNested[++colorIndex];
    case 'default':
    default:
      return paletteDefault(key);
  }
}
