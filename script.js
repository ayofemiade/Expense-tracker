// Initialize expenses array
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expenseTableBody = document.getElementById('expenseTableBody');
const totalExpenses = document.getElementById('totalExpenses');
const remainingBudget = document.getElementById('remainingBudget');
const budgetWarning = document.getElementById('budgetWarning');
const setBudgetForm = document.getElementById('setBudgetForm');
const exportCSVButton = document.getElementById('exportCSV');

// Event Listeners
expenseForm.addEventListener('submit', addExpense);
setBudgetForm.addEventListener('submit', setBudget);
exportCSVButton.addEventListener('click', exportToCSV);

// Initialize
updateExpenseTable();
updateTotals();
createChart();

// Add Expense
function addExpense(e) {
    e.preventDefault();

    const date = document.getElementById('expenseDate').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;

    expenses.push({ date, amount, category, description });
    localStorage.setItem('expenses', JSON.stringify(expenses));

    expenseForm.reset();
    updateExpenseTable();
    updateTotals();
    updateChart();
}

function updateExpenseTable() {
    const expenseTableBody = document.getElementById('expenseTableBody');
    expenseTableBody.innerHTML = '';

    expenses.forEach((expense, index) => {
        const row = document.createElement('div');
        row.className = 'expense-row';
        row.innerHTML = `
            <div class="expense-data">
                <div class="expense-label">Date:</div>
                <div class="expense-value">${expense.date}</div>
            </div>
            <div class="expense-data">
                <div class="expense-label">Category:</div>
                <div class="expense-value">
                    <span class="expense-category">
                        <i class="fa-solid fa-${getCategoryIcon(expense.category)}"></i>
                        ${expense.category}
                    </span>
                </div>
            </div>
            <div class="expense-data">
                <div class="expense-label">Description:</div>
                <div class="expense-value">${expense.description}</div>
            </div>
            <div class="expense-data">
                <div class="expense-label">Amount:</div>
                <div class="expense-value">$${expense.amount.toFixed(2)}</div>
            </div>
            <div class="expense-actions">
                <button class="action-button" onclick="editExpense(${index})">
                    <i class="fa-solid fa-edit"></i>
                    <span class="button-text">Edit</span>
                </button>
                <button class="action-button delete" onclick="deleteExpense(${index})">
                    <i class="fa-solid fa-trash"></i>
                    <span class="button-text">Delete</span>
                </button>
            </div>
        `;
        expenseTableBody.appendChild(row);
    });
}

// Update Totals
function updateTotals() {
    const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    totalExpenses.textContent = `$${total.toFixed(2)}`;
    const remaining = budget - total;
    remainingBudget.textContent = `$${remaining.toFixed(2)}`;

    if (remaining < 0) {
        budgetWarning.classList.remove('hidden');
    } else {
        budgetWarning.classList.add('hidden');
    }
}

// Set Budget
function setBudget(e) {
    e.preventDefault();
    budget = parseFloat(document.getElementById('budgetAmount').value);
    localStorage.setItem('budget', budget);
    updateTotals();
}

// Delete Expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpenseTable();
    updateTotals();
    updateChart();
}

// Edit Expense
function editExpense(index) {
    const expense = expenses[index];
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseDescription').value = expense.description;

    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpenseTable();
    updateTotals();
    updateChart();
}

// Export to CSV
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Category,Description,Amount\n";
    expenses.forEach(expense => {
        csvContent += `${expense.date},${expense.category},${expense.description},${expense.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
}

// Get Category Icon
function getCategoryIcon(category) {
    switch(category) {
        case 'Food': return 'utensils';
        case 'Transportation': return 'car';
        case 'Entertainment': return 'film';
        case 'Utilities': return 'bolt';
        default: return 'receipt';
    }
}

// Create Chart
function createChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    window.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    updateChart();
}

// Update Chart
function updateChart() {
    const categoryTotals = {};
    expenses.forEach(expense => {
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });

    window.expenseChart.data.labels = Object.keys(categoryTotals);
    window.expenseChart.data.datasets[0].data = Object.values(categoryTotals);
    window.expenseChart.update();
}

