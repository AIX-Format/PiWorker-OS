import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const response = await fetch('http://127.0.0.1:8080/pi/incomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // The Go engine will handle fetching the incomplete payment from Pi API
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ message: "No incomplete payments found" }, { status: 404 });
      }
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
