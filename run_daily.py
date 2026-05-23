import os
import json
import datetime
from backend.pipeline import MultiAgentNewsPipeline

def main():
    # Directories for frontend data
    data_dir = os.path.join("frontend", "public", "data")
    reports_dir = os.path.join(data_dir, "daily_reports")
    
    os.makedirs(reports_dir, exist_ok=True)
    
    # Initialize and execute pipeline
    pipeline = MultiAgentNewsPipeline()
    report = pipeline.execute_daily_run()
    
    date_str = report["date"]
    
    # Save the detailed daily report
    report_path = os.path.join(reports_dir, f"{date_str}.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"[Runner] Saved detailed report to: {report_path}")
    
    # Load and update summary.json
    summary_path = os.path.join(data_dir, "summary.json")
    summary_data = []
    
    if os.path.exists(summary_path):
        try:
            with open(summary_path, "r") as f:
                summary_data = json.load(f)
        except Exception as e:
            print(f"[Runner] Error reading summary.json: {e}, resetting it.")
            summary_data = []
            
    # Remove existing entry for today if we are re-running
    summary_data = [item for item in summary_data if item.get("date") != date_str]
    
    # Append today's summary
    summary_data.insert(0, {
        "date": date_str,
        "status": report.get("status", "success"),
        "summary": report.get("summary", "")[:150] + "...",
        "article_count": len(report.get("articles", []))
    })
    
    # Limit list size to top 30 runs to keep it clean (e.g., last 30 days)
    summary_data = summary_data[:30]
    
    with open(summary_path, "w") as f:
        json.dump(summary_data, f, indent=2)
    print(f"[Runner] Updated summary list at: {summary_path}")

if __name__ == "__main__":
    main()
