import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, brand_name, offer_type, market } = body;

    // This endpoint integrates with Claude API for AI copy generation
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return placeholder copy if no API key configured
      return NextResponse.json({
        headlines: [
          `${brand_name || 'Casino'} - Get Your Welcome Bonus!`,
          'Claim Up to €500 + 200 Free Spins',
          'Join Now & Start Winning Today',
        ],
        ctas: ['Claim Now', 'Get Bonus', 'Play Now', 'Join Today'],
        taglines: [
          '18+ | T&Cs Apply | Play Responsibly | BeGambleAware.org',
          'New players only. Min deposit required. Wagering applies.',
        ],
      });
    }

    // Claude API integration
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Generate ad copy for an iGaming/affiliate ad with these details:
Brand: ${brand_name || 'Casino Brand'}
Offer type: ${offer_type || 'welcome bonus'}
Market: ${market || 'generic'}
Additional context: ${prompt || ''}

Return JSON with:
- headlines: array of 3 short punchy headlines (max 60 chars each)
- ctas: array of 4 CTA button texts (max 15 chars each)
- taglines: array of 2 disclaimer/tagline options

Keep headlines exciting but compliant. Include responsible gambling messaging in taglines.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const aiData = await response.json();
    const content = aiData.content[0]?.text || '';

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    throw new Error('Failed to parse AI response');
  } catch (err) {
    return NextResponse.json({ error: 'Copy generation failed' }, { status: 500 });
  }
}
