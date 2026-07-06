　　　
// 定数
const SIZE = 8;
　　
// 盤面
let board = [];

// 現在の手番
// 1 = 黒（あなた）
// 2 = 白（CPU）
let currentPlayer = 1;
// ゲームモード
// "single" = CPU戦
// "multi" = 2人対戦
let gameMode = "single";
// CPU難易度
let cpuLevel = "easy";

// HTML取得
const boardElement = document.getElementById("board");
const messageElement = document.getElementById("message");
const blackCountElement = document.getElementById("blackCount");
const whiteCountElement = document.getElementById("whiteCount");
const restartBtn = document.getElementById("restartBtn");
const gameOverPanel = document.getElementById("gameOverPanel");
const resultMessage = document.getElementById("resultMessage");

// 8方向
const directions = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1],[1,0],[1,1]
];

// 初期化
function initGame(){

    gameOverPanel.classList.remove("show");
    resultMessage.textContent = "";

    board = [];

    for(let y=0; y<SIZE; y++){

        board[y] = [];

        for(let x=0; x<SIZE; x++){

            board[y][x] = 0;

        }
    }

    // 初期配置
    board[3][3] = 2;
    board[3][4] = 1;
    board[4][3] = 1;
    board[4][4] = 2;

    currentPlayer = 1;

    createBoard();
    updateBoard();
}

// 盤面生成
function createBoard(){

    boardElement.innerHTML = "";

    for(let y=0; y<SIZE; y++){

        for(let x=0; x<SIZE; x++){

            const cell = document.createElement("div");

            cell.className = "cell";

            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.addEventListener("click", onCellClick);

            boardElement.appendChild(cell);

        }

    }

}

// 盤面更新
function updateBoard(){

    const cells = document.querySelectorAll(".cell");

    let black = 0;
    let white = 0;

    cells.forEach(cell=>{

        const x = Number(cell.dataset.x);
        const y = Number(cell.dataset.y);

        cell.innerHTML = "";

        if(board[y][x] === 1){

            const stone = document.createElement("div");
            stone.className = "stone black";
            cell.appendChild(stone);
            black++;

        }else if(board[y][x] === 2){

            const stone = document.createElement("div");
            stone.className = "stone white";
            cell.appendChild(stone);
            white++;

        }

    });

    blackCountElement.textContent = black;
    whiteCountElement.textContent = white;

if(gameMode === "single"){

    if(currentPlayer === 1){
        messageElement.textContent = "あなたの番です";
    }else{
        messageElement.textContent = "あいてが考えています…";
    }
}else{

    if(currentPlayer === 1){
        messageElement.textContent = "黒の番です";
    }else{
        messageElement.textContent = "白の番です";
    }

}   

}   

// マスをクリック
function onCellClick(event){

    // 一人用は黒だけ操作
    if(gameMode === "single" && currentPlayer !== 1){
        return;
    }

    const x = Number(event.currentTarget.dataset.x);
    const y = Number(event.currentTarget.dataset.y);

    if(!canPlace(x, y, currentPlayer)){
        return;
    }

    placeStone(x, y, currentPlayer);

}

// 石を置けるか判定
function canPlace(x, y, player){

    if(board[y][x] !== 0) return false;

    const enemy = player === 1 ? 2 : 1;

    for(const [dx, dy] of directions){

        let nx = x + dx;
        let ny = y + dy;

        let foundEnemy = false;

        while(
            nx >= 0 &&
            nx < SIZE &&
            ny >= 0 &&
            ny < SIZE
        ){

            if(board[ny][nx] === enemy){

                foundEnemy = true;

            }else if(board[ny][nx] === player){

                if(foundEnemy){
                    return true;
                }

                break;

            }else{

                break;

            }

            nx += dx;
            ny += dy;

        }

    }

    return false;

}

// 石を置く
function placeStone(x, y, player){

    board[y][x] = player;

    flipStones(x, y, player);

}

