import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  try {
    // Fetch recent messages to extract frequent senders
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=in:inbox',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Gmail messages');
    }

    const data = await response.json();
    const messageIds = data.messages || [];

    // Fetch details for each message to get sender info
    const senderMap = new Map<string, { name: string; email: string; count: number }>();

    for (const msg of messageIds.slice(0, 50)) {
      try {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (msgResponse.ok) {
          const msgData = await msgResponse.json();
          const fromHeader = msgData.payload?.headers?.find((h: any) => h.name === 'From');
          
          if (fromHeader) {
            const fromValue = fromHeader.value;
            const emailMatch = fromValue.match(/<(.+?)>/);
            const email = emailMatch ? emailMatch[1] : fromValue;
            const nameMatch = fromValue.match(/^(.+?)\s*</);
            const name = nameMatch ? nameMatch[1].replace(/"/g, '') : email;

            if (senderMap.has(email)) {
              senderMap.get(email)!.count++;
            } else {
              senderMap.set(email, { name, email, count: 1 });
            }
          }
        }
      } catch (error) {
        // Skip failed message fetches
        continue;
      }
    }

    // Convert to array and sort by frequency
    const senders = Array.from(senderMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(sender => ({
        id: sender.email,
        name: sender.name,
        email: sender.email,
        tags: ['gmail-sender', `${sender.count}-messages`],
      }));

    return res.status(200).json({ senders });
  } catch (error) {
    console.error('Gmail API error:', error);
    return res.status(500).json({ error: 'Failed to fetch Gmail senders' });
  }
}
