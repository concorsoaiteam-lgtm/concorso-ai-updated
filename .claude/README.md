# .claude/

Questa cartella ospita i **sub-agent** installati per il progetto `concorso-ai`.
Viene letta nativamente da Claude Code e da altri agent-harness compatibili
(Codex CLI, Cursor, OpenCode, Gemini CLI, GitHub Copilot).

## Layout

```
.claude/
├── README.md         ← questo file
├── agents/           ← wshobson/agents (203 agenti, 94 plugin, 175 skill, 109 command)
│                       struttura: plugins/<plugin-name>/{agents,commands,skills}/*
└── sub-agents/       ← lst97/claude-code-sub-agents (33 sub-agent curati)
                        struttura: agents/<category>/<agent>.md
                        categorie: business, data-ai, development, infrastructure,
                                    quality-testing, security, specialization
                                    + agent-organizer.md (root)
```

## Come è stata popolata

Script: [`../move-agents.ps1`](../move-agents.ps1)
Eseguito da PowerShell su Windows. Sposta i contenuti delle due repository
estratte (in `C:\Users\Ruman\concorso-ai\`) dentro `.claude\agents` e
`.claude\sub-agents`, preservando la struttura nested.

## Note per il progetto

- **Stack del progetto**: HTML/CSS/JS vanilla + API Node.js + Supabase + Stripe + Vercel.
- **Sub-agent più rilevanti**: sono in `sub-agents/agents/development/` e
  `sub-agents/agents/data-ai/` (postgres-pro è particolarmente utile,
  dato che Supabase è Postgres).
- I sub-agent di lst97 sono React-oriented; forzare sempre "vanilla JS, no JSX"
  nel prompt quando li si invoca.
