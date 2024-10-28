import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loading from "./Loading";
import Cookies from "js-cookie";
import Alert from "./Alert";
import SolarImg from "../images/solar.png";
import InverterImg from "../images/inverter.png";
import ThunderImg from "../images/thunder.png";
import BatteryImg from "../images/battery.png";
import BulbImg from "../images/bulb.png";
import Graph from "./Graph";
import * as XLSX from "xlsx";

const AllDevices = () => {
  const [token, setToken] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [nav, setNav] = useState(false);
  const [sg, setSg] = useState("");
  const [ge, setGe] = useState("");
  const [lc, setLc] = useState("");
  const [dateOrg, setDateOrg] = useState("");
  const [selectedItem, setSelectedItem] = useState("stb001");
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState("Modaiyur");
  const [solarVoltage, setSolarVoltage] = useState("");
  const [solarCurrent, setSolarCurrent] = useState("");
  const [inverterVoltage, setInverterVoltage] = useState("");
  const [inverterCurrent, setInverterCurrent] = useState("");
  const [gridVoltage, setGridVoltage] = useState("");
  const [gridCurrent, setGridCurrent] = useState("");
  const [batteryVoltage, setBatteryVoltage] = useState("");
  const [batteryCurrent, setBatteryCurrent] = useState("");
  const [tvalue, settValue] = useState("");
  const [alerts, setAlerts] = useState("");
  const [InverterCheck, setInverterCheck] = useState(null);
  const [BatteryCheck, setBatteryCheck] = useState(null);
  const [SolarCheck, setSolarCheck] = useState(null);
  const [currDate, setCurrDate] = useState("");
  const [dataCharts, setDataCharts] = useState([]);
  const [records, setRecords] = useState([]);
 

  const InverterAlart = (message) => {
    setInverterCheck({
      msg: message,
    });
  };

  const BatteryAlart = (message) => {
    setBatteryCheck({
      msg: message,
    });
  };

  const SolarAlart = (message) => {
    setSolarCheck({
      msg: message,
    });
  };

  const showAlert = (message, type) => {
    setAlerts({
      msg: message,
      type: type,
    });
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("selectedItem");
    Cookies.remove("setLocation");
    window.location.href = "/";
  };

  useEffect(() => {
    // Check if the "selectedItem" cookie is set
    if (Cookies.get("selectedItem")) {
        // If it exists, update the `selectedItem` state with the value from the cookie
      setSelectedItem(Cookies.get("selectedItem"));
    }
            // Check if the "setLocation" cookie is set
    if (Cookies.get("setLocation")) {
             // If it exists, update the `location` state with the value from the cookie
      setLocation(Cookies.get("setLocation"));
    }
     // Check if the user is authenticated (i.e., has a valid token) and if they are an "Admin"
    if (!Cookies.get("token") || Cookies.get("role") !== "Admin") {
      // If no token exists, or the user is not an "Admin", redirect them to the loginpage
      window.location.href = "/";
    }

    // Set the token state with the value from the "token" cookie
    setToken(Cookies.get("token"));
     // Fetch data based on the selected item, either from the cookie or the current state
    fetchData(Cookies.get("selectedItem") || selectedItem);
  }, [selectedItem]);



// second useEffect

  useEffect(() => {
    if (tvalue) {
      const val = new Date(tvalue * 1000);
      setFormattedDate(val.toLocaleString());
    }
  }, [tvalue]);

  const changeDate = async (e) => {
    const token = Cookies.get("token");
    const data = await axios.post(
      `${process.env.REACT_APP_HOST}/admin/date`,
      {
        selectedItem: selectedItem,
        date: e,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (data.status === 200) {
      const convertTo12HourFormat = (time24) => {
        const [hours, minutes] = time24.split(":");
        let hours12 = hours % 12 || 12;
        const ampm = hours < 12 || hours === 24 ? "AM" : "PM";
        return `${hours12}:${minutes} ${ampm}`;
      };

      const newDataArray = data.data.data.dataCharts.map((chart) => ({
        time: convertTo12HourFormat(chart.ccAxisXValue),
        solarVoltage: "" + chart.SolarVoltage + " V",
        solarCurrent: "" + chart.SolarCurrent + " A",
        inverterVoltage: "" + chart.InverterVoltage + " V",
        inverterCurrent: "" + chart.InverterCurrent + " A",
        gridVoltage: "" + chart.GridVoltage + " V",
        gridCurrent: "" + chart.GridCurrent + " A",
        batteryCurrent: "" + chart.BatteryCurrent + " A",
        batteryVoltage: "" + chart.BatteryVoltage + " V",
      }));

      setRecords(newDataArray);
      setDataCharts(data.data.data.dataCharts);
    }
  };

  const fetchData = async (item) => {
   
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
        // Make an API request to fetch data from the server
        // Sends the selected item and includes the Authorization token in the headers

      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/admin/db`,
        { selectedItem: item },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
       // Check if the response status is 200 (OK)
      if (response.status === 200) {
        console.log(response)
        // Extract relevant data from the API response
        const data = response.data.data;
         // Set various states with the fetched data
        setDateOrg(data.caldate);
        setCurrDate(data.caldate);
        setDataCharts(data.dataCharts);
        setSg(data.p1ValueTot);
        setGe(data.p2ValueTot);
        setLc(data.p3ValueTot);
          // If snapshot data exists, set values related to device readings
        if (data.snapshot !== null) {
          settValue(data.snapshot.tValue);
          setSolarVoltage(data.snapshot.solarVoltage.toFixed(2));
          setSolarCurrent(data.snapshot.solarCurrent.toFixed(2));
          setInverterVoltage(data.snapshot.inverterVoltage.toFixed(2));
          setInverterCurrent(data.snapshot.inverterCurrent.toFixed(2));
          setGridVoltage(data.snapshot.gridVoltage.toFixed(2));
          setGridCurrent(data.snapshot.gridCurrent.toFixed(2));
          setBatteryVoltage(data.snapshot.batteryVoltage.toFixed(2));

           // If no snapshot data exists, set default zero values
        } else {
          settValue(data.caldate);
          setSolarVoltage(0);
          setSolarCurrent(0);
          setInverterVoltage(0);
          setInverterCurrent(0);
          setGridVoltage(0);
          setGridCurrent(0);
          setBatteryVoltage(0);
        }
 // Check if dataCharts array contains data
        if (data.dataCharts.length > 0) {
             // Get the current time in hours and minutes (24-hour format)
          const t = Date.now();
          // convert current Time into 24 hours format
          const currTime = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(t);

            // Get the last ccAxisXValue from dataCharts, which is a time value
          const check =data.dataCharts[data.dataCharts.length - 1].ccAxisXValue;

           // Convert the current time and chart time (check) into comparable numerical values
          const currValTime = Number(currTime.split(":")[0] + currTime.split(":")[1]);
          const checkVal = Number(check.split(":")[0] + check.split(":")[1]);

          console.log({currValTime:currValTime})
           // Compare the current time with the last chart value time (allowing a 50-minute difference)
          if (Math.abs(currValTime - checkVal) <= 50) {
            console.log(currValTime, currValTime);
            showAlert("This device is working", "success");
              // If the time difference is greater, the device is not working
          } else {
            console.log(checkVal, currValTime);
            showAlert("This device is not working!", "danger");
          }
        } else {
            // If dataCharts is empty, the device is not working
          showAlert("This device is not working!", "danger");
        }
      }
    } catch (error) {
       // Log any errors that occur during the data fetching process
      console.error("Error fetching data:", error);
    } finally {
       // Set loading state to false once data fetching is complete
      setIsLoading(false);
    }
  }; 

  const setDat = async () => {
    const newDate = new Date().toISOString().substring(0, 10);
    setDateOrg(newDate);

    await changeDate(currDate);
  };

  const handleMenuItemClick = (item, location) => {
    setSelectedItem(item);
    Cookies.set("selectedItem", item);
    Cookies.set("setLocation", location);
    setLocation(location);
    fetchData(item);
    setNav(!nav);
  };

  
// summary
// The function sends a POST request to fetch data for a specific selectedItem and dateOrg.
// If the request is successful, it processes the dataCharts array, extracts relevant values (time, voltages, currents), and returns an array of objects.
// If the request fails, it logs the error and returns an empty array.
  
  const dataFetch = async () => {
    try {
      const token = Cookies.get("token");
        // Send a POST request to the server with `selectedItem` and `dateOrg` as the payload
      const datas = await axios.post(
        `${process.env.REACT_APP_HOST}/admin/date`,
        { selectedItem: selectedItem, date: dateOrg },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (datas.status === 200) {
        const timeDelta=datas.data.data.timeDelta
          // If successful, map the `dataCharts` array from the API response to a new array of objects
        const newDataArray = datas.data.data.dataCharts.map((chart) => ({
            // Extract and map each chart data field into a new object with appropriate properties
          time: chart.ccAxisXValue,
          solarVoltage: `${chart.SolarVoltage}`,
          solarCurrent: `${chart.SolarCurrent}`,
          inverterVoltage: `${chart.InverterVoltage}`,
          inverterCurrent: `${chart.InverterCurrent}`,
          gridVoltage: `${chart.GridVoltage}`,
          gridCurrent: `${chart.GridCurrent}`,
          batteryCurrent: `${chart.BatteryCurrent}`,
          batteryVoltage: `${chart.BatteryVoltage}`,
        }));

        return {newDataArray, timeDelta}
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };
  // summary
  // The handlePrint function fetches the necessary data, processes it into a formatted structure, calculates total energy metrics (solar generation, grid energy, load consumption), and then generates an Excel file that the user can download.
  const handlePrint = async (e) => {
    e.preventDefault();

    try {
          // Fetch data asynchronously using the dataFetch function
      const {newDataArray, timeDelta} = await dataFetch();
     
      if (newDataArray.length === 0) {
         // If no data is fetched, log a warning and exit the function early
        console.warn("No data fetched");
        return;
      }
  // Map over the fetched data and format it into an array of objects for Excel
      const data = newDataArray.map((item) => ({
        Time: item.time,
        "Solar Voltage": item.solarVoltage,
        "SV Unit": "V",
        "Solar Current": item.solarCurrent,
        "SC Unit": "A",
        "Inverter Voltage": item.inverterVoltage,
        "IV Unit": "V",
        "Inverter Current": item.inverterCurrent,
        "IC Unit": "A",
        "Grid Voltage": item.gridVoltage,
        "GV Unit": "V",
        "Grid Current": item.gridCurrent,
        "GC Unit": "A",
        "Battery Voltage": item.batteryVoltage,
        "BV Unit": "V",
        "Battery Current": item.batteryCurrent,
        "BC Unit": "A",
      }));
    
 // Initialize variables to calculate total solar generation, grid energy, and load consumption
      let solarGeneration = 0;
      let gridEnergy = 0;
      let loadConsumption = 0;
  // Iterate over the data and calculate totals for each energy metric
      newDataArray.forEach((item) => {
         // Assumed time interval (1 hour for example)

   // Parse the string values of current to floating-point numbers (handle missing values with `|| 0`)
        const solarCurrent = parseFloat(item.solarCurrent) || 0;
        const gridCurrent = parseFloat(item.gridCurrent) || 0;
        const inverterCurrent = parseFloat(item.inverterCurrent) || 0;

        const solarVoltage = parseFloat(item.solarVoltage) || 0;
        const gridVoltage = parseFloat(item.gridVoltage) || 0;
        const inverterVoltage= parseFloat(item.inverterVoltage) || 0;
   // Calculate solar generation, grid energy, and load consumption over time
        solarGeneration += (solarCurrent.toFixed(2) * solarVoltage.toFixed(2) )*timeDelta*60/(1000*3600);
        gridEnergy += (gridCurrent.toFixed(2)  * gridVoltage.toFixed(2) )*timeDelta*60/(1000*3600);
        loadConsumption +=  (inverterCurrent.toFixed(2)  * inverterVoltage.toFixed(2) )*timeDelta*60/(1000*3600);
      
     
      });
 // Add a final row summarizing the calculated totals
      data.push({});
      data.push({
        Time: "End of Day",
        "Solar Voltage": "Solar Generation : ",
        "SV Unit": (solarGeneration ).toFixed(2),
        "Solar Current": "kWh",
        "SC Unit": "Grid Energy",
        "Inverter Voltage": (gridEnergy).toFixed(2),
        "IV Unit": "kWh",
        "Inverter Current": "Load Consumption",
        "IC Unit": (loadConsumption ).toFixed(2),
        "Grid Voltage": "kWh",
      });
  // Convert the data array to an Excel worksheet
      const ws = XLSX.utils.json_to_sheet(data);
  // Create a new Excel workbook and append the worksheet to it
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Sheet");

  // Save the workbook to a file named after the location and the date
      XLSX.writeFile(wb, `${location}-${dateOrg}.xlsx`);
    } catch (error) {
      console.error("Error handling print:", error);
    }
  };

  useEffect(() => {
    function isSolarFailure(solarValue) {
      const currentTime = new Date().getTime();
      const startTime = new Date();
      startTime.setHours(6);
      startTime.setMinutes(0);
      startTime.setSeconds(0);

      var endTime = new Date();
      endTime.setHours(17);
      endTime.setMinutes(30);
      endTime.setSeconds(0);

      if (
        currentTime >= startTime.getTime() &&
        currentTime <= endTime.getTime() &&
        solarValue < 0.5
      ) {
        return true;
      } else {
        return false;
      }
    }
    var solarValue = solarVoltage * solarCurrent;
    if (isSolarFailure(solarValue)) {
      SolarAlart(
        `Solar failure detected between 6:00 AM and 5:30 PM. ${
          solarCurrent * solarVoltage
        } W`
      );
    } else {
      SolarAlart(
        `Solar system is operational. ${solarCurrent * solarVoltage} W`
      );
    }

    function checkInverterStatus(
      solarVoltage,
      solarCurrent,
      batteryCharge,
      loadStatus,
      gridAvailability,
      inverterOutput
    ) {
      if (solarVoltage > 0 && solarCurrent === 0 && isPeakTime()) {
        InverterAlart("Inverter failure: Solar power is not charging.");
      }
      if (solarVoltage > 0 && batteryCharge === 100 && loadStatus === "Grid") {
        InverterAlart(
          "Inverter failure: Load is running on Grid instead of inverter."
        );
      }
      if (inverterOutput > 0 && !gridAvailability) {
        InverterAlart(
          "Inverter failure: Inverter only works when Grid is available."
        );
      }
      if (
        solarVoltage > 0 &&
        gridAvailability &&
        batteryCharge > 0 &&
        inverterOutput === 0
      ) {
        InverterAlart("Inverter failure: Inverter output is zero.");
      }
      InverterAlart(
        `Inverter is functioning properly.  ${(
          inverterVoltage * inverterCurrent
        ).toFixed(2)} W`
      );
    }

    function isPeakTime() {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      return currentHour >= 10 && currentHour <= 14;
    }
    const loadStatus = inverterVoltage < gridVoltage ? "Grid" : "Inverter";
    const gridAvailability = gridVoltage > 0;
    const inverterOutput = inverterVoltage * inverterCurrent;
    const batteryCharge = 100;
    checkInverterStatus(
      solarVoltage,
      solarCurrent,
      batteryCharge,
      loadStatus,
      gridAvailability,
      inverterOutput
    );

    BatteryAlart("Battery is Working!");
  }, [
    solarVoltage,
    solarCurrent,
    inverterVoltage,
    inverterCurrent,
    gridVoltage,
  ]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#79e2f2]">
      <div className="w-full">
        <div className="fixed w-full h-[70px] bg-[#17A2B8] text-white flex items-center justify-between z-10">
          <div className="flex items-center">
            <button
              onClick={() => setNav(!nav)}
              className="p-2 m-2 rounded-full bg-white text-[#17A2B8] duration-500 hover:shadow-lg"
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </div>
            </button>
            <Link to="/admin/">
              <h1 className="text-2xl p-4 font-semibold select-none">
                RE4BILLION
              </h1>
            </Link>
            <div className="flex items-center">
              <Link to="https://re4billion.ai/">
                <h1 className="p-2 select-none">Home</h1>
              </Link>
              <Link to="/admin/alldevices">
                <h1 className="p-2 select-none">Status</h1>
              </Link>
              <Link to="/admin/">
                <h1 className="p-2 select-none">Location</h1>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <h1 className="p-2 select-none">
              Last updated on : {formattedDate}
            </h1>
            <button
              className="m-2 p-2 rounded-lg shadow hover:shadow-lg bg-white text-[#17A2B8]"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className={`w-full mt-[80px] flex flex-col items-center`}>
          {nav ? (
            <div
              className="bg-black/80 fixed w-full h-screen z-10 top-[70px] left-0"
              onClick={() => setNav(!nav)}
            ></div>
          ) : (
            ""
          )}
          <div
            className={`fixed ${
              nav ? "left-0" : "-left-full"
            } top-[70px] w-68 bg-gray-800 text-white z-10 transition-all duration-300 ease-in-out overflow-y-auto`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#718096 #1A202C",
              maxHeight: "calc(100vh - 70px)",
            }}
          >
            {[
              "ftb001-Kollar",
              "stb001-Modaiyur",
              "nrmsv2f001-Ananthapuram",
              "rmsv3_001-Vengur",
              "rmsv3_002-Sithalingamadam",
              "rmsv32_001-Keelathalanur",
              "rmsv33_001-Perumukkal",
              "rmsv33_002-Agalur",
              "rmsv33_005-Saram",
              "rmsv34_002-Pootai",
              "rmsv34_003-Siruvanthadu",
              "rmsv35_002-Puthirampattu",
              "rmsv35_003-Vadalur",
              "rmsv35_006- Channamahgathihalli KA",
              "rmsv35_007- Alagarai",
              "rmsv35_008-Kanniyapuram",
              "rmsv4_001-Melmalaiyanur",
              "rmsv4_002-Thandavankulam",
              "rmsv33_003-Testing",
              "rmsv33_004-Testing",
              "rmsv33_007-Testing",
              "rmsv34_004-Testing",
              "rmsv34_005-Testing",
              "rmsv35_001-Testing",
              "rmsv35_004-Testing",
              "rmsv35_005-Testing",
              "rmsv35_009-Testing",
              "rmsv35_010-Testing",
              "rmsv35_011-Testing",
              "rmsv35_012-Testing",
              "rmsv35_013-Testing",
              "rmsv35_014-Jenugadde KA",
              "rmsv35_015-Sindigere KA",
              "rmsv35_016-Testing",
              "rmsv35_017-Testing",
              "rmsv35_018-Testing",
              "rmsv35_019-Testing",
              "rmsv35_020-Testing",
              "rmsv4_003-Testing",
              "rmsv4_004-Testing",
              "rmsv4_005-Testing",
            ].map((item, index) => (
              <h1
                key={index}
                className="p-2 cursor-pointer select-none"
                style={{
                  backgroundColor:
                    selectedItem === item.split("-")[0] ? "Violet" : "",
                }}
                onClick={() =>
                  handleMenuItemClick(
                    item.split("-")[0],
                    item.split("-")[1] === "Testing" ? item : item.split("-")[1]
                  )
                }
              >
                {item}
              </h1>
            ))}
          </div>
          <div className="flex items-center justify-between p-2 w-full">
            <div className="flex items-center gap-1 mx-2 select-none">
              <h1 className="flex items-center justify-center text-xl font-bold">
                VALUES CALCULATED ON{" "}
              </h1>
              <h1 className="flex items-center text-indigo-700 justify-center text-xl font-bold">
                {formattedDate.split(",")[0]}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center mx-2 gap-1 p-2 shadow-lg rounded-lg bg-blue-700 hover:shadow-xl cursor-pointer select-none"
                onClick={handlePrint}
              >
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="white"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
                    />
                  </svg>
                </div>
                <h1 className="font-semibold text-white">Download Data on</h1>
              </div>
              <input
                type="date"
                value={dateOrg}
                onChange={(e) => {
                  setDateOrg(e.target.value);
                  changeDate(e.target.value);
                }}
                className={`p-1 rounded-lg shadow-lg ${
                  dataCharts.length > 0
                    ? "border-green-700 border border-1 bg-[#D4EDDA]"
                    : "border-red-700 border border-1 bg-[#F8D7DA]"
                } `}
              />
            </div>
          </div>
          <div className="w-full p-2">
            <Alert
              alert={alerts}
              InverterCheck={InverterCheck}
              BatteryCheck={BatteryCheck}
              SolarCheck={SolarCheck}
              location={location}
            />
          </div>
          <div className="flex items-center p-2 w-full">
            <div className="p-4 rounded-lg bg-white w-full m-2 flex flex-col items-center">
              <h1 className="p-1 flex items-center justify-center text-2xl font-bold text-[#FF5A76]">
                ENERGY CONSUMPTIONS
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 justify-center">
                <div
                  className={`lg:w-[280px] md:w-[200px] bg-[#38DAB9] m-4 p-4 hover:cursor-pointer hover:scale-105 duration-500 flex flex-col items-center p-3 gap-5 rounded-lg shadow-lg`}
                >
                  <h1 className="text-white text-2xl font-bold">
                    Solar Generation
                  </h1>
                  <div className="flex items-center gap-2 p-2">
                    <img src={SolarImg} width={30} loading="lazy" />
                    <h1 className="text-white text-2xl font-bold">{sg} kWh</h1>
                  </div>
                </div>
                <div
                  className={`lg:w-[280px] md:w-[200px] bg-[#67AEFF] m-4 p-4 hover:cursor-pointer hover:scale-105 duration-500 flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                >
                  <h1 className="text-white text-2xl font-bold">Grid Energy</h1>
                  <div className="flex items-center gap-2 p-2">
                    <img src={ThunderImg} width={30} loading="lazy" />
                    <h1 className="text-white text-2xl font-bold">{ge} kWh</h1>
                  </div>
                </div>
                <div
                  className={`lg:w-[280px] md:w-[200px] bg-[#FF5A76] m-4 p-4 hover:cursor-pointer hover:scale-105 duration-500 flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                >
                  <h1 className="text-white text-2xl font-bold">
                    Load Consumption
                  </h1>
                  <div className="flex items-center gap-2 p-2">
                    <img src={BulbImg} width={40} loading="lazy" />
                    <h1 className="text-white text-2xl font-bold">{lc} kWh</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center px-2 md:mt-1 w-full">
            <div className="p-4 rounded-lg bg-white w-full mx-2 flex flex-col">
              <div className="flex flex-col items-center justify-center w-full">
                <h1 className="p-4 flex items-center justify-center text-2xl font-bold text-[#FF5A76]">
                  PARAMETERS REPRESENTATION
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 justify-center">
                  <div
                    className={`lg:w-[300px] md:w-[200px] hover:cursor-pointer hover:scale-105 duration-500 ${
                      solarVoltage > 2 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                    } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                  >
                    <h1 className="text-white text-2xl font-bold">
                      Solar Voltage
                    </h1>
                    <div className="flex items-center gap-2 p-2">
                      <img src={SolarImg} width={30} loading="lazy" />
                      <h1 className="text-white text-2xl font-bold">
                        {solarVoltage} V
                      </h1>
                    </div>
                  </div>
                  <div
                    className={`lg:w-[300px] md:w-[200px] hover:cursor-pointer hover:scale-105 duration-500 ${
                      solarCurrent > 0 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                    } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                  >
                    <h1 className="text-white text-2xl font-bold">
                      Solar Current
                    </h1>
                    <div className="flex items-center gap-2 p-2">
                      <img src={SolarImg} width={30} loading="lazy" />
                      <h1 className="text-white text-2xl font-bold">
                        {solarCurrent} A
                      </h1>
                    </div>
                  </div>
                  <div
                    className={`lg:w-[300px] md:w-[200px] hover:cursor-pointer hover:scale-105 duration-500 ${
                      inverterVoltage > 180 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                    } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                  >
                    <h1 className="text-white text-2xl font-bold">
                      Inverter Voltage
                    </h1>
                    <div className="flex items-center gap-2 p-2">
                      <img src={InverterImg} width={30} loading="lazy" />
                      <h1 className="text-white text-2xl font-bold">
                        {inverterVoltage} V
                      </h1>
                    </div>
                  </div>
                  <div
                    className={`lg:w-[300px] md:w-[200px] hover:cursor-pointer hover:scale-105 duration-500 ${
                      inverterCurrent > 0 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                    } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                  >
                    <h1 className="text-white text-2xl font-bold">
                      Inverter Current
                    </h1>
                    <div className="flex items-center gap-2 p-2">
                      <img src={InverterImg} width={30} loading="lazy" />
                      <h1 className="text-white text-2xl font-bold">
                        {inverterCurrent} A
                      </h1>
                    </div>
                  </div>
                  <div
                    className={`lg:w-[300px] md:w-[200px] hover:cursor-pointer hover:scale-105 duration-500 ${
                      gridVoltage > 160 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                    } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                  >
                    <h1 className="text-white text-2xl font-bold">
                      Grid Voltage
                    </h1>
                    <div className="flex items-center gap-2 p-2">
                      <img src={ThunderImg} width={30} loading="lazy" />
                      <h1 className="text-white text-2xl font-bold">
                        {gridVoltage} V
                      </h1>
                    </div>
                  </div>
                  <div
                    className={`lg:w-[300px] md:w-[200px] hover:cursor-pointer hover:scale-105 duration-500 ${
                      gridCurrent > 0 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                    } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                  >
                    <h1 className="text-white text-2xl font-bold">
                      Grid Current
                    </h1>
                    <div className="flex items-center gap-2 p-2">
                      <img src={ThunderImg} width={30} loading="lazy" />
                      <h1 className="text-white text-2xl font-bold">
                        {gridCurrent} A
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div
                  className={`lg:w-[300px] md:w-[200px] p-4 hover:cursor-pointer hover:scale-105 duration-500 ${
                    batteryVoltage > 22 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                  } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                >
                  <h1 className="text-white text-2xl font-bold">
                    Battery Voltage
                  </h1>
                  <div className="flex items-center gap-2 p-2">
                    <img src={BatteryImg} width={50} loading="lazy" />
                    <h1 className="text-white text-2xl font-bold">
                      {batteryVoltage} V
                    </h1>
                  </div>
                </div>
                {batteryCurrent && (
                  <div
                    className={`lg:w-[300px] md:w-[200px] p-4 hover:cursor-pointer hover:scale-105 duration-500 ${
                      batteryVoltage > 0 ? "bg-[#50DFC2]" : "bg-[#FF627C]"
                    } flex flex-col items-center p-3 gap-2 rounded-lg shadow-lg`}
                  >
                    <h1 className="text-white text-2xl font-bold">
                      Battery Current
                    </h1>
                    <div className="flex items-center gap-2 p-2">
                      <img src={BatteryImg} width={50} loading="lazy" />
                      <h1 className="text-white text-2xl font-bold">
                        {batteryCurrent} V
                      </h1>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center p-2 w-full">
            <div className="p-4 rounded-lg bg-white w-full m-2 flex flex-col items-center justify-center">
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center justify-between p-2">
                    <h1 className="p-4 flex items-center justify-center text-2xl font-bold">
                      VISUAL REPRESENTATION ON{" "}
                    </h1>
                    <input
                      type="date"
                      value={dateOrg}
                      onChange={(e) => {
                        setDateOrg(e.target.value);
                        changeDate(e.target.value);
                      }}
                      className={`p-1 rounded-lg shadow-lg ${
                        dataCharts.length > 0
                          ? "border-green-700 border border-1 bg-[#D4EDDA]"
                          : "border-red-700 border border-1 bg-[#F8D7DA]"
                      } `}
                    />
                  </div>
                </div>
                <div
                  onClick={setDat}
                  className="p-2 cursor-pointer flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  Refresh
                </div>
              </div>
              <Graph dataCharts={dataCharts} dateOrg={dateOrg} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDevices;
