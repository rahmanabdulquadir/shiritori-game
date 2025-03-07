/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";

const wordsSet = new Set<string>();
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

interface Scores {
  player1: number;
  player2: number;
}

export default function ShiritoriGame() {
  const [currentWord, setCurrentWord] = useState<string>("");
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [scores, setScores] = useState<Scores>({ player1: 0, player2: 0 });
  const [timer, setTimer] = useState<number>(10);
  const [gameOver] = useState<boolean>(false);

  useEffect(() => {
    if (!gameOver) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            handleInvalidWord();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [currentPlayer, gameOver]);

  const validateWord = async (word: string): Promise<boolean> => {
    if (word.length < 4 || wordsSet.has(word)) return false;
    if (
      wordHistory.length &&
      word[0] !== wordHistory[wordHistory.length - 1].slice(-1)
    )
      return false;
    try {
      const res = await fetch(`${API_URL}/${word}`);
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleWordSubmit = async () => {
    if (await validateWord(currentWord)) {
      wordsSet.add(currentWord);
      setWordHistory([...wordHistory, currentWord]);
      setScores((prevScores) => ({
        ...prevScores,
        [`player${currentPlayer}`]:
          prevScores[`player${currentPlayer}` as keyof Scores] + 1,
      }));
      setCurrentWord("");
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setTimer(10);
    } else {
      handleInvalidWord();
    }
  };

  const handleInvalidWord = () => {
    setScores((prevScores) => ({
      ...prevScores,
      [`player${currentPlayer}`]:
        prevScores[`player${currentPlayer}` as keyof Scores] - 1,
    }));
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setTimer(10);
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-800 to-black text-white px-16">
      <h1 className="text-4xl font-extrabold mb-6 text-blue-400 drop-shadow-lg">
        Shiritori Game
      </h1>
      <p className="text-lg mb-2 font-semibold">
        Player {currentPlayer}'s Turn
      </p>
      <p className="text-xl font-bold text-yellow-400 animate-pulse">
        Timer: {timer}s
      </p>
      <input
        type="text"
        value={currentWord}
        onChange={(e) => setCurrentWord(e.target.value.toLowerCase())}
        className="mt-4 p-3 rounded-lg text-white w-64 text-center shadow-md focus:ring-2 focus:ring-blue-400"
        placeholder="Enter a word..."
      />
      <button
        onClick={handleWordSubmit}
        className="mt-3 px-6 py-3 bg-blue-500 rounded-lg shadow-md text-white font-semibold hover:bg-blue-700 transition-all duration-300"
      >
        Submit
      </button>
      <div className="mt-6 w-full max-w-lg bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-2">Scores</h2>
        <p className="text-lg text-center">
          Player 1: {scores.player1} | Player 2: {scores.player2}
        </p>
      </div>
      <div className="mt-6 w-full max-w-lg bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Word History
        </h2>
        <ul className="list-disc list-inside">
          {wordHistory.map((word, index) => (
            <li key={index} className="text-lg text-blue-300">
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
