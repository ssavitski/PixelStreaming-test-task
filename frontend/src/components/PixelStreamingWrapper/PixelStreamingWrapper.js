import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.2";
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import useWebSocket from 'react-use-websocket';

import styles from './PixelStreamingWrapper.module.css';

const PixelStreamingWrapper = ({ initialSettings }) => {
  const videoParent = useRef(null);
  const [pixelStreaming, setPixelStreaming] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  const {
    sendMessage,
  } = useWebSocket('ws://localhost:3333', {
    onOpen: () => {
      console.log('WS connection opened');
    },
    onMessage: event => {
      console.log(event);
      const parsedData = JSON.parse(event.data);

      if (parsedData?.type === 'getCanvas') {
        setImageSrc(parsedData.canvas);
      }
    },
    onError: event => {
      console.log(event);
    },
    onClose: () => {
      console.log('WS connection closed');
    },
  });

  useEffect(() => {
    if (videoParent.current) {
      const config = new Config({ initialSettings, useUrlParams: true });
      const stream = new PixelStreaming(config, {
        videoElementParent: videoParent.current,
      });

      const newCanvas = new fabric.Canvas('streamingCanvas', {
        selectionBorderColor: 'blue',
        backgroundColor: '#EFEFEF',
      });

      setCanvas(newCanvas);

      const rectangle = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'red',
      });

      newCanvas.add(rectangle);
      newCanvas.renderAll();

      const videoElement = document.getElementById('streamingVideo');
      videoElement.style.position = 'relative';
      videoElement.style.borderRadius = '30px';
      videoElement.style.overflow = 'hidden';
      const canvasElement = document.getElementById('streamingCanvas');
      videoElement.srcObject = canvasElement.captureStream(30);

      setPixelStreaming(stream);
    }
  }, []);

  const startStream = () => pixelStreaming.play();

  const drawingMode = () => {
    if (canvas) {
      canvas.isDrawingMode = !isDrawing;
      canvas.renderAll();
      setIsDrawing(prevState => !prevState);
    }
  };

  const onAddCircle = () => {
    const circle = new fabric.Circle({
      radius: 50,
      fill: 'yellow'
    });

    if (canvas) {
      canvas.add(circle);
      canvas.renderAll();
    }
  };

  const removeElement = () => canvas.remove(canvas.getActiveObject());
  const removeAll = () => canvas.clear();

  const sendCanvasResult = () => {
    const b64jpeg = canvas.toDataURL('image/jpeg');
    sendMessage(JSON.stringify({ type: 'setCanvas', canvas: b64jpeg }));
  };

  const loadCanvasResult = () => {
    sendMessage(JSON.stringify({ type: 'getCanvas' }));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.streamContainer}>
        <div className={styles.videoParent} ref={videoParent} />
      </div>
      <div className={styles.canvasWrapper}>
        <canvas id="streamingCanvas" className={styles.canvas} height={300} width={300} />
        <button className={styles.canvasButton} onClick={startStream}>
          Play Stream
        </button>
        <button className={styles.canvasButton} onClick={onAddCircle}>
          Add circle
        </button>
        <button className={styles.canvasButton} onClick={drawingMode}>
          {`Drawing mode: ${isDrawing}`}
        </button>
        <button className={styles.canvasButton} onClick={removeElement}>
          Remove element
        </button>
        <button className={styles.canvasButton} onClick={removeAll}>
          Remove all
        </button>
        <button className={styles.canvasButton} onClick={sendCanvasResult}>
          Send result
        </button>
        <button className={styles.canvasButton} onClick={loadCanvasResult}>
          Load canvas from backend
        </button>
        <p>There should be canvas from backend:</p>
        {imageSrc && <img src={ imageSrc } alt={ 'There should be image from BE' }/>}
      </div>
    </div>
  );
}

export default PixelStreamingWrapper;
