import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ChildProcess } from 'child_process';

// This should be imported from a shared location
// For simplicity, we're declaring it here again
const runningProcesses = new Map<string, { process: ChildProcess, language: string }>();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId parameter' }, { status: 400 });
  }

  // Check if there's a running process for this room
  const processInfo = runningProcesses.get(roomId);
  if (!processInfo) {
    return NextResponse.json({ error: 'No running process found' }, { status: 404 });
  }

  try {
    // Kill the process
    if (processInfo.process && processInfo.process.kill) {
      processInfo.process.kill();
      runningProcesses.delete(roomId);
      return NextResponse.json({ success: true, message: 'Process terminated' });
    } else {
      return NextResponse.json({ error: 'Invalid process object' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error stopping process:', error);
    return NextResponse.json({ 
      error: 'Failed to stop process',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}