import React, { useState, useEffect } from "react";
import axios from "axios";

const CameraFeed = () => {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(0);
    const [feedUrl, setFeedUrl] = useState("");
    const localhost_url = "http://localhost:8000";

    useEffect(() => {
        // Fetch the list of available cameras
        axios.get(`${localhost_url}/list_cameras`)
            .then(response => {
                console.log("list_cameras",response.data)
                setCameras(response.data);
            })
            .catch(error => {
                console.error("Error fetching cameras:", error);
            });
    }, []);

    const handleCameraChange = (event) => {
        const cameraId = event.target.value;
        setSelectedCamera(cameraId);
        console.log("cameraId",cameraId)
        setFeedUrl(`${localhost_url}/video_feed?camera_index=${cameraId}`);
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
            {feedUrl && (
                <div>
                    <h2>Live Feed</h2>
                    <img src={feedUrl} alt="Live Object Detection" style={{ width: "100%" }} />
                </div>
            )}
        </div>
    );
};

export default CameraFeed;
