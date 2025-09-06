const fs = require('fs');
const readline = require('readline');

// Load constitution.json
const clauses = JSON.parse(fs.readFileSync('constitution.json', 'utf-8'));
console.log("Total clauses loaded:", clauses.length);

// Function to suggest clauses
function suggestClauses(caseDescription) {
    const suggestions = [];
    const caseText = caseDescription.toLowerCase();

    clauses.forEach(clause => {
        for (let keyword of clause.keywords) {
            if (caseText.includes(keyword.toLowerCase())) {
                suggestions.push(clause);
                break; // Avoid duplicate suggestions
            }
        }
    });

    return suggestions;
}

// Read input from user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter case description: ", (caseText) => {
    const results = suggestClauses(caseText);

    if (results.length > 0) {
        console.log("\nSuggested Clauses:");
        results.forEach(r => {
            console.log(`${r.article}: ${r.title}`);
        });
    } else {
        console.log("No relevant clause found.\n");
    }

    rl.close();
});
