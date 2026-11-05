import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const foodCard = document.querySelector("#food-category");

onAuthStateChanged(auth, function (user) {
  foodCard.onclick = async function () {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    try {
      // Find this user's Food expenses.
      const expensesRef = collection(db, "users", user.uid, "expenses");
      const foodQuery = query(expensesRef, where("category", "==", "Food"));

      // Read the matching documents from Firestore.
      const snapshot = await getDocs(foodQuery);

      let total = 0;

      snapshot.forEach(function (expenseDoc) {
        const expense = expenseDoc.data();
        total += expense.amount;
        console.log("Expense read:", expense);
      });

      // Display the total inside the Food card.
      foodCard.querySelector("p").textContent = `$${total.toFixed(2)}`;
    } catch (error) {
      console.error("Could not read expenses:", error);
      alert("Could not load expenses. Check the console.");
    }
  };
});
