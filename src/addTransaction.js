// Set both date inputs to today
const today = new Date().toISOString().split("T")[0];

const incomeDate = document.getElementById("incomeDate");
const expenseDate = document.getElementById("expenseDate");

setupCurrencyInput("incomeAmountInput");
setupCurrencyInput("expenseAmountInput");

if (incomeDate) {
  incomeDate.value = today;
}

if (expenseDate) {
  expenseDate.value = today;
}

function setupCurrencyInput(inputId) {
  const input = document.getElementById(inputId);

  let rawValue = "";

  input.addEventListener("input", function () {
    rawValue = this.value.replace(/\D/g, "");

    if (rawValue.length === 0) {
      this.value = "0.00";
      return;
    }

    const cents = parseInt(rawValue, 10);
    this.value = (cents / 100).toFixed(2);
  });

  input.addEventListener("keydown", function (e) {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];

    if (!allowedKeys.includes(e.key) && !/\d/.test(e.key)) {
      e.preventDefault();
    }
  });

  input.value = "0.00";
}
