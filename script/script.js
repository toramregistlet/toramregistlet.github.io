/*
    Pre-compiled regex
*/
const REGEX = {
    LV: /\(Lv:\s*([\d,\s]+)\)/,
    MAX_LV: /Max Level:\s*(\d+)/,
    RARITY: /Rarity:\s*([^\n]*)/
};

/*
    Read uploaded file
*/
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/*
    Download updated registlet md file
*/
function downloadFile(content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Updated Registlet List.md";
    a.click();
    URL.revokeObjectURL(a.href);
}

/*
    MD file have to be converted to JSON before updating the list
*/
function convertMdtoJson(mdText) {
    const registletSections = mdText.split(/\n## /).slice(1);
    // registletSections will produce array with each value something like this:
    /*
        `Physical Attack Boost
        (Lv: 10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 220, 230, 250)
        > ATK +1 per level.

        Max Level: 30  
        Rarity: Common`,
    */
    // Slice to remove any text before ## First Registlet Name

    return registletSections.map(section => {
        const lines = section.split('\n');
        const name = lines[0].trim();
        const lvMatch = section.match(REGEX.LV);
        const maxLvMatch = section.match(REGEX.MAX_LV);
        const rarityMatch = section.match(REGEX.RARITY);

        return {
            name,
            lv: new Set(lvMatch ? lvMatch[1].split(/\s*,\s*/).map(Number) : []),
            detail: lines.filter(line => line.startsWith('>')).join('\n'),
            max_lv: maxLvMatch ? parseInt(maxLvMatch[1], 10) : 0,
            rarity: rarityMatch ? rarityMatch[1].trim() : ''
        };
    });
}

/*
    Updating registlet list according to Registlet.csv
*/
function processCSVRow(row, registletJson) {
    if (row.length < 2) return;

    const level = parseInt(row[0].trim(), 10);
    if (isNaN(level)) return console.warn(`Skipping invalid level: ${row[0]}`);

    const name = row[1].trim();
    const existing = registletJson.find(r => r.name === name);

    if (existing) {
        existing.lv.add(level);
    } else {
        registletJson.push({
            name,
            lv: new Set([level]),
            detail: "> ",
            max_lv: 0,
            rarity: ""
        });
    }
}

/*
    After updating the list, convert back to MD
*/
function convertJsonToMD(registletJson) {
    const registletMd = registletJson.map(({ name, lv, detail, max_lv, rarity }) => {
        const stoodieLv = [...lv].sort((a, b) => a - b).join(", ");

        return `## ${name}\n(Lv: ${stoodieLv})\n${detail}\n\nMax Level: ${max_lv}  \nRarity: ${rarity}`;
    }).join('\n\n');

    downloadFile(registletMd.trim());
}

/*
    File validation
*/
function validateFiles(csvFile, mdFile) {
    if (!csvFile || !mdFile) throw new Error('Please upload both files (CSV & MD)');
    if (!csvFile.name.toLowerCase().endsWith('.csv')) throw new Error('Invalid CSV file');
    if (!mdFile.name.toLowerCase().endsWith('.md')) throw new Error('Invalid MD file');
}

/*
    Here is the process when button "submit" is clicked
*/
async function processFiles() {
    try {
        const csvInput = document.getElementById('csvFile').files[0];
        const mdInput = document.getElementById('mdFile').files[0];

        validateFiles(csvInput, mdInput);

        const [mdText, csvText] = await Promise.all([
            readFile(mdInput),
            readFile(csvInput)
        ]);
        const registletJson = convertMdtoJson(mdText);
        const csvRows = csvText.split('\n').map(row => row.split(','));

        csvRows.forEach(row => processCSVRow(row, registletJson));

        convertJsonToMD(registletJson);
    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
}

/*
Summary when "submit" button is clicked:

All inside processFiles() function:
    1. Get uploaded files
    2. Validate using validateFiles()
    3. Read those files using readFile()
        (because async and await, it won't run next line of codes before finished read the files)
    4. Convert MD to JSON using convertMdtoJson()
    5. Parse CSV into an array
    6. Update registlet JSON using processCSVRow()
    7. Convert JSON back to MD using convertJsonToMD()
    8. Trigger file download via downloadFile() inside convertJsonToMD()
*/
