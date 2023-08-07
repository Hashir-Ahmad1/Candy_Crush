import { useEffect, useRef, useState } from 'preact/hooks';
import './app.css';
import blueCandy from './images/blue-candy.png';
import greenCandy from './images/green-candy.png';
import orangeCandy from './images/orange-candy.png';
import purpleCandy from './images/purple-candy.png';
import redCandy from './images/red-candy.png';
import yellowCandy from './images/yellow-candy.png';
import blank from './images/blank.png';

const WIDTH = 8;
const candyColors = [
  blueCandy,
  greenCandy,
  orangeCandy,
  purpleCandy,
  redCandy,
  yellowCandy,
];

export function App() {
  const [candies, setCandies] = useState([]);
  const [score , setScore] = useState(0);
  const [candyDragged,setCandyDragged]=useState(null);
  const [candyToReplace,setCandyToReplace]=useState(null);
  const currentCandies=useRef([])

  const playSound=(id)=>{
    document.getElementById(id).play();
  }
  const setColToBlank=(index)=>{
    const col=index%WIDTH;
    for (let i = 0; i < WIDTH; i++) {
      currentCandies.current[col+i*WIDTH].color=blank; 
      currentCandies.current[col+i*WIDTH].modifier=''; 
    }
    updateScore(WIDTH)
    playSound('line_blast')
  }
  const setRowToBlank=(index)=>{
    const row=Math.floor(index/WIDTH);
    for (let i = row*WIDTH; i < (row*WIDTH+WIDTH); i++) {
      currentCandies.current[i].color=blank; 
      currentCandies.current[i].modifier="";    
    }
    updateScore(WIDTH)
    playSound('line_blast')
  }
  const checkforColumns=(num,indexes=null)=>{
    for (let i = 0; i < (WIDTH*WIDTH-(num-1)*WIDTH); i++) {
      const columns=[];
      for (let j = 0; j < num; j++) {
        columns.push(i+j*WIDTH)
      }
      const decidedColor=currentCandies.current[i].color
      const empty=decidedColor===blank
      if(empty) continue
      if(columns.every(c=>currentCandies.current[c].color===decidedColor)){
        updateScore(num)
        playSound('simple_blast')
        let specialCandyIndex=-1
        if(num>3){
          specialCandyIndex=columns.findIndex(col=>indexes?.includes(col))
          if(specialCandyIndex===-1){
            specialCandyIndex=0;
          }
        }
        for (let j = 0; j < columns.length; j++) {
          if(j===specialCandyIndex){
            playSound('striped_candy_created');
            currentCandies.current[columns[j]].modifier="horizontal"; 
            continue;
          }
          if(currentCandies.current[columns[j]].modifier){
            if(currentCandies.current[columns[j]].modifier==='vertical') setColToBlank(columns[j])
            if(currentCandies.current[columns[j]].modifier==='horizontal') setRowToBlank(columns[j])
          }
          else{
            currentCandies.current[columns[j]].color=blank; 
            currentCandies.current[columns[j]].modifier=""; 
          }
        }
        return true
      } 
    }
  }
  const checkforRows =(num,indexes=null)=>{
    for (let i = 0; i < WIDTH*WIDTH; i++) {
      const rows=[];
      for (let j = 0; j < num; j++) {
        rows.push(i+j)
      }
      const decidedColor=currentCandies.current[i].color
      const empty=decidedColor===blank
      if((WIDTH-(i%WIDTH)<num)||empty) continue

      if(rows.every(c=>currentCandies.current[c].color===decidedColor)){
        updateScore(num)
        playSound('simple_blast')
        let specialCandyIndex=-1
        if(num>3){
          specialCandyIndex=rows.findIndex(row=>indexes?.includes(row))
          if(specialCandyIndex===-1){
            specialCandyIndex=0;
          }
        }
        for (let j = 0; j < rows.length; j++) {
          if(j===specialCandyIndex){
            playSound('striped_candy_created');
            currentCandies.current[rows[j]].modifier="vertical"; 
            continue;
          }
          if(currentCandies.current[rows[j]].modifier){
            if(currentCandies.current[rows[j]].modifier==='vertical') setColToBlank(rows[j])
            if(currentCandies.current[rows[j]].modifier==='horizontal') setRowToBlank(rows[j])
          }
          else{
            currentCandies.current[rows[j]].color=blank;
            currentCandies.current[rows[j]].modifier='';
          }
        }
        return true
      } 
    }
  }
  const updateScore=(num)=>{
    setScore(prevScore=>prevScore+num)
  }
  const moveIntoSquareBelow=()=>{
    for (let i = 0; i< (WIDTH*WIDTH-WIDTH); i++) {
      const isFirstRow=i<WIDTH;

      if(isFirstRow && currentCandies.current[i].color===blank){
        const randomColor=candyColors[Math.floor(Math.random()*candyColors.length)];
        currentCandies.current[i].color=randomColor;
        currentCandies.current[i].modifier='';
      }
      if(currentCandies.current[i+WIDTH].color===blank){
        currentCandies.current[i+WIDTH].color=currentCandies.current[i].color;
        currentCandies.current[i+WIDTH].modifier=currentCandies.current[i].modifier;
        currentCandies.current[i].color=blank
        currentCandies.current[i].modifier='';
      }
     
    }
  }
  const dragStart=(e)=>{
    setCandyDragged(e.target)
  }
  const dragDrop=(e)=>{
    setCandyToReplace(e.target)
  }
  const dragEnd=(e)=>{
    const candyDraggedIndex=parseInt(candyDragged.getAttribute('data-index'))
    const candyToReplaceIndex=parseInt(candyToReplace.getAttribute('data-index'))

    const validMoves=[
      candyDraggedIndex-WIDTH,
      candyDraggedIndex+WIDTH,
      candyDraggedIndex-1,
      candyDraggedIndex+1
    ]
    const isValid=validMoves.includes(candyToReplaceIndex)
    if(!isValid)return ;

    //check for 2 special candies
    if(currentCandies.current[candyToReplaceIndex].modifier && currentCandies.current[candyDraggedIndex].modifier)
    {
      setRowToBlank(candyToReplaceIndex);
      setColToBlank(candyToReplaceIndex);
    }
    currentCandies.current[candyToReplaceIndex].color=candyDragged.getAttribute('data-src');
    currentCandies.current[candyToReplaceIndex].modifier=candyDragged.getAttribute('data-modifier');
    currentCandies.current[candyDraggedIndex].color=candyToReplace.getAttribute('data-src')
    currentCandies.current[candyDraggedIndex].modifier=candyToReplace.getAttribute('data-modifier');


    if(checkforColumns(4,[candyDraggedIndex,candyToReplaceIndex])||checkforColumns(3)||
        checkforRows(4,[candyDraggedIndex,candyToReplaceIndex])||checkforRows(3)){
      setCandyDragged(null)
      setCandyToReplace(null)
    }
    else{
      currentCandies.current[candyToReplaceIndex].color=candyToReplace.getAttribute('data-src');
      currentCandies.current[candyToReplaceIndex].modifier=candyToReplace.getAttribute('data-modifier');
      currentCandies.current[candyDraggedIndex].color=candyDragged.getAttribute('data-src')
      currentCandies.current[candyDraggedIndex].modifier=candyDragged.getAttribute('data-modifier')
      playSound('negative_switch') 
    }
  }
  const createBoard = () => {
    const randomCandies = [];
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
      randomCandies.push({ color: randomColor });
    }
    setCandies(randomCandies);
    currentCandies.current=randomCandies
    playSound('new_game')
  };
  useEffect(() => {
    createBoard();

    const timer= setInterval(()=>{
      checkforColumns(4)
      checkforRows(4)
      checkforColumns(3)
      checkforRows(3)
      moveIntoSquareBelow()
      setCandies([...currentCandies.current])
    },100) 
    return ()=>clearInterval(timer) 
  }, []); 

  return (
    <div className="App">
      <div className="score-board">
        <center>
          <span> <b>Candy Crush </b></span><br></br>
          <span>Score:  </span><b>{score}</b>
        </center>
      </div>
      <div className="game">
        {candies.map(({color,modifier}, index) => (
          <div
            key={index}
            className={`img-container ${modifier ? modifier: ''}`}
            data-index={index} 
            data-src={color}
            data-modifier={modifier}
            draggable={true}
            onDragStart={dragStart}
            onDragOver={e=>e.preventDefault()}
            onDragEnter={e=>e.preventDefault()}
            onDragLeave={e=>e.preventDefault()}
            onDrop={dragDrop}
            onDragEnd={dragEnd}
          >
            <img src={color} alt={color} />
          </div>
        ))}
      </div>
    </div>
  );
}
