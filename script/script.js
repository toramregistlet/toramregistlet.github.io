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
    a.download = "Updated Registlet List.md"; // Nama file yang didownload
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Hapus URL untuk hemat memori
}

/*
    MD file have to be converted to JSON before updating the list
*/
function convertMdtoJson(mdText) {
    const pattern = /## (.*?)\r?\n\(Lv:\s*([\d,\s]+)\)\r?\n>\s*(.*?)\r?\n\s*Max Level:\s*(\d+)\s*\r?\n\s*Rarity:\s*([\w\s]+)/g;
    const matches = [...mdText.matchAll(pattern)];
    
    return matches.map(match => ({
        name: match[1].trim(),
        lv: match[2].split(/\s*,\s*/).map(Number),
        detail: match[3].trim(),
        max_lv: parseInt(match[4].trim(), 10),
        rarity: match[5].trim()
    }));

    // This will produce something like this:
    /*
        [
            {
                "name": "Tricky Shadow Walk",
                "lv": [190, 220],
                "detail": "Additional attack of `Shadow Walk` will no longer cause proration.",
                "max_lv": 1,
                "rarity": "Epic"
            },
            {
                "name": "Mega Royal Heal",
                "lv": [190, 230],
                "detail": "The range of `Royal Heal` effect is increased by 1m _(+1m per level)_, but the amount of HP restores is halved.",
                "max_lv": 8,
                "rarity": "Super Rare"
            }
        ]
    */
}

/*
    After updating the list, convert back to MD
*/
function convertJsonToMD(newRegistlets) {
    let registletMd = "";

    newRegistlets.forEach(({ name, lv, detail, max_lv, rarity }) => {
        let registlet = "";
        let stoodieLv = lv.sort((a, b) => a - b).join(", ");
        
        registlet = registlet.concat(`## ${name}`);
        registlet = registlet.concat("\n", `(Lv: ${stoodieLv})`);
        registlet = registlet.concat("\n", `> ${detail}`);
        registlet = registlet.concat("\n\n", `Max Level: ${max_lv}  `);
        registlet = registlet.concat("\n", `Rarity: ${rarity}`);

        registletMd = registletMd.concat("\n\n", registlet);
    });

    // This function will produce something like this into variable registletMd:
    /*
        ## Physical Attack Boost
        (Lv: 10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 220, 230, 250)
        > ATK +1 per level.  

        Max Level: 30  
        Rarity: Common
    */

    // After the md file updated, download it
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
                    detail: "",
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




/*
    const pattern = /## (.*?)\r?\n\(Lv:\s*([\d,\s]+)\)\r?\n>\s*(.*?)\r?\n\s*Max Level:\s*(\d+)\s*\r?\n\s*Rarity:\s*(\w+)/g;

    ## (.*?)\r?\n\
    ## (.*?)        : Look ## with any characters after that
    \r?\n           : Look for \r\n at the end, with \r being optional

        ## Physical Attack Boost\r\n
        (\r\n is from reader.readAsText(file) that idk if it's only \n or \r\n)

- - -
    
    (Lv:\s*([\d,\s]+)\)\r?\n
        (Lv:            : Look for (Lv:
        \s*             : White space (space, tab) 0 or more times
        ([\d,\s]+)      : Group to look for digits followed by a comma and a space.
                            + at the end is look for at least one that matched (or consecutive occurrences)
        \)              : Look for )
        \r?\n           : Look for \r\n at the end, with \r being optional

            (Lv: 10, 30, 50, 70, 90)

- - -

    >\s*(.*?)\r?\n\
        >\s*            : Look for > followed by white space (space, tab) 0 or more times
        (.*?)           : Look for any characters
        \r?\n           : Look for \r\n at the end, with \r being optional

            > Increases EXP Gain by 10% but lowers damage dealt by 14% _(-1% per level)._

- - -

    \s*             : Look for white space (space, tab) 0 or more times
                      (in markdown, any lines after symbol > (more than) will be included to
                       that indented text. So empty line after that to break out from that)

- - -

    Max Level:\s*(\d+)\s*\r?\n
        Max Level:\s*   : Look for Max Level: followed by white space (space, tab) 0 or more times
        (\d+)\s*        : Group to look for any digits followed by white space (space, tab) 0 or more times
                          (in markdown, 2 white spaces at the end is to make a new line)
        \r?\n           : Look for \r\n at the end, with \r being optional

            Max Level: 30  

- - -

    Rarity:\s*([\w\s]+)
        Rarity:\s*      : Look for Rarity followed by white space (space, tab) 0 or more times
        ([\w\s]+)       : Look for sequence word of characters
                          (not using (.*?) like previous case just to avoid bug)

            Rarity: Common

- - -

    g at the very end   : keyword to look for global tag, to match all the occurrences of that pattern
                          from the entire text.
*/