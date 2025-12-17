"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Zap, Bolt, Power, Activity, FileSpreadsheet, Wallet } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import mqtt from "mqtt";

const Dashboard = () => {
  // State for real-time data
  const [voltage, setVoltage] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [kwh, setKwh] = useState<number>(0);
  const [wattage, setWattage] = useState<number>(0);
  const [frequency, setFrequency] = useState<number>(0);
  const [powerFactor, setPowerFactor] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [isWarning, setIsWarning] = useState<boolean>(false); // New state for warning

  useEffect(() => {
    // Connect to HiveMQ broker
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
    
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      // Subscribe to all topics
      client.subscribe("sensor/tegangan1", (err) => {
        if (err) {
          console.error("Subscription error for sensor/tegangan1:", err);
        } else {
          console.log("Subscribed to sensor/tegangan1");
        }
      });
      
      client.subscribe("sensor/arus1", (err) => {
        if (err) {
          console.error("Subscription error for sensor/arus1:", err);
        } else {
          console.log("Subscribed to sensor/arus1");
        }
      });
      
      client.subscribe("sensor/kwh", (err) => {
        if (err) {
          console.error("Subscription error for sensor/kwh:", err);
        } else {
          console.log("Subscribed to sensor/kwh");
        }
      });
      
      client.subscribe("sensor/watt", (err) => {
        if (err) {
          console.error("Subscription error for sensor/watt:", err);
        } else {
          console.log("Subscribed to sensor/watt");
        }
      });
      
      client.subscribe("sensor/freq", (err) => {
        if (err) {
          console.error("Subscription error for sensor/freq:", err);
        } else {
          console.log("Subscribed to sensor/freq");
        }
      });
      
      client.subscribe("sensor/pf", (err) => {
        if (err) {
          console.error("Subscription error for sensor/pf:", err);
        } else {
          console.log("Subscribed to sensor/pf");
        }
      });
      
      client.subscribe("sensor/cost", (err) => {
        if (err) {
          console.error("Subscription error for sensor/cost:", err);
        } else {
          console.log("Subscribed to sensor/cost");
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const value = parseFloat(message.toString());
        if (isNaN(value)) {
          console.warn(`Received non-numeric value for topic ${topic}: ${message.toString()}`);
          return;
        }
        
        switch (topic) {
          case "sensor/tegangan1":
            console.log(`MQTT: topic=${topic}, raw_message=${message.toString()}, parsed_value=${value}`);
            setVoltage(value);
            break;
          case "sensor/arus1":
            console.log(`MQTT: topic=${topic}, raw_message=${message.toString()}, parsed_value=${value}`);
            setCurrent(value);
            break;
          case "sensor/kwh":
            setKwh(value);
            break;
          case "sensor/watt":
            setWattage(value);
            break;
          case "sensor/freq":
            setFrequency(value);
            break;
          case "sensor/pf":
            setPowerFactor(value);
            break;
          case "sensor/cost":
            setCost(value);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Error parsing data for topic ${topic}:`, error);
      }
    });

    client.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });

    // Cleanup on component unmount
    return () => {
      client.end();
    };
  }, []);

  // Update warning state based on current value
  useEffect(() => {
    setIsWarning(current > 3);
  }, [current]);

  // Calculate percentages for gauge visualization
  const voltagePercentage = Math.min(100, Math.max(0, (voltage / 300) * 100)); // Assuming 300V max
  const currentPercentage = Math.min(100, Math.max(0, (isNaN(current) ? 0 : current / 50) * 100)); // Assuming 50A max, added isNaN check
  const frequencyPercentage = Math.min(100, Math.max(0, ((frequency - 45) / 10) * 100)); // Assuming 45-55Hz range
  const powerFactorPercentage = Math.min(100, Math.max(0, powerFactor * 100)); // Assuming 0-1 range

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 
      ${isWarning ? 'bg-red-100 dark:bg-red-950' : 'bg-gray-100 dark:bg-gray-900'}`}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Monitoring Kualitas Daya
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 w-full max-w-6xl">
        {/* Voltage Card with Gauge */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voltage</CardTitle>
            <Bolt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{voltage.toFixed(1)} V</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${voltagePercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Current voltage reading
            </div>
          </CardContent>
        </Card>
        
        {/* Current Card with Gauge */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{current.toFixed(1)} A</div>
            {isWarning && (
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                PERINGATAN: Arus terlalu tinggi!
              </p>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${currentPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Current amperage reading
            </div>
          </CardContent>
        </Card>
        
        {/* Wattage Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wattage</CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wattage.toFixed(0)} W</div>
            <p className="text-xs text-muted-foreground">
              Current power usage
            </p>
          </CardContent>
        </Card>
        
        {/* Frequency Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{frequency.toFixed(1)} Hz</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${frequencyPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Current frequency reading
            </div>
          </CardContent>
        </Card>
        
        {/* Power Factor Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Factor</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{powerFactor.toFixed(2)}</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-yellow-600 h-2.5 rounded-full" 
                style={{ width: `${powerFactorPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Current power factor reading
            </p>
          </CardContent>
        </Card>
        
        {/* Total kWh Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total kWh</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kwh.toFixed(2)} kWh</div>
            <p className="text-xs text-muted-foreground">
              Accumulated energy consumption
            </p>
          </CardContent>
        </Card>
        
        {/* Cost Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {cost.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">
              Current energy cost
            </p>
          </CardContent>
        </Card>
        
        {/* Google Sheets Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Records</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <a 
              href="https://docs.google.com/spreadsheets/d/1t2brUBsTltFHV7ZtlGylbDhkNn3_v5ZrXb7hp5nY1FU/edit?gid=0#gid=0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                View GSheet
              </button>
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Access historical data records
            </p>
          </CardContent>
        </Card>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;