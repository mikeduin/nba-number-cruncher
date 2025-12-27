/**
 * Parse a cURL command to extract URL, headers, and query parameters
 */

interface ParsedCurl {
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  eventId?: string;
  region?: string;
  pxContext?: string;
}

export function parseCurl(curlCommand: string): ParsedCurl {
  // Extract URL
  const urlMatch = curlCommand.match(/curl '([^']+)'/);
  if (!urlMatch) {
    throw new Error('Could not find URL in cURL command');
  }
  
  const fullUrl = urlMatch[1];
  
  // Parse URL and query parameters
  const [baseUrl, queryString] = fullUrl.split('?');
  const queryParams: Record<string, string> = {};
  
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      queryParams[key] = decodeURIComponent(value || '');
    });
  }
  
  // Extract headers
  const headers: Record<string, string> = {};
  const headerMatches = curlCommand.matchAll(/-H '([^:]+):\s*([^']+)'/g);
  
  for (const match of headerMatches) {
    const headerName = match[1].trim();
    const headerValue = match[2].trim();
    headers[headerName] = headerValue;
  }
  
  // Extract important values
  const eventId = queryParams.eventId;
  const region = headers['X-Sportsbook-Region'];
  const pxContext = headers['x-px-context'];
  
  return {
    url: fullUrl,
    headers,
    queryParams,
    eventId,
    region,
    pxContext
  };
}

export function validateParsedCurl(parsed: ParsedCurl): void {
  if (!parsed.eventId) {
    throw new Error('No eventId found in URL');
  }
  
  if (!parsed.pxContext) {
    throw new Error('No x-px-context header found');
  }
  
  if (!parsed.region) {
    console.warn('Warning: No X-Sportsbook-Region header found, defaulting to NJ');
  }
}
