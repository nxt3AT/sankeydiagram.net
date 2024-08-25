const defaultSettings = {};
document.querySelectorAll('.settings-input').forEach((element) => {
  if (element.hasAttribute('defaultValue')) {
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
    if (!(element.id in defaultSettings)) {
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
 * deserializes a single setting
 * @param key {string}
 * @param value {string|boolean|number}
 */
function deserializeSetting(key, val) {
  // IMPORTANT: only allow keys that are part of the settings to prevent attacks
  if (key in defaultSettings) {
    const element = document.getElementById(key);

    // IMPORTANT: double check if the parameter really represents a setting we want to be modifiable
    if (!element?.classList.contains('settings-input')) {
      return;
    }

    if (element instanceof HTMLSelectElement) {
      element.selectedIndex = val;
    } else if (element.type === 'checkbox') {
      element.checked = val === 'true';
    } else {
      document.getElementById(key).value = val;
    }

    element.dispatchEvent(new Event('change'));
    element.dispatchEvent(new Event('input'));
  }
}

/**
 * looks through the query params and updates the according settings in the gui
 */
export function deserializeSettings() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  urlSearchParams.forEach((val, key) => {
    deserializeSetting(key, val);
  });
}

/**
 * looks through the passed object and updates the according settings in the gui
 * @param settingsMap {Object.<string, string|boolean|number>}}
 */
export function deserializeSettingsFromObject(settingsMap) {
  Object.entries(settingsMap).forEach(([key, val]) => {
    deserializeSetting(key, val);
  });
}

/**
 * loads a pre-defined settings preset
 * @param presetName {"olddefault"}
 */
export function loadSettingsPreset(presetName) {
  switch (presetName?.toLowerCase()) {
    case 'olddefault': {
      deserializeSettingsFromObject({
        'sankey-settings-colorscheme': '3',
        'sankey-settings-flow-opacity': 80,
        'sankey-settings-node-use-colors': false,
        'sankey-settings-node-width': 3,
        'sankey-settings-flow-color-based-on-first-word': false,
        'sankey-settings-node-text-background-opacity': 0,
      })
      break;
    }
    default: {
      console.warn('tried loading unknown settings preset', presetName)
    }
  }
}

document.querySelectorAll('.load-settings-preset-button').forEach(btn => {
  btn.addEventListener('click', (evt) => loadSettingsPreset(evt.target.dataset['settingsPreset']));
})
