import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    tags?: string[];
  };
  statistics: {
    viewCount: number;
    likeCount: number;
  };
}

interface KeywordResearchProps {
  apiResponse: any;
  keyword: string;
  targetLanguage: string;
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({
  apiResponse,
  keyword,
  targetLanguage,
}) => {
  const [keywords, setKeywords] = useState<
    { keyword: string; avgReach: number }[]
  >([]);

  const fuzzyMatch = (str1: string, str2: string) => {
    const regex = new RegExp(
      `(?=.*${str1.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "i"
    );
    return regex.test(str2);
  };
  // const fuzzyMatch = (str1: string, str2: string) => {
  //   const pattern = str1.split("").map(char => `(?=.*${char})`).join("");
  //   const regex = new RegExp(`${pattern}`, "i");
  //   return regex.test(str2);
  // };

  useEffect(() => {
    const fetchVideoDetails = async (videoId: string) => {
      try {
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/videos",
          {
            params: {
              part: "snippet,statistics",
              id: videoId,
              key:
                process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ,
            },
          }
        );
        return response.data.items[0] as Video;
      } catch (error) {
        console.error("Error fetching video details:", error);
        return null;
      }
    };

    const processKeywords = async () => {
      const videoIds = apiResponse.items.map((item: any) => item.id.videoId);
      const videoDetails = await Promise.all(videoIds.map(fetchVideoDetails));

      const keywordMap: { [key: string]: { reach: number; count: number } } =
        {};

      videoDetails.forEach((video) => {
        if (video && video.snippet.tags) {
          const reach = video.statistics.viewCount + video.statistics.likeCount;
          const { title, description, tags } = video.snippet;

          tags.forEach((tag: any) => {
            const normalizedTag = tag.toLowerCase();
            if (
              fuzzyMatch(normalizedTag, title.toLowerCase()) ||
              fuzzyMatch(normalizedTag, description.toLowerCase())
            ) {
              if (!keywordMap[normalizedTag]) {
                keywordMap[normalizedTag] = { reach: 0, count: 0 };
              }
              keywordMap[normalizedTag].reach += reach;
              keywordMap[normalizedTag].count += 1;
            }
          });
        }
      });

      const keywordArray = Object.keys(keywordMap)
        .map((key) => ({
          keyword: key,
          avgReach: keywordMap[key].reach / keywordMap[key].count,
        }))
        .filter((item) => keywordMap[item.keyword].count > 1); // Exclude tags that appear only once

      keywordArray.sort((a, b) => b.avgReach - a.avgReach);

      setKeywords(keywordArray.slice(0, 10));
    };

    processKeywords();
  }, [apiResponse]);

  return (
    <Card className="mt-8 w-full max-w-4xl rounded-lg bg-gradient-to-b from-neutral-950-100 to-stone-950">
    <CardHeader>Top Related Keywords for: {keyword}</CardHeader>
    <CardContent className="flex max-w-4xl flex-wrap justify-center">
      {keywords.length > 0 ? (
        keywords.map((item, index) => (
          <Button
            variant="outline"
            key={index}
            className="m-1 pointer-events-none"
          >
            {item.keyword}
            {/* (Avg Reach: {item.avgReach.toFixed(2)}) */}
          </Button>
        ))
      ) : (
        <div className="text-center text-neutral-500">
          It seems the keyword is not that popular, try with an alternative keyword.
        </div>
      )}
    </CardContent>
  </Card>
  
  );
};

export default KeywordResearch;
