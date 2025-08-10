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

/**
 *
 * @param value the value to parse
 * @param precision the number of significant decimal places
 * @param hideZeroDecimals should "x.0" be represented as just "x"?
 * @returns {string|number} as parsed float that is not 0 (unless the provided value was also 0)
 */
export function parseFloatWithPrecision(value, precision, hideZeroDecimals) {
  let parsedValue;
  if(hideZeroDecimals) {
    parsedValue = Number(parseFloat(value).toFixed(precision));
  } else {
    parsedValue = parseFloat(value).toFixed(precision);
  }

  // if we receive a value that is NOT ZERO but parsing the received value with the given precision would result in a "0"
  // we up the precision by 1 until we receive a parsed float that is not 0.
  // so that we don't misrepresent the value too much.
  if(value > 0 && value < 1 && parsedValue == 0) {
    return parseFloatWithPrecision(value, precision + 1, hideZeroDecimals);
  }

  return parsedValue;
}

/**
 * @param {string} expr
 * @returns {number}
 */
export function evaluateMathExpression(expr) {
  let pos = 0;

  const peek = () => expr[pos];
  const next = () => expr[pos++];
  const skipSpaces = () => { while (peek() === ' ') next(); };

  const parseNumber = () => {
    skipSpaces();
    let num = '';
    while (peek() && /[0-9.]/.test(peek())) num += next();
    return parseFloat(num);
  };

  const parseFactor = () => {
    skipSpaces();
    if (peek() === '(') {
      next(); // consume '('
      const result = parseExpression();
      skipSpaces();
      if (peek() === ')') next(); // consume ')'
      return result;
    }
    return parseNumber();
  };

  const parseTerm = () => {
    let result = parseFactor();
    skipSpaces();
    while (peek() && /[*/]/.test(peek())) {
      const op = next();
      const right = parseFactor();
      result = op === '*' ? result * right : result / right;
      skipSpaces();
    }
    return result;
  };

  const parseExpression = () => {
    let result = parseTerm();
    skipSpaces();
    while (peek() && /[+-]/.test(peek())) {
      const op = next();
      const right = parseTerm();
      result = op === '+' ? result + right : result - right;
      skipSpaces();
    }
    return result;
  };

  if (!/^[0-9.+\-*/()\s]*$/.test(expr)) {
    throw new Error('Invalid characters in math expression');
  }

  return parseExpression();
}
