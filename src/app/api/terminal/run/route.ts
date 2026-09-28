import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Map to store running processes by roomId
const runningProcesses = new Map<string, { process: ChildProcess, language: string }>();

// Temporary directory for code execution
const TEMP_DIR = path.join(os.tmpdir(), 'collab-execution');

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get('roomId');
  const filePath = searchParams.get('file');

  if (!roomId || !filePath) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Set up Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Fetch file content from the room
        const fileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${roomId}/file?path=${encodeURIComponent(filePath)}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!fileResponse.ok) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ output: '\x1b[1;31mError: Failed to fetch file content\x1b[0m\n' })}\n\n`));
          controller.enqueue(encoder.encode('event: close\ndata: {}\n\n'));
          controller.close();
          return;
        }

        const { content } = await fileResponse.json();
        
        // Determine language based on file extension
        const extension = path.extname(filePath).toLowerCase();
        let command: string;
        let args: string[];
        let language: string;
        
        // Create a temporary file for execution
        const tempFilePath = path.join(TEMP_DIR, `${roomId}_${path.basename(filePath)}`);
        fs.writeFileSync(tempFilePath, content);
        
        // Set execution command based on file type
        switch (extension) {
          case '.js':
            command = 'node';
            args = [tempFilePath];
            language = 'javascript';
            break;
          case '.ts':
            command = 'npx';
            args = ['ts-node', tempFilePath];
            language = 'typescript';
            break;
          case '.py':
            command = 'python';
            args = [tempFilePath];
            language = 'python';
            break;
          default:
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ output: `\x1b[1;31mError: Unsupported file type: ${extension}\x1b[0m\n` })}\n\n`));
            controller.enqueue(encoder.encode('event: close\ndata: {}\n\n'));
            controller.close();
            return;
        }
        
        // Spawn the process
        const childProcess = spawn(command, args);
        
        // Store the process for potential termination
        runningProcesses.set(roomId, { process: childProcess, language });
        
        // Handle process output
        childProcess.stdout.on('data', (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ output: data.toString() })}\n\n`));
        });
        
        childProcess.stderr.on('data', (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ output: `\x1b[1;31m${data.toString()}\x1b[0m` })}\n\n`));
        });
        
        // Handle process completion
        childProcess.on('close', (code) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ output: `\n\x1b[1;${code === 0 ? '32' : '31'}mProcess exited with code ${code}\x1b[0m\n` })}\n\n`));
          controller.enqueue(encoder.encode('event: close\ndata: {}\n\n'));
          
          // Clean up
          runningProcesses.delete(roomId);
          try {
            fs.unlinkSync(tempFilePath);
          } catch (error) {
            console.error('Error removing temp file:', error);
          }
          
          controller.close();
        });
        
        // Handle process errors
        childProcess.on('error', (error) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ output: `\x1b[1;31mError: ${error.message}\x1b[0m\n` })}\n\n`));
          controller.enqueue(encoder.encode('event: close\ndata: {}\n\n'));
          
          // Clean up
          runningProcesses.delete(roomId);
          try {
            fs.unlinkSync(tempFilePath);
          } catch (error) {
            console.error('Error removing temp file:', error);
          }
          
          controller.close();
        });
      } catch (error) {
        console.error('Error in terminal execution:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ output: `\x1b[1;31mServer error: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m\n` })}\n\n`));
        controller.enqueue(encoder.encode('event: close\ndata: {}\n\n'));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}