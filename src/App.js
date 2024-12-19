import { useEffect, useState } from "react";
import io from "socket.io-client";
import './App.css';

const SERVER_URL = "http://34.124.201.85:3002"; // Replace with your server's URL if different

const App = () => {
  const [chipId, setChipId] = useState("");
  const [status, setStatus] = useState([]);
  const [socket, setSocket] = useState(null);

  const [deviceStatusArr,setDeviceStatusArr]=useState([]);
  const chipIds = ["0857A75C7BCC", "2C53A75C7BCC","A431A0FC8AD4","9885A75C7BCC"];

  useEffect(() => {
    const newSocket = io(SERVER_URL); // Connect to the Socket.IO server
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server:", newSocket.id);
    });

    newSocket.on("testConnection", (data) => {
      console.log("testConnection:", data);

      chipIds.map((chipId) => {
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

      const index=deviceStatusArr.findIndex(f=>f.chipId===data.chipId);
        if (index !== -1) {
          deviceStatusArr.splice(index, 1);
        }

        deviceStatusArr.push(data);
        console.log("deviceStatusArr:", deviceStatusArr);

    });

    newSocket.on("realtimeData", (data) => {
      console.log("Real-time data received:", data);

      setStatus((prevStatus) => {
        const existingIndex = prevStatus.findIndex((item) => item.chipId === data.chipId);

        if (existingIndex !== -1) {
          const updatedStatus = [...prevStatus];
          updatedStatus[existingIndex] = {status:data?.status, chipId: data.chipId, realtimeData: data.realtimeData };
          return updatedStatus;
        } else {
          return [...prevStatus, { chipId: data.chipId, realtimeData: data.realtimeData }];
        }
      });
    });

    return () => newSocket.disconnect(); // Cleanup on unmount
  }, []);

  const connectDeviceToService = (id) => {
    if (socket && id) {
      socket.emit("connectDeviceToTheService", { chipId: id });
      console.log("Device connected to service with chipId:", id);
    } else {
      console.error("Socket is not connected or chipId is empty.");
    }
  };

  return (
    <div className="container">
      <h1>Socket.IO Real-Time Data</h1>

      {status?.map((item, index) => (
        <div className="device-card" key={index}>
          <h3>ChipId: {item.chipId}</h3>

          <div className="data-item">
            <h4>Status</h4>
            <p>{deviceStatusArr.find(d=>d.chipId===item.chipId).status}</p>
          </div>

          <div className="data-box">
     

            <div className="data-item">
            
              <h4>L1 Voltage</h4>
              <p>{item.realtimeData.Voltage} V</p>
            </div>
            <div className="data-item">
              <h4>L2 Voltage</h4>
              <p>{item.realtimeData.Voltage2} V</p>
            </div>
            <div className="data-item">
              <h4>L3 Voltage</h4>
              <p>{item.realtimeData.Voltage3} V</p>
            </div>
        
            <div className="data-item">
              <h4>L1 Current</h4>
              <p>{item.realtimeData.Current} A</p>
            </div>
            <div className="data-item">
              <h4>L2 Current</h4>
              <p>{item.realtimeData.Current2} A</p>
            </div>
            <div className="data-item">
              <h4>L3 Current</h4>
              <p>{item.realtimeData.Current3} A</p>
            </div>
         
            <div className="data-item">
              <h4>L1 Power</h4>
              <p>{item.realtimeData.Power} W</p>
            </div>
            <div className="data-item">
              <h4>L2 Power</h4>
              <p>{item.realtimeData.Power2} W</p>
            </div>
            <div className="data-item">
              <h4>L3 Power</h4>
              <p>{item.realtimeData.Power3} W</p>
            </div>
        
            <div className="data-item">
              <h4>L1 Kwh</h4>
              <p>{item.realtimeData.Kwh} kWh</p>
            </div>
            <div className="data-item">
              <h4>L2 Kwh</h4>
              <p>{item.realtimeData.Kwh2} kWh</p>
            </div>
            <div className="data-item">
              <h4>L3 Kwh</h4>
              <p>{item.realtimeData.Kwh3} kWh</p>
            </div>
        
            <div className="data-item">
              <h4>L1 UsageBill</h4>
              <p>${item.realtimeData.UsageBill}</p>
            </div>
            <div className="data-item">
              <h4>L2 UsageBill</h4>
              <p>${item.realtimeData.UsageBill2}</p>
            </div>
            <div className="data-item">
              <h4>L3 UsageBill</h4>
              <p>${item.realtimeData.UsageBill3}</p>
            </div>
        
            <div className="data-item">
              <h4>L1 PF</h4>
              <p>{item.realtimeData.PF}</p>
            </div>
            <div className="data-item">
              <h4>L2 PF</h4>
              <p>{item.realtimeData.PF2}</p>
            </div>
            <div className="data-item">
              <h4>L3 PF</h4>
              <p>{item.realtimeData.PF3}</p>
            </div>
 
            <div className="data-item">
              <h4>L1 Hertz</h4>
              <p>{item.realtimeData.Hertz}</p>
            </div>
            <div className="data-item">
              <h4>L2 Hertz</h4>
              <p>{item.realtimeData.Hertz2}</p>
            </div>
            <div className="data-item">
              <h4>L3 Hertz</h4>
              <p>{item.realtimeData.Hertz3}</p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default App;
