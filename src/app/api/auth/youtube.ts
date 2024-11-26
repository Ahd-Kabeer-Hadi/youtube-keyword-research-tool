// pages/api/youtube.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
    headers: {
      'Content-Type': 'application/json',
    //   @ts-ignore
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    return res.status(response.status).json({ message: response.statusText });
  }

  const data = await response.json();
  res.status(200).json(data);
};
