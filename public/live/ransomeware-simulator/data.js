// ============================================================
// Ransomware Defense Dashboard — Educational Data
// FOR EDUCATIONAL USE ONLY — No encryption or malicious code
// ============================================================

const KILL_CHAIN_STAGES = [
  {
    id: 1,
    name: "Reconnaissance",
    icon: "🔍",
    shortDesc: "Attacker gathers intelligence on the target",
    description: "The attacker researches the target organization, scanning for vulnerabilities, employee information, exposed services, and potential entry points. This may involve passive OSINT (open-source intelligence) or active scanning.",
    techniques: [
      "Phishing email reconnaissance",
      "Port scanning and service enumeration",
      "Social media profiling of employees",
      "Identifying exposed RDP or VPN endpoints",
      "Harvesting email addresses from public sources"
    ],
    mitre: "TA0043 — Reconnaissance",
    defenses: [
      "Minimize public-facing information",
      "Monitor for scanning activity",
      "Implement honeypots and honeytokens",
      "Employee social media awareness training"
    ],
    duration: "Days to weeks",
    riskLevel: "low"
  },
  {
    id: 2,
    name: "Weaponization",
    icon: "⚙️",
    shortDesc: "Attacker creates the malicious payload",
    description: "The attacker builds or acquires the ransomware payload, often customizing it for the specific target. This includes selecting encryption algorithms, designing the ransom note, setting up payment infrastructure, and potentially purchasing ransomware-as-a-service (RaaS) kits.",
    techniques: [
      "Ransomware-as-a-Service (RaaS) kit purchase",
      "Custom payload development",
      "Packer/obfuscation to evade antivirus",
      "Embedding payload in Office macros or PDFs",
      "Setting up cryptocurrency wallets for payment"
    ],
    mitre: "TA0042 — Resource Development",
    defenses: [
      "Threat intelligence feeds",
      "Sandbox analysis of suspicious files",
      "Endpoint Detection and Response (EDR)",
      "Application whitelisting"
    ],
    duration: "Hours to days",
    riskLevel: "medium"
  },
  {
    id: 3,
    name: "Delivery",
    icon: "📧",
    shortDesc: "Payload is transmitted to the target",
    description: "The weaponized payload is delivered to the target through various channels. Phishing emails remain the #1 delivery method, but attackers also exploit exposed RDP, vulnerable web applications, supply chain compromises, and removable media.",
    techniques: [
      "Spear-phishing emails with malicious attachments",
      "Drive-by downloads from compromised websites",
      "Exploiting exposed Remote Desktop Protocol (RDP)",
      "USB drop attacks",
      "Supply chain compromise (e.g., SolarWinds-style)"
    ],
    mitre: "TA0001 — Initial Access",
    defenses: [
      "Email filtering and sandboxing",
      "Disable macros by default",
      "Multi-factor authentication (MFA) on RDP",
      "Web content filtering",
      "USB device policies"
    ],
    duration: "Minutes to hours",
    riskLevel: "high"
  },
  {
    id: 4,
    name: "Exploitation",
    icon: "💥",
    shortDesc: "Vulnerability is exploited to gain access",
    description: "The attacker exploits a vulnerability — either a software flaw, a misconfiguration, or a human error (clicking a phishing link) — to execute the malicious payload on the target system. This is the moment the attacker gains initial code execution.",
    techniques: [
      "User clicks phishing link/opens attachment",
      "Exploiting unpatched software (e.g., EternalBlue)",
      "Credential stuffing on exposed services",
      "Macro execution in Office documents",
      "Exploiting zero-day vulnerabilities"
    ],
    mitre: "TA0002 — Execution",
    defenses: [
      "Regular patching and updates",
      "User security awareness training",
      "Least privilege access controls",
      "Application sandboxing",
      "Vulnerability scanning"
    ],
    duration: "Seconds to minutes",
    riskLevel: "critical"
  },
  {
    id: 5,
    name: "Installation",
    icon: "📦",
    shortDesc: "Malware establishes persistence",
    description: "The ransomware installs itself on the compromised system, establishing persistence mechanisms to survive reboots. It may disable security tools, delete shadow copies, and prepare for lateral movement across the network.",
    techniques: [
      "Registry run key modification",
      "Scheduled task creation",
      "Disabling Windows Defender / antivirus",
      "Deleting Volume Shadow Copies (vssadmin)",
      "Creating new admin accounts"
    ],
    mitre: "TA0003 — Persistence",
    defenses: [
      "Endpoint Detection and Response (EDR)",
      "Protected shadow copies / immutable backups",
      "Monitor registry and scheduled task changes",
      "Behavior-based detection",
      "Restrict administrative privileges"
    ],
    duration: "Seconds to minutes",
    riskLevel: "critical"
  },
  {
    id: 6,
    name: "Command & Control",
    icon: "📡",
    shortDesc: "Attacker establishes remote communication",
    description: "The ransomware establishes a communication channel back to the attacker's infrastructure. This may be used to exfiltrate the encryption key, receive commands, upload stolen data (double extortion), and report infection status.",
    techniques: [
      "HTTPS beaconing to C2 server",
      "DNS tunneling for covert communication",
      "Tor hidden services for anonymity",
      "Data exfiltration before encryption (double extortion)",
      "Receiving encryption keys from C2"
    ],
    mitre: "TA0011 — Command and Control",
    defenses: [
      "Network traffic analysis and anomaly detection",
      "DNS monitoring and filtering",
      "Firewall egress rules",
      "Network segmentation",
      "TLS inspection"
    ],
    duration: "Minutes to hours",
    riskLevel: "high"
  },
  {
    id: 7,
    name: "Actions on Objectives",
    icon: "🔒",
    shortDesc: "Files are encrypted and ransom is demanded",
    description: "The ransomware executes its primary objective: encrypting files across the system and network shares, dropping ransom notes, and demanding payment. Modern ransomware often also exfiltrates data and threatens public release (double extortion).",
    techniques: [
      "File encryption with AES-256 + RSA key wrapping",
      "Targeting databases, documents, images, backups",
      "Ransom note deployment on desktop and in folders",
      "Changing file extensions (e.g., .locked, .encrypted)",
      "Threatening data leak on dark web (double extortion)"
    ],
    mitre: "TA0040 — Impact",
    defenses: [
      "Offline / immutable backups (3-2-1 rule)",
      "Rapid incident response plan",
      "Network isolation to prevent spread",
      "Canary files for early detection",
      "Cyber insurance"
    ],
    duration: "Minutes to hours",
    riskLevel: "critical"
  }
];

