"use strict";

const STORAGE_KEY = "bodysync-foods-v1";

const dailyGoals = {
    calories: 2000,
    protein: 160
};

let foods = [];

const elements = {
    currentDate: document.getElementById("currentDate"),

    caloriesConsumed:
        document.getElementById("caloriesConsumed"),
    caloriesPercentage:
        document.getElementById("caloriesPercentage"),
    caloriesRemaining:
        document.getElementById("caloriesRemaining"),
    caloriesProgress:
        document.getElementById("caloriesProgress"),
    caloriesProgressTrack:
        document.getElementById("caloriesProgressTrack"),

    proteinConsumed:
        document.getElementById("proteinConsumed"),
    proteinPercentage:
        document.getElementById("proteinPercentage"),
    proteinRemaining:
        document.getElementById("proteinRemaining"),
    proteinProgress:
        document.getElementById("proteinProgress"),
    proteinProgressTrack:
        document.getElementById("proteinProgressTrack"),

    foodList:
        document.getElementById("foodList"),
    emptyState:
        document.getElementById("emptyState"),

    foodDialog:
        document.getElementById("foodDialog"),
    foodForm:
        document.getElementById("foodForm"),
    foodName:
        document.getElementById("foodName"),
    foodCalories:
        document.getElementById("foodCalories"),
    foodProtein:
        document.getElementById("foodProtein"),
    formError:
        document.getElementById("formError"),

    openFoodDialog:
        document.getElementById("openFoodDialog"),
    emptyAddButton:
        document.getElementById("emptyAddButton"),
    closeFoodDialog:
        document.getElementById("closeFoodDialog")
};

function formatCurrentDate() {
    const formatter = new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    });

    const formattedDate = formatter.format(new Date());

    elements.currentDate.textContent =
        formattedDate.charAt(0).toUpperCase() +
        formattedDate.slice(1);
}

function createFoodId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function isValidStoredFood(food) {
    return (
        food &&
        typeof food.id === "string" &&
        typeof food.name === "string" &&
        Number.isFinite(food.calories) &&
        Number.isFinite(food.protein) &&
        food.calories >= 0 &&
        food.protein >= 0
    );
}

function loadFoods() {
    try {
        const storedValue = localStorage.getItem(STORAGE_KEY);

        if (!storedValue) {
            foods = [];
            return;
        }

        const parsedFoods = JSON.parse(storedValue);

        if (!Array.isArray(parsedFoods)) {
            foods = [];
            return;
        }

        foods = parsedFoods
            .filter(isValidStoredFood)
            .map((food) => ({
                id: food.id,
                name: food.name.trim(),
                calories: Math.round(food.calories),
                protein:
                    Math.round(food.protein * 10) / 10
            }));
    } catch (error) {
        console.error(
            "Gespeicherte Lebensmittel konnten nicht geladen werden:",
            error
        );

        foods = [];
    }
}

function saveFoods() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(foods)
        );
    } catch (error) {
        console.error(
            "Lebensmittel konnten nicht gespeichert werden:",
            error
        );
    }
}

function calculateTotals() {
    return foods.reduce(
        (totals, food) => {
            totals.calories += food.calories;
            totals.protein += food.protein;

            return totals;
        },
        {
            calories: 0,
            protein: 0
        }
    );
}

function calculatePercentage(value, goal) {
    if (goal <= 0) {
        return 0;
    }

    return Math.min(
        Math.round((value / goal) * 100),
        100
    );
}

function formatProtein(value) {
    return Number.isInteger(value)
        ? value.toString()
        : value.toFixed(1);
}

function updateDashboard() {
    const totals = calculateTotals();

    const caloriesPercentage = calculatePercentage(
        totals.calories,
        dailyGoals.calories
    );

    const proteinPercentage = calculatePercentage(
        totals.protein,
        dailyGoals.protein
    );

    const remainingCalories = Math.max(
        dailyGoals.calories - totals.calories,
        0
    );

    const remainingProtein = Math.max(
        dailyGoals.protein - totals.protein,
        0
    );

    elements.caloriesConsumed.textContent =
        Math.round(totals.calories);

    elements.caloriesPercentage.textContent =
        `${caloriesPercentage} %`;

    elements.caloriesRemaining.textContent =
        totals.calories > dailyGoals.calories
            ? `${Math.round(
                totals.calories - dailyGoals.calories
            )} kcal über dem Ziel`
            : `Noch ${Math.round(
                remainingCalories
            )} kcal verfügbar`;

    elements.caloriesProgress.style.width =
        `${caloriesPercentage}%`;

    elements.caloriesProgressTrack.setAttribute(
        "aria-valuenow",
        Math.round(totals.calories).toString()
    );

    elements.proteinConsumed.textContent =
        formatProtein(totals.protein);

    elements.proteinPercentage.textContent =
        `${proteinPercentage} %`;

    elements.proteinRemaining.textContent =
        totals.protein > dailyGoals.protein
            ? `${formatProtein(
                totals.protein - dailyGoals.protein
            )} g über dem Ziel`
            : `Noch ${formatProtein(
                remainingProtein
            )} g verfügbar`;

    elements.proteinProgress.style.width =
        `${proteinPercentage}%`;

    elements.proteinProgressTrack.setAttribute(
        "aria-valuenow",
        formatProtein(totals.protein)
    );
}

