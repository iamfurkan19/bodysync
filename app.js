"use strict";

const STORAGE_KEY = "bodysync-data-v2";
const OLD_STORAGE_KEY = "bodysync-foods-v1";

const dailyGoals = {
    calories: 2000,
    protein: 160
};

let appData = {
    foodsByDate: {}
};

let selectedDateKey = getTodayKey();
let calendarMonth = startOfMonth(parseDateKey(selectedDateKey));
let currentView = "dashboard";

const elements = {
    headerDate: document.getElementById("headerDate"),
    todayButton: document.getElementById("todayButton"),

    dashboardView: document.getElementById("dashboardView"),
    calendarView: document.getElementById("calendarView"),
    dashboardTab: document.getElementById("dashboardTab"),
    calendarTab: document.getElementById("calendarTab"),

    summaryTitle: document.getElementById("summaryTitle"),
    selectedDateText: document.getElementById("selectedDateText"),
    foodSectionTitle: document.getElementById("foodSectionTitle"),
    emptyStateText: document.getElementById("emptyStateText"),
    openCalendarButton:
        document.getElementById("openCalendarButton"),

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

    foodList: document.getElementById("foodList"),
    emptyState: document.getElementById("emptyState"),

    calendarMonthTitle:
        document.getElementById("calendarMonthTitle"),
    calendarGrid:
        document.getElementById("calendarGrid"),
    previousMonthButton:
        document.getElementById("previousMonthButton"),
    nextMonthButton:
        document.getElementById("nextMonthButton"),
    calendarTodayButton:
        document.getElementById("calendarTodayButton"),

    calendarSelectedDate:
        document.getElementById("calendarSelectedDate"),
    calendarCalories:
        document.getElementById("calendarCalories"),
    calendarProtein:
        document.getElementById("calendarProtein"),
    calendarFoodCount:
        document.getElementById("calendarFoodCount"),
    openSelectedDayButton:
        document.getElementById("openSelectedDayButton"),

    foodDialog: document.getElementById("foodDialog"),
    foodForm: document.getElementById("foodForm"),
    foodName: document.getElementById("foodName"),
    foodCalories: document.getElementById("foodCalories"),
    foodProtein: document.getElementById("foodProtein"),
    formError: document.getElementById("formError"),
    dialogDateLabel:
        document.getElementById("dialogDateLabel"),

    openFoodDialog:
        document.getElementById("openFoodDialog"),
    emptyAddButton:
        document.getElementById("emptyAddButton"),
    closeFoodDialog:
        document.getElementById("closeFoodDialog")
};

function padNumber(value) {
    return String(value).padStart(2, "0");
}

function createDateKey(date) {
    return [
        date.getFullYear(),
        padNumber(date.getMonth() + 1),
        padNumber(date.getDate())
    ].join("-");
}

function getTodayKey() {
    return createDateKey(new Date());
}

function parseDateKey(dateKey) {
    const parts = dateKey.split("-").map(Number);

    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2],
        12,
        0,
        0
    );
}

function startOfMonth(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
        12,
        0,
        0
    );
}

function addMonths(date, amount) {
    return new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1,
        12,
        0,
        0
    );
}

function isToday(dateKey) {
    return dateKey === getTodayKey();
}

function formatDateLong(dateKey) {
    return new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(parseDateKey(dateKey));
}

function formatDateShort(dateKey) {
    return new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    }).format(parseDateKey(dateKey));
}

