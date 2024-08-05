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
  const loadingStates  = [
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
              process.env.YOUTUBE_API_KEY || ""
          },
        }
      );
      console.log(response.data);

      setApiResponse(response.data);
      console.log(apiResponse);
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
            <KeywordResearch apiResponse={apiResponse} keyword={keyword} />
          )}
        </div>
      </div>
    </main>
  );
}
