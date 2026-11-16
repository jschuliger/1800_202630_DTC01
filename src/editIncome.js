import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Remember the logged-in user so we can save their ID with the hike
let currentUser = null;

onAuthReady(async function (user) {
  if (!user) {
    location.href = "index.html";
    return;
  }

  currentUser = user;

  const params = new URLSearchParams(window.location.search);
  const incomeId = params.get("id");

  if (!incomeId) return;

  const incomeRef = doc(db, "users", currentUser.uid, "incomes", incomeId);

  const incomeSnap = await getDoc(incomeRef);

  if (incomeSnap.exists()) {
    const income = incomeSnap.data();

    document.getElementById("incomeAmountInput").value = income.amount || "";

    document.getElementById("incomeCategoryInput").value =
      income.category || "";

    document.getElementById("incomeDate").value = income.date || "";

    document.getElementById("incomeDescription").value =
      income.description || "";
  }
});

// ---- (1) What to do when the form is submitted ----
async function editIncome(event) {
  event.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const incomeId = params.get("id");

  let amount = document.getElementById("incomeAmountInput").value;
  amount = Number(amount.replace(".", ""));

  const updatedIncome = {
    amount,
    category: document.getElementById("incomeCategoryInput").value,
    date: document.getElementById("incomeDate").value,
    description: document.getElementById("incomeDescription").value,
    owner: currentUser.uid,
    ownerName: currentUser.displayName || currentUser.email,
    last_updated: serverTimestamp(),
  };

  try {
    const incomeRef = doc(
      db,
      "users",
      currentUser.uid,
      "incomes",
      incomeId
    );

    await updateDoc(incomeRef, updatedIncome);

    location.href = "finances.html";
  } catch (error) {
    alert(
      `Error updating income:\n${error.code || ""}\n${error.message || error}`
    );
  }
}

// ---- (2) Connect it: "form, when you are submitted, run saveHike" ----
document
  .getElementById("editIncomeForm")
  .addEventListener("submit", editIncome);
