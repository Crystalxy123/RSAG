
# 确定域名

# 服务器选择
- CloudFlare

 Cloudflare 以其庞大的全球边缘网络而闻名，节点遍布世界各地，旨在将内容和安全防护推向离用户尽可能近的地方。这通常意味着在全球范围内（特别是在中国大陆以外）能提供更稳定、低延迟的访问体验。

  Cloudflare 被广泛认为是 DDoS 攻击防护领域的领导者之一，其 Anycast 网络架构能够吸收和分散超大规模的攻击流量。其免费套餐也包含了基础的 DDoS 防护。

5美元/月，优点在于方便嵌入RAG，如不考虑RAG，完全可以白嫖。此外，个人也比较熟悉部署和设置。

使用 Cloudflare 账户成员和角色 (IAM)
这是最直接的方式，适用于需要访问 Cloudflare 控制面板进行管理的团队成员。
邀请成员: 账户所有者或管理员可以邀请团队成员加入 Cloudflare 账户。
进入 Cloudflare 控制面板 -> "Manage Account" -> "Members"。
点击 "Invite"，输入成员的邮箱地址。
分配角色: 在邀请时或之后，为成员分配角色。角色决定了成员可以执行的操作。
预定义角色: Cloudflare 提供了一些预定义角色，例如：
Super Administrator: 完全控制账户所有设置。
Administrator: 大部分控制权，但不能管理成员或账单。
R2 Administrator: 专门用于管理 R2 存储桶（创建、删除桶、读写对象、管理设置）。这是控制 R2 文件传输最相关的角色之一。
Read Only: 只能查看设置和分析，不能做任何更改。
自定义角色 (推荐，适用于企业计划): 如果你需要更精细的权限控制（例如，只允许读取 R2，或只允许写入特定 R2 桶），你可以创建自定义角色，精确指定允许的 R2 操作权限（如 R2 Bucket Read, R2 Object Read, R2 Object Write, R2 Bucket Create 等）。
成员访问: 被邀请的成员接受邀请并设置自己的 Cloudflare 登录凭据后，就可以根据其被授予的角色权限，在 Cloudflare 控制面板中访问和操作 R2 存储桶（包括上传、下载、删除文件）。
优点:
集成在 Cloudflare 控制面板中，管理相对直观。
可以利用 Cloudflare 强大的 IAM 功能。
可以控制对 R2 之外的其他 Cloudflare 服务的访问。



- 阿里云




# 收集文档
收集汇总

