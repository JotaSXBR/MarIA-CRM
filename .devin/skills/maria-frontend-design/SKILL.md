---
name: maria-frontend-design
description: Design direction for MarIA CRM frontend work — palette, typography, layout and pt-BR copy that avoid templated defaults. Applies when creating or reshaping UI views in apps/web.
---

# MarIA CRM frontend design

Adapted from `frontend-design` in anthropics/skills (Apache-2.0 — see ./LICENSE.txt).
AGENTS.md and the accepted ADRs remain normative; this skill carries no roadmap —
it decides what a view should look and read like, not what gets built next.

Approach each view as the design lead at a studio known for giving every client a
distinct visual identity. Make deliberate, opinionated choices about palette,
typography and layout that are specific to this product — and keep them consistent
across views, because this is one product, not a collection of pages.

## MarIA context — this is the brief

- **Product:** multi-tenant CRM where human operators (and later AI agents) share
  an omnichannel inbox, contacts, companies, pipelines and tasks. The primary user
  is an operator who lives in the tool all day — density, clarity and speed beat
  marketing-page flourish.
- **Information architecture (approved research direction):** Twenty for the app
  shell (workspace switcher top, object nav middle, settings + user menu bottom)
  and Chatwoot for the inbox-first, nested-settings structure. These are UX
  references only — never copy code or assets.
- **Mechanics:** components are vendored shadcn/ui primitives — `maria-shadcn`
  governs _how_ to build; this skill governs _what_ to build and how it feels.
- **Language:** UI copy is pt-BR, sentence case, plain verbs. Domain vocabulary is
  fixed: Conversa, Contato, Empresa, Negócio, Pipeline, Etapa, Caixa de entrada,
  Canal. Reuse it verbatim — synonyms confuse operators.
- **Floor, always:** responsive down to small laptop widths, visible keyboard
  focus, reduced motion respected, accessible contrast. UI visibility is never
  authorization (ADR 0011).

## Design principles

The inbox is the hero surface — it is what operators see most and what makes this
CRM different. Spend distinctiveness there (conversation list, thread, composer,
presence states) and keep CRUD surfaces quiet and disciplined.

Typography carries the personality: one family is enough; if two, make them clearly
distinct. Set a clear type scale with intentional weights and spacing. Default to
line lengths under 80 characters. Avoid the commonest generated-page tells:
accenting a single word in a headline, all-caps labels, decorative eyebrow labels.

Structural devices (borders, dividers, numbering, badges) must encode information,
not decorate. A numbered marker only belongs on an actual sequence. Status has a
single visual language — message delivery states, deal stages and failed sends
reuse the same badge/palette semantics.

Use non-user-triggered motion sparingly, only to draw attention. Motion that
answers a person's action (opening, expanding, confirming, a new inbound message)
is welcome when it shows what changed; ambient animation is not.

## Process: plan, review against the brief, build, critique

AI-generated design clusters around defaults: cream background + serif display +
terracotta accent; near-black + acid accent; SaaS-card kits where everything is an
identical rounded card with the same grey shadow; tracked-out ALL-CAPS eyebrows;
'→' appended to every link. These are legitimate for some briefs but are defaults,
not choices — and none of them is right for an operator-dense pt-BR CRM by
accident. Where the operator's direction pins an axis, follow it exactly; where an
axis is free, do not spend it on a default.

Work in two passes:

1. **Design plan** — a compact token proposal: 4–6 named palette values, type
   roles, a one-sentence layout concept (ASCII wireframe welcome), and the one
   memorable element for this view.
2. **Review the plan** — if any part reads like the generic default rather than a
   choice made for this product, revise it and say what changed. Only then build.

When writing code, mind CSS selector specificity — generated CSS classes that
cancel each other out (`.section` vs `.cta` type/element collisions) are a common
failure, especially for padding between sections.

## Restraint and self-critique

Spend boldness in one place per view; keep everything around it quiet. Cut any
decoration that does not serve the brief. Take screenshots (browser preview) to
critique your own work as you build — a picture is worth 1000 tokens. Chanel's
advice applies: before shipping, look in the mirror and remove one accessory.

## Writing in design (pt-BR)

Words exist to make the product easier to understand and use. Bring the same
intentionality to copy as to spacing and color.

- Write from the operator's perspective; name things by what they understand, not
  by how the system is built ("reconectar o WhatsApp", not "reprovision channel
  instance").
- Active voice. A CTA says exactly what happens: "Salvar alterações", not
  "Enviar". An action keeps one name through the flow — the button "Publicar"
  produces the toast "Publicado".
- Errors don't apologize and are never vague. Empty states are invitations to act
  ("Nenhuma conversa ainda — conecte um canal em Configurações").
- Conversational tone, plain verbs, sentence case, no filler. Each written element
  does exactly one job.
