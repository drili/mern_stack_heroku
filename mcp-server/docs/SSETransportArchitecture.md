# SSE MCP Server Boilerplate (Node.js)

This note shows how to stand up an MCP server that browsers can reach over Server-Sent Events (SSE) using `@modelcontextprotocol/sdk`'s `SSEServerTransport`. It also includes a middleware pattern that extracts a `tenantId` from a JWT and makes it available to tools via the MCP request context.

## Quick setup
- Requires Node 18+ and Express 4 (already in this repo).  
- Add deps: `npm install @modelcontextprotocol/sdk@1.25.3 jsonwebtoken`  
- Use ESM (`"type": "module"`) or swap the `import` lines for `require` if you stay on CJS.

## Request flow (what the transport expects)
1. Client opens `GET /mcp` -> server returns an SSE stream and emits a `sessionId`.
2. Client POSTs JSON-RPC messages to `/messages?sessionId=<id>`.
3. `SSEServerTransport` routes those POST bodies into MCP; responses flow back on the SSE stream.

## Boilerplate server
```js
// sse-mcp-server.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';

const app = createMcpExpressApp();          // wraps an Express instance with sensible defaults
app.use(express.json());                    // ensure POST bodies are parsed

// Map sessionId -> SSE transport instance
const transports = new Map();

// JWT middleware: pull tenantId from Authorization: Bearer <jwt>
const attachTenantFromJwt = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.slice('Bearer '.length);
  try {
    // Replace process.env.JWT_SECRET with your symmetric secret or a public key
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = {
      token,
      clientId: payload.sub || 'anonymous',
      scopes: payload.scp || payload.scopes || [],
      extra: { tenantId: payload.tenantId || payload.tid }
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
};

// MCP server definition
const server = new McpServer(
  { name: 'taskalloc8or-sse', version: '0.1.0' },
  { capabilities: { logging: {} } }
);

// Example tool: echoes the tenant the middleware attached
server.registerTool(
  'whoami',
  { description: 'Return the caller tenant and client id' },
  async (_args, extra) => {
    const tenantId = extra.authInfo?.extra?.tenantId ?? 'unknown-tenant';
    const clientId = extra.authInfo?.clientId ?? 'unknown-client';
    return {
      content: [{ type: 'text', text: `tenant=${tenantId}, client=${clientId}` }]
    };
  }
);

// SSE stream endpoint (GET)
app.get('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports.set(transport.sessionId, transport);

  // Clean up when the client disconnects
  transport.onclose = () => transports.delete(transport.sessionId);

  await server.connect(transport);
});

// JSON-RPC endpoint (POST)
app.post('/messages', attachTenantFromJwt, async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(400).json({ error: 'missing sessionId' });

  const transport = transports.get(sessionId);
  if (!transport) return res.status(404).json({ error: 'session not found' });

  // req.auth (set by middleware) is passed through to MCP as authInfo
  await transport.handlePostMessage(req, res, req.body);
});

app.listen(3000, () => console.log('MCP SSE server listening on :3000'));
```

### How tenantId reaches a tool
- `attachTenantFromJwt` decodes the JWT and stores `tenantId` on `req.auth.extra.tenantId`.
- `handlePostMessage` copies `req.auth` into `extra.authInfo` that tool handlers receive.
- Inside any tool handler, read `extra.authInfo?.extra?.tenantId` and apply per-tenant logic (DB scoping, rate limits, etc.).

### Notes & hardening
- `SSEServerTransport` is still supported but marked deprecated in favor of Streamable HTTP; keep SSE while web clients need `EventSource`.
- Add CORS/Origin/Host validation as required (e.g., `@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js`).
- Rotate `JWT_SECRET` and validate `aud/iss` claims in production.
