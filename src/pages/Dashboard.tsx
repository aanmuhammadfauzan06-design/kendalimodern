"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Zap, Bolt, Power, Activity } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import mqtt from "mqtt";

const Dashboard = () => {
  // State for real-time data
  const [voltage, setVoltage] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [kwh, setKwh] = useState<number>(0);
  const [wattage, setWattage] = useState<number>(0);
  const [frequency, setFrequency] = useState<number>(0);

  useEffect(() => {
    // Connect to HiveMQ broker
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
    
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      // Subscribe to all topics
      client.subscribe("sensor/tegangan", (err) => {
        if (err) {
          console.error("Subscription error for sensor/tegangan:", err);
        } else {
          console.log("Subscribed to sensor/tegangan");
        }
      });
      
      client.subscribe("sensor/arus", (err) => {
        if (err) {
          console.error("Subscription error for sensor/arus:", err);
        } else {
          console.log("Subscribed to sensor/arus");
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
    });

    client.on("message", (topic, message) => {
      try {
        const value = parseFloat(message.toString());
        if (isNaN(value)) return;
        
        switch (topic) {
          case "sensor/tegangan":
            setVoltage(value);
            break;
          case "sensor/arus":
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

  // Calculate percentages for gauge visualization
  const voltagePercentage = Math.min(100, Math.max(0, (voltage / 300) * 100)); // Assuming 300V max
  const currentPercentage = Math.min(100, Math.max(0, (current / 50) * 100)); // Assuming 50A max
  const frequencyPercentage = Math.min(100, Math.max(0, ((frequency - 45) / 10) * 100)); // Assuming 45-55Hz range

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Monitoring Kualitas Daya
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-6xl">
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
        
        {/* Wattage Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">watt</CardTitle>
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
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;