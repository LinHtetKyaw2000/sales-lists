const SALES_KEY = "sales-tracker-records";
const THEME_KEY = "sales-tracker-theme";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const salesForm = document.getElementById("sales-form");
const saleIdInput = document.getElementById("saleId");
const customerNameInput = document.getElementById("customerName");
const productTypeInput = document.getElementById("productType");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const saleDateInput = document.getElementById("saleDate");
const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const dayFilterInput = document.getElementById("dayFilter");
const monthFilterInput = document.getElementById("monthFilter");
const yearFilterInput = document.getElementById("yearFilter");

const salesTableBody = document.getElementById("salesTableBody");
const emptyState = document.getElementById("emptyState");
const monthlyTotalElement = document.getElementById("monthlyTotal");
const yearlyTotalElement = document.getElementById("yearlyTotal");

const backgroundColorInput = document.getElementById("backgroundColor");
const headlineColorInput = document.getElementById("headlineColor");
const fontColorInput = document.getElementById("fontColor");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function readSales() {
  const raw = localStorage.getItem(SALES_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

function saveSales(sales) {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

function readTheme() {
  const raw = localStorage.getItem(THEME_KEY);
  if (!raw) {
    return {
      background: "#f1f5f9",
      headline: "#0f172a",
      font: "#1e293b",
    };
  }
  return JSON.parse(raw);
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}

function setDefaultDate() {
  saleDateInput.value = new Date().toISOString().split("T")[0];
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--bg-color", theme.background);
  root.style.setProperty("--headline-color", theme.headline);
  root.style.setProperty("--font-color", theme.font);

  backgroundColorInput.value = theme.background;
  headlineColorInput.value = theme.headline;
  fontColorInput.value = theme.font;
}

function populateFilters(sales) {
  const selectedMonth = monthFilterInput.value;
  const selectedYear = yearFilterInput.value;

  monthFilterInput.innerHTML = '<option value="">All Months</option>';
  monthNames.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1);
    option.textContent = month;
    monthFilterInput.appendChild(option);
  });

  const years = [...new Set(sales.map((sale) => new Date(sale.date).getFullYear()))].sort((a, b) => a - b);
  yearFilterInput.innerHTML = '<option value="">All Years</option>';
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearFilterInput.appendChild(option);
  });

  if (selectedMonth) {
    monthFilterInput.value = selectedMonth;
  }
  if (selectedYear) {
    yearFilterInput.value = selectedYear;
  }
}

function getFilteredSales() {
  const selectedDay = dayFilterInput.value;
  const selectedMonth = monthFilterInput.value;
  const selectedYear = yearFilterInput.value;

  return readSales().filter((sale) => {
    const date = new Date(sale.date);
    const dayMatch = selectedDay ? sale.date === selectedDay : true;
    const monthMatch = selectedMonth ? date.getMonth() + 1 === Number(selectedMonth) : true;
    const yearMatch = selectedYear ? date.getFullYear() === Number(selectedYear) : true;
    return dayMatch && monthMatch && yearMatch;
  });
}

function calculateTotals() {
  const sales = readSales();
  const today = new Date();
  const activeYear = yearFilterInput.value ? Number(yearFilterInput.value) : today.getFullYear();
  const activeMonth = monthFilterInput.value ? Number(monthFilterInput.value) : today.getMonth() + 1;

  const monthlyTotal = sales
    .filter((sale) => {
      const date = new Date(sale.date);
      return date.getFullYear() === activeYear && date.getMonth() + 1 === activeMonth;
    })
    .reduce((sum, sale) => sum + sale.price, 0);

  const yearlyTotal = sales
    .filter((sale) => new Date(sale.date).getFullYear() === activeYear)
    .reduce((sum, sale) => sum + sale.price, 0);

  monthlyTotalElement.textContent = formatCurrency(monthlyTotal);
  yearlyTotalElement.textContent = formatCurrency(yearlyTotal);
}

function resetFormMode() {
  saleIdInput.value = "";
  salesForm.reset();
  setDefaultDate();
  saveButton.textContent = "Save Sale";
  cancelEditButton.classList.add("hidden");
}

function startEditSale(id) {
  const sale = readSales().find((item) => item.id === id);
  if (!sale) {
    return;
  }

  saleIdInput.value = sale.id;
  customerNameInput.value = sale.customerName;
  productTypeInput.value = sale.productType;
  quantityInput.value = String(sale.quantity);
  priceInput.value = String(sale.price);
  saleDateInput.value = sale.date;

  saveButton.textContent = "Update Sale";
  cancelEditButton.classList.remove("hidden");
}

function deleteSale(id) {
  const sales = readSales().filter((sale) => sale.id !== id);
  saveSales(sales);
  populateFilters(sales);
  renderSales();
}

function renderSales() {
  const filteredSales = getFilteredSales().sort((a, b) => new Date(b.date) - new Date(a.date));
  salesTableBody.innerHTML = "";

  if (filteredSales.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredSales.forEach((sale) => {
    const row = document.createElement("tr");
    row.className = "odd:bg-white even:bg-slate-50";

    row.innerHTML = `
      <td class="border border-slate-200 px-3 py-2">${sale.date}</td>
      <td class="border border-slate-200 px-3 py-2">${sale.customerName}</td>
      <td class="border border-slate-200 px-3 py-2">${sale.productType}</td>
      <td class="border border-slate-200 px-3 py-2 text-right">${sale.quantity}</td>
      <td class="border border-slate-200 px-3 py-2 text-right">${formatCurrency(sale.price)}</td>
      <td class="border border-slate-200 px-3 py-2">
        <div class="flex justify-center gap-2">
          <button type="button" class="edit-btn rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600" data-id="${sale.id}">Edit</button>
          <button type="button" class="delete-btn rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700" data-id="${sale.id}">Delete</button>
        </div>
      </td>
    `;

    salesTableBody.appendChild(row);
  });

  calculateTotals();
}

salesForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const customerName = customerNameInput.value.trim();
  const productType = productTypeInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);
  const date = saleDateInput.value;

  if (!customerName || !productType || !date || quantity <= 0 || price <= 0) {
    return;
  }

  const sales = readSales();
  const saleId = saleIdInput.value;

  if (saleId) {
    const index = sales.findIndex((sale) => sale.id === saleId);
    if (index !== -1) {
      sales[index] = { id: saleId, customerName, productType, quantity, price, date };
    }
  } else {
    sales.push({
      id: crypto.randomUUID(),
      customerName,
      productType,
      quantity,
      price,
      date,
    });
  }

  saveSales(sales);
  populateFilters(sales);
  renderSales();
  resetFormMode();
});

cancelEditButton.addEventListener("click", resetFormMode);

salesTableBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const saleId = target.dataset.id;
  if (!saleId) {
    return;
  }

  if (target.classList.contains("edit-btn")) {
    startEditSale(saleId);
  } else if (target.classList.contains("delete-btn")) {
    deleteSale(saleId);
  }
});

[dayFilterInput, monthFilterInput, yearFilterInput].forEach((filter) => {
  filter.addEventListener("change", renderSales);
});

[backgroundColorInput, headlineColorInput, fontColorInput].forEach((input) => {
  input.addEventListener("input", () => {
    const nextTheme = {
      background: backgroundColorInput.value,
      headline: headlineColorInput.value,
      font: fontColorInput.value,
    };
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
});

const sales = readSales();
setDefaultDate();
populateFilters(sales);
applyTheme(readTheme());
renderSales();
