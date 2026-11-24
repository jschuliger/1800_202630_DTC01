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
  const expenseId = params.get("id");

  if (!expenseId) return;

  const expenseRef = doc(db, "users", currentUser.uid, "expenses", expenseId);

  const expenseSnap = await getDoc(expenseRef);

  if (expenseSnap.exists()) {
    const expense = expenseSnap.data();

    document.getElementById("expenseAmountInput").value = expense.amount || "";

    document.getElementById("expenseCategoryInput").value =
      expense.category || "";

    document.getElementById("expenseDate").value = expense.date || "";

    document.getElementById("expenseDescription").value =
      expense.description || "";
  }
});

// ---- (1) What to do when the form is submitted ----
async function editExpense(event) {
  event.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const expenseId = params.get("id");

  let amount = document.getElementById("expenseAmountInput").value;
  amount = Number(amount.replace(".", ""));

  const updatedExpense = {
    amount,
    category: document.getElementById("expenseCategoryInput").value,
    date: document.getElementById("expenseDate").value,
    description: document.getElementById("expenseDescription").value,
    owner: currentUser.uid,
    ownerName: currentUser.displayName || currentUser.email,
    last_updated: serverTimestamp(),
  };

  try {
    const expenseRef = doc(db, "users", currentUser.uid, "expenses", expenseId);

    await updateDoc(expenseRef, updatedExpense);

    location.href = "finances.html";
  } catch (error) {
    alert(
      `Error updating expense:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}

// ---- (2) Connect it: "form, when you are submitted, run editExpense" ----
document
  .getElementById("editExpenseForm")
  .addEventListener("submit", editExpense);
