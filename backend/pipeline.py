import os
import json
import datetime
from dotenv import load_dotenv
from tools.search_tool import web_search
from llm import call_llm

# Load local .env file if it exists (for local testing)
load_dotenv()

class MultiAgentNewsPipeline:
    def __init__(self):
        self.logs = {
            "scout": [],
            "verifier": [],
            "critic": [],
            "synthesizer": []
        }

    def log(self, agent: str, message: str):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.logs[agent].append(log_entry)
        print(f"[{agent.upper()}] {log_entry}")

    def run_scout_agent(self) -> list[dict]:
        self.log("scout", "Initiating search for trending AI news and upcoming releases...")
        
        # We query for general trending AI updates
        queries = [
            "latest artificial intelligence news releases",
            "trending AI models announcements today",
            "upcoming AI updates breakthroughs"
        ]
        
        raw_search_results = []
        for q in queries:
            self.log("scout", f"Searching web for query: '{q}'")
            results = web_search(q, max_results=5)
            raw_search_results.extend(results)
            self.log("scout", f"Retrieved {len(results)} search results for '{q}'")

        # De-duplicate results by URL
        seen_urls = set()
        unique_results = []
        for r in raw_search_results:
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                unique_results.append(r)

        self.log("scout", f"Total unique search references collected: {len(unique_results)}")

        # Instruct LLM to identify the top 3-5 distinct trends/announcements
        system_prompt = (
            "You are a professional Tech Scout Agent. Your task is to analyze raw search results "
            "and extract the 3 to 5 most significant, concrete, and distinct AI news updates or upcoming releases. "
            "Ignore generic articles, ads, or high-level tutorials. Focus on model releases, major features, "
            "company announcements, or breakthrough research papers."
        )

        prompt = f"Analyze the following web search results:\n\n{json.dumps(unique_results, indent=2)}\n\n" \
                 "Identify the top 3-5 distinct AI updates. For each update, extract:\n" \
                 "1. Title of the news/update.\n" \
                 "2. Summary of the news/update.\n" \
                 "3. The primary claims made (e.g., capability claims, speed, context window, etc.).\n" \
                 "4. List of source URLs matching this trend from the search results.\n\n" \
                 "Provide the output in JSON format with a root key 'trends' containing a list of objects with fields: " \
                 "'title', 'summary', 'claims' (list of strings), and 'source_urls' (list of strings)."

        self.log("scout", "Analyzing search data with LLM to extract trending news items...")
        llm_response = call_llm(system_prompt, prompt, temperature=0.2, json_mode=True)
        
        try:
            parsed = json.loads(llm_response)
            trends = parsed.get("trends", [])
            self.log("scout", f"Identified {len(trends)} distinct AI news items for validation.")
            for t in trends:
                self.log("scout", f"Scouted Trend: {t.get('title')}")
            return trends
        except Exception as e:
            self.log("scout", f"Failed to parse LLM response as JSON. Raw response: {llm_response[:500]}")
            # Return a fallback empty structure or try a regex extract if needed.
            return []

    def run_verifier_agent(self, trends: list[dict]) -> list[dict]:
        self.log("verifier", "Starting fact-checking and source verification...")
        verified_trends = []

        for trend in trends:
            title = trend.get("title")
            self.log("verifier", f"Verifying claims for trend: '{title}'")
            
            # Formulate verification query
            verification_query = f"official verification details source {title}"
            self.log("verifier", f"Performing deep search check: '{verification_query}'")
            search_results = web_search(verification_query, max_results=5)
            
            system_prompt = (
                "You are an expert AI Fact-Checker Agent. Your goal is to review a proposed news item "
                "and verify its accuracy using search evidence. You must look for:\n"
                "- Primary sources (e.g., official corporate announcements, academic papers, github repositories).\n"
                "- Confirmation from reputable tech publications.\n"
                "- Discrepancies or misinformation.\n\n"
                "Provide a detailed rationale and assign an initial evaluation: 'Verified', 'Likely True', 'Unverified', or 'Debunked'."
            )
            
            prompt = f"Trend to verify:\n{json.dumps(trend, indent=2)}\n\n" \
                     f"Search evidence:\n{json.dumps(search_results, indent=2)}\n\n" \
                     "Analyze the evidence. Provide your response as a JSON object with fields:\n" \
                     "- 'evaluation': 'Verified' | 'Likely True' | 'Unverified' | 'Debunked'\n" \
                     "- 'verification_details': A detailed description of what was verified and which sources confirmed it.\n" \
                     "- 'source_credibility': A brief note on the credibility of the sources found (e.g., 'Official blog', 'Secondary news', 'Social media rumor').\n" \
                     "- 'additional_sources': A list of dicts with 'title' and 'url' from the search evidence that confirm this claim."

            llm_response = call_llm(system_prompt, prompt, temperature=0.1, json_mode=True)
            
            try:
                verdict = json.loads(llm_response)
                self.log("verifier", f"Verdict for '{title}': {verdict.get('evaluation')}")
                
                # Combine scout data with verifier data
                trend.update({
                    "evaluation": verdict.get("evaluation", "Unverified"),
                    "verification_details": verdict.get("verification_details", ""),
                    "source_credibility": verdict.get("source_credibility", ""),
                    "verification_sources": verdict.get("additional_sources", [])
                })
            except Exception as e:
                self.log("verifier", f"Error parsing verification response for '{title}': {e}")
                trend.update({
                    "evaluation": "Unverified",
                    "verification_details": "Verification failed due to processing error.",
                    "source_credibility": "N/A",
                    "verification_sources": []
                })
            
            verified_trends.append(trend)

        return verified_trends

    def run_critic_agent(self, verified_trends: list[dict]) -> list[dict]:
        self.log("critic", "Starting skeptical analysis and hype detection...")
        final_trends = []

        for trend in verified_trends:
            title = trend.get("title")
            self.log("critic", f"Analyzing caveats, hype, and limitations for: '{title}'")
            
            # Query specifically for criticisms/limitations/controversy
            critic_query = f"{title} criticism controversy issues limitations benchmarks"
            self.log("critic", f"Performing skeptic search: '{critic_query}'")
            search_results = web_search(critic_query, max_results=4)
            
            system_prompt = (
                "You are an AI Devil's Advocate and Hype Critic Agent. Your goal is to dissect tech announcements, "
                "expose marketing exaggerations, outline technical limitations, and find community criticisms (e.g., from Reddit, Hacker News, or Twitter).\n"
                "Be critical but objective. Don't invent issues, but find real potential issues, high costs, missing details, "
                "or concerns raised by researchers."
            )
            
            prompt = f"Trend and Claims:\n{json.dumps(trend, indent=2)}\n\n" \
                     f"Critic search evidence:\n{json.dumps(search_results, indent=2)}\n\n" \
                     "Identify concerns, limitations, and hype. Provide your response as a JSON object with fields:\n" \
                     "- 'hype_level': 'Low' | 'Medium' | 'High'\n" \
                     "- 'skepticism_details': A detailed critique of the announcement (e.g., missing metrics, high compute costs, closed-source nature, or hype warnings).\n" \
                     "- 'limitations': A list of key limitations or caveats (strings)."

            llm_response = call_llm(system_prompt, prompt, temperature=0.3, json_mode=True)
            
            try:
                critique = json.loads(llm_response)
                self.log("critic", f"Hype level for '{title}': {critique.get('hype_level')}")
                
                # Update trend with critic info
                trend.update({
                    "hype_level": critique.get("hype_level", "Medium"),
                    "skepticism_details": critique.get("skepticism_details", ""),
                    "limitations": critique.get("limitations", [])
                })
            except Exception as e:
                self.log("critic", f"Error parsing critic response for '{title}': {e}")
                trend.update({
                    "hype_level": "Unknown",
                    "skepticism_details": "No critique available due to processing error.",
                    "limitations": []
                })
            
            final_trends.append(trend)

        return final_trends

    def run_synthesizer_agent(self, final_trends: list[dict]) -> dict:
        self.log("synthesizer", "Compiling daily digest and calculating ultimate credibility ratings...")
        
        system_prompt = (
            "You are the Editor-in-Chief and Synthesizer Agent. Your job is to take the scout, verifier, and critic inputs "
            "and build a clean, professional, daily news digest. You will write a global summary of the day's AI trends "
            "and assign final credibility ratings based on the following algorithm:\n"
            "- 'Verified': If evaluation is 'Verified' or 'Likely True' and Hype Level is Low/Medium.\n"
            "- 'Caution (Hype)': If evaluation is 'Verified' or 'Likely True' but Hype Level is 'High'.\n"
            "- 'Unverified': If evaluation is 'Unverified'.\n"
            "- 'Debunked / Fake': If evaluation is 'Debunked'.\n\n"
            "Produce a final clean JSON structure for the website."
        )

        prompt = f"Today's raw verified and criticized trends:\n{json.dumps(final_trends, indent=2)}\n\n" \
                 "Create a summary paragraph of today's AI landscape and finalize the articles.\n" \
                 "Output a JSON object with fields:\n" \
                 "- 'summary': A high-level daily summary paragraph (3-4 sentences).\n" \
                 "- 'articles': A list of articles. Each article should have: \n" \
                 "    * 'id': string (e.g., '1', '2')\n" \
                 "    * 'title': string\n" \
                 "    * 'summary': string (cohesive combined summary)\n" \
                 "    * 'credibility_rating': 'Verified' | 'Caution (Hype)' | 'Unverified' | 'Debunked'\n" \
                 "    * 'evaluation': string (from verifier)\n" \
                 "    * 'verification_details': string (from verifier)\n" \
                 "    * 'source_credibility': string (from verifier)\n" \
                 "    * 'hype_level': string (from critic)\n" \
                 "    * 'skepticism_details': string (from critic)\n" \
                 "    * 'limitations': list of strings (from critic)\n" \
                 "    * 'sources': list of dicts with 'title' and 'url' (combining scout_urls and verification sources)"

        llm_response = call_llm(system_prompt, prompt, temperature=0.2, json_mode=True)
        
        try:
            digest = json.loads(llm_response)
            self.log("synthesizer", "Digest synthesized successfully.")
            return digest
        except Exception as e:
            self.log("synthesizer", f"Error parsing synthesizer output: {e}")
            return {
                "summary": "AI updates were processed today, but synthesis failed.",
                "articles": final_trends
            }

    def execute_daily_run(self) -> dict:
        print("\n--- Starting Multi-Agent AI News Aggregator & Fact-Checker Daily Run ---")
        
        # 1. Scout
        trends = self.run_scout_agent()
        if not trends:
            self.log("synthesizer", "No trends discovered today. Exiting.")
            return self.create_empty_report("No updates could be retrieved today.")
            
        # 2. Verify
        verified = self.run_verifier_agent(trends)
        
        # 3. Critique
        criticized = self.run_critic_agent(verified)
        
        # 4. Synthesize
        digest = self.run_synthesizer_agent(criticized)
        
        # Compile full report
        date_str = datetime.date.today().isoformat()
        full_report = {
            "date": date_str,
            "status": "success",
            "summary": digest.get("summary", ""),
            "articles": digest.get("articles", []),
            "agent_logs": self.logs
        }
        
        print("--- Daily Run Completed Successfully ---\n")
        return full_report

    def create_empty_report(self, reason: str) -> dict:
        date_str = datetime.date.today().isoformat()
        return {
            "date": date_str,
            "status": "no_data",
            "summary": reason,
            "articles": [],
            "agent_logs": self.logs
        }

if __name__ == "__main__":
    pipeline = MultiAgentNewsPipeline()
    report = pipeline.execute_daily_run()
    
    # Save test output locally
    os.makedirs("test_output", exist_ok=True)
    with open("test_output/daily_report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("Test report saved to test_output/daily_report.json")
