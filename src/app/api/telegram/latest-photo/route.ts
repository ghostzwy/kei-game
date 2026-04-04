/**
 * Telegram Bot Latest Photo API
 * Fetch latest camera image from Telegram bot
 * 
 * Environment Variables Required:
 * - TELEGRAM_BOT_TOKEN: Your Telegram bot token
 * - TELEGRAM_CHAT_ID: Target chat/channel ID to fetch photos from
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing deviceId parameter' },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram bot configuration missing' },
        { status: 500 }
      );
    }

    // Get latest messages from chat
    const messagesUrl = `https://api.telegram.org/bot${botToken}/getUpdates`;
    const messagesResponse = await fetch(messagesUrl);
    const messagesData = await messagesResponse.json();

    if (!messagesData.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Telegram API' },
        { status: 500 }
      );
    }

    // Find latest photo from specified chat/channel
    let latestPhotoFileId: string | null = null;
    
    for (const update of messagesData.result.reverse()) {
      const message = update.message || update.channel_post;
      
      if (message && message.photo) {
        // Get highest resolution photo
        const photo = message.photo[message.photo.length - 1];
        latestPhotoFileId = photo.file_id;
        break;
      }
    }

    if (!latestPhotoFileId) {
      return NextResponse.json(
        { 
          imageUrl: null,
          message: 'No photos found in Telegram bot'
        }
      );
    }

    // Get file info
    const fileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${latestPhotoFileId}`;
    const fileResponse = await fetch(fileUrl);
    const fileData = await fileResponse.json();

    if (!fileData.ok) {
      return NextResponse.json(
        { error: 'Failed to get file info from Telegram' },
        { status: 500 }
      );
    }

    // Generate download URL
    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;

    return NextResponse.json({
      imageUrl: downloadUrl,
      fileId: latestPhotoFileId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