function capitalizeFirstLetter(value) {
    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
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

function isValidFood(food) {
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

function sanitizeFoods(foods) {
    if (!Array.isArray(foods)) {
        return [];
    }

    return foods
        .filter(isValidFood)
        .map((food) => ({
            id: food.id,
            name: food.name.trim(),
            calories: Math.round(food.calories),
            protein:
                Math.round(food.protein * 10) / 10
        }));
}

function migrateOldData() {
    try {
        const oldValue = localStorage.getItem(
            OLD_STORAGE_KEY
        );

        if (!oldValue) {
            return false;
        }

        const oldFoods = sanitizeFoods(
            JSON.parse(oldValue)
        );

        if (oldFoods.length === 0) {
            return false;
        }

        appData.foodsByDate[getTodayKey()] = oldFoods;

        localStorage.removeItem(OLD_STORAGE_KEY);

        return true;
    } catch (error) {
        console.error(
            "Alte Daten konnten nicht übernommen werden:",
            error
        );

        return false;
    }
}

function loadData() {
    try {
        const storedValue = localStorage.getItem(
            STORAGE_KEY
        );

        if (storedValue) {
            const parsedData = JSON.parse(storedValue);

            if (
                parsedData &&
                typeof parsedData === "object" &&
                parsedData.foodsByDate &&
                typeof parsedData.foodsByDate === "object"
            ) {
                const cleanedFoodsByDate = {};

                Object.entries(
                    parsedData.foodsByDate
                ).forEach(([dateKey, foods]) => {
                    const cleanedFoods = sanitizeFoods(foods);

                    if (cleanedFoods.length > 0) {
                        cleanedFoodsByDate[dateKey] =
                            cleanedFoods;
                    }
                });

                appData = {
                    foodsByDate: cleanedFoodsByDate
                };

                return;
            }
        }

        appData = {
            foodsByDate: {}
        };

        const dataMigrated = migrateOldData();

        if (dataMigrated) {
            saveData();
        }
    } catch (error) {
        console.error(
            "Gespeicherte Daten konnten nicht geladen werden:",
            error
        );

        appData = {
            foodsByDate: {}
        };
    }
}

function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );
    } catch (error) {
        console.error(
            "Daten konnten nicht gespeichert werden:",
            error
        );
    }
}

function getFoodsForDate(dateKey) {
    const foods = appData.foodsByDate[dateKey];

    return Array.isArray(foods) ? foods : [];
}

function setFoodsForDate(dateKey, foods) {
    if (foods.length === 0) {
        delete appData.foodsByDate[dateKey];
        return;
    }

    appData.foodsByDate[dateKey] = foods;
}

