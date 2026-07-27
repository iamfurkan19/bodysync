const dailyGoals = {
    calories: 2000,
    protein: 160
};

const dailyValues = {
    calories: 0,
    protein: 0
};

function updateDashboard() {
    const caloriesPercent = Math.min(
        (dailyValues.calories / dailyGoals.calories) * 100,
        100
    );

    const proteinPercent = Math.min(
        (dailyValues.protein / dailyGoals.protein) * 100,
        100
    );

    document.getElementById("caloriesValue").textContent =
        `${dailyValues.calories} / ${dailyGoals.calories}`;

    document.getElementById("proteinValue").textContent =
        `${dailyValues.protein} / ${dailyGoals.protein}`;

    document.getElementById("caloriesProgress").style.width =
        `${caloriesPercent}%`;

    document.getElementById("proteinProgress").style.width =
        `${proteinPercent}%`;
}

updateDashboard();
