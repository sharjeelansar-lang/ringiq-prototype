import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt, PromptContext } from '@/lib/vapi-prompt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      practiceDisplayName,
      cpmid,
      mongoOfficeId,
      publicNumber,
      syeLocationId,
      recordingDisclosure,
      allowSameDayBookings,
      vapiVoiceId,
    } = body as PromptContext & { vapiVoiceId?: string };

    if (!practiceDisplayName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'practiceDisplayName is required' },
        { status: 400 },
      );
    }
    if (!cpmid?.trim()) {
      return NextResponse.json(
        { success: false, error: 'cpmid is required' },
        { status: 400 },
      );
    }

    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'VAPI_API_KEY not configured' },
        { status: 500 },
      );
    }

    const ctx: PromptContext = {
      practiceDisplayName: practiceDisplayName.trim(),
      cpmid:               cpmid.trim(),
      mongoOfficeId:       mongoOfficeId   ?? '',
      publicNumber:        publicNumber    ?? '',
      syeLocationId:       syeLocationId   ?? 1,
      recordingDisclosure: recordingDisclosure  ?? true,
      allowSameDayBookings: allowSameDayBookings ?? false,
    };

    const res = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${ctx.practiceDisplayName} — Iris`,
        model: {
          provider: 'openai',
          model: 'gpt-5.1-chat-latest',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(ctx),
            },
          ],
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-3-medical',
          language: 'en',
        },
        voice: {
          provider: 'vapi',
          voiceId: vapiVoiceId ?? 'Savannah',
          version: 2,
        },
        firstMessageMode: 'assistant-speaks-first-with-model-generated-message',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message ?? 'VAPI assistant creation failed');
    }

    return NextResponse.json(
      { success: true, assistant: { id: data.id, name: data.name } },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create VAPI assistant';
    console.error('[POST /api/vapi/assistant]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
