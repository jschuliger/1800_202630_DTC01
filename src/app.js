import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { onAuthReady } from "/src/authentication.js";
import { db } from "./firebaseConfig.js";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

//--------------------------------------------------------------
// If you have custom global styles, import them as well:
//--------------------------------------------------------------
import "/src/styles/style.css";

//--------------------------------------------------------------
// Custom global JS code (shared with all pages)can go here.
//--------------------------------------------------------------

let currentUser = null;
onAuthReady(function (user) {
  if (!user) {
    const page = window.location.pathname.split("/").pop();

    if (page !== "login.html" && page !== "index.html") {
      location.href = "index.html";
    }
    
  } else {
    currentUser = user;
    setDonutChart("incomes");
    setValues();
  }
});

// Format money to display with cents
const formatMoney = (amount) => `$${(amount / 100).toFixed(2)}`;

// Clickable month navigation
let currentDate = new Date();
currentDate.setDate(1);

function displayMonth() {
  const currentMonth = currentDate.toLocaleString("default", {
    month: "long", 
    year: "numeric",
  });
  document.getElementById("month").textContent = currentMonth;
}
displayMonth();

function switchMonth() {
  const leftArrow = document.getElementById("left-arrow");
  const rightArrow = document.getElementById("right-arrow");

  leftArrow.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayMonth();
    setValues();
    const selectedType = document.querySelector(
      "#donut-type input:checked",
    ).value;
    setDonutChart(selectedType);
  });

  rightArrow.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayMonth();
    setValues();
    const selectedType = document.querySelector(
      "#donut-type input:checked",
    ).value;
    setDonutChart(selectedType);
  });
}
switchMonth();

// Checks the month
function isInSelectedMonth(item) {
  if (!item.date) return false;
  const [year, month] = item.date.split("-").map(Number);
  return (
    year === currentDate.getFullYear() && month === currentDate.getMonth() + 1
  );
}
// Hamburger icon effect
function mobileMenu() {
  const hamburger = document.getElementById("hamburger-menu");
  const sideNavbar = document.getElementById("side-navbar");

  if (!hamburger || !sideNavbar) return;

  hamburger.addEventListener("click", () => {
    sideNavbar.classList.toggle("d-none");
  });
}
mobileMenu();

// Returns an array of incomes or expenses dicts
async function getData(type = "incomes") {
  if (!currentUser) return [];
  try {
    const subcollectionRef = collection(db, "users", currentUser.uid, type);
    const querySnapshot = await getDocs(subcollectionRef);
    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Combine amounts for the same category for the donut chart
function groupByCategory(items) {
  return items.reduce((acc, { category, amount }) => {
    const name = category || "Uncategorized";
    acc[name] = (acc[name] || 0) + amount;
    return acc;
  }, {});
}

// Set initial data for donut chart, and add functionality to radio buttons
async function setDonutChart(type = "incomes") {
  if (!document.getElementById("donut-chart")) return;
  try {
    let chartData = [];
    if (type === "incomes" || type === "expenses") {
      chartData = await getData(type);
    } else {
      const [incomes, expenses] = await Promise.all([
        getData("incomes"),
        getData("expenses"),
      ]);
      chartData = [...incomes, ...expenses];
    }

    chartData = chartData.filter(isInSelectedMonth);

    const groupedData = groupByCategory(chartData);
    const dataCategories = Object.keys(groupedData);
    const dataCategoryTotals = Object.values(groupedData);

    const existingChart = Chart.getChart("donut-chart");
    if (existingChart) {
      existingChart.data.labels = dataCategories;
      existingChart.data.datasets[0].data = dataCategoryTotals;
      existingChart.update();
      return;
    }

    let donutChart = new Chart("donut-chart", {
      type: "doughnut",
      data: {
        labels: dataCategories,
        datasets: [
          {
            label: "",
            data: dataCategoryTotals,
            backgroundColor: [
              "rgb(255, 99, 132)", // Pink
              "rgb(54, 162, 235)", // Blue
              "rgb(255, 205, 86)", // Yellow
              "rgb(75, 192, 192)", // Teal
            ],
            // borderColor: "#000",
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#000000",
            // borderWidth: 1,
            padding: 12,
            cornerRadius: 20,
            displayColors: false,
            callbacks: {
              label(context) {
                const dollars = (context.parsed / 100).toLocaleString("en-CA", {
                  style: "currency",
                  currency: "CAD",
                });
                return `${dollars}`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to set donut chart:", error);
  }

  // Radio button functionality for donut chart
  document.getElementById("donut-type").addEventListener("change", (event) => {
    setDonutChart(event.target.value);
  });
}

// Set all inital values for accordion dropdown menu
async function setValues() {
  if (!document.getElementById("net-worth")) return;
  let incomeData = await getData("incomes");
  let expenseData = await getData("expenses");

  incomeData = incomeData.filter(isInSelectedMonth);
  expenseData = expenseData.filter(isInSelectedMonth);

  let netIncome = 0;
  incomeData.forEach((income) => {
    netIncome += income.amount;
  });

  let netExpense = 0;
  expenseData.forEach((expense) => {
    netExpense += expense.amount;
  });
  let netWorth = netIncome - netExpense;
  // Set net worth amount

  document.getElementById("net-worth").textContent =
    `$${(netWorth / 100).toFixed(2)}`;

  if (!document.getElementById("accordion-incomes")) return;
  document.getElementById("accordion-incomes").textContent =
    `$${(netIncome / 100).toFixed(2)}`;
  document.getElementById("accordion-expenses").textContent =
    `$${(netExpense / 100).toFixed(2)}`;

  const totalIncomeByCategory = incomeData.reduce((accumulator, item) => {
    let { category, amount } = item;
    if (!accumulator[category]) {
      accumulator[category] = 0;
    }
    accumulator[category] += amount;
    return accumulator;
  }, {});
  const incomesBody = document.getElementById("accordion-incomes-body");
  const expensesBody = document.getElementById("accordion-expenses-body");
  incomesBody.innerHTML = "";
  expensesBody.innerHTML = "";
  for (const [key, value] of Object.entries(totalIncomeByCategory)) {
    document.getElementById("accordion-incomes-body").insertAdjacentHTML(
      "beforeend",
      `
    <div class="d-flex justify-content-between px-4" style="font-size: 1.5em;">
      <p>${key}</p>
      <p>$${(value / 100).toFixed(2)}</p>
    </div>
  
    `,
    );
  }
  const totalExpenseByCategory = expenseData.reduce((accumulator, item) => {
    let { category, amount } = item;
    if (!accumulator[category]) {
      accumulator[category] = 0;
    }
    accumulator[category] += amount;
    return accumulator;
  }, {});

  for (const [key, value] of Object.entries(totalExpenseByCategory)) {
    document.getElementById("accordion-expenses-body").insertAdjacentHTML(
      "beforeend",
      `
    <div class="d-flex justify-content-between px-4" style="font-size: 1.5em;">
      <p>${key}</p>
      <p>$${(value / 100).toFixed(2)}</p>
    </div>
  
    `,
    );
  }
}
