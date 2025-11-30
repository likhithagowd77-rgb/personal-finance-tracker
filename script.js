let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = localStorage.getItem("budget") || 0;

document.getElementById("budgetInput").value = budget;

// ---------- SET BUDGET ----------
function setBudget() {
    budget = document.getElementById("budgetInput").value;
    localStorage.setItem("budget", budget);
    updateUI();
}

// ---------- ADD TRANSACTION ----------
function addTransaction() {
    const title = document.getElementById("title").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const recurring = document.getElementById("recurring").checked;

    if (!title || !amount) return alert("Enter valid inputs");

    transactions.push({ title, amount, type, category, recurring });
    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateUI();
}

// ---------- LOAD RECURRING TRANSACTIONS ----------
function loadRecurring() {
    transactions
        .filter(t => t.recurring)
        .forEach(t => {
            transactions.push({ ...t }); // duplicate monthly
        });
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ---------- UPDATE UI ----------
function updateUI() {
    let income = 0, expense = 0;

    document.getElementById("transactionList").innerHTML = "";

    transactions.forEach((t, i) => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;

        let li = document.createElement("li");
        li.innerHTML = `
            ${t.title} - ₹${t.amount} (${t.category}) ${t.recurring ? "🔁" : ""}
            <button onclick="deleteTransaction(${i})">❌</button>
        `;
        document.getElementById("transactionList").appendChild(li);
    });

    document.getElementById("totalIncome").innerText = income;
    document.getElementById("totalExpense").innerText = expense;
    document.getElementById("balance").innerText = income - expense;

    updateBudgetStatus(expense);
    updatePieChart();
}

// ---------- DELETE ----------
function deleteTransaction(i) {
    transactions.splice(i, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateUI();
}

// ---------- BUDGET PROGRESS ----------
function updateBudgetStatus(expense) {
    if (!budget) return;

    const percent = Math.min((expense / budget) * 100, 100);
    const fill = document.getElementById("progressFill");

    fill.style.width = percent + "%";

    if (percent < 50) fill.style.background = "green";
    else if (percent < 80) fill.style.background = "orange";
    else fill.style.background = "red";

    const msg = document.getElementById("budgetStatus");

    if (percent >= 100) {
        msg.innerHTML = "⚠️ You exceeded your monthly budget!";
        msg.style.color = "red";
    } else {
        msg.innerHTML = `Used ${Math.floor(percent)}% of your budget`;
        msg.style.color = "black";
    }
}

// ---------- PIE CHART ----------
let chart;

function updatePieChart() {

    let categories = {
        Food: 0,
        Travel: 0,
        Shopping: 0,
        Bills: 0,
        Other: 0
    };

    transactions.forEach(t => {
        if (t.type === "expense") {
            categories[t.category] += t.amount;
        }
    });

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
            }]
        }
    });
}

// ---------- INITIAL LOAD ----------
updateUI();
