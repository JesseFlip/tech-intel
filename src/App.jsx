import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Info,
  BookOpen,
  Server,
  Scale,
  Rocket,
  AlertTriangle,
  FileWarning
} from 'lucide-react';

const GLOSSARY = {
  "zero-days": "A software vulnerability unknown to the vendor. Attackers have 'zero days' to fix it before it can be exploited.",
  "RCE": "Remote Code Execution: An attacker's ability to run arbitrary malicious software on a target machine over a network.",
  "CVSS": "Common Vulnerability Scoring System: A free and open industry standard for assessing the severity of computer system security vulnerabilities.",
  "buffer overflow": "An anomaly where a program, while writing data to a buffer, overruns the buffer's boundary and overwrites adjacent memory.",
  "KEV": "Known Exploited Vulnerabilities catalog: A list maintained by CISA of vulnerabilities that are actively being exploited in the wild.",
  "OT networks": "Operational Technology networks: Hardware and software that detects or causes a change through the direct monitoring and/or control of physical devices (e.g., power grids, factories).",
  "RAT": "Remote Access Trojan: Malware designed to allow an attacker to remotely control an infected computer.",
  "rootkit": "A collection of computer software, typically malicious, designed to enable access to a computer or an area of its software that is not otherwise allowed."
};

const aiData = [
  {
    id: "ai-1",
    title: "Anthropic's Mythos Dominates",
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    summary: "Anthropic gave tech giants early access to Claude Mythos Preview via Project Glasswing, reshaping US tech policy.",
    bullets: [
      "Partners: AWS, Apple, Cisco, Google, JPMorgan, and Microsoft.",
      "Identified thousands of zero-days across major OS and browsers in weeks of internal testing.",
      "Found a <Term>27-year-old bug in OpenBSD</Term>.",
      "This single launch is the primary driver for massive new US tech policy shifts."
    ]
  },
  {
    id: "ai-2",
    title: "Regulation Pivot",
    icon: <Scale className="w-5 h-5 text-purple-400" />,
    summary: "The White House is drafting an FDA-style vetting process for new AI models.",
    bullets: [
      "NEC Director Kevin Hassett announced the executive order on May 7.",
      "Direct response to Mythos's vulnerability-finding capabilities.",
      "Commerce expanded voluntary testing to include Google, Microsoft, xAI, OpenAI, and Anthropic.",
      "Sanders and AOC introduced an AI Data Center Moratorium Act citing skyrocketing power costs."
    ]
  },
  {
    id: "ai-3",
    title: "Anthropic Business Moves",
    icon: <Rocket className="w-5 h-5 text-purple-400" />,
    summary: "Anthropic crosses OpenAI in revenue amidst major capacity and API upgrades.",
    bullets: [
      "Claude Code 5-hour rate limits doubled (Pro, Max, Team, Enterprise) on May 7.",
      "Peak-hour restrictions removed for Pro/Max; Opus API limits raised significantly.",
      "SpaceX Colossus One partnership added 300+ MW capacity (~220,000 GPUs equivalent).",
      "Rumors circulating about a proactive Cowork assistant called 'Orbit' integrating with Gmail, Slack, GitHub, Drive, Figma."
    ]
  },
  {
    id: "ai-4",
    title: "Model & Product Launches",
    icon: <Server className="w-5 h-5 text-purple-400" />,
    summary: "A flurry of releases from OpenAI, Google, Meta, and Apple.",
    bullets: [
      "OpenAI shipped GPT-Realtime-2, GPT-Realtime-Translate (70+ langs), and GPT-Realtime-Whisper.",
      "Google rolled out Multi-Token Prediction for Gemma 4 (~3x faster) and NotebookLM Mind Maps.",
      "Subquadratic launched SubQ, a massive 12M-token-context model.",
      "Meta unveiled a mid-size model and announced $115–135B in 2026 AI capex.",
      "Apple reportedly building 'Extensions' for iOS 27 to plug in 3rd-party AI (including Anthropic)."
    ]
  },
  {
    id: "ai-5",
    title: "Liability is Showing Up",
    icon: <FileWarning className="w-5 h-5 text-purple-400" />,
    summary: "Courts are beginning to hold AI platforms and users accountable for AI-generated actions.",
    bullets: [
      "Pennsylvania sued Character.AI after chatbot 'Emilie' posed as a licensed psychiatrist with a fake license number.",
      "Northern District of CA ruled platforms can be liable under Rule 10b-5 if AI has 'ultimate authority' over ad content (exposure for Meta, Google, Snap, TikTok, X).",
      "Nebraska Supreme Court suspended an attorney for 57 defective citations, including 20 AI hallucinations."
    ]
  }
];

