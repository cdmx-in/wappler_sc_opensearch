## 🚀 Wappler Server Connect — OpenSearch Logs

Send and fetch logs from an OpenSearch cluster using Wappler Server Connect actions.

This module provides two Server Connect actions: a logger (to store events) and a query (to search them).

---

## 🔑 Required environment variables

- `OPS_USERNAME` — OpenSearch username
- `OPS_PASSWORD` — OpenSearch password
- `OPS_URL` — OpenSearch URL (include protocol, e.g. https://opensearch.example.com)

> Tip: For production, store these in your deployment environment or Wappler's secure variables.

---

## 🧰 Wappler Server Connect actions

1) 📥 Action: `Opensearch Logger`

Purpose: index a log/event into OpenSearch.

Fields:
- **Name** — Action display name
- **Timestamp** — Event timestamp (e.g. `NOW_UTC`)
- **Log Level** — e.g. `info`, `warn`, `error`
- **Log ID** — ID to group related events
- **Action User ID** — User id from your auth provider
- **Action User Email** — User email
- **Event Type** — Event or action name
- **Message** — The main log message
- **Domain** — Domain name (e.g. `site.example.com`)
- **Service** — Service name (e.g. `payments`)
- **Is Note** — Optional boolean to mark the entry as a note
- **Message Context** — Optional JSON object with extra details

OpenSearch options (logger):
- **Index** — Target index (e.g. `nodejs-logs-*`)
- **Refresh** — Enable to make the document searchable immediately (may impact performance)
- **SSL/TLS Insecure** — Optional boolean; skip TLS verification (use only for testing)
- **Output** — Optional; include action response in the output


2) 🔎 Action: `Opensearch Query`

Purpose: run searches against your OpenSearch indices.

Fields:
- **Name** — Action display name
- **Search Value** — Search string or query fragment
- **Search Field** — Field to search in
- **Output Fields** — Which fields to return
- **Sort Field** — Field to sort by (default: descending behavior)
- **Sort Order** — `desc` or `asc`
- **Timestamp Field** — Timestamp field name (e.g. `@timestamp`, `ts`)
- **From Date** / **To Date** — Optional time range (e.g. `NOW_UTC`)
- **Is Note** — Optional boolean

OpenSearch options (query):
- **Index** — Index name (e.g. `nodejs-logs-*`)
- **SSL/TLS Insecure** — Optional boolean; skip TLS verification
- **Output** — Optional; include action response in the output

---

## ⚙️ Example payloads

Logger example (body fields):

```json
{
  "timestamp": "NOW_UTC",
  "level": "error",
  "log_id": "order-123",
  "user_id": "42",
  "user_email": "user@example.com",
  "event": "payment_failed",
  "message": "Payment failed due to insufficient funds",
  "domain": "shop.example.com",
  "service": "payments",
  "is_note": false,
  "context": { "order_id": 123, "attempt": 1 }
}
```

Query example (simple search):

```json
{
  "search_value": "payment_failed",
  "search_field": "event",
  "output_fields": ["@timestamp","level","message","context"],
  "sort_field": "@timestamp",
  "sort_order": "desc",
  "from_date": "NOW_UTC-7d",
  "to_date": "NOW_UTC"
}
```

---

## ⚠️ Notes & best practices

- Use a dedicated index (or index pattern) per environment or service for easier retention and management.
- Avoid enabling `Refresh` in high-volume logging flows — it increases memory and IO.
- Only set `SSL/TLS Insecure` in development or when you control the network.

---

## 📄 License & credits

This repository provides helper actions for Wappler Server Connect to interact with OpenSearch.

