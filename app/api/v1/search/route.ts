import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // AI-powered search with OpenAI
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an AI search assistant. Provide a helpful summary and suggest relevant URLs for the user\'s query. Respond in JSON format with {summary: string, results: [{title: string, url: string, description: string}]}.'
              },
              {
                role: 'user',
                content: `Search for: ${query}`
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = JSON.parse(data.choices[0].message.content);
          
          return NextResponse.json({
            aiSummary: aiResponse.summary,
            results: aiResponse.results || []
          });
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    // Fallback to mock search results
    const mockResults = [
      {
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        description: `Learn more about ${query} on Wikipedia`
      },
      {
        title: `${query} - Google Search`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        description: `Search for ${query} on Google`
      }
    ];

    return NextResponse.json({
      aiSummary: `Here are some search results for "${query}". You can explore these resources to learn more.`,
      results: mockResults
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}
