// @flow

/**
 * Simple syntax parser for algebraic expressions.
 */

export type ComplexNumber = { re: number, im: number };

const VARIABLE = 'z';

const ALIASES = {
  '+': 'plus',
  '-': 'minus',
  '*': 'mul',
  '/': 'div',
  '^': 'pow',
  ln: 'log',
  sh: 'sinh',
  ch: 'cosh',
  th: 'tanh',
};

const PRIORITY = {
  plus: 0,
  minus: 0,
  mul: 1,
  div: 1,
  pow: 2,
  re: 3,
  im: 3,
  arg: 3,
  mod: 3,
  exp: 3,
  log: 3,
  sqrt: 3,
  sinh: 3,
  cosh: 3,
  tanh: 3,
  asinh: 3,
  acosh: 3,
  atanh: 3,
};

const ARITY = {
  plus: 2,
  minus: 2,
  mul: 2,
  div: 2,
  pow: 2,
  re: 1,
  im: 1,
  arg: 1,
  mod: 1,
  exp: 1,
  log: 1,
  sqrt: 1,
  sinh: 1,
  cosh: 1,
  tanh: 1,
  asinh: 1,
  acosh: 1,
  atanh: 1,
};

const VAR_REGEX = /^[A-Za-z]+/;

const NUMBER_REGEX = new RegExp('^'
  + '-?[0-9]+(\\.[0-9]+)?' // Real part
  + '((i|j)-?[0-9]+(\\.[0-9]+)?)?'); // Imaginary part (optional)
const OPEN_BRACKETS = '([{';
const CLOSE_BRACKETS = ')]}';

/**
 * Parses a complex number.
 *
 * @param {string} str
 *    number in form a(i|j)b = a + b * i, where i = srqt(-1)
 * @returns {Object}
 *    object with 're' and 'im' fields specifying real and imaginary part of the number,
 *    respectively
 */
function parseNumber(str: string): ComplexNumber {
  let splitIdx = str.indexOf('i');
  if (splitIdx < 0) splitIdx = str.indexOf('j');
  if (splitIdx < 0) {
    return { re: parseFloat(str), im: 0 };
  }

  return {
    re: parseFloat(str.substring(0, splitIdx)),
    im: parseFloat(str.substring(splitIdx + 1)),
  };
}

/**
 * Returns the canonical operation name given a name or an alias.
 *
 * @param {string} op
 *    name of the operation
 * @returns {string}
 *    canonical operation name, or null if the operation with the given name or alias
 *    does not exist
 */
function canonicalName(op: string): ?string {
  const canonicalOp = ALIASES[op] || op;
  return (PRIORITY[canonicalOp] !== undefined) ? canonicalOp : null;
}

type VariableToken = { type: 'variable' };
type FunctionToken = { type: 'function', name: string, priority: number, arity: 1 | 2 };
type BracketToken = { type: '(' } | { type: ')' };
type NumberToken = { type: 'number', value: ComplexNumber };
type CompiledToken = NumberToken | VariableToken | FunctionToken;
type Token = CompiledToken | BracketToken;

function tokenize(string: string): Token[] {
  const tokens = [];

  for (let i = 0; i < string.length;) {
    let match = string.substring(i).match(VAR_REGEX);
    if (match) {
      const name = match[0];
      const op = canonicalName(name);
      if (op && ARITY[op] === 1) {
        tokens.push({
          type: 'function',
          name: op,
          priority: PRIORITY[op],
          arity: 1,
        });
      } else if (name === VARIABLE) {
        tokens.push({
          type: 'variable',
        });
      } else {
        throw new Error(`Invalid variable name: ${name}`);
      }
      i += name.length;
    } else {
      match = string.substring(i).match(NUMBER_REGEX);
      if (match) {
        const prev = tokens[tokens.length - 1];
        // Numbers may only occur after opening brackets (or at the start of the line),
        // or after functions
        if (!prev || (prev.type === 'function') || (prev.type === '(')) {
          tokens.push({
            type: 'number',
            value: parseNumber(match[0]),
          });
          i += match[0].length;
        }
      } else {
        const name = string[i];
        const op = canonicalName(name);
        if (op) {
          tokens.push({
            type: 'function',
            name: op,
            priority: PRIORITY[op],
            arity: 2,
          });
        } else if (OPEN_BRACKETS.indexOf(name) >= 0) {
          tokens.push({ type: '(' });
        } else if (CLOSE_BRACKETS.indexOf(name) >= 0) {
          tokens.push({ type: ')' });
        } else if (!/\s/.test(name)) {
          throw new Error('Invalid symbol');
        }
        i += 1;
      }
    }
  }
  return tokens;
}

