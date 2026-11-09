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

// This is an example function. Replace it with your own logic.
function checkImports() {
  // TODO: implement your logic here
  console.log("Bootstrap and custom styles loaded.");
}
document.addEventListener("DOMContentLoaded", checkImports);


// Clickable month navigation

let currentDate = new Date();
currentDate.setDate(1);

function displayMonth() {
  
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
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
  });

  rightArrow.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayMonth();
  });
}
switchMonth();

// Returns an array of incomes or expenses dicts
function getData(type = "incomes") {
  return new Promise((resolve, reject) => {
    onAuthReady(async (user) => {
      if (!user) {
        console.error("No authenticated user found.");
        resolve([]);
        return;
      }

      try {
        const subcollectionRef = collection(db, "users", user.uid, type);
        const querySnapshot = await getDocs(subcollectionRef);
        let dataArray = [];

        querySnapshot.forEach((doc) => {
          dataArray.push(doc.data());
        });

        resolve(dataArray);
      } catch (error) {
        console.error("Error fetching data: ", error);
        reject(error);
      }
    });
  });
}

getData();

// Set initial data for donut chart, and add functionality to radio buttons
async function setDonutChart(type = "incomes") {
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
    if (!chartData || chartData.length === 0) return;

    let dataCategoryTotals = chartData.map((data) => data.amount);
    let dataCategories = chartData.map((data) => data.category);

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
setDonutChart("incomes");

// Set all inital values for accordion dropdown menu
async function setValues() {
  let incomeData = await getData("incomes");
  let expenseData = await getData("expenses");

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
  document.getElementById("net-worth").textContent = `$${netWorth.toFixed(2)}`;
  document.getElementById("accordion-incomes").textContent =
    `$${netIncome.toFixed(2)}`;
  document.getElementById("accordion-expenses").textContent =
    `$${netExpense.toFixed(2)}`;

  const totalIncomeByCategory = incomeData.reduce((accumulator, item) => {
    let { category, amount } = item;
    if (!accumulator[category]) {
      accumulator[category] = 0;
    }
    accumulator[category] += amount;
    return accumulator;
  }, {});

  for (const [key, value] of Object.entries(totalIncomeByCategory)) {
    document.getElementById("accordion-incomes-body").insertAdjacentHTML(
      "afterend",
      `
    <div class="d-flex justify-content-between px-4" style="font-size: 1.5em;">
      <p>${key}</p>
      <p>$${value.toFixed(2)}</p>
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
      "afterend",
      `
    <div class="d-flex justify-content-between px-4" style="font-size: 1.5em;">
      <p>${key}</p>
      <p>$${value.toFixed(2)}</p>
    </div>
  
    `,
    );
  }
}

setValues();
