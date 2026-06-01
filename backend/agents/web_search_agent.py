from langchain_core.tools import tool
from ddgs import DDGS

@tool("web_search_tool", description="Search the internet for current information, news, and recent events.")
def web_search(query: str) -> str:
    """
    Search the internet for current information,
    news, and recent events.
    
    """
    try:
        results = []
        with DDGS() as ddgs:
            for result in ddgs.text(query, max_results=5):
                results.append(
                    f"Title: {result['title']}\n"
                    f"Link: {result['href']}\n"
                    f"Content: {result['body']}"
                )
        return "\n\n".join(results) if results else "No results found."
    except Exception as e:
        return f"Web search failed: {str(e)}"