// 石をひっくり返す
function flipStones(x, y, player){

    const enemy = player === 1 ? 2 : 1;

    for(const [dx, dy] of directions){

        let nx = x + dx;
        let ny = y + dy;

        const stones = [];

        while(
            nx >= 0 &&
            nx < SIZE &&
            ny >= 0 &&
            ny < SIZE
        ){

            if(board[ny][nx] === enemy){

                stones.push([nx, ny]);

            }else if(board[ny][nx] === player){

               stones.forEach(([fx, fy])=>{

    const index = fy * SIZE + fx;
    const cell = document.querySelectorAll(".cell")[index];
    const stone = cell.querySelector(".stone");

    if(stone){
        stone.classList.add("flip");
    }

    board[fy][fx] = player;

});
                break;

            }else{

                break;

            }

            nx += dx;
            ny += dy;

        }

    }
setTimeout(() => {

    currentPlayer = player === 1 ? 2 : 1;

    updateBoard();

    if(gameMode === "single"){
        checkTurn();
    }else{
        checkTurnMulti();
    }

},300);

}   

// CPU
function cpuMove(){

    const moves = [];

    // 置ける手を全部取得
    for(let y = 0; y < SIZE; y++){
        for(let x = 0; x < SIZE; x++){
            if(canPlace(x, y, 2)){
                moves.push({x, y});
            }
        }
    }

    if(moves.length === 0){
        checkTurn();
        return;
    }

    let move;

    // =========================
    // EASY（完全ランダム）
    // =========================
    if(cpuLevel === "easy"){

        move = moves[Math.floor(Math.random() * moves.length)];

    }

    // =========================
    // NORMAL（少しだけ賢い）
    // → 取れる枚数が多い手を優先
    // =========================
    else if(cpuLevel === "normal"){

        let bestScore = -1;
        let candidates = [];

        for(const m of moves){

            let score = countFlips(m.x, m.y, 2);

            if(score > bestScore){
                bestScore = score;
                candidates = [m];
            }else if(score === bestScore){
                candidates.push(m);
            }
        }

        move = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // =========================
    // HARD（角優先＋最強寄り）
    // =========================
    else if(cpuLevel === "hard"){

        const corners = [
            [0,0],
            [0,SIZE-1],
            [SIZE-1,0],
            [SIZE-1,SIZE-1]
        ];

        // 角があれば即選択
        for(const m of moves){
            for(const c of corners){
                if(m.x === c[0] && m.y === c[1]){
                    move = m;
                }
            }
        }

        // 角がなければスコア最大
        if(!move){

            let bestScore = -1;
            let candidates = [];

            for(const m of moves){

                let score =
                    countFlips(m.x, m.y, 2) +
                    stabilityBonus(m.x, m.y);

                if(score > bestScore){
                    bestScore = score;
                    candidates = [m];
                }else if(score === bestScore){
                    candidates.push(m);
                }
            }

            move = candidates[Math.floor(Math.random() * candidates.length)];
        }
    }

    setTimeout(() => {
        placeStone(move.x, move.y, 2);
    }, 500);
}
function countFlips(x, y, player){

    let total = 0;
    const enemy = player === 1 ? 2 : 1;

    for(const [dx, dy] of directions){

        let nx = x + dx;
        let ny = y + dy;

        let count = 0;

        while(
            nx >= 0 &&
            nx < SIZE &&
            ny >= 0 &&
            ny < SIZE
        ){

            if(board[ny][nx] === enemy){
                count++;
            }else if(board[ny][nx] === player){
                total += count;
                break;
            }else{
                break;
            }

            nx += dx;
            ny += dy;
        }
    }

    return total;
}
function stabilityBonus(x, y){

    const corners = [
        [0,0],
        [0,SIZE-1],
        [SIZE-1,0],
        [SIZE-1,SIZE-1]
    ];

    let bonus = 0;

    // 角に近いほど評価
    for(const c of corners){

        const dist =
            Math.abs(x - c[0]) +
            Math.abs(y - c[1]);

        bonus += (10 - dist);
    }

    return bonus;
}

// パス処理・手番管理
function checkTurn(){
   
    const canBlack = hasMove(1);
    const canWhite = hasMove(2);

    // 両者置けない → 終局
    if(!canBlack && !canWhite){

        finishGame();
        return;

    }

    // プレイヤーの番
    if(currentPlayer === 1){

        if(!canBlack){

            messageElement.textContent =
                "あなたはパスです";

            currentPlayer = 2;

            setTimeout(cpuMove, 1000);

            return;
        }

    }

    // CPUの番
    if(currentPlayer === 2){

        if(!canWhite){

            messageElement.textContent =
                "あいてはパスです";

            currentPlayer = 1;

            updateBoard();

            return;

        }

        cpuMove();

    }

}
function checkTurnMulti(){

    const canBlack = hasMove(1);
    const canWhite = hasMove(2);

    // 両者置けない
    if(!canBlack && !canWhite){

        finishGame();
        return;

    }

    if(currentPlayer === 1){

        if(!canBlack){

            messageElement.textContent = "黒はパスです";

            currentPlayer = 2;

            updateBoard();

        }

    }else{

        if(!canWhite){

            messageElement.textContent = "白はパスです";

            currentPlayer = 1;

            updateBoard();

        }

    }

}

// 指定プレイヤーが置ける場所があるか
function hasMove(player){

    for(let y = 0; y < SIZE; y++){

        for(let x = 0; x < SIZE; x++){

            if(canPlace(x, y, player)){
                return true;
            }

        }

    }

    return false;

}

// 勝敗判定
function finishGame(){

    let black = 0;
    let white = 0;

    for(let y = 0; y < SIZE; y++){

        for(let x = 0; x < SIZE; x++){

            if(board[y][x] === 1){
                black++;
            }else if(board[y][x] === 2){
                white++;
            }

        }

    }

    blackCountElement.textContent = black;
    whiteCountElement.textContent = white;

if(gameMode === "single"){

    if(black > white){

        resultMessage.textContent = "あなたの勝ち！";

    }else if(white > black){

        resultMessage.textContent = "あなたの負け！";

    }else{

        resultMessage.textContent = "引き分け！";

    }

}else{

    if(black > white){

        resultMessage.textContent = "黒の勝ち！";

    }else if(white > black){

        resultMessage.textContent = "白の勝ち！";

    }else{

        resultMessage.textContent = "引き分け！";

    }

}

messageElement.textContent = "";
    gameOverPanel.classList.add("show");

}

// 「もう一回遊ぶ」ボタン
if(restartBtn){

    restartBtn.addEventListener("click", () => {

        initGame();

    });

}

// ページを開いたときにゲーム開始
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");

const singleBtn = document.getElementById("singleBtn");
const multiBtn = document.getElementById("multiBtn");
const singleImage = document.getElementById("singleImage");
const multiImage = document.getElementById("multiImage");
const difficultyScreen = document.getElementById("difficultyScreen");

const easyBtn = document.getElementById("easyBtn");
const normalBtn = document.getElementById("normalBtn");
const hardBtn = document.getElementById("hardBtn");
const backBtn = document.getElementById("backBtn");

singleBtn.onclick = () => {

    gameMode = "single";

    singleImage.classList.add("pressed");

    setTimeout(() => {

        showScreen(difficultyScreen);

        requestAnimationFrame(() => {
            difficultyScreen.classList.add("open");
        });

    },120);

};
multiBtn.onclick = () => {

    gameMode = "multi";

    multiImage.classList.add("pressed");

    setTimeout(() => {

        showScreen(gameScreen);
        initGame();

    },120);

};
function startGame(){

    difficultyScreen.classList.remove("open");

    showScreen(gameScreen);

    initGame();

}
easyBtn.onclick = () => {
    cpuLevel = "easy";
    startGame();
};

normalBtn.onclick = () => {
    cpuLevel = "normal";
    startGame();
};

hardBtn.onclick = () => {
    cpuLevel = "hard";
    startGame();
};
backBtn.onclick = () => {

    difficultyScreen.classList.remove("open");

    setTimeout(() => {

        showScreen(startScreen);

    },350);

};
function showScreen(screen){

    startScreen.classList.remove("active");
    difficultyScreen.classList.remove("active");
    gameScreen.classList.remove("active");

    screen.classList.add("active");

}