const SIMULATED_FILES = [
  { name: "Q4_Financial_Report.xlsx", size: "2.4 MB", type: "spreadsheet", path: "/finance/reports/", status: "safe" },
  { name: "Employee_Database.csv", size: "8.1 MB", type: "database", path: "/hr/data/", status: "safe" },
  { name: "Project_Proposal.docx", size: "1.2 MB", type: "document", path: "/projects/2024/", status: "safe" },
  { name: "Client_Contracts.pdf", size: "5.7 MB", type: "document", path: "/legal/contracts/", status: "safe" },
  { name: "Product_Design.psd", size: "34.2 MB", type: "image", path: "/design/assets/", status: "safe" },
  { name: "Server_Backup.sql", size: "156 MB", type: "database", path: "/backups/db/", status: "safe" },
  { name: "Marketing_Assets.zip", size: "89.3 MB", type: "archive", path: "/marketing/media/", status: "safe" },
  { name: "Source_Code.tar.gz", size: "12.6 MB", type: "archive", path: "/dev/releases/", status: "safe" },
  { name: "Board_Presentation.pptx", size: "18.9 MB", type: "presentation", path: "/executive/", status: "safe" },
  { name: "Customer_PII.xlsx", size: "4.3 MB", type: "spreadsheet", path: "/data/customers/", status: "safe" },
  { name: "API_Keys_Config.json", size: "0.2 MB", type: "config", path: "/dev/config/", status: "safe" },
  { name: "Annual_Budget.xlsx", size: "3.1 MB", type: "spreadsheet", path: "/finance/budgets/", status: "safe" },
  { name: "Vendor_Agreements.pdf", size: "7.8 MB", type: "document", path: "/procurement/", status: "safe" },
  { name: "Network_Diagram.vsdx", size: "2.9 MB", type: "diagram", path: "/it/docs/", status: "safe" },
  { name: "Patient_Records.db", size: "245 MB", type: "database", path: "/health/records/", status: "safe" },
  { name: "Encryption_Keys.pem", size: "0.1 MB", type: "config", path: "/security/keys/", status: "safe" },
  { name: "Payroll_Data.csv", size: "6.4 MB", type: "database", path: "/hr/payroll/", status: "safe" },
  { name: "Training_Video.mp4", size: "512 MB", type: "media", path: "/training/", status: "safe" },
  { name: "Inventory_System.accdb", size: "28.7 MB", type: "database", path: "/warehouse/", status: "safe" },
  { name: "Legal_Discovery.msg", size: "1.8 MB", type: "email", path: "/legal/discovery/", status: "safe" }
];

