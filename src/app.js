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

// Returns an array of expense dicts
function getExpenses() {
  return new Promise((resolve, reject) => {
    onAuthReady(async (user) => {
      if (!user) {
        console.error("No authenticated user found.");
        resolve([]);
        return;
      }

      try {
        const subcollectionRef = collection(db, "users", user.uid, "expenses");
        const querySnapshot = await getDocs(subcollectionRef);
        let expensesArray = [];

        querySnapshot.forEach((doc) => {
          expensesArray.push(doc.data());
        });

        resolve(expensesArray);
      } catch (error) {
        console.error("Error fetching expenses: ", error);
        reject(error);
      }
    });
  });
}

getExpenses();

// Returns an array of income dicts
function getIncomes() {
  onAuthReady(async (user) => {
    try {
      // Get expenses subcollection
      const subcollectionRef = collection(db, "users", user.uid, "incomes");
      const querySnapshot = await getDocs(subcollectionRef);
      let incomesArray = [];

      querySnapshot.forEach((doc) => {
        incomesArray.push(doc.data());
      });
    } catch (error) {
      console.error("Error fetching incomes: ", error);
    }
  });
}

getIncomes();

async function setDonutChartIncome() {
  try {
    const expenses = await getExpenses();

    if (!expenses || !Array.isArray(expenses)) return;

    const expenseCategoryTotals = expenses.map((expense) => expense.amount);
    const expenseCategories = expenses.map((expense) => expense.category);

    let donutChart = new Chart("donut-chart", {
      type: "doughnut",
      data: {
        labels: expenseCategories,
        datasets: [
          {
            label: "",
            data: expenseCategoryTotals,
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
            text: "Expenses",
          },
        },
      },
    });

    // Code to initialize your ChartJS instance goes here...
  } catch (error) {
    console.error("Failed to set donut chart:", error);
  }
}
setDonutChartIncome();
