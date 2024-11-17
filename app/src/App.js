import "./App.css";
import Dashboard from "./components/DashboardTable.js";
import PolygonEditor from "./components/PolygonEditor.js";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  // const webSocket = useWebSocket("ws://localhost:9090/ws", null);
  // console.log(webSocket);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<PolygonEditor />} />
        </Routes>
      </Router>
      <header className="App-header">
        <h1>Dashboard</h1>
      </header>
      <main>
      </main>
    </div>
  );
}

export default App;
