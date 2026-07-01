const overlay=document.getElementById("resultOverlay");
const resultText=document.getElementById("resultText");

document.getElementById("restartBtn").onclick=restartGame;
const board=[];
const SIZE=8;

const EMPTY=0;
const BLACK=1;
const WHITE=2;

const boardDiv=document.getElementById("board");

let turn=BLACK;

const dirs=[
[-1,-1],[-1,0],[-1,1],
[0,-1],[0,1],
[1,-1],[1,0],[1,1]
];

function init(){

for(let y=0;y<SIZE;y++){

board[y]=[];

for(let x=0;x<SIZE;x++){

board[y][x]=EMPTY;

}

}

board[3][3]=WHITE;
board[3][4]=BLACK;
board[4][3]=BLACK;
board[4][4]=WHITE;

draw();

}

function draw(){

boardDiv.innerHTML="";

let black=0;
let white=0;

for(let y=0;y<SIZE;y++){

for(let x=0;x<SIZE;x++){

const cell=document.createElement("div");
cell.className="cell";

cell.onclick=()=>playerMove(x,y);

if(board[y][x]==BLACK){

const d=document.createElement("div");
d.className="black";
cell.appendChild(d);
black++;

}

if(board[y][x]==WHITE){

const d=document.createElement("div");
d.className="white";
cell.appendChild(d);
white++;

}

boardDiv.appendChild(cell);

}

}

document.getElementById("black").textContent=black;
document.getElementById("white").textContent=white;

}

function canPut(x,y,color){

if(board[y][x]!=EMPTY)return false;

const enemy=color==BLACK?WHITE:BLACK;

for(const d of dirs){

let nx=x+d[0];
let ny=y+d[1];

let found=false;

while(nx>=0&&ny>=0&&nx<8&&ny<8){

if(board[ny][nx]==enemy){

found=true;

}

else if(board[ny][nx]==color){

if(found)return true;
break;

}

else{

break;

}

nx+=d[0];
ny+=d[1];

}

}

return false;

}

function flip(x,y,color){

const enemy=color==BLACK?WHITE:BLACK;

board[y][x]=color;

for(const d of dirs){

let list=[];

let nx=x+d[0];
let ny=y+d[1];

while(nx>=0&&ny>=0&&nx<8&&ny<8){

if(board[ny][nx]==enemy){

list.push([nx,ny]);

}

else if(board[ny][nx]==color){

for(const p of list){

board[p[1]][p[0]]=color;

}

break;

}

else{

break;

}

nx+=d[0];
ny+=d[1];

}

}

}

function playerMove(x,y){

if(turn!=BLACK)return;

if(!canPut(x,y,BLACK))return;

flip(x,y,BLACK);

draw();

turn=WHITE;

setTimeout(cpuMove,500);

}

function cpuMove(){

let list=[];

for(let y=0;y<8;y++){

for(let x=0;x<8;x++){

if(canPut(x,y,WHITE)){

list.push([x,y]);

}

}

}

if(list.length==0){

turn=BLACK;

document.getElementById("message").textContent="CPUはパス";

return;

}

const p=list[Math.floor(Math.random()*list.length)];

flip(p[0],p[1],WHITE);

draw();

turn=BLACK;

document.getElementById("message").textContent="あなたの番";

}
init();
function gameEnd(){

    let black=0;
    let white=0;

    for(let y=0;y<8;y++){

        for(let x=0;x<8;x++){

            if(board[y][x]==BLACK) black++;

            if(board[y][x]==WHITE) white++;

        }

    }

    if(black>white){

        resultText.textContent="🎉 あなたの勝ち！";

    }

    else if(white>black){

        resultText.textContent="😢 あなたの負け";

    }

    else{

        resultText.textContent="🤝 引き分け";

    }

    overlay.style.display="flex";

}
