
import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import * as faceapi from 'face-api.js';

function HomePage() {
  return <h2 className="content">Welcome to the Home Page</h2>;
}

function WebcamCapture() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    startVideo();
    loadModels().then(faceMyDetect);
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Error accessing webcam:", err));
  };

  const loadModels = () => {
    return Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]);
  };

  const faceMyDetect = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;
  
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
  
      if (detections.length > 0) {
        console.log('Face detected, navigating...');
        clearInterval(interval); 
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
  
        navigate('/home'); 
      }
    }, 1000);
  
    return () => {
      console.log('Clearing interval and stopping camera on unmount...');
      clearInterval(interval); 
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach(track => track.stop());
    };
  };
  

  return (
    <div className="myapp">
      <h1>Face Detection</h1>
      <div className="appvideo">
        <video ref={videoRef} autoPlay muted width="500" height="500" style={{ border: '2px solid black' }} />
        <canvas ref={canvasRef} width="500" height="500" className="appcanvas" />
      </div>
      <p>Please wait you will be re-directed to home page after face recognition</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<WebcamCapture />} />
      </Routes>
    </Router>
  );
}

export default App;
