# Guidelines & Rules for cts-academy

## Frontend Craftsmanship & UI/UX Standards

Whenever developing, refactoring, or polishing components and pages in `apps/frontend`:

1. **Consult `ui-ux-pro-max`**:
   - Location: `~/.gemini/config/skills/ui-ux-pro-max/`
   - Command: `python3 ~/.gemini/config/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`
   - Enforce WCAG AA/AAA contrast, touch targets ($\ge 44\times 44\text{px}$), visible `:focus-visible` rings, semantic color tokens, and responsive padding.

2. **Consult `taste-skill` / `design-taste-frontend`**:
   - Location: `~/.gemini/config/skills/taste-skill/`
   - Command: `node ~/.gemini/config/skills/taste-skill/scripts/start.mjs deal --page <kind>`
   - Enforce unified sections (avoid disconnected "floating cards in the void"), equal horizontal margins and edges, subtle micro-interactions ($2\text{px}$ lift, $1.02\times$ hover zoom), and modern, non-slop typography and layouts.
