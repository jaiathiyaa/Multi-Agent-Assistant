from agents.synthesis import SynthesisAgent
from agents.critic_agent import CriticAgent
from agents.rag_agent import rag_search
from agents.web_search_agent import web_search


def main():
    query = "What are the latest advancements in AI technology?"
    
    # Step 1: Get contexts from RAG and Web Search
    rag_context = rag_search.invoke(query)
    web_context = web_search.invoke(query)
    
    # Step 2: Synthesize an answer using the Synthesis Agent
    synthesis_agent = SynthesisAgent()

    synthesized_answer = synthesis_agent.synthesize(
        query=query,
        rag_context=rag_context,
        web_context=web_context
    )

    critic_agent = CriticAgent()

    critique = critic_agent.critic(
        query=query,
        synthesized_answer=synthesized_answer,
        rag_context=rag_context,
        web_context=web_context
    )
    print("Synthesized Answer:\n", synthesized_answer)
    print("\nCritique:\n", critique)

main()