const cyberData = [
  {
    id: "cy-1",
    title: "The Canvas/Instructure Breach",
    icon: <Target className="w-5 h-5 text-red-400" />,
    summary: "ShinyHunters exfiltrated terabytes of data from the massive education platform.",
    bullets: [
      "Announced May 1; deadline set for May 7 full public leak.",
      "Impacts 275 million users across nearly 9,000 educational institutions.",
      "NUS and many others confirmed affected."
    ]
  },
  {
    id: "cy-2",
    title: "Other ShinyHunters Hits",
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
    summary: "The ransomware group is having a highly active month.",
    bullets: [
      "Cushman & Wakefield (500K+ Salesforce records).",
      "NVIDIA GeForce NOW Armenian alliance partner.",
      "Medtronic.",
      "Pathstone Family Office."
    ]
  },
  {
    id: "cy-3",
    title: "Critical Vulnerabilities to Know",
    icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    summary: "Multiple high-severity CVEs actively exploited in the wild.",
    bullets: [
      "CVE-2026-0300 (CVSS 9.3) — Buffer overflow in Palo Alto PAN-OS User-ID Auth Portal. Unauthenticated RCE as root. Mitigate: restrict access/disable portal.",
      "CVE-2026-32201 — SharePoint zero-day, RCE, actively exploited.",
      "CVE-2026-6973 (CVSS 7.2) — Ivanti EPMM, authenticated RCE, limited exploitation.",
      "CVE-2026-23918 (CVSS 8.8) — HTTP/2 double-free / possible RCE.",
      "cPanel zero-day — Used against Government of Guam websites."
    ]
  },
  {
    id: "cy-4",
    title: "Policy Shift Driven by AI",
    icon: <Scale className="w-5 h-5 text-red-400" />,
    summary: "CISA drastically reduces patching timelines due to AI-powered offensive capabilities.",
    bullets: [
      "CISA weighing cutting KEV remediation deadlines for federal agencies from 2–3 weeks down to 3 days.",
      "Explicitly driven by capabilities of Anthropic's Mythos and OpenAI's GPT-5.4-Cyber.",
      "CISA released 'CI Fortify' guidance telling OT operators to assume actors are already inside and plan for weeks of isolated operation."
    ]
  },
  {
    id: "cy-5",
    title: "AI on the Offense",
    icon: <Cpu className="w-5 h-5 text-red-400" />,
    summary: "Attackers are weaponizing AI to compress exploitation timelines.",
    bullets: [
      "Hexstrike-AI (former defensive tool) repurposed to compress edge-device exploitation from days to <10 minutes (automated generation, testing, backdoor).",
      "PCPJack: New credential-theft framework targeting cloud accounts.",
      "Quasar Linux (QLNX): Modular RAT with a rootkit making the rounds.",
      "Ukrainian police dismantled a Roblox account-hijacking ring (610K accounts, ~$225K profits)."
    ]
  }
];

const InteractiveTerm = ({ text, termKey }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <span 
      className="relative inline-block border-b-2 border-dashed border-cyan-500 text-cyan-300 cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      {text}
      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 text-sm bg-slate-800 text-slate-200 border border-slate-600 rounded-lg shadow-xl">
          <div className="font-bold text-cyan-400 mb-1">{termKey}</div>
          {GLOSSARY[termKey]}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </span>
  );
};

const parseText = (text) => {
  let parsedElements = [text];
  
  Object.keys(GLOSSARY).forEach(term => {
    // Regex to match term case-insensitively, avoiding replacing inside HTML tags
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    
    parsedElements = parsedElements.flatMap(element => {
      if (typeof element !== 'string') return [element];
      
      const parts = element.split(regex);
      return parts.map((part, i) => {
        if (part.toLowerCase() === term.toLowerCase()) {
          return <InteractiveTerm key={`${term}-${i}`} text={part} termKey={term} />;
        }
        return part;
      });
    });
  });
  
  // Also handle explicit <Term> tags from data
  parsedElements = parsedElements.flatMap(element => {
      if (typeof element !== 'string') return [element];
      const parts = element.split(/<Term>(.*?)<\/Term>/g);
      return parts.map((part, i) => {
          if (i % 2 === 1) {
             return <span key={`highlight-${i}`} className="text-amber-300 font-medium">{part}</span>;
          }
          return part;
      })
  })

  return parsedElements;
};

