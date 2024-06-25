import * as saveSvg from 'save-svg-as-png';
import * as d3 from 'd3';

const modifyStyle = (value) => {
  return value.replace(
      'var(--node-font-size)',
      window.getComputedStyle(document.documentElement).getPropertyValue('--node-font-size'),
  );
};

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
    });
  });
});
