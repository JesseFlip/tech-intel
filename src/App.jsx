import { useState } from 'react';

// Custom Inline SVG Icons for clean rendering and reliability
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DocumentReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm10-10a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm-4 10a1 1 0 011 1v3a1 1 0 01-1 1H9a1 1 0 01-1-1v-3a1 1 0 011-1h2z" clipRule="evenodd" />
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('anatomy');
  const [currentStep, setCurrentStep] = useState('intro');
  const [interviewed, setInterviewed] = useState({ fixedIncome: false, policy: false, credit: false, internals: false });
  const [selectedInsights, setSelectedInsights] = useState({ fixedIncome: '', policy: '', credit: '', internals: '' });
  const [selectedSynthesis, setSelectedSynthesis] = useState(null);
  const [simScore, setSimScore] = useState(null);

  const macroDesks = {
    fixedIncome: {
      name: "Rates & Yield Curve Desk",
      role: "10-Year Treasury Analytics",
      focus: "The Risk-Free Rate Matrix",
      avatar: "📈",
      quote: "The 10-Year yield is rising sharply. This is the single most important variable in finance—it prices every asset globally. When this number rips, long-duration assets like growth tech and real estate will face an immediate valuation headwind.",
      insights: [
        { id: 'fi-headwind', text: "10Y Yield Spiking: Heavy immediate valuation pressure on long-duration tech equity allocations.", impact: "Macro Headwind (Recommended)" },
        { id: 'fi-noise', text: "10Y Yield Ripples: Treat daily yield moves as isolated broadcast noise with no structural impact.", impact: "Underestimates systemic risk" }
      ]
    },
    policy: {
      name: "Fed Expectations & Liquidity Desk",
      role: "Implied Probability Analytics",
      focus: "CME FedWatch Tracking",
      avatar: "🏛️",
      quote: "Do not get trapped listening to what the Fed *did* yesterday. Focus entirely on what the market *expects* them to do at the next meetings. A sudden hot CPI/PCE print is pushing out cut expectations, setting up a hawkish shock.",
      insights: [
        { id: 'pol-shock', text: "Hawkish Surprise: The market is pricing in too many cuts; expectations must adjust downwards.", impact: "Liquidity Drag (Recommended)" },
        { id: 'pol-lag', text: "Historical Anchoring: Base current positioning entirely on the Fed's historical dot plot maps.", impact: "Recency Bias Trap" }
      ]
    },
    credit: {
      name: "Credit Spreads & Dollar Desk",
      role: "Systemic Risk Analytics",
      focus: "DXY & HYG vs. Treasuries Matrix",
      avatar: "🎛️",
      quote: "The bond market always sniffs out structural trouble before equities do. The US Dollar (DXY) is building a technical breakout and high-yield credit spreads are widening. This combination is a classic warning shot for equity correction.",
      insights: [
        { id: 'cr-widen', text: "Spreads Widening & DXY Breaking Out: Defensive risk-off warnings are flashing ahead of equities.", impact: "Systemic Risk Present (Recommended)" },
        { id: 'cr-tight', text: "Isolated Currency Strength: The strong dollar will remain localized without affecting multi-asset liquidity.", impact: "Lacks cross-border synergy" }
      ]
    },
    internals: {
      name: "Corporate Internals Desk",
      role: "Fundamental Metrics Analysis",
      focus: "Guidance Cuts & Corporate Insiders",
      avatar: "🛡️",
      quote: "During earnings season, look past simple backward-looking beats. Broad guidance cuts and dense cluster selling on OpenInsider tell you the real narrative. Raised guidance paired with strong underlying market breadth is the only valid green light.",
      insights: [
        { id: 'int-guidance', text: "Forward Guidance Matters: Track corporate forward revisions and executive clusters over backward-looking prints.", impact: "Forward Guidance Realism (Recommended)" },
        { id: 'int-eps', text: "Headline EPS Tracking: Focus positioning on standard historical consensus beats regardless of guidance revisions.", impact: "Backward-looking Trap" }
      ]
    }
  };

  const synthesisOptions = [
    {
      id: 'synth-noise',
      title: "The Broadcast Anchor Approach",
      text: "React immediately to every morning headline. Treat the daily movements of individual equities as isolated events, maximize position sizes up to 25% to capture alpha, and ignore the 10-Year yield as background noise.",
      coherence: "Dangerous",
      explanation: "This is financial entertainment, not professional positioning. Large sizing risks catastrophic loss, and ignoring the risk-free rate leaves you totally blind to systemic asset repricing.",
      score: 30
    },
    {
      id: 'synth-thesis',
      title: "The Macro-Structured Matrix",
      text: "Perform a 20-second daily weather check (10Y Yield, VIX, S&P Futures). Build high-conviction asymmetric entries with strict 1-5% sizing rules. Write out a clear 3-sentence thesis before buying and exit immediately if that macro thesis breaks.",
      coherence: "Excellent",
      explanation: "This is how the game is played. It filters out broadcast noise, establishes disciplined risk parameters, tracks the true pricing variables (the Fed and rates), and protects capital against behavioral traps.",
      score: 100
    }
  ];

  const handleInterview = (key) => setInterviewed(prev => ({ ...prev, [key]: true }));
  const handleSelectInsight = (key, text) => setSelectedInsights(prev => ({ ...prev, [key]: text }));
  const allInterviewed = Object.values(interviewed).every(v => v === true);
  const allInsightsSelected = Object.values(selectedInsights).every(v => v !== '');

  const handlePublish = () => {
    if (!selectedSynthesis) return;
    setSimScore(selectedSynthesis.score);
    setCurrentStep('review');
  };

  const resetSimulation = () => {
    setCurrentStep('intro');
    setInterviewed({ fixedIncome: false, policy: false, credit: false, internals: false });
    setSelectedInsights({ fixedIncome: '', policy: '', credit: '', internals: '' });
    setSelectedSynthesis(null);
    setSimScore(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                MACRO INTEL RECAP
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">Grounded Intelligence</span>
              </h1>
              <p className="text-xs text-slate-400">Filtering the Broadcast Noise. Updating the Variables That Actually Price the Market.</p>
            </div>
          </div>
          
          <nav className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setActiveTab('anatomy')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'anatomy' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><BookOpenIcon />The Macro Stack</button>
            <button onClick={() => setActiveTab('roles')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'roles' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><UsersIcon />Conditions & Vectors</button>
            <button onClick={() => setActiveTab('simulator')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'simulator' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><DocumentReportIcon />Weekly Run Sim</button>
            <button onClick={() => setActiveTab('quiz')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'quiz' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><AcademicCapIcon />Execution Protocols</button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: THE MACRO STACK */}
        {activeTab === 'anatomy' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950 border border-indigo-800/50 px-2.5 py-1 rounded-full">Core Weather Check</span>
              <h2 className="text-2xl font-extrabold mt-3 text-white">The 20-Second Daily Routine</h2>
              <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                Most of what is broadcast on morning financial media is pure noise designed to fill airtime. The pros aren't reacting to every flashing headline—they are checking a small set of foundational variables to evaluate system pricing.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800"><strong>1. 10-Year Yield (US10Y)</strong> <span className="block text-slate-400 mt-1">The critical global risk-free rate matrix.</span></div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800"><strong>2. The VIX Index</strong> <span className="block text-slate-400 mt-1">Fear gauge: Complacency (&lt;15) vs. Panic (&gt;35).</span></div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800"><strong>3. S&P Futures (ES=F)</strong> <span className="block text-slate-400 mt-1">Frontline baseline equity sentiment tracker.</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-3">Downstream Valuation Mechanics</h3>
                <ul className="space-y-3 text-xs text-slate-400">
                  <li>• <strong className="text-slate-200">The Ultimate Core Anchor:</strong> The Fed and interest rates form the dominant market force. All corporate metrics flow downstream from here.</li>
                  <li>• <strong className="text-slate-200">Inflation Revisions:</strong> Monitor CPI (mid-month) and PCE (end-of-month). Hotter prints sustain higher rates, placing automatic downward pressure on multiples.</li>
                  <li>• <strong className="text-slate-200">The Employment Paradox:</strong> Counterintuitively, over-performing jobs prints frequently threaten equities because they reinforce a hawkish, restrictive central bank posture.</li>
                </ul>
              </div>
              <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-3">Systemic Airtime Traps</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Morning commentators, network anchors, and heavy money managers are primarily engaged in entertainment or talking up their existing book positions. True edge is achieved by checking your structural variables and remaining completely stationary on your execution strategy when nothing has altered the core macro parameters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONDITIONS & VECTORS */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Market Conditions & Structural Vectors</h2>
              <p className="text-slate-400 text-xs max-w-3xl">Real-time mapping of structural systemic triggers to determine deployment configurations.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/40 p-5 rounded-xl border border-rose-950/40 space-y-3">
                <h3 className="text-sm font-bold text-rose-400 tracking-wide uppercase flex items-center gap-2">🚨 Red Flags (Threat Triggers)</h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li>• <strong>Yield Curve Inversion:</strong> 2-Year yields trading above 10-Year yields—classic bond market structural warning.</li>
                  <li>• <strong>Credit Spread Widening:</strong> The corporate credit pipeline widening out over Treasuries, sniffing trouble before equity markets react.</li>
                  <li>• <strong>Hawkish Guidance Cuts:</strong> Earnings windows characterized by broad corporate forward guidance downgrades rather than isolated backward-looking misses.</li>
                  <li>• <strong>Valuation Handwaving:</strong> Heavy clusters of insider liquidations alongside market commentary claiming "this time is different".</li>
                </ul>
              </div>
              <div className="bg-slate-950/40 p-5 rounded-xl border border-emerald-950/40 space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 tracking-wide uppercase flex items-center gap-2">🟢 Green Lights (Tailwind Triggers)</h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li>• <strong>Dovish Policy Revisions:</strong> Central bank language softening alongside downward adjustments to macro dot-plot tracks.</li>
                  <li>• <strong>The Magic Combo:</strong> Corporate earnings prints featuring clean beats explicitly paired with *raised* forward guidance.</li>
                  <li>• <strong>Expanding Market Breadth:</strong> Equity index advances supported by a wide cross-section of equities rather than few mega-caps.</li>
                  <li>• <strong>Credit Pipeline Compression:</strong> High-yield spreads tightening down concurrently with a dropping, stabilizing VIX configuration.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Systemic Verification Sim</div>
                <h2 className="text-xl font-bold text-white mt-0.5">Filter the Desk Intelligence</h2>
              </div>
              <button onClick={resetSimulation} className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded">Reset Run</button>
            </div>

            {currentStep === 'intro' && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4">
                <h3 className="text-lg font-bold text-white">Initialize Friday Aggregate Synthesis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extract true signals from specialized desks, reconcile structural variations across core assets, and assemble a clean macro positioning thesis before client deployment.
                </p>
                <button onClick={() => setCurrentStep('interview')} className="w-full bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-lg">Begin Analytics Run</button>
              </div>
            )}

            {currentStep === 'interview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(macroDesks).map(([key, data]) => (
                    <div key={key} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{data.name}</h4>
                          <p className="text-xs text-indigo-400 font-semibold">{data.role}</p>
                        </div>
                        {!interviewed[key] ? (
                          <button onClick={() => handleInterview(key)} className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded">Extract Signal</button>
                        ) : (
                          <span className="text-[11px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900">Logged</span>
                        )}
                      </div>
                      {interviewed[key] && (
                        <div className="space-y-3 animate-fadeIn">
                          <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded italic">"{data.quote}"</p>
                          <div className="space-y-1">
                            {data.insights.map((ins) => (
                              <button key={ins.id} onClick={() => handleSelectInsight(key, ins.text)} className={`w-full text-left p-2 rounded text-[11px] border transition ${selectedInsights[key] === ins.text ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-900/40 border-slate-800 text-slate-400'}`}>
                                {ins.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {allInterviewed && allInsightsSelected && (
                  <button onClick={() => setCurrentStep('synthesize')} className="w-full bg-indigo-600 text-white text-xs font-semibold py-3 rounded-xl shadow-lg animate-bounce">Proceed to Unified Thesis Synthesis</button>
                  )}
              </div>
            )}

            {currentStep === 'synthesize' && (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2"><SparklesIcon /> Select Strategic Portfolio Directive</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {synthesisOptions.map((opt) => (
                      <button key={opt.id} onClick={() => setSelectedSynthesis(opt)} className={`text-left p-4 rounded-xl border transition ${selectedSynthesis?.id === opt.id ? 'bg-indigo-950 border-indigo-500 text-indigo-200' : 'bg-slate-900/40 border-slate-850 text-slate-400'}`}>
                        <div className="flex justify-between items-center font-bold text-xs text-white">
                          <span>{opt.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${opt.coherence === 'Excellent' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-rose-950 text-rose-400 border border-rose-900'}`}>{opt.coherence}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">{opt.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handlePublish} disabled={!selectedSynthesis} className={`w-full text-xs font-semibold py-3 rounded-xl ${selectedSynthesis ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Publish Consolidated Intelligence Stance</button>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 max-w-2xl mx-auto space-y-4">
                <div className="text-center">
                  <div className="text-3xl">📡</div>
                  <h3 className="text-lg font-bold text-white mt-1">Stance Transmitted Successfully</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">ALIGNMENT SCORE</span><span className={simScore === 100 ? 'text-emerald-400' : 'text-rose-400'}>{simScore}/100</span></div>
                  <p className="text-xs text-slate-300 mt-1">{selectedSynthesis?.text}</p>
                  <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 bg-slate-950/40 p-2 rounded"><strong>Review Core:</strong> {selectedSynthesis?.explanation}</p>
                </div>
                <button onClick={resetSimulation} className="w-full bg-slate-900 text-slate-300 border border-slate-800 text-xs py-2 rounded-lg">Initialize Fresh Session</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EXECUTION PROTOCOLS */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white">Execution Rules for Going Beyond ETFs Safely</h3>
              <p className="text-xs text-slate-400">When allocating in individual positions within an IRA, deploy the exact tactical logic utilized by professional managers to separate disciplined execution from behavioral gambling.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-850">
                  <strong className="text-indigo-400 block mb-1">1. The 3-Sentence Rule</strong>
                  <span>Write down: "I think X will happen by Y date because Z." If you cannot explicitly put it in writing, you do not have a trade position—you have an unstructured hope.</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-850">
                  <strong className="text-indigo-400 block mb-1">2. Position Sizing Matrix</strong>
                  <span>Keep individual stock positions between 1% and 5% of the total aggregate portfolio max. A 5% loss hurts; a 25% portfolio wipeout alters your lifestyle parameters completely.</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-850">
                  <strong className="text-indigo-400 block mb-1">3. Time Frame Anchoring</strong>
                  <span>Lock down your horizon *before* entry: Day Trade, Swing Trade (weeks), or Long Investment (years). Do not buy an asset as an investment and panic-sell it on a short swing timeline.</span>
                </div>
              </div>
              
              <div className="border-t border-slate-850 pt-4 bg-slate-950 p-4 rounded-lg space-y-2 text-xs">
                <span className="text-amber-400 font-bold block uppercase tracking-wider">⚠️ Critical Behavioral Traps</span>
                <p className="text-slate-400 leading-relaxed">
                  <strong>Never average down on a broken thesis.</strong> Adding capital to losing assets to lower your dollar cost feels rational but is statistically how minor mistakes transform into fatal portfolio-killers. Use strict limit orders on entries, seek out asymmetric profiles (high upside potential vs. tightly limited downside thresholds), and completely eliminate FOMO chasing on vertical extension charts.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-4 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 MACRO INTEL RECAP. Grounded Macro Intelligence Workspace.</p>
      </footer>
    </div>
  );
}
