# ProAgent Local

ProAgent Local is a prototype storefront and agent-builder interface for a governed, local-first AI agent product.

## What it does now

- Shows a product storefront for a local AI agent builder
- Provides an interactive persona-based agent builder
- Lets a user define agent name, persona, mission, autonomy level, local memory, and permission policy
- Exports the configured agent profile as a JSON file
- Presents product pricing, operational features, and execution roadmap

## Run locally

From the repository root:

```bash
cd proagent-local
npm install
npm run dev
```

Then open the local URL shown in Terminal, usually:

```text
http://localhost:5173/
```

If port 5173 is already being used, Vite may use 5174 or another nearby port.

## Recommended next build steps

1. Add Ollama integration so the exported agent profile can generate starter workflows locally.
2. Add local file upload / local document analysis.
3. Add a workflow template library.
4. Add trusted-zone permissions and an action audit log.
5. Package as a desktop app using Tauri.
6. Add Stripe checkout and license-key validation.

## Product positioning

The safest and strongest positioning is not “an agent that acts without permission.” The stronger version is:

> A proactive local AI agent that can act inside user-defined trusted zones, with clear permission boundaries, audit logs, and a kill switch.

That keeps the product powerful while making it credible, trustworthy, and more commercially viable.
