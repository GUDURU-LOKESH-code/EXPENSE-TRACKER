const budgetInput = document.getElementById("budgetInput");
const expenseName = document.getElementById("expenseName");
const amountInput = document.getElementById("amountInput");
const categorySelect = document.getElementById("categorySelect");

const addBtn = document.getElementById("addBtn");
const search = document.getElementById("search");

const expenseList = document.getElementById("expenseList");
const history = document.getElementById("History");

const budget = document.getElementById("budget");
const spent = document.getElementById("spent");
const remaining = document.getElementById("remaining");

const form = document.querySelector("form");




let totalBudget = 0;
let expenseSpent = 0;

// Used while editing an expense
let isEditing = false;
let editingCard = null;
let previousAmount = 0;



function hideHistory() {

    history.style.display = "none";

}

function showHistory(message) {

    history.innerText = message;
    history.style.display = "block";

}

function clearInputs() {

    expenseName.value = "";
    amountInput.value = "";
    categorySelect.selectedIndex = 0;

    expenseName.focus();

}



function updateSummary() {

    const remainingAmount = totalBudget - expenseSpent;

    budget.innerText = `💰 Budget : ₹${totalBudget}`;
    spent.innerText = `💸 Spent : ₹${expenseSpent}`;
    remaining.innerText = `💵 Remaining : ₹${remainingAmount}`;

}



function saveData() {

    const expenses = [];

    expenseList.querySelectorAll(".expenseCard").forEach(card => {

        expenses.push({

            category:
                card.querySelector(".expense-category")
                    .innerText.replace("Category : ", ""),

            name:
                card.querySelector(".expense-name")
                    .innerText.replace("Expense : ", ""),

            amount:
                Number(
                    card.querySelector(".expense-amount")
                        .innerText.replace("Amount : ₹", "")
                )

        });

    });

    localStorage.setItem("budget", totalBudget);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


function loadData() {

    totalBudget =
        Number(localStorage.getItem("budget")) || 0;

    if (totalBudget > 0) {

        budgetInput.value = totalBudget;
        budgetInput.disabled = true;

    }

    let expenses = [];

    try {

        expenses =
            JSON.parse(localStorage.getItem("expenses")) || [];

    }

    catch {

        expenses = [];

    }

    expenses.forEach(expense => {

        expenseSpent += expense.amount;

        createExpenseCard(

            expense.name,
            expense.amount,
            expense.category

        );

    });

    updateSummary();

    if (expenses.length > 0) {

        hideHistory();

    }

    else {

        showHistory("No expense yet...");

    }

}


function createExpenseCard(name, amount, category) {

    const card = document.createElement("div");
    card.classList.add("expenseCard");



    const expenseCategory = document.createElement("p");
    expenseCategory.classList.add(
        "expenseText",
        "expense-category"
    );
    expenseCategory.innerText = `Category : ${category}`;

    const expenseTitle = document.createElement("p");
    expenseTitle.classList.add(
        "expenseText",
        "expense-name"
    );
    expenseTitle.innerText = `Expense : ${name}`;


    const expenseAmount = document.createElement("p");
    expenseAmount.classList.add(
        "expenseText",
        "expense-amount"
    );
    expenseAmount.innerText = `Amount : ₹${amount}`;



    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.classList.add("editStyle");

    editBtn.addEventListener("click", () => {

        // Fill form with existing values

        expenseName.value =
            expenseTitle.innerText.replace("Expense : ", "");

        amountInput.value =
            Number(
                expenseAmount.innerText.replace("Amount : ₹", "")
            );

        categorySelect.value =
            expenseCategory.innerText.replace("Category : ", "");


        isEditing = true;

        editingCard = card;

        previousAmount =
            Number(
                expenseAmount.innerText.replace("Amount : ₹", "")
            );

        expenseName.focus();

    });


    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("deleteStyle");

    deleteBtn.addEventListener("click", () => {

        const deletedAmount =
            Number(
                expenseAmount.innerText.replace("Amount : ₹", "")
            );

        expenseSpent -= deletedAmount;

        card.remove();

        updateSummary();

        saveData();

        searchExpenses();

        if (expenseList.children.length === 0) {

            showHistory("No expense yet...");

        }

    });



    card.append(

        expenseCategory,
        expenseTitle,
        expenseAmount,
        editBtn,
        deleteBtn

    );

    expenseList.appendChild(card);

}


function initializeBudget() {

    if (totalBudget !== 0) {
        return true;
    }

    totalBudget = Number(budgetInput.value);

    if (totalBudget <= 0) {

        alert("Budget must be greater than 0");
        totalBudget = 0;

        return false;
    }

    budgetInput.disabled = true;

    return true;

}


function addExpense() {

    if (!initializeBudget()) {
        return;
    }

    const name = expenseName.value.trim();
    const amount = Number(amountInput.value);
    const category = categorySelect.value;

    if (name === "") {

        alert("Enter Expense Name");
        expenseName.focus();
        return;

    }

    if (amount <= 0) {

        alert("Amount must be greater than 0");
        amountInput.focus();
        return;

    }


    if (isEditing) {

        const newSpent =
            expenseSpent - previousAmount + amount;

        if (newSpent > totalBudget) {

            alert("Warning! Budget exceeded.");
            return;

        }

        editingCard.querySelector(".expense-name").innerText =
            `Expense : ${name}`;

        editingCard.querySelector(".expense-category").innerText =
            `Category : ${category}`;

        editingCard.querySelector(".expense-amount").innerText =
            `Amount : ₹${amount}`;

        expenseSpent = newSpent;

        isEditing = false;
        editingCard = null;
        previousAmount = 0;

        updateSummary();
        saveData();
        searchExpenses();
        clearInputs();

        return;

    }


    if (expenseSpent + amount > totalBudget) {

        alert("Warning! Budget exceeded.");
        return;

    }

    expenseSpent += amount;

    createExpenseCard(
        name,
        amount,
        category
    );

    updateSummary();

    saveData();

    hideHistory();

    searchExpenses();

    clearInputs();

}


function searchExpenses() {

    const searchText =
        search.value.toLowerCase().trim();

    const cards =
        expenseList.querySelectorAll(".expenseCard");

    let found = false;

    cards.forEach(card => {

        const match =
            card.textContent
                .toLowerCase()
                .includes(searchText);

        card.style.display =
            match ? "block" : "none";

        if (match) {
            found = true;
        }

    });

    if (cards.length === 0) {

        showHistory("No expense yet...");

    }

    else if (!found) {

        showHistory("No matching expenses found.");

    }

    else {

        hideHistory();

    }

}




addBtn.addEventListener("click", function (e) {

    e.preventDefault();

    if (!form.checkValidity()) {

        form.reportValidity();
        return;

    }

    addExpense();

});



search.addEventListener(
    "input",
    searchExpenses
);




loadData();

updateSummary();