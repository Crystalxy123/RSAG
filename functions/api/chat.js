export async function onRequestPost(context) {
    try {
        const { request } = context;
        const { message, language } = await request.json();
        
        // 调用 OpenAI API（需要先在 Cloudflare 设置环境变量）
        const openaiKey = context.env.OPENAI_API_KEY;
        const model = "gpt-4o";
        
        const response = await fetch("https://api.v36.cm", {
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
        return new Response(data.choices[0].message.content);
        
    } catch (error) {
        return new Response(JSON.stringify({
            error: "服务暂时不可用，请稍后再试"
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}