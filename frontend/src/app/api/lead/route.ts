import { NextResponse } from 'next/server';

interface LeadPayload {
  fullName?: string;
  workEmail?: string;
  firmName?: string;
  teamSize?: string;
  details?: string;
  intent?: 'demo' | 'contact';
}

export async function POST(request: Request) {
  const payload = (await request.json()) as LeadPayload;

  if (!payload.fullName || !payload.workEmail || !payload.firmName || !payload.teamSize || !payload.details || !payload.intent) {
    return NextResponse.json(
      { message: 'Missing required lead fields.' },
      { status: 400 }
    );
  }

  // Placeholder processing for now. This can be wired to CRM/email automation next.
  console.info('New lead submission', {
    intent: payload.intent,
    fullName: payload.fullName,
    workEmail: payload.workEmail,
    firmName: payload.firmName,
    teamSize: payload.teamSize,
  });

  return NextResponse.json({ message: 'Lead received.' }, { status: 200 });
}
