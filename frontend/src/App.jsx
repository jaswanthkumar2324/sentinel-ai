import React, { useState, useEffect } from 'react';

// Sleek mock data for onboarding and testing the UI
const MOCK_SUMMARY = [
  {
    date: "2026-05-23",
    status: "success",
    summary: "Today features massive releases: DeepSeek-V3 open-sourced, OpenAI's Sora API launch, and a debunked claim of AGI achieved on quantum chips.",
    article_count: 3
  },
  {
    date: "2026-05-22",
    status: "success",
    summary: "Yesterday saw updates from Google on Imagen 3 API availability, Anthropic's new desktop application, and a verified paper on LLM optimization.",
    article_count: 2
  }
];

const MOCK_REPORTS = {
  "2026-05-23": {
    date: "2026-05-23",
    status: "success",
    summary: "Today features massive releases: DeepSeek-V3 open-sourced with 671B parameters, OpenAI's Sora API launch, and a debunked claim of AGI achieved on quantum chips by NextMind.",
    articles: [
      {
        id: "1",
        title: "DeepSeek-V3 Open Sourced with 671B Parameters",
        summary: "DeepSeek has officially released its new mixture-of-experts model DeepSeek-V3, claiming competitive performance with GPT-4o at a fraction of the inference cost. The model is open-weight, supporting 128k context length, and utilizes an innovative Multi-head Latent Attention (MLA) architecture.",
        credibility_rating: "Verified",
        evaluation: "Verified",
        verification_details: "Verified via multiple independent official developer blogs, the GitHub code repository, and verification from AI community researchers who have run it locally. The model weights are publicly downloadable.",
        source_credibility: "Primary (Official Github Repo & Published Research Paper)",
        hype_level: "Medium",
        skepticism_details: "While the model delivers on benchmarks, critics note that running a 671B parameter model locally requires massive enterprise infrastructure (multiple H100 GPUs). Furthermore, the low training cost claims ($5M) do not account for past compute research amortization.",
        limitations: [
          "Requires a cluster of high-end GPUs to host locally",
          "Low training cost claims lack third-party audit",
          "Certain benchmarks are self-reported and need independent verification"
        ],
        sources: [
          { title: "DeepSeek-V3 Github Repository", url: "https://github.com/deepseek-ai/DeepSeek-V3" },
          { title: "Official DeepSeek Announcement", url: "https://x.com/deepseek_ai/status/12345" }
        ]
      },
      {
        id: "2",
        title: "OpenAI Sora API Launched for Selected Developers",
        summary: "OpenAI has officially launched a private beta API for its video generation model Sora. Developers in the creative arts and research sectors can now programmatically generate high-fidelity videos up to 60 seconds long using text prompts.",
        credibility_rating: "Caution (Hype)",
        evaluation: "Likely True",
        verification_details: "Confirmed by OpenAI's official developer documentation and blog post. However, actual access is highly restricted, and independent API latency/cost analysis is not yet available.",
        source_credibility: "Official company docs, limited access beta",
        hype_level: "High",
        skepticism_details: "Highly hyped launch. While the output videos look cinematic in promotional materials, developers note the generation time is extremely slow (often taking several minutes for a 5-second clip) and API cost calculations are undisclosed.",
        limitations: [
          "Currently in private beta; access is highly restricted",
          "High latency: generation times are slow",
          "Undisclosed pricing model makes production planning difficult"
        ],
        sources: [
          { title: "OpenAI Sora API Docs", url: "https://platform.openai.com/docs/guides/sora" },
          { title: "Developer Beta Program Signup", url: "https://openai.com/sora/signup" }
        ]
      },
      {
        id: "3",
        title: "AGI Declared by Stealth Startup 'NextMind' Using 10-Qubit Chip",
        summary: "Stealth startup NextMind posted a viral video claiming to have achieved AGI (Artificial General Intelligence) running on a proprietary 10-qubit silicon quantum chip. They claim the agent successfully coded a full operating system in 60 seconds.",
        credibility_rating: "Debunked",
        evaluation: "Debunked",
        verification_details: "Our investigation reveals that 'NextMind' is not registered as a corporation in any jurisdiction. Quantum physics experts state that 10 qubits are mathematically incapable of executing standard neural networks, let alone AGI. The video was proven to be a screen capture of a human typing in VS Code, sped up.",
        source_credibility: "Social media rumor, zero academic backing",
        hype_level: "High",
        skepticism_details: "A clear marketing scam. The video contains pre-fabricated UI components and standard LLM text completions. There is no public code, paper, or physical chip address.",
        limitations: [
          "Entire claim is fabricated",
          "Violates physical principles of current quantum scale limits",
          "No reproducible artifacts or verification endpoints"
        ],
        sources: [
          { title: "Hacker News Critical Discussion", url: "https://news.ycombinator.com/item?id=8888" },
          { title: "Quantum Computing Physics Critique", url: "https://x.com/quantum_phys/status/9999" }
        ]
      }
    ],
    agent_logs: {
      scout: [
        "[09:00:01] Scout Agent initialized: Scanning AI feeds...",
        "[09:00:03] Searching query: 'latest artificial intelligence news releases' via search tool...",
        "[09:00:08] Found 14 results. Extracting DeepSeek, Sora API, and NextMind claims.",
        "[09:00:10] Filtering duplicate links. 3 distinct trends extracted and sent to Fact-Checker."
      ],
      verifier: [
        "[09:00:11] Verifier Agent initialized: fact-checking 3 trends.",
        "[09:00:13] Checking Trend 1: DeepSeek-V3. Searching primary sources...",
        "[09:00:18] Verified. Found open-source repository active with code and model weights.",
        "[09:00:20] Checking Trend 2: Sora API. Verified. Found official platform docs.",
        "[09:00:25] Checking Trend 3: NextMind AGI. Debunked. No official registration; quantum hardware claims physically impossible."
      ],
      critic: [
        "[09:00:26] Critic Agent initialized: assessing hype and limitations.",
        "[09:00:28] DeepSeek-V3 Critic: Hype level Medium. Note local hosting requires extreme server hardware.",
        "[09:00:32] Sora API Critic: Hype level High. High latency and slow render speeds hide under the glossy marketing.",
        "[09:00:37] NextMind Critic: Hype level High. Complete scam; no proof of concept, pre-rendered video."
      ],
      synthesizer: [
        "[09:00:39] Synthesizer Agent initialized: drafting daily AI digest.",
        "[09:00:41] Applying algorithm: DeepSeek -> Verified, Sora -> Caution, NextMind -> Debunked.",
        "[09:00:44] Saved today's news report successfully."
      ]
    }
  },
  "2026-05-22": {
    date: "2026-05-22",
    status: "success",
    summary: "Yesterday saw updates from Google on Imagen 3 API availability and Anthropic's new desktop application.",
    articles: [
      {
        id: "1",
        title: "Google Imagen 3 API Generally Available",
        summary: "Google has announced general availability of its high-quality text-to-image generation model Imagen 3 via Vertex AI, featuring improved prompt fidelity and text rendering.",
        credibility_rating: "Verified",
        evaluation: "Verified",
        verification_details: "Verified through Google Cloud's official developer console updates and documentation.",
        source_credibility: "Primary (Google Cloud Platform Docs)",
        hype_level: "Low",
        skepticism_details: "Google's release is fully operational and available to billing accounts. The safety filters are highly restrictive, which sometimes flags innocent prompts.",
        limitations: [
          "Highly restrictive safety filters",
          "Pay-per-token API model"
        ],
        sources: [
          { title: "Google Vertex AI Imagen 3 docs", url: "https://cloud.google.com/vertex-ai/docs/generative-ai/image/generate-images" }
        ]
      },
      {
        id: "2",
        title: "Anthropic Claude Desktop Application Released",
        summary: "Anthropic launched a desktop version of Claude for macOS and Windows, enabling deeper keyboard shortcut integrations and file analysis workflows directly from the OS.",
        credibility_rating: "Verified",
        evaluation: "Verified",
        verification_details: "Verified via official Anthropic website downloads and active user reviews.",
        source_credibility: "Primary (Official Download Links)",
        hype_level: "Low",
        skepticism_details: "The app is a packaged electron wrapper around the web interface, rather than a native desktop interface.",
        limitations: [
          "It is an Electron wrapper, using more memory than a native app",
          "Advanced system integrations are still in early stages"
        ],
        sources: [
          { title: "Claude Desktop Download Page", url: "https://anthropic.com/claude/desktop" }
        ]
      }
    ],
    agent_logs: {
      scout: [
        "[09:00:02] Scanning web for news...",
        "[09:00:06] Discovered Google Imagen 3 API release and Anthropic Desktop client."
      ],
      verifier: [
        "[09:00:08] Verified both Google Cloud API and Anthropic announcements."
      ],
      critic: [
        "[09:00:10] Notes: Claude desktop is Electron; Google safety filters remain highly restrictive."
      ],
      synthesizer: [
        "[09:00:12] Saved daily digest report."
      ]
    }
  }
};

