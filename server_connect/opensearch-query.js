require('dotenv').config();
const { Client } = require('@opensearch-project/opensearch');

const opsUser = process.env.OPS_USERNAME;
const opsPass = process.env.OPS_PASSWORD;
const opsUrl = process.env.OPS_URL;

exports.ops_query = async function (options) {
  const timestampField = this.parse(options.timestampField) || '@timestamp';
  const sortField = this.parse(options.sort_field);
  const sortOrder = this.parse(options.sort_order) || 'desc';
  // Optional key/value and function filters (each is ANDed in when provided)
  const pKey = this.parse(options.p_key);
  const pValue = this.parse(options.p_value);
  const functionFilter = this.parse(options.entry_type);
  const opensearchConfig = {
    node: opsUrl,
    auth: {
      username: opsUser,
      password: opsPass,
    },
    ssl: {
      rejectUnauthorized: options.ssl_check ? true : false,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const opensearchClient = new Client(opensearchConfig);
  const indexName = this.parse(options.index);

  const body = {
    query: {
      bool: {
        must: [
          // Remove the match part if options.field or options.query is missing
          options.field && options.query
            ? {
                match_phrase: {
                  [this.parse(options.field)]: this.parse(options.query),
                },
              }
            : undefined,
          options.fromTimestamp && options.toTimestamp
            ? {
                range: {
                  [timestampField]: {
                    gte: this.parse(options.fromTimestamp),
                    lte: this.parse(options.toTimestamp),
                  },
                },
              }
            : undefined,
            options.is_note ?
            {
              term: {
                is_note: this.parse(options.is_note),
              },
            }
            : undefined,
          // Optional filter on the p_key field, ex: p_key = TRANSACTION
          pKey
            ? {
                match_phrase: {
                  p_key: pKey,
                },
              }
            : undefined,
          // Optional filter on the p_value field, ex: p_value = 34569345
          pValue
            ? {
                match_phrase: {
                  p_value: pValue,
                },
              }
            : undefined,
          // Optional filter on the entry_type field, ex: entry_type = NOTE
          functionFilter
            ? {
                match_phrase: {
                  entry_type: functionFilter,
                },
              }
            : undefined,
        ].filter(Boolean),
      },
    },
    sort: sortField
      ? [{ [sortField]: sortOrder }]
      : undefined,
  };
  
  if (options.output_fields) {
    body._source = this.parse(options.output_fields).split(',');
  }
  try {
    const initialResponse = await opensearchClient.transport.request({
      method: 'POST',
      path: '/_search',
      querystring: {
        scroll: '1m',
        size: 1000,
      },
      body: body,
    });
    let hits = initialResponse.body.hits.hits.map(hit => hit._source);
    let scrollId = initialResponse.body._scroll_id;

    while (hits.length < initialResponse.body.hits.total.value) {
      const scrollResponse = await opensearchClient.transport.request({
        method: 'POST',
        path: '/_search/scroll',
        body: {
          scroll: '1m',
          scroll_id: scrollId,
        },
      });

      hits = hits.concat(scrollResponse.body.hits.hits.map(hit => hit._source));
      scrollId = scrollResponse.body._scroll_id;
    }

    await opensearchClient.transport.request({
      method: 'DELETE',
      path: '/_search/scroll',
      body: { scroll_id: scrollId },
    });

    return hits;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}