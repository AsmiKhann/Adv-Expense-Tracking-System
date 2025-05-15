let currentUser;
let budgetData = {
  totalBudget: 0,
  totalExpenses: 0,
  budgetLeft: 0,
  expenses: []
};

let chart, barChart;

// ---------------------- Firebase Auth Handling ----------------------
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
    const savedData = localStorage.getItem(`budgetData_${currentUser.uid}`);
    if (savedData) {
      budgetData = JSON.parse(savedData);
    } else {
      saveToLocalStorage();
    }
    updateUI();
  }
});

// ---------------------- UI Update ----------------------
function updateUI() {
  document.getElementById('totalBudget').textContent = budgetData.totalBudget.toFixed(2);
  document.getElementById('totalExpenses').textContent = budgetData.totalExpenses.toFixed(2);
  document.getElementById('budgetLeft').textContent = budgetData.budgetLeft.toFixed(2);

  const tableBody = document.querySelector('.table-container tbody');
  tableBody.innerHTML = '';
  budgetData.expenses.forEach(exp => {
    let row = document.createElement('tr');
    row.innerHTML = `
      <td>${exp.title}</td>
      <td>${exp.amount.toFixed(2)}</td>
      <td>${exp.date}</td>
      <td>${exp.category || ''}</td>
      <td><button class="btn btn-sm btn-danger">Remove</button></td>
    `;
    tableBody.appendChild(row);
  });

  renderCharts();
}

// ---------------------- Local Storage ----------------------
function saveToLocalStorage() {
  if (currentUser) {
    localStorage.setItem(`budgetData_${currentUser.uid}`, JSON.stringify(budgetData));
  }
}

// ---------------------- Suggest Category ----------------------
function suggestCategory() {
  const expenseTitle = document.getElementById('expense').value.trim().toLowerCase();
  const suggestedCategory = document.getElementById('suggested-category');

  const categories = {
    food: ["grocery", "supermarket", "food", "produce", "market"],
    bills: ["electricity", "water", "internet", "phone", "cable"],
    travel: ["bus", "train", "taxi", "uber", "plane", "hotel"],
    shopping: ["clothes", "shopping", "electronics", "store", "mall"],
    miscellaneous: ["miscellaneous", "other"]
  };

  let suggested = "Miscellaneous";
  for (const category in categories) {
    for (const keyword of categories[category]) {
      if (expenseTitle.includes(keyword)) {
        suggested = category.charAt(0).toUpperCase() + category.slice(1);
        break;
      }
    }
  }

  suggestedCategory.textContent = `Suggested Category: ${suggested}`;
  document.getElementById('category').value = suggested;
}

// ---------------------- Event Handlers ----------------------
document.addEventListener("DOMContentLoaded", () => {
  // Add Budget
  document.querySelector('.add-budget-container form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('budget');
    const amount = parseFloat(input.value.trim());

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid budget amount.');
      return;
    }

    budgetData.totalBudget = amount;
    budgetData.budgetLeft = amount - budgetData.totalExpenses;
    saveToLocalStorage();
    updateUI();
    input.value = '';
  });

  // Add Expense
  document.querySelector('.add-expense-container form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('expense').value.trim();
    const amount = parseFloat(document.getElementById('amount').value.trim());
    const date = document.getElementById('date').value.trim();
    const category = document.getElementById('category').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
      alert('Please enter valid expense details.');
      return;
    }

    budgetData.expenses.push({ title, amount, date, category: category || 'Miscellaneous' });
    budgetData.totalExpenses += amount;
    budgetData.budgetLeft -= amount;

    if (budgetData.budgetLeft < 0) {
      alert("Warning: Your expenses have exceeded your budget!");
    }

    saveToLocalStorage();
    updateUI();

    // Reset form
    document.getElementById('expense').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('category').value = '';
  });

  // Remove Expense
  document.querySelector('.table-container').addEventListener('click', e => {
    if (e.target.matches("button.btn-danger")) {
      const index = e.target.closest('tr').rowIndex - 1;
      const removed = budgetData.expenses.splice(index, 1)[0];
      budgetData.totalExpenses -= removed.amount;
      budgetData.budgetLeft += removed.amount;
      saveToLocalStorage();
      updateUI();
    }
  });
});

// ---------------------- Reset All ----------------------
function resetAll() {
  budgetData = {
    totalBudget: 0,
    totalExpenses: 0,
    budgetLeft: 0,
    expenses: []
  };
  saveToLocalStorage();
  updateUI();
}

// ---------------------- Export CSV ----------------------
function exportToCSV() {
  const rows = [
    ["Title", "Amount", "Date", "Category"],
    ...budgetData.expenses.map(e => [e.title, e.amount, e.date, e.category || ""])
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "expenses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------------------- Charts ----------------------
function renderCharts() {
  const labels = budgetData.expenses.map(e => e.title);
  const data = budgetData.expenses.map(e => e.amount);
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  if (chart) chart.destroy();
  if (barChart) barChart.destroy();

  chart = new Chart(document.getElementById('expensesChart'), {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors }]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } } }
  });

  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Expense Amount',
        data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      aspectRatio: 2,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Amount' } },
        x: { title: { display: true, text: 'Expense Title' } }
      }
    }
  });
}