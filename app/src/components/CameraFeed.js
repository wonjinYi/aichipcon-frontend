import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setFilteredFrameData, setFrameData } from "../stores/frameDataSlice.js";


const CameraFeed = () => {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(0);
    const [feedUrl, setFeedUrl] = useState("");
    const localhost_url = "localhost:8080";
    const [imgSrc, setImgSrc] = useState("");
    const [boundingBoxes, setBoundingBoxes] = useState([]);
    const frameData = useSelector((state) => state.frameData);
    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch the list of available cameras
        axios.get(`http://${localhost_url}/list_cameras`)
            .then(response => {
                console.log("Cameras:", response.data);
                setCameras(response.data);
            })
            .catch(error => {
                console.error("Error fetching cameras:", error);
            });
    }, []);

    useEffect(() => {
        setImgSrc('data:image/jpeg;base64,');
        if (!feedUrl) return;

        let ws = new WebSocket(feedUrl);
        ws.onmessage = function(event) {
            let message = JSON.parse(event.data);
            setImgSrc('data:image/jpeg;base64,' + message.frame);
            console.log(message.boxes)
        };

        ws.onclose = function(event) {
            console.log("WebSocket closed:", event);
        };

        ws.onerror = function(error) {
            console.log("WebSocket error:", error);
        };

        return () => {
            ws.close();
        };
    }, [feedUrl]);

    const handleCameraChange = (event) => {
        const cameraId = event.target.value;
        setSelectedCamera(cameraId);
        setFeedUrl(`ws://${localhost_url}/ws/video_stream?camera_index=${cameraId}`);
    };

    return (
        <div>
            <h1>Live Object Detection</h1>
            <label htmlFor="cameraSelect">Select Camera:</label>
            <select id="cameraSelect" onChange={handleCameraChange}>
                {cameras.map(camera => (
                    <option key={camera} value={camera}>
                        {camera}
                    </option>
                ))}
            </select>
            {imgSrc && (
                <div>
                    <h2>Live Feed</h2>
                    <img src={imgSrc} alt="Live Object Detection" style={{ width: "100%" }} />
                </div>
            )}
        </div>
    );
};

export default CameraFeed;