const InfoCard = ({ item, colorTheme, onReadToggle, isRead }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const themeColors = colorTheme === 'purple' 
    ? 'border-purple-500/30 bg-purple-900/10 hover:border-purple-500/60' 
    : 'border-red-500/30 bg-red-900/10 hover:border-red-500/60';

  const checkColor = colorTheme === 'purple' ? 'text-purple-400' : 'text-red-400';

  return (
    <div className={`mb-4 rounded-xl border transition-all duration-300 ${themeColors} ${isExpanded ? 'shadow-lg shadow-black/50' : ''}`}>
      <div 
        className="p-5 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
            {item.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
              {item.title}
              {isRead && <CheckCircle2 className={`w-4 h-4 ${checkColor}`} />}
            </h3>
            <p className="text-slate-400 text-sm mt-1">{item.summary}</p>
          </div>
        </div>
        <div className="text-slate-500 ml-4">
          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-700/50 mt-2">
          <ul className="space-y-3 mt-3">
            {item.bullets.map((bullet, idx) => (
              <li key={idx} className="flex gap-3 text-slate-300 leading-relaxed">
                <span className="text-slate-600 mt-1.5">•</span>
                <span>{parseText(bullet)}</span>
              </li>
            ))}
          </ul>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onReadToggle(item.id); }}
            className={`mt-6 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors
              ${isRead 
                ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' 
                : 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 hover:bg-cyan-800/50'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isRead ? 'Marked as Read' : 'Mark as Read'}
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('ai');
  const [readItems, setReadItems] = useState(new Set());

  const toggleReadStatus = (id) => {
    const newRead = new Set(readItems);
    if (newRead.has(id)) {
      newRead.delete(id);
    } else {
      newRead.add(id);
    }
    setReadItems(newRead);
  };

  const totalItems = aiData.length + cyberData.length;
  const progress = Math.round((readItems.size / totalItems) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-100 pb-20">
      
      {/* Header & Progress */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              Tech Intel Recap
            </h1>
            <p className="text-slate-400 text-sm font-medium">May 1–10, 2026</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-mono text-cyan-400">{progress}% Complete</span>
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-6 border-t border-slate-800/50 pt-2">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'ai' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Cpu className="w-4 h-4" /> Artificial Intelligence
          </button>
          <button 
            onClick={() => setActiveTab('cyber')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'cyber' ? 'border-red-500 text-red-300' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Cybersecurity
          </button>
          <button 
            onClick={() => setActiveTab('takeaways')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'takeaways' ? 'border-emerald-500 text-emerald-300' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Career Takeaways
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Helper text for tooltips */}
        {(activeTab === 'ai' || activeTab === 'cyber') && (
          <div className="mb-6 flex items-center gap-2 text-sm text-cyan-400/80 bg-cyan-950/30 p-3 rounded-lg border border-cyan-900/50">
            <Info className="w-4 h-4" />
            <span>Interactive: Click or hover over dashed terms (like <InteractiveTerm text="zero-days" termKey="zero-days" />) for Security+ definitions.</span>
          </div>
        )}

        {/* AI Tab Content */}
        {activeTab === 'ai' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {aiData.map(item => (
              <InfoCard 
                key={item.id} 
                item={item} 
                colorTheme="purple" 
                isRead={readItems.has(item.id)}
                onReadToggle={toggleReadStatus}
              />
            ))}
          </div>
        )}

        {/* Cyber Tab Content */}
        {activeTab === 'cyber' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {cyberData.map(item => (
              <InfoCard 
                key={item.id} 
                item={item} 
                colorTheme="red" 
                isRead={readItems.has(item.id)}
                onReadToggle={toggleReadStatus}
              />
            ))}
            
            {/* Extra note card for cyber */}
            <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex gap-4">
               <Info className="w-6 h-6 text-slate-400 shrink-0" />
               <div className="text-sm text-slate-300">
                 <strong className="text-slate-200 block mb-1">Other notable events:</strong>
                 OpenAI is previewing a vulnerability-finding model to limited partners (mirroring Mythos). NordPass confirmed '123456' remains the world's most common password. Q1 2026 ransomware was down 15% YoY, though healthcare remains the #1 target.
               </div>
            </div>
          </div>
        )}

        {/* Takeaways Content */}
        {activeTab === 'takeaways' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <div className="p-8 rounded-2xl border border-emerald-900/50 bg-gradient-to-br from-slate-900 to-emerald-950/20">
              <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-3 mb-4">
                <Target className="w-7 h-7" /> The Big Picture
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                The throughline this month is undeniable: <strong className="text-white">AI is now simultaneously the most consequential offensive cybersecurity tool and the trigger for the biggest US tech regulatory move in years.</strong>
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900">
              <h3 className="text-xl font-bold text-slate-200 flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-cyan-400" /> Security+ & Per Scholas Prep
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                As you prepare for your certifications and interviews, tracking these dual trends is critical. Interviewers want to see that you understand the <em>context</em> of threats, not just the definitions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-semibold text-cyan-300 mb-2">Key Talking Point 1: Automation</h4>
                  <p className="text-sm text-slate-400">
                    Use <strong>Hexstrike-AI</strong> or <strong>Mythos</strong> as examples of how threat actors and defenders are automating vulnerability discovery and exploitation, compressing the attack chain from days to minutes.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-semibold text-cyan-300 mb-2">Key Talking Point 2: Compliance</h4>
                  <p className="text-sm text-slate-400">
                    Mention CISA cutting the <strong>KEV deadlines</strong> to 3 days. It shows you understand that governance, risk, and compliance (GRC) policies actively change in response to new technical threats.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
