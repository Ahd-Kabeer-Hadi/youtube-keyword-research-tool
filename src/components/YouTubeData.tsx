// components/YouTubeData.tsx
"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
  };
}

export default function YouTubeData() {
  const { data: session } = useSession();
  const [youtubeData, setYoutubeData] = useState<YouTubeChannel[] | null>(null);

  useEffect(() => {
    if (session) {
      fetch('/api/youtube')
        .then((response) => response.json())
        .then((data) => setYoutubeData(data.items))
        .catch((error) => console.error('Error fetching YouTube data:', error));
    }
  }, [session]);

  if (!session) {
    return <p>Please sign in to see your YouTube data.</p>;
  }

  if (!youtubeData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Your YouTube Data</h2>
      {youtubeData.map((channel) => (
        <div key={channel.id}>
          <h3>{channel.snippet.title}</h3>
          <p>{channel.snippet.description}</p>
        </div>
      ))}
    </div>
  );
}
