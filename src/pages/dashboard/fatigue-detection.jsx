import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, ResponsiveContainer
} from 'recharts';

export function FatigueDetection() {
  const [driverData, setDriverData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State untuk query pencarian

  const apiKey = "1234";  // API key yang Anda gunakan

  // Socket.IO setup untuk menerima data deteksi secara real-time
  useEffect(() => {
    const socket = io("http://10.60.40.28:3000/api/detection", {
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
        .get("http://10.60.40.28:3000/api/detection", {
          headers: {
            "x-api-key": apiKey  // Sertakan API key dalam header
          }
        })
        .then((response) => {
          setDriverData(
            response.data.data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
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
      await axios.post("http://10.60.40.28:3000/sendAlert", { message });
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
      {/* Search Box */}
      {/* <div className="relative w-full mb-6">
        <input
          type="text"
          placeholder="Search by Driver ID"
          className="w-full p-3 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
      </div> */}

      {/* Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-bold">Driver Behavior Detection Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredData} // Menggunakan data yang sudah difilter
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="start_time" />
            <YAxis yAxisId="left" domain={[0, 'auto']} />
            <YAxis yAxisId="right" orientation="right" domain={[-1, 2]} />
            <RechartTooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line yAxisId="right" type="monotone" dataKey="drowsiness_status" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

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
              <td className="border-b p-2">{driver.drowsiness_status ? "Normal" : "Drowsy"}</td>
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







// // // progam baru
// // import React, { useEffect, useState } from "react";
// // import { io } from "socket.io-client";
// // import axios from 'axios';
// // import {
// //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, ResponsiveContainer
// // } from 'recharts';

// // export function Home() {
// //   const [driverData, setDriverData] = useState([]);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [token, setToken] = useState(localStorage.getItem("token")); // Ambil token dari localStorage

// //   useEffect(() => {
// //     const socket = io("http://localhost:3000/api/detection", {
// //       query: { token } // Menambahkan token ke query string
// //     });

// //     socket.on("new_detection", (newEntry) => {
// //       setDriverData((prevData) => {
// //         const updatedData = [newEntry, ...prevData];
// //         return updatedData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
// //       });
// //     });

// //     return () => {
// //       socket.disconnect();
// //     };
// //   }, [token]);

// //   useEffect(() => {
// //     const fetchData = () => {
// //       axios
// //         .get("http://localhost:3000/api/detection", {
// //           headers: {
// //             Authorization: `Bearer ${token}`  // Mengirimkan token dengan header Authorization
// //           }
// //         })
// //         .then((response) => {
// //           setDriverData(
// //             response.data.payload.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
// //           );
// //         })
// //         .catch((error) => {
// //           console.error("Error fetching data:", error);
// //         });
// //     };

// //     fetchData();
// //     const intervalId = setInterval(fetchData, 500);

// //     return () => {
// //       clearInterval(intervalId);
// //     };
// //   }, [token]);

// //   // Filter data berdasarkan query pencarian
// //   const filteredData = driverData.filter((driver) =>
// //     driver.driver_id.toString().includes(searchQuery) // Pencarian berdasarkan Driver ID
// //   );

// //   return (
// //     <div className="bg-white p-6 rounded-lg shadow-lg mt-6 overflow-x-auto">
// //       {/* Search Box */}
// //       <div className="relative w-full mb-6">
// //         <input
// //           type="text"
// //           placeholder="Search by Driver ID"
// //           className="w-full p-3 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
// //           value={searchQuery}
// //           onChange={(e) => setSearchQuery(e.target.value)} // Update search query
// //         />
// //       </div>

// //       {/* Chart */}
// //       <div className="mb-8">
// //         <h3 className="text-xl font-bold">Driver Behavior Detection Chart</h3>
// //         <ResponsiveContainer width="100%" height={400}>
// //           <LineChart
// //             data={filteredData} // Menggunakan data yang sudah difilter
// //             margin={{
// //               top: 5, right: 30, left: 20, bottom: 5,
// //             }}
// //           >
// //             <CartesianGrid strokeDasharray="3 3" />
// //             <XAxis dataKey="start_time" />
// //             <YAxis yAxisId="left" domain={[0, 'auto']} />
// //             <YAxis yAxisId="right" orientation="right" domain={[-1, 2]} />
// //             <RechartTooltip />
// //             <Legend />
// //             <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#8884d8" activeDot={{ r: 8 }} />
// //             <Line yAxisId="right" type="monotone" dataKey="drowsiness_status" stroke="#82ca9d" />
// //           </LineChart>
// //         </ResponsiveContainer>
// //       </div>

// //       {/* Table */}
// //       <h5 className="font-bold mb-6 text-center">Driver Behavior Detection Table</h5>
// //       <table className="table-auto w-full text-left border-collapse">
// //         <thead>
// //           <tr>
// //             <th className="border-b p-2">No</th>
// //             <th className="border-b p-2">Driver ID</th>
// //             <th className="border-b p-2">Eye State</th>
// //             <th className="border-b p-2">Mouth State</th>
// //             <th className="border-b p-2">Head Pose</th>
// //             <th className="border-b p-2">Yawning</th>
// //             <th className="border-b p-2">Drowsiness Status</th>
// //             <th className="border-b p-2">Start Time</th>
// //             <th className="border-b p-2">End Time</th>
// //             <th className="border-b p-2">Duration (seconds)</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {filteredData.map((driver, index) => (
// //             <tr key={driver.id}>
// //               <td className="border-b p-2">{index + 1}</td>
// //               <td className="border-b p-2">{driver.driver_id}</td>
// //               <td className="border-b p-2">{driver.eye_state}</td>
// //               <td className="border-b p-2">{driver.mouth_state}</td>
// //               <td className="border-b p-2">{driver.head_pose}</td>
// //               <td className="border-b p-2">{driver.yawning ? "Yes" : "No"}</td>
// //               <td className="border-b p-2">{driver.drowsiness_status ? "Normal" : "Drowsy"}</td>
// //               <td className="border-b p-2">{new Date(driver.start_time).toLocaleString()}</td>
// //               <td className="border-b p-2">{new Date(driver.end_time).toLocaleString()}</td>
// //               <td className="border-b p-2">{driver.duration}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }

// // export default Home;


// // progam lama 

// import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import axios from 'axios';
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, ResponsiveContainer
// } from 'recharts';

// export function Home() {
//   const [driverData, setDriverData] = useState([]);
//   const [searchQuery, setSearchQuery] = useState(""); // State untuk query pencarian

//   useEffect(() => {
//     // const socket = io("http://192.168.153.227:3000");
//     const socket = io("http://192.168.110.205:3000/api/detection");

//     socket.on("new_detection", (newEntry) => {
//       setDriverData((prevData) => {
//         const updatedData = [newEntry, ...prevData];
//         return updatedData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
//       });

//       if (!newEntry.drowsiness_status) {
//         sendTelegramAlert(newEntry);
//       }
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     const fetchData = () => {
//       axios
//         .get("http://192.168.110.205:3000/api/detection")
//         .then((response) => {
//           setDriverData(
//             response.data.payload.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
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
//   }, []);

//   const sendTelegramAlert = async (driver) => {
//     const message = `🚨 Alert: Driver ${driver.driver_id} terdeteksi DROWSY pada ${new Date(driver.start_time).toLocaleString()}. Mohon segera waspadai!`;

//     try {
//       await axios.post("http://192.168.110.205:3000/sendAlert", { message });
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
//       {/* Search Box */}
//       <div className="relative w-full mb-6">
//         <input
//           type="text"
//           placeholder="Search by Driver ID"
//           className="w-full p-3 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)} // Update search query
//         />
//         <span className="absolute inset-y-0 right-4 flex items-center">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 text-gray-500"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
//             />
//           </svg>
//         </span>
//       </div>

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
//             <XAxis dataKey="start_time" />
//             <YAxis yAxisId="left" domain={[0, 'auto']} />
//             <YAxis yAxisId="right" orientation="right" domain={[-1, 2]} />
//             <RechartTooltip />
//             <Legend />
//             <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#8884d8" activeDot={{ r: 8 }} />
//             <Line yAxisId="right" type="monotone" dataKey="drowsiness_status" stroke="#82ca9d" />
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
//               <td className="border-b p-2">{driver.drowsiness_status ? "Normal" : "Drowsy"}</td>
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

// export default Home;



























