# ProAgent Local: Business User AI Engine Guide

## Direct answer

Yes, the customer needs an AI engine somewhere. The agent needs a reasoning layer that can read, summarize, draft, recommend, and generate workflow outputs.

The business user should not have to think about this as an LLM, model endpoint, API key, token limit, or local runtime. In the product, call it the **AI Engine** or **Thinking Engine**.

## Recommended buyer experience

The best default product should work immediately after purchase.

Recommended default:

> ProAgent Local includes a managed AI Engine so business users can create and run agents without technical setup.

This is the easiest buying path for non-technical users.

## Three model options to offer

### 1. Included AI Engine

**Best for:** Most business users.

**Plain-English explanation:**
The app comes with the AI capability already included. The user does not need to connect anything.

**Product note:**
This should be the default for paid plans. Include usage limits by tier.

### 2. Private Local AI

**Best for:** Privacy-focused users and technical buyers.

**Plain-English explanation:**
The app can use an AI model running on the customer’s own computer or local server.

**Product note:**
This can be supported through tools like Ollama, but it needs setup guidance and hardware requirements.

### 3. Bring Your Own AI Key

**Best for:** Advanced teams that already use an approved AI provider.

**Plain-English explanation:**
The customer connects their own AI account.

**Product note:**
This lowers your model cost but makes onboarding harder, so it should not be the default.

## Recommended product copy

Use this on the storefront:

> No technical AI setup required. ProAgent Local includes an AI Engine by default, with optional private/local and bring-your-own-key modes for advanced users.

Use this in the builder:

> AI Engine: This is the thinking layer your agent uses to draft, summarize, and recommend. Most users should keep the default Included AI Engine.

Use this in the pricing section:

> Starter and Pro plans include managed AI usage. Private local AI and bring-your-own-key options are available for customers who need more control.

## Help link design

For business users, avoid sending them to long documentation first. Use small expandable help cards next to each confusing field.

Recommended labels:

- What is an AI Engine?
- What is a Persona?
- What is a Mission?
- What is Local Memory?
- What is a Workflow?
- What is an Audit Log?
- What does Human Review mean?

Each help card should use this format:

1. One-sentence plain-English answer.
2. One short example.
3. One sentence explaining why it matters.

## Example help card content

### What is an AI Engine?

The AI Engine is the thinking layer your agent uses to read, summarize, draft, and recommend.

Example: If your agent is a Risk & Compliance Analyst, the AI Engine helps it draft control review questions and summarize risk issues.

Why it matters: Without an AI Engine, the app can store settings and templates, but it cannot reason over work.

### What is a Persona?

A persona tells the agent what role it should act like.

Example: Executive Assistant, Job Search Agent, Risk & Compliance Analyst, or Household Operations Agent.

Why it matters: The persona shapes the agent’s tone, priorities, and output style.

### What is a Mission?

A mission tells the agent what it is trying to help accomplish.

Example: “Review documents, identify control gaps, and draft practical recommendations.”

Why it matters: A clear mission keeps the agent focused.

### What is Local Memory?

Local memory means the app remembers your settings and work on your own device.

Example: If you refresh the page, your saved agent profile can still be there.

Why it matters: Users should not have to rebuild the same agent every time.

### What is a Workflow?

A workflow is a repeatable task the agent can help perform.

Example: “Morning Command Brief” or “Control Quality Review.”

Why it matters: Workflows turn the agent from a chat tool into a practical work system.

### What is an Audit Log?

An audit log records what the agent generated, simulated, saved, or exported.

Example: “Generated five workflows for Atlas at 9:15 AM.”

Why it matters: Users need traceability and confidence, especially in business settings.

### What does Human Review mean?

Human review means the agent can draft or recommend, but the user decides before anything is used outside the app.

Example: The agent can draft an email, but the user reviews it before sending.

Why it matters: This keeps the product useful, safe, and credible.

## Pricing recommendation

For commercial release, use a tiered model:

### Starter

- One agent
- Included AI Engine
- Limited monthly usage
- Basic workflow templates
- Exportable agent package

### Pro

- Multiple agents
- Higher monthly usage
- Local save
- Audit log
- Workflow simulations
- Optional bring-your-own-key

### Team

- Shared templates
- Admin controls
- Exportable audit logs
- Private local AI option
- Priority support

## Best recommendation

Do not make customers bring their own LLM by default.

The default should be:

> Buy the app. Install it. Create an agent. Start using it.

Advanced users can choose private local AI or bring-your-own-key later.
