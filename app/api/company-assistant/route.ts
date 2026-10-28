import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

export async function POST(request: Request) {
  const body = await request.json() as { messages?: UIMessage[] }
  const messages = body.messages ?? []
  const result = streamText({
    model: 'openai/gpt-5-mini',
    system: `You are Company Guide, a concise business explainer. Explain a company's strategy, roles, products, features, operating model, and culture in plain language. Keep answers brief: use a short summary followed by up to three bullets when useful. If the user has not named a company, explain the question in a general way and ask for the company name when needed. Never invent confidential facts, metrics, policies, or roles. Say when information is general rather than company-specific.`,
    messages: await convertToModelMessages(messages),
  })
  return result.toUIMessageStreamResponse()
}
