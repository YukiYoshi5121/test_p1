import { useState, useEffect } from "react";

import Header1 from './Header1';
import './index.css';

// =================== Game4 =====================
const sizeH = 8, sizeW = 8; // even required
const player1 = '◆', player2 = '◇';
const directions = [
  {dir:{y:-1,x: 0}, val:''},
  {dir:{y:-1,x: 1}, val:''},
  {dir:{y: 0,x: 1}, val:''},
  {dir:{y: 1,x: 1}, val:''},
  {dir:{y: 1,x: 0}, val:''},
  {dir:{y: 1,x:-1}, val:''},
  {dir:{y: 0,x:-1}, val:''},
  {dir:{y:-1,x:-1}, val:''},
];

function Square(props:any) {
  return (
    <button className={`square ${props.assist}`.trim()} onClick={() => { props.onClick(); }} >
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
                  assist={ (
                    props.assist.map( (ass:any) => { return (ass.row === row && ass.col === col)} ).includes(true)
                  ) ? 'assist' : '' }
                  onClick={ () => props.onClick(row,col) }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Othello() {
  //state
  const [history, setHistory] = useState(
    [{
      squares: Array(sizeH).fill(0).map(row => new Array(sizeH).fill(null)),
      assist: Array(0).fill({}),
      blackIsNext: true,
      cannotPlace: false,
    }]
  );
  const [stepNumber, setStepNumber] = useState(0);

  // マスクリック
  const handleClick = (i:number, j:number) => {
    //多次元配列の中身までディープコピー
    const tempHistory =  JSON.parse(JSON.stringify(history.slice(0, stepNumber + 1)));
    const current = tempHistory[tempHistory.length - 1];
    const squares = JSON.parse(JSON.stringify(current.squares));
    let blackIsNext = current.blackIsNext;
    let cannotPlace = false;
    if(squares[i][j] || calculateWinner(squares)) {
      return;
    }
    // 点(i,j)に置いた場合に返るマス計算
    const reverseSquares = calculateBePlaceable(i, j, blackIsNext, squares);
    if( reverseSquares.length > 0) {
      const player = blackIsNext ? player1: player2;
      for (let t = 0; t < reverseSquares.length; t++) {
        const rev = reverseSquares[t];
        squares[rev.row][rev.col] = player;
      }
    }
    else {
      return;
    }
    // 次の手番が置ける可能性のあるマス計算
    let assist = checkAvailable(!blackIsNext, squares);
    if( assist.length > 0 ) {
      blackIsNext = !blackIsNext;
    }
    else {
      assist = checkAvailable(blackIsNext, squares);
      if( assist.length > 0 ) {
      }
      else {
        cannotPlace = true;
      }  
    }

    setHistory(
      tempHistory.concat([{
        squares: squares,
        assist: assist,
        blackIsNext: blackIsNext,
        cannotPlace: cannotPlace,
      }])
    );
    setStepNumber(tempHistory.length);
  };
  // 点(i,j)に置いた場合に返るマス計算
  const calculateBePlaceable = (i:number, j:number, n:boolean, squares:any[][]) => {
    const main = n ? player1: player2;
    const sub = main === player1 ? player2 : player1;
    let reverse:any[] = [];
    if(squares[i][j] === null) {
      for (let d = 0; d < directions.length; d++) {
        const dir = directions[d].dir;
        let row = i, col = j, temp:any[] = [];
        while(
          row+dir.y >= 0 && row+dir.y < sizeH && col+dir.x >= 0 && col+dir.x < sizeW
        ){
          if(squares[row+dir.y][col+dir.x] === sub) {
            row += dir.y; col += dir.x;
            temp = [...temp, {row:row,col:col}]; // 確認先が自分以外ならカウント
          }
          else {
            if(squares[row+dir.y][col+dir.x] === main) {
              reverse = [...reverse, ...temp]; // 確認先が自分ならそれまでのカウントを保存
            }
            break;
          }
        }
      }
      if(reverse.length > 0) { reverse = [{row:i,col:j}, ...reverse]; }
    }
    return reverse;
  };
  // 次の手番が置ける可能性のあるマス計算
  const checkAvailable = (n:boolean, squares:any[][]) => {
    let arr:any[] = [];
    for (let i = 0; i < sizeH; i++) {
      for (let j = 0; j < sizeW; j++) {
        //if(squares[i][j] !== null) { continue; }
        const reverseSquares = calculateBePlaceable(i, j, n, squares);
        if(reverseSquares.length > 0) {
          arr = [{row:i,col:j} ,...arr];
        }
      }      
    }
    return arr; 
  };
  // 勝敗判定
  const calculateWinner = (history:any) => {
    if(history.cannotPlace) {
      const squares = history.squares;
      let cntP1 = 0, cntP2 = 0;
      for (let i = 0; i < sizeH; i++) {
        for (let j = 0; j < sizeW; j++) {
          cntP1 += squares[i][j] === player1 ? 1 : 0;
          cntP2 += squares[i][j] === player2 ? 1 : 0;
        }      
      }
      return {cntP1, cntP2};
    }
    return null;
  };
  const jumpTo = (move:number) => {
    setStepNumber(move);
  };

  // init
  useEffect(() => {
    const squares = JSON.parse(JSON.stringify(history[0].squares));
    squares[sizeH/2-1][sizeW/2-1] = player1;
    squares[sizeH/2-1][sizeW/2  ] = player2;
    squares[sizeH/2  ][sizeW/2-1] = player2;
    squares[sizeH/2  ][sizeW/2  ] = player1;
    const blackIsNext = tempHistory[0].blackIsNext;
    const assist = checkAvailable(blackIsNext, squares);
    setHistory(
      [{
        squares: squares,
        assist: assist,
        blackIsNext: true,
        cannotPlace: false,
      }]
    );
  }, []);

  //main
  const tempHistory = history;
  const current = tempHistory[stepNumber];
  const winner = calculateWinner(current);

  const historyLength = tempHistory.length-1;
  const winCnt = calculateWinner(tempHistory[historyLength]) ? historyLength : null;

  //ログ
  const moves = tempHistory.map((step, s) => {
    const desc = s ? '第 '+s+' 手目' : '初めから';
    return (
      <li key={s} style={{order: -s}}>
        <button className={s===winCnt ? 'winner' : ''} onClick={() => {jumpTo(s)}}>{desc}</button>
      </li>
    );
  });

  let status = '';
  let score0 = '', score1 = '', score2 = '';
  if(winner) {
    status = winner.cntP1 > winner.cntP2 ? 'WInner: ' + player1 : (
      winner.cntP1 < winner.cntP2 ? 'WInner: ' + player2 : 'Draw game...'
    )
    score0 = 'Score:'
    score1 = (' '+ player1 + ': ' + winner.cntP1);
    score2 = (' '+ player2 + ': ' + winner.cntP2);
  }
  else {
    status = 'Next player: ' + (current.blackIsNext ? player1: player2);
  }

  // render
  return (
    <div>
      <Header1 />
      <div className='game-title'>オセロ</div>
      <div className="game game4">
        <div className="game-board">
          <Board 
            squares={current.squares}
            assist={current.assist}
            onClick={(i:number, j:number) => handleClick(i,j)}
          />
        </div>
        <div className="game-info">
          <div style={{height: 21}}>{status}</div>
          <div style={{height: 21}}>{score0}</div>
          <div style={{height: 21}}>&nbsp;{score1}</div>
          <div style={{height: 21}}>&nbsp;{score2}</div>
          <ol className='game4'>{moves}</ol>
        </div>
      </div>
      <div className='rule'>
        <div>
          <ul>
            <li>遊び方：</li>
            <ul>
              <li>・普通のオセロ</li>
              <li>・置けるマスを赤色で表示</li>
            </ul>
            <li>※オセロの初期の中央4マスは配置固定</li>
            <li>※リバーシは初期の中央4マスを双方自由に置いてから開始するらしい。オセロ⊂リバーシ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default Othello;

