# Week 1 — Toy Key-Value Store

A four-stage experiment in storage internals. Companion to DDIA Chapter 1
(conceptual) and a preview of Chapter 3 (storage engines).

## Stages

1. **Naive append-only store** — writes append, reads scan the whole file.
2. **Benchmark** — measure how reads degrade as the file grows.
3. **Hash index** — in-memory map of key → file offset, reads become O(1).
4. **Restart bug** — kill the process, see the index vanish, feel why
   real databases persist their indexes.

## Numbers
*(filled in after running stage 2 and stage 3)*

| Stage | p50 read | p99 read |
|-------|----------|----------|
| Stage 2 (no index) | — | — |
| Stage 3 (hash index) | — | — |

## What I learned
*(filled in at the end of the week)*

