// LiveChat.jsx
import { useEffect } from "react";

const LiveChat = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/6864ef41584668190c259d36/1iv54d64t"; // 🔁 Replace this with your actual script
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default LiveChat;
