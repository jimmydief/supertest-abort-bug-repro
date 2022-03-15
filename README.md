# supertest-abort-bug-repro

Repro of a bug related to aborting requests which popped up in the `supertest` 6.1.6 => 6.2.2 release. `superagent` was upgraded at that time so the root cause may be there.

## Environment

I originally reproduced in Node 14.16.1 but confirmed that the same behavior affects 16.14.0 as well.

```
  System:
    OS: macOS 11.6.4
  Binaries:
    Node: 14.16.1 - /usr/local/bin/node
    npm: 6.14.12 - /usr/local/bin/npm
```

## Steps

1. `npm install`
2. `npm test`

The test should pass with `supertest` 6.1.6. Upon updating `supertest`, the test fails.
