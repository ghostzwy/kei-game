import { onValue, push, ref, set } from 'firebase/database';
import { database, FIREBASE_PATHS } from '@/lib/firebase';
import { Target, CommandAction } from '@/types/target';

export function subscribeToTargets(callback: (targets: Target[]) => void) {
  const activeTargetsRef = ref(database, FIREBASE_PATHS.ACTIVE_TARGETS);

  const unsubscribeActive = onValue(activeTargetsRef, (snapshot) => {
    const data = snapshot.val() ?? {};
    const targetArray: Target[] = Object.entries(data).map(([id, activeData]: any) => ({
      id,
      deviceInfo: {
        model: activeData.model,
        os: activeData.android_version || activeData.os,
        serial: activeData.serial,
        ...activeData.deviceInfo,
      },
      ip: activeData.ip_address || activeData.ip || undefined,
      status:
        typeof activeData.status === 'string'
          ? activeData.status.toUpperCase()
          : activeData.online
          ? 'ONLINE'
          : 'OFFLINE',
      battery: typeof activeData.battery === 'number' ? activeData.battery : undefined,
      lastSeen: activeData.last_ping ?? activeData.lastSeen,
      last_ping: activeData.last_ping,
      ...activeData,
    }));

    callback(targetArray);
  });

  return () => unsubscribeActive();
}

export async function sendCommand(deviceId: string, action: CommandAction) {
  const commandsRef = ref(database, `${FIREBASE_PATHS.COMMANDS}/${deviceId}`);
  const newCommandRef = push(commandsRef);

  await set(newCommandRef, {
    action,
    timestamp: Date.now(),
    status: 'pending',
  });

  return {
    commandId: newCommandRef.key,
    deviceId,
    action,
  };
}
