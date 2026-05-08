import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Trash2, PaintBucket, Pencil } from 'lucide-react';

function Canvas({ socket, roomId, isDrawer }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8b5cf6');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('pencil');

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const { width, height } = parent.getBoundingClientRect();
    
    // Save current drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    contextRef.current = ctx;

    // Restore drawing
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    socket.on('draw_data', ({ x, y, lastX, lastY, color, size, type }) => {
      const ctx = contextRef.current;
      if (!ctx) return;
      if (type === 'fill') {
        floodFill(x, y, color);
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });

    socket.on('clear_canvas', () => {
      const ctx = contextRef.current;
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      socket.off('draw_data');
      socket.off('clear_canvas');
    };
  }, [socket]);

  // Update context when state changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const lastPos = useRef({ x: 0, y: 0 });

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (!isDrawer) return;
    const { x, y } = getCoordinates(e);
    
    if (tool === 'bucket') {
      floodFill(x, y, color);
      socket.emit('draw', { roomId, data: { x, y, color, type: 'fill' } });
      return;
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    lastPos.current = { x, y };
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer || tool === 'bucket') return;
    const { x, y } = getCoordinates(e);
    const ctx = contextRef.current;
    
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit('draw', {
      roomId,
      data: {
        x, y,
        lastX: lastPos.current.x,
        lastY: lastPos.current.y,
        color: color,
        size: lineWidth,
        type: 'pencil'
      }
    });

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawer) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear_canvas', roomId);
  };

  const floodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const getPixel = (x, y) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (ix < 0 || iy < 0 || ix >= canvas.width || iy >= canvas.height) return [-1, -1, -1, -1];
      const offset = (iy * canvas.width + ix) * 4;
      return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
    };

    const setPixel = (x, y, r, g, b, a) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const offset = (iy * canvas.width + ix) * 4;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = a;
    };

    const targetColor = getPixel(startX, startY);
    const fillRGB = hexToRgb(fillColor);
    
    if (colorsMatch(targetColor, [fillRGB.r, fillRGB.g, fillRGB.b, 255])) return;

    const stack = [[Math.floor(startX), Math.floor(startY)]];
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      let curX = x;
      while (curX >= 0 && colorsMatch(getPixel(curX, y), targetColor)) curX--;
      curX++;
      
      let reachTop = false;
      let reachBottom = false;
      while (curX < canvas.width && colorsMatch(getPixel(curX, y), targetColor)) {
        setPixel(curX, y, fillRGB.r, fillRGB.g, fillRGB.b, 255);
        if (y > 0) {
          if (colorsMatch(getPixel(curX, y - 1), targetColor)) {
            if (!reachTop) { stack.push([curX, y - 1]); reachTop = true; }
          } else { reachTop = false; }
        }
        if (y < canvas.height - 1) {
          if (colorsMatch(getPixel(curX, y + 1), targetColor)) {
            if (!reachBottom) { stack.push([curX, y + 1]); reachBottom = true; }
          } else { reachBottom = false; }
        }
        curX++;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const colorsMatch = (c1, c2) => {
    return Math.abs(c1[0] - c2[0]) < 10 && Math.abs(c1[1] - c2[1]) < 10 && Math.abs(c1[2] - c2[2]) < 10;
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ cursor: isDrawer ? (tool === 'bucket' ? 'cell' : 'crosshair') : 'default', display: 'block' }}
      />
      
      {isDrawer && (
        <div className="tools-bar">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '2rem', height: '2rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          />
          <button className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`} onClick={() => setTool('pencil')}><Pencil size={18} /></button>
          <button className={`tool-btn ${tool === 'bucket' ? 'active' : ''}`} onClick={() => setTool('bucket')}><PaintBucket size={18} /></button>
          <button className="tool-btn" onClick={() => { setColor('#ffffff'); setTool('pencil'); }}><Eraser size={18} /></button>
          <button className="tool-btn" onClick={clearCanvas}><Trash2 size={18} /></button>
        </div>
      )}
    </div>
  );
}

export default Canvas;
