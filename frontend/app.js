class CalculatorError extends Error {}

class Parser {
  constructor(text) {
    this.text = text;
    this.index = 0;
  }

  parse() {
    const value = this.expression();
    this.skipSpaces();

    if (this.index !== this.text.length) {
      throw new CalculatorError(`Unexpected input: ${this.text.slice(this.index)}`);
    }

    return value;
  }

  expression() {
    let value = this.term();

    while (true) {
      this.skipSpaces();

      if (this.match("+")) {
        value += this.term();
      } else if (this.match("-")) {
        value -= this.term();
      } else {
        return value;
      }
    }
  }

  term() {
    let value = this.factor();

    while (true) {
      this.skipSpaces();

      if (this.match("*")) {
        value *= this.factor();
      } else if (this.match("/")) {
        const divisor = this.factor();
        if (divisor === 0) {
          throw new CalculatorError("Cannot divide by zero");
        }
        value /= divisor;
      } else if (this.match("%")) {
        const divisor = this.factor();
        if (divisor === 0) {
          throw new CalculatorError("Cannot modulo by zero");
        }
        value %= divisor;
      } else {
        return value;
      }
    }
  }

  factor() {
    this.skipSpaces();

    if (this.match("+")) {
      return this.factor();
    }

    if (this.match("-")) {
      return -this.factor();
    }

    if (this.match("(")) {
      const value = this.expression();
      this.skipSpaces();

      if (!this.match(")")) {
        throw new CalculatorError("Missing closing parenthesis");
      }

      return value;
    }

    return this.number();
  }

  number() {
    this.skipSpaces();
    const start = this.index;
    let dots = 0;

    while (this.index < this.text.length) {
      const char = this.text[this.index];

      if (char === ".") {
        dots += 1;
        if (dots > 1) {
          break;
        }
      } else if (!/\d/.test(char)) {
        break;
      }

      this.index += 1;
    }

    if (start === this.index) {
      throw new CalculatorError("Expected a number");
    }

    const token = this.text.slice(start, this.index);

    if (token === ".") {
      throw new CalculatorError("Expected a number");
    }

    return Number(token);
  }

  match(expected) {
    if (this.text.startsWith(expected, this.index)) {
      this.index += expected.length;
      return true;
    }

    return false;
  }

  skipSpaces() {
    while (this.index < this.text.length && /\s/.test(this.text[this.index])) {
      this.index += 1;
    }
  }
}

const expressionEl = document.querySelector("#expression");
const statusEl = document.querySelector("#status");
const historyEl = document.querySelector("#history");
let expression = "";

function calculate(text) {
  return new Parser(text).parse();
}

function formatResult(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(12)));
}

function render(status = "Ready", isError = false) {
  expressionEl.textContent = expression || "0";
  statusEl.textContent = status;
  statusEl.classList.toggle("error", isError);
}

function appendValue(value) {
  expression += value;
  render();
}

function clearExpression() {
  expression = "";
  render();
}

function backspace() {
  expression = expression.slice(0, -1);
  render();
}

function addHistory(input, result) {
  const item = document.createElement("li");
  item.innerHTML = `${input} = <strong>${result}</strong>`;
  historyEl.prepend(item);

  while (historyEl.children.length > 6) {
    historyEl.lastElementChild.remove();
  }
}

function runCalculation() {
  if (!expression.trim()) {
    render("Enter an expression", true);
    return;
  }

  try {
    const input = expression;
    const result = formatResult(calculate(expression));
    expression = result;
    addHistory(input, result);
    render("Done");
  } catch (error) {
    render(error.message, true);
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.value) {
    appendValue(button.dataset.value);
  } else if (button.dataset.action === "clear") {
    clearExpression();
  } else if (button.dataset.action === "backspace") {
    backspace();
  } else if (button.dataset.action === "calculate") {
    runCalculation();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9+\-*/%().]$/.test(key)) {
    appendValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    runCalculation();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearExpression();
  }
});

render();
