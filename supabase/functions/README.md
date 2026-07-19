# Secure AI Edge Functions Deployment & Development Guide

This directory houses the secure, backend Supabase Edge Functions responsible for coordinating Orivox presentation outline and slide generations with the Google Gemini API.

---

## 1. Prerequisites

Make sure the [Supabase CLI](https://supabase.com/docs/guides/cli) is installed and authenticated:

```bash
# Verify installation
supabase --version

# Log in to your Supabase account
supabase login
```

---

## 2. Local Development & Testing

You can run the Edge Functions locally using the Supabase CLI:

```bash
# Start local edge functions server
supabase functions serve --env-file ./supabase/.env.local
```

### Setup Local Environment Variables

Create a file at `./supabase/.env.local` containing your API keys:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

### Testing Functions Locally

You can test the endpoints using `curl` or Postman:

```bash
# Test generate-outline locally
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-outline' \
  --header 'Authorization: Bearer YOUR_USER_JWT' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"AI in modern health tech"}'
```

---

## 3. Production Deployment

To deploy the functions to your live Supabase project:

### Step A: Set the Gemini API Key Secret

Set your Gemini API key in the remote Supabase project's vault secrets:

```bash
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key
```

### Step B: Deploy the Edge Functions

Deploy both functions independently to ensure isolated scaling properties:

```bash
# Deploy generate-outline
supabase functions deploy generate-outline --no-verify-jwt

# Deploy generate-slides
supabase functions deploy generate-slides --no-verify-jwt
```

> [!NOTE]
> We handle JWT validation internally inside Deno's handler to throw standard 401 JSON objects rather than raw HTTP errors, which is why we pass `--no-verify-jwt` in the command line but enforce authentication inside the code.

---

## 4. Architecture Diagram

```
 React Frontend
      │
      │ (authenticated via user JWT)
      ▼
 Supabase Edge Functions
   ├── generate-outline  ──► calls Gemini API (gemini-2.5-flash)
   └── generate-slides   ──► calls Gemini API (gemini-2.5-flash)
```