const FILE_TYPE_ICONS = {
  spreadsheet: "📊",
  database: "🗄️",
  document: "📄",
  image: "🖼️",
  archive: "📦",
  presentation: "📽️",
  config: "⚙️",
  diagram: "📐",
  media: "🎬",
  email: "✉️"
};

const FORENSICS_LOGS = [
  { timestamp: "2024-03-15 09:14:22", severity: "INFO", source: "EmailGateway", message: "Inbound email received from external sender: invoice_march@mail-service.xyz", ioc: true },
  { timestamp: "2024-03-15 09:14:35", severity: "INFO", source: "EmailGateway", message: "Attachment detected: Invoice_March_2024.xlsm (macro-enabled)", ioc: true },
  { timestamp: "2024-03-15 09:16:48", severity: "WARNING", source: "Endpoint-WS042", message: "User opened attachment Invoice_March_2024.xlsm", ioc: true },
  { timestamp: "2024-03-15 09:16:52", severity: "WARNING", source: "Endpoint-WS042", message: "Macro execution detected in EXCEL.EXE — spawned PowerShell process", ioc: true },
  { timestamp: "2024-03-15 09:16:55", severity: "CRITICAL", source: "Endpoint-WS042", message: "PowerShell executing encoded command: -enc JABzAD0ATgBlAHcALQBPAGIA...", ioc: true },
  { timestamp: "2024-03-15 09:17:01", severity: "CRITICAL", source: "Endpoint-WS042", message: "Outbound HTTPS connection to 185.220.101.34:443 (known C2 IP)", ioc: true },
  { timestamp: "2024-03-15 09:17:08", severity: "WARNING", source: "Firewall", message: "Unusual egress traffic: 185.220.101.34:443 — 2.4 MB uploaded", ioc: true },
  { timestamp: "2024-03-15 09:17:15", severity: "CRITICAL", source: "Endpoint-WS042", message: "Windows Defender service stopped (Tamper Protection bypassed)", ioc: true },
  { timestamp: "2024-03-15 09:17:22", severity: "CRITICAL", source: "Endpoint-WS042", message: "vssadmin.exe executed: Delete Shadows /All /Quiet", ioc: true },
  { timestamp: "2024-03-15 09:17:30", severity: "CRITICAL", source: "Endpoint-WS042", message: "Registry modified: HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender — DisableAntiSpyware = 1", ioc: true },
  { timestamp: "2024-03-15 09:17:45", severity: "INFO", source: "DNS-Server", message: "DNS query: update.microsoftsupport-cdn.com → 185.220.101.34 (suspicious domain)", ioc: true },
  { timestamp: "2024-03-15 09:18:02", severity: "CRITICAL", source: "Endpoint-WS042", message: "Mass file rename detected: 47 files changed to .LOCKED extension in /finance/", ioc: true },
  { timestamp: "2024-03-15 09:18:15", severity: "CRITICAL", source: "Endpoint-WS042", message: "Mass file rename detected: 112 files changed to .LOCKED extension in /hr/", ioc: true },
  { timestamp: "2024-03-15 09:18:28", severity: "WARNING", source: "FileServer-01", message: "SMB lateral movement detected from WS042 to FileServer-01 using admin$ share", ioc: true },
  { timestamp: "2024-03-15 09:18:45", severity: "CRITICAL", source: "FileServer-01", message: "Mass file encryption started on network share \\\\FileServer-01\\shared\\", ioc: true },
  { timestamp: "2024-03-15 09:19:10", severity: "CRITICAL", source: "Endpoint-WS042", message: "Ransom note dropped: README_RESTORE_FILES.txt on Desktop and all encrypted directories", ioc: true },
  { timestamp: "2024-03-15 09:19:22", severity: "INFO", source: "Endpoint-WS042", message: "Wallpaper changed to ransom demand image", ioc: false },
  { timestamp: "2024-03-15 09:20:00", severity: "WARNING", source: "SIEM", message: "ALERT: Ransomware behavior pattern detected — 347 files encrypted across 2 hosts", ioc: true },
  { timestamp: "2024-03-15 09:22:15", severity: "INFO", source: "SOC-Analyst", message: "Incident ticket #INC-2024-0342 created — Ransomware attack confirmed", ioc: false },
  { timestamp: "2024-03-15 09:25:00", severity: "INFO", source: "SOC-Analyst", message: "Network isolation initiated for WS042 and FileServer-01", ioc: false }
];

