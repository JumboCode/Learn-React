import { useState } from "react";

export default function App() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div>
      <p>The light is {isOn ? "on" : "off"}.</p>
      <button onClick={() => setIsOn(!isOn)}>{isOn ? "Turn off" : "Turn on"}</button>
    </div>
  );
}
