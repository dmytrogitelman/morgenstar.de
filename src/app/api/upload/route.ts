import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile, validateImageFile } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!validateImageFile(file)) {
      return NextResponse.json({ 
        error: 'Invalid file type or size. Please upload a JPEG, PNG, or WebP image under 5MB.' 
      }, { status: 400 });
    }

    const filepath = await saveUploadedFile(file, folder);

    return NextResponse.json({ 
      success: true, 
      filepath,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