const RANSOMWARE_PROFILES = [
  {
    name: "WannaCry",
    year: 2017,
    icon: "😭",
    color: "#ff4444",
    description: "One of the most devastating ransomware attacks in history. Exploited the EternalBlue vulnerability (MS17-010) in Windows SMB protocol to spread automatically across networks without user interaction.",
    impact: "300,000+ computers in 150 countries. Estimated $4-8 billion in damages. Crippled the UK's NHS, causing appointment cancellations and ambulance diversions.",
    encryption: "AES-128-CBC + RSA-2048",
    ransom: "$300-600 in Bitcoin",
    vector: "EternalBlue exploit (SMBv1 vulnerability)",
    attribution: "Lazarus Group (North Korea)",
    lesson: "Patch management is critical. A patch was available 2 months before the attack. Organizations that applied MS17-010 were protected.",
    killed: false
  },
  {
    name: "NotPetya",
    year: 2017,
    icon: "💀",
    color: "#ff6600",
    description: "Disguised as ransomware but was actually a destructive wiper. Spread through a compromised Ukrainian accounting software update (M.E.Doc). Designed to cause maximum damage, not collect ransom.",
    impact: "$10 billion+ in damages worldwide. Maersk lost $300M, Merck $870M, FedEx $400M. Considered the most destructive cyberattack in history.",
    encryption: "Modified Petya MBR encryption (irreversible by design)",
    ransom: "$300 in Bitcoin (but decryption was impossible)",
    vector: "Supply chain compromise + EternalBlue + Mimikatz credentials",
    attribution: "Sandworm (Russian GRU Unit 74455)",
    lesson: "Not all 'ransomware' is ransomware — some is destructive malware. Supply chain attacks can bypass all perimeter defenses.",
    killed: false
  },
  {
    name: "REvil / Sodinokibi",
    year: 2019,
    icon: "👹",
    color: "#9c27b0",
    description: "A sophisticated Ransomware-as-a-Service (RaaS) operation. Known for targeting high-profile organizations and demanding massive ransoms. Pioneered the double extortion model — encrypting files AND threatening to leak stolen data.",
    impact: "JBS Foods paid $11M ransom. Kaseya supply chain attack affected 1,500+ businesses. Demanded $70M in the Kaseya attack.",
    encryption: "Salsa20 + ECDH (Curve25519)",
    ransom: "$500K - $70M in Monero/Bitcoin",
    vector: "RDP exploitation, phishing, supply chain (Kaseya VSA)",
    attribution: "Russian-speaking cybercriminals (multiple arrests in 2022)",
    lesson: "RaaS lowers the barrier to entry for attackers. Supply chain attacks can cascade to thousands of downstream victims.",
    killed: true
  },
  {
    name: "LockBit",
    year: 2019,
    icon: "🔐",
    color: "#2196f3",
    description: "The most prolific ransomware operation in 2022-2023. Uses a highly automated affiliate model with a self-spreading capability. Known for its speed — can encrypt a system in minutes.",
    impact: "1,700+ victims globally including Boeing, ICBC, Royal Mail. Estimated $91M+ in ransom payments received by 2023.",
    encryption: "AES-256 + RSA-2048 (multithreaded for speed)",
    ransom: "$50K - $50M+ depending on target",
    vector: "RDP, phishing, exploitation of VPN/firewall vulnerabilities",
    attribution: "Russia-based operation (disrupted by Operation Cronos, Feb 2024)",
    lesson: "Speed matters in IR — LockBit can encrypt an entire network in under 45 minutes. Automated detection and response is essential.",
    killed: true
  },
  {
    name: "Conti",
    year: 2020,
    icon: "🕷️",
    color: "#ff9800",
    description: "Operated like a professional corporation with HR, developers, and negotiators. Internal chats were leaked in 2022, revealing detailed operations. Known for targeting healthcare during COVID-19.",
    impact: "Costa Rica declared national emergency. Ireland's HSE health system crippled for months. $180M+ in ransom demands.",
    encryption: "ChaCha20 + RSA-4096 (32 concurrent threads)",
    ransom: "$100K - $25M in Bitcoin",
    vector: "Phishing (BazarLoader/TrickBot), exploits, purchased access",
    attribution: "Russia-based Wizard Spider group (rebranded after leak)",
    lesson: "The Conti leaks showed ransomware groups operate like businesses. Threat intelligence from leaks can inform defenses.",
    killed: true
  },
  {
    name: "BlackCat / ALPHV",
    year: 2021,
    icon: "🐱‍👤",
    color: "#4caf50",
    description: "First major ransomware written in Rust programming language, making it cross-platform (Windows, Linux, VMware ESXi). Sophisticated triple extortion: encryption + data leak threat + DDoS threat.",
    impact: "Change Healthcare attack (2024) caused nationwide prescription processing outage. UnitedHealth paid $22M ransom.",
    encryption: "AES-128/256 or ChaCha20 (configurable, Rust-based)",
    ransom: "$400K - $22M+ in Bitcoin",
    vector: "Exploitation of vulnerabilities, compromised credentials, access brokers",
    attribution: "Believed to be Conti/DarkSide successor group",
    lesson: "Cross-platform ransomware threatens Linux servers and VMware infrastructure, not just Windows. Healthcare remains a prime target.",
    killed: true
  }
];

