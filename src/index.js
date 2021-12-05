/* @jsx createElement */

/* eslint-disable react/react-in-jsx-scope, react/jsx-filename-extension, no-unused-vars */
const Operator = require('./Operator');

function createElement(tagName, props, ...children) {
  const element = document.createElement(tagName);

  Object.entries(props || {}).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
      return;
    }
    if (key.includes('-')) {
      element.setAttribute(key.toLowerCase(), value);
      return;
    }
    element[key.toLowerCase()] = value;
  });

  children.flat().forEach((child) => {
    if (child instanceof Node) {
      element.appendChild(child);
      return;
    }
    element.appendChild(document.createTextNode(child));
  });

  return element;
}

const operators = [
  Operator.getPlus(),
  Operator.getMinus(),
  Operator.getMultiply(),
  Operator.getDivide(),
  Operator.getEquals(),
];

/**
 * @param {Array<string | number>} [inputs=[]]
 * @return {number}
 */
function getLastIndex(inputs = []) {
  return inputs.length - 1;
}

/**
 * @param {Array<string | number>} [inputs=[]]
 * @return {number | string}
 */
function getLastInput(inputs = []) {
  return inputs[getLastIndex(inputs)];
}

/**
 * @param {Array<string | number>} [inputs=[]]
 * @return {string}
 */
function getDisplayContent(inputs = []) {
  // 처음에는 0
  // 마지막 누른 버튼이 숫자라면 마지막 입력한 숫자를 보여줌
  // 마지막 누른 버튼이 연산자라면 지금까지의 연산 결과를 보여줌
  if (inputs.length === 0) {
    return '0';
  }
  const lastInput = getLastInput(inputs);
  if (typeof lastInput === 'number') {
    return lastInput;
  }

  return `${inputs.reduce((acc, input, index) => {
    if (index === 0) {
      return input;
    }
    const prevInput = inputs[index - 1];
    if (typeof input === 'number' && prevInput instanceof Operator) {
      return prevInput.calculate(acc, input);
    }
    return acc;
  })}`;
}

const operatorFunctions = {
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => x / y,
};

function calculate(operator, accumulator, number) {
  return operatorFunctions[operator]?.(accumulator, number) || number;
}

/**
 * @param {{ inputs: Array<string | number> }} props
 */
function render({ accumulator, number, operator }) {
  function handleClickNumber(value) {
    render({
      accumulator,
      number: (number || 0) * 10 + value,
      operator,
    });
  }

  function handleClickOperator(value) {
    return render({
      accumulator: calculate(operator, accumulator, number),
      number: null,
      operator: value,
    });
  }
  // function handleClickNumber(number) {
  //   if (typeof getLastInput(inputs) === 'number') {
  //     const newInputs = [...inputs];
  //     newInputs[getLastIndex(inputs)] = getLastInput(inputs) * 10 + number;
  //     render({ inputs: newInputs });
  //     return;
  //   }
  //   render({ inputs: [...inputs, number] });
  // }

  // function handleClickOperator(operator) {
  //   if (inputs.length === 0) {
  //     return;
  //   }
  //   const lastInput = getLastInput(inputs);
  //   if (typeof lastInput !== 'number') {
  //     const newInputs = [...inputs];
  //     newInputs[getLastIndex(inputs)] = operator;
  //     render({ inputs: newInputs });
  //     return;
  //   }
  //   render({ inputs: [...inputs, operator] });
  // }

  const element = (
    <section className="calculator">
      <h1>간단 계산기</h1>
      <div className="calculator__display">
        <p>{number || accumulator || 0}</p>
      </div>
      <ul className="calculator__numbers">
        {[...Array(9).keys()].map((_, index) => {
          const currentNumber = (index + 1) % 10;
          return (
            <li data-key={currentNumber}>
              <button
                type="button"
                aria-label={currentNumber}
                onClick={() => handleClickNumber(currentNumber)}
              >
                {currentNumber}
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="calculator__operators">
        {operators.map((currentOperator) => (
          <li data-key={currentOperator.name}>
            <button
              type="button"
              aria-label={currentOperator.name}
              onClick={() => handleClickOperator(currentOperator.symbol)}
            >
              {currentOperator.symbol}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

  const app = document.getElementById('app');
  app.textContent = '';
  app.appendChild(element);
}

render({
  accumulator: null,
  number: null,
  operator: null,
});
