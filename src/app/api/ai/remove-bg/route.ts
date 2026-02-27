import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const imageUrl = formData.get('url') as string;

    if (!imageFile && !imageUrl) {
      return NextResponse.json({ error: 'image or url is required' }, { status: 400 });
    }

    const removeBgKey = process.env.REMOVE_BG_API_KEY;
    if (!removeBgKey) {
      return NextResponse.json(
        { error: 'Background removal not configured. Add REMOVE_BG_API_KEY.' },
        { status: 503 }
      );
    }

    // Call remove.bg API
    const bgFormData = new FormData();
    if (imageFile) {
      bgFormData.append('image_file', imageFile);
    } else {
      bgFormData.append('image_url', imageUrl);
    }
    bgFormData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': removeBgKey,
      },
      body: bgFormData,
    });

    if (!response.ok) {
      throw new Error('remove.bg API call failed');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${base64}`,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Background removal failed' }, { status: 500 });
  }
}
