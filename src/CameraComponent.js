import React, { useState, useRef } from 'react';

const CameraComponent = () => {
  const videoRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setMediaStream(stream);
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      setRecordedChunks((prev) => [...prev, e.data]);
    };
    recorder.start();
    setRecording(true);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const stopRecording = () => {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
    setRecording(false);
  };

  const saveRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    fetch('http://localhost:8000/api/save_video', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
  };

  return (
    <div>
      <video ref={videoRef} autoPlay style={{ width: '30%' }} />
      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
      {recordedChunks.length > 0 && (
        <button onClick={saveRecording}>Save Recording</button>
      )}
    </div>
  );
};

export default CameraComponent;