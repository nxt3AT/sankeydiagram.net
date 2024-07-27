addEventListener('DOMContentLoaded', () => {
  const allTabs = Array.from((document.getElementById('sankey-input-tabs')?.getElementsByTagName('li')) ?? []);
  const allTabContainers = Array.from((document.getElementById('sankey-input-box')?.getElementsByClassName('is-tab') ?? []));
  let currentTabIndex = 0;

  document.querySelectorAll('.close-notification-button').forEach((element) => {
    element.addEventListener('click', function() {
      element.parentElement.remove();
    });
  });

  document.querySelectorAll('.navbar-burger').forEach((element) => {
    element.addEventListener('click', function() {
      element.setAttribute('aria-expanded', element.getAttribute('aria-expanded') === 'true' ? 'false' : 'true')
    });
  });

  document.getElementById('sankey-input-tabs')?.addEventListener('click', function(e) {
    if (e.target.tagName.toLowerCase() !== 'button') {
      return;
    }
    allTabs[currentTabIndex].setAttribute('aria-selected', 'false');
    allTabContainers[currentTabIndex].setAttribute('aria-expanded', 'false');

    const newTabIndex = allTabs.indexOf(e.target.parentElement);
    allTabs[newTabIndex].setAttribute('aria-selected', 'true');
    allTabContainers[newTabIndex].setAttribute('aria-expanded', 'true');

    currentTabIndex = newTabIndex;
  });
});
