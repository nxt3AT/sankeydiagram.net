import LZString from 'lz-string';

import {sankeyInput} from './constants';
import {processInput} from './sankey-builder';
import {findGetParameter} from './utils';
import {deserializeSettings, serializeSettings} from './settings-serializer';

document.querySelector('.export-txt-button').addEventListener('click', downloadCurrentInputAsTxt);
document.querySelector('#import-text-input').addEventListener('change', handleFileImport);

/**
 * imports the given text file, puts its content in the inputfield and renders the diagram
 * @param {Event} event the event of the file upload form element
 */
function handleFileImport(event) {
  const {files} = event.target;
  const reader = new FileReader();
  reader.addEventListener('load', (readerEvent) => {
    const {result} = readerEvent.target;
    sankeyInput.value = result;
    processInput();
  });
  reader.readAsText(files[0]);
}

/**
 * downloads the current input in the sankeyInput field as a text file
 */
function downloadCurrentInputAsTxt() {
  const {value} = sankeyInput;
  const downloadElement = document.createElement('a');
  downloadElement.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`);
  downloadElement.setAttribute('download', 'sankeydiagram.txt');
  downloadElement.style.display = 'none';
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
}

/**
 * serializes the user input and returns it as a compressed string in base64 representation
 * @return {string}
 */
function serializeData() {
  return LZString.compressToBase64(sankeyInput.value);
}

/**
 * takes the given compressed string in base64 representation, puts it into user input, and returns and decompressed string
 * @param {string} rawData the compressed string in base64 representation
 * @return {string}
 */
function deserializeData(rawData) {
  const decompressedData = LZString.decompressFromBase64(rawData);
  sankeyInput.value = decompressedData;
  processInput();
  return decompressedData;
}

document.querySelectorAll('.copy-link-button').forEach((button) => (
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.protocol + '//' + location.host + location.pathname + '?content=' + serializeData() + '&' + serializeSettings().toString());
      button.classList.add('is-clicked');
      setTimeout(() => button.classList.remove('is-clicked'), 700);
    } catch (err) {
      console.error('failed copying to clipboard ', err);
    }
  })
));

document.addEventListener('DOMContentLoaded', () => {
  if (findGetParameter('content') !== null) {
    deserializeSettings();
    deserializeData(findGetParameter('content'));
  } else {
    processInput();
  }
});
