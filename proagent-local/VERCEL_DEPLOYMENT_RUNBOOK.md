# ProAgent Local: Vercel Deployment Runbook

## Goal

Deploy ProAgent Local so Telisse can test it from a normal web link.

## Repository

GitHub repository:

```text
Morbiaus/guidedwork-ai-beta
```

App folder:

```text
proagent-local
```

## Recommended Vercel setup

When importing the project in Vercel, use these settings:

```text
Framework Preset: Vite
Root Directory: proagent-local
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Alternate setup

A repo-level `vercel.json` has also been added so Vercel can build the app from the `proagent-local` folder:

```json
{
  "buildCommand": "cd proagent-local && npm install && npm run build",
  "outputDirectory": "proagent-local/dist",
  "installCommand": "npm install --prefix proagent-local",
  "framework": "vite"
}
```

If Vercel asks for a Root Directory, prefer:

```text
proagent-local
```

Then keep the simple Vite defaults:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Deployment steps

1. Open Vercel.
2. Select Add New Project.
3. Import GitHub repository:

```text
Morbiaus/guidedwork-ai-beta
```

4. Set Root Directory to:

```text
proagent-local
```

5. Confirm Framework Preset is:

```text
Vite
```

6. Confirm build settings:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

7. Click Deploy.
8. Copy the deployment URL.
9. Send the deployment URL to Telisse with the user test message.

## What to send Telisse

```text
Hey Telisse, I’m testing an early prototype called ProAgent Local.

The idea is that a user can create an AI agent, choose its role, give it a mission, generate workflows, run a safe simulation, save the setup, and export the package.

This is not finished yet. I want your honest feedback on what makes sense, what is confusing, and what needs more work.

Please test it like a normal user and tell me where you get stuck.
```

## What Telisse should test

1. Does she understand what the product does within 30 seconds?
2. Does the AI Engine explanation make sense?
3. Can she create an agent without help?
4. Does the workflow generation feel useful?
5. Does Run Simulation feel valuable?
6. Does Save Locally make sense?
7. Does Export Package make sense?
8. Would she understand why someone would pay for it?

## Troubleshooting

### Vercel cannot find package.json

Set the Root Directory to:

```text
proagent-local
```

### Vercel build fails

Confirm:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Page deploys but looks blank

Check the browser console and confirm the project is using Vite and the `src/main.jsx` entry file.

## Current readiness

Ready for controlled user testing.

Not ready for full public launch until:

- help cards are fully integrated into the UI
- real feedback capture is added
- model connection is implemented
- payment/licensing is wired
- deployment link is verified
