import { io } from 'socket.io-client';

const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encodeLength(length) {
  const bytes = [];
  do {
    let digit = length % 128;
    length = Math.floor(length / 128);
    if (length > 0) digit |= 0x80;
    bytes.push(digit);
  } while (length > 0);
  return bytes;
}

function mqttString(value) {
  const data = encoder.encode(value);
  return [data.length >> 8, data.length & 255, ...data];
}

function mqttPacket(header, payload) {
  return new Uint8Array([header, ...encodeLength(payload.length), ...payload]);
}

function decodeLength(bytes, offset) {
  let multiplier = 1;
  let value = 0;
  let cursor = offset;
  let digit;
  do {
    if (cursor >= bytes.length) return null;
    digit = bytes[cursor++];
    value += (digit & 127) * multiplier;
    multiplier *= 128;
  } while ((digit & 128) !== 0);
  return { value, cursor };
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createMqttTransport(roomCode, playerId, onMessage, onStatus) {
  const clientId = `pantheon-${makeId().replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;
  const topic = `monad-pantheon/room/${roomCode}`;
  const socket = new WebSocket(MQTT_URL, 'mqtt');
  socket.binaryType = 'arraybuffer';
  let buffer = new Uint8Array();
  let packetId = 1;
  let closed = false;
  let mqttConnected = false;
  const pendingPackets = [];
  let handleMessage = onMessage;

  const sendRaw = (packet) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    if (!mqttConnected && packet[0] !== 0x10) {
      pendingPackets.push(packet);
      return;
    }
    socket.send(packet);
  };
  const sendSubscribe = () => {
    const id = packetId++;
    sendRaw(mqttPacket(0x82, [id >> 8, id & 255, ...mqttString(topic), 0]));
  };
  const handleData = (event) => {
    const incoming = new Uint8Array(event.data);
    const joined = new Uint8Array(buffer.length + incoming.length);
    joined.set(buffer);
    joined.set(incoming, buffer.length);
    buffer = joined;

    while (buffer.length >= 2) {
      const length = decodeLength(buffer, 1);
      if (!length || buffer.length < length.cursor + length.value) return;
      const packetType = buffer[0] >> 4;
      const body = buffer.slice(length.cursor, length.cursor + length.value);
      buffer = buffer.slice(length.cursor + length.value);

      if (packetType === 2) {
        if (body[1] !== 0) {
          onStatus('error', 'The public MQTT broker rejected the room connection.');
          socket.close();
          return;
        }
        mqttConnected = true;
        sendSubscribe();
        pendingPackets.splice(0).forEach((packet) => socket.send(packet));
        onStatus('connected', 'Connected through the public MQTT relay.');
      } else if (packetType === 3 && body.length >= 2) {
        const topicLength = (body[0] << 8) | body[1];
        const payloadOffset = 2 + topicLength;
        try {
          const message = JSON.parse(decoder.decode(body.slice(payloadOffset)));
          handleMessage(message);
        } catch {
          onStatus('error', 'Received an invalid room message; it was ignored.');
        }
      }
    }
  };

  socket.addEventListener('open', () => {
    const payload = [
      ...mqttString('MQTT'), 4, 2, 0, 30,
      ...mqttString(clientId),
    ];
    sendRaw(mqttPacket(0x10, payload));
  });
  socket.addEventListener('message', handleData);
  socket.addEventListener('error', () => {
    if (!closed) onStatus('error', 'Could not connect to the public MQTT relay. Try the Socket.io server or reconnect.');
  });
  socket.addEventListener('close', () => {
    if (!closed) onStatus('disconnected', 'Room connection closed.');
  });

  const pingTimer = window.setInterval(() => sendRaw(new Uint8Array([0xc0, 0])), 20000);
  return {
    id: playerId,
    send(type, payload) {
      const message = encoder.encode(JSON.stringify({
        type,
        senderId: this.id,
        sentAt: Date.now(),
        payload,
      }));
      sendRaw(mqttPacket(0x30, [...mqttString(topic), ...message]));
    },
    setMessageHandler(handler) {
      handleMessage = handler;
    },
    close() {
      closed = true;
      window.clearInterval(pingTimer);
      if (socket.readyState === WebSocket.OPEN) sendRaw(new Uint8Array([0xe0, 0]));
      socket.close();
    },
  };
}

function createSocketTransport(roomCode, serverUrl, playerId, onMessage, onStatus) {
  const socket = io(serverUrl, { transports: ['websocket', 'polling'], reconnection: true });
  let handleMessage = onMessage;
  socket.on('connect', () => {
    socket.emit('joinRoom', { roomCode });
    onStatus('connected', 'Connected to your Socket.io room.');
  });
  socket.on('disconnect', () => onStatus('disconnected', 'Socket.io connection lost; reconnecting...'));
  socket.on('connect_error', (error) =>
    onStatus('error', `Socket.io connection failed: ${error.message}`)
  );
  socket.on('roomError', (error) => onStatus('error', error?.message || 'Socket.io room error.'));
  socket.on('roomMessage', (message) => handleMessage(message));
  return {
    id: playerId,
    send(type, payload) {
      socket.emit('roomMessage', {
        roomCode,
        message: { type, senderId: this.id, sentAt: Date.now(), payload },
      });
    },
    setMessageHandler(handler) {
      handleMessage = handler;
    },
    close() {
      socket.disconnect();
    },
  };
}

export function createRoomTransport({ roomCode, transport = 'mqtt', serverUrl, playerId, onMessage, onStatus }) {
  if (!/^[A-Z0-9-]{3,24}$/.test(roomCode)) {
    throw new Error('Room codes must be 3–24 characters using letters, numbers, and hyphens.');
  }
  if (transport === 'socket') {
    if (!serverUrl) throw new Error('Enter the Socket.io server URL.');
    return createSocketTransport(roomCode, serverUrl, playerId || makeId(), onMessage, onStatus);
  }
  if (typeof WebSocket === 'undefined') {
    throw new Error('This browser does not support WebSocket room connections.');
  }
  return createMqttTransport(roomCode, playerId || makeId(), onMessage, onStatus);
}

export { makeId };
