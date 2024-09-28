/** @type {CanvasRenderingContext2D} */

let canvas;
let ctx;
let grid;
let cols;
let rows;
let mouseX;
let mouseY;
let cellSize;
let numTrollCells;
let markersRemaining;

class Cell {
    constructor(i, j, w){
        this.i = i;
        this.j = j;
        this.x = i*w;
        this.y = j*w;
        this.w = w;
        this.neighborCount = 0;
        this.isTroll  = false;
        this.revealed = false;
        this.isMarked  = false;
    }

    show(){
        ctx.strokeStyle = "#000000";
        // If revealed show either troll, count or blank cell
        if(this.revealed){
            if(this.isTroll){
                ctx.rect(this.x, this.y, this.w, this.w);
                ctx.drawImage(troll, this.x, this.y, this.w, this.w);
            }
            else if(this.neighborCount > 0){
                ctx.fillStyle   = "#CCCCCC";
                ctx.fillRect(this.x, this.y, this.w, this.w);
                ctx.font = String(Math.floor(cellSize/2))+"px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(this.neighborCount, this.x+this.w/3, this.y + this.w/1.5);
                ctx.rect(this.x, this.y, this.w, this.w);
            }
            else{
                ctx.fillStyle   = "#CCCCCC";
                ctx.fillRect(this.x, this.y, this.w, this.w);
            }
        }
        else if(this.isMarked){
            // Adding flag-icon
            ctx.font = String(Math.floor(cellSize/2))+"px Arial";
            ctx.fillText('\u{1f6a9}', this.x+this.w/3, this.y + this.w/1.5);
            ctx.rect(this.x, this.y, this.w, this.w);
        }
        // If not revealed overlay blanks cells
        else{
            ctx.rect(this.x, this.y, this.w, this.w);
        }
        ctx.stroke();
    }

    countTrolls(){
        if(this.isTroll){
            return;
        }
        for(let xOffset=-1; xOffset<=1; xOffset++){
            for(let yOffset=-1; yOffset<=1; yOffset++){
                let i = this.i + xOffset;
                let j = this.j + yOffset;
                if(i > -1 && i < cols && j > -1 && j < rows){
                    let neighbor = grid[i][j];
                    if(neighbor.isTroll){
                        this.neighborCount++;
                    }
                }
            }
        }
    }

    reveal(){
        // Reveal cell and check blank cell
        this.revealed = true;
        if(grid[this.i][this.j].neighborCount == 0){
            this.floodFillAlgorithm();
        }
    }

    mark(){
        this.isMarked = true;
    }

    unMark(){
        // Unmarking and clearing flag-icon
        ctx.clearRect(this.x, this.y, this.w, this.w);
        ctx.rect(this.x, this.y, this.w, this.w);
        ctx.stroke();
        this.isMarked = false;
    }

    floodFillAlgorithm(){
        // Checking for blank boxes and reveal all surrounding
        for(let xOffset=-1; xOffset<=1; xOffset++){
            for(let yOffset=-1; yOffset<=1; yOffset++){
                let i = this.i + xOffset;
                let j = this.j + yOffset;
                if(i > -1 && i < cols && j > -1 && j < rows){
                    let neighbor = grid[i][j];
                    if(!neighbor.isTroll && !neighbor.revealed){
                        neighbor.reveal();
                        neighbor.show();
                    }
                }
            }
        }
    }
}

function create2dArray(cols, rows){
    // Creating a 2D array
    let arr = new Array(cols);
    for(let i = 0; i < rows; i++){
        arr[i] = new Array(rows);
    }
    return arr;
}

function markersRemainingUpdate(){
    // Updating the flag-remainding-count
    ctx.clearRect(cols*cellSize+10, 0, 50*3, 50);
    ctx.font = "30px Courier New";
    ctx.fillStyle = "black";
    ctx.fillText("\u{1f6a9} осталось: " + markersRemaining, 525, 50);
}

function SetupCanvas(){
    // Parameters
    cols = 10;
    rows = 10;
    cellSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 30 : 50
    numTrollCells = 12;
    markersRemaining = numTrollCells;

    // Setup canvas
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add instructions
    ctx.font = "20px Courier New";
    ctx.fillStyle = "black";
    ctx.fillText("1) Правая кнопка мыши чтобы поставить флажок", 10, cols*cellSize+30);
    ctx.fillText("2) 'F5' для рестарта", 10, cols*cellSize+60);
    ctx.clearRect(10, 0, 200, 100);

    troll = new Image();
    troll.src = "ancient.png";

    grid = create2dArray(cols, rows);

    // Creating all the cells
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j] = new Cell(i, j, cellSize);
        }  
    }        

    // Adding the number of trolls to the game
    while(numTrollCells != 0){
        let x = Math.floor(Math.random(0, cols) * cols);
        let y = Math.floor(Math.random(0, rows) * rows);
        if(!grid[x][y].isTroll){
            grid[x][y].isTroll = true;
            numTrollCells--;
        }
    }

    // Making every cell count how many trollsneighbors it got
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j].countTrolls();
        }   
    }

    // Displaying the board
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j].show();
        }   
    }

    markersRemainingUpdate();
}

