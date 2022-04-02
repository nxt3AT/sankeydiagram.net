import {processInput} from './sankey-builder';

const allTabs = Array.from(document.getElementById('sankey-input-tabs').getElementsByTagName('li'));
const allTabContainers = Array.from(document.getElementById('sankey-input-box').getElementsByClassName('is-tab'));
let currentTabIndex = 0;

document.querySelectorAll('.close-notification-button').forEach((element) => {
  element.addEventListener('click', function() {
    element.parentElement.remove();
  });
});

document.querySelectorAll('.navbar-burger').forEach((element) => {
  element.addEventListener('click', function() {
    const target = document.getElementById(element.dataset.target);

    element.classList.toggle('is-active');
    target.classList.toggle('is-active');
  });
});

document.getElementById('sankey-input-tabs').addEventListener('click', function(e) {
  if (e.target.tagName !== 'A') {
    return;
  }

  allTabs[currentTabIndex].classList.remove('is-active');
  allTabContainers[currentTabIndex].classList.remove('is-active');

  const newTabIndex = allTabs.indexOf(e.target.parentElement);
  allTabs[newTabIndex].classList.add('is-active');
  allTabContainers[newTabIndex].classList.add('is-active');

  currentTabIndex = newTabIndex;
});

window.addEventListener('resize', processInput);

document.getElementById('sankey-input-box').addEventListener('resize', function() {
  processInput();
});
