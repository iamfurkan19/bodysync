export const MEALS = [
    { id: "breakfast", label: "Frühstück" },
    { id: "lunch", label: "Mittagessen" },
    { id: "dinner", label: "Abendessen" },
    { id: "snack", label: "Snacks" }
];

export function getMealLabel(mealId) {
    return MEALS.find((meal) => meal.id === mealId)?.label ?? "Snacks";
}

export function matchesFoodSearch(food, query, favoritesOnly = false) {
    if (favoritesOnly && !food.favorite) return false;
    const normalizedQuery = query.trim().toLocaleLowerCase("de-DE");
    return !normalizedQuery || food.name.toLocaleLowerCase("de-DE").includes(normalizedQuery);
}
