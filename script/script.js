/*
    Read uplooaded file
*/
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

/*
    Download updated registlet md file
*/
function downloadFile(completedMd) {
    const blob = new Blob([completedMd], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Updated Registlet List.md"; // Downloaded file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Remove the URL
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
    
    return registletSections.map(section => {
        // Registlet's name, first line
        const name = section.split('\n')[0].trim();

        // Stoodie level list, use regex
        const lvMatch = section.match(/\(Lv:\s*([\d,\s]+)\)/);
        const lv = lvMatch ? lvMatch[1].split(/\s*,\s*/).map(Number) : [];
        
        // Registlet's detail, anything that starts with >
        const descriptionLines = section.split('\n').filter(line => line.startsWith('>'));
        const detail = descriptionLines.join('\n');
        
        //Registlet's max lv, use regex
        const maxLvMatch = section.match(/Max Level:\s*(\d+)/);
        const max_lv = maxLvMatch ? parseInt(maxLvMatch[1].trim(), 10) : 0;
        
        //Registlet's rarity, use regex
        const rarityMatch = section.match(/Rarity:\s*([^\n]*)/);
        const rarity = rarityMatch ? rarityMatch[1].trim() : '';
        
        return {
            name,
            lv,
            detail,
            max_lv,
            rarity
        };
    });
}

/*
    After updating the list, convert back to MD
*/
function convertJsonToMD(newRegistlets) {
    let registletMd = "";

    newRegistlets.forEach(({ name, lv, detail, max_lv, rarity }) => {
        let registlet = "";
        let stoodieLv = lv.sort((a, b) => a - b).join(", ");    // sort lv list from smallest to highest
        
        // Start to rewrite MD format
        registlet = registlet.concat(`## ${name}`);
        registlet = registlet.concat("\n", `(Lv: ${stoodieLv})`);
        registlet = registlet.concat("\n", detail);
        registlet = registlet.concat("\n\n", `Max Level: ${max_lv}  `);
        registlet = registlet.concat("\n", `Rarity: ${rarity}`);

        registletMd = registletMd.concat("\n\n", registlet);
    });

    downloadFile(registletMd);
}


/*
    Here is the process when button "submit" is clicked
*/
async function processFiles() {
    const csvInput = document.getElementById('csvFile').files[0];
    const mdInput = document.getElementById('mdFile').files[0];
    
    // Validation
    if (!csvInput || !mdInput) {
        alert('Please upload both file (CSV & MD)');
        return;
    }

    if (!csvInput.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a valid CSV file!');
        return;
    }
    
    if (!mdInput.name.toLowerCase().endsWith('.md')) {
        alert('Please select a valid MD file!');
        return;
    }

    // Validation success, continue to this
    try {
        // New variable with uploaded file as value
        const [mdText, csvText] = await Promise.all([
            readFile(mdInput),
            readFile(csvInput)
        ]);

        const registletJson = convertMdtoJson(mdText);

        let csvRows = csvText.split('\n').map(row => row.split(','));

        // Updating registletJson with new registlet from CSV file
        for (let row of csvRows) {
            //read each line of uploaded CSV file
            if (row.length < 2) continue;
            let level = parseInt(row[0].trim(), 10);
            let name = row[1].trim();

            // Check if that registlet new or not
            let existing = registletJson.find(r => r.name === name);
            if (existing) {
                if (!existing.lv.includes(level)) {
                    existing.lv.push(level);
                }
            } else {
                registletJson.push({
                    name: name,
                    lv: [level],
                    detail: "> ",
                    max_lv: 0,
                    rarity: ""
                });
            }
        }

        // finish updating, convert that
        convertJsonToMD(registletJson);
    } catch (error) {
        console.error("Error reading files:", error);
        alert("Error reading files");
    }
}