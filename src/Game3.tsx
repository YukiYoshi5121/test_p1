import { useState, useRef } from "react";
import { useKey } from 'rooks';

import Header1 from './Header1';
import useInterval from './useInterval';
import './index.css';

// =================== Game3 =====================
const sizeH = 20, sizeW = 20;
const directions = [
  {dir:{y:-1,x:0}, val:'▲'}, {dir:{y:0,x:1}, val:'▶'},
  {dir:{y:1,x:0}, val:'▼'}, {dir:{y:0,x:-1}, val:'◀'},
  {dir:{y:0,x:0}, val:'X'},
]; // 上右下左 + ERR


function Square(props:any) {
  return (
    <button className={`square`.trim()} >
      {props.value}
    </button>
  );
}
function Board(props:any) {
  return (
    <div>
      {Array(sizeH).fill(null).map((stepr,row) => {
        return (
          <div key={row} className="board-row">
            {Array(sizeW).fill(null).map((stepc,col) => {
              return (
                <Square key={col}
                  value={ props.squares[row][col] }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function SnakeGame() {
  // 初期は先頭のみ
  const [snakeBody, setSnakeBody] = useState([{y:3,x:4},]);
  const [snakeLength, setSnakeLength] = useState(1);
  // 方向転換では再描画しない
  const currentDirection = useRef(1);

  const isGameover = useRef(false);
  const [isEasy, setIsEasy] = useState(false);

  // 餌の座標
  const [itemPoint, setItemPoint] = useState({
    y: Math.floor( Math.random() * sizeH ), 
    x: Math.floor( Math.random() * sizeW )
  });

  // interval用
  const [delay, setDelay] = useState(200);
  const [isRunning, setIsRunning] = useState(false);
  // key入力用
  useKey('ArrowUp',    () => { console.log('UP');if(currentDirection.current !== 2 && isRunning){ currentDirection.current = 0; }});
  useKey('ArrowRight', () => { console.log('Right');if(currentDirection.current !== 3 && isRunning){ currentDirection.current = 1; }});
  useKey('ArrowDown',  () => { if(currentDirection.current !== 0 && isRunning){ currentDirection.current = 2; }});
  useKey('ArrowLeft',  () => { if(currentDirection.current !== 1 && isRunning){ currentDirection.current = 3; }});

  // 衝突チェック
  const chkConflict = (row:number, col:number) => {
    for(let a=0; a<snakeBody.length; a++){
      // 自分に当たった場合
      if( row === snakeBody[a].y && col === snakeBody[a].x ) {
        currentDirection.current = 4;
        return isGameover.current = true;
      }
    }
    // 壁に当たった場合
    if( row < 0 || row >= sizeH || col < 0 || col >= sizeW ){  
      currentDirection.current = 4;
      return isGameover.current = true;
    }
    // 餌に当たった場合
    if( row === itemPoint.y && col === itemPoint.x ) {
      // 体を伸ばす
      setSnakeLength(snakeLength + 1);
      // 速度アップ
      setDelay( !isEasy ? (delay * 0.98) : (delay * 0.99));
      // 次の餌を出す
      setItemPoint({
        y: Math.floor( Math.random() * sizeH ), 
        x: Math.floor( Math.random() * sizeW )
      });
      return isGameover.current = false;
    }
    return isGameover.current = false;
  };

  // ahead
  useInterval(() => {
    let nextRow = snakeBody[0].y + directions[currentDirection.current].dir.y;
    let nextCol = snakeBody[0].x + directions[currentDirection.current].dir.x;
    if(isEasy){ // 端は反対にワープ
      nextRow = nextRow < sizeH ? nextRow : 0;
      nextRow = nextRow >= 0 ? nextRow : sizeH - 1; 
      nextCol = nextCol < sizeW ? nextCol : 0;
      nextCol = nextCol >= 0 ? nextCol : sizeW - 1;
    }
    else { // 端は死
    }
    if( !chkConflict(nextRow, nextCol) ) {
      setSnakeBody([{ y: nextRow, x: nextCol }, ...snakeBody].slice(0, snakeLength));
    }
    else {
      stopAndGo();
    }
  }, isRunning ? delay : null);

  // stop & go
  const stopAndGo = () => {
    setIsRunning(!isRunning);
  };
  // restart
  const restart = () => {
    // 初期は先頭のみ
    setSnakeBody([{y:3,x:4},]);
    setSnakeLength(1);
    // 方向転換では再描画しない
    currentDirection.current = 1;

    // 餌の座標
    setItemPoint({
      y: Math.floor( Math.random() * sizeH ), 
      x: Math.floor( Math.random() * sizeW )
    });

    // interval用
    setDelay(200);
    setIsRunning(false);

    // flagリセット
    setIsEasy(false);
    isGameover.current = false;
  };
  // course change
  const toEasy = (flg:boolean) => {
    setIsEasy(flg);
  };

  // 盤面セット
  const squares = Array(sizeH).fill(0).map(row => new Array(sizeW).fill(null));
  for(let a=snakeBody.length-1; a>=0; a--){
    let {y,x} = snakeBody[a];
    if(a===0){
      squares[y][x] = directions[currentDirection.current].val;
    }
    else {
      squares[y][x] = '●';
    }
  }
  let {y,x} = itemPoint;
  squares[y][x] = 'Q';

  // 獲得数
  let status = snakeLength - 1;
  // ボタン設定
  const ctrlRun = !isGameover.current ? (
    <button className='' onClick={() => {stopAndGo()}}>
      { !isRunning ? "開始" : "一時停止" }
    </button>
  ) : (
    <button className='' onClick={() => {restart()}}>
      { "リスタート" }
    </button>
  );
  const ctrlCourse = !isGameover.current && snakeBody.length === 1? (
    <div>
      <button className='' onClick={() => {toEasy(!isEasy)}}>
        { !isEasy ? "初心者コースへ" : "通常コースへ" }
      </button>
    </div>
  ) : (
    <div>
    </div>
  );
  return (
    <div>
      <Header1 />
      <div className='game-title'>スネーク {isEasy ? "(初心者コース)" : ""}</div>
      <div className="game game3">
        <div className="game-board">
          <Board 
            squares={squares}
          />
        </div>
        <div className="game-info">
          <div style={{height: 21}}>Score: {status} pt.</div>
          <div style={{height: 21}}>delay: {(delay * 0.001).toFixed(3)} sec.</div>
          <br /><br />
          { ctrlRun }
          <br />
          { ctrlCourse }
        </div>
      </div>
      <div className='rule'>
        <div>
          <ul>
            <li>遊び方：</li>
            <ul>
              <li>・「Q」を集めてより長くなる</li>
              <li>・外枠または自分の体に当たると終了</li>
            </ul>
          </ul>
        </div>
      </div>
      <div className='rule_side3'>
        <div>
          <ul>
            <li>通常コース：</li>
            <ul>
              <li>・伸びるごとに加速</li>
            </ul>
            <li>初心者コース：</li>
            <ul>
              <li>・外枠は逆側にワープ</li>
              <li>・加速が緩やか</li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default SnakeGame;

