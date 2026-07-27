import { MEALS, getMealLabel, matchesFoodSearch } from "./food-model.js";

"use strict";

const STORAGE_KEY = "bodysync-data-v6";
const OLD_STORAGE_KEY = "bodysync-data-v5";

const defaultSettings = {
    displayName: "",
    calorieGoal: 2000,
    proteinGoal: 160,
    targetWeight: 80
};

let appData = createDefaultData();

let selectedDateKey = getTodayKey();
let calendarMonth = startOfMonth(
    parseDateKey(selectedDateKey)
);

let currentView = "dashboard";
let editingFoodId = null;
let editingWeightDateKey = null;
let pendingConfirmationAction = null;
let toastTimer = null;
let foodSearchQuery = "";
let favoritesOnly = false;

const elements = {
    headerDate: document.getElementById("headerDate"),
    profileButton: document.getElementById("profileButton"),

    dashboardView:
        document.getElementById("dashboardView"),
    foodView:
        document.getElementById("foodView"),
    calendarView:
        document.getElementById("calendarView"),
    weightView:
        document.getElementById("weightView"),
    settingsView:
        document.getElementById("settingsView"),

    dashboardTab:
        document.getElementById("dashboardTab"),
    foodTab:
        document.getElementById("foodTab"),
    calendarTab:
        document.getElementById("calendarTab"),
    weightTab:
        document.getElementById("weightTab"),
    settingsTab:
        document.getElementById("settingsTab"),

    summaryTitle:
        document.getElementById("summaryTitle"),
    selectedDateText:
        document.getElementById("selectedDateText"),

    caloriesConsumed:
        document.getElementById("caloriesConsumed"),
    caloriesGoalLabel:
        document.getElementById("caloriesGoalLabel"),
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
    proteinGoalLabel:
        document.getElementById("proteinGoalLabel"),
    proteinPercentage:
        document.getElementById("proteinPercentage"),
    proteinRemaining:
        document.getElementById("proteinRemaining"),
    proteinProgress:
        document.getElementById("proteinProgress"),
    proteinProgressTrack:
        document.getElementById("proteinProgressTrack"),

    dashboardFoodTitle:
        document.getElementById("dashboardFoodTitle"),
    dashboardFoodList:
        document.getElementById("dashboardFoodList"),
    dashboardFoodEmptyState:
        document.getElementById("dashboardFoodEmptyState"),
    dashboardFoodEmptyText:
        document.getElementById("dashboardFoodEmptyText"),
    dashboardAddFoodButton:
        document.getElementById("dashboardAddFoodButton"),
    dashboardEmptyAddButton:
        document.getElementById("dashboardEmptyAddButton"),
    openFoodViewButton:
        document.getElementById("openFoodViewButton"),
    openCalendarButton:
        document.getElementById("openCalendarButton"),

    foodViewTitle:
        document.getElementById("foodViewTitle"),
    foodViewCalories:
        document.getElementById("foodViewCalories"),
    foodViewProtein:
        document.getElementById("foodViewProtein"),
    foodViewCarbs:
        document.getElementById("foodViewCarbs"),
    foodViewFat:
        document.getElementById("foodViewFat"),
    foodViewCount:
        document.getElementById("foodViewCount"),
    foodViewDateButton:
        document.getElementById("foodViewDateButton"),
    foodListTitle:
        document.getElementById("foodListTitle"),
    foodList:
        document.getElementById("foodList"),
    foodSearch:
        document.getElementById("foodSearch"),
    favoritesFilterButton:
        document.getElementById("favoritesFilterButton"),
    foodEmptyState:
        document.getElementById("foodEmptyState"),
    foodEmptyText:
        document.getElementById("foodEmptyText"),
    foodViewAddButton:
        document.getElementById("foodViewAddButton"),
    foodEmptyAddButton:
        document.getElementById("foodEmptyAddButton"),

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
    calendarWeight:
        document.getElementById("calendarWeight"),
    openSelectedDayButton:
        document.getElementById("openSelectedDayButton"),

    currentWeight:
        document.getElementById("currentWeight"),
    currentWeightDate:
        document.getElementById("currentWeightDate"),
    weightDifference:
        document.getElementById("weightDifference"),
    targetWeightDisplay:
        document.getElementById("targetWeightDisplay"),
    targetWeightDifference:
        document.getElementById("targetWeightDifference"),
    lowestWeight:
        document.getElementById("lowestWeight"),
    highestWeight:
        document.getElementById("highestWeight"),
    weightHistoryList:
        document.getElementById("weightHistoryList"),
    weightEmptyState:
        document.getElementById("weightEmptyState"),
    openWeightDialogButton:
        document.getElementById("openWeightDialogButton"),
    weightAddButton:
        document.getElementById("weightAddButton"),
    weightEmptyAddButton:
        document.getElementById("weightEmptyAddButton"),

    settingsGreeting:
        document.getElementById("settingsGreeting"),
    settingsForm:
        document.getElementById("settingsForm"),
    displayName:
        document.getElementById("displayName"),
    calorieGoal:
        document.getElementById("calorieGoal"),
    proteinGoal:
        document.getElementById("proteinGoal"),
    targetWeight:
        document.getElementById("targetWeight"),
    settingsFormError:
        document.getElementById("settingsFormError"),
    settingsFormSuccess:
        document.getElementById("settingsFormSuccess"),

    exportDataButton:
        document.getElementById("exportDataButton"),
    importDataButton:
        document.getElementById("importDataButton"),
    importFileInput:
        document.getElementById("importFileInput"),
    resetDataButton:
        document.getElementById("resetDataButton"),

    foodDialog:
        document.getElementById("foodDialog"),
    foodForm:
        document.getElementById("foodForm"),
    foodDialogDate:
        document.getElementById("foodDialogDate"),
    foodDialogTitle:
        document.getElementById("foodDialogTitle"),
    foodName:
        document.getElementById("foodName"),
    foodCalories:
        document.getElementById("foodCalories"),
    foodProtein:
        document.getElementById("foodProtein"),
    foodCarbs:
        document.getElementById("foodCarbs"),
    foodFat:
        document.getElementById("foodFat"),
    foodMeal:
        document.getElementById("foodMeal"),
    foodFavorite:
        document.getElementById("foodFavorite"),
    foodFormError:
        document.getElementById("foodFormError"),
    closeFoodDialogButton:
        document.getElementById("closeFoodDialogButton"),

    weightDialog:
        document.getElementById("weightDialog"),
    weightForm:
        document.getElementById("weightForm"),
    weightDialogLabel:
        document.getElementById("weightDialogLabel"),
    weightDialogTitle:
        document.getElementById("weightDialogTitle"),
    weightDate:
        document.getElementById("weightDate"),
    weightValue:
        document.getElementById("weightValue"),
    weightFormError:
        document.getElementById("weightFormError"),
    closeWeightDialogButton:
        document.getElementById("closeWeightDialogButton"),

    confirmDialog:
        document.getElementById("confirmDialog"),
    confirmTitle:
        document.getElementById("confirmTitle"),
    confirmMessage:
        document.getElementById("confirmMessage"),
    cancelConfirmButton:
        document.getElementById("cancelConfirmButton"),
    confirmActionButton:
        document.getElementById("confirmActionButton"),

    toast:
        document.getElementById("toast")
};

