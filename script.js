
// 定数
const SIZE = 8;

// 盤面
let board = [];

// 現在の手番
// 1 = 黒（あなた）
// 2 = 白（CPU）
let currentPlayer = 1;

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

    if(currentPlayer === 1){
        messageElement.textContent = "あなたの番です";
    }else{
        messageElement.textContent = "あいてが考えています…";
    }

}

// マスをクリック
function onCellClick(event){

    if(currentPlayer !== 1) return;

    const x = Number(event.currentTarget.dataset.x);
    const y = Number(event.currentTarget.dataset.y);

    if(!canPlace(x, y, 1)) return;

    placeStone(x, y, 1);

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

    checkTurn();

},300);
}

// CPU（弱い・ランダム）
function cpuMove(){

    const moves = [];

    for(let y=0; y<SIZE; y++){

        for(let x=0; x<SIZE; x++){

            if(canPlace(x, y, 2)){

                moves.push({x, y});

            }

        }

    }

    if(moves.length === 0){

        checkTurn();
        return;

    }

    const move =
        moves[Math.floor(Math.random() * moves.length)];

    setTimeout(()=>{

        placeStone(move.x, move.y, 2);

    }, 500);

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

if(black > white){

    resultMessage.textContent = "あなたの勝ち！";

}else if(white > black){

    resultMessage.textContent = "あなたの負け！";

}else{

    resultMessage.textContent = "引き分け！";

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

singleBtn.addEventListener("click", () => {

    console.log("ひとりで遊ぶ");

    startScreen.style.display = "none";
    gameScreen.style.display = "block";

    initGame();

});

multiBtn.addEventListener("click", () => {

    alert("ふたり対戦モードは制作中です");

});
