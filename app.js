"use strict";

const STORAGE_KEY = "bodysync-data-v4";
const OLD_STORAGE_KEY = "bodysync-data-v3";

const defaultSettings = {
    displayName: "",
    calorieGoal: 2000,
    proteinGoal: 160,
    targetWeight: 80
};

let appData = {
    foodsByDate: {},
    weightsByDate: {},
    settings: { ...defaultSettings }
};

let selectedDateKey = getTodayKey();
let calendarMonth = startOfMonth(parseDateKey(selectedDateKey));
let currentView = "dashboard";
let editingWeightDateKey = null;

const elements = {
    headerDate: document.getElementById("headerDate"),
    profileButton: document.getElementById("profileButton"),

    dashboardView: document.getElementById("dashboardView"),
    calendarView: document.getElementById("calendarView"),
    weightView: document.getElementById("weightView"),
    settingsView: document.getElementById("settingsView"),

    dashboardTab: document.getElementById("dashboardTab"),
    calendarTab: document.getElementById("calendarTab"),
    weightTab: document.getElementById("weightTab"),
    settingsTab: document.getElementById("settingsTab"),

    summaryTitle: document.getElementById("summaryTitle"),
    selectedDateText: document.getElementById("selectedDateText"),
    foodSectionTitle: document.getElementById("foodSectionTitle"),
    foodEmptyText: document.getElementById("foodEmptyText"),
    openCalendarButton: document.getElementById("openCalendarButton"),

    caloriesConsumed: document.getElementById("caloriesConsumed"),
    caloriesGoalLabel: document.getElementById("caloriesGoalLabel"),
    caloriesPercentage: document.getElementById("caloriesPercentage"),
    caloriesRemaining: document.getElementById("caloriesRemaining"),
    caloriesProgress: document.getElementById("caloriesProgress"),
    caloriesProgressTrack:
        document.getElementById("caloriesProgressTrack"),

    proteinConsumed: document.getElementById("proteinConsumed"),
    proteinGoalLabel: document.getElementById("proteinGoalLabel"),
    proteinPercentage: document.getElementById("proteinPercentage"),
    proteinRemaining: document.getElementById("proteinRemaining"),
    proteinProgress: document.getElementById("proteinProgress"),
    proteinProgressTrack:
        document.getElementById("proteinProgressTrack"),

    foodList: document.getElementById("foodList"),
    foodEmptyState: document.getElementById("foodEmptyState"),
    openFoodDialog: document.getElementById("openFoodDialog"),
    foodEmptyAddButton:
        document.getElementById("foodEmptyAddButton"),

    calendarMonthTitle:
        document.getElementById("calendarMonthTitle"),
    calendarGrid: document.getElementById("calendarGrid"),
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

    currentWeight: document.getElementById("currentWeight"),
    currentWeightDate:
        document.getElementById("currentWeightDate"),
    weightDifference:
        document.getElementById("weightDifference"),
    targetWeightDisplay:
        document.getElementById("targetWeightDisplay"),
    targetWeightDifference:
        document.getElementById("targetWeightDifference"),
    lowestWeight: document.getElementById("lowestWeight"),
    highestWeight: document.getElementById("highestWeight"),
    weightHistoryList:
        document.getElementById("weightHistoryList"),
    weightEmptyState:
        document.getElementById("weightEmptyState"),
    openWeightDialog:
        document.getElementById("openWeightDialog"),
    openWeightDialogSecondary:
        document.getElementById("openWeightDialogSecondary"),
    weightEmptyAddButton:
        document.getElementById("weightEmptyAddButton"),

    settingsGreeting:
        document.getElementById("settingsGreeting"),
    settingsForm: document.getElementById("settingsForm"),
    displayName: document.getElementById("displayName"),
    calorieGoal: document.getElementById("calorieGoal"),
    proteinGoal: document.getElementById("proteinGoal"),
    targetWeight: document.getElementById("targetWeight"),
    settingsFormError:
        document.getElementById("settingsFormError"),
    settingsFormSuccess:
        document.getElementById("settingsFormSuccess"),

    foodDialog: document.getElementById("foodDialog"),
    foodForm: document.getElementById("foodForm"),
    foodDialogDate: document.getElementById("foodDialogDate"),
    foodName: document.getElementById("foodName"),
    foodCalories: document.getElementById("foodCalories"),
    foodProtein: document.getElementById("foodProtein"),
    foodFormError: document.getElementById("foodFormError"),
    closeFoodDialog:
        document.getElementById("closeFoodDialog"),

    weightDialog: document.getElementById("weightDialog"),
    weightForm: document.getElementById("weightForm"),
    weightDialogLabel:
        document.getElementById("weightDialogLabel"),
    weightDialogTitle:
        document.getElementById("weightDialogTitle"),
    weightDate: document.getElementById("weightDate"),
    weightValue: document.getElementById("weightValue"),
    weightFormError:
        document.getElementById("weightFormError"),
    closeWeightDialog:
        document.getElementById("closeWeightDialog")
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
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day, 12, 0, 0);
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
    return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

