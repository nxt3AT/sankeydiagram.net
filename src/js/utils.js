/**
 * finds a get parameter from the url and returns it
 * @param {string|number} parameterName the name of the parameter to look for
 * @return {string|null} the found get parameter or null if not present
 */
export function findGetParameter(parameterName) {
  let result = null;
  let tmp = [];
  location.search
      .substr(1)
      .split('&')
      .forEach(function(item) {
        tmp = item.split('=');
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
      });
  return result;
}
