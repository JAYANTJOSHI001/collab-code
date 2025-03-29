
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isSameFile(file1: string, file2: string): boolean {
  return file1.toLowerCase() === file2.toLowerCase();
}

// Generate a random username for demo purposes
export function generateUsername(): string {
  const adjectives = ['Busy', 'Creative', 'Dynamic', 'Eager', 'Friendly'];
  const nouns = ['Coder', 'Developer', 'Programmer', 'Engineer', 'Designer'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}`;
}

// Function to generate a unique room ID
export function generateRoomId(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}
