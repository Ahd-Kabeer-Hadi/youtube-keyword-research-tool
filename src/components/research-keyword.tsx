import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ApiResponse {
  items: {
    snippet: {
      title: string;
      description: string;
    };
  }[];
}

interface KeywordCount {
  [key: string]: number;
}

interface KeywordResearchProps {
  apiResponse: ApiResponse | null;
  keyword: string
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({ apiResponse, keyword }) => {
  const [keywords, setKeywords] = useState<[string, number][]>([]);

  useEffect(() => {
    if (apiResponse) {
      const extractedKeywords = extractKeywords(apiResponse);
      setKeywords(extractedKeywords);
    }
  }, [apiResponse]);

  const extractKeywords = (response: ApiResponse): [string, number][] => {
    const items = response.items;
    let allText = '';

    items.forEach(item => {
      allText += item.snippet.title + ' ' + item.snippet.description + ' ';
    });

    // Remove special characters and convert to lowercase
    allText = allText.toLowerCase().replace(/[^\w\s]/gi, '');

    // Split into words
    const words = allText.split(/\s+/);

    // List of common stop words to exclude
    const stopWords = new Set([
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 
      'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 
      'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 
      'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 
      'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 
      'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 
      'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 
      'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 
      'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 
      'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 
      'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
    ]);

    // Count word frequency excluding stop words
    const wordCount: KeywordCount = {};
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) { // Ignore short words and stop words
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Sort by frequency
    const sortedKeywords: [string, number][] = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Get top 20 keywords

    return sortedKeywords;
  };

  return (
    <Card className="mt-8 w-full max-w-2xl rounded-lg bg-gradient-to-b from-neutral-950-100 to-stone-950">
      <CardHeader>Top related keywords for :{" "} {keyword} </CardHeader>
      <CardContent className="flex flex-wrap justify-center">
        {keywords.map(([keyword, count], index) => (
          <Button key={index} variant="outline" className="m-1">
            {keyword} ({count})
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default KeywordResearch;