function mouseClicked(e) {
    // Получение координат мыши
    mouseX = e.pageX;
    mouseY = e.pageY;

    // Если нажата правая кнопка мыши, ставим или убираем флаг
    if (e.button === 2) {  // e.button === 2 — это правая кнопка мыши
        if (markersRemaining > 0) {
            markCell();
        }
    }
    // Если нажата левая кнопка мыши, раскрываем клетку
    else if (e.button === 0) {
        checkCellClicked();
    }
}


function gameOver() {
    // Показать все клетки
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].reveal();
            grid[i][j].show();
        }
    }

    // Показать анимацию взрыва
    let boom = document.getElementById("boom");
    boom.style.display = "block";

    // Разместить анимацию в точке клика (можно настроить позицию, если нужно)
    boom.style.left = (mouseX - 50) + "px";
    boom.style.top = (mouseY - 50) + "px";

    // Убрать анимацию через 1 цикл (примерно 1.5 секунды для gif)
    setTimeout(() => {
        boom.style.display = "none";
        boom.src = ""; // Очищаем src, чтобы остановить анимацию
    }, 1500); // 1.5 секунды – примерная продолжительность одного цикла анимации

    // Уведомление о перезагрузке игры
    ctx.clearRect(10, cols * cellSize + 10, rows * cellSize + 40, 100);
    ctx.font = "20px Courier New";
    ctx.fillStyle = "black";
    ctx.fillText("Все, бабахнуло", 10, cols * cellSize + 30);
    ctx.fillText("Нажмите 'F5', чтобы начать заново!", 10, cols * cellSize + 60);

    // Удаляем текст о количестве оставшихся флажков и его значение
    ctx.clearRect(500, 0, 300, 100); // Очищаем текст с количеством оставшихся флажков

    // Сбрасываем количество оставшихся флажков
    markersRemaining = 0;
}


function checkCellClicked(){
    // Проверка, была ли клетка нажата
    for (let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            if (mouseX > grid[i][j].x && 
                mouseX < grid[i][j].x + grid[i][j].w &&
                mouseY > grid[i][j].y &&
                mouseY < grid[i][j].y + grid[i][j].w){
                
                // Если нажали на клетку с миной
                if(grid[i][j].isTroll){
                    gameOver();
                    ctx.clearRect(10, cols*cellSize+10, rows*cellSize+40, 100);
                    ctx.font = "20px Courier New";
                    ctx.fillStyle = "black";
                    ctx.fillText("Все, бабахнуло", 10, cols*cellSize+30);
                    ctx.fillText("Нажмите 'F5', чтобы начать заново!", 10, cols*cellSize+60);
                    
                    // Удален авто-ресстарт
                }
                // Если клетка помечена флагом
                else if(grid[i][j].isMarked){
                    markersRemaining++;
                    grid[i][j].unMark();
                    markersRemainingUpdate();
                }
                // Если обычная клетка, раскрываем её
                else{
                    grid[i][j].reveal();
                    grid[i][j].show();
                }
            }
        }
    }
}


function markCell() {
    // Обработка постановки флага
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (mouseX > grid[i][j].x &&
                mouseX < grid[i][j].x + grid[i][j].w &&
                mouseY > grid[i][j].y &&
                mouseY < grid[i][j].y + grid[i][j].w) {
                
                // Если клетка уже помечена, убираем флаг
                if (grid[i][j].isMarked) {
                    markersRemaining++;
                    grid[i][j].unMark();
                } 
                // Если клетка не помечена, ставим флаг
                else {
                    markersRemaining--;
                    grid[i][j].mark();
                }

                grid[i][j].show();
                markersRemainingUpdate();
            }
        }
    }
}

function updateCanvas() {
    // Отслеживание событий мыши
    window.addEventListener("mouseup", mouseClicked);
    // Обработка события правой кнопки мыши (предотвращение контекстного меню)
    window.addEventListener("contextmenu", (e) => {
        e.preventDefault();  // Отключаем контекстное меню
    });
    // Проверка touch-события
    window.addEventListener("touchend", mouseClicked);
}

function loop(){
    updateCanvas();
    window.requestAnimationFrame(loop);
}

function refreshPage(e){
    // 114 is the 'r'-key
    if(e.keyCode == 114){
        window.location.reload();
    }
}

// Setup the canvas when pages is loaded
document.addEventListener('DOMContentLoaded', SetupCanvas);
// Refesh page when hitting 'r'-key
document.addEventListener('keypress', refreshPage);
// Render loop
window.requestAnimationFrame(loop);
