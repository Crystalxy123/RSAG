// export async function onRequestPost(context) {
//     try {
//         const { request } = context;
//         const { message, language } = await request.json();
        
//         // 调用 OpenAI API（需要先在 Cloudflare 设置环境变量）
//         const openaiKey = context.env.OPENAI_API_KEY;
//         const model = "gpt-4o";
        
//         const response = await fetch("https://api.gpt.ge/v1/chat/completions", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${openaiKey}`
//             },
//             body: JSON.stringify({
//                 model,
//                 messages: [{
//                     role: "user",
//                     content: `请用${language}回答：${message}（回答需与清华大学课题组网站相关）`
//                 }],
//                 temperature: 0.7
//             })
//         });

//         const data = await response.json();
//         return new Response(data.choices[0].message.content);
        
//     } catch (error) {
//         return new Response(JSON.stringify({
//             error: "服务暂时不可用，请稍后再试"
//         }), { 
//             status: 500,
//             headers: { 'Content-Type': 'application/json' }
//         });
//     }
// }

// src/pages/api/chat.js
import { v4 as uuidv4 } from 'uuid'; // 导入 UUID 生成器

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { message, language } = await request.json();
    const chatLimit = 10; // 设置每个用户的聊天次数限制
    const kv = env.CHAT_COUNT_KV; // 绑定您的 KV 命名空间

    if (!kv) {
      console.error('CHAT_COUNT_KV 环境变量未绑定到 KV 命名空间');
      return new Response('聊天次数限制功能未启用，KV 存储未配置', { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 获取用户的唯一标识符 (可以从 Cookie 中获取，如果不存在则生成并设置)
    let userId = request.headers.get('cookie')?.split('; ').find(cookie => cookie.startsWith('userId='))?.split('=')[1];
    let newUser = false;

    if (!userId) {
      userId = uuidv4();
      newUser = true;
    }

    // 从 KV 获取用户的聊天次数
    const chatCountStr = await kv.get(userId);
    let chatCount = chatCountStr ? parseInt(chatCountStr, 10) : 0;

    // 检查是否超过聊天次数限制
    if (chatCount >= chatLimit) {
      return new Response(JSON.stringify({
        error: `您已达到今天的聊天次数限制 (${chatLimit} 次)。`
      }), {
        status: 429, // Too Many Requests
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 调用 OpenAI API（需要先在 Cloudflare 设置环境变量）
    const openaiKey = env.OPENAI_API_KEY;
    const model = "gpt-4o";

    const response = await fetch("https://api.gpt.ge/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: "user",
          content: `请用${language}回答：${message}（回答需与清华大学课题组网站相关）`
        }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const assistantReply = data.choices[0].message.content;

    // 增加聊天次数并更新 KV
    await kv.put(userId, (chatCount + 1).toString());

    const responseHeaders = new Headers({
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*', // 根据需要配置
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // 如果是新用户，设置 userId Cookie
    if (newUser) {
      responseHeaders.append('Set-Cookie', `userId=${userId}; Path=/; HttpOnly; Secure`); // 建议设置 Secure 属性
    }

    return new Response(assistantReply, { headers: responseHeaders });

  } catch (error) {
    console.error("聊天错误:", error);
    return new Response(JSON.stringify({
      error: "服务暂时不可用，请稍后再试"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}