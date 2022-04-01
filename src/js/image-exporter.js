import * as saveSvg from 'save-svg-as-png';
import * as d3 from 'd3';

document.querySelectorAll('.download-as-png-button').forEach((element) => {
  element.addEventListener('click', function() {
    saveSvg.saveSvgAsPng(d3.select('svg').node(), 'sankeydiagram-net-export', {
      backgroundColor: 'white',
      excludeUnusedCss: true,
    });
  });
});

document.querySelectorAll('.download-as-svg-button').forEach((element) => {
  element.addEventListener('click', function() {
    saveSvg.saveSvg(d3.select('svg').node(), 'sankeydiagram-net-export', {
      backgroundColor: 'white',
      excludeUnusedCss: true,
    });
  });
});
