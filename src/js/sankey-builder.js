import * as d3 from 'd3';
import * as sankey from './d3-sankey-diagram/src/index';

import {CSS3_NAMES_TO_HEX, getColor, resetColorIndex} from './colors';

let sankeySvg;

const sankeyPrecisionSetting = document.getElementById('sankey-settings-precision');
const sankeyHideZerosSetting = document.getElementById('sankey-settings-hidezeros');
const sankeySeparatorSetting = document.getElementById('sankey-settings-separators');
const sankeyNodeTextBackgroundOpacitySettings = document.getElementsByClassName('sankey-settings-node-text-background-opacity');
const sankeyColorpaletteSetting = document.getElementById('sankey-settings-colorscheme');
const sankeySuffixSetting = document.getElementById('sankey-settings-suffix');

const sankeyHideNumbersSetting = document.getElementById('sankey-settings-hidenumbers');
const sankeyCanvasWidthSetting = document.getElementById('sankey-settings-canvas-width');
const sankeyCanvasHeightSetting = document.getElementById('sankey-settings-canvas-height');
const sankeyFontSizeSetting = document.getElementById('sankey-settings-font-size');
const sankeyNodeWidthSetting = document.getElementById('sankey-settings-node-width');
const sankeyNodeUseColorsSetting = document.getElementById('sankey-settings-node-use-colors');
const sankeyDisableWatermarkSetting = document.getElementById('sankey-settings-disable-watermark');

import {lineRegex, sankeyInput} from './constants';
import './gui';
import './settings-serializer';
import './input-anonymizer';
import './input-sharing';
import './image-exporter';
import {parseFloatWithPrecision} from './utils';


let inputTimer;
sankeyInput.addEventListener('keyup', function() {
  clearTimeout(inputTimer);
  inputTimer = setTimeout(processInput, 300);
});

window.addEventListener('resize', processInput);

document.getElementById('sankey-input-box').addEventListener('resize', function() {
  processInput();
});

[sankeyPrecisionSetting, sankeyHideZerosSetting, sankeySuffixSetting, sankeySeparatorSetting, sankeyHideNumbersSetting, sankeyNodeUseColorsSetting].forEach((setting) => {
  setting.addEventListener('input', function() {
    processInput();
  });
});

sankeyColorpaletteSetting.addEventListener('change', function() {
  resetColorIndex();
  processInput();
});

document.getElementById('sankey-settings-labelabove').addEventListener('change', function() {
  processInput();
});

sankeyCanvasWidthSetting.addEventListener('change', function() {
  document.getElementById('sankey-svg').setAttribute('viewBox', '0 0 ' + sankeyCanvasWidthSetting.value + ' ' + sankeyCanvasHeightSetting.value);
  layout.size([sankeyCanvasWidthSetting.value-60, sankeyCanvasHeightSetting.value]);
  processInput();
});

sankeyCanvasHeightSetting.addEventListener('change', function() {
  document.getElementById('sankey-svg').setAttribute('viewBox', '0 0 ' + sankeyCanvasWidthSetting.value + ' ' + sankeyCanvasHeightSetting.value);
  layout.size([sankeyCanvasWidthSetting.value-60, sankeyCanvasHeightSetting.value]);
  processInput();
});

sankeyFontSizeSetting.addEventListener('input', () => {
  document.documentElement.style.setProperty(
      '--node-font-size',
      `${sankeyFontSizeSetting.value.trim().length > 0 ? sankeyFontSizeSetting.value.trim() : '20'}px`,
  );
});

sankeyNodeWidthSetting.addEventListener('input', () => {
  document.documentElement.style.setProperty(
      '--node-width',
      `${(isNaN(sankeyNodeWidthSetting.value) || isNaN(parseFloat(sankeyNodeWidthSetting.value))) ? '3' : sankeyNodeWidthSetting.value.trim()}px`,
  );
});

for (let sankeyNodeTextBackgroundOpacitySetting of sankeyNodeTextBackgroundOpacitySettings) {
  sankeyNodeTextBackgroundOpacitySetting.addEventListener('input', (evt) => {
    // keep the slider and number input both in-sync
    for (let sankeyNodeTextBackgroundOpacitySetting2 of sankeyNodeTextBackgroundOpacitySettings) {
      if(sankeyNodeTextBackgroundOpacitySetting === sankeyNodeTextBackgroundOpacitySetting2) continue;
      sankeyNodeTextBackgroundOpacitySetting2.value = evt.target.value;
    }

    document.documentElement.style.setProperty(
      '--node-text-bg-opacity',
      `${(isNaN(sankeyNodeTextBackgroundOpacitySetting.value) || isNaN(parseFloat(sankeyNodeTextBackgroundOpacitySetting.value))) ? '0' : sankeyNodeTextBackgroundOpacitySetting.value/100}`,
    );
    processInput();
  });
}

sankeyDisableWatermarkSetting.addEventListener('change', () => {
  document.getElementById('disable-watermark-notice').style['display'] = sankeyDisableWatermarkSetting.checked ? 'inline-block' : 'none';
  document.getElementById('sankey-svg-watermark').style['display'] = sankeyDisableWatermarkSetting.checked ? 'none' : 'inline';
})

/**
 * recursively generates the value of an auto-sum connection
 * @param {string[]} lines
 * @param {string} originalTarget
 * @return {number} the calculated value
 */