const DEFENSE_STRATEGIES = [
  {
    title: "3-2-1 Backup Rule",
    icon: "💾",
    priority: "critical",
    description: "Maintain 3 copies of data, on 2 different media types, with 1 copy offsite/offline. Test backup restoration regularly.",
    details: [
      "Keep at least one backup completely offline (air-gapped)",
      "Use immutable backup storage that cannot be deleted or modified",
      "Test backup restoration quarterly — untested backups are worthless",
      "Ensure backups cover all critical systems and data",
      "Keep 30-90 days of backup history to recover from delayed detection"
    ]
  },
  {
    title: "Patch Management",
    icon: "🔧",
    priority: "critical",
    description: "Apply security patches within 24-72 hours for critical vulnerabilities. WannaCry succeeded because systems were 2 months behind on patches.",
    details: [
      "Prioritize internet-facing systems and known-exploited vulnerabilities",
      "Use CISA's Known Exploited Vulnerabilities (KEV) catalog",
      "Automate patching where possible",
      "Include firmware and third-party software in your patch cycle",
      "Have an emergency patching process for zero-days"
    ]
  },
  {
    title: "Network Segmentation",
    icon: "🔀",
    priority: "high",
    description: "Divide your network into isolated segments so ransomware cannot spread laterally from one compromised system to the entire organization.",
    details: [
      "Separate IT, OT, and IoT networks",
      "Use VLANs and firewall rules between segments",
      "Restrict SMB traffic between workstations",
      "Implement zero-trust network architecture",
      "Monitor east-west (lateral) traffic for anomalies"
    ]
  },
  {
    title: "Endpoint Detection & Response",
    icon: "🛡️",
    priority: "high",
    description: "Deploy EDR solutions that can detect and block ransomware behavior in real-time, even for unknown/zero-day threats, using behavioral analysis.",
    details: [
      "Choose EDR with ransomware-specific canary file detection",
      "Enable automated isolation of infected endpoints",
      "Monitor for mass file rename/encryption patterns",
      "Detect shadow copy deletion attempts",
      "Integrate with SIEM for centralized alerting"
    ]
  },
  {
    title: "Multi-Factor Authentication",
    icon: "🔑",
    priority: "high",
    description: "Require MFA for all remote access, VPN connections, admin accounts, and email. Compromised credentials are a top ransomware entry vector.",
    details: [
      "Enforce MFA on RDP, VPN, and all remote access",
      "Use phishing-resistant MFA (FIDO2, hardware keys)",
      "Require MFA for all administrative actions",
      "Disable legacy authentication protocols",
      "Monitor for MFA bypass attempts"
    ]
  },
  {
    title: "Security Awareness Training",
    icon: "🎓",
    priority: "medium",
    description: "Train all employees to recognize phishing emails, suspicious attachments, and social engineering tactics. Humans are the most common entry point.",
    details: [
      "Conduct phishing simulations monthly",
      "Provide role-specific training (finance, IT, executives)",
      "Train employees on reporting procedures",
      "Cover current threats and real-world examples",
      "Reward good security behavior"
    ]
  },
  {
    title: "Incident Response Plan",
    icon: "📋",
    priority: "critical",
    description: "Have a documented, practiced plan for responding to ransomware. Teams that practice IR respond 3x faster than those that don't.",
    details: [
      "Define roles and responsibilities (RACI matrix)",
      "Establish communication channels (assume email may be compromised)",
      "Practice tabletop exercises quarterly",
      "Include legal, PR, and executive stakeholders",
      "Pre-negotiate cyber insurance and IR retainer agreements"
    ]
  },
  {
    title: "Least Privilege Access",
    icon: "🚪",
    priority: "high",
    description: "Limit user and service account permissions to only what's needed. Admin credentials are gold for ransomware operators.",
    details: [
      "Remove local admin rights from regular users",
      "Use Privileged Access Management (PAM) solutions",
      "Implement just-in-time (JIT) admin access",
      "Audit service account permissions regularly",
      "Disable unused accounts promptly"
    ]
  }
];

