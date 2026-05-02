const destinations = {
  staking: {
    name: "SOL Staking",
    label: "Stake with validators",
    apy: 0.072,
    copy: "SOL staking",
  },
  gold: {
    name: "Tokenized Gold",
    label: "Inflation-aware on-chain hedge",
    apy: 0.046,
    copy: "tokenized gold",
  },
  index: {
    name: "Index Token",
    label: "Diversified crypto basket",
    apy: 0.114,
    copy: "index token",
  },
};

const state = {
  amount: 4.6,
  threshold: 0.5,
  destination: "staking",
  transactionsPerDay: 20,
};

const amountInput = document.querySelector("#transaction-amount");
const rangeInput = document.querySelector("#transaction-range");
const thresholdButtons = document.querySelectorAll("[data-threshold]");
const destinationButtons = document.querySelectorAll("[data-destination]");
const destinationCards = document.querySelectorAll("[data-destination-card]");
const waitlistForm = document.querySelector("#waitlist-form");
const feedback = document.querySelector("#form-feedback");

const deltaOutput = document.querySelector("#delta-output");
const deltaNote = document.querySelector("#delta-note");
const monthlyOutput = document.querySelector("#monthly-output");
const annualOutput = document.querySelector("#annual-output");
const annualNote = document.querySelector("#annual-note");
const routeBadge = document.querySelector("#route-badge");
const flowSpend = document.querySelector("#flow-spend");
const flowRound = document.querySelector("#flow-round");
const flowApy = document.querySelector("#flow-apy");
const principalOutput = document.querySelector("#principal-output");
const portfolioOutput = document.querySelector("#portfolio-output");
const destinationCopy = document.querySelector("#destination-copy");

function clampAmount(value) {
  if (!Number.isFinite(value)) {
    return state.amount;
  }

  return Math.min(Math.max(value, 0.01), 500);
}

function setSliderProgress() {
  const min = Number(rangeInput.min);
  const max = Number(rangeInput.max);
  const progress = ((state.amount - min) / (max - min)) * 100;
  rangeInput.style.setProperty("--slider-progress", `${progress}%`);
}

function nextThreshold(amount, threshold) {
  const multiple = Math.ceil(amount / threshold);
  const rounded = multiple * threshold;
  return Number((rounded - amount).toFixed(2));
}

function futureValueWithDailyContributions(dailyContribution, apy) {
  const periods = 365;
  if (apy === 0) {
    return dailyContribution * periods;
  }

  const ratePerPeriod = apy / periods;
  const futureValue =
    dailyContribution * (((1 + ratePerPeriod) ** periods - 1) / ratePerPeriod);

  return futureValue;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCounter(value, format) {
  if (format === "currency-short") {
    const short = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: value >= 1000000 ? 1 : 0,
    }).format(value);

    return `$${short}+`;
  }

  if (format === "number-short") {
    const formatted = value >= 100000
      ? new Intl.NumberFormat("en-US", {
          notation: "compact",
          compactDisplay: "short",
          maximumFractionDigits: 1,
        }).format(value)
      : new Intl.NumberFormat("en-US").format(Math.round(value));

    return `${formatted}+`;
  }

  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }

  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function updateActiveState(collection, value, attribute) {
  collection.forEach((item) => {
    item.classList.toggle("active", item.dataset[attribute] === value);
  });
}

function renderSimulator() {
  const amount = state.amount;
  const threshold = state.threshold;
  const destination = destinations[state.destination];

  const delta = nextThreshold(amount, threshold);
  const dailyContribution = delta * state.transactionsPerDay;
  const monthlyContribution = dailyContribution * 30;
  const annualContribution = dailyContribution * 365;
  const portfolioValue = futureValueWithDailyContributions(
    dailyContribution,
    destination.apy,
  );
  const annualYield = portfolioValue - annualContribution;
  const roundedTarget = amount + delta;

  amountInput.value = amount.toFixed(2);
  rangeInput.value = amount.toFixed(2);
  setSliderProgress();

  deltaOutput.textContent = `${formatCurrency(delta)} invested`;
  deltaNote.textContent = `Rounded from ${formatCurrency(amount)} to ${formatCurrency(
    roundedTarget,
  )} and routed to ${destination.copy}.`;

  monthlyOutput.textContent = `${formatCurrency(monthlyContribution)} / month`;
  annualOutput.textContent = `${formatCurrency(annualYield)} / year`;
  annualNote.textContent = `Based on a ${(destination.apy * 100).toFixed(
    1,
  )}% APY with daily round-ups.`;

  routeBadge.textContent = destination.name;
  flowSpend.textContent = formatCurrency(amount);
  flowRound.textContent = formatCurrency(delta);
  flowApy.textContent = `${(destination.apy * 100).toFixed(1)}% APY`;
  principalOutput.textContent = formatCurrency(annualContribution);
  portfolioOutput.textContent = formatCurrency(portfolioValue);
  destinationCopy.textContent = destination.label;

  updateActiveState(thresholdButtons, String(threshold), "threshold");
  updateActiveState(destinationButtons, state.destination, "destination");
  updateActiveState(destinationCards, state.destination, "destinationCard");
}

function handleAmountInput(value) {
  state.amount = clampAmount(Number(value));
  renderSimulator();
}

amountInput?.addEventListener("input", (event) => {
  handleAmountInput(event.target.value);
});

rangeInput?.addEventListener("input", (event) => {
  handleAmountInput(event.target.value);
});

thresholdButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.threshold = Number(button.dataset.threshold);
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
    feedback.textContent = "Enter an email address to join the Helio waitlist.";
    return;
  }

  feedback.textContent = `You're on the list, ${email}. We'll send Helio launch access soon.`;
  waitlistForm.reset();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
  },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 40, 220)}ms`;
  revealObserver.observe(element);
});

const counters = document.querySelectorAll("[data-counter]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.4,
  },
);

counters.forEach((counter) => counterObserver.observe(counter));

function animateCounter(counter) {
  const target = Number(counter.dataset.value);
  const format = counter.dataset.format;
  const duration = 1600;
  const start = performance.now();

  function tick(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const current = target * eased;

    counter.textContent = formatCounter(current, format);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = formatCounter(target, format);
    }
  }

  requestAnimationFrame(tick);
}

function createHeroParticles() {
  const canvas = document.querySelector("#hero-particles");
  const hero = document.querySelector(".hero");

  if (!canvas || !hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const context = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * devicePixelRatio);
    canvas.height = Math.floor(height * devicePixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    particles.length = 0;
    const count = Math.min(46, Math.max(26, Math.floor(width / 28)));

    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.28 + 0.08,
        speedX: (Math.random() - 0.5) * 0.16,
        alpha: Math.random() * 0.45 + 0.18,
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, particleIndex) => {
      particle.y -= particle.speedY;
      particle.x += particle.speedX;

      if (particle.y < -12) {
        particle.y = height + 12;
      }

      if (particle.x < -12) {
        particle.x = width + 12;
      }

      if (particle.x > width + 12) {
        particle.x = -12;
      }

      context.beginPath();
      context.fillStyle = `rgba(245, 176, 0, ${particle.alpha})`;
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let innerIndex = particleIndex + 1; innerIndex < particles.length; innerIndex += 1) {
        const other = particles[innerIndex];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 110) {
          context.beginPath();
          context.strokeStyle = `rgba(6, 182, 212, ${0.11 - distance / 1200})`;
          context.lineWidth = 1;
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });

    animationFrame = requestAnimationFrame(draw);
  }

  resizeCanvas();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    draw();
  });
}

renderSimulator();
createHeroParticles();
