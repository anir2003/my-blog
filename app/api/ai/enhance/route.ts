import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

const openaiKey = process.env.OPENAI_API_KEY;

// Helper function to make OpenAI API calls
async function callOpenAI(text: string, systemPrompt: string) {
  if (!openaiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Error calling OpenAI API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { text, mode } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    let enhancedText;
    
    if (mode === 'grammar') {
      // Grammar check mode
      const systemPrompt = 
        "You are a helpful assistant that corrects grammar in text inside HTML content. Your task is to fix any grammatical errors while preserving ALL HTML tags, attributes, and structure completely intact. The text is passed to you as HTML markup.\n\n" +
        "IMPORTANT RULES:\n" +
        "1. DO NOT modify ANY HTML tags or attributes, including data-* attributes\n" +
        "2. DO NOT remove, add, or change any HTML structure\n" + 
        "3. Only correct grammar and spelling in the visible text content\n" +
        "4. Preserve exact whitespace and formatting\n" +
        "5. Never use em dashes\n" +
        "6. Return the COMPLETE HTML document with your corrections\n" +
        "7. DO NOT add any explanation or comments outside the HTML\n" +
        "8. Keep all images, links, and other HTML elements exactly as they appear";
      
      enhancedText = await callOpenAI(text, systemPrompt);
    } else if (mode === 'enhance') {
      // Enhancement mode with British English
      const systemPrompt = 
        "You are a helpful assistant that enhances text inside HTML content. Your task is to improve the writing quality using British English spelling and grammar, while preserving ALL HTML tags, attributes, and structure completely intact. The text is passed to you as HTML markup.\n\n" +
        "IMPORTANT RULES:\n" +
        "1. DO NOT modify ANY HTML tags or attributes, including data-* attributes\n" +
        "2. DO NOT remove, add, or change any HTML structure\n" + 
        "3. Only enhance the visible text content - make it sound intelligent but not overly complicated\n" +
        "4. Preserve exact whitespace and formatting\n" +
        "5. Never use em dashes\n" +
        "6. Return the COMPLETE HTML document with your enhancements\n" +
        "7. DO NOT add any explanation or comments outside the HTML\n" +
        "8. Keep all images, links, and other HTML elements exactly as they appear";
      
      enhancedText = await callOpenAI(text, systemPrompt);
    } else {
      return NextResponse.json(
        { error: 'Invalid mode. Use "grammar" or "enhance"' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ enhancedText });
  } catch (error) {
    console.error('Error enhancing text:', error);
    return NextResponse.json(
      { error: 'Failed to enhance text: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 