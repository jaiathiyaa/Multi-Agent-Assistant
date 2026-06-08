from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv
from langchain_groq import ChatGroq
import os
import time
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")


class SynthesisAgent:
    def __init__(self):
        self.llm = ChatGroq(api_key=groq_api_key, model="llama-3.1-8b-instant", temperature=0.1, max_tokens=1024)

    def synthesize(self, query: str,rag_context,web_context) -> str:
        
        # System message = permanent rules for the agent
        system = SystemMessage(content="""
        You are a research analyst.

        Rules:
        - Use ONLY the provided contexts.
        - Never use external knowledge.
        - Extract concrete facts.
        - Do not repeat article titles.
        - Do not repeat source names.

        Output Format:

        Introduction

        Key Findings
        - Finding 1 [PDF/Web]
        - Finding 2 [PDF/Web]

        Conclusion
        """)

        # Human message = the actual question + context each time
        # In SynthesisAgent.synthesize(), add a guard:
        human = HumanMessage(content=f"""
        Question: {query}

        PDF Context:
        {rag_context if rag_context.strip() else "No relevant PDF content found."}

        Web Context:
        {web_context if web_context.strip() else "No web results found."}
        """)

        response = self.llm.invoke([system, human])
        return response.content
 