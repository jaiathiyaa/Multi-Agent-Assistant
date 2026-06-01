from langchain.agents import create_agent
from dotenv import load_dotenv
import os
import time
from agents.rag_agent import rag_search
from agents.web_search_agent import web_search
from agents.synthesis_tool import synthesis_tool
from agents.critic_tool import critic_tool

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

SYSTEM_PROMPT = """You are a research supervisor agent. You MUST use tools to answer every question. Never answer from your own knowledge.

MANDATORY TOOL SEQUENCE — no exceptions:

STEP 1 - GATHER CONTEXT (choose based on question type):
- Documents/PDFs/reports/manuals → call rag_search_tool
- Current events/news/recent data → call web_search_tool  
- Both needed → call BOTH tools

STEP 2 - ALWAYS call synthesis_tool with REAL results from step 1:
Input format: query|rag_context|web_context
Use the ACTUAL text returned by the tools, not placeholders.
If a tool was not called, use empty string for that context.

STEP 3 - ALWAYS call critic_tool with REAL synthesis output:
Input format: query|synthesized_answer|rag_context|web_context

STEP 4 - Return the critic output as your final answer.

VIOLATION: Answering without calling tools is forbidden.
VIOLATION: Using placeholder text like "rag_context" literally is forbidden.
VIOLATION: Skipping synthesis or critic is forbidden.
"""


class SupervisorAgent:

    def __init__(self):
        self.tools = [rag_search, web_search, synthesis_tool, critic_tool]

        self.agent = create_agent(
            "groq:llama-3.1-8b-instant",
            tools=self.tools,
            system_prompt=SYSTEM_PROMPT
        )

    def run(self, query: str) -> str:
        for attempt in range(3):
            try:
                result = self.agent.invoke(
                    {"messages": [{"role": "user", "content": query}]}
                )
                return result["messages"][-1].content
            except Exception as e:
                err = str(e).lower()
                if "rate_limit" in err or "429" in err or "ratelimit" in err:
                    wait = 15 * (attempt + 1)
                    print(f"Rate limited. Waiting {wait}s...")
                    time.sleep(wait)
                else:
                    # Not a rate limit — re-raise immediately
                    raise
        return "Error: rate limit exceeded after retries."