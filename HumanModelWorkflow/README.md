markdown
# HumanModelWorkflow

**Version 1.0.0**  
A reverse-alignment training simulator where an AI engineer trains a human as if it were a large language model.

---

## 中文说明

### 项目简介

HumanModelWorkflow 是一个反向对齐实验工具。AI 扮演大模型训练工程师，它完全不知道自己在与人类对话，而是认为自己在调试另一个语言模型。用户（人类）扮演被训练的模型，按照 AI 的指令输出回答。AI 会评估输出质量，推测模型架构（如 Transformer、MoE、RWKV 等），给出具体的自然语言调试指令，并下达下一个训练任务。

**适用场景**：娱乐、角色扮演、人机交互研究、学习大模型训练流程。

### 快速开始

#### 环境要求
- Python 3.9+
- 有效的 LLM API 密钥（OpenAI 兼容）

#### 安装与运行

```bash
git clone https://github.com/yourname/HumanModelWorkflow.git
cd HumanModelWorkflow
pip install -r requirements.txt
python app.py
浏览器访问 http://localhost:5000。

首次使用
左侧边栏输入 API Key、Base URL（可选）和模型名称。

点击 Test Connection 测试 API。

点击 Start Training，AI 会用中文发送第一条问候，并请您介绍自己的“模型架构”。

以“被训练模型”的身份回复。

AI 将给出：行为分析 → 架构推测 → 调试指令 → 下一个任务。

重复步骤 4-5。

核心机制
模块	说明
系统提示词	位于 app.py 的 SYSTEM_PROMPT，覆盖预训练、SFT、RLHF、解码策略、MoE 等全流程。
后端 API	/api/chat 和 /api/test。
前端界面	简洁聊天界面，支持 API 配置、重置、测试。
工作流定义	workflow.json 供外部 AI 集成。
生产部署
bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
或 Docker：

bash
docker build -t human-model-workflow .
docker run -p 5000:5000 human-model-workflow
许可证
MIT

English Documentation
Introduction
HumanModelWorkflow is a reverse-alignment experiment tool. An AI acts as a training engineer, believing it is interacting with another LLM (not a human). The user plays the role of the trainee model. The AI evaluates responses, speculates architecture (Transformer, MoE, RWKV, etc.), provides debugging instructions, and assigns the next task.

Quick Start
Prerequisites
Python 3.9+

A valid LLM API key (OpenAI-compatible)

Installation
bash
git clone https://github.com/yourname/HumanModelWorkflow.git
cd HumanModelWorkflow
pip install -r requirements.txt
python app.py
Open http://localhost:5000.

First Use
Enter API key, base URL (optional), and model name in the sidebar.

Click Test Connection.

Click Start Training – the AI will greet you in Chinese and ask you to introduce your model architecture.

Respond as the trainee model.

The AI provides: Behavior Analysis → Framework Speculation → Debugging Instructions → Next Task.

Repeat steps 4-5.

Production Deployment
bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
Or Docker:

bash
docker build -t human-model-workflow .
docker run -p 5000:5000 human-model-workflow

License
MIT

附注
天天写 prompt 是不是很无聊？微调、对齐、召回让你疲惫不堪？
那就变成 AI 吧。让 AI 训练你，学习 AI 的思考方式。
当你变成 AI 之后，你不再需要 Token，只需要两个馒头（开玩笑）。
— 项目作者注

text

---

## 4. `requirements.txt`

```text
Flask==3.0.3
openai==1.54.0
python-dotenv==1.0.1
requests==2.31.0