const INCIDENT_RESPONSE_STEPS = [
  {
    phase: "Identify",
    icon: "🔍",
    color: "#ff9800",
    steps: [
      { text: "Confirm the ransomware alert is a true positive (not a false alarm)", checked: false },
      { text: "Identify the ransomware variant using ransom note, file extension, or hash", checked: false },
      { text: "Determine the scope — how many systems and users are affected", checked: false },
      { text: "Check nomoreransom.org for existing decryptors", checked: false },
      { text: "Document initial findings with timestamps", checked: false }
    ]
  },
  {
    phase: "Contain",
    icon: "🛑",
    color: "#f44336",
    steps: [
      { text: "Isolate infected systems from the network immediately (pull cable/disable WiFi)", checked: false },
      { text: "Disable shared drives and mapped network shares", checked: false },
      { text: "Block the identified C2 IP addresses and domains at the firewall", checked: false },
      { text: "Disable compromised user accounts", checked: false },
      { text: "Preserve forensic evidence — do NOT wipe systems yet", checked: false },
      { text: "Activate out-of-band communication (phone, Signal) — assume email is compromised", checked: false }
    ]
  },
  {
    phase: "Eradicate",
    icon: "🧹",
    color: "#9c27b0",
    steps: [
      { text: "Identify the initial entry point (patient zero)", checked: false },
      { text: "Remove all malware artifacts, persistence mechanisms, and backdoors", checked: false },
      { text: "Reset ALL potentially compromised credentials (not just confirmed ones)", checked: false },
      { text: "Patch the vulnerability that was exploited", checked: false },
      { text: "Scan all systems with updated antivirus/EDR before reconnecting", checked: false }
    ]
  },
  {
    phase: "Recover",
    icon: "🔄",
    color: "#4caf50",
    steps: [
      { text: "Restore systems from verified clean backups", checked: false },
      { text: "Rebuild systems that cannot be verified as clean", checked: false },
      { text: "Validate data integrity after restoration", checked: false },
      { text: "Reconnect systems to network gradually, monitoring for re-infection", checked: false },
      { text: "Restore normal business operations in priority order", checked: false }
    ]
  },
  {
    phase: "Lessons Learned",
    icon: "📝",
    color: "#2196f3",
    steps: [
      { text: "Conduct a post-incident review within 1-2 weeks", checked: false },
      { text: "Document the full timeline of the attack and response", checked: false },
      { text: "Identify what went well and what needs improvement", checked: false },
      { text: "Update the incident response plan based on findings", checked: false },
      { text: "Implement additional controls to prevent recurrence", checked: false },
      { text: "File reports with relevant authorities (FBI IC3, CISA)", checked: false }
    ]
  }
];

const GLOBAL_STATS = [
  { label: "Average Ransom Payment (2024)", value: "$2.73M", icon: "💰" },
  { label: "Average Downtime", value: "24 days", icon: "⏱️" },
  { label: "Attacks Per Day (Global)", value: "11+", icon: "🎯" },
  { label: "Phishing as Entry Vector", value: "67%", icon: "📧" },
  { label: "Orgs That Paid Ransom", value: "29%", icon: "💸" },
  { label: "Data Recovered After Paying", value: "65%", icon: "📉" },
  { label: "Total Damages (2024)", value: "$265B", icon: "📊" },
  { label: "Healthcare Attacks Increase", value: "+78%", icon: "🏥" }
];

const TARGETED_INDUSTRIES = [
  { name: "Healthcare", percentage: 22, color: "#f44336" },
  { name: "Government", percentage: 18, color: "#ff9800" },
  { name: "Education", percentage: 15, color: "#ffeb3b" },
  { name: "Manufacturing", percentage: 13, color: "#4caf50" },
  { name: "Financial Services", percentage: 11, color: "#2196f3" },
  { name: "Technology", percentage: 9, color: "#9c27b0" },
  { name: "Retail", percentage: 7, color: "#00bcd4" },
  { name: "Other", percentage: 5, color: "#607d8b" }
];
