import { calculateThreeFourthGuarantee } from "./calculator.js";
import { searchCases, getCaseByNumber } from "./lookup.js";

const form = document.querySelector("#calculator-form");

const startDateInput = document.querySelector("#start-date");
const endDateInput = document.querySelector("#end-date");
const weeklyHoursInput = document.querySelector("#weekly-hours");

const lookupToggle = document.querySelector("#lookup-toggle");
const lookupSection = document.querySelector("#lookup-section");

const caseSearchInput = document.querySelector("#case-search");
const searchButton = document.querySelector("#search-button");
const searchResults = document.querySelector("#search-results");

const errorMessage = document.querySelector("#error-message");
const resultCard = document.querySelector("#result-card");

const guaranteeHours = document.querySelector("#guarantee-hours");
const summaryHours = document.querySelector("#summary-hours");
const resultStart = document.querySelector("#result-start");
const resultPeriod = document.querySelector("#result-period");
const resultTotalHours = document.querySelector("#result-total-hours");

function formatHours(value) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  resultCard.hidden = true;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function populateCase(caseData) {
  startDateInput.value = caseData.jobStart;
  endDateInput.value = caseData.jobEnd;
  weeklyHoursInput.value = caseData.weeklyHours;

  caseSearchInput.value = `${caseData.caseNum} — ${caseData.employerName}`;
  searchResults.hidden = true;

  updateCalculator();
}

function renderSearchResults(results) {
  searchResults.innerHTML = "";

  if (!results.length) {
    searchResults.innerHTML = `<div class="no-results">No matching job orders found.</div>`;
    searchResults.hidden = false;
    return;
  }

  results.forEach((item) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "search-result";

    button.innerHTML = `
      <strong>${item.employerName}</strong>
      <span>${item.caseNum}</span>
      <small>${formatDate(item.jobStart)} – ${formatDate(item.jobEnd)} · ${formatHours(item.weeklyHours)} hrs/week</small>
    `;

    button.addEventListener("click", () => {
      populateCase(item);
    });

    searchResults.appendChild(button);
  });

  searchResults.hidden = false;
}

async function performSearch() {
  const query = caseSearchInput.value.trim();

  if (!query) {
    searchResults.hidden = true;
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Searching...";

  try {
    const results = await searchCases(query);
    renderSearchResults(results);
  } catch (error) {
    showError("Unable to search job orders.");
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
}

function updateCalculator() {
  clearError();

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  const weeklyHours = Number(weeklyHoursInput.value);

  if (!startDate || !endDate || !weeklyHours) {
    resultCard.hidden = true;
    return;
  }

  try {
    const result = calculateThreeFourthGuarantee({
      startDate,
      endDate,
      weeklyHours
    });

    guaranteeHours.textContent = formatHours(result.guaranteeHours);
    summaryHours.textContent = `${formatHours(result.guaranteeHours)} hours`;
    resultStart.textContent = formatDate(result.startDate);
    resultPeriod.textContent =
      `${result.totalDays} days (${formatHours(result.totalWeeks)} weeks)`;
    resultTotalHours.textContent =
      `${formatHours(result.totalHours)} hours`;

    resultCard.hidden = false;
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Unable to calculate the guarantee."
    );
  }
}

// Live calculation
startDateInput.addEventListener("input", updateCalculator);
endDateInput.addEventListener("input", updateCalculator);
weeklyHoursInput.addEventListener("input", updateCalculator);

lookupToggle.addEventListener("click", () => {
  lookupSection.hidden = !lookupSection.hidden;

  if (!lookupSection.hidden) {
    caseSearchInput.focus();
  }
});

searchButton.addEventListener("click", performSearch);

caseSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    performSearch();
  }
});

/*
  Future PWA integration.

  Parent page can send:

  iframe.contentWindow.postMessage({
    type: "API_H2A_CASE",
    caseNum: "H-300-27123-012345"
  }, "https://your-github-pages-domain");
*/

window.addEventListener("message", async (event) => {
  const data = event.data;

  if (
    !data ||
    data.type !== "API_H2A_CASE" ||
    typeof data.caseNum !== "string"
  ) {
    return;
  }

  const caseData = await getCaseByNumber(data.caseNum);

  if (caseData) {
    populateCase(caseData);
  }
});

/*
  Direct URL prefill:

  ?case=H-300-27123-012345
*/

const caseFromUrl =
  new URLSearchParams(window.location.search).get("case");

if (caseFromUrl) {
  getCaseByNumber(caseFromUrl).then((caseData) => {
    if (caseData) {
      populateCase(caseData);
    }
  });
}
