# Customer-Facing AI Engine Explainer

## Purpose

This guide is written for non-technical business users. The goal is to explain the three AI Engine options clearly enough that a customer can make the right choice without needing to understand LLMs, APIs, tokens, endpoints, or model hosting.

## Main message

Your agent needs an AI Engine. The AI Engine is the thinking layer that helps the agent read, summarize, draft, recommend, and generate work outputs.

Most customers should use the default option: **Included AI Engine**.

## Recommended product wording

Use this short version anywhere space is limited:

> Your agent needs an AI Engine to think, draft, summarize, and recommend. Most users should choose Included AI Engine. Advanced users can choose Private Local AI or Bring Your Own AI Key.

Use this longer version on the purchase page or setup screen:

> ProAgent Local includes an AI Engine by default, so you can create and use agents without technical setup. If your organization needs more privacy or already has an approved AI provider, you can choose Private Local AI or Bring Your Own AI Key.

## The three AI Engine choices

### 1. Included AI Engine

**Plain meaning:**
The app comes with AI already included.

**Best for:**
Most business users, individual professionals, small businesses, and buyers who want the product to work immediately.

**What the user does:**
Nothing technical. They buy the app, create an agent, and start using it.

**Why choose it:**
It is the easiest and fastest path.

**Tradeoff:**
Usage may be limited by plan because the company providing the product pays for AI processing behind the scenes.

**Customer-facing label:**
Recommended for most users.

**Customer-facing sentence:**
Choose this if you want the app to work immediately without connecting anything.

---

### 2. Private Local AI

**Plain meaning:**
The AI runs on the customer’s own computer or local server.

**Best for:**
Privacy-focused users, regulated environments, technical users, and customers who want more control over their data.

**What the user does:**
They install or connect a local AI runtime, such as Ollama or a similar local model tool.

**Why choose it:**
It keeps more processing under the customer’s control.

**Tradeoff:**
It may require a stronger computer, setup steps, and troubleshooting.

**Customer-facing label:**
Best for privacy and control.

**Customer-facing sentence:**
Choose this if you want the AI to run on your own device or local server.

---

### 3. Bring Your Own AI Key

**Plain meaning:**
The customer connects their own AI provider account.

**Best for:**
Advanced users, enterprise teams, and companies that already have an approved AI vendor.

**What the user does:**
They enter an API key or approved connection from their AI provider.

**Why choose it:**
It lets the customer use an AI provider they already trust or already pay for.

**Tradeoff:**
It is more technical and can confuse non-technical users.

**Customer-facing label:**
Best for advanced teams.

**Customer-facing sentence:**
Choose this if your company already has an approved AI provider and wants to use that account.

## Simple comparison table

| Option | Easiest to use | Most private | Best for teams | Requires setup | Recommended default |
|---|---:|---:|---:|---:|---:|
| Included AI Engine | Yes | Medium | Yes | No | Yes |
| Private Local AI | No | Yes | Sometimes | Yes | No |
| Bring Your Own AI Key | Medium | Depends on provider | Yes | Yes | No |

## Decision helper

Use this in the interface:

- **I just want it to work:** Included AI Engine.
- **I care most about local control:** Private Local AI.
- **My company already has an AI provider:** Bring Your Own AI Key.

## Recommended default behavior

The setup screen should default to Included AI Engine.

The user should be able to continue without reading technical details.

Advanced options should be available but not forced.

## Product management recommendation

Use progressive disclosure:

1. Show the simple recommendation first.
2. Show the three choices as cards.
3. Add a small “Learn more” link on each card.
4. Keep deeper technical details in documentation.

## Suggested UI card copy

### Included AI Engine

Recommended for most users.

Works immediately after purchase. No technical setup required.

### Private Local AI

Best for privacy and control.

Runs the AI on your own computer or local server. Requires setup and compatible hardware.

### Bring Your Own AI Key

Best for advanced teams.

Connect your company’s approved AI provider account. Requires an API key or approved connection.

## Terms to avoid for business users

Avoid these terms in the main setup flow:

- LLM
- API endpoint
- token limit
- inference
- model runtime
- embeddings
- context window
- local daemon

Use these terms instead:

- AI Engine
- thinking layer
- usage limit
- private/local mode
- approved AI provider
- local setup
- saved knowledge

## Final recommendation

Make Included AI Engine the default. It removes friction and makes the product feel complete.

Private Local AI and Bring Your Own AI Key should be positioned as advanced configuration options, not the normal buying path.
