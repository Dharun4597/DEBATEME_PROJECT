import { useState } from "react";
import TopicSetup from "./components/TopicSetup.jsx";
import DebateArena from "./components/DebateArena.jsx";
import Verdict from "./components/Verdict.jsx";

export default function App() {
  // stage: "setup" | "debate" | "verdict"
  const [stage, setStage] = useState("setup");
  const [topic, setTopic] = useState("");
  const [userSide, setUserSide] = useState("for");
  const [transcript, setTranscript] = useState([]);

  function handleStart(chosenTopic, chosenSide) {
    setTopic(chosenTopic);
    setUserSide(chosenSide);
    setTranscript([]);
    setStage("debate");
  }

  function handleFinish(history) {
    setTranscript(history);
    setStage("verdict");
  }

  function handleRestart() {
    setTopic("");
    setTranscript([]);
    setStage("setup");
  }

  return (
    <div className="min-h-screen text-ink">
      {stage === "setup" && <TopicSetup onStart={handleStart} />}
      {stage === "debate" && (
        <DebateArena
          topic={topic}
          userSide={userSide}
          onFinish={handleFinish}
        />
      )}
      {stage === "verdict" && (
        <Verdict
          topic={topic}
          userSide={userSide}
          history={transcript}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
