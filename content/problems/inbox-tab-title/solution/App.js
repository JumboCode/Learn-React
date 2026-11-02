import { useState, useEffect } from "react";

export default function App() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    document.title = unread === 0 ? "Inbox" : `(${unread}) Inbox`;
  }, [unread]);

  return (
    <div>
      <p>Unread: {unread}</p>
      <button onClick={() => setUnread(unread + 1)}>New message</button>
      <button onClick={() => setUnread(0)}>Mark all read</button>
    </div>
  );
}
