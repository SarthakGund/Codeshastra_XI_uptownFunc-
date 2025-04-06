import React from "react";
import { FlipWords } from "../../components/ui/flip-words";

export function FlipWordsDemo() {
  const words = ["better", "stylish", "", "modern"];

  return (
    <div className="h-[40rem] flex justify-center items-center px-4">
      <div className="text-6xl mx-auto font-normal text-neutral-100 dark:text-neutral-100">
        Build
        <FlipWords words={words} /> <br />
        websites 
        with Utilx
      </div>
    </div>
  );
}
