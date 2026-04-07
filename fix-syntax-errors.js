const fs = require('fs');

// Read the HTML file
console.log('🔧 Fixing JavaScript syntax errors in player names...');
const htmlContent = fs.readFileSync('public/index.html', 'utf8');

// Find and fix names with apostrophes in the soccerPlayers array
// Pattern: name: 'some'name'  -> should be name: 'some\'name'
const fixedContent = htmlContent.replace(
    /name: '([^']*')([^']*)'/g,
    (match, beforeApostrophe, afterApostrophe) => {
        // Escape the apostrophe
        return `name: '${beforeApostrophe.slice(0, -1)}\\'${afterApostrophe}'`;
    }
);

// Also fix the showScreen function issue by moving it to the top of the script section
// Find the script tag and the showScreen function
const scriptStartMatch = fixedContent.match(/<script>[\s\S]*?const soccerPlayers/);
if (scriptStartMatch) {
    const scriptStart = scriptStartMatch[0];
    const showScreenFunctionMatch = fixedContent.match(/function showScreen\([\s\S]*?\n    };/);

    if (showScreenFunctionMatch) {
        const showScreenFunction = showScreenFunctionMatch[0];

        // Remove the function from its current location
        let contentWithoutFunction = fixedContent.replace(showScreenFunction, '');

        // Insert the function right after the script tag starts and before soccerPlayers
        const insertPoint = contentWithoutFunction.indexOf(scriptStart) + scriptStart.length;
        const beforeSoccerPlayers = contentWithoutFunction.slice(0, insertPoint);
        const afterSoccerPlayers = contentWithoutFunction.slice(insertPoint);

        const fixedWithFunction = beforeSoccerPlayers + '\n\n    ' + showScreenFunction + '\n\n    ' + afterSoccerPlayers;

        // Write the fixed content back
        fs.writeFileSync('public/index.html', fixedWithFunction, 'utf8');
        console.log('✅ Fixed apostrophes in player names');
        console.log('✅ Moved showScreen function to proper location');
        console.log('🎮 JavaScript syntax errors should now be resolved!');
    } else {
        console.log('❌ Could not find showScreen function');
    }
} else {
    console.log('❌ Could not find script section with soccerPlayers');
}