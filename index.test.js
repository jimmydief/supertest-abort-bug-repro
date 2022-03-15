const http = require("http");
const request = require("supertest");

/**
 * Helper to poll until the given assertion becomes true or a timeout occurs.
 */
function poll(expectFn) {
  return new Promise((resolve, reject) => {
    let interval;
    let lastError;

    const timeout = setTimeout(() => {
      // Reuse the last error so that the stack points to the original assertion that failed. Update the message
      // to indicate that it failed after a timeout.
      lastError.message = `Timed out after 2500ms with error:\n\n${lastError.message}`;

      clearInterval(interval);
      reject(lastError);
    }, 2500);

    interval = setInterval(() => {
      try {
        expectFn();

        // If the expect function doesn't throw, it succeeded.
        clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      } catch (error) {
        lastError = error;
      }
    }, 10);
  });
}

it("doesn't work", async () => {
  const responses = [];
  const log = [];

  const mockServer = http.createServer((req, res) => {
    responses.push(res);

    req.on("aborted", () => {
      log.push('req aborted');
    });

    res.on('close', () => {
      log.push(`res close – req writable finished: ${req.writableFinished} – req destroyed: ${req.destroyed}`);
    })
  });

  try {
    // Start the server.
    await new Promise((resolve) => {
      mockServer.listen(undefined, () => {
        resolve(this);
      });
    });

    const req = request(`http://localhost:${mockServer.address().port}`)
      .get("/test")
      .send()
      .end((error, response) => {});

    await poll(() => {
      expect(responses).toHaveLength(1);
    });

    req.abort();

    // This succeeds with 6.1.6. In 6.2.2, the log will be empty.
    // In Node 16.14.0, "req destroyed" is "true".
    await poll(() => {
      expect(log).toEqual(['req aborted', 'res close – req writable finished: undefined – req destroyed: false']);
    });
  } finally {
    responses.forEach((res) => {
      res.end();
    })

    await new Promise((resolve) => {
      mockServer.close((error) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(undefined);
        }
      })
    })
  }
});
