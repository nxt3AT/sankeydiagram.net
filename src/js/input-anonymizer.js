import {lineRegex, sankeyInput} from './constants';
import {processInput} from './sankey-builder';

const anonymizeDataWarningModal = document.getElementById('anonymize-data-modal');

/**
 * generates a random string with the given length and returns it
 * @param {number} length length of the string to generate
 * @return {string} the generated string
 */
function generateRandomString(length) {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

/**
 * anonymize the input by replacing strings with random gibberish and multiplying all numbers with the same random factor
 */
function anonymizeData() {
  let scrubbedLines = '';
  const scrubbingFactor = (Math.random() * (1.150 - 0.950) + 0.950).toFixed(3);
  const replacedKeyDict = {};

  sankeyInput.value.split('\n').forEach((line) => {
    if (line.startsWith('//') || line.startsWith('\'')) {
      return;
    }

    if (!lineRegex.test(line)) {
      return;
    }

    const regexGroups = lineRegex.exec(line);
    const source = regexGroups[1].trim();
    let value = regexGroups[2];
    const target = regexGroups[3].trim();

    if (replacedKeyDict[source] == null) {
      replacedKeyDict[source] = generateRandomString(source.length);
    }

    if (value !== '?') {
      value = (value*scrubbingFactor).toFixed(0);
    }

    if (replacedKeyDict[target] == null) {
      replacedKeyDict[target] = generateRandomString(target.length);
    }

    scrubbedLines += replacedKeyDict[source] + ' [' + value + '] ' + replacedKeyDict[target] + '\n';
  });

  sankeyInput.value = scrubbedLines;

  processInput();
}

document.querySelectorAll('.anonymize-data-button').forEach((element) => {
  element.addEventListener('click', function() {
    anonymizeDataWarningModal.showModal();
  });
});
document.querySelectorAll('.anonymize-data-confirmation-button').forEach((element) => {
  element.addEventListener('click', function() {
    anonymizeData();
  });
});
document.querySelectorAll('#anonymize-data-modal button').forEach((element) => {
  element.addEventListener('click', function(){
    anonymizeDataWarningModal.close();
  })
})
