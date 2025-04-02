function previewMD() {
    const fileInput = document.getElementById('mdFile');
    const preview = document.getElementById('preview2');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a MD file first!');
        return;
    }

    if (!file.name.toLowerCase().endsWith('.md')) {
        alert('Please select a valid MD file!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const html = marked.parse(e.target.result);
        const purify = DOMPurify.sanitize(html);
        preview.innerHTML = purify;
    };
    reader.readAsText(file);
}

function previewNote() {
    const note = document.getElementById('note');

    const noteText = `# How to Use:
1. Update file <a href="./Registlet/Registlet.csv" target="_blank">Registlet.csv</a>.  
_(Manually adding & crosschecking. Use excel, Google Sheets or even notepad lol)_
2. Upload <a href="./Registlet/Registlet.csv" target="_blank">Registlet.csv</a> and <a href="./Registlet/Registlet.md" target="_blank">Registlet.md</a>
3. You get the result
   - Updated with new registlets you added to <a href="./Registlet/Registlet.csv" target="_blank">Registlet.csv</a>
   - List Stoodie lv where you can get that registlet automatically updated

**Not fully automated:**
- Refer to the first step
- Manually fix the list order  
_(copy paste to rearrange the list in <a href="./Registlet/Registlet.md" target="_blank">Registlet.md</a>)_  

## How to Update the List or Fix the List Order:
**Manually fix the list order**   
- copy paste to rearrange the list in <a href="./Registlet/Registlet.md" target="_blank">Registlet.md</a>

**Update Registlet List**
- When Asobimo updates new registlets, do the steps from <a href="#note">How to Use</a>.  
It will automatically update the list without ruining the list order that you have fixed  
_(if you upload that fixed md file)_
- If Asobimo changed existing registlet's name, make sure to change it both on <a href="./Registlet/Registlet.csv" target="_blank">Registlet.csv</a> and <a href="./Registlet/Registlet.md" target="_blank">Registlet.md</a> before uploading it.`;

    note.innerHTML = marked.parse(noteText);
}

async function fetchRegistlet() {
    try {
        const res = await fetch("https://toramregistlet.github.io/Registlet/Registlet.md");
        const data = await res.text();
        return data;
    } catch (err) {
        console.log("Error fetching data:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const note = document.getElementById('note');
    const preview = document.getElementById('preview');

    // for update.html
    if (note) {
        previewNote();
    }

    // for index.html
    if (preview) {
        const registlet = await fetchRegistlet();
    
        const html = marked.parse(registlet);
        const purify = DOMPurify.sanitize(html);
        preview.innerHTML = purify;
    }
});
