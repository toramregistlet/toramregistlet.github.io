const fileInput = document.getElementById('mdFile');
const inputText = document.getElementById('input-text');
const note = document.getElementById('note');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');

const registletUrl = "https://toramregistlet.github.io/Registlet/Registlet.md";

const noteText = `# How to Use:
1. Update file <a href="./Registlet/Registlet.csv" target="_blank">Registlet.csv</a>.  
_(Manually adding & crosschecking. Use excel, Google Sheets or even notepad)_
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
- If Asobimo changed existing registlet's name, make sure to change it both on <a href="./Registlet/Registlet.csv" target="_blank">Registlet.csv</a> and <a href="./Registlet/Registlet.md" target="_blank">Registlet.md</a> before uploading it.
* * *
# Here if you need <a href="./Registlet/registlets.json" target="_blank">registlets.json</a>`;


function displayMD(str, htmlElement) {
    const html = marked.parse(str);
    htmlElement.innerHTML = html;
}

async function fetchRegistlet() {
    try {
        const res = await fetch(registletUrl);
        const data = await res.text();

        return data;
    } catch (err) {
        console.log("Error fetching data:", err);
    }
}

function readInputFile() {
    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith('.md')) {
        alert('Please select a valid MD file!');
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        inputText.value = e.target.result;
        inputText.dispatchEvent(new Event("input", { bubbles: true }));
    };

    reader.readAsText(file);
}


document.addEventListener("DOMContentLoaded", async () => {
    // for update.html
    if (note) {
        displayMD(noteText, note);
    }

    // for index.html
    if (preview1) {
        const registlet = await fetchRegistlet();
        displayMD(registlet, preview1);
    }
});