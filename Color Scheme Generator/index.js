const dropdown = document.getElementById('color-dropdown');
const picker = document.getElementById('color-picker');

// Update picker when dropdown changes
dropdown.addEventListener('change', (e) => {
    picker.value = e.target.value;
});

// Optional: Update dropdown when picker changes (bi-directional sync)
picker.addEventListener('input', (e) => {
    dropdown.value = e.target.value;
});
