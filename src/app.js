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

function setMonth(month_num = -1) {
  if (month_num === -1) {
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    document.getElementById("month").textContent = currentMonth;
  } else {
    document.getElementById("month").textContent = month_num;
  }
}
setMonth();

function switchMonth() {
  const leftArrow = document.getElementById("left-arrow");
  const rightArrow = document.getElementById("right-arrow");
  const month = document.getElementById("month");

  leftArrow.addEventListener("click", () => {
    setMonth(2);
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
      // existingChart.destroy();
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

    // Code to initialize your ChartJS instance goes here...
  } catch (error) {
    console.error("Failed to set donut chart:", error);
  }
}
setDonutChart("incomes");

// Radio button functionality for donut chart
document.getElementById("donut-type").addEventListener("change", (event) => {
  setDonutChart(event.target.value);
});

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
}

setValues();
