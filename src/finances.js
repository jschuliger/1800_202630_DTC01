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

let currentUser = null;
onAuthReady(function (user) {
  if (!user) {
    location.href = "index.html";
  } else {
    currentUser = user;
    displayTransactions(currentUser.uid);
  }
});

let currentDate = new Date();
currentDate.setDate(1);

// Checks the month
function isInSelectedMonth(item) {
  if (!item.date) return false;
  const [year, month] = item.date.split("-").map(Number);
  return (
    year === currentDate.getFullYear() && month === currentDate.getMonth() + 1
  );
}

document.getElementById("left-arrow")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  if (currentUser) displayTransactions(currentUser.uid);
});

document.getElementById("right-arrow")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  if (currentUser) displayTransactions(currentUser.uid);
});

// Get data from Firestore, with type of transaction
async function fetchTransactions(uid, subcollection, type) {
  const snapshot = await getDocs(collection(db, "users", uid, subcollection));
  return snapshot.docs.map((doc) => ({ id: doc.id, type, ...doc.data() }));
}

// Display transacions in Previous Transactions window
async function displayTransactions(uid) {
  const container = document.getElementById("transactions-list");
  // Temp text while getting data
  container.innerHTML = "<p>Loading...</p>";

  try {
    const [expenses, incomes] = await Promise.all([
      fetchTransactions(uid, "expenses", "expense"),
      fetchTransactions(uid, "incomes", "income"),
    ]);

    // Combine incomes and expenses arrays and sort by time, filter by month
    const filteredTransactions = [...expenses, ...incomes]
      .filter(isInSelectedMonth)
      .sort((entry1, entry2) => {
        const dateEntry1 = entry1.date || "";
        const dateEntry2 = entry2.date || "";

        // if YYYY-MM-DD dates are different, compare and sort entry1 and entry2
        if (dateEntry2 !== dateEntry1) {
          return dateEntry2.localeCompare(dateEntry1);
        }
        // if same date, sort by timestamp time
        const timeEntry1 = entry1.last_updated?.toMillis?.() || 0;
        const timeEntry2 = entry2.last_updated?.toMillis?.() || 0;
        return timeEntry2 - timeEntry1;
      });

    if (filteredTransactions.length === 0) {
      container.innerHTML = `<p class="text-muted text-center my-4">No transactions for this month.</p>`;
      return;
    }

    // Add to the div
    container.innerHTML = filteredTransactions
      .map((item) => {
        const isExpense = item.type === "expense";
        const sign = isExpense ? "-" : "+";
        const color = isExpense ? "red" : "green";
        const bgColor = isExpense ? "bg-danger-subtle" : "bg-success-subtle";
        const displayDate = item.date || "No date";

        return `
              <div class="transaction-item ${bgColor} d-flex justify-content-between" data-id="${item.id}" data-type="${item.type}" style="border-bottom: 1px solid #ccc; padding: 8px 20px; margin: 0px; cursor: pointer;">
                  <div>
                      <div class="d-flex">
                          <p style="margin: 0 8px 0 0; font-size: 1.3rem; font-weight: bold;">${item.description || "Untitled"}</p>
                          <p style="margin: 0px; font-size: 1.3rem;">(${item.category || "Uncategorized"})</p>
                      </div>
                      <p style="margin: 0px">${displayDate}</p>
                  </div>
                  <div class="align-items-center d-flex flex-nowrap" style="float: right; color: ${color}; font-weight: medium; font-size: 1.5rem;">
                      ${sign}$${((item.amount ?? 0) / 100).toFixed(2)}
                  </div>
              </div>
          `;
      })
      .join("");
    container.querySelectorAll(".transaction-item").forEach((transaction) => {
      transaction.addEventListener("click", () => {
        const id = transaction.dataset.id;
        const type = transaction.dataset.type;

        if (type === "income") {
          window.location.href = `editIncome.html?id=${id}`;
        }
      });
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    container.innerHTML = "<p>Failed to load transactions.</p>";
  }
}
