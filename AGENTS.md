# Agent Instructions

## Highest-priority project constraint

Read `MVP_SCOPE.md` before planning or changing this repository. It is the source of truth for scope and acceptance.

This project serves about 20 active FAB DAO members. Optimize for a small, trusted community and the seven acceptance checks in `MVP_SCOPE.md`. Do not design for commercialization, multi-tenancy, large communities, speculative growth, or enterprise infrastructure.

Before implementing a task:

1. State which MVP acceptance check or observed 20-user problem it addresses.
2. Prefer the smallest direct change that solves it.
3. Do not implement frozen items from `MVP_SCOPE.md` without explicit maintainer approval.
4. Stop when the acceptance check is satisfied; do not add adjacent abstractions or features.

Basic secret handling, reviewer-only archive access, safe user-facing errors, and dependency fixes remain required. Do not use the 20-user limit as permission to expose credentials or private source records.