function calculateTotals(foods) {
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

function updateDateLabels() {
    const formattedDate = capitalizeFirstLetter(
        formatDateShort(selectedDateKey)
    );

    elements.headerDate.textContent = isToday(
        selectedDateKey
    )
        ? `Heute · ${formattedDate}`
        : formattedDate;

    elements.summaryTitle.textContent = isToday(
        selectedDateKey
    )
        ? "Bleib heute im Rhythmus"
        : "Dein ausgewählter Tag";

    elements.selectedDateText.textContent = isToday(
        selectedDateKey
    )
        ? "Deine Werte für heute."
        : `Werte für ${formatDateLong(
            selectedDateKey
        )}.`;

    elements.foodSectionTitle.textContent = isToday(
        selectedDateKey
    )
        ? "Heute gegessen"
        : "Einträge dieses Tages";

    elements.emptyStateText.textContent = isToday(
        selectedDateKey
    )
        ? "Füge dein erstes Lebensmittel hinzu."
        : "Für diesen Tag sind noch keine Lebensmittel eingetragen.";

    elements.dialogDateLabel.textContent =
        capitalizeFirstLetter(
            formatDateShort(selectedDateKey)
        );
}

function updateDashboard() {
    const foods = getFoodsForDate(selectedDateKey);
    const totals = calculateTotals(foods);

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
    const foods = getFoodsForDate(selectedDateKey);

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

        const deleteButton =
            document.createElement("button");

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

function updateCalendarSummary() {
    const foods = getFoodsForDate(selectedDateKey);
    const totals = calculateTotals(foods);

    elements.calendarSelectedDate.textContent =
        isToday(selectedDateKey)
            ? "Heute"
            : capitalizeFirstLetter(
                formatDateShort(selectedDateKey)
            );

    elements.calendarCalories.textContent =
        Math.round(totals.calories);

    elements.calendarProtein.textContent =
        formatProtein(totals.protein);

    elements.calendarFoodCount.textContent =
        foods.length;
}

function getCalendarStartDate(monthDate) {
    const firstDay = startOfMonth(monthDate);
    const weekday = firstDay.getDay();
    const daysFromMonday = (weekday + 6) % 7;

    const calendarStart = new Date(firstDay);
    calendarStart.setDate(
        firstDay.getDate() - daysFromMonday
    );

    return calendarStart;
}

function renderCalendar() {
    elements.calendarGrid.innerHTML = "";

    elements.calendarMonthTitle.textContent =
        capitalizeFirstLetter(
            new Intl.DateTimeFormat("de-DE", {
                month: "long",
                year: "numeric"
            }).format(calendarMonth)
        );

    const calendarStart =
        getCalendarStartDate(calendarMonth);

    for (let index = 0; index < 42; index += 1) {
        const date = new Date(calendarStart);
        date.setDate(calendarStart.getDate() + index);

        const dateKey = createDateKey(date);
        const button = document.createElement("button");

        button.type = "button";
        button.className = "calendar-day";
        button.textContent = date.getDate();
        button.dataset.dateKey = dateKey;

        const isOutsideMonth =
            date.getMonth() !== calendarMonth.getMonth();

        if (isOutsideMonth) {
            button.classList.add("outside-month");
        }

        if (dateKey === getTodayKey()) {
            button.classList.add("today");
        }

        if (dateKey === selectedDateKey) {
            button.classList.add("selected");
        }

        if (getFoodsForDate(dateKey).length > 0) {
            button.classList.add("has-entries");
        }

        button.setAttribute(
            "aria-label",
            formatDateLong(dateKey)
        );

        elements.calendarGrid.append(button);
    }

    updateCalendarSummary();
}

function renderApp() {
    updateDateLabels();
    renderFoods();
    updateDashboard();
    renderCalendar();
}

function switchView(viewName) {
    currentView = viewName;

    const showDashboard =
        viewName === "dashboard";

    elements.dashboardView.classList.toggle(
        "active",
        showDashboard
    );

    elements.calendarView.classList.toggle(
        "active",
        !showDashboard
    );

    elements.dashboardTab.classList.toggle(
        "active",
        showDashboard
    );

    elements.calendarTab.classList.toggle(
        "active",
        !showDashboard
    );

    if (!showDashboard) {
        calendarMonth = startOfMonth(
            parseDateKey(selectedDateKey)
        );

        renderCalendar();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function selectDate(dateKey, openDashboard = false) {
    selectedDateKey = dateKey;
    calendarMonth = startOfMonth(
        parseDateKey(dateKey)
    );

    renderApp();

    if (openDashboard) {
        switchView("dashboard");
    }
}

function openDialog() {
    elements.formError.textContent = "";
    updateDateLabels();

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

    const foods = [
        food,
        ...getFoodsForDate(selectedDateKey)
    ];

    setFoodsForDate(selectedDateKey, foods);

    saveData();
    closeDialog();
    renderApp();
}

function deleteFood(foodId) {
    const foods = getFoodsForDate(
        selectedDateKey
    ).filter((food) => food.id !== foodId);

    setFoodsForDate(selectedDateKey, foods);

    saveData();
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

function handleCalendarClick(event) {
    const dayButton = event.target.closest(
        ".calendar-day"
    );

    if (!dayButton) {
        return;
    }

    selectedDateKey = dayButton.dataset.dateKey;
    calendarMonth = startOfMonth(
        parseDateKey(selectedDateKey)
    );

    renderApp();
}

function goToToday(openDashboard = false) {
    selectDate(getTodayKey(), openDashboard);
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

elements.dashboardTab.addEventListener(
    "click",
    () => switchView("dashboard")
);

elements.calendarTab.addEventListener(
    "click",
    () => switchView("calendar")
);

elements.openCalendarButton.addEventListener(
    "click",
    () => switchView("calendar")
);

elements.todayButton.addEventListener(
    "click",
    () => goToToday(true)
);

elements.calendarTodayButton.addEventListener(
    "click",
    () => goToToday(false)
);

elements.openSelectedDayButton.addEventListener(
    "click",
    () => switchView("dashboard")
);

elements.previousMonthButton.addEventListener(
    "click",
    () => {
        calendarMonth = addMonths(
            calendarMonth,
            -1
        );

        renderCalendar();
    }
);

elements.nextMonthButton.addEventListener(
    "click",
    () => {
        calendarMonth = addMonths(
            calendarMonth,
            1
        );

        renderCalendar();
    }
);

elements.calendarGrid.addEventListener(
    "click",
    handleCalendarClick
);

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

loadData();
renderApp();
switchView(currentView);
registerServiceWorker();
