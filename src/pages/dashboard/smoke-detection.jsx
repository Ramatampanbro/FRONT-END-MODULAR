import React, { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_CONFIG } from '@/configs/api-config';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function SmokeDetection() {
  const [driverData, setDriverData] = useState([]);
  const [filterEvent, setFilterEvent] = useState(""); // State for filtering by event
  const [filterDriverId, setFilterDriverId] = useState(""); // State for filtering by Driver ID

  const API_KEY = API_CONFIG.API_KEY;

  useEffect(() => {
    const socket = io("http://192.168.2.205:3000/api/smoke-detection");
    socket.on("new_mobile_detection", async (newEntry) => {
      if (newEntry.event) {
        try {
          const response = await axios.get("http://192.168.2.205:3000/api/smoke-detection", {
            headers: {
              "x-api-key": API_KEY,
            },
          });
          setDriverData((prevData) => [newEntry, ...response.data.data]);
        } catch (error) {
          console.error("Error fetching mobile detection data:", error);
        }
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchData = () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "http://192.168.2.205:3000/api/smoke-detection", true);
      xhr.setRequestHeader("x-api-key", API_KEY);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // const response = JSON.parse(xhr.responseText);
          // const filteredData = response.data.filter((entry) => entry.event);
          const response = JSON.parse(xhr.responseText);
          const filteredData = response.data.filter((entry) => entry.event);
          setDriverData(filteredData);
        } else {
          console.error("Error fetching data:", xhr.statusText);
        }
      };

      xhr.onerror = () => {
        console.error("Error fetching data:", xhr.statusText);
      };

      xhr.send();
    };

    fetchData();
    const intervalId = setInterval(fetchData, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Apply filters
  const filteredDriverData = driverData.filter((data) => {
    return (
      (filterEvent === "" || data.event === filterEvent) &&
      (filterDriverId === "" || data.driver_id.toString().includes(filterDriverId))
    );
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6 overflow-x-auto">
      {/* Filter Form */}
      {/* <div className="mb-6 flex items-center gap-4">
        <div>
          <label className="block text-sm font-bold mb-2">Filter by Event:</label>
          <select
            className="p-2 border rounded"
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
          >
            <option value="">All</option>
            <option value="smoking">Smoking</option>
            <option value="phone_usage">Phone Usage</option>
            <option value="drowsiness">Drowsiness</option>
            <option value="body_posture">Body Posture</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Filter by Driver ID:</label>
          <input
            type="text"
            className="p-2 border rounded"
            placeholder="Enter Driver ID"
            value={filterDriverId}
            onChange={(e) => setFilterDriverId(e.target.value)}
          />
        </div>
      </div> */}

      <div className="mb-8">
        <h3 className="text-xl font-bold">Smoke Detection Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredDriverData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="start_time" />
            <YAxis yAxisId="left" label={{ value: 'Duration (s)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Event Type', angle: -90, position: 'insideRight' }} />
            <RechartTooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#8884d8" />
            <Line yAxisId="right" type="monotone" dataKey="event" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h5 className="font-bold mb-6 text-center">Mobile Detection Data Table</h5>
      <table className="table-auto w-full text-left border-collapse">
        <thead className="bg-white-100">
          <tr>
            <th className="border-b p-2">No</th>
            <th className="border-b p-2">Driver ID</th>
            <th className="border-b p-2">Event</th>
            <th className="border-b p-2">Start Time</th>
            <th className="border-b p-2">End Time</th>
            <th className="border-b p-2">Duration (seconds)</th>
          </tr>
        </thead>
        <tbody>
          {filteredDriverData.map((data, index) => (
            <tr key={index} className="hover:bg-white">
              <td className="border-b p-2">{index + 1}</td>
              <td className="border-b p-2">{data.driver_id}</td>
              <td className="border-b p-2">{data.event || "N/A"}</td>
              <td className="border-b p-2">{new Date(data.start_time).toLocaleString()}</td>
              <td className="border-b p-2">{new Date(data.end_time).toLocaleString()}</td>
              <td className="border-b p-2">{data.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SmokeDetection;
