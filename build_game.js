'use strict'; /* use strict: JS 엄격모드*/

let canvas = document.getElementById("canvas"); /*getElemetBYId로 canvas 가져오기*/
let ctx = canvas.getContext("2d"); /*ctx: 캔버스에 그리는 도구*/
let interval = setInterval(draw, 20);

let x = canvas.width/2;
let y = canvas.height-30;
let dx = 2;
let dy = -2;
let ballRadius = 10;
/*패들*/
let paddleWidth = 100;
let paddleHeight = 10;
let paddleX = (canvas.width-paddleWidth)/2;
/*키보드 사용 */
let rightPressed = false;
let leftPressed = false;
/*벽돌 변수*/
let brickRowCount = 4;
let brickColumnCount = 6;
let brickWidth = 110;
let brickHeight = 20;
let brickPadding = 15;
let brickOffsetTop = 30;
let brickOffsetLeft = 35;
let brickMaxHealth = 7;
let brickImmuneframe = 2;
let bricks = []; 
/*점수 변수*/
let score = 0;
/*색 변수*/
let c_ball = "#fcba03";
let c_paddle = "#000000";
let c_brickFull = "#8c009c";
let c_brickLow = "#e5dce6";
let c_scorefont = "#000000";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

for(let c=0; c<brickColumnCount; c++){ //벽동배열
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++){ //좌표 담음
        bricks[c][r] = {x:0, y:0, status: getRandomInt(1,brickMaxHealth), immst: 0};
    }
}

/*mouse ctr*/
document.addEventListener("mousemove", mouseMoveHandler, false);
function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e){
    if(e.KeyCode == "Right" || e.key == "ArrowRight"){
        rightPressed = true;
    }
    else if(e.KeyCode == "left" || e.key == "ArrowLeft"){
        leftPressed = true;
    }
}

function keyUpHandler(e){
    if(e.KeyCode == "Right" || e.key == "ArrowRight"){
        rightPressed = false;
    }
    else if(e.KeyCode == "left" || e.key == "ArrowLeft"){
        leftPressed = false;
    }
}

function drawBall(){
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI*2);
    ctx.fillStyle = c_ball;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = c_paddle;
    ctx.fill();
    ctx.closePath;
}

function int_to_hex(num)
{
    let hex = Math.round(num).toString(16);
    if (hex.length == 1)
        hex = '0' + hex;
    return hex;
}

function blendColor(c1, c2, percentage){
    let color1 = c1;
    let color2 = c2;

    /*Convert hex char*/
    if (color1.length == 4)
        color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
    else
        color1 = color1.substring(1);
    if (color2.length == 4)
        color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
    else
        color2 = color2.substring(1);
    
    /*Hex to int*/
    color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
    color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

    /*Blending*/
    let color3 = [ 
        (1 - percentage) * color1[0] + percentage * color2[0], 
        (1 - percentage) * color1[1] + percentage * color2[1], 
        (1 - percentage) * color1[2] + percentage * color2[2]
    ];

    color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);

    return color3;
}

function drawBricks(){
    for(let c=0; c<brickColumnCount; c++){
        for( let r=0; r<brickRowCount; r++){
            if(bricks[c][r].status!=0) {
                let brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                let brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = blendColor(c_brickLow,c_brickFull, bricks[c][r].status / brickMaxHealth);
                ctx.fill();
                ctx.closePath();
            }

        }
    }
}

/*Decrease immune status every draw frame*/
function decreaseImst() {
    for(let c=0; c<brickColumnCount; c++){
        for(let r=0; r<brickRowCount; r++){
            if(bricks[c][r].immst>0) bricks[c][r].immst--;
        }
    }
}

function winCheck() {
    if(score == brickColumnCount*brickRowCount) {
        gameOver("YOU WIN, CONGRATULATIONS!");
    }
}

function collisionDetection(){
    for(let c=0; c<brickColumnCount; c++){
        for(let r=0; r<brickRowCount; r++){
            let b = bricks[c][r];
            if(b.status!=0){
                if(b.x < x && b.x+brickWidth > x && b.y < y && b.y+brickHeight > y) {
                    if(b.immst!=0){ /*check immune*/
                        b.immst = brickImmuneframe;
                        continue;
                    }
                    dy = -dy;
                    b.immst = brickImmuneframe;
                    if(--b.status == 0){
                        score++;
                        winCheck();
                    }
                }
            }
        }
    }
}

function gameOver(str){
    alert(str);
    document.location.reload();
    clearInterval(interval);
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = c_scorefont;
    ctx.fillText("Score: "+score, 8, 20);
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);                /* 움직이는건 다 여기 */
    drawBricks();
    drawBall(); //ball
    drawPaddle();
    drawScore();
    decreaseImst();
    collisionDetection();
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius){     /*벽 튕기기*/
        dx = -dx;
    }
    if(y + dy > canvas.height-ballRadius || y + dy < ballRadius){    /*벽 튕기기*/
        dy = -dy;
    }
    //paddle
    if(rightPressed && paddleX < canvas.width-paddleWidth){
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0){
        paddleX -= 7;
    }
    x += dx;
    y += dy;
    //game over
    if(y + dy < ballRadius){ //아랫면 닿으면 끝
        dy = -dy;
    }
    else if(y+ dy > canvas.height-ballRadius){
        if(x > paddleX && x < paddleX + paddleWidth){
            dy = -dy;
        }
        else{
            gameOver("Game Over.");
        }
    }
}




setInterval(draw, 10);