function processNumbers(tokens: Token[]): ComplexNumber[] {
  const numbers = [];

  // Replace numbers with created variables
  tokens.forEach((token) => {
    if (token.type === 'number') {
      numbers.push(token.value);
    }
  });

  return numbers;
}

function processBrackets(tokens: Array<BracketToken | CompiledToken>): CompiledToken[] {
  const maxPriority = 5;
  let level = 0;

  const processedTokens = tokens.map((token) => {
    if (token.type === 'function') {
      const newToken: FunctionToken = Object.assign({}, token);
      newToken.priority = token.priority + level * maxPriority;
      return newToken;
    } if (token.type === '(') {
      level += 1;
    } else if (token.type === ')') {
      level -= 1;
      if (level < 0) throw new Error('Unmatched brackets');
    }

    return token;
  });

  if (level !== 0) {
    throw new Error('Unmatched brackets');
  }

  // Remove brackets - we don't need them any longer.
  const newTokens = [];
  processedTokens.forEach((token) => {
    if (token.type !== '(' && token.type !== ')') {
      newTokens.push(token);
    }
  });
  return newTokens;
}

type TokenTree = {
  value: CompiledToken,
  left?: TokenTree,
  right?: TokenTree,
};

function check(item: ?TokenTree): void {
  if (!item || (item.value.type === 'function' && !item.right)) {
    throw new Error('Syntax error');
  }
}

function buildTree(tokens: CompiledToken[]): TokenTree {
  let maxPriority = 0;
  tokens.forEach((token) => {
    if (token.type === 'function') {
      maxPriority = Math.max(token.priority, maxPriority);
    }
  });

  const forest: TokenTree[] = tokens.map(token => ({ value: token }));
  for (let pr = maxPriority; pr >= 0; pr -= 1) {
    // Process unary operators right to left
    for (let i = forest.length - 1; i >= 0; i -= 1) {
      const token = forest[i];
      if (token.value.arity === 1 && token.value.priority === pr) {
        const nextToken = forest[i + 1];
        check(nextToken);
        const replacement = { value: token.value, right: nextToken };
        forest.splice(i, 2, replacement);
      }
    }

    // Process binary operators, left to right
    for (let i = 0; i < forest.length;) {
      const token = forest[i];
      if (token.value.arity === 2 && token.value.priority === pr) {
        check(forest[i - 1]);
        check(forest[i + 1]);

        const replacement = {
          left: forest[i - 1],
          right: forest[i + 1],
          value: token.value,
        };
        forest.splice(i - 1, 3, replacement);
      } else {
        i += 1;
      }
    }
  }

  if (forest.length !== 1) {
    throw new Error('Syntax error');
  }
  return forest[0];
}

function buildNotation(tree: TokenTree): string[] {
  let notation = [];
  if (tree.left) {
    notation = notation.concat(buildNotation(tree.left));
  }
  if (tree.right) {
    notation = notation.concat(buildNotation(tree.right));
  }

  let name = '';
  switch (tree.value.type) {
    case 'function': ({ name } = tree.value); break;
    case 'variable': name = 'var'; break;
    case 'number': name = 'data'; break;
    default: // unreachable
  }
  notation.push(name);

  return notation;
}

export type Notation = {
  tokens: string[],
  numbers: ComplexNumber[],
};

export function parse(code: string): Notation {
  const tokens = tokenize(code);
  const numbers = processNumbers(tokens);
  const compiledTokens = processBrackets(tokens);
  const tree = buildTree(compiledTokens);
  const notation = buildNotation(tree);
  return { tokens: notation, numbers };
}

/**
 * Generates GLSL code based on reverse polish notation.
 *
 * @param {Array} notation
 *    notation for a complex-valued function with a variable denoted by z
 * @returns {Object}
 *    object with the two fields:
 *    <ul>
 *    <li>code - GLSL code to compute a function
 *    <li>params - array of floats to bind to 'u_params' uniform
 *    </ul>
 */
export function prepareForShader(notation: Notation): { code: string, params: number[] } {
  const values = [];
  notation.numbers.forEach(({ re, im }) => {
    values.push(re);
    values.push(im);
  });

  const stack = [];
  let numberPtr = 0;

  notation.tokens.forEach((token) => {
    if (token === 'data') {
      stack.push(`u_params[${numberPtr}]`);
      numberPtr += 1;
    } else if (token === 'var') {
      stack.push('z');
    } else {
      // Function
      switch (ARITY[token]) {
        case 1: {
          const expr = stack.pop();
          stack.push(`c_${token}(${expr})`);
          break;
        }
        case 2: {
          const [rhs, lhs] = [stack.pop(), stack.pop()];
          stack.push(`c_${token}(${lhs}, ${rhs})`);
          break;
        }
        default:
          throw new Error('Invalid operation arity');
      }
    }
  });

  return { code: stack[0], params: values };
}
