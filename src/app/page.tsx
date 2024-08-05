"use client";
import { useState } from "react";
import { Input } from "../components/ui/input";
import axios from "axios";
import KeywordResearch from "../components/research-keyword";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingStates = [
    { text: "Loading..." }, // Generic loading state
    { text: "Fetching data..." }, // More specific loading state
    { text: "Data fetched successfully" }, // Success state
  ];
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            maxResults: 25,
            q: keyword,
            prettyPrint: true,
            key:
              process.env.YOUTUBE_API_KEY ||
              "AIzaSyD_BL2XY9gibP2OFZpeIAUaupPow-nqmFg",
          },
        }
      );

      setApiResponse(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };
  return (
    <main className="min-h-screen w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="flex flex-col gap-2 justify-center items-center max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 justify-center items-center max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
            The Best Youtube Keyword research tool
          </h1>
          <Input
            placeholders={[
              "Enter your keyword here",
              "youtube",
              "tech",
              "nature",
              "translate",
              "google",
              "instagram",
              "Lifestyle",
              "amazon",
              "gmail",
              "google translate",
              "weather",
              "traductor",
              "cricbuzz",
              "chatgpt",
              "restaurants",
            ]}
            onChange={(e) => setKeyword(e.target.value)}
            onSubmit={handleSubmit}
          ></Input>
        </div>
        {isLoading && (
          <MultiStepLoader
            loadingStates={loadingStates}
            loading={isLoading}
            duration={3000}
          />
        )}
        <div>
          {apiResponse && (
            <KeywordResearch
              apiResponse={apiResponse}
              keyword={keyword}
              targetLanguage="en"
            />
          )}
        </div>
      </div>
    </main>
  );
}

const commonWords: Set<string> = new Set([
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "I",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "amp",
  "https",
  "com",
  "www",
  "http",
  "html",
  "youtube",
  "video",
  "new",
  "like",
  "one",
  "time",
  "vs",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
  "kar",
  "ke",
  "kya",
  "hain",
  "doston",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
]);
