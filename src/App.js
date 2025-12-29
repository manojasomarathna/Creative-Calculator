import React, { useState } from "react";
import {
  Delete,
  Divide,
  Minus,
  Plus,
  X,
  Percent,
  History,
  Music,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function App() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ripples, setRipples] = useState([]);
  const [theme, setTheme] = useState("blackwhite");

  const themes = {
    blackwhite: {
      gradient: "from-gray-900 to-gray-800",
      buttonBg: "bg-white/10 hover:bg-white/20",
      operator: "bg-gray-700 hover:bg-gray-600",
      equals: "bg-gray-600 hover:bg-gray-500",
      clear: "bg-red-600 hover:bg-red-500",
      text: "text-white",
    },
  };

  /* ---------------- SOUND ---------------- */
  const playSound = (frequency = 400, duration = 50) => {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration / 1000
    );

    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  };

  /* ---------------- RIPPLE ---------------- */
  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  /* ---------------- HANDLERS ---------------- */
  const handleNumber = (num) => {
    playSound(440 + num * 20, 50);
    if (display === "0" || result !== null) {
      setDisplay(num);
      setEquation(num);
      setResult(null);
    } else {
      setDisplay(display + num);
      setEquation(equation + num);
    }
  };

  const handleOperator = (op) => {
    playSound(300, 70);
    if (!equation) return;
    setEquation(equation + op);
    setDisplay(op);
  };

  const handleClear = () => {
    playSound(200, 100);
    setDisplay("0");
    setEquation("");
    setResult(null);
  };

  const handleDelete = () => {
    playSound(250, 70);
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setEquation(equation.slice(0, -1));
    } else {
      setDisplay("0");
      setEquation("");
    }
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
      setEquation(equation + ".");
    }
  };

  const handlePercent = () => {
    playSound(420, 80);
    setEquation(equation + "%");
    setDisplay(display + "%");
  };

  const handleEquals = () => {
    playSound(600, 150);
    try {
      const value = eval(
        equation
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/%/g, "/100")
      );
      const resultStr = value.toString();

      setHistory([{ equation: equation + " =", result: resultStr }, ...history.slice(0, 9)]);
      setDisplay(resultStr);
      setEquation(resultStr);
      setResult(resultStr);
    } catch {
      setDisplay("Error");
      setEquation("");
    }
  };

  /* ---------------- BUTTON ---------------- */
  const Button = ({ children, onClick, variant = "default" }) => {
    const styles = {
      default: themes[theme].buttonBg,
      operator: themes[theme].operator,
      equals: themes[theme].equals,
      clear: themes[theme].clear,
    };

    return (
      <button
        onClick={(e) => {
          onClick();
          addRipple(e);
        }}
        className={`${styles[variant]} ${themes[theme].text} text-2xl font-bold p-5 rounded-2xl relative overflow-hidden transition-all`}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute bg-white/30 rounded-full animate-ping"
            style={{
              left: r.x,
              top: r.y,
              width: 20,
              height: 20,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        {children}
      </button>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 relative overflow-hidden">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}

      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 relative z-10">
        {/* Controls */}
        <div className="flex justify-between mb-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="text-white" /> : <VolumeX className="text-white" />}
          </button>
          <button onClick={() => setShowHistory(!showHistory)}>
            <History className="text-white" />
          </button>
        </div>

        {/* History */}
        {showHistory && history.length > 0 && (
          <div className="mb-4 bg-black/40 rounded-xl p-3 text-sm text-white/80 max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-white/10 last:border-0">
                <span>{h.equation}</span>
                <span className="text-green-400 font-bold">{h.result}</span>
              </div>
            ))}
          </div>
        )}

        {/* Display */}
        <div className="text-right mb-6">
          <div className="text-white/60 text-sm min-h-[20px]">{equation || " "}</div>
          <div className="text-white text-5xl font-bold break-all">{display}</div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button variant="clear" onClick={handleClear}>AC</Button>
          <Button variant="clear" onClick={handleDelete}><Delete /></Button>
          <Button onClick={handlePercent}><Percent /></Button>
          <Button variant="operator" onClick={() => handleOperator("÷")}><Divide /></Button>

          <Button onClick={() => handleNumber("7")}>7</Button>
          <Button onClick={() => handleNumber("8")}>8</Button>
          <Button onClick={() => handleNumber("9")}>9</Button>
          <Button variant="operator" onClick={() => handleOperator("×")}><X /></Button>

          <Button onClick={() => handleNumber("4")}>4</Button>
          <Button onClick={() => handleNumber("5")}>5</Button>
          <Button onClick={() => handleNumber("6")}>6</Button>
          <Button variant="operator" onClick={() => handleOperator("-")}><Minus /></Button>

          <Button onClick={() => handleNumber("1")}>1</Button>
          <Button onClick={() => handleNumber("2")}>2</Button>
          <Button onClick={() => handleNumber("3")}>3</Button>
          <Button variant="operator" onClick={() => handleOperator("+")}><Plus /></Button>

          <Button className="col-span-2" onClick={() => handleNumber("0")}>0</Button>
          <Button onClick={handleDecimal}>.</Button>
          <Button variant="equals" onClick={handleEquals}>=</Button>
        </div>

        <div className="mt-4 text-center text-white/40 text-sm flex justify-center gap-2">
          <Music className="w-4 h-4" /> Creative Calculator
        </div>
      </div>
    </div>
  );
}
