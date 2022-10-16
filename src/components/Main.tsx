import { useEffect } from 'react';
import './styles/style.scss'

interface Line {
   xStart: number;
   yStart: number;
   xEnd: number;
   yEnd: number;
}

const Main = () => {
   let canvas: HTMLCanvasElement | null
   let btn: HTMLButtonElement | null

   useEffect(() => {
      canvas = document.querySelector<HTMLCanvasElement>('.canvas')
      btn = document.querySelector<HTMLButtonElement>('.btn')
      start()
   }, [])

   function start(){
      let context: CanvasRenderingContext2D | null;
      let isPressed: boolean = false;
      let ignoreMouseUp = false;
      let lines: Line[] = []
      let line: Line = {
         xStart: 0,
         yStart: 0,
         xEnd: 0,
         yEnd: 0,
      }
      if (canvas) context = canvas.getContext('2d')

      canvas?.addEventListener('mousedown', function(event) {  
         if (event.button !== 0) return;  
         isPressed = true
         line = {
            xStart: event.offsetX,
            yStart: event.offsetY,
            xEnd: event.offsetX,
            yEnd: event.offsetY,
         }
         lines.push(line)
         drawLine(line)
      }) 
      canvas?.addEventListener('mouseup', function(event) {
         if (event.button !== 0) return;
         if (ignoreMouseUp) {
            ignoreMouseUp = false; 
            return
         }
         isPressed = false; 
         draw()
         findIntersection()
      })   
      canvas?.addEventListener('mousemove', function(event) {
         if (isPressed) {
            line.xEnd = event.offsetX;
            line.yEnd = event.offsetY;
            context?.clearRect(0, 0, 1200, 500)
            drawLine(line)
            findIntersection()
            lines.pop() 
            lines.push(line)
            draw()
         }
      }) 
      canvas?.addEventListener('contextmenu', function(event) {
         event.preventDefault() 
         if (!isPressed) return 
         isPressed = false; 
         context?.clearRect(0, 0, 1200, 500) 
         lines.pop()  
         draw()
         findIntersection()
         ignoreMouseUp = true
      })
   
      function drawLine(line: Line) {
         let { xStart, yStart, xEnd, yEnd } = line
         
         context?.beginPath()
         context?.moveTo(xStart, yStart)
         context?.lineTo(xEnd, yEnd)
         context?.stroke()
      }

      function draw() {
         lines.map(line => drawLine(line))
      } 
   
      function findIntersection() {
         if (lines.length <= 1) return;
         if (lines.length === 2) intersect(0, 1);
         for (let i = 0; i < lines.length - 1; i++) {
            for (let j = i + 1; j < lines.length; j++) {
               intersect(i, j)
            }
         }
      }

      function intersect(i: number, j: number) {
         let {xStart: x1, yStart: y1, xEnd: x2, yEnd: y2,} = lines[i]
         let {xStart: x3, yStart: y3, xEnd: x4, yEnd: y4,} = lines[j]

         let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
         if (denominator === 0) {
            return false
         }
         let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
         let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
         if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false
         } 
         let x = x1 + ua * (x2 - x1)
         let y = y1 + ua * (y2 - y1)

         if (context != null) {
            context.fillStyle = '#fc0000'; 
         }  
         context?.beginPath();
         context?.arc(x, y, 5, 0, 2 * Math.PI);
         context?.stroke();
         context?.fill() 
      } 

      function getEquation(i: number) { 
         let {xStart: x1, yStart: y1, xEnd: x2, yEnd: y2,} = lines[i]
         let slope = (y2 - y1) / (x2 - x1);
         return function getEq(x: number) {
            let y = slope * (x - x1) + y1;
            return Math.round(y) 
         }
      }
  
      btn?.addEventListener('click', function(event) {
         event.preventDefault()
         lines.forEach((line, i) => {
            startCollapsing(line, i)   
            if (line.xStart === line.xEnd) lines = [...lines.slice(0, i), ...lines.slice(i)]
         })
      }) 

      function startCollapsing(line: Line, i: number) { 
         let eq = getEquation(i)
         window.requestAnimationFrame( function loop() {
            if (line.xStart < line.xEnd) {
               line.yStart = eq(++line.xStart)
               line.yEnd = eq(--line.xEnd)
            } else {
               line.yStart = eq(--line.xStart)
               line.yEnd = eq(++line.xEnd)
            }  
            if(Math.abs(line.xStart - line.xEnd) === 1) { 
               line.yStart = eq(--line.xStart)
            }    
            context?.clearRect(0, 0, 1200, 500)  
            findIntersection()
            drawLine(line)
            draw()  
            if(Math.abs(line.xStart - line.xEnd) > 0) { 
               window.requestAnimationFrame(loop)    
            }    
         }) 
      }
   }

   return (
      <div className='container'>
         <canvas className='canvas' width='1200px' height='500px'></canvas>
         <button className='btn'>Collapse lines</button>
      </div>
   ); 
}
 
export default Main;