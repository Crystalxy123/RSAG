/**
 * Cloudflare Worker to securely proxy requests to OpenAI's Chat Completions API.
 * Environment variables required:
 * - OPENAI_API_KEY: Your secret OpenAI API key.
 */

export default {
    async fetch(request, env, ctx) {
      // Only allow POST requests
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
  
      // --- Basic CORS Handling (Optional but recommended) ---
      // Allows requests from any origin. Restrict this in production if needed.
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*', // Or specify your frontend domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
  
      // Handle CORS preflight requests (OPTIONS)
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }
      // --- End CORS Handling ---
  
      try {
        // 1. Get data from the frontend request
        const requestBody = await request.json();
        const userMessage = requestBody.message;
        const language = requestBody.language || 'zh'; // Default to Chinese if not provided
  
        if (!userMessage) {
          return new Response('Missing message in request body', { status: 400, headers: corsHeaders });
        }
  
        // 2. Get OpenAI API Key from environment variables (Secrets)
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
          console.error('OPENAI_API_KEY environment variable not set');
          return new Response('API key not configured on server', { status: 500, headers: corsHeaders });
        }
  
        // 3. Prepare request to OpenAI API
        const openAIApiUrl = 'https://api.gpt.ge/v1/';
        const messages = [
          {
            role: "system",
            content: `You are a helpful assistant for the [课题组名称] research group at Tsinghua University. Please answer questions about the group based on general knowledge or provided context if available. Respond in ${language === 'zh' ? 'Chinese' : 'English'}.`
          },
          {
            role: "user",
            content: userMessage
          }
          // Add RAG context here if implementing RAG
        ];
  
        // 4. Call OpenAI API
        const openAIResponse = await fetch(openAIApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: messages,
            // max_tokens: 150, // Optional: limit response length
            // temperature: 0.7 // Optional: adjust creativity
          })
        });
  
        // 5. Handle OpenAI Response
        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json().catch(() => ({}));
          console.error('OpenAI API Error:', openAIResponse.status, errorData);
          return new Response(`OpenAI API request failed: ${openAIResponse.statusText}`, { status: openAIResponse.status, headers: corsHeaders });
        }
  
        const responseData = await openAIResponse.json();
        const assistantReply = responseData.choices?.[0]?.message?.content?.trim();
  
        if (!assistantReply) {
           console.error('Unexpected OpenAI API response structure:', responseData);
           return new Response('Failed to parse response from OpenAI', { status: 500, headers: corsHeaders });
        }
  
        // 6. Return the assistant's reply back to the frontend
        // Important: Add CORS headers to the actual response as well
        return new Response(assistantReply, {
            headers: {
                ...corsHeaders, // Include CORS headers
                'Content-Type': 'text/plain' // Or application/json if sending structured data
            }
        });
  
      } catch (error) {
        console.error('Worker Error:', error);
        // Add CORS headers to error responses too
        return new Response(`Internal Server Error: ${error.message}`, { status: 500, headers: corsHeaders });
      }
    },
  };
  