function capitalize(value) {
    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
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

    return value.toFixed(1).replace(".", ",");
}

function formatProtein(value) {
    if (Number.isInteger(value)) {
        return value.toString();
    }

    return value.toFixed(1).replace(".", ",");
}

function createId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeFoods(foods) {
    if (!Array.isArray(foods)) {
        return [];
    }

    return foods
        .filter((food) =>
            food &&
            typeof food.id === "string" &&
            typeof food.name === "string" &&
            Number.isFinite(food.calories) &&
            Number.isFinite(food.protein)
        )
        .map((food) => ({
            id: food.id,
            name: food.name.trim(),
            calories: Math.max(0, Math.round(food.calories)),
            protein: Math.max(
                0,
                Math.round(food.protein * 10) / 10
            )
        }));
}

function sanitizeWeights(weights) {
    const cleaned = {};

    if (!weights || typeof weights !== "object") {
        return cleaned;
    }

    Object.entries(weights).forEach(([dateKey, value]) => {
        const weight = Number(value);

        if (
            isValidDateKey(dateKey) &&
            Number.isFinite(weight) &&
            weight >= 20 &&
            weight <= 500
        ) {
            cleaned[dateKey] = Math.round(weight * 10) / 10;
        }
    });

    return cleaned;
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
                ? source.displayName.trim().slice(0, 40)
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

function sanitizeFoodsByDate(foodsByDate) {
    const cleaned = {};

    if (!foodsByDate || typeof foodsByDate !== "object") {
        return cleaned;
    }

    Object.entries(foodsByDate).forEach(([dateKey, foods]) => {
        const validFoods = sanitizeFoods(foods);

        if (isValidDateKey(dateKey) && validFoods.length > 0) {
            cleaned[dateKey] = validFoods;
        }
    });

    return cleaned;
}

function migrateOldData() {
    const oldValue = localStorage.getItem(OLD_STORAGE_KEY);

    if (!oldValue) {
        return false;
    }

    try {
        const oldData = JSON.parse(oldValue);

        appData = {
            foodsByDate: sanitizeFoodsByDate(
                oldData.foodsByDate
            ),
            weightsByDate: sanitizeWeights(
                oldData.weightsByDate
            ),
            settings: { ...defaultSettings }
        };

        localStorage.removeItem(OLD_STORAGE_KEY);

        return true;
    } catch (error) {
        console.error("Migration fehlgeschlagen:", error);
        return false;
    }
}

function loadData() {
    try {
        const storedValue = localStorage.getItem(STORAGE_KEY);

        if (storedValue) {
            const storedData = JSON.parse(storedValue);

            appData = {
                foodsByDate: sanitizeFoodsByDate(
                    storedData.foodsByDate
                ),
                weightsByDate: sanitizeWeights(
                    storedData.weightsByDate
                ),
                settings: sanitizeSettings(
                    storedData.settings
                )
            };

            return;
        }

        if (migrateOldData()) {
            saveData();
        }
    } catch (error) {
        console.error("Daten konnten nicht geladen werden:", error);

        appData = {
            foodsByDate: {},
            weightsByDate: {},
            settings: { ...defaultSettings }
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
        console.error("Daten konnten nicht gespeichert werden:", error);
    }
}

function getFoodsForDate(dateKey) {
    return Array.isArray(appData.foodsByDate[dateKey])
        ? appData.foodsByDate[dateKey]
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

    return Number.isFinite(weight) ? weight : null;
}

function getSortedWeights() {
    return Object.entries(appData.weightsByDate)
        .map(([dateKey, weight]) => ({
            dateKey,
            weight
        }))
        .sort((first, second) =>
            second.dateKey.localeCompare(first.dateKey)
        );
}

function calculateTotals(foods) {
    return foods.reduce(
        (totals, food) => ({
            calories: totals.calories + food.calories,
            protein: totals.protein + food.protein
        }),
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

function updateProfile() {
    const name = appData.settings.displayName;

    elements.profileButton.textContent = name
        ? name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
        : "BS";

    elements.settingsGreeting.textContent = name
        ? `${name}, deine Ziele`
        : "Deine Ziele";
}

function updateDateLabels() {
    const shortDate = capitalize(
        formatDateShort(selectedDateKey)
    );

    elements.headerDate.textContent = isToday(selectedDateKey)
        ? `Heute · ${shortDate}`
        : shortDate;

    elements.summaryTitle.textContent = isToday(selectedDateKey)
        ? appData.settings.displayName
            ? `Bleib im Rhythmus, ${appData.settings.displayName}`
            : "Bleib heute im Rhythmus"
        : "Dein ausgewählter Tag";

    elements.selectedDateText.textContent = isToday(selectedDateKey)
        ? "Deine Werte für heute."
        : `Werte für ${formatDateLong(selectedDateKey)}.`;

    elements.foodSectionTitle.textContent = isToday(selectedDateKey)
        ? "Heute gegessen"
        : "Einträge dieses Tages";

    elements.foodEmptyText.textContent = isToday(selectedDateKey)
        ? "Füge dein erstes Lebensmittel hinzu."
        : "Für diesen Tag sind noch keine Lebensmittel eingetragen.";

    elements.foodDialogDate.textContent = capitalize(
        formatDateShort(selectedDateKey)
    );
}

function updateDashboard() {
    const foods = getFoodsForDate(selectedDateKey);
    const totals = calculateTotals(foods);
    const calorieGoal = appData.settings.calorieGoal;
    const proteinGoal = appData.settings.proteinGoal;

    const caloriePercentage = calculatePercentage(
        totals.calories,
        calorieGoal
    );

    const proteinPercentage = calculatePercentage(
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

function deleteIcon() {
    return `
        <svg viewBox="0 0 24 24">
            <path d="M4 7h16"/>
            <path d="M9 7V4h6v3"/>
            <path d="M7 7l1 13h8l1-13"/>
            <path d="M10 11v5M14 11v5"/>
        </svg>
    `;
}

function editIcon() {
    return `
        <svg viewBox="0 0 24 24">
            <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z"/>
            <path d="m14 7 3 3"/>
        </svg>
    `;
}

function renderFoods() {
    const foods = getFoodsForDate(selectedDateKey);

    elements.foodList.innerHTML = "";

    elements.foodEmptyState.classList.toggle(
        "hidden",
        foods.length > 0
    );

    foods.forEach((food) => {
        const article = document.createElement("article");
        article.className = "list-item";

        const information = document.createElement("div");
        information.className = "item-information";

        const title = document.createElement("h3");
        title.textContent = food.name;

        const details = document.createElement("p");
        details.className = "item-details";

        const calories = document.createElement("span");
        calories.textContent = `${food.calories} kcal`;

        const protein = document.createElement("span");
        protein.textContent =
            `${formatProtein(food.protein)} g Protein`;

        details.append(calories, protein);
        information.append(title, details);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.dataset.foodId = food.id;
        deleteButton.setAttribute(
            "aria-label",
            `${food.name} löschen`
        );
        deleteButton.innerHTML = deleteIcon();

        article.append(information, deleteButton);
        elements.foodList.append(article);
    });
}

function getCalendarStart(monthDate) {
    const firstDay = startOfMonth(monthDate);
    const offset = (firstDay.getDay() + 6) % 7;
    const start = new Date(firstDay);

    start.setDate(firstDay.getDate() - offset);

    return start;
}

function updateCalendarSummary() {
    const foods = getFoodsForDate(selectedDateKey);
    const totals = calculateTotals(foods);
    const weight = getWeightForDate(selectedDateKey);

    elements.calendarSelectedDate.textContent =
        isToday(selectedDateKey)
            ? "Heute"
            : capitalize(formatDateShort(selectedDateKey));

    elements.calendarCalories.textContent =
        Math.round(totals.calories);

    elements.calendarProtein.textContent =
        formatProtein(totals.protein);

    elements.calendarWeight.textContent =
        formatWeight(weight);
}

function renderCalendar() {
    elements.calendarGrid.innerHTML = "";

    elements.calendarMonthTitle.textContent = capitalize(
        new Intl.DateTimeFormat("de-DE", {
            month: "long",
            year: "numeric"
        }).format(calendarMonth)
    );

    const calendarStart = getCalendarStart(calendarMonth);

    for (let index = 0; index < 42; index += 1) {
        const date = new Date(calendarStart);
        date.setDate(calendarStart.getDate() + index);

        const dateKey = createDateKey(date);
        const button = document.createElement("button");

        button.type = "button";
        button.className = "calendar-day";
        button.dataset.dateKey = dateKey;

        const dayNumber = document.createElement("span");
        dayNumber.textContent = date.getDate();

        button.append(dayNumber);

        if (date.getMonth() !== calendarMonth.getMonth()) {
            button.classList.add("outside-month");
        }

        if (dateKey === getTodayKey()) {
            button.classList.add("today");
        }

        if (dateKey === selectedDateKey) {
            button.classList.add("selected");
        }

        const hasFood = getFoodsForDate(dateKey).length > 0;
        const hasWeight = getWeightForDate(dateKey) !== null;

        if (hasFood || hasWeight) {
            const markers = document.createElement("span");
            markers.className = "day-markers";

            if (hasFood) {
                const marker = document.createElement("span");
                marker.className = "day-marker food";
                markers.append(marker);
            }

            if (hasWeight) {
                const marker = document.createElement("span");
                marker.className = "day-marker weight";
                markers.append(marker);
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
    const targetWeight = appData.settings.targetWeight;

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
    const values = entries.map((entry) => entry.weight);

    elements.currentWeight.textContent =
        formatWeight(latest.weight);

    elements.currentWeightDate.textContent =
        `Letzte Messung: ${capitalize(
            formatDateLong(latest.dateKey)
        )}`;

    elements.lowestWeight.textContent =
        `${formatWeight(Math.min(...values))} kg`;

    elements.highestWeight.textContent =
        `${formatWeight(Math.max(...values))} kg`;

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
            `${formatWeight(targetDifference)} kg bis zum Ziel`;
    } else {
        elements.targetWeightDifference.textContent =
            `${formatWeight(
                Math.abs(targetDifference)
            )} kg unter dem Ziel`;
    }

    entries.forEach((entry) => {
        const article = document.createElement("article");
        article.className = "list-item";

        const information = document.createElement("div");
        information.className = "item-information";

        const title = document.createElement("h3");
        title.textContent =
            `${formatWeight(entry.weight)} kg`;

        const details = document.createElement("p");
        details.className = "item-details";
        details.textContent = capitalize(
            formatDateLong(entry.dateKey)
        );

        information.append(title, details);

        const actions = document.createElement("div");
        actions.className = "item-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.dataset.weightDate = entry.dateKey;
        editButton.setAttribute(
            "aria-label",
            "Gewicht bearbeiten"
        );
        editButton.innerHTML = editIcon();

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.dataset.weightDate = entry.dateKey;
        deleteButton.setAttribute(
            "aria-label",
            "Gewicht löschen"
        );
        deleteButton.innerHTML = deleteIcon();

        actions.append(editButton, deleteButton);
        article.append(information, actions);
        elements.weightHistoryList.append(article);
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
        calendar: elements.calendarView,
        weight: elements.weightView,
        settings: elements.settingsView
    };

    const tabs = {
        dashboard: elements.dashboardTab,
        calendar: elements.calendarTab,
        weight: elements.weightTab,
        settings: elements.settingsTab
    };

    Object.entries(views).forEach(([name, view]) => {
        view.classList.toggle("active", name === viewName);
    });

    Object.entries(tabs).forEach(([name, tab]) => {
        tab.classList.toggle("active", name === viewName);
    });

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

function selectDate(dateKey, openDashboard = false) {
    selectedDateKey = dateKey;
    calendarMonth = startOfMonth(parseDateKey(dateKey));

    renderApp();

    if (openDashboard) {
        switchView("dashboard");
    }
}

function openDialog(dialog) {
    if (typeof dialog.showModal === "function") {
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

function openFoodDialog() {
    elements.foodForm.reset();
    elements.foodFormError.textContent = "";
    updateDateLabels();
    openDialog(elements.foodDialog);

    window.setTimeout(() => {
        elements.foodName.focus();
    }, 100);
}

function closeFoodDialog() {
    closeDialog(elements.foodDialog);
    elements.foodForm.reset();
    elements.foodFormError.textContent = "";
}

function saveFood(event) {
    event.preventDefault();

    const name = elements.foodName.value.trim();
    const calories = Number(elements.foodCalories.value);
    const protein = Number(elements.foodProtein.value);

    if (!name) {
        elements.foodFormError.textContent =
            "Bitte gib einen Namen ein.";
        return;
    }

    if (
        !Number.isFinite(calories) ||
        calories < 0 ||
        !Number.isFinite(protein) ||
        protein < 0
    ) {
        elements.foodFormError.textContent =
            "Bitte prüfe Kalorien und Protein.";
        return;
    }

    if (calories === 0 && protein === 0) {
        elements.foodFormError.textContent =
            "Kalorien und Protein dürfen nicht beide null sein.";
        return;
    }

    const food = {
        id: createId(),
        name,
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10
    };

    setFoodsForDate(selectedDateKey, [
        food,
        ...getFoodsForDate(selectedDateKey)
    ]);

    saveData();
    closeFoodDialog();
    renderApp();
}

function deleteFood(foodId) {
    const foods = getFoodsForDate(selectedDateKey).filter(
        (food) => food.id !== foodId
    );

    setFoodsForDate(selectedDateKey, foods);
    saveData();
    renderApp();
}

function openWeightDialog(dateKey = getTodayKey()) {
    editingWeightDateKey = null;

    elements.weightForm.reset();
    elements.weightFormError.textContent = "";
    elements.weightDialogLabel.textContent =
        "Neue Messung";
    elements.weightDialogTitle.textContent =
        "Gewicht eintragen";
    elements.weightDate.value = dateKey;

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

    const dateKey = elements.weightDate.value;
    const weight = Number(elements.weightValue.value);

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
        delete appData.weightsByDate[editingWeightDateKey];
    }

    appData.weightsByDate[dateKey] =
        Math.round(weight * 10) / 10;

    saveData();
    closeWeightDialog();
    renderApp();
}

function deleteWeight(dateKey) {
    delete appData.weightsByDate[dateKey];
    saveData();
    renderApp();
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
        displayName: displayName.slice(0, 40),
        calorieGoal: Math.round(calorieGoal),
        proteinGoal: Math.round(proteinGoal),
        targetWeight:
            Math.round(targetWeight * 10) / 10
    };

    saveData();
    renderApp();

    elements.settingsFormSuccess.textContent =
        "Einstellungen wurden gespeichert.";
}

function handleCalendarClick(event) {
    const button = event.target.closest(".calendar-day");

    if (!button) {
        return;
    }

    selectedDateKey = button.dataset.dateKey;
    calendarMonth = startOfMonth(
        parseDateKey(selectedDateKey)
    );

    renderApp();
}

function handleFoodListClick(event) {
    const button = event.target.closest(".delete-button");

    if (!button || !button.dataset.foodId) {
        return;
    }

    deleteFood(button.dataset.foodId);
}

function handleWeightListClick(event) {
    const editButton = event.target.closest(".edit-button");

    if (editButton) {
        openWeightEditDialog(
            editButton.dataset.weightDate
        );
        return;
    }

    const deleteButton = event.target.closest(".delete-button");

    if (deleteButton) {
        deleteWeight(deleteButton.dataset.weightDate);
    }
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

elements.openCalendarButton.addEventListener(
    "click",
    () => switchView("calendar")
);

elements.calendarTodayButton.addEventListener(
    "click",
    () => selectDate(getTodayKey())
);

elements.openSelectedDayButton.addEventListener(
    "click",
    () => switchView("dashboard")
);

elements.previousMonthButton.addEventListener(
    "click",
    () => {
        calendarMonth = addMonths(calendarMonth, -1);
        renderCalendar();
    }
);

elements.nextMonthButton.addEventListener(
    "click",
    () => {
        calendarMonth = addMonths(calendarMonth, 1);
        renderCalendar();
    }
);

elements.calendarGrid.addEventListener(
    "click",
    handleCalendarClick
);

elements.openFoodDialog.addEventListener(
    "click",
    openFoodDialog
);

elements.foodEmptyAddButton.addEventListener(
    "click",
    openFoodDialog
);

elements.closeFoodDialog.addEventListener(
    "click",
    closeFoodDialog
);

elements.foodForm.addEventListener(
    "submit",
    saveFood
);

elements.foodList.addEventListener(
    "click",
    handleFoodListClick
);

elements.foodDialog.addEventListener(
    "click",
    (event) => {
        if (event.target === elements.foodDialog) {
            closeFoodDialog();
        }
    }
);

elements.openWeightDialog.addEventListener(
    "click",
    () => openWeightDialog()
);

elements.openWeightDialogSecondary.addEventListener(
    "click",
    () => openWeightDialog()
);

elements.weightEmptyAddButton.addEventListener(
    "click",
    () => openWeightDialog()
);

elements.closeWeightDialog.addEventListener(
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
        if (event.target === elements.weightDialog) {
            closeWeightDialog();
        }
    }
);

elements.settingsForm.addEventListener(
    "submit",
    saveSettings
);

loadData();
renderApp();
switchView(currentView);
registerServiceWorker();
