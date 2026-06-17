const form = document.querySelector("#marginForm");
const benefitInput = document.querySelector("#benefitValue");
const loanInput = document.querySelector("#loanValue");
const debitInput = document.querySelector("#debitValue");
const consentCheck = document.querySelector("#consentCheck");

const loanField = document.querySelector("#loanField");
const debitField = document.querySelector("#debitField");
const consentField = document.querySelector("#consentField");

const benefitError = document.querySelector("#benefitError");
const loanError = document.querySelector("#loanError");
const debitError = document.querySelector("#debitError");
const consentError = document.querySelector("#consentError");

const maximumInstallment = document.querySelector("#maximumInstallment");
const rateResult = document.querySelector("#rateResult");
const termResult = document.querySelector("#termResult");
const baseResult = document.querySelector("#baseResult");
const apiResult = document.querySelector("#apiResult");
const formulaText = document.querySelector("#formulaText");

function getRadioValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function parseMoney(value) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function clearErrors() {
  benefitError.textContent = "";
  loanError.textContent = "";
  debitError.textContent = "";
  consentError.textContent = "";
}

function updateConditionalFields() {
  const hasLoan = getRadioValue("hasLoan") === "yes";
  const receivesCrefisa = getRadioValue("receivesCrefisa") === "yes";
  const hasDebit = getRadioValue("hasDebit") === "yes";

  loanField.classList.toggle("hidden", !hasLoan);
  debitField.classList.toggle("hidden", !hasDebit);
  consentField.classList.toggle("hidden", receivesCrefisa);

  if (!hasLoan) {
    loanInput.value = "";
    loanError.textContent = "";
  }

  if (!hasDebit) {
    debitInput.value = "";
    debitError.textContent = "";
  }

  if (receivesCrefisa) {
    consentCheck.checked = false;
    consentError.textContent = "";
  }
}

function validate(values) {
  let isValid = true;
  clearErrors();

  if (values.benefit <= 0) {
    benefitError.textContent = "Informe um valor de benefício maior que zero.";
    isValid = false;
  }

  if (values.hasLoan && values.loan <= 0) {
    loanError.textContent = "Informe um valor de empréstimo ativo maior que zero.";
    isValid = false;
  }

  if (values.hasDebit && values.debit <= 0) {
    debitError.textContent = "Informe um valor de débitos maior que zero.";
    isValid = false;
  }

  if (!values.receivesCrefisa && !consentCheck.checked) {
    consentError.textContent = "O consentimento é obrigatório para banco conveniado.";
    isValid = false;
  }

  return isValid;
}

function calculate() {
  const values = {
    benefit: parseMoney(benefitInput.value),
    hasLoan: getRadioValue("hasLoan") === "yes",
    loan: parseMoney(loanInput.value),
    receivesCrefisa: getRadioValue("receivesCrefisa") === "yes",
    hasDebit: getRadioValue("hasDebit") === "yes",
    debit: parseMoney(debitInput.value)
  };

  if (!validate(values)) {
    return;
  }

  const activeLoan = values.hasLoan ? values.loan : 0;
  const sameDayDebit = values.hasDebit ? values.debit : 0;
  const rate = values.receivesCrefisa ? 0.6 : 0.3;
  const term = values.receivesCrefisa ? 15 : 12;
  const baseAfterLoans = Math.max(values.benefit - activeLoan, 0);
  const installmentBeforeDebits = baseAfterLoans * rate;
  const maximum = Math.max(installmentBeforeDebits - sameDayDebit, 0);

  maximumInstallment.textContent = formatMoney(maximum);
  rateResult.textContent = `${Math.round(rate * 100)}%`;
  termResult.textContent = `${term} vezes`;
  baseResult.textContent = formatMoney(baseAfterLoans);
  apiResult.textContent = `parcelaMaxima: ${maximum.toFixed(2)}`;
  formulaText.textContent = `${formatMoney(values.benefit)} - ${formatMoney(activeLoan)} = ${formatMoney(baseAfterLoans)}. ${formatMoney(baseAfterLoans)} x ${Math.round(rate * 100)}% = ${formatMoney(installmentBeforeDebits)}. ${formatMoney(installmentBeforeDebits)} - ${formatMoney(sameDayDebit)} = ${formatMoney(maximum)}.`;
}

function formatInputOnBlur(event) {
  const value = parseMoney(event.target.value);

  if (event.target.value.trim() !== "") {
    event.target.value = value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener("change", updateConditionalFields);
});

[benefitInput, loanInput, debitInput].forEach((input) => {
  input.addEventListener("blur", formatInputOnBlur);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

updateConditionalFields();
