const destinations = {
  highest: {
    name: "Highest APY Strategy",
    label: "Managed by Helio",
    apy: 0.1327,
    copy: "Highest APY Strategy",
  },
  kamino: {
    name: "Kamino Finance",
    label: "SOL lending route",
    apy: 0.1234,
    copy: "Kamino Finance",
  },
  jito: {
    name: "Jito Restaking",
    label: "Liquid staking allocation",
    apy: 0.088,
    copy: "Jito Restaking",
  },
};

const state = {
  amount: 100,
  addOn: 0.025,
  destination: "highest",
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
  Number(amountInput?.max || 5000),
  Number(amountRange?.max || 5000),
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

function formatPercent(value) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: value < 0.01 ? 1 : 0,
    maximumFractionDigits: 1,
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

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function renderSimulator() {
  const destination = destinations[state.destination];
  const rate = state.addOn;
  const autoInvestAmount = state.amount * rate;
  const transactionTotal = state.amount + autoInvestAmount;
  const dailyContribution = autoInvestAmount * state.transactionsPerDay;
  const monthlyContribution = dailyContribution * 30;
  const annualContribution = dailyContribution * 365;
  const projectedValue = futureValueWithDailyContributions(dailyContribution, destination.apy);
  const annualRewards = projectedValue - annualContribution;

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

  setText(addonOutput, `${formatCurrency(autoInvestAmount)} invested`);
  setText(
    addonNote,
    `Helio sets aside ${formatPercent(rate)} of a ${formatCurrency(state.amount)} transaction and routes it to ${destination.copy}.`,
  );
  setText(totalOutput, formatCurrency(transactionTotal));
  setText(monthlyOutput, formatCurrency(monthlyContribution));
  setText(annualOutput, formatCurrency(annualRewards));
  setText(
    annualNote,
    `Mock projection based on ${(destination.apy * 100).toFixed(1)}% APY and ${state.transactionsPerDay} daily auto-investments.`,
  );

  setText(routeBadge, destination.name);
  setText(flowSpend, formatCurrency(state.amount));
  setText(flowAddon, formatCurrency(autoInvestAmount));
  setText(flowTotal, formatCurrency(transactionTotal));
  setText(flowApy, `${(destination.apy * 100).toFixed(1)}% APY`);
  setText(principalOutput, formatCurrency(annualContribution));
  setText(portfolioOutput, formatCurrency(projectedValue));
  setText(destinationCopy, destination.label);

  setText(mockupSpend, formatCurrency(state.amount));
  setText(mockupAddon, `+${formatCurrency(autoInvestAmount)}`);
  setText(mockupTotal, formatCurrency(transactionTotal));
  setText(mockupRoute, destination.name);
  setText(mockupMonthly, formatCurrency(monthlyContribution));

  updateActiveState(addOnButtons, String(rate), "addon");
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
    setText(feedback, "Enter an email address to join the Helio beta.");
    return;
  }

  setText(feedback, `You're on the list, ${email}. We'll send Helio beta access soon.`);
  waitlistForm.reset();
});

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
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
    )
  : null;

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 35, 180)}ms`;

  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    element.classList.add("is-visible");
  }
});

renderSimulator();