function calculateValue(lines, originalTarget) {
  let totalValue = 0.0;
  lines.forEach((line) => {
    if (line.startsWith('//') || line.startsWith('\'')) {
      return;
    }

    if (!lineRegex.test(line)) {
      return;
    }

    const regexGroups = lineRegex.exec(line);
    const source = regexGroups[1].trim();
    const value = regexGroups[2];
    const target = regexGroups[3].trim();

    if (source === originalTarget) {
      if (value === '?') {
        totalValue += parseFloat(calculateValue(lines, target));
      } else {
        totalValue += parseFloat(value);
      }
    } else if (target === originalTarget) {
      if (value === '?') {
        // todo, we should probably handle this as well.
      } else {
        totalValue -= parseFloat(value);
      }
    }
  });

  return totalValue;
}

/**
 * parses the given input to a sankey diagram
 * @param {string} input
 * @return {{nodes: *[], links: *[]}}
 */
function parseInputToSankey(input) {
  const lines = input.split('\n');

  const nodeKeys = [];
  const nodesList = [];
  const linksList = [];

  const precision = sankeyPrecisionSetting.value;

  let positions = undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('//') || line.startsWith('\'')) {
      continue;
    }

    if (line.startsWith('"positions":')) {
      positions = JSON.parse(`{${input.split('\n').slice(i, input.split('\n').length).join('')}}`)['positions'];
      break;
    }

    if (!lineRegex.test(line)) {
      continue;
    }

    const regexGroups = lineRegex.exec(line);
    const source = regexGroups[1].trim();
    let value = regexGroups[2];
    const target = regexGroups[3].trim();
    const color = regexGroups[4];

    if (!nodeKeys.includes(source)) {
      nodeKeys.push(source);
      nodesList.push({'id': source, 'color': sankeyNodeUseColorsSetting.checked ? getColor(source) : undefined});
    }

    if (!nodeKeys.includes(target)) {
      nodeKeys.push(target);
      nodesList.push({'id': target, 'color': sankeyNodeUseColorsSetting.checked ? getColor(target) : undefined});
    }

    if (value === '?') {
      value = calculateValue(lines, target);
    }

    linksList.push({
      'source': source,
      'target': target,
      'value': parseFloatWithPrecision(value, precision, sankeyHideZerosSetting.checked),
      'color': color in CSS3_NAMES_TO_HEX ? CSS3_NAMES_TO_HEX[color] : (color !== undefined && color.startsWith('#')) ? color : getColor(source),
    });
  }

  if (positions !== undefined) {
    if (positions.forEach) {
      layout.ordering(positions);
    }
  } else {
    layout.ordering(null);
  }

  return {
    nodes: nodesList,
    links: linksList,
  };
}

/**
 * processes the current input in the sankeyInput field and renders it
 */
export function processInput() {
  const graph = parseInputToSankey(sankeyInput.value);

  sankeySvg = d3.select('#sankey-svg');

  layout(graph);

  sankeySvg
      .datum(graph)
      .datum(layout.scale(null))
      .transition().duration(1000).ease(d3.easeCubic)
      .call(diagram);
}

document.getElementById('sankey-svg').setAttribute('viewBox', '0 0 ' + sankeyCanvasWidthSetting.value + ' ' + sankeyCanvasHeightSetting.value);
const layout = sankey.sankey()
    .size([sankeyCanvasWidthSetting.value-60, sankeyCanvasHeightSetting.value])
    .linkValue(function(d) {
      return d.value;
    });

const diagram = sankey.sankeyDiagram()
    .nodeValue(function(d) {
      const precision = sankeyPrecisionSetting.value;
      let nodeValue;

      if (sankeyHideNumbersSetting.checked) {
        return '';
      }

      if (d.incoming.length > 0) {
        let incomingValue = 0.0;
        d.incoming.forEach((incomingNode) => {
          incomingValue += parseFloat(incomingNode.value);
        });
        nodeValue = parseFloatWithPrecision(incomingValue, precision, sankeyHideZerosSetting.checked);
      } else {
        nodeValue = parseFloatWithPrecision(d.value, precision, sankeyHideZerosSetting.checked);
      }

      return sankeySeparatorSetting.checked ? Number(nodeValue).toLocaleString(undefined, {
        minimumFractionDigits: sankeyHideZerosSetting.checked ? undefined : precision,
        minimumSignificantDigits: sankeyHideZerosSetting.ch ? precision : undefined,
      }) : nodeValue;
    })
    .nodeTitle(function(d) {
      return d.id;
    })
    .nodeSuffix(function() {
      return sankeySuffixSetting.value;
    })
    .nodeTooltip(function(d) {
      const precision = sankeyPrecisionSetting.value;
      let outgoingValue = 0.0; let incomingValue = 0.0;
      d.outgoing.forEach((outgoingNode) => {
        outgoingValue += parseFloat(outgoingNode.value);
      });
      d.incoming.forEach((incomingNode) => {
        incomingValue += parseFloat(incomingNode.value);
      });

      if (d.outgoing.length > 0 && d.incoming.length > 0 && (Math.abs(outgoingValue) !== Math.abs(incomingValue))) {
        return parseFloatWithPrecision(d.value, precision, sankeyHideZerosSetting.checked)
          + '\ndifference: ' + (parseFloat(incomingValue) - parseFloat(outgoingValue)).toFixed(precision);
      } else {
        return parseFloatWithPrecision(d.value, precision, sankeyHideZerosSetting.checked);
      }
    })
    .linkMinWidth(function() {
      return 2.5;
    })
    .linkColor(function(d) {
      return d.value != 0 ? d.color : '#FFFFFF';
    })
    .margins({top: 0, right: 0, bottom: 0, left: 10});
