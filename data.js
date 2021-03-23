let globalData = []

function changeToLoadFile(file) {
    globalData = JSON.parse(file);
    console.log(JSON.parse(file));
}

function loadGlobalData() {
    let input = document.getElementById("load");
    let files = input.files; 
  
    if (files.length == 0) return;

    const file = files[0]; 
  
    let reader = new FileReader();

    reader.onload = (e) => changeToLoadFile(e.target.result);
    reader.onerror = (e) => alert(e.target.error.name); 
  
    reader.readAsText(file);
}