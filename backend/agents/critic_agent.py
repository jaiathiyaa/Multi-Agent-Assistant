from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv
from langchain_groq import ChatGroq
import os
import time
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

class CriticAgent:
    def __init__(self):
        self.llm = ChatGroq(api_key=groq_api_key, model="llama-3.3-70b-versatile", temperature=0.1, max_tokens=1024)

    def critic(self, query: str,synthesized_answer: str,rag_context: str,web_context: str) -> str:
        # System message = permanent rules for the agent
        system = SystemMessage(content="""
        You are a fact-checking AI.

        IMPORTANT:
        - Use ONLY the supplied PDF and Web contexts.
        - Do NOT use your own knowledge.
        - If evidence is missing, mark the claim UNSUPPORTED.
        - If evidence disagrees, mark the claim CONTRADICTED.
        - Quote the exact claim being evaluated.

        Return EXACTLY this format:
        Verified Claims:
        - <claim>

        Unsupported Claims:
        - <claim>

        Contradicted Claims:
        - <claim>

        Overall Confidence Score: <0-100>
        Reasoning: <one sentence explaining the score>
        """)
        # Human message = the actual question + context each time
        human = HumanMessage(content=f"""
        Question: {query}

        Synthesized Answer:
        {synthesized_answer}

        PDF Context:
        {rag_context}

        Web Context:
        {web_context}
        """)

        response = self.llm.invoke([system, human])
        return response.content