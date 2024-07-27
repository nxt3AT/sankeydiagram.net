import * as saveSvg from 'save-svg-as-png';
import * as d3 from 'd3';

const modifyStyle = (value) => {
  return value
    .replace(
      'var(--node-font-size)',
      window.getComputedStyle(document.documentElement).getPropertyValue('--node-font-size'),
    )
    .replace(
      'var(--node-width)',
      window.getComputedStyle(document.documentElement).getPropertyValue('--node-width'),
    )
    .replace(
      'var(--flow-opacity)',
      window.getComputedStyle(document.documentElement).getPropertyValue('--flow-opacity'),
  );
};

const selectorRemap = (selector) => {
  // remove pseudo-element selectors to maximize svg-compatibility
  return selector.split(',').map(s => s.trim().startsWith('::') ? undefined : s.trim()).filter(s => s !== undefined).join(', ');
}

document.querySelectorAll('.download-as-png-button').forEach((element) => {
  element.addEventListener('click', function() {
    saveSvg.saveSvgAsPng(d3.select('#sankey-svg').node(), 'sankeydiagram-net-export', {
      backgroundColor: 'white',
      excludeUnusedCss: true,
      modifyStyle: modifyStyle,
    });
  });
});

document.querySelectorAll('.download-as-svg-button').forEach((element) => {
  element.addEventListener('click', function() {
    saveSvg.saveSvg(d3.select('#sankey-svg').node(), 'sankeydiagram-net-export', {
      backgroundColor: 'white',
      excludeUnusedCss: true,
      modifyStyle: modifyStyle,
      selectorRemap: selectorRemap,
      // hardcode included fonts, else the (for the output) unused material-icons font would also get included
      fonts: [
        {
          url: '/fonts/open-sans-v18-latin-600.woff2',
          format: 'font/woff2',
          text: '@font-face { font-family: \'Open Sans\'; font-style: normal; font-weight: 600; font-display: swap; src: url(\'/fonts/open-sans-v18-latin-600.woff2\') format(\'woff2\') }'
        }
      ]
    });
  });
});
