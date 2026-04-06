const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") {
          return { statusCode: 200, headers, body: "" };
    }

    const store = getStore("journals");
    const params = event.queryStringParameters || {};
    const key = params.key;

    if (!key) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: "key required" }) };
    }

    try {
          if (event.httpMethod === "GET") {
                  const val = await store.get(key);
                  return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({ value: val || "[]" })
                  };
          }

      if (event.httpMethod === "POST") {
              const body = JSON.parse(event.body || "{}");
              await store.set(key, body.value || "[]");
              return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ ok: true })
              };
      }

      return { statusCode: 405, headers, body: JSON.stringify({ error: "method not allowed" }) };

    } catch (err) {
          return {
                  statusCode: 500,
                  headers,
                  body: JSON.stringify({ error: err.message })
          };
    }
};
