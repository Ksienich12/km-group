exports.handler = async (event) => {

  const headers = {

    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Headers": "Content-Type",

    "Content-Type": "application/json"

  };

  if (event.httpMethod === "OPTIONS") {

    return { statusCode: 200, headers, body: "" };

  }

  const params = event.queryStringParameters || {};

  const key = params.key;

  if (!key) {

    return { statusCode: 400, headers, body: JSON.stringify({ error: "key required" }) };

  }

  // Log env vars for debugging

  const siteId = process.env.NETLIFY_SITE_ID;

  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (!siteId || !token) {

    return {

      statusCode: 500,

      headers,

      body: JSON.stringify({

        error: "Missing env vars",

        hasSiteId: !!siteId,

        hasToken: !!token

      })

    };

  }

  const storeName = "journals";

  const blobUrl = `https://api.netlify.com/api/v1/blobs/${siteId}/${storeName}/${encodeURIComponent(key)}`;

  try {

    if (event.httpMethod === "GET") {

      const r = await fetch(blobUrl, {

        headers: { Authorization: `Bearer ${token}` }

      });

      if (r.status === 404 || r.status === 204) {

        return { statusCode: 200, headers, body: JSON.stringify({ value: "[]" }) };

      }

      if (!r.ok) {

        const errText = await r.text();

        return { statusCode: 200, headers, body: JSON.stringify({ value: "[]", apiError: errText, apiStatus: r.status }) };

      }

      const text = await r.text();

      return { statusCode: 200, headers, body: JSON.stringify({ value: text || "[]" }) };

    }

    if (event.httpMethod === "POST") {

      const body = JSON.parse(event.body || "{}");

      const value = body.value || "[]";

      const r = await fetch(blobUrl, {

        method: "PUT",

        headers: {

          Authorization: `Bearer ${token}`,

          "Content-Type": "application/octet-stream"

        },

        body: value

      });

      if (!r.ok) {

        const errText = await r.text();

        return { statusCode: 500, headers, body: JSON.stringify({ error: errText, status: r.status }) };

      }

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "method not allowed" }) };

  } catch (err) {

    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };

  }

};
