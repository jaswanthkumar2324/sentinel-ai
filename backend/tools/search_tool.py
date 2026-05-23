import os
import json
import requests
from duckduckgo_search import DDGS

def web_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Searches the web for the given query.
    Tries to use Tavily if TAVILY_API_KEY is present, otherwise falls back to DuckDuckGo (free, no key required).
    """
    tavily_key = os.environ.get("TAVILY_API_KEY")
    if tavily_key:
        try:
            # Tavily API Search
            url = "https://api.tavily.com/search"
            headers = {"Content-Type": "application/json"}
            payload = {
                "api_key": tavily_key,
                "query": query,
                "search_depth": "advanced",
                "max_results": max_results
            }
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("results", []):
                    results.append({
                        "title": item.get("title", ""),
                        "url": item.get("url", ""),
                        "snippet": item.get("content", "")
                    })
                return results
        except Exception as e:
            print(f"[Search Tool] Tavily search error: {e}. Falling back to DuckDuckGo.")

    # Fallback to DuckDuckGo (Free, no API key required)
    try:
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=max_results)
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", "")
                }
                for r in results
            ]
    except Exception as e:
        print(f"[Search Tool] DuckDuckGo search error: {e}")
        return []

if __name__ == "__main__":
    # Simple test
    print("Testing search...")
    res = web_search("AI agent trending news 2026", max_results=2)
    print(json.dumps(res, indent=2))