function createDefaultData() {
    return {
        foodsByDate: {},
        weightsByDate: {},
        settings: {
            ...defaultSettings
        }
    };
}

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
    const [year, month, day] = dateKey
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        day,
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

function isValidDateKey(dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        return false;
    }

    const parsedDate = parseDateKey(dateKey);

    return createDateKey(parsedDate) === dateKey;
}

function capitalize(value) {
    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() +
        value.slice(1);
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

function formatWeight(value) {
    if (!Number.isFinite(value)) {
        return "–";
    }

    return value
        .toFixed(1)
        .replace(".", ",");
}

function formatProtein(value) {
    if (!Number.isFinite(value)) {
        return "0";
    }

    if (Number.isInteger(value)) {
        return value.toString();
    }

    return value
        .toFixed(1)
        .replace(".", ",");
}

function createId() {
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

function sanitizeFoods(foods) {
    if (!Array.isArray(foods)) {
        return [];
    }

    return foods
        .filter((food) => {
            return (
                food &&
                typeof food.id === "string" &&
                typeof food.name === "string" &&
                Number.isFinite(Number(food.calories)) &&
                Number.isFinite(Number(food.protein))
            );
        })
        .map((food) => ({
            id: food.id,
            name: food.name.trim().slice(0, 80),
            calories: Math.max(
                0,
                Math.min(
                    10000,
                    Math.round(Number(food.calories))
                )
            ),
            protein: Math.max(
                0,
                Math.min(
                    1000,
                    Math.round(Number(food.protein) * 10) / 10
                )
            ),
            carbs: Math.max(0, Math.min(2000, Math.round(Number(food.carbs ?? 0) * 10) / 10)),
            fat: Math.max(0, Math.min(1000, Math.round(Number(food.fat ?? 0) * 10) / 10)),
            meal: MEALS.some((meal) => meal.id === food.meal) ? food.meal : "snack",
            favorite: Boolean(food.favorite)
        }))
        .filter((food) => food.name.length > 0);
}

function sanitizeFoodsByDate(foodsByDate) {
    const cleanedData = {};

    if (
        !foodsByDate ||
        typeof foodsByDate !== "object"
    ) {
        return cleanedData;
    }

    Object.entries(foodsByDate).forEach(
        ([dateKey, foods]) => {
            if (!isValidDateKey(dateKey)) {
                return;
            }

            const cleanedFoods = sanitizeFoods(foods);

            if (cleanedFoods.length > 0) {
                cleanedData[dateKey] = cleanedFoods;
            }
        }
    );

    return cleanedData;
}

function sanitizeWeights(weightsByDate) {
    const cleanedData = {};

    if (
        !weightsByDate ||
        typeof weightsByDate !== "object"
    ) {
        return cleanedData;
    }

    Object.entries(weightsByDate).forEach(
        ([dateKey, value]) => {
            const weight = Number(value);

            if (
                isValidDateKey(dateKey) &&
                Number.isFinite(weight) &&
                weight >= 20 &&
                weight <= 500
            ) {
                cleanedData[dateKey] =
                    Math.round(weight * 10) / 10;
            }
        }
    );

    return cleanedData;
}

function sanitizeSettings(settings) {
    const source =
        settings && typeof settings === "object"
            ? settings
            : {};

    const calorieGoal = Number(source.calorieGoal);
    const proteinGoal = Number(source.proteinGoal);
    const targetWeight = Number(source.targetWeight);

    return {
        displayName:
            typeof source.displayName === "string"
                ? source.displayName
                    .trim()
                    .slice(0, 40)
                : "",
        calorieGoal:
            Number.isFinite(calorieGoal) &&
            calorieGoal >= 500 &&
            calorieGoal <= 10000
                ? Math.round(calorieGoal)
                : defaultSettings.calorieGoal,
        proteinGoal:
            Number.isFinite(proteinGoal) &&
            proteinGoal >= 10 &&
            proteinGoal <= 1000
                ? Math.round(proteinGoal)
                : defaultSettings.proteinGoal,
        targetWeight:
            Number.isFinite(targetWeight) &&
            targetWeight >= 20 &&
            targetWeight <= 500
                ? Math.round(targetWeight * 10) / 10
                : defaultSettings.targetWeight
    };
}

function sanitizeAppData(data) {
    const source =
        data && typeof data === "object"
            ? data
            : {};

    return {
        foodsByDate: sanitizeFoodsByDate(
            source.foodsByDate
        ),
        weightsByDate: sanitizeWeights(
            source.weightsByDate
        ),
        settings: sanitizeSettings(
            source.settings
        )
    };
}

function loadData() {
    try {
        const storedValue =
            localStorage.getItem(STORAGE_KEY);

        if (storedValue) {
            appData = sanitizeAppData(
                JSON.parse(storedValue)
            );

            return;
        }

        const oldStoredValue =
            localStorage.getItem(OLD_STORAGE_KEY);

        if (oldStoredValue) {
            appData = sanitizeAppData(
                JSON.parse(oldStoredValue)
            );

            saveData();
            localStorage.removeItem(OLD_STORAGE_KEY);
        }
    } catch (error) {
        console.error(
            "Daten konnten nicht geladen werden:",
            error
        );

        appData = createDefaultData();
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

        showToast(
            "Daten konnten nicht gespeichert werden."
        );
    }
}

function getFoodsForDate(dateKey) {
    const foods = appData.foodsByDate[dateKey];

    return Array.isArray(foods)
        ? foods
        : [];
}

function setFoodsForDate(dateKey, foods) {
    if (foods.length === 0) {
        delete appData.foodsByDate[dateKey];
        return;
    }

    appData.foodsByDate[dateKey] = foods;
}

function getWeightForDate(dateKey) {
    const weight = appData.weightsByDate[dateKey];

    return Number.isFinite(weight)
        ? weight
        : null;
}

function getSortedWeights() {
    return Object.entries(appData.weightsByDate)
        .map(([dateKey, weight]) => ({
            dateKey,
            weight
        }))
        .sort((first, second) =>
            second.dateKey.localeCompare(
                first.dateKey
            )
        );
}

function calculateTotals(foods) {
    return foods.reduce(
        (totals, food) => {
            totals.calories += food.calories;
            totals.protein += food.protein;
            totals.carbs += food.carbs || 0;
            totals.fat += food.fat || 0;

            return totals;
        },
        {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
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

function showToast(message) {
    window.clearTimeout(toastTimer);

    elements.toast.textContent = message;
    elements.toast.classList.add("visible");

    toastTimer = window.setTimeout(() => {
        elements.toast.classList.remove("visible");
    }, 2600);
}

function openDialog(dialog) {
    if (
        typeof dialog.showModal === "function"
    ) {
        dialog.showModal();
    } else {
        dialog.setAttribute("open", "");
    }
}

function closeDialog(dialog) {
    if (dialog.open) {
        dialog.close();
    }
}

function updateProfile() {
    const name = appData.settings.displayName;

    elements.profileButton.textContent = name
        ? name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("")
        : "BS";

    elements.settingsGreeting.textContent = name
        ? `${name}, deine Ziele`
        : "Deine Ziele";
}

function updateDateLabels() {
    const formattedDate = capitalize(
        formatDateShort(selectedDateKey)
    );

    elements.headerDate.textContent =
        isToday(selectedDateKey)
            ? `Heute · ${formattedDate}`
            : formattedDate;

    elements.summaryTitle.textContent =
        isToday(selectedDateKey)
            ? appData.settings.displayName
                ? `Bleib im Rhythmus, ${appData.settings.displayName}`
                : "Bleib heute im Rhythmus"
            : "Dein ausgewählter Tag";

    elements.selectedDateText.textContent =
        isToday(selectedDateKey)
            ? "Deine Werte für heute."
            : `Werte für ${formatDateLong(
                selectedDateKey
            )}.`;

    elements.dashboardFoodTitle.textContent =
        isToday(selectedDateKey)
            ? "Heute gegessen"
            : "Einträge dieses Tages";

    elements.dashboardFoodEmptyText.textContent =
        isToday(selectedDateKey)
            ? "Füge dein erstes Lebensmittel hinzu."
            : "Für diesen Tag sind noch keine Lebensmittel eingetragen.";

    elements.foodViewTitle.textContent =
        isToday(selectedDateKey)
            ? "Essen für heute"
            : `Essen für ${capitalize(
                formatDateShort(selectedDateKey)
            )}`;

    elements.foodListTitle.textContent =
        isToday(selectedDateKey)
            ? "Heutige Einträge"
            : "Einträge dieses Tages";

    elements.foodEmptyText.textContent =
        isToday(selectedDateKey)
            ? "Für heute gibt es noch keine Einträge."
            : "Für diesen Tag gibt es noch keine Einträge.";

    elements.foodDialogDate.textContent =
        capitalize(
            formatDateShort(selectedDateKey)
        );
}

function updateDashboard() {
    const foods = getFoodsForDate(selectedDateKey);
    const totals = calculateTotals(foods);

    const calorieGoal =
        appData.settings.calorieGoal;

    const proteinGoal =
        appData.settings.proteinGoal;

    const caloriePercentage =
        calculatePercentage(
            totals.calories,
            calorieGoal
        );

    const proteinPercentage =
        calculatePercentage(
            totals.protein,
            proteinGoal
        );

    elements.caloriesConsumed.textContent =
        Math.round(totals.calories);

    elements.caloriesGoalLabel.textContent =
        `/ ${calorieGoal} kcal`;

    elements.caloriesPercentage.textContent =
        `${caloriePercentage} %`;

    elements.caloriesProgress.style.width =
        `${caloriePercentage}%`;

    elements.caloriesProgressTrack.setAttribute(
        "aria-valuemax",
        calorieGoal.toString()
    );

    elements.caloriesProgressTrack.setAttribute(
        "aria-valuenow",
        Math.round(totals.calories).toString()
    );

    elements.caloriesRemaining.textContent =
        totals.calories > calorieGoal
            ? `${Math.round(
                totals.calories - calorieGoal
            )} kcal über dem Ziel`
            : `Noch ${Math.round(
                calorieGoal - totals.calories
            )} kcal verfügbar`;

    elements.proteinConsumed.textContent =
        formatProtein(totals.protein);

    elements.proteinGoalLabel.textContent =
        `/ ${proteinGoal} g`;

    elements.proteinPercentage.textContent =
        `${proteinPercentage} %`;

    elements.proteinProgress.style.width =
        `${proteinPercentage}%`;

    elements.proteinProgressTrack.setAttribute(
        "aria-valuemax",
        proteinGoal.toString()
    );

    elements.proteinProgressTrack.setAttribute(
        "aria-valuenow",
        totals.protein.toString()
    );

    elements.proteinRemaining.textContent =
        totals.protein > proteinGoal
            ? `${formatProtein(
                totals.protein - proteinGoal
            )} g über dem Ziel`
            : `Noch ${formatProtein(
                proteinGoal - totals.protein
            )} g verfügbar`;
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

function createEditIcon() {
    return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z"/>
            <path d="m14 7 3 3"/>
        </svg>
    `;
}

function createFoodListItem(food, allowActions) {
    const article = document.createElement("article");
    article.className = "list-item";

    const information =
        document.createElement("div");

    information.className = "item-information";

    const title = document.createElement("h3");
    title.textContent = food.name;

    const details = document.createElement("p");
    details.className = "item-details";

    const calories = document.createElement("span");
    calories.textContent =
        `${food.calories} kcal`;

    const protein = document.createElement("span");
    protein.textContent = `${formatProtein(food.protein)} g Protein`;

    const macros = document.createElement("span");
    macros.textContent = `${formatProtein(food.carbs || 0)} g KH · ${formatProtein(food.fat || 0)} g Fett`;

    const meal = document.createElement("span");
    meal.textContent = `${getMealLabel(food.meal)}${food.favorite ? " · ★ Favorit" : ""}`;

    details.append(calories, protein, macros, meal);
    information.append(title, details);

    article.append(information);

    if (allowActions) {
        const actions =
            document.createElement("div");

        actions.className = "item-actions";

        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.dataset.foodId = food.id;
        editButton.setAttribute(
            "aria-label",
            `${food.name} bearbeiten`
        );
        editButton.innerHTML = createEditIcon();

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.dataset.foodId = food.id;
        deleteButton.setAttribute(
            "aria-label",
            `${food.name} löschen`
        );
        deleteButton.innerHTML =
            createDeleteIcon();

        actions.append(editButton, deleteButton);
        article.append(actions);
    }

    return article;
}

function renderFoods() {
    const foods = getFoodsForDate(selectedDateKey);
    const totals = calculateTotals(foods);
    const visibleFoods = foods.filter((food) => matchesFoodSearch(food, foodSearchQuery, favoritesOnly));

    elements.dashboardFoodList.innerHTML = "";
    elements.foodList.innerHTML = "";

    elements.dashboardFoodEmptyState.classList.toggle("hidden", foods.length > 0);
    elements.foodEmptyState.classList.toggle("hidden", visibleFoods.length > 0);

    foods.forEach((food) => elements.dashboardFoodList.append(createFoodListItem(food, false)));

    MEALS.forEach((meal) => {
        const mealFoods = visibleFoods.filter((food) => food.meal === meal.id);
        if (!mealFoods.length) return;
        const group = document.createElement("section");
        group.className = "meal-group";
        const heading = document.createElement("h3");
        heading.className = "meal-heading";
        heading.textContent = meal.label;
        group.append(heading);
        mealFoods.forEach((food) => group.append(createFoodListItem(food, true)));
        elements.foodList.append(group);
    });

    elements.foodViewCalories.textContent = Math.round(totals.calories);
    elements.foodViewProtein.textContent = formatProtein(totals.protein);
    elements.foodViewCarbs.textContent = formatProtein(totals.carbs);
    elements.foodViewFat.textContent = formatProtein(totals.fat);
    elements.foodViewCount.textContent = foods.length.toString();
}

function getCalendarStart(monthDate) {
    const firstDay = startOfMonth(monthDate);
    const offset =
        (firstDay.getDay() + 6) % 7;

    const start = new Date(firstDay);

    start.setDate(
        firstDay.getDate() - offset
    );

    return start;
}

function updateCalendarSummary() {
    const foods = getFoodsForDate(selectedDateKey);
    const totals = calculateTotals(foods);
    const weight =
        getWeightForDate(selectedDateKey);

    elements.calendarSelectedDate.textContent =
        isToday(selectedDateKey)
            ? "Heute"
            : capitalize(
                formatDateShort(selectedDateKey)
            );

    elements.calendarCalories.textContent =
        Math.round(totals.calories);

    elements.calendarProtein.textContent =
        formatProtein(totals.protein);

    elements.calendarWeight.textContent =
        formatWeight(weight);
}

function renderCalendar() {
    elements.calendarGrid.innerHTML = "";

    elements.calendarMonthTitle.textContent =
        capitalize(
            new Intl.DateTimeFormat("de-DE", {
                month: "long",
                year: "numeric"
            }).format(calendarMonth)
        );

    const calendarStart =
        getCalendarStart(calendarMonth);

    for (
        let index = 0;
        index < 42;
        index += 1
    ) {
        const date = new Date(calendarStart);

        date.setDate(
            calendarStart.getDate() + index
        );

        const dateKey = createDateKey(date);

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "calendar-day";
        button.dataset.dateKey = dateKey;

        const dayNumber =
            document.createElement("span");

        dayNumber.textContent = date.getDate();

        button.append(dayNumber);

        if (
            date.getMonth() !==
            calendarMonth.getMonth()
        ) {
            button.classList.add("outside-month");
        }

        if (dateKey === getTodayKey()) {
            button.classList.add("today");
        }

        if (dateKey === selectedDateKey) {
            button.classList.add("selected");
        }

        const hasFood =
            getFoodsForDate(dateKey).length > 0;

        const hasWeight =
            getWeightForDate(dateKey) !== null;

        if (hasFood || hasWeight) {
            const markers =
                document.createElement("span");

            markers.className = "day-markers";

            if (hasFood) {
                const foodMarker =
                    document.createElement("span");

                foodMarker.className =
                    "day-marker food";

                markers.append(foodMarker);
            }

            if (hasWeight) {
                const weightMarker =
                    document.createElement("span");

                weightMarker.className =
                    "day-marker weight";

                markers.append(weightMarker);
            }

            button.append(markers);
        }

        button.setAttribute(
            "aria-label",
            formatDateLong(dateKey)
        );

        elements.calendarGrid.append(button);
    }

    updateCalendarSummary();
}

function updateWeightDashboard() {
    const entries = getSortedWeights();
    const targetWeight =
        appData.settings.targetWeight;

    elements.weightHistoryList.innerHTML = "";

    elements.weightEmptyState.classList.toggle(
        "hidden",
        entries.length > 0
    );

    elements.targetWeightDisplay.textContent =
        `${formatWeight(targetWeight)} kg`;

    if (entries.length === 0) {
        elements.currentWeight.textContent = "–";

        elements.currentWeightDate.textContent =
            "Noch keine Gewichtsmessung vorhanden.";

        elements.weightDifference.textContent = "–";
        elements.lowestWeight.textContent = "–";
        elements.highestWeight.textContent = "–";

        elements.targetWeightDifference.textContent =
            "Noch keine Messung vorhanden";

        return;
    }

    const latest = entries[0];

    const values = entries.map(
        (entry) => entry.weight
    );

    elements.currentWeight.textContent =
        formatWeight(latest.weight);

    elements.currentWeightDate.textContent =
        `Letzte Messung: ${capitalize(
            formatDateLong(latest.dateKey)
        )}`;

    elements.lowestWeight.textContent =
        `${formatWeight(
            Math.min(...values)
        )} kg`;

    elements.highestWeight.textContent =
        `${formatWeight(
            Math.max(...values)
        )} kg`;

    if (entries.length >= 2) {
        const difference =
            latest.weight - entries[1].weight;

        elements.weightDifference.textContent =
            `${difference > 0 ? "+" : ""}${formatWeight(
                difference
            )} kg`;
    } else {
        elements.weightDifference.textContent = "–";
    }

    const targetDifference =
        latest.weight - targetWeight;

    if (Math.abs(targetDifference) < 0.05) {
        elements.targetWeightDifference.textContent =
            "Ziel erreicht";
    } else if (targetDifference > 0) {
        elements.targetWeightDifference.textContent =
            `${formatWeight(
                targetDifference
            )} kg bis zum Ziel`;
    } else {
        elements.targetWeightDifference.textContent =
            `${formatWeight(
                Math.abs(targetDifference)
            )} kg unter dem Ziel`;
    }

    entries.forEach((entry) => {
        const article =
            document.createElement("article");

        article.className = "list-item";

        const information =
            document.createElement("div");

        information.className =
            "item-information";

        const title =
            document.createElement("h3");

        title.textContent =
            `${formatWeight(entry.weight)} kg`;

        const details =
            document.createElement("p");

        details.className = "item-details";
        details.textContent = capitalize(
            formatDateLong(entry.dateKey)
        );

        information.append(title, details);

        const actions =
            document.createElement("div");

        actions.className = "item-actions";

        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.dataset.weightDate =
            entry.dateKey;

        editButton.setAttribute(
            "aria-label",
            "Gewicht bearbeiten"
        );

        editButton.innerHTML =
            createEditIcon();

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.dataset.weightDate =
            entry.dateKey;

        deleteButton.setAttribute(
            "aria-label",
            "Gewicht löschen"
        );

        deleteButton.innerHTML =
            createDeleteIcon();

        actions.append(
            editButton,
            deleteButton
        );

        article.append(
            information,
            actions
        );

        elements.weightHistoryList.append(
            article
        );
    });
}

function populateSettingsForm() {
    elements.displayName.value =
        appData.settings.displayName;

    elements.calorieGoal.value =
        appData.settings.calorieGoal;

    elements.proteinGoal.value =
        appData.settings.proteinGoal;

    elements.targetWeight.value =
        appData.settings.targetWeight;
}

function renderApp() {
    updateProfile();
    updateDateLabels();
    updateDashboard();
    renderFoods();
    renderCalendar();
    updateWeightDashboard();
    populateSettingsForm();
}

function switchView(viewName) {
    currentView = viewName;

    const views = {
        dashboard: elements.dashboardView,
        food: elements.foodView,
        calendar: elements.calendarView,
        weight: elements.weightView,
        settings: elements.settingsView
    };

    const tabs = {
        dashboard: elements.dashboardTab,
        food: elements.foodTab,
        calendar: elements.calendarTab,
        weight: elements.weightTab,
        settings: elements.settingsTab
    };

    Object.entries(views).forEach(
        ([name, view]) => {
            view.classList.toggle(
                "active",
                name === viewName
            );
        }
    );

    Object.entries(tabs).forEach(
        ([name, tab]) => {
            tab.classList.toggle(
                "active",
                name === viewName
            );
        }
    );

    if (viewName === "calendar") {
        calendarMonth = startOfMonth(
            parseDateKey(selectedDateKey)
        );

        renderCalendar();
    }

    if (viewName === "settings") {
        populateSettingsForm();

        elements.settingsFormError.textContent = "";
        elements.settingsFormSuccess.textContent = "";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function selectDate(
    dateKey,
    openView = null
) {
    if (!isValidDateKey(dateKey)) {
        return;
    }

    selectedDateKey = dateKey;

    calendarMonth = startOfMonth(
        parseDateKey(dateKey)
    );

    renderApp();

    if (openView) {
        switchView(openView);
    }
}

function openFoodCreateDialog() {
    editingFoodId = null;

    elements.foodForm.reset();
    elements.foodMeal.value = "breakfast";
    elements.foodFormError.textContent = "";

    elements.foodDialogTitle.textContent =
        "Lebensmittel hinzufügen";

    updateDateLabels();
    openDialog(elements.foodDialog);

    window.setTimeout(() => {
        elements.foodName.focus();
    }, 100);
}

function openFoodEditDialog(foodId) {
    const food = getFoodsForDate(
        selectedDateKey
    ).find((entry) => entry.id === foodId);

    if (!food) {
        return;
    }

    editingFoodId = foodId;

    elements.foodForm.reset();
    elements.foodFormError.textContent = "";

    elements.foodDialogTitle.textContent =
        "Lebensmittel bearbeiten";

    elements.foodName.value = food.name;
    elements.foodCalories.value = food.calories;
    elements.foodProtein.value = food.protein;
    elements.foodCarbs.value = food.carbs || 0;
    elements.foodFat.value = food.fat || 0;
    elements.foodMeal.value = food.meal || "snack";
    elements.foodFavorite.checked = Boolean(food.favorite);

    updateDateLabels();
    openDialog(elements.foodDialog);

    window.setTimeout(() => {
        elements.foodName.focus();
        elements.foodName.select();
    }, 100);
}

function closeFoodDialog() {
    closeDialog(elements.foodDialog);

    editingFoodId = null;
    elements.foodForm.reset();
    elements.foodFormError.textContent = "";
}

function saveFood(event) {
    event.preventDefault();

    const name =
        elements.foodName.value.trim();

    const calories =
        Number(elements.foodCalories.value);

    const protein = Number(elements.foodProtein.value);
    const carbs = Number(elements.foodCarbs.value);
    const fat = Number(elements.foodFat.value);
    const meal = elements.foodMeal.value;
    const favorite = elements.foodFavorite.checked;

    if (!name) {
        elements.foodFormError.textContent =
            "Bitte gib einen Namen ein.";

        return;
    }

    if (
        !Number.isFinite(calories) ||
        calories < 0 ||
        calories > 10000
    ) {
        elements.foodFormError.textContent =
            "Bitte gib gültige Kalorien ein.";

        return;
    }

    if (
        !Number.isFinite(protein) ||
        protein < 0 ||
        protein > 1000
    ) {
        elements.foodFormError.textContent =
            "Bitte gib einen gültigen Proteinwert ein.";

        return;
    }

    if (!Number.isFinite(carbs) || carbs < 0 || carbs > 2000 || !Number.isFinite(fat) || fat < 0 || fat > 1000) {
        elements.foodFormError.textContent = "Bitte gib gültige Werte für Kohlenhydrate und Fett ein.";
        return;
    }

    if (!MEALS.some((entry) => entry.id === meal)) {
        elements.foodFormError.textContent = "Bitte wähle eine Mahlzeit.";
        return;
    }

    if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) {
        elements.foodFormError.textContent =
            "Kalorien und Protein dürfen nicht beide null sein.";

        return;
    }

    const foods = [
        ...getFoodsForDate(selectedDateKey)
    ];

    if (editingFoodId) {
        const foodIndex = foods.findIndex(
            (food) =>
                food.id === editingFoodId
        );

        if (foodIndex !== -1) {
            foods[foodIndex] = {
                id: editingFoodId,
                name: name.slice(0, 80),
                calories: Math.round(calories),
                protein: Math.round(protein * 10) / 10,
                carbs: Math.round(carbs * 10) / 10,
                fat: Math.round(fat * 10) / 10,
                meal,
                favorite
            };
        }
    } else {
        foods.unshift({
            id: createId(),
            name: name.slice(0, 80),
            calories: Math.round(calories),
            protein: Math.round(protein * 10) / 10,
            carbs: Math.round(carbs * 10) / 10,
            fat: Math.round(fat * 10) / 10,
            meal,
            favorite
        });
    }

    setFoodsForDate(selectedDateKey, foods);

    saveData();
    closeFoodDialog();
    renderApp();

    showToast(
        editingFoodId
            ? "Lebensmittel wurde aktualisiert."
            : "Lebensmittel wurde gespeichert."
    );
}

function requestFoodDelete(foodId) {
    const food = getFoodsForDate(
        selectedDateKey
    ).find((entry) => entry.id === foodId);

    if (!food) {
        return;
    }

    openConfirmation({
        title: "Lebensmittel löschen?",
        message:
            `"${food.name}" wird dauerhaft aus diesem Tag entfernt.`,
        actionLabel: "Löschen",
        action: () => {
            const foods = getFoodsForDate(
                selectedDateKey
            ).filter((entry) => entry.id !== foodId);

            setFoodsForDate(
                selectedDateKey,
                foods
            );

            saveData();
            renderApp();
            showToast(
                "Lebensmittel wurde gelöscht."
            );
        }
    });
}

function openWeightCreateDialog() {
    editingWeightDateKey = null;

    elements.weightForm.reset();
    elements.weightFormError.textContent = "";

    elements.weightDialogLabel.textContent =
        "Neue Messung";

    elements.weightDialogTitle.textContent =
        "Gewicht eintragen";

    elements.weightDate.value =
        selectedDateKey;

    openDialog(elements.weightDialog);

    window.setTimeout(() => {
        elements.weightValue.focus();
    }, 100);
}

function openWeightEditDialog(dateKey) {
    const weight = getWeightForDate(dateKey);

    if (weight === null) {
        return;
    }

    editingWeightDateKey = dateKey;

    elements.weightForm.reset();
    elements.weightFormError.textContent = "";

    elements.weightDialogLabel.textContent =
        "Messung bearbeiten";

    elements.weightDialogTitle.textContent =
        "Gewicht ändern";

    elements.weightDate.value = dateKey;
    elements.weightValue.value = weight;

    openDialog(elements.weightDialog);

    window.setTimeout(() => {
        elements.weightValue.focus();
        elements.weightValue.select();
    }, 100);
}

function closeWeightDialog() {
    closeDialog(elements.weightDialog);

    editingWeightDateKey = null;
    elements.weightForm.reset();
    elements.weightFormError.textContent = "";
}

function saveWeight(event) {
    event.preventDefault();

    const dateKey =
        elements.weightDate.value;

    const weight =
        Number(elements.weightValue.value);

    if (!isValidDateKey(dateKey)) {
        elements.weightFormError.textContent =
            "Bitte wähle ein gültiges Datum.";

        return;
    }

    if (
        !Number.isFinite(weight) ||
        weight < 20 ||
        weight > 500
    ) {
        elements.weightFormError.textContent =
            "Bitte gib ein Gewicht zwischen 20 und 500 kg ein.";

        return;
    }

    if (
        editingWeightDateKey &&
        editingWeightDateKey !== dateKey
    ) {
        delete appData.weightsByDate[
            editingWeightDateKey
        ];
    }

    appData.weightsByDate[dateKey] =
        Math.round(weight * 10) / 10;

    saveData();
    closeWeightDialog();
    renderApp();

    showToast(
        "Gewicht wurde gespeichert."
    );
}

function requestWeightDelete(dateKey) {
    const weight = getWeightForDate(dateKey);

    if (weight === null) {
        return;
    }

    openConfirmation({
        title: "Messung löschen?",
        message:
            `Die Messung mit ${formatWeight(weight)} kg vom ${formatDateLong(dateKey)} wird gelöscht.`,
        actionLabel: "Löschen",
        action: () => {
            delete appData.weightsByDate[dateKey];

            saveData();
            renderApp();

            showToast(
                "Gewichtsmessung wurde gelöscht."
            );
        }
    });
}

function saveSettings(event) {
    event.preventDefault();

    const displayName =
        elements.displayName.value.trim();

    const calorieGoal =
        Number(elements.calorieGoal.value);

    const proteinGoal =
        Number(elements.proteinGoal.value);

    const targetWeight =
        Number(elements.targetWeight.value);

    elements.settingsFormError.textContent = "";
    elements.settingsFormSuccess.textContent = "";

    if (
        !Number.isFinite(calorieGoal) ||
        calorieGoal < 500 ||
        calorieGoal > 10000
    ) {
        elements.settingsFormError.textContent =
            "Das Kalorienziel muss zwischen 500 und 10.000 kcal liegen.";

        return;
    }

    if (
        !Number.isFinite(proteinGoal) ||
        proteinGoal < 10 ||
        proteinGoal > 1000
    ) {
        elements.settingsFormError.textContent =
            "Das Proteinziel muss zwischen 10 und 1.000 g liegen.";

        return;
    }

    if (
        !Number.isFinite(targetWeight) ||
        targetWeight < 20 ||
        targetWeight > 500
    ) {
        elements.settingsFormError.textContent =
            "Das Zielgewicht muss zwischen 20 und 500 kg liegen.";

        return;
    }

    appData.settings = {
        displayName:
            displayName.slice(0, 40),
        calorieGoal:
            Math.round(calorieGoal),
        proteinGoal:
            Math.round(proteinGoal),
        targetWeight:
            Math.round(targetWeight * 10) / 10
    };

    saveData();
    renderApp();

    elements.settingsFormSuccess.textContent =
        "Einstellungen wurden gespeichert.";

    showToast(
        "Einstellungen wurden gespeichert."
    );
}

function exportData() {
    const exportContent = {
        app: "BodySync",
        version: "1.1",
        exportedAt:
            new Date().toISOString(),
        data: appData
    };

    const blob = new Blob(
        [
            JSON.stringify(
                exportContent,
                null,
                2
            )
        ],
        {
            type: "application/json"
        }
    );

    const objectUrl =
        URL.createObjectURL(blob);

    const downloadLink =
        document.createElement("a");

    downloadLink.href = objectUrl;
    downloadLink.download =
        `bodysync-backup-${getTodayKey()}.json`;

    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(objectUrl);

    showToast(
        "BodySync-Datensicherung wurde erstellt."
    );
}

async function importData(event) {
    const file = event.target.files[0];

    event.target.value = "";

    if (!file) {
        return;
    }

    try {
        const fileText = await file.text();
        const parsedFile = JSON.parse(fileText);

        const sourceData =
            parsedFile &&
            parsedFile.app === "BodySync" &&
            parsedFile.data
                ? parsedFile.data
                : parsedFile;

        const importedData =
            sanitizeAppData(sourceData);

        openConfirmation({
            title: "Daten importieren?",
            message:
                "Die aktuellen Daten auf diesem Gerät werden durch die importierte Sicherung ersetzt.",
            actionLabel: "Importieren",
            action: () => {
                appData = importedData;

                selectedDateKey = getTodayKey();
                calendarMonth = startOfMonth(
                    parseDateKey(selectedDateKey)
                );

                saveData();
                renderApp();
                switchView("dashboard");

                showToast(
                    "BodySync-Daten wurden importiert."
                );
            }
        });
    } catch (error) {
        console.error(
            "Import fehlgeschlagen:",
            error
        );

        showToast(
            "Die Datei konnte nicht importiert werden."
        );
    }
}

function requestDataReset() {
    openConfirmation({
        title: "Alle Daten löschen?",
        message:
            "Alle Lebensmittel, Gewichtsmessungen und persönlichen Einstellungen werden dauerhaft entfernt.",
        actionLabel: "Alles löschen",
        action: () => {
            appData = createDefaultData();

            selectedDateKey = getTodayKey();
            calendarMonth = startOfMonth(
                parseDateKey(selectedDateKey)
            );

            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(OLD_STORAGE_KEY);

            saveData();
            renderApp();
            switchView("dashboard");

            showToast(
                "Alle BodySync-Daten wurden gelöscht."
            );
        }
    });
}

function openConfirmation({
    title,
    message,
    actionLabel,
    action
}) {
    pendingConfirmationAction = action;

    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    elements.confirmActionButton.textContent =
        actionLabel;

    openDialog(elements.confirmDialog);
}

function closeConfirmation() {
    closeDialog(elements.confirmDialog);
    pendingConfirmationAction = null;
}

function confirmPendingAction() {
    const action = pendingConfirmationAction;

    closeConfirmation();

    if (typeof action === "function") {
        action();
    }
}

function handleFoodListClick(event) {
    const editButton =
        event.target.closest(".edit-button");

    if (
        editButton &&
        editButton.dataset.foodId
    ) {
        openFoodEditDialog(
            editButton.dataset.foodId
        );

        return;
    }

    const deleteButton =
        event.target.closest(".delete-button");

    if (
        deleteButton &&
        deleteButton.dataset.foodId
    ) {
        requestFoodDelete(
            deleteButton.dataset.foodId
        );
    }
}

function handleWeightListClick(event) {
    const editButton =
        event.target.closest(".edit-button");

    if (
        editButton &&
        editButton.dataset.weightDate
    ) {
        openWeightEditDialog(
            editButton.dataset.weightDate
        );

        return;
    }

    const deleteButton =
        event.target.closest(".delete-button");

    if (
        deleteButton &&
        deleteButton.dataset.weightDate
    ) {
        requestWeightDelete(
            deleteButton.dataset.weightDate
        );
    }
}

function handleCalendarClick(event) {
    const dayButton =
        event.target.closest(".calendar-day");

    if (!dayButton) {
        return;
    }

    selectDate(
        dayButton.dataset.dateKey
    );
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

elements.foodTab.addEventListener(
    "click",
    () => switchView("food")
);

elements.calendarTab.addEventListener(
    "click",
    () => switchView("calendar")
);

elements.weightTab.addEventListener(
    "click",
    () => switchView("weight")
);

elements.settingsTab.addEventListener(
    "click",
    () => switchView("settings")
);

elements.profileButton.addEventListener(
    "click",
    () => switchView("settings")
);

elements.openFoodViewButton.addEventListener(
    "click",
    () => switchView("food")
);

elements.openCalendarButton.addEventListener(
    "click",
    () => switchView("calendar")
);

elements.foodViewDateButton.addEventListener(
    "click",
    () => switchView("calendar")
);

elements.openSelectedDayButton.addEventListener(
    "click",
    () => switchView("dashboard")
);

elements.calendarTodayButton.addEventListener(
    "click",
    () => selectDate(getTodayKey())
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

elements.dashboardAddFoodButton.addEventListener(
    "click",
    openFoodCreateDialog
);

elements.dashboardEmptyAddButton.addEventListener(
    "click",
    openFoodCreateDialog
);

elements.foodViewAddButton.addEventListener(
    "click",
    openFoodCreateDialog
);

elements.foodEmptyAddButton.addEventListener(
    "click",
    openFoodCreateDialog
);

elements.closeFoodDialogButton.addEventListener(
    "click",
    closeFoodDialog
);

elements.foodForm.addEventListener(
    "submit",
    saveFood
);


elements.foodSearch.addEventListener("input", () => {
    foodSearchQuery = elements.foodSearch.value;
    renderFoods();
});

elements.favoritesFilterButton.addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    elements.favoritesFilterButton.classList.toggle("active", favoritesOnly);
    elements.favoritesFilterButton.setAttribute("aria-pressed", String(favoritesOnly));
    renderFoods();
});
elements.foodList.addEventListener(
    "click",
    handleFoodListClick
);

elements.foodDialog.addEventListener(
    "click",
    (event) => {
        if (
            event.target === elements.foodDialog
        ) {
            closeFoodDialog();
        }
    }
);

elements.openWeightDialogButton.addEventListener(
    "click",
    openWeightCreateDialog
);

elements.weightAddButton.addEventListener(
    "click",
    openWeightCreateDialog
);

elements.weightEmptyAddButton.addEventListener(
    "click",
    openWeightCreateDialog
);

elements.closeWeightDialogButton.addEventListener(
    "click",
    closeWeightDialog
);

elements.weightForm.addEventListener(
    "submit",
    saveWeight
);

elements.weightHistoryList.addEventListener(
    "click",
    handleWeightListClick
);

elements.weightDialog.addEventListener(
    "click",
    (event) => {
        if (
            event.target === elements.weightDialog
        ) {
            closeWeightDialog();
        }
    }
);

elements.settingsForm.addEventListener(
    "submit",
    saveSettings
);

elements.exportDataButton.addEventListener(
    "click",
    exportData
);

elements.importDataButton.addEventListener(
    "click",
    () => elements.importFileInput.click()
);

elements.importFileInput.addEventListener(
    "change",
    importData
);

elements.resetDataButton.addEventListener(
    "click",
    requestDataReset
);

elements.cancelConfirmButton.addEventListener(
    "click",
    closeConfirmation
);

elements.confirmActionButton.addEventListener(
    "click",
    confirmPendingAction
);

elements.confirmDialog.addEventListener(
    "click",
    (event) => {
        if (
            event.target === elements.confirmDialog
        ) {
            closeConfirmation();
        }
    }
);

loadData();
renderApp();
switchView(currentView);
registerServiceWorker();
