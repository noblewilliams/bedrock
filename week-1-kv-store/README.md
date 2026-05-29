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

_(filled in after running stage 2 and stage 3)_
stage 2
(the loop runs from behind - that's why the bottom has a lower response time)

user1 (db top): { p50: 15.826999999999998, p99: 20.90154100000109 }
user100000 (db bottom): { p50: 3.9161669999994047, p99: 9.36016699999891 }
user999999 (missing from db): { p50: 18.415917000002082, p99: 20.740833000003477 }

stage 3
user1 (db top): { p50: 0.04633300000023155, p99: 0.0656250000001819 }
user100000 (db bottom): { p50: 0.046291999999994005, p99: 0.0626670000001468 }
user999999 (missing from db): { p50: 0.0002500000000509317, p99: 0.0003750000005311449 }

| Stage                | p50 read | p99 read |
| -------------------- | -------- | -------- |
| Stage 2 (no index)   | 15.8     | 20.9     |
| Stage 3 (hash index) | 0.046    | 0.0656   |

## What I learned

_(filled in at the end of the week)_
