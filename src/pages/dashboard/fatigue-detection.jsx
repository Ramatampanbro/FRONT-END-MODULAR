import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from 'axios';

export function FatigueDetection() {
  const [driverData, setDriverData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State untuk query pencarian

  const apiKey = "1234";  // API key yang Anda gunakan

  // Socket.IO setup untuk menerima data deteksi secara real-time
  useEffect(() => {
    const socket = io("http://192.168.2.205:3000/api/detection", {
      query: { apiKey }  // Kirimkan API key jika diperlukan dalam query
    });

    socket.on("new_detection", (newEntry) => {
      setDriverData((prevData) => {
        const updatedData = [newEntry, ...prevData];
        return updatedData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      });

      // Kirim alert jika status mengantuk
      if (!newEntry.drowsiness_status) {
        sendTelegramAlert(newEntry);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [apiKey]);

  // Fungsi untuk mengambil data deteksi
  useEffect(() => {
    const fetchData = () => {
      axios
        .get("http://192.168.2.205:3000/api/detection", {
          headers: {
            "x-api-key": apiKey  // Sertakan API key dalam header
          }
        })
        .then((response) => {
          // Mapping drowsiness_status menjadi 1 (drowsy) dan 0 (normal)
          const mappedData = response.data.data.map((driver) => ({
            ...driver,
            drowsiness_status: driver.drowsiness_status === 'drowsy' ? 1 : 1 // Memetakan 'drowsy' menjadi 1 dan 'normal' menjadi 0
          }));

          setDriverData(
            mappedData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
          );
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [apiKey]);

  const sendTelegramAlert = async (driver) => {
    const message = `🚨 Alert: Driver ${driver.driver_id} terdeteksi DROWSY pada ${new Date(driver.start_time).toLocaleString()}. Mohon segera waspadai!`;

    try {
      await axios.post("http://192.168.2.205:3000/sendAlert", { message });
      console.log("Alert terkirim ke Telegram");
    } catch (error) {
      console.error("Gagal mengirim alert ke Telegram:", error);
    }
  };

  // Filter data berdasarkan query pencarian
  const filteredData = driverData.filter((driver) =>
    driver.driver_id.toString().includes(searchQuery) // Pencarian berdasarkan Driver ID
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6 overflow-x-auto">
      {/* Table */}
      <h5 className="font-bold mb-6 text-center">Driver Behavior Detection Table</h5>
      <table className="table-auto w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">No</th>
            <th className="border-b p-2">Driver ID</th>
            <th className="border-b p-2">Eye State</th>
            <th className="border-b p-2">Mouth State</th>
            <th className="border-b p-2">Head Pose</th>
            <th className="border-b p-2">Yawning</th>
            <th className="border-b p-2">Drowsiness Status</th>
            <th className="border-b p-2">Start Time</th>
            <th className="border-b p-2">End Time</th>
            <th className="border-b p-2">Duration (seconds)</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((driver, index) => (
            <tr key={driver.id}>
              <td className="border-b p-2">{index + 1}</td>
              <td className="border-b p-2">{driver.driver_id}</td>
              <td className="border-b p-2">{driver.eye_state}</td>
              <td className="border-b p-2">{driver.mouth_state}</td>
              <td className="border-b p-2">{driver.head_pose}</td>
              <td className="border-b p-2">{driver.yawning ? "Yes" : "No"}</td>
              <td className="border-b p-2">{driver.drowsiness_status === 1 ? "Drowsy" : "Normal"}</td>
              <td className="border-b p-2">{new Date(driver.start_time).toLocaleString()}</td>
              <td className="border-b p-2">{new Date(driver.end_time).toLocaleString()}</td>
              <td className="border-b p-2">{driver.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FatigueDetection;

























// program chart

// import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import axios from 'axios';
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, ResponsiveContainer
// } from 'recharts';

// export function FatigueDetection() {
//   const [driverData, setDriverData] = useState([]);
//   const [searchQuery, setSearchQuery] = useState(""); // State untuk query pencarian

//   const apiKey = "1234";  // API key yang Anda gunakan

//   // Socket.IO setup untuk menerima data deteksi secara real-time
//   useEffect(() => {
//     const socket = io("http://192.168.100.37:3000/api/detection", {
//       query: { apiKey }  // Kirimkan API key jika diperlukan dalam query
//     });

//     socket.on("new_detection", (newEntry) => {
//       setDriverData((prevData) => {
//         const updatedData = [newEntry, ...prevData];
//         return updatedData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
//       });

//       // Kirim alert jika status mengantuk
//       if (!newEntry.drowsiness_status) {
//         sendTelegramAlert(newEntry);
//       }
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [apiKey]);

//   // Fungsi untuk mengambil data deteksi
//   useEffect(() => {
//     const fetchData = () => {
//       axios
//         .get("http://192.168.100.37:3000/api/detection", {
//           headers: {
//             "x-api-key": apiKey  // Sertakan API key dalam header
//           }
//         })
//         .then((response) => {
//           // Mapping drowsiness_status menjadi 1 (drowsy) dan 0 (normal)
//           const mappedData = response.data.data.map((driver) => ({
//             ...driver,
//             drowsiness_status: driver.drowsiness_status === 'drowsy' ? 1 : 1
//           }));

//           setDriverData(
//             mappedData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
//           );
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     };

//     fetchData();
//     const intervalId = setInterval(fetchData, 500);

//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [apiKey]);

//   const sendTelegramAlert = async (driver) => {
//     const message = `🚨 Alert: Driver ${driver.driver_id} terdeteksi DROWSY pada ${new Date(driver.start_time).toLocaleString()}. Mohon segera waspadai!`;

//     try {
//       await axios.post("http://192.168.100.37:3000/sendAlert", { message });
//       console.log("Alert terkirim ke Telegram");
//     } catch (error) {
//       console.error("Gagal mengirim alert ke Telegram:", error);
//     }
//   };

//   // Filter data berdasarkan query pencarian
//   const filteredData = driverData.filter((driver) =>
//     driver.driver_id.toString().includes(searchQuery) // Pencarian berdasarkan Driver ID
//   );

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg mt-6 overflow-x-auto">
//       {/* Chart */}
//       <div className="mb-8">
//         <h3 className="text-xl font-bold">Driver Behavior Detection Chart</h3>
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart
//             data={filteredData} // Menggunakan data yang sudah difilter
//             margin={{
//               top: 5, right: 30, left: 20, bottom: 5,
//             }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis 
//               dataKey="start_time" 
//               tickFormatter={(time) => new Date(time).toLocaleString()} // Mengubah waktu UTC ke waktu lokal
//             />
//             <YAxis yAxisId="left" domain={[0, 'auto']} />
//             <YAxis yAxisId="right" orientation="right" domain={[0, 3]} />
//             <RechartTooltip 
//               labelFormatter={(value) => new Date(value).toLocaleString()} // Menampilkan waktu lokal di tooltip
//             />
//             <Legend />
//             {/* Line untuk durasi */}
//             <Line 
//               yAxisId="left" 
//               type="monotone" 
//               dataKey="duration" // Pastikan dataKey ini sesuai dengan data yang dimiliki
//               stroke="#8884d8" 
//               activeDot={{ r: 8 }} 
//             />
//             {/* Line untuk drowsiness status */}
//             <Line 
//               yAxisId="right" 
//               type="monotone" 
//               dataKey="drowsiness_status" 
//               stroke="#82ca9d" />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Table */}
//       <h5 className="font-bold mb-6 text-center">Driver Behavior Detection Table</h5>
//       <table className="table-auto w-full text-left border-collapse">
//         <thead>
//           <tr>
//             <th className="border-b p-2">No</th>
//             <th className="border-b p-2">Driver ID</th>
//             <th className="border-b p-2">Eye State</th>
//             <th className="border-b p-2">Mouth State</th>
//             <th className="border-b p-2">Head Pose</th>
//             <th className="border-b p-2">Yawning</th>
//             <th className="border-b p-2">Drowsiness Status</th>
//             <th className="border-b p-2">Start Time</th>
//             <th className="border-b p-2">End Time</th>
//             <th className="border-b p-2">Duration (seconds)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredData.map((driver, index) => (
//             <tr key={driver.id}>
//               <td className="border-b p-2">{index + 1}</td>
//               <td className="border-b p-2">{driver.driver_id}</td>
//               <td className="border-b p-2">{driver.eye_state}</td>
//               <td className="border-b p-2">{driver.mouth_state}</td>
//               <td className="border-b p-2">{driver.head_pose}</td>
//               <td className="border-b p-2">{driver.yawning ? "Yes" : "No"}</td>
//               <td className="border-b p-2">{driver.drowsiness_status === 1 ? "Drowsy" : "Normal"}</td>
//               <td className="border-b p-2">{new Date(driver.start_time).toLocaleString()}</td>
//               <td className="border-b p-2">{new Date(driver.end_time).toLocaleString()}</td>
//               <td className="border-b p-2">{driver.duration}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default FatigueDetection;




