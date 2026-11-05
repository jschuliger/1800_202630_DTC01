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
      chartData = await getExpenses();
    }
    if (!chartData) return;

    const dataCategoryTotals = chartData.map((data) => data.amount);
    const dataCategories = chartData.map((data) => data.category);

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
setDonutChart();
