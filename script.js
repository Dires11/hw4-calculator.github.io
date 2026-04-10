// ── Calculator state ──────────────────────────────────────────────────────────
const state = {
    currentValue: '0',   // what is shown on screen
    storedValue: null,   // operand saved before an operator was pressed
    operator: null,      // pending operator: '+', '-', '*', '/'
    waitingForOperand: false  // true right after operator or equals pressed
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const display = document.querySelector('.screen-display');
const buttons = document.querySelectorAll('.btn');

// ── Arithmetic (no eval) ──────────────────────────────────────────────────────
function calculate(a, op, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 'Error';
        default:  return b;
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatResult(value) {
    if (value === 'Error') return 'Error';
    // Avoid floating-point noise (e.g. 0.1+0.2 = 0.30000000000000004)
    const str = parseFloat(value.toPrecision(12)).toString();
    return str;
}

function updateDisplay(value) {
    display.textContent = value;
}

function clearActiveOp() {
    document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('active-op'));
}

function highlightActiveOp(op) {
    clearActiveOp();
    document.querySelectorAll('[data-value]').forEach(btn => {
        if (btn.dataset.value === op && btn.dataset.action === 'operator') {
            btn.classList.add('active-op');
        }
    });
}

// ── Action handlers ───────────────────────────────────────────────────────────
function handleDigit(digit) {
    if (state.waitingForOperand) {
        state.currentValue = digit;
        state.waitingForOperand = false;
    } else {
        // Prevent multiple leading zeros
        if (state.currentValue === '0' && digit !== '.') {
            state.currentValue = digit;
        } else {
            // Limit display length
            if (state.currentValue.length < 12) {
                state.currentValue += digit;
            }
        }
    }
    updateDisplay(state.currentValue);
}

function handleOperator(op) {
    const current = parseFloat(state.currentValue);

    if (state.operator && !state.waitingForOperand) {
        // Chain operations: compute pending result first
        const result = calculate(state.storedValue, state.operator, current);
        if (result === 'Error') {
            updateDisplay('Error');
            resetState();
            return;
        }
        state.storedValue = result;
        state.currentValue = formatResult(result);
        updateDisplay(state.currentValue);
    } else {
        state.storedValue = current;
    }

    state.operator = op;
    state.waitingForOperand = true;
    highlightActiveOp(op);
}

function handleEquals() {
    if (state.operator === null || state.waitingForOperand) return;

    const current = parseFloat(state.currentValue);
    const result = calculate(state.storedValue, state.operator, current);

    if (result === 'Error') {
        updateDisplay('Error');
        resetState();
        return;
    }

    const formatted = formatResult(result);
    updateDisplay(formatted);
    state.currentValue = formatted;
    state.storedValue = null;
    state.operator = null;
    state.waitingForOperand = true;
    clearActiveOp();
}

function handleClear() {
    resetState();
    updateDisplay('0');
    clearActiveOp();
}

function handleBackspace() {
    if (state.waitingForOperand) return;
    if (state.currentValue.length === 1 || state.currentValue === 'Error') {
        state.currentValue = '0';
    } else {
        state.currentValue = state.currentValue.slice(0, -1);
    }
    updateDisplay(state.currentValue);
}

function resetState() {
    state.currentValue = '0';
    state.storedValue = null;
    state.operator = null;
    state.waitingForOperand = false;
}

// ── Event delegation ──────────────────────────────────────────────────────────
document.querySelector('.calculator-buttons').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const value  = btn.dataset.value;

    switch (action) {
        case 'digit':    handleDigit(value);    break;
        case 'operator': handleOperator(value); break;
        case 'equals':   handleEquals();        break;
        case 'clear':    handleClear();         break;
        case 'backspace': handleBackspace();    break;
    }
});

// ── Keyboard support ──────────────────────────────────────────────────────────
document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
    } else if (e.key === '+') {
        handleOperator('+');
    } else if (e.key === '-') {
        handleOperator('-');
    } else if (e.key === '*') {
        handleOperator('*');
    } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('/');
    } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
    } else if (e.key === 'Backspace') {
        handleBackspace();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
    }
});
