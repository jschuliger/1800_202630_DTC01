import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Remember the logged-in user so we can save their ID with the hike
let currentUser = null;

onAuthReady(function (user) {
  if (!user) {
    location.href = "index.html"; // Not logged in → go away
    return;
  }
  currentUser = user; // Logged in → remember them
});


// ---- (1) What to do when the form is submitted ----
async function submitExpense(event) {
    event.preventDefault();   // Stop the browser from reloading the page

    // 1. Collect the form values into ONE object (this becomes the Firestore document)
    const newExpense = {
        amount: Number(document.getElementById("expenseAmountInput").value),
        category: document.getElementById("expenseCategoryInput").value,
        date: document.getElementById("expenseDate").value,
        description: document.getElementById("expenseDescription").value,   //
        owner: currentUser.uid,                                       // WHO added it
        ownerName: currentUser.displayName || currentUser.email,
        last_updated: serverTimestamp()                               // WHEN it was added
    };

    // 2. Save it to the "expenses" collection
    try {
        await addDoc(
          collection(db, "users", currentUser.uid, "expenses"),
          newExpense,
        );
        location.href = "overview.html";    // 3. Go look at the new expense
    } catch (error) {
        alert(`Error submitting expense:\n${error.code || ""}\n${error.message || error}`);
    }
}

// ---- (2) Connect it: "form, when you are submitted, run saveHike" ----
document.getElementById("addExpenseForm").addEventListener("submit", submitExpense);
