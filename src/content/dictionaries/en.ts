const en = {
  meta: {
    titleSuffix: "Software Engineering, Sovereign AI & Cybersecurity",
    description:
      "Mission-critical software engineering, sovereign artificial intelligence, agentic cybersecurity, and autonomous operations for enterprise and government.",
    ogLocale: "en_US",
  },
  nav: {
    items: [
      {
        name: "Services",
        children: [{ name: "", href: "" }],
        platformChildren: [
          { name: "Sovereign AI", href: "/soberania-ia", description: "AI infrastructure under your total control" },
          { name: "Cybersecurity", href: "/ciberseguridad", description: "Autonomous defense with AI agents" },
          { name: "Digital Workforce", href: "/fuerza-digital", description: "Executive assistants across all channels" },
          { name: "Data Enrichment", href: "/enriquecimiento-datos", description: "Actionable intelligence from verified sources" },
          { name: "Data Extraction", href: "/extraccion-datos", description: "AI scrapers for OSINT and public records" },
        ],
        solutionsChildren: [
          { name: "Critical Systems", href: "/sistemas-criticos", description: "High-availability architecture" },
          { name: "Operational Intelligence", href: "/inteligencia-operativa", description: "Command centers and unified data" },
          { name: "Government Automation", href: "/automatizacion-gobierno", description: "Digitized government workflows" },
        ],
      },
      { name: "Live Studio", href: "/estudio-tiktok-live", accent: true },
      { name: "Company", href: "/nosotros" },
    ],
    contact: "Contact",
    schedule: "Schedule",
    menuLabel: "Navigation menu",
  },
  hero: {
    eyebrow: "MISSION-CRITICAL INFRASTRUCTURE",
    titleLead: "We build",
    titleHighlight: "digital sovereignty.",
    titleRotating: [
      "digital sovereignty.",
      "cyber defense.",
      "autonomous operations.",
      "critical systems.",
    ],
    description:
      "We build sovereign AI infrastructure, agentic cybersecurity systems, and autonomous operations platforms for governments and organizations operating under the world's most demanding standards.",
    trustLine:
      "Precision engineering for critical state and enterprise operations.",
    primaryAction: {
      label: "Start Technical Consultation",
      analyticsEvent: "hero_cta_primary",
    },
    secondaryAction: {
      label: "View Engineering Capabilities",
      href: "#capacidades",
      analyticsEvent: "hero_cta_services",
    },
    nurtureCta: {
      label: "View use cases for public sector",
      href: "/automatizacion-gobierno",
      analyticsEvent: "hero_nurture_cta",
    },
  },
  trustBar: {
    label: "Built on",
  },
  services: {
    sectionId: "capacidades",
    title: "Engineering Capabilities",
    exploreLabel: "Explore",
    description:
      "We design, deploy, and operate software, artificial intelligence, and cybersecurity systems for organizations where failure is not an option.",
    items: [
      {
        title: "Sovereign AI for Enterprise & Government",
        benefit:
          "Artificial intelligence infrastructure that operates within your perimeter, under your total control.",
        bullets: [
          "On-Premise or Sovereign Cloud Deployment",
          "Private Language Models (LLM)",
          "Regulatory Compliance & Audit",
        ],
        icon: "sovereign",
        href: "/soberania-ia",
      },
      {
        title: "Agentic Cybersecurity with AI",
        benefit:
          "Autonomous agents that audit, detect, and respond to threats before they escalate.",
        bullets: [
          "Attack Surface Audits",
          "Real-Time Threat Detection",
          "Autonomous Incident Response",
        ],
        icon: "shield",
        href: "/ciberseguridad",
      },
      {
        title: "AI Executive Staff",
        benefit:
          "Autonomous operations team working 24/7 across your channels: WhatsApp, Slack, Teams, email.",
        bullets: [
          "Always-On Executive Assistants",
          "Calendar & Communications Management",
          "Integration Across All Your Channels",
        ],
        icon: "assistant",
        href: "/fuerza-digital",
      },
      {
        title: "Critical Systems Architecture",
        benefit:
          "Software platforms engineered to operate under the highest availability standards.",
        bullets: [
          "High-Availability Architecture",
          "Zero-Trust Infrastructure",
          "Distributed & Resilient Systems",
        ],
        icon: "systems",
        href: "/sistemas-criticos",
      },
      {
        title: "Operational Intelligence Platforms",
        benefit:
          "Command centers that unify data, metrics, and decisions into a single interface.",
        bullets: [
          "Real-Time Command Dashboards",
          "Data Source Integration",
          "Predictive Analytics & Alerts",
        ],
        icon: "intelligence",
        href: "/inteligencia-operativa",
      },
      {
        title: "Government Process Automation",
        benefit:
          "Digitization of government and corporate workflows with full traceability.",
        bullets: [
          "Automated Regulatory Workflows",
          "Digital Chain of Custody & Traceability",
          "Public Systems Interoperability",
        ],
        icon: "governance",
        href: "/automatizacion-gobierno",
      },
      {
        title: "Data Enrichment",
        benefit:
          "Transform fragmented records into actionable intelligence with automated multi-source enrichment. With strict regulatory compliance and data residency configurable by jurisdiction.",
        bullets: [
          "Real-Time Multi-Source Enrichment",
          "Firmographic & Contact Profiling",
          "GDPR Compliance & Sovereign Data Residency",
        ],
        icon: "enrichment",
        href: "/enriquecimiento-datos",
      },
      {
        title: "Data Extraction at Scale",
        benefit:
          "Collect data from any public source with AI-powered extractors and full audit trails. We operate exclusively on public and authorized sources, under compliance frameworks applicable to each jurisdiction.",
        bullets: [
          "AI-Adaptive Scrapers",
          "OSINT & Open Source Intelligence (public and open sources)",
          "Regulatory & Public Records Monitoring",
        ],
        icon: "scraper",
        href: "/extraccion-datos",
      },
    ],
  },
  flagshipAI: {
    sectionId: "sistemas-ia",
    title: "Sovereign AI Deployment",
    description:
      "Your organization needs artificial intelligence that operates under your rules, on your infrastructure, with your data. No external dependencies, no third-party risks. For solutions requiring third-party API integration, we implement data processing agreements and privacy architectures that keep operational control within your organization.",
    items: [
      {
        title: "Cyber Defense Agents",
        description:
          "AI that monitors your attack surface, identifies vulnerabilities, and executes response protocols without human intervention.",
        icon: "cyber",
      },
      {
        title: "Digital Workforce",
        description:
          "AI executive assistants deployed across all your communication channels: calendar management, information triage, and operational coordination.",
        icon: "workforce",
      },
      {
        title: "On-Premise AI Infrastructure",
        description:
          "Language models, data pipelines, and autonomous agents operating within your security perimeter with total data sovereignty.",
        icon: "infra",
      },
    ],
    caption:
      "Total control. Complete sovereignty. Measurable impact.",
  },
  caseStudy: {
    sectionId: "casos",
    eyebrow: "CASE STUDY",
    industry: "Media & Live Production",
    title: "Autonomous help desk for live production",
    context:
      "An audiovisual production studio running live shows on TikTok cannot afford interruptions during a broadcast: every minute off the air is lost audience and revenue. Their help desk depended on having a technician available at the exact moment of the incident.",
    solution:
      "We deployed an AI agent that operates the infrastructure help desk end to end. During broadcasts, the agent diagnoses and remediates incidents autonomously, escalating to a human technician only when automated remediation does not resolve the problem.",
    outcome:
      "The studio's infrastructure stays operational throughout broadcasts without manual intervention, and the technical team focuses on production instead of reactive support.",
    capabilitiesTitle: "What the agent executes autonomously",
    capabilities: [
      "Connectivity diagnostics with pings to critical endpoints",
      "Driver verification and updates",
      "Remote modem restarts",
      "Failover between backup WiFi networks",
      "Help desk ticket triage",
      "Escalation to a human technician with full context",
    ],
    cta: {
      label: "Explore Digital Workforce",
      href: "/fuerza-digital",
    },
  },
  methodology: {
    sectionId: "metodologia",
    title: "The Orbexs Standard",
    phaseLabel: "Phase",
    description:
      "Our engineering process is designed to eliminate uncertainty and guarantee value delivery on every deployment.",
    steps: [
      {
        num: "01",
        title: "Diagnostics & Technical Audit",
        desc: "Exhaustive analysis of your current infrastructure and definition of business objectives.",
      },
      {
        num: "02",
        title: "Systems & Data Architecture",
        desc: "Technical solution modeling to ensure long-term scalability and maintainability.",
      },
      {
        num: "03",
        title: "Engineering & Agent Development",
        desc: "Core system construction and integration of custom intelligent logic.",
      },
      {
        num: "04",
        title: "High-Availability Validation & QA",
        desc: "Stress and security testing to guarantee zero-downtime deployments.",
      },
      {
        num: "05",
        title: "Operations & Continuous Evolution",
        desc: "Strategic monitoring, latency optimization, and specialized technical support.",
      },
    ],
  },
  team: {
    sectionId: "equipo",
    title: "Our Technical Leadership",
    description: "Engineering and strategy behind Orbexs.",
    members: [
      {
        name: "Johan Rocuts",
        initials: "JR",
        role: "CEO - Chief Executive Officer",
        tagline: "Strategist for high-scale digital products.",
      },
      {
        name: "Mauricio Solano",
        initials: "MS",
        role: "Sales Director",
        tagline: "Specialist in consultative B2B and enterprise sales.",
      },
      {
        name: "Yeison Grisales",
        initials: "YG",
        role: "CCO - Chief Commercial Officer",
        tagline: "Specialist in B2B technology solutions.",
      },
      {
        name: "Cristian Mancilla",
        initials: "CM",
        role: "CTO - Chief Technology Officer",
        tagline: "Specialist in distributed systems architecture.",
      },
      {
        name: "Andres Rodriguez",
        initials: "AR",
        role: "Senior Full Stack Engineer",
        tagline: "Expert in high-performance web development.",
      },
    ],
  },
  faq: {
    sectionId: "faq",
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know to get started.",
    items: [
      {
        question: "What does sovereign AI mean and why is it relevant to my organization?",
        answer:
          "Sovereign AI means your language models, training data, and inference pipelines operate within your infrastructure — no external API dependencies, no sensitive data exposure to third parties. It's essential for government, defense, finance, and any organization with strict regulatory compliance requirements.",
      },
      {
        question: "How does agentic cybersecurity with AI work?",
        answer:
          "We deploy autonomous agents that execute continuous audits of your attack surface, analyze traffic patterns, detect anomalies, and can execute incident response protocols in real time — drastically reducing detection and response times against threats.",
      },
      {
        question: "What is the AI Executive Staff service?",
        answer:
          "It's an autonomous operations team powered by artificial intelligence that works 24/7 integrated into your existing channels — WhatsApp, Slack, Teams, email. It manages calendars, triages communications, coordinates teams, and executes administrative tasks with the precision of a senior executive assistant.",
      },
      {
        question: "How do you structure engagements with government and defense organizations?",
        answer:
          "Every engagement with the public sector and defense operates under confidentiality by default. We work under NDA-bound contracts, isolated infrastructure, and a specialized onboarding process that includes compliance requirements assessment, data perimeter definition, and assignment of appropriately cleared personnel. We do not publish government client names or implementation details — operational discretion is an integral part of our service standard.",
      },
    ],
  },
  cta: {
    lead: "Let's discuss",
    highlight: "your next system.",
    description:
      "Schedule a technical evaluation. No commitment, no generic templates — a conversation about what your operation needs.",
    action: {
      label: "Schedule Evaluation",
      analyticsEvent: "cta_final_click",
    },
  },
  techStack: {
    sectionId: "technologies",
    title: "Our Technology Stack",
    categories: [
      { name: "Artificial Intelligence", items: ["Anthropic", "OpenAI", "Google Gemini", "Meta LLaMA", "DeepSeek", "Mistral", "Hugging Face", "n8n", "LangChain", "PyTorch", "Ollama"] },
      { name: "Cloud & Infrastructure", items: ["AWS", "Google Cloud", "Microsoft Azure", "Kubernetes", "Terraform", "Pulumi"] },
      { name: "Development & Platforms", items: ["Next.js 16", "React 19", "TypeScript 5", "Bun", "Rust", "Go"] },
      { name: "Cybersecurity", items: ["Zero Trust", "SIEM/SOAR", "Threat Intelligence", "Red Teaming", "Blue Teaming", "SOC Automation", "WAF", "Penetration Testing", "EDR/XDR", "Incident Response"] },
      { name: "Data & Analytics", items: ["PostgreSQL", "ClickHouse", "Apache Kafka", "Apache Flink", "Grafana", "dbt"] },
      { name: "Compliance Frameworks", items: ["SOC 2 Type II", "ISO 27001", "GDPR", "SSPA", "NIST CSF", "PCI DSS"] },
      { name: "Compliance Automation", items: ["Vanta", "Thoropass", "Drata", "Secureframe", "Sprinto"] },
    ],
    note:
      "Orbexs does not hold these certifications. We list them because we design the architecture, technical controls and audit evidence our clients rely on to obtain and maintain them — backed by compliance automation platforms such as Vanta and Thoropass, and accredited third-party auditors.",
  },
  footer: {
    tagline:
      "Enterprise software engineering. Platforms, systems, and AI automation.",
    platform: "Platform",
    platformLinks: [
      { name: "Sovereign AI", href: "/soberania-ia" },
      { name: "Cybersecurity", href: "/ciberseguridad" },
      { name: "Digital Workforce", href: "/fuerza-digital" },
      { name: "Data Enrichment", href: "/enriquecimiento-datos" },
      { name: "Data Extraction", href: "/extraccion-datos" },
    ],
    studio: "Live Studio",
    studioLinks: [
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live" },
      { name: "Creator program", href: "/estudio-tiktok-live" },
      { name: "Brands and campaigns", href: "/agendar" },
    ],
    company: "Company",
    companyLinks: [
      { name: "About Us", href: "/nosotros" },
      { name: "Investors", href: "/inversores" },
      { name: "Diagnostic", href: "/diagnostico" },
      { name: "Schedule", href: "/agendar" },
    ],
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    copyright: "All rights reserved.",
  },
  legalPage: {
    badge: "Legal",
    lastUpdated: "Last updated",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How Orbexs collects, uses, and protects information shared through this site.",
    updatedAt: "March 16, 2026",
    sections: [
      {
        title: "Information We Collect",
        paragraphs: [
          "We collect information you voluntarily share when you contact us, schedule a meeting, or interact with forms and emails generated from the site.",
          "This information may include your name, email address, company details, project context, and any operational details you choose to share with our team.",
        ],
      },
      {
        title: "Use of Information",
        paragraphs: [
          "We use the information to respond to inquiries, prepare diagnostics, coordinate meetings, evaluate business opportunities, and improve the site experience.",
          "We do not sell personal information to third parties or use it for purposes incompatible with the commercial or pre-commercial relationship initiated by the visitor with Orbexs.",
        ],
      },
      {
        title: "Retention and Security",
        paragraphs: [
          "We apply reasonable security measures to protect the commercial and contact information we receive, including access controls and operational best practices.",
          "We retain data only for the time necessary to fulfill the request, comply with legal obligations, or maintain relevant commercial records.",
        ],
      },
      {
        title: "Third Parties and External Services",
        paragraphs: [
          "This site may rely on external services for scheduling, email, analytics, or infrastructure. Each provider processes data under its own policies and contractual obligations.",
          "If you need details about the processing of your data or wish to exercise your rights of access, rectification, or deletion, please contact us at contact@orbexs.tech.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    description:
      "General conditions for the use of the Orbexs website and commercial contact initiated from this platform.",
    updatedAt: "March 16, 2026",
    sections: [
      {
        title: "Permitted Use of the Site",
        paragraphs: [
          "This site is intended for informational and commercial purposes. You may browse it, share it, and use its contact channels to initiate legitimate conversations with Orbexs.",
          "Using the site for unlawful activities, intrusion attempts, abusive scraping, spam, or any action that affects the availability or integrity of the service is prohibited.",
        ],
      },
      {
        title: "Intellectual Property",
        paragraphs: [
          "The text, trademarks, layouts, graphics, code, and visual elements of the site belong to Orbexs or their respective licensors, unless expressly stated otherwise.",
          "Total or partial reproduction for commercial purposes without prior written consent is not authorized.",
        ],
      },
      {
        title: "Commercial Relationship",
        paragraphs: [
          "Use of the site or submission of an inquiry does not in itself create a contractual relationship. Any professional service is formalized through a proposal, scope, contract, and specific terms.",
          "Estimates, timelines, scope, and recommendations shared prior to engagement are subject to change following a deeper technical diagnosis.",
        ],
      },
      {
        title: "Liability and Contact",
        paragraphs: [
          "Orbexs endeavors to keep the information on the site up to date but does not guarantee that all content will remain complete, accurate, or available at all times.",
          "If you have legal or commercial questions about these terms, you may write to contact@orbexs.tech.",
        ],
      },
    ],
  },
  diagnosticPage: {
    badge: "Free Diagnostic",
    pageTitle: "Technical Diagnostic",
    pageSubtitle:
      "Complete the form and receive a personalized analysis of your infrastructure with actionable recommendations in under 2 minutes.",
  },
  diagnostic: {
    steps: [
      { id: "company", label: "Company" },
      { id: "stack", label: "Technology" },
      { id: "pain-points", label: "Challenges" },
      { id: "goals", label: "Goals" },
      { id: "contact", label: "Contact" },
    ],
    prev: "Previous",
    next: "Next",
    submit: "Generate Diagnostic",
    errorMessage:
      "We're sorry, there was an error generating your diagnostic. Please try again or contact us directly.",
    stepCompany: {
      title: "Company Profile",
      subtitle:
        "Tell us about your organization to personalize the diagnostic.",
      companyLabel: "Company name",
      companyPlaceholder: "E.g.: Acme Corp",
      industryLabel: "Industry",
      teamSizeLabel: "Team size",
      roleLabel: "Your role",
    },
    stepStack: {
      title: "Current Technology Stack",
      subtitle: "Select the technologies you currently use.",
      stackLabel: "Languages and frameworks",
      cloudLabel: "Cloud provider",
      aiLabel: "AI maturity level",
    },
    stepPainPoints: {
      title: "Current Challenges",
      subtitle: "Select the problems your organization faces.",
      detailLabel: "Briefly describe the main challenge (optional)",
      detailPlaceholder:
        "E.g.: Our team spends 20 hours per week manually processing invoices...",
    },
    stepGoals: {
      title: "Goals",
      subtitle: "What do you want to achieve with this project?",
      budgetLabel: "Estimated budget",
      timelineLabel: "Desired timeline",
      decisionLabel: "Decision stage",
    },
    stepContact: {
      title: "Contact Information",
      subtitle: "So we can send you your personalized diagnostic.",
      nameLabel: "Full name",
      namePlaceholder: "Jane Smith",
      emailLabel: "Corporate email",
      emailPlaceholder: "name@company.com",
      websiteLabel: "Website (optional)",
      websitePlaceholder: "https://company.com",
      notesLabel: "Anything else we should know? (optional)",
      notesPlaceholder:
        "Additional context, constraints, preferences...",
    },
  },
  diagnosticReport: {
    badge: "Diagnostic Generated",
    titleTemplate: "Diagnostic for {name}",
    titleFallback: "Your Technical Diagnostic",
    subtitle: "Personalized analysis based on your responses.",
    loading: "Generating diagnostic...",
    whatsappMessage:
      "Hi, I just completed the technical diagnostic on Orbexs ({name}). I'd like to schedule a strategic consultation.",
    whatsappButton: "Schedule via WhatsApp",
    backButton: "Back to Home",
  },
  diagnosticOptions: {
    industries: [
      "Fintech",
      "Healthcare",
      "E-commerce",
      "SaaS / Software",
      "Enterprise / Corporate",
      "Education",
      "Logistics",
      "Other",
    ],
    teamSizes: ["1-10", "11-50", "51-200", "200+"],
    roles: [
      "Founder / CEO",
      "CTO / VP Engineering",
      "Product Manager",
      "Director of Operations",
      "Other",
    ],
    techStack: [
      "React / Next.js",
      "Vue / Nuxt",
      "Angular",
      "Node.js",
      "Python",
      "Java / Spring",
      ".NET / C#",
      "Go",
      "Ruby on Rails",
      "PHP / Laravel",
      "Mobile (React Native / Flutter)",
      "WordPress / No-code",
    ],
    cloudProviders: [
      "AWS",
      "Google Cloud",
      "Azure",
      "None / On-premises",
      "Not sure",
    ],
    aiMaturity: [
      "No AI usage",
      "Experimenting",
      "AI in production (basic)",
      "Advanced AI in production",
    ],
    painPoints: [
      "Manual processes that should be automated",
      "Data silos / poor integration between systems",
      "Scalability bottlenecks",
      "Poor customer experience",
      "Outdated internal tools",
      "Need for AI/ML capabilities",
      "Lack of visibility / analytics",
      "High operational costs",
    ],
    goals: [
      "Build a new SaaS product",
      "Automate internal workflows with AI",
      "Integrate AI into existing product",
      "Modernize legacy systems",
      "Build autonomous agents / pipelines",
      "Improve cloud infrastructure",
      "Develop a mobile app",
    ],
    budgetRanges: ["$10K - $25K", "$25K - $75K", "$75K - $150K", "$150K+"],
    timelines: [
      "As soon as possible",
      "1 - 3 months",
      "3 - 6 months",
      "6+ months",
    ],
    decisionStages: [
      "Researching options",
      "Evaluating providers",
      "Ready to proceed",
    ],
  },
  products: {
    sovereignAI: {
      eyebrow: "SOVEREIGN AI",
      title: "Your artificial intelligence. Your infrastructure. Your control.",
      subtitle: "Enterprise AI deployment with zero third-party dependencies.",
      description: "We design and operate artificial intelligence infrastructure that runs within your security perimeter. Private language models, sovereign data pipelines, and autonomous agents under your complete governance.",
      features: [
        { title: "Private Language Models", description: "Training, fine-tuning, and deployment of LLMs within your infrastructure. No data leaving your perimeter." },
        { title: "On-Premise Inference", description: "AI processing on your own servers or sovereign cloud with minimal latency and total control." },
        { title: "Regulatory Compliance", description: "Architecture designed to comply with national and international data protection regulatory frameworks." },
        { title: "Sovereign Data Pipelines", description: "Ingestion, transformation, and analysis workflows that operate exclusively within your jurisdiction." },
        { title: "Internal Autonomous Agents", description: "Deployment of AI agents that execute operational tasks without exposure to external services." },
        { title: "Audit and Traceability", description: "Complete record of every decision, inference, and action executed by the AI systems." },
      ],
      capabilities: [
        { title: "Infrastructure", items: ["Sovereign Cloud / On-Premise", "Dedicated GPU Clusters", "Air-Gapped Networks"] },
        { title: "Models", items: ["Open Source LLM Fine-Tuning", "RAG on Internal Documentation", "Private Multimodal Models"] },
        { title: "Governance", items: ["Granular Access Control", "Immutable Audit Logs", "Compliance-Ready Architecture"] },
      ],
      cta: {
        title: "Bring AI inside your perimeter",
        description: "Schedule a technical assessment to design your sovereign AI infrastructure.",
        action: { label: "Schedule Assessment", href: "/agendar" },
      },
    },
    cybersecurity: {
      eyebrow: "AGENTIC CYBERSECURITY",
      title: "Autonomous defense. Real-time response.",
      subtitle: "AI agents protecting your attack surface 24/7.",
      description: "We deploy AI-powered cybersecurity systems that audit, detect, and respond to threats autonomously — before a human can react.",
      features: [
        { title: "Attack Surface Audit", description: "Continuous, automated scanning of all exposure vectors across your organization." },
        { title: "AI-Powered Threat Detection", description: "Real-time analysis of traffic patterns, anomalous behavior, and compromise indicators." },
        { title: "Autonomous Incident Response", description: "Execution of containment and remediation protocols without human intervention." },
        { title: "Vulnerability Analysis", description: "Proactive identification of weaknesses in applications, networks, and infrastructure." },
        { title: "Attack Simulation (Red Team)", description: "Automated penetration exercises to validate your security posture." },
        { title: "Security Operations Center", description: "AI-powered SOC with command dashboards, alerts, and intelligent escalation." },
      ],
      capabilities: [
        { title: "Detection", items: ["Real-Time Traffic Analysis", "Event Correlation (SIEM)", "Threat Intelligence Feeds"] },
        { title: "Response", items: ["Automated Containment", "Incident Playbooks", "Digital Forensics"] },
        { title: "Prevention", items: ["Continuous Penetration Testing", "Infrastructure Hardening", "Zero-Trust Architecture"] },
      ],
      cta: {
        title: "Fortify your operation",
        description: "Request an attack surface audit for your organization.",
        action: { label: "Request Audit", href: "/agendar" },
      },
    },
    digitalWorkforce: {
      eyebrow: "DIGITAL WORKFORCE",
      title: "An executive team that never rests.",
      subtitle: "AI assistants deployed across all your channels.",
      description: "We build and operate AI-powered digital work teams that integrate with WhatsApp, Slack, Teams, email, and any channel in your organization. Calendar management, communications triage, operational coordination — with the precision of a senior executive assistant.",
      features: [
        { title: "24/7 Executive Assistant", description: "Intelligent management of calendars, emails, and communications with automatic prioritization." },
        { title: "Multichannel Integration", description: "Deployment across WhatsApp, Slack, Microsoft Teams, email, SMS, and internal channels." },
        { title: "Information Triage", description: "Automatic classification of messages, documents, and requests by urgency and context." },
        { title: "Team Coordination", description: "Task tracking, reminders, and synchronization across departments." },
        { title: "Internal Knowledge Base", description: "Instant answers from your organization's documentation and policies." },
        { title: "Executive Reports", description: "Automatic generation of summaries, metrics, and management reports." },
      ],
      capabilities: [
        { title: "Channels", items: ["WhatsApp Business", "Slack & Microsoft Teams", "Email, SMS & Voice"] },
        { title: "Capabilities", items: ["Intelligent Calendar Management", "Document Processing", "Automated Workflows"] },
        { title: "Governance", items: ["Role-Based Access Policies", "Conversation Audit", "Data on Your Infrastructure"] },
      ],
      cta: {
        title: "Activate your digital team",
        description: "Schedule a demonstration of how AI can operate your communications.",
        action: { label: "Schedule Demonstration", href: "/agendar" },
      },
    },
    systemsArchitecture: {
      eyebrow: "CRITICAL ARCHITECTURE",
      title: "Systems that cannot go down.",
      subtitle: "High-availability engineering for critical operations.",
      description: "We design and build software platforms with distributed architecture, active redundancy, and Zero-Trust infrastructure for organizations where downtime is not an option.",
      features: [
        { title: "High-Availability Architecture", description: "Distributed systems with active redundancy, automatic failover, and built-in disaster recovery." },
        { title: "Zero-Trust Infrastructure", description: "Security model where no actor, internal or external, is trusted by default." },
        { title: "Distributed & Resilient Systems", description: "Architecture designed to scale horizontally and withstand partial failures without interruption." },
        { title: "Observability & Monitoring", description: "Real-time telemetry, health dashboards, and predictive alerts across your entire infrastructure." },
      ],
      capabilities: [
        { title: "Infrastructure", items: ["Kubernetes / Container Orchestration", "Multi-Region Deployment", "Automated Disaster Recovery"] },
        { title: "Security", items: ["Zero-Trust Network Architecture", "Secrets Management", "Encrypted Data at Rest & Transit"] },
        { title: "Operations", items: ["SRE & Incident Response", "SLA & Availability Engineering", "Performance Profiling"] },
      ],
      cta: {
        title: "Build on solid ground",
        description: "Schedule an evaluation of your current architecture.",
        action: { label: "Schedule Evaluation", href: "/agendar" },
      },
    },
    operationalIntelligence: {
      eyebrow: "OPERATIONAL INTELLIGENCE",
      title: "Real-time decisions. Unified data.",
      subtitle: "Command centers that transform data into action.",
      description: "We build operational intelligence platforms that integrate all your data sources into a unified interface with command dashboards, predictive analytics, and automated alerts.",
      features: [
        { title: "Real-Time Command Dashboards", description: "Control interfaces that consolidate operational metrics, KPIs, and system status into a single view." },
        { title: "Data Source Integration", description: "Connectors for databases, APIs, IoT, logs, and legacy systems — all unified." },
        { title: "Predictive Analytics & Alerts", description: "Machine learning models that anticipate failures, anomalies, and opportunities before they occur." },
        { title: "Automated Executive Reports", description: "Automatic generation of management reports with actionable insights for decision-making." },
      ],
      capabilities: [
        { title: "Data", items: ["ETL & Data Pipelines", "Data Lake / Warehouse", "Real-Time Streaming"] },
        { title: "Visualization", items: ["Interactive Dashboards", "Geospatial Analytics", "Custom Reporting Engine"] },
        { title: "Intelligence", items: ["Anomaly Detection", "Forecasting Models", "Natural Language Queries"] },
      ],
      cta: {
        title: "Unify your operation",
        description: "Schedule a demo of our intelligence platform.",
        action: { label: "Schedule Demo", href: "/agendar" },
      },
    },
    governmentAutomation: {
      eyebrow: "GOVERNMENT AUTOMATION",
      title: "Government processes. Digital speed.",
      subtitle: "Digitization with full traceability and regulatory compliance.",
      description: "We automate government and regulated corporate workflows with digital chain of custody, public system interoperability, and built-in regulatory compliance.",
      features: [
        { title: "Automated Regulatory Workflows", description: "Process digitization with business rules, multi-level approvals, and built-in regulatory compliance." },
        { title: "Traceability & Chain of Custody", description: "Immutable record of every action, document, and decision in the workflow." },
        { title: "Cross-System Interoperability", description: "Integration with existing government platforms, public databases, and legacy systems." },
        { title: "Citizen / Corporate Portal", description: "Self-service interfaces for procedures, inquiries, and request tracking." },
      ],
      capabilities: [
        { title: "Processes", items: ["BPM & Workflow Engine", "Document Management", "Digital Signatures"] },
        { title: "Integration", items: ["Government API Gateway", "X-Road Interoperability", "Legacy Connectors"] },
        { title: "Compliance", items: ["Immutable Audit Trail", "Role-Based Access Control", "Data Residency Compliance"] },
      ],
      cta: {
        title: "Modernize your operation",
        description: "Schedule a consultation on process automation.",
        action: { label: "Schedule Consultation", href: "/agendar" },
      },
    },
    dataEnrichment: {
      eyebrow: "DATA ENRICHMENT",
      title: "Fragmented data turned into decisive intelligence.",
      subtitle: "Automated enrichment from authoritative, verified sources.",
      description: "We connect your records with an ecosystem of authoritative data sources to transform incomplete information into verified, actionable profiles — whether qualifying vendors, consolidating citizen records, or building commercial pipeline. Sovereign hosting, regulatory compliance, and real-time refresh included.",
      processTitle: "ENRICHMENT PIPELINE",
      process: [
        {
          step: "01",
          title: "Ingestion",
          description: "Automated connection to commercial registries, government databases and premium data providers.",
          details: ["Commercial registries", "Government databases", "Premium data APIs", "Public records"],
        },
        {
          step: "02",
          title: "Validation",
          description: "Multi-source cross-referencing with automatic deduplication and normalization.",
          details: ["Automatic deduplication", "Format normalization", "Multi-source cross-referencing", "Quality scoring"],
        },
        {
          step: "03",
          title: "Enrichment",
          description: "Complete profiling with firmographic, contact and buying intent data.",
          details: ["Firmographic profiling", "Contact data", "Intent signals", "Technographic analysis"],
        },
        {
          step: "04",
          title: "Delivery",
          description: "Bidirectional synchronization with your CRM/ERP systems in real time.",
          details: ["CRM/ERP sync", "REST API & webhooks", "Automated reporting", "Change alerts"],
        },
      ],
      features: [
        { title: "Waterfall Multi-Source Enrichment", description: "Sequential chain of data providers to maximize coverage and accuracy on every record." },
        { title: "Full Firmographic Profiling", description: "Contact data, organizational structure, revenue, technology stack, and buying signals for each account." },
        { title: "Buying Intent Detection", description: "Identification of accounts actively researching relevant solutions through behavioral signals." },
        { title: "AI-Powered Scoring", description: "Automatic lead classification by fit, intent, and conversion probability." },
        { title: "CRM/ERP Synchronization", description: "Bidirectional integration with Salesforce, HubSpot, and internal systems with automatic deduplication." },
        { title: "Compliance & Audit", description: "Full traceability of every collected data point, GDPR/CCPA compliance, and sovereign residency options." },
      ],
      capabilities: [
        { title: "Intelligence Acquisition", items: ["Contact & Org Chart Discovery", "Firmographic & Technographic Profiling", "Intent Signals from Web Activity"] },
        { title: "Data Operations", items: ["Multi-Provider Waterfall Enrichment", "Deduplication & Normalization", "Scheduled Refresh Cycles"] },
        { title: "Integration & Compliance", items: ["Native CRM/ERP Connectors", "Granular Access Control", "Sovereign Data Residency"] },
      ],
      cta: {
        title: "Activate your data intelligence",
        description: "Schedule a demo of enrichment on your own records.",
        action: { label: "Schedule Demo", href: "/agendar" },
      },
    },
    dataExtraction: {
      eyebrow: "DATA EXTRACTION",
      title: "Collect any public source. At any scale.",
      subtitle: "AI-powered extractors for OSINT, regulatory monitoring, and competitive intelligence.",
      description: "We deploy AI-powered collectors across the open web, government portals, and public registries — returning clean, structured intelligence to your systems in real time. Purpose-built for OSINT, regulatory monitoring, and large-scale public records programs with full audit trails and sovereign deployment options.",
      features: [
        { title: "Structured Extraction at Scale", description: "Conversion of web pages, PDFs, and unstructured documents into clean, validated data." },
        { title: "AI-Adaptive Parsing", description: "Language models that adapt to layout changes without manual selector maintenance." },
        { title: "Global Proxy Infrastructure", description: "Global residential proxy network for continuous, unblocked collection." },
        { title: "OSINT & Threat Intelligence", description: "Systematic collection from forums, social media, and dark web surfaces for intelligence agencies." },
        { title: "Regulatory Monitoring", description: "Tracking changes in legislation, sanctions lists, and license databases across jurisdictions." },
        { title: "Scheduling & Alerts", description: "Automated runs with failure detection, change monitoring, and notifications." },
      ],
      capabilities: [
        { title: "Collection Infrastructure", items: ["Global Proxy Network", "Headless Browser Rendering", "Automatic CAPTCHA Resolution"] },
        { title: "Extraction & Transformation", items: ["AI-Adaptive Parsers", "Per-Source Template Library", "Custom Extraction Pipelines"] },
        { title: "Delivery & Governance", items: ["API/Webhook/S3 Delivery", "Full Provenance Logging", "PII Redaction & Compliance"] },
      ],
      cta: {
        title: "Deploy your collectors",
        description: "Schedule an evaluation of your data extraction needs.",
        action: { label: "Schedule Evaluation", href: "/agendar" },
      },
    },
  },
  liveStudioTeaser: {
    eyebrow: "NEW DIVISION",
    kicker: "ORBEXS LIVE STUDIO",
    title: "A TikTok LIVE studio operated by a software factory.",
    description:
      "We produce live broadcasts for LATAM creators from our own sets, running on the same infrastructure, redundancy, and automation we build for critical operations.",
    points: [
      "Sets calibrated for 9:16 vertical production",
      "Redundant network with autonomous remediation mid-broadcast",
      "Training, schedule, and in-house analytics for every creator",
    ],
    action: { label: "Explore the studio", href: "/estudio-tiktok-live" },
  },
  liveStudio: {
    eyebrow: "ORBEXS LIVE STUDIO",
    status: "TIKTOK LIVE AGENCY APPLICATION UNDER REVIEW",
    onAir: "ON AIR",
    titleLead: "The",
    titleAccent: "TikTok LIVE",
    titleTail: "studio for LATAM.",
    subtitle: "We recruit creators, train them, and keep the live operation standing.",
    description:
      "Orbexs Live Studio is our live production division: recruitment and training for Latin American creators, with two working modes — on-site in our booths or remote from your own setup — running on the same critical-systems engineering we deploy for governments and large organizations.",
    primaryAction: { label: "Apply as a creator" },
    secondaryAction: { label: "Talk to the brand team", href: "/agendar" },
    whatsappMessage:
      "Hi, I'd like to apply as a creator to Orbexs Live Studio (TikTok LIVE). Here's my profile:",
    marqueeLabel: "Phase one markets",
    marquee: [
      "Colombia",
      "Mexico",
      "Peru",
      "Chile",
      "Argentina",
      "Ecuador",
      "Vertical talent",
      "Live groups",
      "Gaming",
      "Live music",
      "Entertainment",
    ],
    stats: [
      { value: "9:16", label: "Native format", description: "Studio booths are calibrated for vertical production; remote creators get the checklist to match it." },
      { value: "24/7", label: "Continuous schedule", description: "Rotating creator shifts, on-site and remote, with permanent broadcast staff." },
      { value: "<60 s", label: "Network recovery", description: "Autonomous detection and remediation of studio infrastructure incidents while on air." },
      { value: "5", label: "Phase-one markets", description: "Initial operation focused on the highest-traction Spanish-speaking markets." },
    ],
    thesis: {
      eyebrow: "THE THESIS",
      title: "The bottleneck in live isn't talent. It's operations.",
      paragraphs: [
        "LATAM has no shortage of talent — it has a shortage of infrastructure. A creator can have an audience and a rhythm, then lose hours of air time to a dropped connection, an outdated driver, or a badly lit frame. Every minute off air is audience and revenue that doesn't come back.",
        "We already solved that problem for live production clients: we deployed an AI agent that runs the infrastructure helpdesk end to end, diagnoses and remediates incidents autonomously, and escalates to a human technician only when it has to.",
        "Orbexs Live Studio is that same stack, now operated by us and put to work for creators. We're not an agency that outsources its technology — we're the software factory that builds it.",
      ],
    },
    program: {
      eyebrow: "CREATOR PROGRAM",
      title: "From casting to a stable schedule.",
      description:
        "A four-stage path designed to take a creator from application to a sustainable live operation, with support at every point.",
      steps: [
        {
          step: "01",
          title: "Casting",
          description: "Profile assessment, identity verification, and definition of the content vertical.",
          details: ["Profile and content review", "Identity and age verification", "Vertical definition", "Written terms upfront"],
        },
        {
          step: "02",
          title: "Training",
          description: "LIVE Academy: session structure, pacing, retention, and real-time community handling.",
          details: ["Session structure and script", "Retention in the first 30 s", "Moderation and community", "Platform best practices"],
        },
        {
          step: "03",
          title: "Production",
          description: "A fixed block in the schedule, from a studio booth or your own setup.",
          details: ["On-site or remote mode", "Assigned shift manager", "Fixed schedule block", "Technical support while on air"],
        },
        {
          step: "04",
          title: "Scaling",
          description: "Data review, biweekly coaching, and expansion into collaborations and brand campaigns.",
          details: ["Per-session metrics panel", "Biweekly coaching", "Creator collaborations", "Access to brand campaigns"],
        },
      ],
    },
    modalities: {
      eyebrow: "TWO MODES",
      title: "Choose how you go live.",
      description:
        "The studio recruits and trains; what separates one mode from the other is where you broadcast and who supplies the gear. We say it before you apply, not after.",
      providesLabel: "Orbexs provides",
      requiresLabel: "You provide",
      items: [
        {
          tag: "ON-SITE",
          title: "At the studio",
          description:
            "You broadcast from our booths, using studio equipment and taking part in live groups: themed group shows — battles, dance, challenges — where several creators carry the stream around a theme that drives the show.",
          provides: [
            "Equipped booth calibrated for 9:16",
            "Themed live groups with other creators",
            "Broadcast staff in the booth",
            "Redundant connectivity with autonomous remediation",
            "Full LIVE training",
            "Assigned schedule block and per-session analytics",
            "Shift manager",
            "Access to brand campaigns",
          ],
          requires: ["Attendance at your assigned shift", "Consistency on the schedule"],
        },
        {
          tag: "REMOTE",
          title: "From your place",
          description:
            "You broadcast with your own equipment from wherever you are. You get the same training, schedule, and studio support, but the setup is on you: we don't supply devices or equipment for remote use.",
          provides: [
            "Full LIVE training",
            "Assigned schedule block and per-session analytics",
            "Shift manager and ongoing support",
            "Technical setup checklist",
            "Access to brand campaigns",
          ],
          requires: [
            "Your broadcasting device",
            "Your stable internet connection",
            "Your space and lighting",
            "Consistency on the schedule",
          ],
        },
      ],
    },
    infrastructure: {
      eyebrow: "THE ORBEXS EDGE",
      title: "Booths built like a critical system.",
      description:
        "What follows describes the infrastructure of our booths — the advantage of the on-site mode. The difference isn't the cameras: it's what happens when something fails halfway through a broadcast.",
      items: [
        { title: "Sets calibrated for 9:16", description: "Lighting, audio, and framing configured specifically for the vertical feed — not adapted from a horizontal set." },
        { title: "Redundant connectivity", description: "Dual internet providers with automatic failover to mobile network when the primary link degrades." },
        { title: "Autonomous helpdesk", description: "An AI agent monitors studio infrastructure, diagnoses incidents, and executes remediation without waiting for a technician to be available." },
        { title: "In-house creator analytics", description: "A panel with minute-by-minute retention, engagement curve, and peak-performance windows — data to decide with, not screenshots." },
        { title: "Schedule continuity", description: "If a block goes down, the system reassigns set and shift so the studio never loses its signal on air." },
        { title: "Operated to our own standard", description: "The same monitoring, incident response, and traceability processes we apply in enterprise deployments." },
      ],
    },
    creators: {
      eyebrow: "FOR CREATORS",
      title: "What you get when you join the studio.",
      items: [
        { title: "Transparent terms", description: "Rules, targets, and revenue share in writing from day one. No fine print, no verbal agreements." },
        { title: "No entry fee", description: "Joining the studio costs nothing. On-site you use our booth; remote you broadcast with your own equipment." },
        { title: "LIVE Academy", description: "Hands-on training in session structure, retention, moderation, and sustained growth — the core of what the studio provides in both modes." },
        { title: "Shift manager", description: "Someone from the studio on the broadcast in real time — not a chat that replies the next day." },
        { title: "Actionable metrics", description: "Our own panel with a read on every session and concrete recommendations for the next one." },
        { title: "Community and collaborations", description: "Cross-overs between studio creators to trade audience and sustain growth." },
      ],
    },
    brands: {
      eyebrow: "FOR BRANDS",
      title: "Live presence, with real reporting.",
      description:
        "We work with brands that want to be inside the live conversation, not next to it. Every activation ships with measurement, not estimates.",
      items: [
        { title: "Live campaigns", description: "Product integrations inside the session, scripted with the creator and rehearsed before air." },
        { title: "Sponsored sets", description: "Booth styling with brand identity across defined blocks of the schedule." },
        { title: "Performance reporting", description: "Post-campaign delivery with audience, retention, engagement, and per-session results." },
      ],
      action: { label: "Book a commercial meeting", href: "/agendar" },
    },
    faq: {
      title: "Frequently asked questions",
      subtitle: "What every creator asks before applying.",
      items: [
        {
          question: "Is Orbexs Live Studio an official TikTok agency?",
          answer:
            "Our application to operate as a LIVE agency is under review. In the meantime we operate as an independent production studio: the sets, training, staff, and infrastructure are ours. We'll publish any change of status as soon as it's confirmed — we don't claim an affiliation that doesn't exist yet.",
        },
        {
          question: "Do I need a large audience to apply?",
          answer:
            "No. We assess consistency, willingness to broadcast regularly, and fit with one of our verticals. The program is designed to grow an audience inside the studio, not to require one as an entry condition.",
        },
        {
          question: "Do I have to pay anything to join?",
          answer:
            "There's no entry fee in either mode. What changes is the equipment: on-site you use the studio's equipped booth, and remote you broadcast with your own device and your own connection. We don't supply equipment for remote use. Participation terms are put in writing before you start.",
        },
        {
          question: "Can I broadcast from home, or does it have to be at the studio?",
          answer:
            "Both modes exist and you choose when you apply. On-site gives you an equipped booth, staff on the floor, redundant connectivity, and a place in the studio's live groups. Remote gives you the same training, schedule, analytics, and shift manager, but the setup is yours.",
        },
        {
          question: "What do I need for the remote mode?",
          answer:
            "Your own broadcasting device, a stable internet connection, and a space with reasonable lighting. We hand you a technical checklist for vertical framing, audio, and network settings, but the equipment is yours: the studio does not lend or finance devices for remote use.",
        },
        {
          question: "What are live groups?",
          answer:
            "They're group shows we produce at the studio: several creators broadcasting together around a theme that drives the show, with battles, dance, and challenges. They need the booths and staff coordination, so they're exclusive to the on-site mode.",
        },
        {
          question: "What happens if the internet drops mid-broadcast?",
          answer:
            "That's exactly the problem this studio was designed around. Every booth runs on a dual link with automatic failover, and an autonomous agent diagnoses and remediates infrastructure incidents while on air, escalating to a human technician only when automatic remediation doesn't resolve it.",
        },
      ],
    },
    cta: {
      title: "Apply to the studio.",
      description:
        "We're assembling the first cohort of Orbexs Live Studio creators. If you already go live — or want to start — write to us and let's talk.",
      action: { label: "Apply as a creator" },
      secondary: { label: "I'm a brand", href: "/agendar" },
    },
    disclaimer:
      "TikTok is a trademark of its respective owners. Orbexs Live Studio is an independent production studio; our LIVE agency application is under review and this reference implies no affiliation, sponsorship, or official endorsement.",
  },
  investorsPage: {
    eyebrow: "INVESTORS",
    title: "Infrastructure for the era of digital sovereignty.",
    subtitle: "We are building the software, artificial intelligence, and cybersecurity layer that governments and enterprises need to operate with total technological independence.",
    thesis: {
      title: "Investment Thesis",
      paragraphs: [
        "The world is moving toward digital sovereignty. Governments and large corporations can no longer depend on third-party infrastructure for their most sensitive operations. Artificial intelligence, cybersecurity, and critical process automation must operate within each organization's perimeter.",
        "Orbexs builds exactly that: the software infrastructure that enables high-demand organizations to operate with sovereign AI, defend themselves with autonomous cybersecurity agents, and automate regulated workflows with complete traceability.",
        "Our approach combines high-level systems engineering with on-premise deployment, private language models, and Zero-Trust architecture — all designed for the most demanding standards of the enterprise and government market.",
      ],
    },
    market: {
      title: "Market Opportunity",
      description: "Three exponentially growing verticals converge in our value proposition.",
      segments: [
        { title: "Enterprise Sovereign AI", description: "Organizations migrating from public AI APIs to private infrastructure due to regulation, security, and sensitive data control." },
        { title: "Agentic Cybersecurity", description: "The next generation of cyber defense: autonomous agents that detect and respond in real time, without human intervention." },
        { title: "Government Automation", description: "Governments digitizing critical workflows with strict requirements for traceability, compliance, and data sovereignty." },
      ],
    },
    team: {
      title: "Founding Team",
      description: "Engineering and strategy behind Orbexs.",
      members: [
        { name: "Johan Rocuts", initials: "JR", role: "CEO - Chief Executive Officer", bio: "High-scale digital product strategist. Defines Orbexs's product vision and market strategy in the enterprise and government sector." },
        { name: "Yeison Grisales", initials: "YG", role: "CCO - Chief Commercial Officer", bio: "Specialist in B2B technology solutions. Manages commercial relationships and Orbexs's expansion in regulated industries." },
        { name: "Cristian Mancilla", initials: "CM", role: "CTO - Chief Technology Officer", bio: "Specialist in distributed systems architecture and high-availability platforms. Leads the technical design of all Orbexs solutions." },
        { name: "Andres Rodriguez", initials: "AR", role: "Senior Full Stack Engineer", bio: "Expert in high-performance web development. Builds the interfaces and systems that connect Orbexs's technology with end users." },
      ],
    },
    vision: {
      quote: "Digital sovereignty is not a trend — it is the inevitable standard for every organization operating with sensitive data. We are building the infrastructure that makes it possible.",
      author: "Johan Rocuts",
      role: "CEO, Orbexs",
    },
    cta: {
      title: "Let's Talk",
      description: "If you share our vision for the future of digital sovereignty, we would love to have a conversation.",
      email: "contact@orbexs.tech",
      action: { label: "Contact Us", href: "mailto:contact@orbexs.tech" },
    },
  },
  aboutPage: {
    eyebrow: "ABOUT US",
    title: "Precision engineering for the digital era.",
    subtitle: "We are a team of engineers and strategists building the technological infrastructure that governments and enterprises need to operate with sovereignty, security, and autonomy.",
    mission: {
      title: "Our Mission",
      description: "Build mission-critical software, sovereign artificial intelligence systems, and agentic cybersecurity platforms that enable high-demand organizations to operate with total technological independence. We don't sell smoke or generic solutions. We design, develop, and operate infrastructure that works under the highest standards in the world.",
    },
    methodology: {
      title: "The Orbexs Standard",
      phaseLabel: "Phase",
      description: "Our engineering process is designed to eliminate uncertainty and guarantee value delivery on every deployment.",
      steps: [
        { num: "01", title: "Diagnostics & Technical Audit", desc: "Exhaustive analysis of your current infrastructure and definition of business objectives." },
        { num: "02", title: "Systems & Data Architecture", desc: "Technical solution modeling to ensure long-term scalability and maintainability." },
        { num: "03", title: "Engineering & Development", desc: "Core system construction and integration of custom intelligent logic." },
        { num: "04", title: "Validation & QA", desc: "Stress and security testing to guarantee zero-downtime deployments." },
        { num: "05", title: "Operations & Evolution", desc: "Strategic monitoring, optimization, and specialized technical support." },
      ],
    },
    team: {
      title: "Our Team",
      description: "Engineering and strategy behind Orbexs.",
      members: [
        { name: "Johan Rocuts", initials: "JR", role: "CEO - Chief Executive Officer", bio: "High-scale digital product strategist focused on enterprise and government markets." },
        { name: "Mauricio Solano", initials: "MS", role: "Sales Director", bio: "Specialist in consultative B2B sales. Leads business development and relationships with enterprise and government clients." },
        { name: "Yeison Grisales", initials: "YG", role: "CCO - Chief Commercial Officer", bio: "Specialist in B2B technology solutions for regulated industries." },
        { name: "Cristian Mancilla", initials: "CM", role: "CTO - Chief Technology Officer", bio: "Specialist in distributed systems architecture and high-availability platforms." },
        { name: "Andres Rodriguez", initials: "AR", role: "Senior Full Stack Engineer", bio: "Expert in high-performance web development and enterprise interface systems." },
      ],
    },
    values: {
      title: "Principles",
      items: [
        { title: "Precision over speed", description: "Every line of code, every architecture decision, and every deployment is designed to last." },
        { title: "Sovereignty as standard", description: "Our clients' technological independence is non-negotiable." },
        { title: "Engineering over promises", description: "We deliver functional infrastructure, not presentations with speculative roadmaps." },
      ],
    },
    cta: {
      title: "Let's build together.",
      description: "If your organization needs high-level technological infrastructure, let's talk.",
      action: { label: "Schedule Evaluation", href: "/agendar" },
    },
  },
  schedule: {
    badge: "Schedule a Meeting",
    pageTitle: "Let's Talk About Your Project",
    pageSubtitle:
      "Complete the form and we'll get in touch to coordinate a meeting.",
    nameLabel: "Full name",
    namePlaceholder: "Jane Smith",
    emailLabel: "Email",
    emailPlaceholder: "name@company.com",
    companyLabel: "Company (optional)",
    companyPlaceholder: "Acme Corp",
    topicLabel: "Topic of interest",
    topics: [
      "Sovereign AI",
      "Cybersecurity",
      "Digital Workforce",
      "Critical Systems",
      "Orbexs Live Studio (TikTok LIVE)",
      "Technical Consulting",
      "Other",
    ],
    messageLabel: "Message (optional)",
    messagePlaceholder:
      "Tell us briefly about your project or need...",
    submitButton: "Send Request",
    successTitle: "Request Sent",
    successMessage:
      "Thank you for reaching out. We'll get back to you shortly.",
    whatsappButton: "Continue via WhatsApp",
    backButton: "Back to Home",
  },
} as const

export default en
