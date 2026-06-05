from agents.supervisor import Supervisor
sv = Supervisor()
result = sv.run("Compare the summary in the document with recent news")
print("\n=== FINAL RESULT ===")
print(f"Route taken: {result['route']}")
print(f"RAG Context: {result['rag_context']}")
print(f"Web Context: {result['web_context']}")
print(f"Synthesized Answer: {result['synthesized_answer']}")
print(f"Critique: {result['critique']}")