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
    const { creativeId, config } = body;

    if (!creativeId) {
      return NextResponse.json({ error: 'creativeId is required' }, { status: 400 });
    }

    // Fetch creative from database
    const { data: creative, error } = await supabase
      .from('creatives')
      .select('*')
      .eq('id', creativeId)
      .single();

    if (error || !creative) {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 });
    }

    // Server-side export would happen here
    // For now, return the creative data for client-side rendering
    return NextResponse.json({
      success: true,
      creative,
      config,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
