import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { SYSTEM_PROMPT } from './systemPrompt'
import { TOOL_DEFINITIONS, executeTool } from './tools'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

let client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(API_KEY)
  }
  return client
}

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export async function chat(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!API_KEY) {
    return '⚠️ مفتاح Gemini غير مضبوط. يرجى التواصل مع الدعم.'
  }

  try {
    const genAI = getClient()

    // Convert tool definitions to Gemini format
    const tools = TOOL_DEFINITIONS.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: Object.fromEntries(
          Object.entries(t.parameters.properties).map(
            ([key, value]: [string, any]) => [
              key,
              {
                type:
                  value.type === 'string'
                    ? SchemaType.STRING
                    : SchemaType.OBJECT,
                description: value.description,
                ...(value.enum ? { enum: value.enum } : {}),
              },
            ]
          )
        ),
        required: t.parameters.required || [],
      },
    }))

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: tools as any }],
    })

    // Convert history to Gemini format
    const geminiHistory = history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }))

    const chatSession = model.startChat({
      history: geminiHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    })

    // Send message
    let result = await chatSession.sendMessage(userMessage)
    let response = result.response

    // Handle function calls (max 5 iterations)
    let iterations = 0

    while (iterations < 5) {
      const functionCalls = response.functionCalls?.()

      if (!functionCalls || functionCalls.length === 0) {
        break
      }

      iterations++

      const toolResults = []

      for (const call of functionCalls) {
        console.log(`[AI Tool] ${call.name}`, call.args)
        const toolResult = await executeTool(call.name, call.args)
        console.log(`[AI Tool Result]`, toolResult)

        toolResults.push({
          functionResponse: {
            name: call.name,
            response: toolResult as any,
          },
        })
      }

      result = await chatSession.sendMessage(toolResults as any)
      response = result.response
    }

    return response.text() || 'لم أفهم سؤالك. جرب صيغة أخرى.'
  } catch (err: any) {
    console.error('[AI Error]', err)
    return `⚠️ حدث خطأ: ${err.message?.slice(0, 100) || 'خطأ غير معروف'}`
  }
}
