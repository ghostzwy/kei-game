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
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram bot configuration missing' },
        { status: 500 }
      );
    }

    // Get latest messages from bot updates
    const messagesUrl = `https://api.telegram.org/bot${botToken}/getUpdates`;
    const messagesResponse = await fetch(messagesUrl);
    const messagesData = await messagesResponse.json();

    if (!messagesData.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Telegram API' },
        { status: 500 }
      );
    }

    // Find recent photos from configured chat/channel
    const photos: any[] = [];
    const seenFileIds = new Set();

    for (const update of messagesData.result.reverse()) {
      const message = update.message || update.channel_post || update.edited_message;
      if (!message || !message.photo || !message.chat) continue;

      const currentChatId = String(message.chat.id);
      if (currentChatId !== chatId) continue;

      const photo = message.photo[message.photo.length - 1];
      if (seenFileIds.has(photo.file_id)) continue;
      
      seenFileIds.add(photo.file_id);
      photos.push({
        fileId: photo.file_id,
        timestamp: new Date((message.date || Date.now() / 1000) * 1000).toISOString()
      });

      // Limit to last 10 photos
      if (photos.length >= 10) break;
    }

    if (photos.length === 0) {
      return NextResponse.json({ photos: [], message: 'No photos found' });
    }

    // Get download URLs for all found photos
    const photoPromises = photos.map(async (p) => {
      try {
        const fileInfoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${p.fileId}`;
        const fileInfoRes = await fetch(fileInfoUrl);
        const fileInfo = await fileInfoRes.json();
        
        if (fileInfo.ok) {
          return {
            ...p,
            imageUrl: `https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`
          };
        }
        return null;
      } catch {
        return null;
      }
    });

    const enrichedPhotos = (await Promise.all(photoPromises)).filter(p => p !== null);

    return NextResponse.json({
      photos: enrichedPhotos,
      count: enrichedPhotos.length,
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
