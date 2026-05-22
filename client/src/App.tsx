import { useState } from "react";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import Calculator from "@/pages/Calculator";

function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  // Set initial theme
  if (dark) document.documentElement.classList.add("dark");

  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={() => <Calculator dark={dark} onToggleDark={toggleDark} />} />
        <Route component={() => <Calculator dark={dark} onToggleDark={toggleDark} />} />
      </Switch>
      <Toaster />
    </Router>
  );
}

export default App;
