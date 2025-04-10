// function generateRandomId(length = 24) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
//   }
  
//   export async function onRequestPost(context) {
//     try {
//       const { request, env } = context;
//       const { message, language } = await request.json();
//       const chatLimit = 10; // 设置每个用户的每日聊天次数限制
//       const kv = env.CHAT_COUNT_KV; // 绑定您的 KV 命名空间
  
//       if (!kv) {
//         console.error('CHAT_COUNT_KV 环境变量未绑定到 KV 命名空间');
//         return new Response('聊天次数限制功能未启用，KV 存储未配置', { status: 500, headers: { 'Content-Type': 'application/json' } });
//       }
  
//       // 获取用户的唯一标识符
//       let userId = request.headers.get('cookie')?.split('; ').find(cookie => cookie.startsWith('userId='))?.split('=')[1];
//       let newUser = false;
  
//       if (!userId) {
//         userId = generateRandomId();
//         newUser = true;
//       }
  
//       const currentDate = new Date().toISOString().slice(0, 10); // 获取当前日期 (YYYY-MM-DD)
//       const chatCountKey = `chatCount:${userId}`;
//       const resetDateKey = `resetDate:${userId}`;
  
//       // 从 KV 获取用户的聊天次数和上次重置日期
//       const chatCountStr = await kv.get(chatCountKey);
//       const resetDateStr = await kv.get(resetDateKey);
//       let chatCount = chatCountStr ? parseInt(chatCountStr, 10) : 0;
//       let resetDate = resetDateStr || null;
  
//       // 如果当前日期与上次重置日期不同，则重置聊天次数
//       if (currentDate > resetDate) {
//         chatCount = 0;
//         resetDate = currentDate;
//         await kv.put(chatCountKey, '0');
//         await kv.put(resetDateKey, currentDate);
//       }
  
//       // 检查是否超过聊天次数限制
//       if (chatCount >= chatLimit) {
//         return new Response(JSON.stringify({
//           error: `您已达到今天的聊天次数限制 (${chatLimit} 次)。限制将在明天重置。`
//         }), {
//           status: 429, // Too Many Requests
//           headers: { 'Content-Type': 'application/json' }
//         });
//       }
  
//       // 调用 OpenAI API
//       const openaiKey = env.OPENAI_API_KEY;
//       const model = "gpt-4o";
  
//       const response = await fetch("https://api.gpt.ge/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${openaiKey}`
//         },
//         body: JSON.stringify({
//           model,
//           messages: [{
//             role: "user",
//             content: `请用${language}回答：${message}（回答需与清华大学课题组网站相关）`
//           }],
//           temperature: 0.7
//         })
//       });
  
//       const data = await response.json();
//       const assistantReply = data.choices[0].message.content;
  
//       // 增加聊天次数并更新 KV
//       await kv.put(chatCountKey, (chatCount + 1).toString());
//       // 更新重置日期 (即使日期没有改变，也为了确保 KV 中有值)
//       await kv.put(resetDateKey, currentDate);
  
//       const responseHeaders = new Headers({
//         'Content-Type': 'text/plain',
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'POST, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type',
//       });
  
//       if (newUser) {
//         responseHeaders.append('Set-Cookie', `userId=${userId}; Path=/; HttpOnly; Secure`);
//       }
  
//       return new Response(assistantReply, { headers: responseHeaders });
  
//     } catch (error) {
//       console.error("聊天错误:", error);
//       return new Response(JSON.stringify({
//         error: "服务暂时不可用，请稍后再试"
//       }), {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       });
//     }
//   }

function generateRandomId(length = 24) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  export async function onRequestPost(context) {
    try {
      const { request, env } = context;
      const { message, language } = await request.json();
      const chatLimit = 10; // 设置每个用户的每日聊天次数限制
      const kv = env.CHAT_COUNT_KV; // 绑定您的 KV 命名空间
  
      if (!kv) {
        console.error('CHAT_COUNT_KV 环境变量未绑定到 KV 命名空间');
        return new Response('聊天次数限制功能未启用，KV 存储未配置', { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
  
      // 获取用户的唯一标识符
      let userId = request.headers.get('cookie')?.split('; ').find(cookie => cookie.startsWith('userId='))?.split('=')[1];
      let newUser = false;
  
      if (!userId) {
        userId = generateRandomId();
        newUser = true;
      }
  
      const currentDate = new Date().toISOString().slice(0, 10); // 获取当前日期 (YYYY-MM-DD)
      const chatCountKey = `chatCount:${userId}`;
      const resetDateKey = `resetDate:${userId}`;
  
      // 从 KV 获取用户的聊天次数和上次重置日期
      const chatCountStr = await kv.get(chatCountKey);
      const resetDateStr = await kv.get(resetDateKey);
      let chatCount = chatCountStr ? parseInt(chatCountStr, 10) : 0;
      let resetDate = resetDateStr || null;
  
      // 如果当前日期与上次重置日期不同，则重置聊天次数
      if (currentDate > resetDate) {
        chatCount = 0;
        resetDate = currentDate;
        await kv.put(chatCountKey, '0');
        await kv.put(resetDateKey, currentDate);
      }
  
      // 检查是否超过聊天次数限制
      if (chatCount >= chatLimit) {
        return new Response(JSON.stringify({
          error: `您已达到今天的聊天次数限制 (${chatLimit} 次)。限制将在明天重置。`
        }), {
          status: 429, // Too Many Requests
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // **----- 使用 Cloudflare Auto RAG -----**
      let contextContent = "";
      try {
        const ragResult = await env.AI.rag.search({
          query: message
        });
        if (ragResult && ragResult.results && ragResult.results.length > 0) {
          contextContent = "以下是与您问题相关的文档片段，请参考它们来回答问题：\n";
          ragResult.results.forEach((result, index) => {
            contextContent += `[文档 ${index + 1}]\n${result.content}\n\n`;
          });
        }
      } catch (error) {
        console.error("Cloudflare Auto RAG 搜索失败:", error);
        contextContent = "无法检索到相关信息。"; // 在出错时提供一个默认消息
      }
      // **----- Auto RAG 部分结束 -----**
  
      // 调用 OpenAI API
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
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant for the [课题组名称] research group at Tsinghua University. Please answer questions about the group based on the following context. Respond in ${language === 'zh' ? 'Chinese' : 'English'}. If the context does not contain the answer, please state that you cannot answer based on the provided information.`
            },
            {
              role: "user",
              content: `${contextContent}用户提问：${message}`
            }
          ],
          temperature: 0.7
        })
      });
  
      const data = await response.json();
      const assistantReply = data.choices[0].message.content;
  
      // 增加聊天次数并更新 KV
      await kv.put(chatCountKey, (chatCount + 1).toString());
      // 更新重置日期 (即使日期没有改变，也为了确保 KV 中有值)
      await kv.put(resetDateKey, currentDate);
  
      const responseHeaders = new Headers({
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
  
      if (newUser) {
        responseHeaders.append('Set-Cookie', `userId=${userId}; Path=/; HttpOnly; Secure`);
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