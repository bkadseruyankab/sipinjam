import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
];

// Max file size: 5MB (before compression)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Max file size after compression: 500KB
const MAX_COMPRESSED_SIZE = 500 * 1024;

// Allowed categories
const ALLOWED_CATEGORIES = ['ttd', 'logo', 'favicon', 'signatures', 'kop', 'aula', 'fasilitas', 'kendaraan'];

// Image types that should be compressed
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Compress image buffer using sharp.
 * Reduces dimensions and quality to save storage space.
 */
async function compressImage(buffer: Buffer, mimeType: string): Promise<{ data: Buffer; mimeType: string }> {
  let image = sharp(buffer);
  
  // Get metadata
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  // Resize if too large (max 1200px on longest side)
  const MAX_DIMENSION = 1200;
  let resized = false;
  if (width && height && (width > MAX_DIMENSION || height > MAX_DIMENSION)) {
    image = image.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    });
    resized = true;
  }

  // Convert to JPEG for better compression (unless it's a GIF or needs transparency)
  const outputMime = mimeType === 'image/png' ? 'image/jpeg' : mimeType;
  
  let compressed: Buffer;
  let quality = 75;

  // Progressive compression to hit target size
  do {
    if (outputMime === 'image/jpeg' || outputMime === 'image/jpg') {
      compressed = await image.jpeg({ quality }).toBuffer();
    } else if (outputMime === 'image/webp') {
      compressed = await image.webp({ quality }).toBuffer();
    } else if (outputMime === 'image/png') {
      compressed = await image.png({ quality }).toBuffer();
    } else {
      // Fallback to JPEG
      compressed = await image.jpeg({ quality }).toBuffer();
    }
    
    if (compressed.length > MAX_COMPRESSED_SIZE && quality > 20) {
      quality -= 10;
      // Reset the pipeline
      image = sharp(buffer);
      if (resized) {
        image = image.resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
    } else {
      break;
    }
  } while (quality > 20);

  return { data: compressed, mimeType: outputMime };
}

// POST /api/upload - Upload a file with server-side compression
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category tidak ditentukan' }, { status: 400 });
    }

    // Validate category
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Category tidak valid' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    // Validate MIME type - also check by extension if MIME type is empty or unrecognized
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.png';
    const extToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    };
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);
    const isValidExt = Object.keys(extToMime).includes(ext);
    if (!isValidMime && !isValidExt) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Format: JPG, PNG, GIF, WEBP, SVG, ICO' },
        { status: 400 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let finalExt = ext;
    let originalSize = buffer.length;
    let compressedSize = buffer.length;

    // Compress image if it's a compressible type
    if (COMPRESSIBLE_TYPES.includes(file.type) || (isValidExt && !ALLOWED_MIME_TYPES.includes(file.type))) {
      try {
        const result = await compressImage(buffer, file.type || extToMime[ext]);
        buffer = result.data;
        compressedSize = buffer.length;
        
        // Update extension if format changed (e.g., PNG → JPEG)
        if (result.mimeType === 'image/jpeg' && (ext === '.png' || ext === '.webp')) {
          finalExt = '.jpg';
        }
      } catch (compressErr) {
        // If compression fails, use original buffer
        console.warn('Image compression failed, using original:', compressErr);
      }
    }

    const timestamp = Date.now();
    const uniqueId = randomUUID().substring(0, 8);
    const filename = `${category}_${timestamp}_${uniqueId}${finalExt}`;

    // Ensure category directory exists
    const categoryDir = join(UPLOAD_DIR, category);
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }

    // Write the file
    const filePath = join(categoryDir, filename);
    await writeFile(filePath, buffer);

    // Return the URL that matches the file serving route
    const url = `/api/file/${category}/${filename}`;
    const savedPercent = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

    return NextResponse.json({ 
      url, 
      filename,
      originalSize,
      compressedSize,
      savedPercent: Math.max(0, savedPercent),
      wasCompressed: compressedSize < originalSize,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupload file' },
      { status: 500 }
    );
  }
}