function createDeleteIcon() {
    return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16"/>
            <path d="M9 7V4h6v3"/>
            <path d="M7 7l1 13h8l1-13"/>
            <path d="M10 11v5M14 11v5"/>
        </svg>
    `;
}

function renderFoods() {
    elements.foodList.innerHTML = "";

    elements.emptyState.classList.toggle(
        "hidden",
        foods.length > 0
    );

    foods.forEach((food) => {
        const article = document.createElement("article");
        article.className = "food-item";

        const information = document.createElement("div");
        information.className = "food-information";

        const title = document.createElement("h3");
        title.textContent = food.name;

        const nutrition = document.createElement("p");
        nutrition.className = "food-nutrition";

        const calories = document.createElement("span");
        calories.textContent = `${food.calories} kcal`;

        const protein = document.createElement("span");
        protein.textContent =
            `${formatProtein(food.protein)} g Protein`;

        nutrition.append(calories, protein);
        information.append(title, nutrition);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.setAttribute(
            "aria-label",
            `${food.name} löschen`
        );
        deleteButton.dataset.foodId = food.id;
        deleteButton.innerHTML = createDeleteIcon();

        article.append(information, deleteButton);
        elements.foodList.append(article);
    });
}

function renderApp() {
    renderFoods();
    updateDashboard();
}

function openDialog() {
    elements.formError.textContent = "";

    if (
        typeof elements.foodDialog.showModal ===
        "function"
    ) {
        elements.foodDialog.showModal();
    } else {
        elements.foodDialog.setAttribute("open", "");
    }

    window.setTimeout(() => {
        elements.foodName.focus();
    }, 100);
}

function closeDialog() {
    if (elements.foodDialog.open) {
        elements.foodDialog.close();
    }

    elements.foodForm.reset();
    elements.formError.textContent = "";
}

function validateFood(name, calories, protein) {
    if (!name) {
        return "Bitte gib einen Namen ein.";
    }

    if (!Number.isFinite(calories) || calories < 0) {
        return "Bitte gib gültige Kalorien ein.";
    }

    if (!Number.isFinite(protein) || protein < 0) {
        return "Bitte gib einen gültigen Proteinwert ein.";
    }

    if (calories === 0 && protein === 0) {
        return "Kalorien und Protein dürfen nicht beide null sein.";
    }

    return "";
}

function addFood(event) {
    event.preventDefault();

    const name = elements.foodName.value.trim();
    const calories = Number(
        elements.foodCalories.value
    );
    const protein = Number(
        elements.foodProtein.value
    );

    const validationError = validateFood(
        name,
        calories,
        protein
    );

    if (validationError) {
        elements.formError.textContent =
            validationError;
        return;
    }

    const food = {
        id: createFoodId(),
        name,
        calories: Math.round(calories),
        protein:
            Math.round(protein * 10) / 10
    };

    foods.unshift(food);

    saveFoods();
    closeDialog();
    renderApp();
}

function deleteFood(foodId) {
    foods = foods.filter(
        (food) => food.id !== foodId
    );

    saveFoods();
    renderApp();
}

function handleFoodListClick(event) {
    const deleteButton = event.target.closest(
        ".delete-button"
    );

    if (!deleteButton) {
        return;
    }

    deleteFood(deleteButton.dataset.foodId);
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .catch((error) => {
                console.error(
                    "Service Worker konnte nicht registriert werden:",
                    error
                );
            });
    });
}

elements.openFoodDialog.addEventListener(
    "click",
    openDialog
);

elements.emptyAddButton.addEventListener(
    "click",
    openDialog
);

elements.closeFoodDialog.addEventListener(
    "click",
    closeDialog
);

elements.foodForm.addEventListener(
    "submit",
    addFood
);

elements.foodList.addEventListener(
    "click",
    handleFoodListClick
);

elements.foodDialog.addEventListener(
    "click",
    (event) => {
        if (event.target === elements.foodDialog) {
            closeDialog();
        }
    }
);

formatCurrentDate();
loadFoods();
renderApp();
registerServiceWorker();
