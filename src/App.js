import { useEffect, useState } from "react";
import io from "socket.io-client";
import './App.css';

const SERVER_URL = "https://energymeter-nosql-api.fidaglobal.com";

const App = () => {
  const [status, setStatus] = useState([]); // Track devices and their status
  const [socket, setSocket] = useState(null);
  const [chipIds, setChipIds] = useState([]); // Array of objects [{chipId: '...', deviceName: '...', deviceId: '...'}]
  const [deviceStatusArr, setDeviceStatusArr] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state

  const loadActiveDevices = async () => {
    setLoading(true); // Set loading to true
    try {
      const response = await fetch("https://devsmartenergymeter_api.fidaglobal.com/api/device/getChipIds");
      const data = await response.json();

      // Store chipId, deviceName, and deviceId
      const devices = data.map(device => ({
        chipId: device.chipId,
        deviceName: device.deviceName,
        deviceId: device.deviceId, // Include deviceId
      }));
      setChipIds(devices);

      // Initialize the device status array based on loaded chipIds
      setDeviceStatusArr(devices.map(({ chipId, deviceName, deviceId }) => ({
        chipId,
        deviceName,
        deviceId, // Include deviceId
        status: "offline", // Default status is offline
        realtimeData: {}, // Initialize as empty object
      })));
    } catch (error) {
      console.error("Error fetching chip IDs:", error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const reloadDevices = async () => {
    setLoading(true); // Set loading to true
    try {
      const response = await fetch("https://energymeter-nosql-api.fidaglobal.com/api/reload-devices", {
        method: "POST",
      });
      if (response.ok) {
        console.log("Devices reloaded successfully.");
        await loadActiveDevices(); // Reload devices after successfully triggering the endpoint
      } else {
        console.error("Failed to reload devices.");
      }
    } catch (error) {
      console.error("Error reloading devices:", error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  useEffect(() => {
    loadActiveDevices();
  }, []);

  useEffect(() => {
    if (!chipIds.length) return; // Wait for chipIds to be loaded

    const newSocket = io(SERVER_URL); // Connect to the Socket.IO server
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server:", newSocket.id);
    });

    newSocket.on("testConnection", (data) => {
      console.log("testConnection:", data);
      chipIds.forEach(({ chipId }) => {
        if (newSocket && chipId) {
          newSocket.emit("connectDeviceToTheService", { chipId });
          console.log("Device connected to service with chipId:", chipId);
        } else {
          console.error("Socket is not connected or chipId is empty.");
        }
      });
    });

    newSocket.on("deviceStatusUpdate", (data) => {
      console.log("deviceStatusUpdate received:", data);

      setDeviceStatusArr((prevStatus) => {
        const updatedStatus = [...prevStatus];
        const index = updatedStatus.findIndex(f => f.chipId === data.chipId);

        if (index !== -1) {
          updatedStatus[index] = {
            ...updatedStatus[index],
            status: data.status,
            realtimeData: data.realtimeData || {}, // Fallback to empty object if no realtimeData
          };
        } else {
          updatedStatus.push({
            chipId: data.chipId,
            deviceName: data.deviceName || 'Unknown Device', // Add deviceName if available
            deviceId: data.deviceId || 'Unknown', // Add deviceId if available
            status: data.status,
            realtimeData: data.realtimeData || {}, // Fallback to empty object if no realtimeData
          });
        }
        return updatedStatus;
      });
    });

    return () => newSocket.disconnect(); // Cleanup on unmount
  }, [chipIds]);

  return (
    <div className="container">
      <h1>Socket.IO Real-Time Data</h1>
      <button
        onClick={() => {
          loadActiveDevices();
          reloadDevices();
        }}
        className="reload-button"
      >
        Reload Devices
      </button>
      {loading ? (
        <p className="loading-message">Reloading...</p> // Display loading message
      ) : (
        <>
          <div className="device-counts">
            <p>Total Devices: {deviceStatusArr.length}</p>
            <p>Online Devices: {deviceStatusArr.filter(item => item.status === "online").length}</p>
            <p>Offline Devices: {deviceStatusArr.filter(item => item.status === "offline").length}</p>
          </div>
          <table className="device-table">
            <thead>
              <tr>
                <th>ChipId</th>
                <th>Status</th>
                <th>Device Name</th>
                <th>Device Id</th> {/* New column for Device Id */}
              </tr>
            </thead>
            <tbody>
              {deviceStatusArr?.map((item, index) => (
                <tr
                  key={index}
                  className={item.status === "online" ? "online" : "offline"}
                >
                  <td>{item.chipId}</td>
                  <td>{item.status}</td>
                  <td>{item.deviceName}</td>
                  <td>{item.deviceId}</td> {/* Display Device Id */}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
  
  
};

export default App;
