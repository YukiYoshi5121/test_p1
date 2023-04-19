import { useState, useEffect } from "react";

import Header1 from './Header1';
import './index.css';

// =================== Game5 =====================
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
    <button className={`square ${props.assist} ${props.basePoint}`.trim()} onClick={() => { props.onClick(); }} >
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
              let assist = (
                props.assist.map( (ass:any) => { return (ass.row === row && ass.col === col)} ).includes(true)
              ) ? 'assist' : '';
              let basePoint = (props.basePoint.i === row && props.basePoint.j === col ) ? 'basepoint' : '';
              return (
                <Square key={col}
                  value={ props.squares[row][col] }
                  assist={ assist }
                  basePoint={ basePoint }
                  onClick={ assist !== '' ? (() => props.onClick(row,col)) : (()=>{})}
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
      dirAssist: [],
      blackIsNow: true,
      blackIsPrev: false,
      cannotPlace: false,
      basePoint: {i:-1,j:-1},
      onChain: false,
      chainSum: 0,
      chainCnt: 0,
      scoreP1: 0,
      scoreP2: 0,
    }]
  );
  const [stepNumber, setStepNumber] = useState(0);

  // マスクリック
  const handleClick = (i:number, j:number) => {
    //多次元配列の中身までディープコピー
    const tempHistory =  JSON.parse(JSON.stringify(history.slice(0, stepNumber + 1)));
    const current = tempHistory[tempHistory.length - 1];
    const squares = JSON.parse(JSON.stringify(current.squares));
    let blackIsNow = current.blackIsNow;
    let cannotPlace = false;
    let onChain = current.onChain;
    let assist = current.assist, dirAssist = current.dirAssist;
    let sum = 0;
    let scoreP1 = current.scoreP1, scoreP2 = current.scoreP2;
    if(calculateWinner(squares)) {
      return;
    }

    if(!onChain) {
      // 自由マス選択　⇒　方向決め
      // 点(i,j)に置いた場合に返るマス計算（8方向）
      const reverseSquaresDir = calculateBePlaceable(i, j, blackIsNow, squares, onChain);
      assist = [];
      dirAssist = [];
      let available = false;
      for (let a = 0; a < reverseSquaresDir.length; a++) {
        const revSquares = reverseSquaresDir[a];
        if( revSquares.length > 0) {
          assist = [...assist, {row:revSquares[0].row,col:revSquares[0].col}];
          dirAssist = [...dirAssist, revSquares];
          available = true;
        }
        else {
          assist = [...assist, {row:-1,col:-1}];
          dirAssist = [...dirAssist, []];
        }
      }
      if(!available) { return; }
      squares[i][j] = blackIsNow ? player1: player2;
      setHistory(
        tempHistory.concat([{
          squares: squares,
          assist: assist,
          dirAssist: dirAssist,
          blackIsNow: blackIsNow,
          blackIsPrev: blackIsNow,
          cannotPlace: cannotPlace,
          basePoint: {i:i,j:j},
          onChain: true,
          chainSum: 0,
          chainCnt: 0,
          scoreP1: scoreP1,
          scoreP2: scoreP2,
        }])
      );
      setStepNumber(tempHistory.length);
    }
    else {
      // 方向決め　⇒　返し　⇒　連鎖判定　（⇒　ループ)　⇒　自由マス選択
      // 選択した方向の返し
      let point = {row:-1,col:-1};
      for (let a = 0; a < assist.length; a++) {
        const revSquare = assist[a];
        if( revSquare.row === i && revSquare.col === j) {
          const player = blackIsNow ? player1: player2;
          const dir = dirAssist[a];
          squares[i][j] = player;
          for (let t = 0; t < dir.length; t++) {
            const rev = dir[t];
            squares[rev.row][rev.col] = player;
          }
          // 返したマス数カウント
          sum = dir.length;
          point = {row: dir[dir.length-1].row, col: dir[dir.length-1].col}
        }
      }
      // 返し最後の点(point)を起点に返るマス計算（8方向）
      const reverseSquaresDir = calculateBePlaceable(point.row, point.col, blackIsNow, squares, onChain);
      assist = [];
      dirAssist = [];
      let nextChain = false;
      for (let a = 0; a < reverseSquaresDir.length; a++) {
        const revSquares = reverseSquaresDir[a];
        if( revSquares.length > 0) {
          assist = [...assist, {row:revSquares[0].row,col:revSquares[0].col}];
          dirAssist = [...dirAssist, revSquares];
          nextChain = true;
        }
        else {
          assist = [...assist, {row:-1,col:-1}];
          dirAssist = [...dirAssist, []];
        }
      }

      // 連鎖判定
      if(nextChain){
        setHistory(
          tempHistory.concat([{
            squares: squares,
            assist: assist,
            dirAssist: dirAssist,
            blackIsNow: blackIsNow,
            blackIsPrev: blackIsNow,
            cannotPlace: cannotPlace,
            basePoint: {i:point.row, j:point.col},
            onChain: nextChain,
            chainSum: current.chainSum + sum,
            chainCnt: current.chainCnt + 1,
            scoreP1: scoreP1,
            scoreP2: scoreP2,
          }])
        );
        setStepNumber(tempHistory.length);
      }
      else {
        // 次の手番が置ける可能性のあるマス計算
        // 次の手番が置けなければパスして自分の手番になる。自分も置けなければエンドフラグが立つ
        scoreP1 = ( blackIsNow) ? scoreP1 + (current.chainSum+sum)*(current.chainCnt+1) : scoreP1;
        scoreP2 = (!blackIsNow) ? scoreP2 + (current.chainSum+sum)*(current.chainCnt+1) : scoreP2;
        let blackIsPrev = blackIsNow;
        let assist = checkAvailable(!blackIsNow, squares, nextChain);
        if( assist.length > 0 ) {
          blackIsNow = !blackIsNow;
        }
        else {
          assist = checkAvailable(blackIsNow, squares, nextChain);
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
            dirAssist: dirAssist,
            blackIsNow: blackIsNow,
            blackIsPrev: blackIsPrev,
            cannotPlace: cannotPlace,
            basePoint: {i:-1, j:-1},
            onChain: nextChain,
            chainSum: current.chainSum + sum,
            chainCnt: current.chainCnt + 1,
            scoreP1: scoreP1,
            scoreP2: scoreP2,
          }])
        );
        setStepNumber(tempHistory.length);
      }
    }
  };

  // 点(i,j)に置いた場合に返るマス計算（8方向）
  const calculateBePlaceable = (i:number, j:number, n:boolean, squares:any[][], onChain:boolean) => {
    const main = n ? player1: player2;
    const sub = main === player1 ? player2 : player1;
    let reverse:any[] = [];
    if(onChain || squares[i][j] === null) {
      for (let d = 0; d < directions.length; d++) {
        const dir = directions[d].dir;
        let row = i, col = j, temp:any[] = [];
        while(
          row+dir.y >= 0 && row+dir.y < sizeH && col+dir.x >= 0 && col+dir.x < sizeW
        ){
          if(squares[row+dir.y][col+dir.x] === sub) {
            row += dir.y; col += dir.x;
            //temp = [{row:row,col:col}, ...temp]; // 確認先が自分以外ならカウント(最後の返しマスが先頭)
            temp = [...temp, {row:row,col:col}]; // 確認先が自分以外ならカウント(最後の返しマスが先頭)
          }
          else {
            if(squares[row+dir.y][col+dir.x] === main) {
              //temp = temp.length > 0 ? [...temp, {row:i,col:j}] : temp; // 返すマスがあれば(i,j)追加
              reverse = [...reverse, temp]; // 確認先が自分ならそれまでのカウントを保存
            }
            else {
              reverse = [...reverse, []];
            }
            break;
          }
        }
      }
      //if(reverse.length > 0) { reverse = [{row:i,col:j}, ...reverse]; }
    }
    return reverse;
  };
  // 次の手番が置ける可能性のあるマス計算
  const checkAvailable = (n:boolean, squares:any[][], onChain:boolean) => {
    let arr:any[] = [];
    for (let i = 0; i < sizeH; i++) {
      for (let j = 0; j < sizeW; j++) {
        //if(squares[i][j] !== null) { continue; }
        const reverseSquares = calculateBePlaceable(i, j, n, squares, onChain);
        for (let a = 0; a < reverseSquares.length; a++) {
          const rev= reverseSquares[a];
          if(rev.length > 0) {
            arr = [{row:i,col:j} ,...arr];
          }
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
          cntP1 += (squares[i][j] === player1) ? 1 : 0;
          cntP2 += (squares[i][j] === player2) ? 1 : 0;
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
    //squares[sizeH/2-1][sizeW/2-1] = player1;
    //squares[sizeH/2-1][sizeW/2  ] = player2;
    //squares[sizeH/2  ][sizeW/2-1] = player2;
    //squares[sizeH/2  ][sizeW/2  ] = player1;

    squares[0] = [null,null,null,null,null,null,null,null,];
    squares[1] = ['◇','◆',null,null,null,null,null,null,];
    squares[2] = ['◆','◇','◆',null,null,'◆','◇',null,];
    squares[3] = [null,'◆','◇','◇','◇','◇',null,'◇',];
    squares[4] = [null,'◇','◇','◇','◇','◆','◆','◆',];
    squares[5] = ['◆','◆','◇','◇','◆','◆',null,null,];
    squares[6] = [null,null,'◇','◇','◆','◆','◇',null,];
    squares[7] = [null,null,null,null,null,'◆',null,null,];

    /*squares[0] = ['◆','◇',null,null,null,null,null,null,];
    squares[1] = ['◆','◇',null,null,null,null,null,null,];
    squares[2] = ['◆','◇',null,null,null,null,null,null,];
    squares[3] = ['◆','◇',null,null,null,null,null,null,];
    squares[4] = ['◆','◇',null,null,null,null,null,null,];
    squares[5] = ['◆','◇',null,null,null,null,null,null,];
    squares[6] = ['◆','◇',null,null,null,null,null,null,];
    squares[7] = ['◆','◇',null,null,null,null,null,null,];*/



    const blackIsNow = tempHistory[0].blackIsNow;
    const assist = checkAvailable(blackIsNow, squares, false);
    setHistory(
      [{
        squares: squares,
        assist: assist,
        dirAssist: [],
        blackIsNow: true,
        blackIsPrev: false,
        cannotPlace: false,
        basePoint: {i:-1, j:-1},
        onChain: false,
        chainSum: 0,
        chainCnt: 0,
        scoreP1: 0,
        scoreP2: 0,
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

  // ステータス
  let status = '';
  if(winner) {
    status = winner.cntP1 > winner.cntP2 ? 'WInner: ' + player1 : (
      winner.cntP1 < winner.cntP2 ? 'WInner: ' + player2 : 'Draw game...'
    )
  }
  else {
    status = 'Next player: ' + (current.blackIsNow ? player1: player2);
  }
  // スコア
  let score0 = 'Score:',
      score1 = (' '+ player1 + ': ' + current.scoreP1),
      score2 = (' '+ player2 + ': ' + current.scoreP2);
  if(current.chainCnt > 0) {
    let sc = '';
    if(current.onChain) {
      sc = '( ' + current.chainSum + ' x ' + current.chainCnt + ' )';
    }
    else {
      sc = '( += ' + current.chainSum + ' x ' + current.chainCnt + ' )';
    }
    if(current.blackIsPrev) { score1 += sc; }
    else {                    score2 += sc; }
  }

  // render
  return (
    <div>
      <Header1 />
      <div className='game-title'>連鎖オセロ</div>
      <div className="game game5">
        <div className="game-board">
          <Board 
            squares={current.squares}
            assist={current.assist}
            basePoint={current.basePoint}
            onClick={(i:number, j:number) => handleClick(i,j)}
          />
        </div>
        <div className="game-info">
          <div style={{height: 30}}>{status}</div>
          <div style={{height: 21}}>{score0}</div>
          <div style={{height: 21}}>&nbsp;{score1}</div>
          <div style={{height: 21}}>&nbsp;{score2}</div>
          <ol className='game5'>{moves}</ol>
        </div>
      </div>
      <div className='rule'>
        <div>
          <ul>
            <li>遊び方：</li>
            <ul>
              <li>・普通じゃないオセロ</li>
              <li>・置けるマスを赤色で表示</li>
              <li>・一方向にのみ裏返すことが出来る</li>
              <li>・最後に裏返したマスから連鎖する</li>
            </ul>
            <li>スコア計算：</li>
            <ul>
              <li>・連鎖数ｘ裏返したコマ数</li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default Othello;

