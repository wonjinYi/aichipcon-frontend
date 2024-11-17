import { useEffect } from "react";

export const useWebSocket = (url, onMessage) => {
  useEffect(() => {
    const ws = new WebSocket(url);
    // ws.onmessage = (event) => onMessage(JSON.parse(event.data));
    ws.onmessage = (event) => {
      console.log("Message from server: ", event.data);
      if (onMessage){
        onMessage(JSON.parse(event.data));
      }
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);
    return () => ws.close();
  }, [url, onMessage]);
};


// const useWebSocket = (url) => {
//   useEffect(() => {
//     const ws = new WebSocket(url);
//     ws.onmessage = (event) => {
//       console.log("Message from server: ");
//     };
//     return () => ws.close();
//   }, [url]);
// };


