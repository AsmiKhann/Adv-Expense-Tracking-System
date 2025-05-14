// Check if there is any data in localStorage
let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {
    totalBudget: 0,
    totalExpenses: 0,
    budgetLeft: 0,
    expenses: []
  };
  
  // Function to update UI
  function updateUI() {
    document.getElementById('totalBudget').textContent = budgetData.totalBudget.toFixed(2);
    document.getElementById('totalExpenses').textContent = budgetData.totalExpenses.toFixed(2);
    document.getElementById('budgetLeft').textContent = budgetData.budgetLeft.toFixed(2);
  
    let tableBody = document.querySelector('.table-container tbody');
    tableBody.innerHTML = '';
    budgetData.expenses.forEach(function (expense) {
      let row = document.createElement('tr');
      row.innerHTML = `
        <td>${expense.title}</td>
        <td>${expense.amount.toFixed(2)}</td>
        <td>${expense.date}</td>
        <td>${expense.category || ''}</td>
        <td><button class="btn btn-sm btn-danger">Remove</button></td>
      `;
      tableBody.appendChild(row);
    });
  
    renderChart();
  }
  
  // Function to update local storage
  function updateLocalStorage() {
    localStorage.setItem("budgetData", JSON.stringify(budgetData));
  }
  
  // Reset All
  function resetAll() {
    budgetData.totalBudget = 0;
    budgetData.totalExpenses = 0;
    budgetData.budgetLeft = 0;
    budgetData.expenses = [];
    updateLocalStorage();
    updateUI();
  }
  
  // Export to CSV
  function exportToCSV() {
    const rows = [
      ["Title", "Amount", "Date", "Category"],
      ...budgetData.expenses.map(exp => [exp.title, exp.amount, exp.date, exp.category || ""])
    ];
  
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    updateUI();
  
    document.querySelector('.add-budget-container form').addEventListener('submit', function (event) {
      event.preventDefault();
      let budgetInput = document.getElementById('budget');
      let budgetAmount = parseFloat(budgetInput.value.trim());
  
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        alert('Please enter a valid budget amount.');
        return;
      }
  
      budgetData.totalBudget = budgetAmount;
      budgetData.budgetLeft = budgetAmount;
      updateLocalStorage();
      updateUI();
      budgetInput.value = '';
    });
  
    document.querySelector('.add-expense-container form').addEventListener('submit', function (event) {
      event.preventDefault();
      let expenseInput = document.getElementById('expense');
      let amountInput = document.getElementById('amount');
      let dateInput = document.getElementById('date');
      let categoryInput = document.getElementById('category'); // <-- make sure this input exists in HTML
  
      let expenseTitle = expenseInput.value.trim();
      let expenseAmount = parseFloat(amountInput.value.trim());
      let expenseDate = dateInput.value.trim();
      let expenseCategory = categoryInput.value.trim();
  
      if (expenseTitle === '' || isNaN(expenseAmount) || expenseAmount <= 0) {
        alert('Please enter valid expense details.');
        return;
      }
  
      // Add this function to suggest category based on expense title
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

  let suggested = "Miscellaneous";  // Default suggestion

  // Check if any keyword matches the title
  for (const category in categories) {
      for (const keyword of categories[category]) {
          if (expenseTitle.includes(keyword)) {
              suggested = category.charAt(0).toUpperCase() + category.slice(1);  // Capitalize first letter
              break;
          }
      }
  }

  suggestedCategory.textContent = `Suggested Category: ${suggested}`;
  document.getElementById('category').value = suggested;  // Auto-fill the category input
}


      budgetData.expenses.push({
        title: expenseTitle,
        amount: expenseAmount,
        date: expenseDate,
        category: expenseCategory || "Miscellaneous"
      });
  
      budgetData.totalExpenses += expenseAmount;
      budgetData.budgetLeft -= expenseAmount;
  
      if (budgetData.budgetLeft < 0) {
        alert("Warning: Your expenses have exceeded your budget!");
      }
  
      updateLocalStorage();
      updateUI();
  
      expenseInput.value = '';
      amountInput.value = '';
      dateInput.value = '';
      categoryInput.value = '';
    });
  
    document.querySelector('.table-container').addEventListener('click', function (event) {
      if (event.target && event.target.matches("button.btn-danger")) {
        let rowIndex = event.target.closest('tr').rowIndex - 1;
        let removedExpense = budgetData.expenses.splice(rowIndex, 1)[0];
        budgetData.totalExpenses -= removedExpense.amount;
        budgetData.budgetLeft += removedExpense.amount;
        updateLocalStorage();
        updateUI();
      }
    });
  
    updateLocalStorage();
    updateUI();
  });
  
  // Chart.js
  let chart;  // For pie
let barChart;  // For bar

function renderChart() {
    const labels = budgetData.expenses.map(expense => expense.title);
    const data = budgetData.expenses.map(expense => expense.amount);
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56',
        '#4BC0C0', '#9966FF', '#FF9F40'
    ];
    
    // Destroy old charts if exist
    if (chart) chart.destroy();
    if (barChart) barChart.destroy();

    // Pie Chart
    chart = new Chart(document.getElementById('expensesChart'), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } }
        }
    });

    // Bar Chart
    barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expense Amount',
                data: data,
                backgroundColor: colors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2, // Adjust as needed (1.5–2 looks good)
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount' }
                },
                x: {
                    title: { display: true, text: 'Expense Title' }
                }
            }
        }
    });
}
