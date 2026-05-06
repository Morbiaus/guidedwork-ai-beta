# ProAgent Local: Builder Field Help Content

## Purpose

This file defines plain-English help content for each section of the Agent Builder. These explanations should be reused in tooltips, expandable help cards, setup screens, onboarding, and documentation.

## Design rule

Each help item should answer three questions:

1. What does this mean?
2. What is an example?
3. Why does it matter?

## Agent Name

**What it means:**
The name you give your agent.

**Example:**
Atlas, JobScout, RiskPartner, HomeOps, or Executive Ally.

**Why it matters:**
A clear name helps the user understand what this agent is for.

**Short tooltip:**
Give your agent a simple name that matches its job.

## Persona

**What it means:**
The role the agent should act like.

**Example:**
Executive Assistant, Job Search Agent, Risk & Compliance Analyst, Research Analyst, or Household Operations Agent.

**Why it matters:**
The persona shapes how the agent thinks, writes, prioritizes, and recommends.

**Short tooltip:**
Choose the role you want this agent to perform.

## Mission Statement

**What it means:**
The agent’s main purpose.

**Example:**
“Review documents, identify control gaps, and draft practical recommendations.”

**Why it matters:**
A clear mission keeps the agent focused and prevents vague outputs.

**Short tooltip:**
Tell the agent what job it is supposed to help you accomplish.

## AI Engine

**What it means:**
The thinking layer your agent uses to read, summarize, draft, and recommend.

**Example:**
Included AI Engine, Private Local AI, or Bring Your Own AI Key.

**Why it matters:**
Without an AI Engine, the app can store templates and settings, but it cannot reason over work.

**Short tooltip:**
This is the AI brain your agent uses. Most users should keep the default Included AI Engine.

## Autonomy Setting

**What it means:**
How much the agent can do inside the app before asking for review.

**Example levels:**

1. Observe only
2. Draft and recommend
3. Run local simulations
4. Use approved local workflows

**Why it matters:**
Autonomy controls how much freedom the agent has. Higher autonomy should still stay inside clear boundaries.

**Short tooltip:**
Choose how much the agent can do inside the app before you review it.

## Action Permission Policy

**What it means:**
The rules that define what the agent can and cannot do.

**Example:**
The agent can draft an email, but the user reviews it before sending.

**Why it matters:**
Permission rules keep the agent useful without making it risky.

**Short tooltip:**
Set the rules for what requires your review.

## Local Memory

**What it means:**
The app remembers your agent settings and work on your device.

**Example:**
If you refresh the page, your saved agent and workflows can still be available.

**Why it matters:**
Users should not have to rebuild the same agent every time.

**Short tooltip:**
Save this agent’s setup on your device.

## Local-First Data Mode

**What it means:**
The app keeps work local by default unless the user chooses another option.

**Example:**
Agent settings and exported packages stay on the user’s device.

**Why it matters:**
Local-first design helps build trust, especially for business and privacy-sensitive users.

**Short tooltip:**
Keep your agent setup and work local by default.

## Generate Workflows

**What it means:**
The app creates repeatable tasks the agent can help perform.

**Example:**
A Risk & Compliance Analyst agent may generate “Control Quality Review” and “Executive Risk Summary.”

**Why it matters:**
Workflows turn the agent from a general assistant into a practical work system.

**Short tooltip:**
Create useful tasks for this agent based on its role and mission.

## Run Simulation

**What it means:**
The app shows what the agent would produce for a selected workflow.

**Example:**
A workflow simulation may draft a risk summary or daily plan.

**Why it matters:**
Simulation lets users preview value before connecting real systems or relying on the agent.

**Short tooltip:**
Preview what this workflow could produce.

## Save Locally

**What it means:**
The app saves the current agent setup in the user’s browser or local app.

**Example:**
The user creates Atlas today and comes back tomorrow without rebuilding it.

**Why it matters:**
Saving makes the product feel persistent and useful.

**Short tooltip:**
Save this setup on your device.

## Export Package

**What it means:**
The app creates a downloadable file containing the agent setup, workflows, safety model, latest simulation, and audit log.

**Example:**
Atlas-agent-package.json

**Why it matters:**
Exporting lets users move, back up, inspect, or share the agent configuration.

**Short tooltip:**
Download this agent’s setup and workflow package.

## Audit Log

**What it means:**
A record of what the agent generated, simulated, saved, or exported.

**Example:**
“Generated five workflows for Atlas at 9:15 AM.”

**Why it matters:**
Audit logs build trust and are especially important for business users.

**Short tooltip:**
See a record of what happened in this agent session.

## Human Review

**What it means:**
The user reviews important outputs before they are used outside the app.

**Example:**
The agent drafts a message, but the user reviews it before sending.

**Why it matters:**
Human review keeps the product safe, credible, and easier to trust.

**Short tooltip:**
You decide before anything is used outside the app.

## Recommended onboarding order

For non-technical users, the builder should guide setup in this order:

1. Name the agent.
2. Choose the persona.
3. Write or select the mission.
4. Choose the AI Engine.
5. Pick the autonomy level.
6. Review permission rules.
7. Generate workflows.
8. Run a simulation.
9. Save locally.
10. Export the package if needed.

## Recommended progressive disclosure

Do not show all explanations at once.

Use:

- short labels in the main form
- short tooltips for quick help
- expandable cards for more detail
- full documentation only for advanced users

## Final recommendation

The builder should feel like guided setup, not software configuration.

Use plain labels, smart defaults, and short explanations that appear only when the user asks for them.
