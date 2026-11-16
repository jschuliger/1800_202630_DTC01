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

// Display transacions in Previous Transactions window
async function displayTransactions() {
  onAuthReady(async (user) => {
    const container = document.getElementById("transactions-list");
    // Temp text while getting data
    container.innerHTML = "<p>Loading...</p>";

    try {
      const expenseData = collection(db, "users", user.uid, "expenses");
      const incomeData = collection(db, "users", user.uid, "incomes");

      const [expenseSnap, incomeSnap] = await Promise.all([
        getDocs(expenseData),
        getDocs(incomeData),
      ]);

      // Convert to array
      // Keep id and type of entry for when they are combined
      const expenses = expenseSnap.docs.map((doc) => ({
        id: doc.id,
        type: "expense",
        ...doc.data(),
      }));

      const incomes = incomeSnap.docs.map((doc) => ({
        id: doc.id,
        type: "income",
        ...doc.data(),
      }));

      // Combine incomes and expenses arrays and sort by time
      const allTransactions = [...expenses, ...incomes].sort(
        (entry1, entry2) => {
          const dateEntry1 = normalizeDate(entry1.date);
          const dateEntry2 = normalizeDate(entry2.date);

          // if YYYY-MM-DD dates are different, compare and sort entry1 and entry2
          if (dateEntry2 !== dateEntry1) {
            return dateEntry2.localeCompare(dateEntry1);
          }
          // if same date, sort by timestamp time
          const timeEntry1 = entry1.last_updated?.toMillis?.() || 0;
          const timeEntry2 = entry2.last_updated?.toMillis?.() || 0;
          return timeEntry2 - timeEntry1;
        },
      );

      // Add to the div
      container.innerHTML = allTransactions
        .map((item) => {
          const isExpense = item.type === "expense";
          const sign = isExpense ? "-" : "+";
          const color = isExpense ? "red" : "green";
          const bgColor = isExpense ? "bg-danger-subtle" : "bg-success-subtle";
          const displayDate = normalizeDate(item.date) || "No date";

          return `
                <div class="transaction-item ${bgColor} d-flex justify-content-between" style="border-bottom: 1px solid #ccc; padding: 8px 20px; margin: 0px;">
                    <div>
                        <div class="d-flex">
                            <p style="margin: 0 8px 0 0; font-size: 1.3rem; font-weight: bold;">${item.description || "Untitled"}</p>
                            <p style="margin: 0px; font-size: 1.3rem;">(${item.category || "Uncategorized"})</p>
                        </div>
                        <p style="margin: 0px">${displayDate}</p>
                    </div>
                    <div class="align-items-center d-flex flex-nowrap" style="float: right; color: ${color}; font-weight: medium; font-size: 1.5rem;">
                        ${sign}$${item.amount ?? 0}
                    </div>
                </div>
            `;
        })
        .join("");
    } catch (error) {
      console.error("Error fetching transactions:", error);
      container.innerHTML = "<p>Failed to load transactions.</p>";
    }
  });
}

// Convert timestamp or date string to "YYYY-MM-DD" format
function normalizeDate(date) {
  if (!date) return "";
  if (typeof date === "string") return date; // if "YYYY-MM-DD"
  if (typeof date.toDate === "function") {
    // else convert timestamp to "YYYY-MM-DD"
    return date.toDate().toISOString().split("T")[0];
  }
  return String(date);
}

displayTransactions();
