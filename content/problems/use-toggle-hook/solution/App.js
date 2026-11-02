import { useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v);
  return [value, toggle];
}

export default function App() {
  const [showDetails, toggleDetails] = useToggle();
  const [notifications, toggleNotifications] = useToggle();

  return (
    <div>
      <button onClick={toggleDetails}>{showDetails ? "Hide details" : "Show details"}</button>
      {showDetails && <p>Here are the details.</p>}
      <button onClick={toggleNotifications}>
        {notifications ? "Turn off notifications" : "Turn on notifications"}
      </button>
    </div>
  );
}
