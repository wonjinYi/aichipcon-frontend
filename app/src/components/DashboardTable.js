import React, { useState } from "react";
import { useWebSocket } from "../utils";
import LineChart from "./LineChart";




const Dashboard = () => {
  let [data, setData] = useState([]);
  useWebSocket("ws://localhost:9090/ws", setData);

  const curFrameData = data[data.length - 1];
  console.log("curFrameData", curFrameData);

  return (
    <div>
    <LineChart bboxData={curFrameData} />
      <table>
        <thead>
          <tr>
            <th>Class</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {curFrameData ? (
            curFrameData.map((item, index) => (
              <tr key={index}>
                <td>{item.cls}</td>
                <td>{item.conf}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Dashboard.propTypes = {
//     data: PropTypes.arrayOf(
//         PropTypes.shape({
//             class: PropTypes.string.isRequired,
//             confidence: PropTypes.number.isRequired,
//         })
//     ),
// };

export default Dashboard;