function App() {
  const [summaryList, setSummaryList] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [report, setReport] = useState(null);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("articles"); // "articles" | "logs"
  const [activeConsoleTab, setActiveConsoleTab] = useState("scout"); // "scout" | "verifier" | "critic" | "synthesizer"
  const [showModal, setShowModal] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    // Attempt to load live data generated by python pipeline
    fetch('/data/summary.json')
      .then(res => {
        if (!res.ok) throw new Error("No live summary data");
        return res.json();
      })
      .then(data => {
        if (data.length === 0) throw new Error("Empty summary data");
        setSummaryList(data);
        setSelectedDate(data[0].date);
        setUsingMockData(false);
      })
      .catch(err => {
        console.warn("Live data not found, loading demo mock datasets...", err);
        setSummaryList(MOCK_SUMMARY);
        setSelectedDate(MOCK_SUMMARY[0].date);
        setUsingMockData(true);
      });
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    if (usingMockData) {
      setReport(MOCK_REPORTS[selectedDate]);
      setExpandedArticle(null);
      return;
    }

    // Load active daily report
    fetch(`/data/daily_reports/${selectedDate}.json`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load report");
        return res.json();
      })
      .then(data => {
        setReport(data);
        setExpandedArticle(null);
      })
      .catch(err => {
        console.error("Error loading daily report, falling back to mock:", err);
        setReport(MOCK_REPORTS[selectedDate] || null);
      });
  }, [selectedDate, usingMockData]);

  const toggleArticle = (id) => {
    if (expandedArticle === id) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(id);
    }
  };

  const runSchedulerTutorial = () => {
    setShowModal(true);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar" aria-label="Daily Runs Selection">
        <div className="logo-section">
          <div className="logo-icon">S</div>
          <span className="logo-text">Sentinel AI</span>
        </div>

        <div className="run-list-section">
          <h2 className="section-title">Daily Verification Runs</h2>
          {summaryList.map((item) => (
            <button
              key={item.date}
              id={`run-btn-${item.date}`}
              className={`run-item ${selectedDate === item.date ? 'active' : ''}`}
              onClick={() => setSelectedDate(item.date)}
            >
              <div className="run-date">
                {item.date}
                <span className={`run-status-dot ${item.status}`}></span>
              </div>
              <p className="run-summary-snippet">{item.summary}</p>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="scheduler-badge">
            <span>⏱️ Cron: 9:00 PM Daily</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-panel">
        <header className="header">
          <div className="header-title-area">
            <h1>Daily AI Fact & Hype Sentinel</h1>
            <p className="header-subtitle">
              {usingMockData 
                ? "⚠️ Running in Demo Mode (Local data files not found yet)"
                : `Active Report for ${selectedDate}`
              }
            </p>
          </div>
          <div className="header-actions">
            <button 
              id="btn-actions-guide" 
              className="btn btn-primary"
              onClick={runSchedulerTutorial}
            >
              ⚡ Setup Daily Job
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          {report ? (
            <>
              {/* Daily Overview */}
              <div className="daily-summary-card">
                <h2 className="daily-summary-title">Today's AI Landscape Summary</h2>
                <p className="daily-summary-text">{report.summary}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="tabs" aria-label="Report Views">
                <button
                  id="tab-news-feed"
                  className={`tab ${activeTab === 'articles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('articles')}
                >
                  📰 Verified Feed ({report.articles?.length || 0})
                </button>
                <button
                  id="tab-agent-logs"
                  className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('logs')}
                >
                  💻 Agent Console Logs
                </button>
              </nav>

              {/* Verified Articles Tab */}
              {activeTab === 'articles' && (
                <div className="articles-list">
                  {report.articles?.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <p className="empty-text">No articles were indexed by the Scout agent for this run.</p>
                    </div>
                  ) : (
                    report.articles?.map((article) => (
                      <article 
                        key={article.id} 
                        className="article-card"
                        onClick={() => toggleArticle(article.id)}
                      >
                        <header className="article-card-header">
                          <h3 className="article-title">{article.title}</h3>
                          <div className="badges">
                            <span className={`badge badge-${article.credibility_rating?.toLowerCase().replace(' (hype)', '').replace(' / ', '-')}`}>
                              {article.credibility_rating}
                            </span>
                            {article.hype_level && (
                              <span className={`badge badge-hype-${article.hype_level.toLowerCase()}`}>
                                Hype: {article.hype_level}
                              </span>
                            )}
                          </div>
                        </header>

                        <p className="article-summary">{article.summary}</p>
                        
                        <div style={{fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '500'}}>
                          {expandedArticle === article.id ? '▲ Click to Collapse Analysis' : '▼ Click to Expand Verification Details'}
                        </div>

                        {/* Accordion Detail Grid */}
                        {expandedArticle === article.id && (
                          <div className="article-detail-grid" onClick={(e) => e.stopPropagation()}>
                            <div className="detail-column">
                              <h4 className="column-title verified-title">🔎 Verification Report</h4>
                              <div className="detail-box">
                                <p style={{marginBottom: '10px'}}><strong>Source Credibility:</strong> {article.source_credibility}</p>
                                <p>{article.verification_details}</p>
                              </div>
                              <div className="detail-box">
                                <p style={{fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)'}}>Verified Citations:</p>
                                {article.sources?.map((src, idx) => (
                                  <a 
                                    key={idx} 
                                    href={src.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="source-item"
                                  >
                                    🔗 {src.title || src.url}
                                  </a>
                                ))}
                              </div>
                            </div>

                            <div className="detail-column">
                              <h4 className="column-title skeptic-title">⚖️ Devil's Advocate / Hype Critic</h4>
                              <div className="detail-box">
                                <p>{article.skepticism_details}</p>
                              </div>
                              {article.limitations && article.limitations.length > 0 && (
                                <div className="detail-box">
                                  <p style={{fontWeight: '600', color: 'var(--text-primary)'}}>Limitations & Warnings:</p>
                                  <ul className="limitations-list">
                                    {article.limitations.map((limit, idx) => (
                                      <li key={idx}>{limit}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </div>
              )}

              {/* Agent Console Logs Tab */}
              {activeTab === 'logs' && (
                <div className="console-container">
                  <div className="console-tabs" role="tablist" aria-label="Agent Logs">
                    {Object.keys(report.agent_logs || {}).map((agent) => (
                      <button
                        key={agent}
                        className={`console-tab ${activeConsoleTab === agent ? `active ${agent}` : ''}`}
                        onClick={() => setActiveConsoleTab(agent)}
                        role="tab"
                        aria-selected={activeConsoleTab === agent}
                      >
                        {agent.toUpperCase()} AGENT
                      </button>
                    ))}
                  </div>
                  <div className="console-output" aria-live="polite">
                    {report.agent_logs?.[activeConsoleTab]?.map((line, idx) => (
                      <div key={idx} className={`console-line ${activeConsoleTab}`}>
                        {line}
                      </div>
                    ))}
                    {(!report.agent_logs?.[activeConsoleTab] || report.agent_logs[activeConsoleTab].length === 0) && (
                      <div className="console-line">No console trace available for this agent.</div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📂</span>
              <p className="empty-text">Loading report data...</p>
            </div>
          )}
        </section>
      </main>

      {/* Cloud Deploy Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2 className="modal-title">⚡ Setup Daily Cloud Runner</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px'}}>
              To run the news aggregation and fact-checking automatically every day at <strong>9:00 PM</strong> (even with your laptop turned off), push this codebase to a GitHub repository and configure your secrets.
            </p>
            
            <h3 style={{fontSize: '14px', marginBottom: '8px'}}>1. Add GitHub Repository Secrets:</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px'}}>
              Go to your GitHub repo Settings &gt; Secrets and variables &gt; Actions and create:
            </p>
            <ul style={{paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '16px'}}>
              <li><code>GEMINI_API_KEY</code>: Your Gemini API Key from Google AI Studio.</li>
              <li><code>TAVILY_API_KEY</code> (Optional): Your Tavily Search key (if not provided, it defaults to DuckDuckGo search automatically).</li>
            </ul>

            <h3 style={{fontSize: '14px', marginBottom: '8px'}}>2. Push to GitHub:</h3>
            <div className="modal-code">
              git init<br />
              git add .<br />
              git commit -m "feat: init sentinel AI aggregator"<br />
              git remote add origin https://github.com/yourusername/your-repo.git<br />
              git branch -M main<br />
              git push -u origin main
            </div>
            
            <p style={{color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center'}}>
              The GitHub Action will build your frontend and publish it to GitHub Pages. It will run daily at 9:00 PM (15:30 UTC).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
