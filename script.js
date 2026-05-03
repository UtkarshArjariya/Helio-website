const destinations = {
  staking: {
    name: "SOL Staking",
    label: "Stake with validators",
    apy: 0.072,
    copy: "SOL staking",
  },
  vault: {
    name: "USDC Vault",
    label: "Build a lower-volatility reserve",
    apy: 0.048,
    copy: "a USDC vault",
  },
  index: {
    name: "Crypto Index",
    label: "Diversified crypto basket",
    apy: 0.114,
    copy: "a crypto index",
  },
};

const state = {
  amount: 42.8,
  addOn: 1,
  destination: "staking",
  transactionsPerDay: 12,
};

const amountInput = document.querySelector("#transaction-amount");
const amountRange = document.querySelector("#transaction-range");
const countInput = document.querySelector("#transaction-count");
const countRange = document.querySelector("#transaction-count-range");
const addOnButtons = document.querySelectorAll("[data-addon]");
const destinationButtons = document.querySelectorAll("[data-destination]");
const destinationCards = document.querySelectorAll("[data-destination-card]");
const waitlistForm = document.querySelector("#waitlist-form");
const feedback = document.querySelector("#form-feedback");

const addonOutput = document.querySelector("#addon-output");
const addonNote = document.querySelector("#addon-note");
const totalOutput = document.querySelector("#total-output");
const monthlyOutput = document.querySelector("#monthly-output");
const annualOutput = document.querySelector("#annual-output");
const annualNote = document.querySelector("#annual-note");
const routeBadge = document.querySelector("#route-badge");
const flowSpend = document.querySelector("#flow-spend");
const flowAddon = document.querySelector("#flow-addon");
const flowTotal = document.querySelector("#flow-total");
const flowApy = document.querySelector("#flow-apy");
const principalOutput = document.querySelector("#principal-output");
const portfolioOutput = document.querySelector("#portfolio-output");
const destinationCopy = document.querySelector("#destination-copy");
const mockupSpend = document.querySelector("#mockup-spend");
const mockupAddon = document.querySelector("#mockup-addon");
const mockupTotal = document.querySelector("#mockup-total");
const mockupRoute = document.querySelector("#mockup-route");
const mockupMonthly = document.querySelector("#mockup-monthly");

const amountMin = Math.max(
  Number(amountInput?.min || 0.01),
  Number(amountRange?.min || 0.01),
);
const amountMax = Math.max(
  Number(amountInput?.max || 1000),
  Number(amountRange?.max || 1000),
);

const countMin = Math.max(
  Number(countInput?.min || 1),
  Number(countRange?.min || 1),
);
const countMax = Math.max(
  Number(countInput?.max || 80),
  Number(countRange?.max || 80),
);

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function futureValueWithDailyContributions(dailyContribution, apy) {
  const periods = 365;

  if (apy === 0) {
    return dailyContribution * periods;
  }

  const ratePerPeriod = apy / periods;

  return dailyContribution * (((1 + ratePerPeriod) ** periods - 1) / ratePerPeriod);
}

function setSliderProgress(input, value, min, max) {
  if (!input) {
    return;
  }

  const progress = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  input.style.setProperty("--slider-progress", `${progress}%`);
}

function updateActiveState(collection, value, attribute) {
  collection.forEach((item) => {
    item.classList.toggle("active", item.dataset[attribute] === value);
  });
}

function renderSimulator() {
  const destination = destinations[state.destination];
  const addOn = state.addOn;
  const transactionTotal = state.amount + addOn;
  const dailyContribution = addOn * state.transactionsPerDay;
  const monthlyContribution = dailyContribution * 30;
  const annualContribution = dailyContribution * 365;
  const projectedValue = futureValueWithDailyContributions(dailyContribution, destination.apy);
  const annualYield = projectedValue - annualContribution;

  if (amountInput) {
    amountInput.value = state.amount.toFixed(2);
  }

  if (amountRange) {
    amountRange.value = state.amount.toFixed(2);
    setSliderProgress(amountRange, state.amount, amountMin, amountMax);
  }

  if (countInput) {
    countInput.value = String(state.transactionsPerDay);
  }

  if (countRange) {
    countRange.value = String(state.transactionsPerDay);
    setSliderProgress(countRange, state.transactionsPerDay, countMin, countMax);
  }

  addonOutput.textContent = `${formatCurrency(addOn)} added`;
  addonNote.textContent = `Helio adds ${formatCurrency(addOn)} to a ${formatCurrency(
    state.amount,
  )} transaction and routes it to ${destination.copy}.`;
  totalOutput.textContent = formatCurrency(transactionTotal);
  monthlyOutput.textContent = formatCurrency(monthlyContribution);
  annualOutput.textContent = formatCurrency(annualYield);
  annualNote.textContent = `Mock projection based on ${(destination.apy * 100).toFixed(
    1,
  )}% APY and ${state.transactionsPerDay} daily add-ons.`;

  routeBadge.textContent = destination.name;
  flowSpend.textContent = formatCurrency(state.amount);
  flowAddon.textContent = formatCurrency(addOn);
  flowTotal.textContent = formatCurrency(transactionTotal);
  flowApy.textContent = `${(destination.apy * 100).toFixed(1)}% APY`;
  principalOutput.textContent = formatCurrency(annualContribution);
  portfolioOutput.textContent = formatCurrency(projectedValue);
  destinationCopy.textContent = destination.label;

  mockupSpend.textContent = formatCurrency(state.amount);
  mockupAddon.textContent = formatCurrency(addOn);
  mockupTotal.textContent = formatCurrency(transactionTotal);
  mockupRoute.textContent = destination.name;
  mockupMonthly.textContent = formatCurrency(monthlyContribution);

  updateActiveState(addOnButtons, String(addOn), "addon");
  updateActiveState(destinationButtons, state.destination, "destination");
  updateActiveState(destinationCards, state.destination, "destinationCard");
}

function handleAmountInput(value) {
  state.amount = clamp(Number(value), amountMin, amountMax, state.amount);
  renderSimulator();
}

function handleCountInput(value) {
  state.transactionsPerDay = Math.round(
    clamp(Number(value), countMin, countMax, state.transactionsPerDay),
  );
  renderSimulator();
}

amountInput?.addEventListener("input", (event) => {
  handleAmountInput(event.target.value);
});

amountRange?.addEventListener("input", (event) => {
  handleAmountInput(event.target.value);
});

countInput?.addEventListener("input", (event) => {
  handleCountInput(event.target.value);
});

countRange?.addEventListener("input", (event) => {
  handleCountInput(event.target.value);
});

addOnButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.addOn = Number(button.dataset.addon);
    renderSimulator();
  });
});

destinationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.destination = button.dataset.destination;
    renderSimulator();
  });
});

destinationCards.forEach((card) => {
  card.addEventListener("click", () => {
    state.destination = card.dataset.destinationCard;
    renderSimulator();
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    state.destination = card.dataset.destinationCard;
    renderSimulator();
  });
});

waitlistForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(waitlistForm);
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    feedback.textContent = "Enter an email address to join the Helio beta.";
    return;
  }

  feedback.textContent = `You're on the list, ${email}. We'll send Helio beta access soon.`;
  waitlistForm.reset();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -36px 0px",
  },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 35, 180)}ms`;
  revealObserver.observe(element);
});

renderSimulator();
