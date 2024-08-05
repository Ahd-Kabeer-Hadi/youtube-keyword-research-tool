import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { detect as detectAll } from "langdetect";

interface ApiResponse {
  items: Array<{
    snippet: {
      title: string;
      description: string;
      tags?: string[];
    };
    statistics?: {
      viewCount: string;
      likeCount: string;
    };
  }>;
}

interface KeywordData {
  keyword: string;
  score: number;
  frequency: number;
  relevance: number;
  language: string;
}

interface KeywordResearchProps {
  apiResponse: ApiResponse | null;
  keyword: string;
  targetLanguage: string;
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({
  apiResponse,
  keyword,
  targetLanguage,
}) => {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);

  useEffect(() => {
    if (apiResponse) {
      const extractedKeywords = extractKeywords(
        apiResponse,
        keyword,
        targetLanguage
      );
      setKeywords(extractedKeywords);
    }
  }, [apiResponse, keyword, targetLanguage]);

  const extractKeywords = (
    response: ApiResponse,
    mainKeyword: string,
    targetLang: string
  ): KeywordData[] => {
    const items = response.items;
    let allText = "";
    let allTags: string[] = [];

    items.forEach((item) => {
      allText += `${item.snippet.title} ${item.snippet.description} `;
      if (item.snippet.tags) {
        allTags = [...allTags, ...item.snippet.tags];
      }
    });

    // Sanitize text to remove special characters and HTML entities
    const sanitizedText = allText
      .replace(/&[a-z]+;/gi, "") // Remove HTML entities
      .replace(/[^\w\s]/gi, ""); // Remove special characters
    const words = sanitizedText.toLowerCase().split(/\s+/);

    // Generate unigrams (single words only)
    const unigrams = generateNGrams(words, 1);

    // Combine unigrams and tags
    const combinedKeywords = { ...unigrams };
    allTags.forEach((tag) => {
      combinedKeywords[tag.toLowerCase()] =
        (combinedKeywords[tag.toLowerCase()] || 0) + 3;
    });

    // Calculate TF-IDF scores
    const tfidfScores = calculateTFIDF(combinedKeywords, items);

    // Calculate keyword scores and filter by language
    const scoredKeywords = Object.entries(combinedKeywords)
      .map(([keyword, frequency]): KeywordData => {
        const detectedLang = detectLanguage(keyword);
        return {
          keyword,
          frequency,
          score: calculateKeywordScore(
            keyword,
            frequency,
            mainKeyword,
            items,
            tfidfScores[keyword] || 0
          ),
          relevance: calculateRelevance(keyword, mainKeyword),
          language: detectedLang,
        };
      })
      .filter(
        (k) =>
          k.language === targetLang &&
          !commonWords.has(k.keyword) &&
          k.keyword.length > 2 &&
          !k.keyword.includes(" ")
      );

    // Sort keywords by score and return top 20
    return scoredKeywords.sort((a, b) => b.score - a.score).slice(0, 20);
  };

  const generateNGrams = (
    words: string[],
    n: number
  ): Record<string, number> => {
    const ngrams: Record<string, number> = {};
    for (let i = 0; i <= words.length - n; i++) {
      const gram = words.slice(i, i + n).join(" ");
      ngrams[gram] = (ngrams[gram] || 0) + 1;
    }
    return ngrams;
  };

  const calculateTFIDF = (
    keywords: Record<string, number>,
    items: ApiResponse["items"]
  ): Record<string, number> => {
    const numDocs = items.length;
    const tfidf: Record<string, number> = {};

    Object.entries(keywords).forEach(([keyword, frequency]) => {
      const tf =
        frequency /
        Object.values(keywords).reduce((sum, freq) => sum + freq, 0);
      const docsWithKeyword = items.filter((item) =>
        (item.snippet.title + item.snippet.description)
          .toLowerCase()
          .includes(keyword)
      ).length;
      const idf = Math.log(numDocs / (docsWithKeyword + 1));
      tfidf[keyword] = tf * idf;
    });

    return tfidf;
  };

  const calculateKeywordScore = (
    keyword: string,
    frequency: number,
    mainKeyword: string,
    items: ApiResponse["items"],
    tfidfScore: number
  ): number => {
    let score = tfidfScore * 100; // Base score on TF-IDF

    // Boost score for keywords containing the main keyword
    if (keyword.includes(mainKeyword)) {
      score *= 1.5;
    }

    // Consider video performance (views and likes)
    const totalViews = items.reduce(
      (sum, item) => sum + parseInt(item.statistics?.viewCount || "0"),
      0
    );
    const totalLikes = items.reduce(
      (sum, item) => sum + parseInt(item.statistics?.likeCount || "0"),
      0
    );
    const avgViews = totalViews / items.length;
    const avgLikes = totalLikes / items.length;

    const keywordVideos = items.filter((item) =>
      (item.snippet.title + item.snippet.description)
        .toLowerCase()
        .includes(keyword)
    );
    const keywordViews = keywordVideos.reduce(
      (sum, item) => sum + parseInt(item.statistics?.viewCount || "0"),
      0
    );
    const keywordLikes = keywordVideos.reduce(
      (sum, item) => sum + parseInt(item.statistics?.likeCount || "0"),
      0
    );

    if (keywordVideos.length > 0) {
      const viewScore = keywordViews / keywordVideos.length / avgViews;
      const likeScore = keywordLikes / keywordVideos.length / avgLikes;
      score *= (viewScore + likeScore) / 2;
    }

    return score;
  };

  const calculateRelevance = (keyword: string, mainKeyword: string): number => {
    const keywordSet = new Set(keyword.split(" "));
    const mainKeywordSet = new Set(mainKeyword.split(" "));
    const intersection = new Set(
      // @ts-ignore
      [...keywordSet].filter((x) => mainKeywordSet.has(x))
    );
    return intersection.size / Math.max(keywordSet.size, mainKeywordSet.size);
  };

  const detectLanguage = (text: string): string => {
    try {
      const detections = detectAll(text);
      // @ts-ignore
      return detections[0][0]; // Return the most probable language
    } catch (error) {
      console.error("Language detection failed:", error);
      return "unknown";
    }
  };

  // Common words set (expanded and typed)

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

  return (
    <Card className="mt-8 w-full max-w-2xl rounded-lg bg-gradient-to-b from-neutral-950-100 to-stone-950">
      <CardHeader>
        Top SEO Keywords for: {keyword} (Language: {targetLanguage})
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center">
        {keywords
          .sort((a, b) => b.score - a.score)
          .map((keywordData, index) => (
            <Button key={index} variant="outline" className="m-1">
              {keywordData.keyword}
            </Button>
          ))}
      </CardContent>
    </Card>
  );
};

export default KeywordResearch;
