const defaultSettings = {};
document.querySelectorAll('.settings-input').forEach((element) => {
  if (!!element.defaultValue) {
    defaultSettings[element.id] = element.defaultValue;
    return;
  }

  if (element instanceof HTMLSelectElement) {
    defaultSettings[element.id] = 0;
    return;
  }

  if (element.type === 'checkbox') {
    defaultSettings[element.id] = element.hasAttribute('checked');
    return;
  }

  // fall back to current value if we can't assess the default value
  defaultSettings[element.id] = element.value;
});

/**
 * serializes the changed settings and returns them as URLSearchParams
 * @return {URLSearchParams}
 */
export function serializeSettings() {
  const changedSettings = {};

  document.querySelectorAll('.settings-input').forEach((element) => {
    if (!element.id in defaultSettings) {
      return;
    }

    if (element instanceof HTMLSelectElement) {
      if (element.selectedIndex !== defaultSettings[element.id]) {
        changedSettings[element.id] = element.selectedIndex;
      }
      return;
    }

    if (element.type === 'checkbox') {
      if ((element.checked) !== defaultSettings[element.id]) {
        changedSettings[element.id] = element.checked;
      }
      return;
    }

    if (element.value !== defaultSettings[element.id]) {
      changedSettings[element.id] = element.value;
    }
  });

  return new URLSearchParams(changedSettings);
}

/**
 * looks through the query params and updates the according settings in the gui
 */
export function deserializeSettings() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  urlSearchParams.forEach((val, key) => {
    // IMPORTANT: only allow keys that are part of the settings to prevent attacks
    if (key in defaultSettings) {
      const element = document.getElementById(key);

      if (element instanceof HTMLSelectElement) {
        element.selectedIndex = val;
        return;
      }

      if (element.type === 'checkbox') {
        element.checked = val === 'true';
        return;
      }

      document.getElementById(key).value = val;
    }
  });
}
