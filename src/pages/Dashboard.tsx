"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Zap, Bolt, Power } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import mqtt from "mqtt";

const Dashboard = () => {
  // State for real-time data
  const [voltage, setVoltage] = useState<number>(0);
  const [current, setCurrent] = useState<number>(15.2);
  const [kwh, setKwh] = useState<number>(1234.56);
  const [wattage, setWattage] = useState<number>(3344.0);

  useEffect(() => {
    // Connect to HiveMQ broker
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
    
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      // Subscribe to the voltage topic
      client.subscribe("sensor/tegangan", (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log("Subscribed to sensor/tegangan");
        }
      });
    });

    client.on("message", (topic, message) => {
      if (topic === "sensor/tegangan") {
        try {
          const voltageValue = parseFloat(message.toString());
          if (!isNaN(voltageValue)) {
            setVoltage(voltageValue);
          }
        } catch (error) {
          console.error("Error parsing voltage data:", error);
        }
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Energy Monitoring Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time overview of your energy consumption.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voltage</CardTitle>
            <Bolt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voltage.toFixed(1)} V</div>
            <p className="text-xs text-muted-foreground">
              Current voltage reading
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{current} A</div>
            <p className="text-xs text-muted-foreground">
              Current amperage reading
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total kWh</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kwh} kWh</div>
            <p className="text-xs text-muted-foreground">
              Accumulated energy consumption
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wattage</CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wattage} W</div>
            <p className="text-xs text-muted-foreground">
              Current power usage
            </p>
          </CardContent>
        </Card>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;