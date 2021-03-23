let globalData = []
let globalDataUnshaded = []

function unshadeData(data) {
    for (let i = 0; i < data.faceColors.length; i++) {
        for (let j = 0; j < 3; j++) {
            data.faceColors[i][j] = 0.0;
        }
    }
    return data;
}

function changeToLoadFile(file) {
    globalData = JSON.parse(file);
    globalDataUnshaded = unshadeData(JSON.parse(file));
    main(globalData);
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

function handleClickShading() {
    let checkBox = document.getElementById('shading');
    if (checkBox.checked) {
        main(globalData);
    } else {
        main(globalDataUnshaded);
    }
}

// For testing
// testData = {
//     "positions": [
//         -1.0, -1.0,  1.0,
//         1.0, -1.0,  1.0,
//         1.0,  1.0,  1.0,
//         -1.0,  1.0,  1.0,
//
//         -1.0, -1.0, -1.0,
//         -1.0,  1.0, -1.0,
//         1.0,  1.0, -1.0,
//         1.0, -1.0, -1.0,
//
//         -1.0,  1.0, -1.0,
//         -1.0,  1.0,  1.0,
//         1.0,  1.0,  1.0,
//         1.0,  1.0, -1.0,
//
//         -1.0, -1.0, -1.0,
//         1.0, -1.0, -1.0,
//         1.0, -1.0,  1.0,
//         -1.0, -1.0,  1.0
//     ],
//     "indices": [
//         0,  1,  2,      0,  2,  3,
//         4,  5,  6,      4,  6,  7,
//         8,  9,  10,     8,  10, 11,
//         12, 13, 14,     12, 14, 15
//     ],
//     "faceColors": [
//         [1.0,  1.0,  1.0,  1.0],
//         [1.0,  0.0,  0.0,  1.0],
//         [0.0,  1.0,  0.0,  1.0],
//         [0.0,  0.0,  1.0,  1.0]
//     ],
//     "vertexCount": 24
// }
// main();