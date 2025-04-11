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
      const chatLimit = 20; // 设置每个用户的每日聊天次数限制
      const kv = env.CHAT_COUNT_KV; // 绑定您的 KV 命名空间
  
      if (!kv) {
        console.error('CHAT_COUNT_KV 环境变量未绑定到 KV 命名空间');
        return new Response('聊天次数限制功能未启用，KV 存储未配置', { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
  
      let userId = request.headers.get('cookie')?.split('; ').find(cookie => cookie.startsWith('userId='))?.split('=')[1];
      let newUser = false;
  
      if (!userId) {
        userId = generateRandomId();
        newUser = true;
      }
  
      const currentDate = new Date().toISOString().slice(0, 10);
      const chatCountKey = `chatCount:${userId}`;
      const resetDateKey = `resetDate:${userId}`;
  
      const chatCountStr = await kv.get(chatCountKey);
      const resetDateStr = await kv.get(resetDateKey);
      let chatCount = chatCountStr ? parseInt(chatCountStr, 10) : 0;
      let resetDate = resetDateStr || null;
  
      if (currentDate > resetDate) {
        chatCount = 0;
        resetDate = currentDate;
        await kv.put(chatCountKey, '0');
        await kv.put(resetDateKey, currentDate);
      }
  
      if (chatCount >= chatLimit) {
        return new Response(JSON.stringify({
          error: `您已达到今天的聊天次数限制 (${chatLimit} 次)。限制将在明天重置。`
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // **----- 使用 Cloudflare Auto RAG -----**
    //   let contextContent = "";
    //   try {
    //     const ragResult = await env.AI.autorag("rsag").aiSearch({
    //       query: message // 将用户的实际消息作为查询
    //     });
    //     console.log("Auto RAG 结果:", ragResult); // 添加这行来查看中间输出
    //     if (ragResult && ragResult.data && ragResult.data.length > 0) {
    //       contextContent = "以下是与您问题相关的文档片段，请参考它们来回答问题：\n";
    //       ragResult.data.forEach((item, index) => {
    //         contextContent += `[文档 ${index + 1}]\n${item.content}\n\n`; // 假设内容在 item.content 中
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Cloudflare Auto RAG 搜索失败:", error);
    //     contextContent = "无法检索到相关信息。";
    //   }
        let contextContent = "";
        try {
        const ragResult = await env.AI.autorag("rsag").aiSearch({
            query: message // 将用户的实际消息作为查询
        });
        console.log("Auto RAG 结果:", ragResult); // 添加这行来查看中间输出
        if (ragResult && ragResult.data && ragResult.data.length > 0) {
            contextContent = "以下是与您问题相关的文档片段，请参考它们来回答问题：\n";
            ragResult.data.forEach((item, index) => {
            if (item.content && Array.isArray(item.content)) {
                item.content.forEach(contentItem => {
                if (contentItem.type === 'text' && contentItem.text) {
                    contextContent += `[文档 ${index + 1}]\n${contentItem.text}\n\n`;
                }
                });
            }
            });
        }
        } catch (error) {
        console.error("Cloudflare Auto RAG 搜索失败:", error);
        contextContent = "无法检索到相关信息。";
        }
      // **----- Auto RAG 部分结束 -----**
  
      const messages = [
        {
          role: "system",
          content: `You are a helpful assistant for the [课题组名称] research group at Tsinghua University. Please answer questions about the group based on the following context. Respond in ${language === 'zh' ? 'Chinese' : 'English'}. If the context does not contain the answer, please state that you cannot answer based on the provided information.`
        },
        {
          role: "user",
          content: `${contextContent}用户提问：${message}`
        }
      ];
  
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
          messages: messages,
          temperature: 0.7
        })
      });
  
      const data = await response.json();
      const assistantReply = data.choices[0].message.content;
  
      await kv.put(chatCountKey, (chatCount + 1).toString());
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