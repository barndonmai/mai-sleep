import { useEffect, useRef } from "react";
import { Moon } from "lucide-react";
import { motion } from "framer-motion";

import SleepHero from "@/components/SleepHero";
import SleepResultsCard from "@/components/SleepResultsCard";
import NightBackground from "@/components/NightBackground";

import { useTheme } from "@/hooks/useTheme";
import { useSleepCalculator } from "@/hooks/useSleepCalculator";

export default function MaiSleep() {
  const { darkMode, classes } = useTheme(true);

  const {
    wakeTime,
    setWakeTime,
    sleepTime,
    setSleepTime,

    mode,
    subtitle,
    results,
    hasCalculated,
    resultsRenderKey,

    calculateSleepNow,
    calculateFromWakeTime,
    calculateFromSleepTime,
  } = useSleepCalculator();

  const resultsRef = useRef(null);
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    if (!hasCalculated) return;
    if (!resultsRef.current) return;

    shouldScrollRef.current = false;

    // One more tick so layout settles (esp. with motion / fonts)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, [hasCalculated, resultsRenderKey]);

  function queueScrollThen(fn) {
    shouldScrollRef.current = true;
    fn();
  }

  function handleSleepNow() {
    queueScrollThen(calculateSleepNow);
  }

  function handleWakeAtTime() {
    queueScrollThen(calculateFromWakeTime);
  }

  function handleSleepAtTime() {
    queueScrollThen(calculateFromSleepTime);
  }

  return (
    <div className={`${classes.page} min-h-screen flex flex-col`}>
      {darkMode && <NightBackground />}

      <div className="relative mx-auto w-full max-w-3xl flex flex-col flex-1">
        <motion.div
          className="flex flex-col flex-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="w-full">
            <div className="flex flex-col items-center text-center">
              <div className={`${classes.pill} w-fit`}>
                <Moon className="h-4 w-4 opacity-90" />
                Sleep Cycle Calculator
              </div>

              <h1 className="text-4xl font-semibold tracking-tight">
                Mai Sleep
              </h1>

              <p className={`${classes.subtitle} text-center max-w-2xl`}>
                {subtitle}
              </p>
            </div>

            <SleepHero
              classes={classes}
              wakeTime={wakeTime}
              setWakeTime={setWakeTime}
              sleepTime={sleepTime}
              setSleepTime={setSleepTime}
              onSleepNow={handleSleepNow}
              onWakeAtTime={handleWakeAtTime}
              onSleepAtTime={handleSleepAtTime}
            />

            {hasCalculated && (
              <div ref={resultsRef} className="mt-6">
                <SleepResultsCard
                  key={resultsRenderKey}
                  classes={classes}
                  mode={mode}
                  results={results}
                  darkMode={darkMode}
                  wakeTime={wakeTime}
                  sleepTime={sleepTime}
                />
              </div>
            )}
          </div>

          <div className={`${classes.footer} mt-auto w-full text-center`}>
            <div className="mt-6">
              Note: This is a sleep cycle estimate, not medical advice.
              Individual sleep needs vary.
            </div>
            <div className="mt-3">
              Built with ♡ <span className="opacity-70">by Brandon Mai</span> ·{" "}
              <a
                href="https://github.com/barndonmai/mai-sleep"
                className="underline underline-offset-4 hover:opacity-90"
              >
                GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
