let largeCountries = ["Tuvalu", "India", "United States", "Indonesia", "Monaco"];

largeCountries.shift(); // Remove the first element (Tuvalu)
largeCountries.unshift("China"); // Add "China" to the beginning of the array
largeCountries.pop(); // Remove the last element (Monaco)
largeCountries.push("Pakistan"); // Add "Pakistan" to the end of the array

console.log("The 5 largest countries in the world:");
for (let i = 0; i < largeCountries.length; i++) {
    console.log("- " + largeCountries[i]);
}