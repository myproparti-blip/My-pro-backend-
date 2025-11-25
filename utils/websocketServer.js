import { WebSocketServer } from 'ws';

let wss = null;
const clients = new Map();

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (userId) {
      clients.set(userId, ws);
      console.log(`✅ WebSocket client connected: User ${userId}`);
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message from client:', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`❌ WebSocket client disconnected: User ${userId}`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('🔌 WebSocket server initialized');
};

export const broadcastToAll = (message) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
};

export const sendToUser = (userId, message) => {
  const client = clients.get(userId);
  if (client && client.readyState === 1) {
    client.send(JSON.stringify(message));
  }
};

export const notifyDataUpdate = (cacheKey, data, userId = null) => {
  const message = {
    type: 'DATA_UPDATE',
    cacheKey,
    data,
    timestamp: Date.now()
  };

  if (userId) {
    sendToUser(userId, message);
  } else {
    broadcastToAll(message);
  }
};

export const notifyCacheInvalidate = (cacheKey, userId = null) => {
  const message = {
    type: 'CACHE_INVALIDATE',
    cacheKey,
    timestamp: Date.now()
  };

  if (userId) {
    sendToUser(userId, message);
  } else {
    broadcastToAll(message);
  }
};

export const notifyFullRefresh = (userId = null) => {
  const message = {
    type: 'FULL_REFRESH',
    timestamp: Date.now()
  };

  if (userId) {
    sendToUser(userId, message);
  } else {
    broadcastToAll(message);
  }
};
