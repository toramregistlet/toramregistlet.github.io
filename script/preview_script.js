const fileInput = document.getElementById('mdFile');
const inputText = document.getElementById('input-text');
const note = document.getElementById('note');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');

const registletUrl = "https://toramregistlet.github.io/Registlet/Registlet.md";

const noteText = 
`> **TL;DR:**  
> This app only help to automate update list of Stoodie level on existing registlets and add new registlets to the list. Not including registlet descriptions.

# How to Use:
1. Download these files (if you don't have them)
    - <a href="./Registlet/Registlet.csv" target="_blank">Registlet.csv</a>
    - <a href="./Registlet/Registlet.md" target="_blank">Registlet.md</a>  
        <small>_To download <code>Registlet.md</code> after clicking link above:_  
            - _PC: ctrl+s to download. Make sure it's <code>.md</code>, not <code>.txt</code>._  
            - _Mobile: find download page button on your browser._</small>
2. Update file <code>Registlet.csv</code>.  
    <small>_(Manually adding & crosschecking. Use excel, Google Sheets or even notepad)_</small>
3. Upload <code>Registlet.csv</code> and <code>Registlet.md</code> then click submit.
4. You get the result
   - Updated with new registlets you added to <code>Registlet.csv</code>
   - List Stoodie lv where you can get that registlet automatically updated

**Not fully automated:**
- Refer to the second step
- In the fourth step, you’ll need to manually add the registlet description.  
    <small>_(Just one time thing, and only for new registlets or ones that got changes if Asobimo updates them.)_</small>
- Manually fix the list order  
    <small>_(copy paste to rearrange the list in <code>Registlet.md</code>)_</small>

## How to Update the List:
- When Asobimo updates new registlets, do the steps from <a href="#note">How to Use</a>.  
It will automatically update the list without ruining the list order that you have fixed _(if you upload that fixed <code>.md</code> file)_
- If Asobimo changed existing registlet's name, make sure to change it both on <code>Registlet.csv</code> and <code>Registlet.md</code> before uploading them.
* * *
# 🟡 Here if you need <a href="./Registlet/registlets.json" target="_blank">registlets.json</a>`;


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