import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const PUBLIC_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// GET /api/file/[category]/[filename] - Serve uploaded files
// Also serves files that were previously stored in public/uploads/ (backward compat)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; filename: string }> }
) {
  try {
    const { category, filename } = await params;

    // Prevent directory traversal attacks
    if (category.includes('..') || filename.includes('..') || category.includes('/') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Try new location first (uploads/category/filename)
    let filePath = join(UPLOAD_DIR, category, filename);

    // If not found in new location, try old location (public/uploads/category/filename) for backward compat
    if (!existsSync(filePath)) {
      filePath = join(PUBLIC_UPLOAD_DIR, category, filename);
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(filePath);
    const fileStat = await stat(filePath);

    // Determine content type
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Return the file with caching headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Last-Modified': fileStat.mtime.toUTCString(),
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}
