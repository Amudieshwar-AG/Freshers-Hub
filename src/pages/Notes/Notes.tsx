import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Download, Filter, BookOpen, FileText, ScrollText, BookMarked, ChevronRight, ArrowLeft, ExternalLink, Code, Globe, GitBranch, Cloud, Palette, Shield, DollarSign, BarChart3, Users, Megaphone, TrendingUp, UserCheck, ClipboardList, ShoppingCart, Cpu, Activity, LayoutGrid, Layers, Zap, Settings, Gauge, Radio, Wifi, Bot, Sun, Wrench, Binary, BatteryCharging, CircuitBoard, ShieldCheck, BrainCircuit, FlaskConical, Lock, Terminal, Dna, Microscope, Sparkles, Smartphone, Monitor, Server, CheckCircle2, Database, Briefcase } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { TOOLKIT_ITEMS, DEPARTMENTS } from '@/constants';

const SEMESTERS = ['All', '1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

const SUBJECTS_BY_SEM: Record<number, string[]> = {
  1: [
    "Communicative English",
    "Matrices and Calculus",
    "Physics for Information Science",
    "Problem Solving and C Programming",
    "Basic Electrical and Electronics Engineering",
    "Heritage of Tamils",
    "Physics Laboratory",
    "Problem Solving and C Programming Laboratory",
    "Engineering Practices Laboratory"
  ],
  2: [
    "Professional English",
    "Engineering Chemistry",
    "Statistics and Numerical Methods",
    "Python for Data Science",
    "Tamils and Technology",
    "Engineering Graphics",
    "Data Structures Design",
    "Chemistry Laboratory",
    "Python for Data Science Laboratory",
    "Communication Laboratory"
  ]
};

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: React.ComponentType<any> }> = {
  notes: { bg: '#EFF6FF', text: '#3B82F6', icon: BookOpen },
  pyq: { bg: '#FFF7ED', text: '#F97316', icon: FileText },
  syllabus: { bg: '#ECFDF5', text: '#10B981', icon: ScrollText },
  assignment: { bg: '#FDF2F8', text: '#EC4899', icon: BookMarked },
};

const NOTES_DATA = [
  { id: '1', title: 'Engineering Mathematics – Unit 1-5', subject: 'Mathematics', department: 'Computer Science & Engineering', semester: 1, type: 'notes', downloads: 348, fileSize: '4.2 MB', uploadedAt: '2025-06-01' },
  { id: '2', title: 'Physics PYQ 2020-2024', subject: 'Physics', department: 'Computer Science & Engineering', semester: 1, type: 'pyq', downloads: 512, fileSize: '8.1 MB', uploadedAt: '2025-06-10' },
  { id: '3', title: 'C Programming Complete Notes', subject: 'Programming', department: 'Computer Science & Engineering', semester: 1, type: 'notes', downloads: 734, fileSize: '6.3 MB', uploadedAt: '2025-06-15' },
  { id: '4', title: 'Data Structures PYQ 2019-2024', subject: 'Data Structures', department: 'Computer Science & Engineering', semester: 3, type: 'pyq', downloads: 621, fileSize: '10.2 MB', uploadedAt: '2025-07-01' },
  { id: '5', title: 'Circuit Theory Full Notes', subject: 'Circuit Theory', department: 'Electronics & Communication', semester: 2, type: 'notes', downloads: 289, fileSize: '5.7 MB', uploadedAt: '2025-06-20' },
  { id: '6', title: 'Anna University Syllabus 2021', subject: 'Syllabus', department: 'All Departments', semester: 1, type: 'syllabus', downloads: 890, fileSize: '2.1 MB', uploadedAt: '2025-05-01' },
  { id: '7', title: 'Thermodynamics Notes', subject: 'Thermodynamics', department: 'Mechanical Engineering', semester: 3, type: 'notes', downloads: 201, fileSize: '3.9 MB', uploadedAt: '2025-06-25' },
  { id: '8', title: 'Digital Electronics PYQ', subject: 'Digital Electronics', department: 'Electronics & Communication', semester: 4, type: 'pyq', downloads: 445, fileSize: '7.3 MB', uploadedAt: '2025-07-05' },
];

const PROGRAMMING_LANGUAGES_GUIDES = [
  {
    name: 'Python',
    tagline: 'Simple, Readable & Beginner-Friendly',
    color: '#3776AB',
    bg: '#EFF6FF',
    whatItIs: 'Python is known for its clean, English-like syntax. It lets you write code quickly without worrying about complex computer memory setups, making it the top choice for beginners.',
    keyConcepts: [
      'Writing your first line of code using print("Hello World!")',
      'Storing numbers, text, and lists in smart variables',
      'Making decisions in code using simple if and else conditions',
      'Automating repetitive tasks effortlessly using loops',
      'Reusing code blocks with custom functions (def)',
      'Using pre-built libraries to build web apps, AI bots, or scrape web data'
    ],
    useCases: ['Web Development (Django, FastAPI)', 'Data Science & Analytics', 'Artificial Intelligence & Machine Learning', 'Automation & Web Scraping'],
    links: [
      { label: 'Official Python Documentation', url: 'https://docs.python.org/3/' },
      { label: 'Python for Beginners Guide', url: 'https://www.python.org/about/gettingstarted/' },
      { label: 'FreeCodeCamp Python Course', url: 'https://www.freecodecamp.org/news/learn-python-free-python-courses-for-beginners/' }
    ]
  },
  {
    name: 'Java',
    tagline: 'Build Once, Run Anywhere',
    color: '#007396',
    bg: '#E0F2FE',
    whatItIs: 'Java powers enterprise apps, banking systems, and Android smartphones. Code written in Java can run on any operating system without modification!',
    keyConcepts: [
      'Understanding Classes & Objects — modeling real-world items in code',
      'Learning how the main() method serves as the starting trigger',
      'Organizing data cleanly using static types like int, String, and boolean',
      'Reusing existing code seamlessly with Inheritance & Interfaces',
      'Handling errors gracefully so applications never crash unexpectedly',
      'Building robust backend services with Spring Boot'
    ],
    useCases: ['Enterprise Backend Systems', 'Android Application Development', 'Financial & Banking Systems', 'Large-Scale Web Services'],
    links: [
      { label: 'Official Oracle Java Docs', url: 'https://docs.oracle.com/en/java/' },
      { label: 'W3Schools Java Tutorial', url: 'https://www.w3schools.com/java/' },
      { label: 'Spring Boot Getting Started', url: 'https://spring.io/guides' }
    ]
  },
  {
    name: 'C++',
    tagline: 'Blazing Speed & Hardware Control',
    color: '#00599C',
    bg: '#EFF6FF',
    whatItIs: 'C++ provides ultimate control over memory and hardware. It is the core language powering high-end video games, operating systems, and flight controllers.',
    keyConcepts: [
      'Compiling human-readable code into ultra-fast machine instructions',
      'Exploring Pointers (*) & Memory Addresses (&) for direct hardware control',
      'Using the Standard Template Library (STL) for instant stacks, queues, and vectors',
      'Structuring programs cleanly with Classes, Structs, and Objects',
      'Solving complex algorithmic puzzles in competitive programming',
      'Building 3D game engines like Unreal Engine'
    ],
    useCases: ['Game Engines (Unreal Engine)', 'Operating Systems & Browsers', 'Competitive Programming & DSA', 'Embedded Systems & Robotics'],
    links: [
      { label: 'cppreference.com Reference', url: 'https://en.cppreference.com/' },
      { label: 'LearnCpp Free Tutorials', url: 'https://www.learncpp.com/' },
      { label: 'GeeksforGeeks C++ Programming', url: 'https://www.geeksforgeeks.org/c-plus-plus/' }
    ]
  },
  {
    name: 'JavaScript',
    tagline: 'The Heartbeat of the Web',
    color: '#D97706',
    bg: '#FEFCE8',
    whatItIs: 'JavaScript brings websites to life! Every button click, popup animation, dynamic page update, and live chat on the web is powered by JavaScript.',
    keyConcepts: [
      'Making web pages interactive by responding to user clicks and keypresses',
      'Changing text, colors, and layouts dynamically on the screen (DOM)',
      'Fetching live data from servers without refreshing the browser (fetch API)',
      'Writing clean code using modern Arrow Functions (() => {})',
      'Handling background actions smoothly using async / await',
      'Building backend web servers using Node.js'
    ],
    useCases: ['Interactive Web Interfaces (React, Vue)', 'Backend Web Servers (Node.js)', 'Full-Stack Web Applications', 'Mobile Apps (React Native)'],
    links: [
      { label: 'MDN JavaScript Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { label: 'JavaScript.info Modern Tutorial', url: 'https://javascript.info/' },
      { label: 'W3Schools JavaScript Guide', url: 'https://www.w3schools.com/js/' }
    ]
  },
  {
    name: 'TypeScript',
    tagline: 'JavaScript with Smart Safety Nets',
    color: '#3178C6',
    bg: '#EFF6FF',
    whatItIs: 'TypeScript is JavaScript with built-in type checking! It acts like an intelligent spell-checker for code, preventing bugs and typos before your app even launches.',
    keyConcepts: [
      'Adding clear types (string, number) to catch bugs as you type',
      'Creating Interfaces to define exact data structures for your app',
      'Enjoying supercharged code suggestions & autocomplete in VS Code',
      'Building scalable React and Next.js web applications',
      'Catching errors during development instead of in production'
    ],
    useCases: ['Enterprise Web Applications', 'Modern React & Next.js Apps', 'Scalable Microservices', 'Large-Scale Team Projects'],
    links: [
      { label: 'Official TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
      { label: 'TypeScript in 5 Minutes', url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html' }
    ]
  },
  {
    name: 'Go (Golang)',
    tagline: 'Built by Google for Cloud Speed',
    color: '#00ADD8',
    bg: '#ECFEFF',
    whatItIs: 'Created at Google for simplicity and lightning speed. Go is famous for powering modern cloud infrastructure like Docker and Kubernetes.',
    keyConcepts: [
      'Writing simple, ultra-clean code without unnecessary syntax clutter',
      'Running thousands of background tasks at once using Goroutines',
      'Passing data safely between parallel tasks using Channels',
      'Building super-fast Web APIs in just a few lines of code',
      'Compiling your entire project into a single fast binary executable'
    ],
    useCases: ['Cloud Platforms (Docker, Kubernetes)', 'High-Speed Microservices', 'DevOps Tools', 'Network Infrastructure'],
    links: [
      { label: 'A Tour of Go (Interactive)', url: 'https://go.dev/tour/' },
      { label: 'Official Go Documentation', url: 'https://go.dev/doc/' }
    ]
  },
  {
    name: 'Rust',
    tagline: 'Maximum Speed Without System Crashes',
    color: '#CE412B',
    bg: '#FFF7ED',
    whatItIs: 'Rust gives you the speed of C++ with memory safety. It guarantees that software will not crash due to memory leaks or unexpected buffer glitches.',
    keyConcepts: [
      'Understanding Ownership — how Rust automatically manages memory',
      'Sharing data safely across code using Borrowing (&)',
      'Handling all possible conditions cleanly with pattern matching (match)',
      'Managing packages, builds, and tests using the Cargo tool',
      'Building high-security web servers, crypto engines, and WebAssembly apps'
    ],
    useCases: ['Systems & Kernel Development', 'WebAssembly (Wasm) Applications', 'High-Performance Networking', 'Blockchain & Security Engines'],
    links: [
      { label: 'The Rust Programming Language Book', url: 'https://doc.rust-lang.org/book/' },
      { label: 'Rust by Example', url: 'https://doc.rust-lang.org/rust-by-example/' }
    ]
  },
  {
    name: 'C# (.NET)',
    tagline: 'Modern, Versatile & Game-Ready',
    color: '#239120',
    bg: '#ECFDF5',
    whatItIs: 'Created by Microsoft, C# is an elegant language widely used for building 3D/2D games in Unity, Windows desktop applications, and web services.',
    keyConcepts: [
      'Writing clean Object-Oriented code with concise Properties',
      'Filtering, searching, and sorting data in 1 line using LINQ',
      'Building immersive video games with the Unity Game Engine',
      'Creating high-speed web APIs using ASP.NET Core',
      'Building cross-platform desktop & mobile apps with .NET MAUI'
    ],
    useCases: ['Unity 3D/2D Game Development', 'Enterprise Web Backends (ASP.NET Core)', 'Windows Desktop Applications', 'Cross-Platform Apps (.NET MAUI)'],
    links: [
      { label: 'Official Microsoft C# Documentation', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/' },
      { label: 'W3Schools C# Guide', url: 'https://www.w3schools.com/cs/' }
    ]
  }
];

const CS_TOOLS_CATEGORIES = [
  {
    title: 'Programming Languages',
    icon: Code,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'Python', desc: 'High-level, beginner-friendly language for AI, Web, & Scripts.', url: '#' },
      { name: 'Java', desc: 'Object-oriented enterprise language running on the JVM.', url: '#' },
      { name: 'C++', desc: 'High-performance systems programming and game development.', url: '#' },
      { name: 'JavaScript', desc: 'Core language of the web for frontend and backend.', url: '#' },
      { name: 'TypeScript', desc: 'Strongly typed superset of JavaScript at scale.', url: '#' },
      { name: 'Go (Golang)', desc: 'Fast, concurrent language for cloud & microservices.', url: '#' },
      { name: 'Rust', desc: 'Ultra-fast memory-safe systems programming language.', url: '#' },
      { name: 'C# (.NET)', desc: 'Versatile OOP language for games, desktop, & web backends.', url: '#' }
    ]
  },
  {
    title: 'Version Control',
    icon: GitBranch,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'Source Code Management', desc: 'Git CLI distributed version control system.', url: 'https://git-scm.com/' },
      { name: 'Repository Hosting', desc: 'GitHub, GitLab, Bitbucket, and Gitea platforms.', url: 'https://github.com/' },
      { name: 'Git Clients', desc: 'GitHub Desktop, GitKraken, Sourcetree, and Lazygit.', url: 'https://desktop.github.com/' },
      { name: 'Code Review', desc: 'GitHub Pull Requests, Crucible, and Gerrit review workflows.', url: 'https://github.com/features/code-review' }
    ]
  },
  {
    title: 'Web Development',
    icon: Globe,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'Frontend Development', desc: 'React, Vue.js, Angular, Svelte, Tailwind CSS, HTML5/CSS3.', url: 'https://react.dev/' },
      { name: 'Backend Development', desc: 'Spring Boot, Express.js, Django, FastAPI, NestJS.', url: 'https://spring.io/projects/spring-boot' },
      { name: 'Full-Stack Development', desc: 'Next.js, Remix, Nuxt.js, and Astro full-stack frameworks.', url: 'https://nextjs.org/' },
      { name: 'Static Site Generators', desc: 'Gatsby, Hugo, Jekyll, and Eleventy.', url: 'https://www.gatsbyjs.com/' },
      { name: 'CMS', desc: 'WordPress, Strapi, Sanity, and Ghost Content Management Systems.', url: 'https://strapi.io/' },
      { name: 'Web Performance', desc: 'Lighthouse, PageSpeed Insights, and Web Vitals analytics.', url: 'https://pagespeed.web.dev/' }
    ]
  },
  {
    title: 'Mobile Development',
    icon: Smartphone,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Android Development', desc: 'Android Studio, Kotlin, Jetpack Compose, and Java.', url: 'https://developer.android.com/studio' },
      { name: 'iOS Development', desc: 'Xcode, Swift, SwiftUI, and CocoaPods.', url: 'https://developer.apple.com/xcode/' },
      { name: 'Cross-Platform Development', desc: 'Flutter, React Native, and Expo framework.', url: 'https://flutter.dev/' },
      { name: 'Mobile Testing', desc: 'Appium, Espresso, and XCUITest automation.', url: 'https://appium.io/' },
      { name: 'App Deployment', desc: 'Google Play Console, Apple App Store Connect, Fastlane.', url: 'https://play.google.com/console' }
    ]
  },
  {
    title: 'Databases',
    icon: Database,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'Relational Databases (SQL)', desc: 'PostgreSQL, MySQL, SQLite, and Microsoft SQL Server.', url: 'https://www.postgresql.org/' },
      { name: 'NoSQL Databases', desc: 'MongoDB, Cassandra, CouchDB, and DynamoDB.', url: 'https://www.mongodb.com/' },
      { name: 'Graph Databases', desc: 'Neo4j, Amazon Neptune, and ArangoDB.', url: 'https://neo4j.com/' },
      { name: 'Time-Series Databases', desc: 'InfluxDB, TimescaleDB, and Prometheus.', url: 'https://www.influxdata.com/' },
      { name: 'In-Memory Databases', desc: 'Redis, Memcached, and Dragonfly.', url: 'https://redis.io/' },
      { name: 'Database Administration', desc: 'pgAdmin, DBeaver, DataGrip, and phpMyAdmin.', url: 'https://www.dbeaver.io/' },
      { name: 'Database Modeling', desc: 'dbdiagram.io, Erwin, and MySQL Workbench.', url: 'https://dbdiagram.io/' }
    ]
  },
  {
    title: 'UI / UX Design',
    icon: Palette,
    color: '#EC4899',
    bg: '#FDF2F8',
    tools: [
      { name: 'Wireframing', desc: 'Balsamiq, Figma, and Whimsical wireframing.', url: 'https://balsamiq.com/' },
      { name: 'Prototyping', desc: 'Figma, Adobe XD, Proto.io, and Framer.', url: 'https://www.figma.com/' },
      { name: 'Design Systems', desc: 'Storybook, Material Design, and Tailwind UI.', url: 'https://storybook.js.org/' },
      { name: 'User Research', desc: 'Maze, UserTesting, and Hotjar analytics.', url: 'https://maze.co/' },
      { name: 'Accessibility Testing', desc: 'axe DevTools, WAVE, and Lighthouse A11y audit.', url: 'https://www.deque.com/axe/' }
    ]
  },
  {
    title: 'Collaboration',
    icon: Users,
    color: '#EAB308',
    bg: '#FEFCE8',
    tools: [
      { name: 'Documentation', desc: 'Confluence, Notion, MkDocs, and Docusaurus.', url: 'https://docusaurus.io/' },
      { name: 'Team Communication', desc: 'Slack, Microsoft Teams, Discord, and Mattermost.', url: 'https://slack.com/' },
      { name: 'Project Management', desc: 'Jira, Trello, Asana, and Linear ticket tracking.', url: 'https://linear.app/' },
      { name: 'Whiteboarding', desc: 'Miro, FigJam, Excalidraw, and Lucidchart.', url: 'https://excalidraw.com/' },
      { name: 'Knowledge Management', desc: 'Obsidian, Notion, and Slite workspace wiki.', url: 'https://obsidian.md/' }
    ]
  },
  {
    title: 'Software Engineering',
    icon: Layers,
    color: '#D97706',
    bg: '#FEF3C7',
    tools: [
      { name: 'UML & System Design', desc: 'Draw.io, PlantUML, Mermaid.js, and StarUML.', url: 'https://mermaid.js.org/' },
      { name: 'Architecture Design', desc: 'C4 Model, ArchiMate, and System Architecture patterns.', url: 'https://c4model.com/' },
      { name: 'Design Patterns', desc: 'Gang of Four (GoF) Creational, Structural, Behavioral patterns.', url: 'https://refactoring.guru/design-patterns' },
      { name: 'Code Analysis', desc: 'SonarQube, ESLint, Pylint, and SpotBugs linters.', url: 'https://eslint.org/' },
      { name: 'Debugging', desc: 'GDB, Chrome DevTools, Visual Studio Debugger, and Charles Proxy.', url: 'https://developer.chrome.com/docs/devtools/' },
      { name: 'Performance Profiling', desc: 'Perf, JProfiler, Py-Spy, and Chrome Memory Profiler.', url: 'https://github.com/benfred/py-spy' }
    ]
  },
  {
    title: 'Networking',
    icon: Wifi,
    color: '#2563EB',
    bg: '#EFF6FF',
    tools: [
      { name: 'Network Analysis', desc: 'Wireshark packet capture and traffic protocol analyzer.', url: 'https://www.wireshark.org/' },
      { name: 'Packet Simulation', desc: 'Cisco Packet Tracer and GNS3 network topology simulation.', url: 'https://www.netacad.com/courses/packet-tracer' },
      { name: 'Port Scanning & Recon', desc: 'Nmap and Masscan network discovery tools.', url: 'https://nmap.org/' },
      { name: 'API & HTTP Debugging', desc: 'Postman, Fiddler, and Charles Proxy HTTP inspection.', url: 'https://www.postman.com/' },
      { name: 'Remote Terminal & SSH', desc: 'PuTTY, OpenSSH, and Termius terminal clients.', url: 'https://www.putty.org/' }
    ]
  }
];

const BUSINESS_TOOLS_CATEGORIES = [
  {
    title: 'Accounting & Finance',
    icon: DollarSign,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'QuickBooks', desc: 'Cloud accounting software for small and mid-sized businesses.', url: 'https://quickbooks.intuit.com/' },
      { name: 'Tally Prime', desc: 'India\'s leading accounting and inventory management solution.', url: 'https://tallysolutions.com/' },
      { name: 'Zoho Books', desc: 'Online accounting software for growing businesses.', url: 'https://www.zoho.com/books/' }
    ]
  },
  {
    title: 'Business Intelligence',
    icon: BarChart3,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'Power BI', desc: 'Microsoft\'s interactive data visualization and BI tool.', url: 'https://powerbi.microsoft.com/' },
      { name: 'Tableau', desc: 'Visual analytics platform for data-driven decisions.', url: 'https://www.tableau.com/' },
      { name: 'Google Looker', desc: 'Business intelligence and data analytics by Google Cloud.', url: 'https://cloud.google.com/looker' }
    ]
  },
  {
    title: 'CRM',
    icon: Users,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Salesforce', desc: 'World\'s leading CRM platform for sales and support.', url: 'https://www.salesforce.com/' },
      { name: 'HubSpot CRM', desc: 'Free CRM with marketing, sales, and service tools.', url: 'https://www.hubspot.com/products/crm' },
      { name: 'Zoho CRM', desc: 'AI-powered CRM for customer lifecycle management.', url: 'https://www.zoho.com/crm/' }
    ]
  },
  {
    title: 'Marketing',
    icon: Megaphone,
    color: '#EC4899',
    bg: '#FDF2F8',
    tools: [
      { name: 'Google Ads', desc: 'Online advertising platform for paid search and display.', url: 'https://ads.google.com/' },
      { name: 'Mailchimp', desc: 'Email marketing and automation platform.', url: 'https://mailchimp.com/' },
      { name: 'Canva', desc: 'Design tool for social media graphics and presentations.', url: 'https://www.canva.com/' }
    ]
  },
  {
    title: 'Sales',
    icon: TrendingUp,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'LinkedIn Sales Navigator', desc: 'Advanced lead generation and prospecting tool.', url: 'https://business.linkedin.com/sales-solutions' },
      { name: 'Pipedrive', desc: 'Sales CRM and pipeline management tool.', url: 'https://www.pipedrive.com/' },
      { name: 'Freshsales', desc: 'AI-powered sales CRM for high-velocity teams.', url: 'https://www.freshworks.com/crm/sales/' }
    ]
  },
  {
    title: 'HR',
    icon: UserCheck,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'BambooHR', desc: 'HR software for onboarding, payroll, and performance.', url: 'https://www.bamboohr.com/' },
      { name: 'Workday', desc: 'Enterprise cloud for finance and human capital management.', url: 'https://www.workday.com/' },
      { name: 'Zoho People', desc: 'HR management system for attendance and leave tracking.', url: 'https://www.zoho.com/people/' }
    ]
  },
  {
    title: 'Project Management',
    icon: ClipboardList,
    color: '#EAB308',
    bg: '#FEFCE8',
    tools: [
      { name: 'Jira', desc: 'Agile project management for software teams.', url: 'https://www.atlassian.com/software/jira' },
      { name: 'Trello', desc: 'Visual boards for organizing tasks and workflows.', url: 'https://trello.com/' },
      { name: 'Asana', desc: 'Work management platform for teams and enterprises.', url: 'https://asana.com/' }
    ]
  },
  {
    title: 'E-commerce',
    icon: ShoppingCart,
    color: '#14B8A6',
    bg: '#F0FDFA',
    tools: [
      { name: 'Shopify', desc: 'All-in-one e-commerce platform for online stores.', url: 'https://www.shopify.com/' },
      { name: 'WooCommerce', desc: 'Open-source e-commerce plugin for WordPress.', url: 'https://woocommerce.com/' },
      { name: 'Razorpay', desc: 'Payment gateway and financial solutions for India.', url: 'https://razorpay.com/' }
    ]
  }
];

const EE_TOOLS_CATEGORIES = [
  {
    title: 'Circuit Design',
    icon: CircuitBoard,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'Analog Circuit Design', desc: 'Design and analysis of analog electronic circuits.', url: 'https://www.analog.com/en/education.html' },
      { name: 'Digital Circuit Design', desc: 'Logic gates, flip-flops, and combinational circuits.', url: 'https://www.nandland.com/' },
      { name: 'Schematic Capture', desc: 'Create circuit schematics for documentation and simulation.', url: 'https://www.kicad.org/' },
      { name: 'Logic Design', desc: 'Boolean algebra, truth tables, and K-map minimization.', url: 'https://www.allaboutcircuits.com/textbook/digital/' }
    ]
  },
  {
    title: 'Circuit Simulation',
    icon: Activity,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'SPICE Simulation', desc: 'Industry-standard analog circuit simulator.', url: 'https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html' },
      { name: 'Mixed-Signal Simulation', desc: 'Simulate both analog and digital signals together.', url: 'https://www.cadence.com/en_US/home.html' },
      { name: 'Power Circuit Simulation', desc: 'Simulate power electronics converters and drives.', url: 'https://www.plexim.com/plecs' },
      { name: 'Signal Analysis', desc: 'Waveform analysis, FFT, and frequency-domain tools.', url: 'https://www.mathworks.com/products/signal.html' }
    ]
  },
  {
    title: 'PCB Design',
    icon: LayoutGrid,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'PCB Layout', desc: 'Component placement and board layout design.', url: 'https://www.kicad.org/' },
      { name: 'PCB Routing', desc: 'Signal trace routing and impedance matching.', url: 'https://www.altium.com/' },
      { name: 'Design Rule Checking (DRC)', desc: 'Validate PCB designs against manufacturing rules.', url: 'https://www.orcad.com/' },
      { name: 'PCB Manufacturing', desc: 'Gerber file generation and fabrication services.', url: 'https://jlcpcb.com/' }
    ]
  },
  {
    title: 'Embedded Systems',
    icon: Cpu,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Firmware Development', desc: 'Low-level C/C++ programming for microcontrollers.', url: 'https://www.embedded.com/' },
      { name: 'RTOS', desc: 'Real-Time Operating Systems like FreeRTOS and Zephyr.', url: 'https://www.freertos.org/' },
      { name: 'ARM Development', desc: 'ARM Cortex-M/A development with Keil and STM32CubeIDE.', url: 'https://developer.arm.com/' },
      { name: 'Embedded Linux', desc: 'Linux kernel and Yocto Project for embedded platforms.', url: 'https://www.yoctoproject.org/' }
    ]
  },
  {
    title: 'Microcontrollers & Processors',
    icon: Settings,
    color: '#EC4899',
    bg: '#FDF2F8',
    tools: [
      { name: 'Arduino', desc: 'Open-source electronics platform for prototyping.', url: 'https://www.arduino.cc/' },
      { name: 'STM32', desc: 'ARM Cortex-M based 32-bit microcontroller family.', url: 'https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html' },
      { name: 'PIC', desc: 'Microchip PIC microcontrollers for embedded applications.', url: 'https://www.microchip.com/en-us/products/microcontrollers-and-microprocessors' },
      { name: 'ESP32', desc: 'Wi-Fi and Bluetooth SoC for IoT applications.', url: 'https://www.espressif.com/en/products/socs/esp32' },
      { name: 'Raspberry Pi', desc: 'Single-board computer for education and IoT projects.', url: 'https://www.raspberrypi.com/' }
    ]
  },
  {
    title: 'FPGA & HDL',
    icon: Binary,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'Verilog', desc: 'Hardware description language for digital design.', url: 'https://www.chipverify.com/verilog/verilog-tutorial' },
      { name: 'VHDL', desc: 'VHSIC Hardware Description Language for modeling.', url: 'https://www.nandland.com/vhdl/tutorials/index.html' },
      { name: 'FPGA Programming', desc: 'Xilinx Vivado and Intel Quartus Prime tools.', url: 'https://www.xilinx.com/products/design-tools/vivado.html' },
      { name: 'Logic Synthesis', desc: 'RTL to gate-level netlist conversion tools.', url: 'https://www.synopsys.com/implementation-and-signoff/rtl-synthesis.html' }
    ]
  },
  {
    title: 'VLSI & Semiconductor',
    icon: Layers,
    color: '#EAB308',
    bg: '#FEFCE8',
    tools: [
      { name: 'Digital IC Design', desc: 'Standard cell design and synthesis flow.', url: 'https://www.synopsys.com/' },
      { name: 'Analog IC Design', desc: 'Transistor-level design using Cadence Virtuoso.', url: 'https://www.cadence.com/' },
      { name: 'Physical Design', desc: 'Floor planning, placement, CTS, and routing.', url: 'https://www.synopsys.com/implementation-and-signoff.html' },
      { name: 'Verification', desc: 'SystemVerilog, UVM, and formal verification.', url: 'https://verificationacademy.com/' },
      { name: 'DFT', desc: 'Design for Testability — scan chains and BIST.', url: 'https://www.synopsys.com/implementation-and-signoff/test-automation.html' },
      { name: 'Semiconductor Process', desc: 'Fabrication process design and TCAD simulation.', url: 'https://www.silvaco.com/' }
    ]
  },
  {
    title: 'Power Systems',
    icon: Zap,
    color: '#DC2626',
    bg: '#FEF2F2',
    tools: [
      { name: 'Power Generation', desc: 'Thermal, hydro, and nuclear generation systems.', url: 'https://www.energy.gov/' },
      { name: 'Transmission', desc: 'High-voltage AC/DC transmission line analysis.', url: 'https://www.etap.com/' },
      { name: 'Distribution', desc: 'Medium and low-voltage distribution networks.', url: 'https://www.schneider-electric.com/' },
      { name: 'Load Flow Analysis', desc: 'Power flow studies using Newton-Raphson method.', url: 'https://www.digsilent.de/' },
      { name: 'Protection Systems', desc: 'Relay coordination and fault analysis.', url: 'https://www.selinc.com/' }
    ]
  },
  {
    title: 'Power Electronics',
    icon: BatteryCharging,
    color: '#7C3AED',
    bg: '#EDE9FE',
    tools: [
      { name: 'Converters', desc: 'DC-DC buck, boost, and flyback converter design.', url: 'https://www.ti.com/power-management/overview.html' },
      { name: 'Inverters', desc: 'DC-AC inverter topologies and PWM control.', url: 'https://www.infineon.com/' },
      { name: 'Motor Drives', desc: 'Variable frequency drives and motor control.', url: 'https://www.mathworks.com/solutions/power-electronics-control.html' },
      { name: 'Battery Management', desc: 'BMS design, SoC estimation, and cell balancing.', url: 'https://www.ti.com/battery-management/overview.html' }
    ]
  },
  {
    title: 'Industrial Automation',
    icon: Settings,
    color: '#059669',
    bg: '#ECFDF5',
    tools: [
      { name: 'PLC', desc: 'Programmable Logic Controllers — Siemens, Allen-Bradley.', url: 'https://new.siemens.com/global/en/products/automation.html' },
      { name: 'SCADA', desc: 'Supervisory Control and Data Acquisition systems.', url: 'https://www.inductiveautomation.com/' },
      { name: 'HMI', desc: 'Human-Machine Interface panel design.', url: 'https://www.weintek.com/' },
      { name: 'Industrial Networking', desc: 'Modbus, PROFINET, and EtherNet/IP protocols.', url: 'https://www.moxa.com/' }
    ]
  },
  {
    title: 'Instrumentation & Measurement',
    icon: Gauge,
    color: '#0891B2',
    bg: '#ECFEFF',
    tools: [
      { name: 'Data Acquisition', desc: 'DAQ systems using NI and Keysight hardware.', url: 'https://www.ni.com/en/shop/data-acquisition.html' },
      { name: 'Sensors', desc: 'Temperature, pressure, and proximity sensor systems.', url: 'https://www.te.com/en/industries/sensor-solutions.html' },
      { name: 'Calibration', desc: 'Instrument calibration standards and procedures.', url: 'https://www.fluke.com/en/learn/blog/calibration' },
      { name: 'Signal Conditioning', desc: 'Amplification, filtering, and ADC conversion.', url: 'https://www.analog.com/en/applications/technology/signal-conditioning.html' }
    ]
  },
  {
    title: 'Signal Processing',
    icon: Radio,
    color: '#2563EB',
    bg: '#EFF6FF',
    tools: [
      { name: 'DSP', desc: 'Digital Signal Processing algorithms and filters.', url: 'https://www.mathworks.com/products/dsp-system.html' },
      { name: 'Audio Processing', desc: 'Audio codec design and real-time processing.', url: 'https://www.audacityteam.org/' },
      { name: 'Image Processing', desc: 'Computer vision and image filtering techniques.', url: 'https://opencv.org/' },
      { name: 'Communication Signals', desc: 'Modulation, demodulation, and baseband processing.', url: 'https://www.gnuradio.org/' }
    ]
  },
  {
    title: 'Communication Systems',
    icon: Wifi,
    color: '#7C3AED',
    bg: '#F5F3FF',
    tools: [
      { name: 'Wireless Communication', desc: '4G/5G, Wi-Fi, and Bluetooth protocol stacks.', url: 'https://www.3gpp.org/' },
      { name: 'RF Design', desc: 'RF amplifier, mixer, and filter circuit design.', url: 'https://www.keysight.com/us/en/solutions/rf-microwave.html' },
      { name: 'Antenna Design', desc: 'Patch, dipole, and phased-array antenna simulation.', url: 'https://www.ansys.com/products/electronics/ansys-hfss' },
      { name: 'Optical Communication', desc: 'Fiber optic systems, WDM, and photonic devices.', url: 'https://www.corning.com/optical-communications' }
    ]
  },
  {
    title: 'IoT & Edge Computing',
    icon: Globe,
    color: '#14B8A6',
    bg: '#F0FDFA',
    tools: [
      { name: 'Sensor Integration', desc: 'Connect sensors to IoT gateways and cloud.', url: 'https://www.balena.io/' },
      { name: 'IoT Platforms', desc: 'AWS IoT, Azure IoT Hub, and ThingsBoard.', url: 'https://aws.amazon.com/iot/' },
      { name: 'Edge Devices', desc: 'NVIDIA Jetson and Intel NUC for edge AI.', url: 'https://developer.nvidia.com/embedded-computing' },
      { name: 'Cloud Connectivity', desc: 'MQTT, CoAP, and HTTP for device-to-cloud.', url: 'https://mosquitto.org/' }
    ]
  },
  {
    title: 'Robotics & Control Systems',
    icon: Bot,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'Motion Control', desc: 'Servo motors, stepper motors, and trajectory planning.', url: 'https://www.mathworks.com/solutions/robotics.html' },
      { name: 'PID Control', desc: 'Proportional-Integral-Derivative controller tuning.', url: 'https://www.mathworks.com/discovery/pid-control.html' },
      { name: 'Robotics Programming', desc: 'ROS (Robot Operating System) and Gazebo simulation.', url: 'https://www.ros.org/' },
      { name: 'Autonomous Systems', desc: 'Navigation, SLAM, and path-planning algorithms.', url: 'https://www.theconstructsim.com/' }
    ]
  },
  {
    title: 'Renewable Energy',
    icon: Sun,
    color: '#EAB308',
    bg: '#FEFCE8',
    tools: [
      { name: 'Solar Systems', desc: 'PV panel sizing, MPPT, and inverter design.', url: 'https://pvpmc.sandia.gov/' },
      { name: 'Wind Energy', desc: 'Wind turbine aerodynamics and generator control.', url: 'https://www.nrel.gov/wind/' },
      { name: 'Energy Storage', desc: 'Battery tech, supercapacitors, and fuel cells.', url: 'https://www.energy.gov/eere/vehicles/batteries' },
      { name: 'Smart Grid', desc: 'Demand response, AMI, and grid-tied systems.', url: 'https://www.smartgrid.gov/' }
    ]
  },
  {
    title: 'Hardware Testing & Debugging',
    icon: Wrench,
    color: '#64748B',
    bg: '#F1F5F9',
    tools: [
      { name: 'Oscilloscopes', desc: 'Waveform capture and time-domain analysis.', url: 'https://www.keysight.com/us/en/products/oscilloscopes.html' },
      { name: 'Logic Analyzers', desc: 'Digital signal capture for protocol debugging.', url: 'https://www.saleae.com/' },
      { name: 'Multimeters', desc: 'Voltage, current, and resistance measurement.', url: 'https://www.fluke.com/en/products/digital-multimeters' },
      { name: 'Signal Generators', desc: 'Function generators and arbitrary waveform sources.', url: 'https://www.keysight.com/us/en/products/signal-generators.html' },
      { name: 'Hardware Debugging', desc: 'JTAG, SWD, and boundary-scan debugging tools.', url: 'https://www.segger.com/products/debug-probes/j-link/' }
    ]
  }
];

const CYBERSECURITY_TOOLS_CATEGORIES = [
  {
    title: 'Network Security',
    icon: ShieldCheck,
    color: '#EF4444',
    bg: '#FEF2F2',
    tools: [
      { name: 'Firewalls', desc: 'pfSense, OPNsense, and Palo Alto Next-Gen Firewalls.', url: 'https://www.pfsense.org/' },
      { name: 'Intrusion Detection Systems (IDS)', desc: 'Snort and Suricata network IDS monitoring.', url: 'https://www.snort.org/' },
      { name: 'Intrusion Prevention Systems (IPS)', desc: 'Real-time threat blocking and inline prevention.', url: 'https://suricata.io/' },
      { name: 'VPN', desc: 'OpenVPN and WireGuard secure encrypted tunnels.', url: 'https://openvpn.net/' },
      { name: 'Network Monitoring', desc: 'Nagios, Zabbix, and PRTG network health tracking.', url: 'https://www.zabbix.com/' },
      { name: 'Network Traffic Analysis', desc: 'Wireshark and Zeek deep packet inspection.', url: 'https://www.wireshark.org/' }
    ]
  },
  {
    title: 'Penetration Testing',
    icon: Terminal,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'Web Application Testing', desc: 'Burp Suite and OWASP ZAP for web auditing.', url: 'https://portswigger.net/burp' },
      { name: 'Network Penetration Testing', desc: 'Nmap and Masscan port discovery and auditing.', url: 'https://nmap.org/' },
      { name: 'Wireless Security Testing', desc: 'Aircrack-ng suite for Wi-Fi security assessment.', url: 'https://www.aircrack-ng.org/' },
      { name: 'Exploitation Frameworks', desc: 'Metasploit Framework and Cobalt Strike.', url: 'https://www.metasploit.com/' },
      { name: 'Vulnerability Assessment', desc: 'Nessus and OpenVAS automated security scans.', url: 'https://www.tenable.com/products/nessus' }
    ]
  },
  {
    title: 'Web Security',
    icon: Globe,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'API Security Testing', desc: 'Postman and Akto API vulnerability testing.', url: 'https://www.akto.io/' },
      { name: 'Web Vulnerability Scanning', desc: 'Acunetix and Nikto web server scanners.', url: 'https://cirt.net/Nikto2' },
      { name: 'OWASP Testing', desc: 'OWASP Top 10 guidelines and ZAP testing tools.', url: 'https://owasp.org/' },
      { name: 'Secure Development', desc: 'Security-first architecture and input validation.', url: 'https://cheatsheetseries.owasp.org/' }
    ]
  },
  {
    title: 'Digital Forensics',
    icon: Search,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Disk Forensics', desc: 'Autopsy and Sleuth Kit for disk image investigation.', url: 'https://www.autopsy.com/' },
      { name: 'Memory Forensics', desc: 'Volatility Framework memory dump extraction.', url: 'https://www.volatilityfoundation.org/' },
      { name: 'Mobile Forensics', desc: 'ANDRAGUARD and Cellebrite mobile analysis.', url: 'https://github.com/androguard/androguard' },
      { name: 'Email Forensics', desc: 'Header analysis, SPF/DKIM/DMARC verification.', url: 'https://mha.azurewebsites.net/' },
      { name: 'Malware Forensics', desc: 'FTK Imager and EnCase artifact extraction.', url: 'https://www.exterro.com/ftk-imager' }
    ]
  },
  {
    title: 'Malware Analysis',
    icon: ShieldCheck,
    color: '#DC2626',
    bg: '#FEF2F2',
    tools: [
      { name: 'Static Analysis', desc: 'PEStudio, Cutter, and Ghidra binary disassembly.', url: 'https://ghidra-sre.org/' },
      { name: 'Dynamic Analysis', desc: 'Process Monitor, Wireshark, and RegShot runtime audit.', url: 'https://learn.microsoft.com/en-us/sysinternals/downloads/procmon' },
      { name: 'Reverse Engineering', desc: 'IDA Pro, x64dbg, and Radare2 debugging.', url: 'https://x64dbg.com/' },
      { name: 'Sandbox Analysis', desc: 'Cuckoo Sandbox and ANY.RUN automated analysis.', url: 'https://any.run/' }
    ]
  },
  {
    title: 'Incident Response',
    icon: Shield,
    color: '#EA580C',
    bg: '#FFEDD5',
    tools: [
      { name: 'Threat Hunting', desc: 'YARA rules and Sigma detection rule writing.', url: 'https://virustotal.github.io/yara/' },
      { name: 'Log Analysis', desc: 'ELK Stack (Elasticsearch, Logstash, Kibana).', url: 'https://www.elastic.co/' },
      { name: 'SIEM', desc: 'Splunk and Microsoft Sentinel security monitoring.', url: 'https://www.splunk.com/' },
      { name: 'SOAR', desc: 'Shuffle and Cortex XSOAR automated response.', url: 'https://shuffler.io/' },
      { name: 'Incident Management', desc: 'TheHive and FIR incident tracking platforms.', url: 'https://thehive-project.org/' }
    ]
  },
  {
    title: 'Vulnerability Management',
    icon: FileText,
    color: '#0284C7',
    bg: '#E0F2FE',
    tools: [
      { name: 'Vulnerability Scanning', desc: 'Nessus, Qualys, and OpenVAS scanners.', url: 'https://www.greenbone.net/' },
      { name: 'Patch Management', desc: 'WSUS, Automox, and Ivanti system updates.', url: 'https://www.automox.com/' },
      { name: 'Risk Assessment', desc: 'CVSS scoring and FAIR risk calculation.', url: 'https://www.first.org/cvss/' },
      { name: 'Compliance Checking', desc: 'OpenSCAP and CIS Benchmarks validation.', url: 'https://www.open-scap.org/' }
    ]
  },
  {
    title: 'Identity & Access Management (IAM)',
    icon: Users,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'Authentication', desc: 'OAuth 2.0, OpenID Connect, and SAML 2.0 protocols.', url: 'https://oauth.net/2/' },
      { name: 'Multi-Factor Authentication (MFA)', desc: 'TOTP, YubiKey, and Duo Security 2FA.', url: 'https://www.yubico.com/' },
      { name: 'Single Sign-On (SSO)', desc: 'Okta, Keycloak, and Azure AD SSO integration.', url: 'https://www.keycloak.org/' },
      { name: 'Privileged Access Management (PAM)', desc: 'CyberArk and HashiCorp Boundary PAM.', url: 'https://www.hashicorp.com/products/boundary' },
      { name: 'Directory Services', desc: 'Active Directory, OpenLDAP, and FreeIPA.', url: 'https://www.freeipa.org/' }
    ]
  },
  {
    title: 'Cloud Security',
    icon: Cloud,
    color: '#7C3AED',
    bg: '#F5F3FF',
    tools: [
      { name: 'Cloud Security Monitoring', desc: 'AWS GuardDuty, CloudTrail, and Defender for Cloud.', url: 'https://aws.amazon.com/guardduty/' },
      { name: 'Cloud Configuration', desc: 'Prowler, Scout Suite, and Checkov CSPM tools.', url: 'https://github.com/prowler-cloud/prowler' },
      { name: 'Container Security', desc: 'Trivy, Clair, and Anchore image scanning.', url: 'https://trivy.dev/' },
      { name: 'Kubernetes Security', desc: 'Falco runtime security and Kube-bench hardening.', url: 'https://falco.org/' },
      { name: 'Cloud Compliance', desc: 'SOC 2, ISO 27001, and HIPAA automated audits.', url: 'https://www.cisecurity.org/cis-benchmarks/' }
    ]
  },
  {
    title: 'Endpoint Security',
    icon: Cpu,
    color: '#059669',
    bg: '#ECFDF5',
    tools: [
      { name: 'Antivirus', desc: 'ClamAV, Windows Defender, and Malwarebytes.', url: 'https://www.clamav.net/' },
      { name: 'Endpoint Detection & Response (EDR)', desc: 'Wazuh EDR, CrowdStrike Falcon, and LimaCharlie.', url: 'https://wazuh.com/' },
      { name: 'XDR', desc: 'Extended Detection and Response across network & endpoints.', url: 'https://www.trendmicro.com/' },
      { name: 'Device Management', desc: 'Microsoft Intune and Jamf Pro endpoint control.', url: 'https://www.jamf.com/' },
      { name: 'Endpoint Monitoring', desc: 'Sysmon (System Monitor) telemetry logging.', url: 'https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon' }
    ]
  },
  {
    title: 'Cryptography',
    icon: Lock,
    color: '#4F46E5',
    bg: '#EEF2FF',
    tools: [
      { name: 'Encryption', desc: 'AES-256, RSA-4096, and ECC public-key ciphers.', url: 'https://www.veracrypt.fr/' },
      { name: 'PKI', desc: 'Public Key Infrastructure using HashiCorp Vault / Smallstep.', url: 'https://smallstep.com/' },
      { name: 'Certificate Management', desc: 'Let\'s Encrypt and Certbot automated SSL/TLS.', url: 'https://certbot.eff.org/' },
      { name: 'Key Management', desc: 'HashiCorp Vault and AWS KMS key management.', url: 'https://www.vaultproject.io/' }
    ]
  },
  {
    title: 'Wireless Security',
    icon: Wifi,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'Wi-Fi Security Testing', desc: 'Aircrack-ng, Wifite, and Kismet auditing.', url: 'https://www.kismetwireless.net/' },
      { name: 'Bluetooth Security', desc: 'Ubertooth One and Bluetooth LE sniffing.', url: 'https://greatscottgadgets.com/ubertoothone/' },
      { name: 'RFID/NFC Security', desc: 'Proxmark3 and ChameleonUltra RFID emulation.', url: 'https://proxmark.com/' },
      { name: 'Wireless Packet Analysis', desc: 'Wireshark wireless monitor mode frame capture.', url: 'https://www.wireshark.org/' }
    ]
  },
  {
    title: 'Security Monitoring',
    icon: Activity,
    color: '#D97706',
    bg: '#FEF3C7',
    tools: [
      { name: 'Log Management', desc: 'Logstash, Fluentd, and Rsyslog central collection.', url: 'https://www.fluentd.org/' },
      { name: 'Threat Intelligence', desc: 'MISP, AlienVault OTX, and VirusTotal API.', url: 'https://www.misp-project.org/' },
      { name: 'Security Dashboards', desc: 'Grafana, Kibana, and OpenSearch visualization.', url: 'https://grafana.com/' },
      { name: 'Alert Management', desc: 'Alertmanager and PagerDuty routing.', url: 'https://prometheus.io/docs/alerting/latest/alertmanager/' }
    ]
  },
  {
    title: 'Secure Coding',
    icon: Code,
    color: '#2563EB',
    bg: '#EFF6FF',
    tools: [
      { name: 'Static Code Analysis', desc: 'SonarQube, Semgrep, and Bandit SAST scanners.', url: 'https://semgrep.dev/' },
      { name: 'Dynamic Code Analysis', desc: 'OWASP ZAP and DAST automated security testing.', url: 'https://www.zaproxy.org/' },
      { name: 'Dependency Scanning', desc: 'Snyk, Dependabot, and OWASP Dependency-Check.', url: 'https://snyk.io/' },
      { name: 'Secret Detection', desc: 'Gitleaks, Trufflehog, and SecretScanner.', url: 'https://github.com/gitleaks/gitleaks' }
    ]
  },
  {
    title: 'Password Security',
    icon: Lock,
    color: '#059669',
    bg: '#ECFDF5',
    tools: [
      { name: 'Password Managers', desc: 'Bitwarden, 1Password, and KeePassXC.', url: 'https://keepassxc.org/' },
      { name: 'Password Auditing', desc: 'John the Ripper and Hashcat password cracking.', url: 'https://www.openwall.com/john/' },
      { name: 'Hash Analysis', desc: 'CyberChef and Hash-Identifier analysis utilities.', url: 'https://gchq.github.io/CyberChef/' },
      { name: 'Credential Testing', desc: 'HaveIBeenPwned API and breach database checking.', url: 'https://haveibeenpwned.com/' }
    ]
  },
  {
    title: 'Training & Practice',
    icon: Shield,
    color: '#7C3AED',
    bg: '#F5F3FF',
    tools: [
      { name: 'Capture The Flag (CTF)', desc: 'picoCTF, Hack The Box, and TryHackMe labs.', url: 'https://tryhackme.com/' },
      { name: 'Cyber Labs', desc: 'Hack The Box and PortSwigger Web Security Academy.', url: 'https://portswigger.net/web-security' },
      { name: 'Virtual Machines', desc: 'Metasploitable, DVWA (Damn Vulnerable Web App), and VulnHub.', url: 'https://www.vulnhub.com/' },
      { name: 'Attack Simulation', desc: 'Caldera and Atomic Red Team threat simulation.', url: 'https://atomicredteam.io/' },
      { name: 'Security Awareness', desc: 'KnowBe4 and PhishInsight phishing simulations.', url: 'https://www.knowbe4.com/' }
    ]
  },
  {
    title: 'Operating Systems',
    icon: Terminal,
    color: '#0284C7',
    bg: '#E0F2FE',
    tools: [
      { name: 'Kali Linux', desc: 'Debian-derived Linux distribution designed for digital forensics & penetration testing.', url: 'https://www.kali.org/' },
      { name: 'Parrot Security OS', desc: 'Security-oriented operating system for cyber research, forensics, and privacy.', url: 'https://www.parrotsec.org/' },
      { name: 'Tails OS', desc: 'Portable operating system protecting against surveillance and censorship via Tor.', url: 'https://tails.net/' },
      { name: 'Qubes OS', desc: 'Security-oriented OS using Xen virtualization to compartmentalize applications.', url: 'https://www.qubes-os.org/' },
      { name: 'Windows Subsystem for Linux (WSL)', desc: 'Run Linux environments natively inside Windows for security development.', url: 'https://learn.microsoft.com/en-us/windows/wsl/' }
    ]
  }
];

const AI_TOOLS_CATEGORIES = [
  {
    title: 'Machine Learning',
    icon: BrainCircuit,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'Scikit-Learn', desc: 'Predictive data analysis and classic ML algorithms in Python.', url: 'https://scikit-learn.org/' },
      { name: 'TensorFlow', desc: 'End-to-end open-source machine learning platform by Google.', url: 'https://www.tensorflow.org/' },
      { name: 'PyTorch', desc: 'Deep learning framework tailored for research and production.', url: 'https://pytorch.org/' },
      { name: 'XGBoost', desc: 'Optimized distributed gradient boosting library.', url: 'https://xgboost.readthedocs.io/' }
    ]
  },
  {
    title: 'Computer Vision & Deep Learning',
    icon: Activity,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'OpenCV', desc: 'Open-source computer vision and machine learning library.', url: 'https://opencv.org/' },
      { name: 'YOLO', desc: 'Real-time object detection neural network architecture.', url: 'https://pjreddie.com/darknet/yolo/' },
      { name: 'MediaPipe', desc: 'Cross-platform ML solutions for live and streaming media.', url: 'https://mediapipe.dev/' },
      { name: 'Keras', desc: 'High-level deep learning API running on top of TensorFlow.', url: 'https://keras.io/' }
    ]
  },
  {
    title: 'Natural Language Processing (NLP)',
    icon: Code,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Hugging Face', desc: 'Hub for pre-trained AI models, datasets, and Transformers.', url: 'https://huggingface.co/' },
      { name: 'LangChain', desc: 'Framework for developing applications powered by LLMs.', url: 'https://www.langchain.com/' },
      { name: 'spaCy', desc: 'Industrial-strength Natural Language Processing in Python.', url: 'https://spacy.io/' },
      { name: 'NLTK', desc: 'Natural Language Toolkit for symbolic and statistical NLP.', url: 'https://www.nltk.org/' }
    ]
  },
  {
    title: 'Generative AI & LLMs',
    icon: Sparkles,
    color: '#EC4899',
    bg: '#FDF2F8',
    tools: [
      { name: 'OpenAI API', desc: 'Access GPT-4 and DALL-E state-of-the-art AI models.', url: 'https://openai.com/' },
      { name: 'Ollama', desc: 'Run Llama 3, Mistral, and local LLMs on your machine.', url: 'https://ollama.com/' },
      { name: 'Anthropic Claude', desc: 'Advanced AI assistant API built for safety and accuracy.', url: 'https://www.anthropic.com/' }
    ]
  },
  {
    title: 'Data Science & Analytics',
    icon: BarChart3,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'Pandas', desc: 'Fast, flexible data structures for data analysis in Python.', url: 'https://pandas.pydata.org/' },
      { name: 'NumPy', desc: 'Fundamental package for scientific computing in Python.', url: 'https://numpy.org/' },
      { name: 'Jupyter Notebooks', desc: 'Web-based interactive computing environment.', url: 'https://jupyter.org/' },
      { name: 'Google Colab', desc: 'Cloud Jupyter notebook environment with free GPU access.', url: 'https://colab.research.google.com/' }
    ]
  }
];

const BIOTECH_TOOLS_CATEGORIES = [
  {
    title: 'Bioinformatics',
    icon: Dna,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'Sequence Analysis', desc: 'NCBI BLAST, EMBOSS, and Clustal Omega sequence alignment.', url: 'https://blast.ncbi.nlm.nih.gov/' },
      { name: 'Genome Assembly', desc: 'SPAdes, Velvet, and Canu genome assemblers.', url: 'https://github.com/ablab/spades' },
      { name: 'Protein Analysis', desc: 'ExPASy, InterPro, and PROSITE protein characterization.', url: 'https://www.expasy.org/' },
      { name: 'Structural Biology', desc: 'PDB (Protein Data Bank) and PyMOL 3D structure analysis.', url: 'https://www.rcsb.org/' },
      { name: 'Phylogenetic Analysis', desc: 'MEGA, PHYLIP, and IQ-TREE evolutionary tree building.', url: 'https://www.megasoftware.net/' },
      { name: 'Biological Databases', desc: 'UniProt, GenBank, and Ensembl biological repositories.', url: 'https://www.uniprot.org/' }
    ]
  },
  {
    title: 'Genomics',
    icon: FlaskConical,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'DNA Sequencing', desc: 'Illumina BaseSpace, Oxford Nanopore, and PacBio tools.', url: 'https://www.illumina.com/' },
      { name: 'Genome Annotation', desc: 'Prokka, MAKER, and Augustus gene prediction pipelines.', url: 'https://github.com/tseemann/prokka' },
      { name: 'Variant Analysis', desc: 'GATK, SAMtools, and FreeBayes variant discovery.', url: 'https://gatk.broadinstitute.org/' },
      { name: 'Comparative Genomics', desc: 'MUMmer, Mauve, and OrthoFinder genome comparison.', url: 'https://mummer4.github.io/' },
      { name: 'Gene Expression', desc: 'DESeq2, edgeR, and Kallisto RNA-Seq quantification.', url: 'https://bioconductor.org/packages/release/bioc/html/DESeq2.html' }
    ]
  },
  {
    title: 'Proteomics',
    icon: Layers,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Protein Identification', desc: 'MaxQuant and Mascot mass spectrometry identification.', url: 'https://www.maxquant.org/' },
      { name: 'Protein Structure Prediction', desc: 'AlphaFold2, RoseTTAFold, and SWISS-MODEL.', url: 'https://alphafold.ebi.ac.uk/' },
      { name: 'Protein Interaction Analysis', desc: 'STRING database, BioGRID, and Cytoscape network mapping.', url: 'https://string-db.org/' },
      { name: 'Mass Spectrometry Analysis', desc: 'Proteome Discoverer and Skyline targeted proteomics.', url: 'https://skyline.ms/' },
      { name: 'Functional Proteomics', desc: 'Gene Ontology (GO) enrichment and KEGG pathway analysis.', url: 'https://geneontology.org/' }
    ]
  },
  {
    title: 'Molecular Biology',
    icon: Activity,
    color: '#EC4899',
    bg: '#FDF2F8',
    tools: [
      { name: 'PCR Analysis', desc: 'Real-time qPCR curve fitting and Ct calculation software.', url: 'https://www.thermofisher.com/us/en/home/life-science/pcr.html' },
      { name: 'DNA/RNA Analysis', desc: 'SnapGene and Serial Cloner sequence manipulation.', url: 'https://www.snapgene.com/' },
      { name: 'Cloning', desc: 'NEB Builder, Gibson Assembly, and Restriction Cloning calculators.', url: 'https://nebuilder.neb.com/' },
      { name: 'Primer Design', desc: 'Primer3, NCBI Primer-BLAST, and OligoAnalyzer.', url: 'https://primer3.ut.ee/' },
      { name: 'Gel Electrophoresis Analysis', desc: 'ImageJ and GelAnalyzer band intensity quantification.', url: 'https://imagej.net/' }
    ]
  },
  {
    title: 'Genetic Engineering',
    icon: Code,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'CRISPR Design', desc: 'CRISPOR, CHOPCHOP, and Synthego gRNA design tools.', url: 'http://crispor.tefor.net/' },
      { name: 'Gene Editing', desc: 'Benchling gRNA and repair template modeling.', url: 'https://www.benchling.com/' },
      { name: 'Vector Design', desc: 'Addgene plasmid repository and SnapGene vector mapping.', url: 'https://www.addgene.org/' },
      { name: 'Synthetic Biology', desc: 'SBOL Designer and Genome Compiler synthetic DNA CAD.', url: 'https://sbolstandard.org/' },
      { name: 'Gene Delivery', desc: 'Transfection efficiency calculators and lentiviral tools.', url: 'https://www.addgene.org/viral-vectors/' }
    ]
  },
  {
    title: 'Drug Discovery',
    icon: Search,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'Molecular Docking', desc: 'AutoDock Vina, SwissDock, and PyRx ligand binding.', url: 'https://vina.scripps.edu/' },
      { name: 'Virtual Screening', desc: 'ZINC20 database and GOLD high-throughput screening.', url: 'https://zinc20.docking.org/' },
      { name: 'Drug Design', desc: 'Schrödinger Suite, ChemDraw, and MarvinView chemical CAD.', url: 'https://www.schrodinger.com/' },
      { name: 'Pharmacokinetics', desc: 'SwissADME and PK-Sim absorption/distribution modeling.', url: 'http://www.swissadme.ch/' },
      { name: 'Drug Target Identification', desc: 'Open Targets Platform and ChEMBL target binding.', url: 'https://platform.opentargets.org/' }
    ]
  },
  {
    title: 'Clinical Research',
    icon: FileText,
    color: '#0284C7',
    bg: '#E0F2FE',
    tools: [
      { name: 'Clinical Data Management', desc: 'REDCap, OpenClinica, and Medidata Rave eCRF.', url: 'https://www.project-redcap.org/' },
      { name: 'Trial Management', desc: 'CTMS platforms for protocol and site monitoring.', url: 'https://www.clinicaltrials.gov/' },
      { name: 'Regulatory Documentation', desc: 'eCTD submission and FDA/EMA compliance tools.', url: 'https://www.fda.gov/' },
      { name: 'Statistical Analysis', desc: 'SAS, R, and SPSS clinical trial biostatistics.', url: 'https://www.r-project.org/' },
      { name: 'Pharmacovigilance', desc: 'VigiBase and Argus Safety adverse event tracking.', url: 'https://www.who-umc.org/' }
    ]
  },
  {
    title: 'Laboratory Management',
    icon: ClipboardList,
    color: '#EAB308',
    bg: '#FEFCE8',
    tools: [
      { name: 'Laboratory Information Management (LIMS)', desc: 'LabWare, LabVantage, and Quartzy lab LIMS.', url: 'https://www.quartzy.com/' },
      { name: 'Sample Tracking', desc: 'Freezerworks and BarTender specimen tracking.', url: 'https://www.freezerworks.com/' },
      { name: 'Inventory Management', desc: 'Chemical Safety, Labcup, and Quartzy reagent logs.', url: 'https://www.quartzy.com/' },
      { name: 'Lab Automation', desc: 'OpenTrons liquid handler and Tecan automation.', url: 'https://opentrons.com/' },
      { name: 'Quality Control', desc: 'ISO 17025 compliance and calibration tracking.', url: 'https://www.iso.org/' }
    ]
  },
  {
    title: 'Microscopy & Imaging',
    icon: Microscope,
    color: '#059669',
    bg: '#ECFDF5',
    tools: [
      { name: 'Image Acquisition', desc: 'ZEN (Zeiss), NIS-Elements (Nikon), and CellSens.', url: 'https://www.zeiss.com/microscopy/' },
      { name: 'Image Processing', desc: 'ImageJ, Fiji, and CellProfiler image segmentation.', url: 'https://imagej.net/software/fiji/' },
      { name: 'Cell Imaging', desc: 'Fiji 3D cell tracking and live-cell imaging plugins.', url: 'https://cellprofiler.org/' },
      { name: 'Fluorescence Analysis', desc: 'FRAP, FRET, and colocalization analysis tools.', url: 'https://imagej.net/imaging/fret' },
      { name: 'Microscopy Automation', desc: 'Micro-Manager open-source automated microscopy.', url: 'https://micro-manager.org/' }
    ]
  },
  {
    title: 'Data Analysis',
    icon: BarChart3,
    color: '#2563EB',
    bg: '#EFF6FF',
    tools: [
      { name: 'Statistical Analysis', desc: 'GraphPad Prism, R, and Python SciPy statistics.', url: 'https://www.graphpad.com/' },
      { name: 'Data Visualization', desc: 'ggplot2, Seaborn, and Plotly interactive charts.', url: 'https://ggplot2.tidyverse.org/' },
      { name: 'Machine Learning for Biology', desc: 'Scikit-learn, PyTorch, and Bio-BERT models.', url: 'https://scikit-learn.org/' },
      { name: 'Omics Data Analysis', desc: 'Bioconductor suite for high-throughput genomic data.', url: 'https://www.bioconductor.org/' },
      { name: 'Scientific Computing', desc: 'MATLAB, Julia, and NumPy scientific computation.', url: 'https://www.mathworks.com/products/matlab.html' }
    ]
  },
  {
    title: 'Bioprocess Engineering',
    icon: Settings,
    color: '#DC2626',
    bg: '#FEF2F2',
    tools: [
      { name: 'Fermentation Monitoring', desc: 'Sartorius BioPAT and BioNET bioprocess logging.', url: 'https://www.sartorius.com/' },
      { name: 'Process Simulation', desc: 'SuperPro Designer and Aspen Plus bioprocess simulation.', url: 'https://www.intelligen.com/superpro.html' },
      { name: 'Bioreactor Control', desc: 'Applikon myControl and Emerson DeltaV Automation.', url: 'https://www.emerson.com/en-us/automation/deltav' },
      { name: 'Process Optimization', desc: 'DoE (Design of Experiments) in MODDE and JMP.', url: 'https://www.jmp.com/' },
      { name: 'Scale-up Analysis', desc: 'CFD (Computational Fluid Dynamics) mixing simulation.', url: 'https://www.ansys.com/' }
    ]
  },
  {
    title: 'Systems Biology',
    icon: Users,
    color: '#7C3AED',
    bg: '#F5F3FF',
    tools: [
      { name: 'Pathway Analysis', desc: 'KEGG, Reactome, and WikiPathways biological maps.', url: 'https://www.reactome.org/' },
      { name: 'Network Biology', desc: 'Cytoscape network visualization and analysis.', url: 'https://cytoscape.org/' },
      { name: 'Metabolic Modeling', desc: 'COBRA Toolbox and SBML (Systems Biology Markup Language).', url: 'https://opencobra.github.io/' },
      { name: 'Multi-omics Integration', desc: 'MixOmics and MOFA2 multi-view integration.', url: 'http://mixomics.org/' },
      { name: 'Computational Biology', desc: 'CellDesigner and COPASI biochemical simulation.', url: 'http://copasi.org/' }
    ]
  },
  {
    title: 'Biomedical Engineering',
    icon: Cpu,
    color: '#D97706',
    bg: '#FEF3C7',
    tools: [
      { name: 'Medical Image Analysis', desc: '3D Slicer, ITK-SNAP, and OsiriX DICOM viewers.', url: 'https://www.slicer.org/' },
      { name: 'Biosignal Processing', desc: 'EEGLAB, PhysioNet, and BioSig ECG/EEG processing.', url: 'https://sccn.ucsd.edu/eeglab/' },
      { name: 'Medical Device Design', desc: 'SolidWorks, COMSOL Multiphysics, and FEA tools.', url: 'https://www.comsol.com/' },
      { name: 'Tissue Engineering', desc: 'Bioprinting G-code generators and scaffold CAD.', url: 'https://www.cellink.com/' },
      { name: 'Biomaterials Analysis', desc: 'Degradation kinetics and mechanical testing analysis.', url: 'https://www.instron.com/' }
    ]
  },
  {
    title: 'Scientific Productivity',
    icon: BookOpen,
    color: '#64748B',
    bg: '#F1F5F9',
    tools: [
      { name: 'Reference Management', desc: 'Mendeley, Zotero, and EndNote reference tools.', url: 'https://www.zotero.org/' },
      { name: 'Scientific Writing', desc: 'Overleaf LaTeX, BioRender, and Grammarly.', url: 'https://www.biorender.com/' },
      { name: 'Research Collaboration', desc: 'ResearchGate, ORCID, and Open Science Framework (OSF).', url: 'https://osf.io/' },
      { name: 'Data Sharing', desc: 'Figshare, Zenodo, and Dryad research data repositories.', url: 'https://zenodo.org/' },
      { name: 'Laboratory Documentation', desc: 'LabArchives, Notion, and Benchling notebook templates.', url: 'https://www.labarchives.com/' }
    ]
  }
];
function getToolGuideConcepts(name: string, desc: string): string[] {
  const n = name.toLowerCase();

  // Cybersecurity
  if (n.includes('penetration') || n.includes('metasploit') || n.includes('burp') || n.includes('kali') || n.includes('ethical') || n.includes('zap')) {
    return [
      'Scanning target hosts and discovering open network services',
      'Auditing web applications for OWASP Top 10 security vulnerabilities',
      'Using exploitation frameworks to simulate real-world cyber attacks safely',
      'Intercepting and modifying HTTP traffic using web proxy tools',
      'Writing penetration testing reports with risk remediation steps'
    ];
  }
  if (n.includes('forensics') || n.includes('autopsy') || n.includes('volatility') || n.includes('malware') || n.includes('digital')) {
    return [
      'Acquiring bit-stream forensic images of hard drives and memory sticks',
      'Extracting volatile RAM artifacts and running process memory dumps',
      'Analyzing file system journal logs and recovering deleted files',
      'Investigating email headers, SPF/DKIM records, and phishing indicators',
      'Decompiling suspicious malware binaries in isolated sandbox environments'
    ];
  }
  if (n.includes('identity') || n.includes('iam') || n.includes('okta') || n.includes('keycloak') || n.includes('password') || n.includes('auth')) {
    return [
      'Setting up Single Sign-On (SSO) and OAuth 2.0 / OpenID authentication',
      'Enforcing Multi-Factor Authentication (MFA) with TOTP and security keys',
      'Managing Role-Based Access Control (RBAC) across organization users',
      'Auditing password strength and checking credential breach databases',
      'Securing API tokens and secrets in centralized key vaults'
    ];
  }

  // Artificial Intelligence & Machine Learning
  if (n.includes('machine learning') || n.includes('pytorch') || n.includes('tensorflow') || n.includes('scikit') || n.includes('deep learning')) {
    return [
      'Preparing datasets: feature scaling, one-hot encoding, and train/test splits',
      'Training supervised classification and regression models',
      'Building deep neural network architectures with layers and activation functions',
      'Evaluating model performance using accuracy, precision, recall, and F1-score',
      'Exporting trained models for real-time web API inference deployment'
    ];
  }
  if (n.includes('generative') || n.includes('llm') || n.includes('openai') || n.includes('claude') || n.includes('ollama') || n.includes('nlp')) {
    return [
      'Prompt engineering techniques: system prompts, few-shot prompting, and chain-of-thought',
      'Running local open-source LLMs on your computer using Ollama',
      'Integrating OpenAI and Claude APIs into custom web and mobile apps',
      'Building RAG (Retrieval-Augmented Generation) applications with vector databases',
      'Creating autonomous AI agents using frameworks like CrewAI and LangChain'
    ];
  }

  // Electrical & Electronics
  if (n.includes('microcontroller') || n.includes('arduino') || n.includes('stm32') || n.includes('esp32') || n.includes('raspberry pi') || n.includes('embedded')) {
    return [
      'Writing setup and main execution loops for hardware control',
      'Reading digital and analog sensors (temperature, light, ultrasonic)',
      'Generating PWM signals to control motor speeds and LED brightness',
      'Communicating over serial protocols: UART, SPI, and I2C',
      'Connecting microcontrollers to Wi-Fi and cloud IoT dashboards'
    ];
  }
  if (n.includes('circuit') || n.includes('spice') || n.includes('pcb') || n.includes('fpga') || n.includes('verilog') || n.includes('analog')) {
    return [
      'Drawing schematic diagrams with electronic component symbols',
      'Simulating AC/DC voltage, current, and transient signal waveforms',
      'Routing Printed Circuit Board (PCB) traces and copper ground planes',
      'Writing Verilog/VHDL code for digital hardware logic synthesis',
      'Testing hardware prototypes using oscilloscopes and logic analyzers'
    ];
  }

  // Business & Management
  if (n.includes('accounting') || n.includes('finance') || n.includes('tally') || n.includes('quickbooks') || n.includes('crm') || n.includes('salesforce') || n.includes('zoho')) {
    return [
      'Posting double-entry journal records and tracking general ledgers',
      'Managing customer leads, sales pipelines, and automated follow-ups',
      'Generating automated Profit & Loss statements and balance sheets',
      'Tracking accounts receivable, vendor invoices, and tax compliance',
      'Creating interactive executive dashboards for business analytics'
    ];
  }
  if (n.includes('project') || n.includes('jira') || n.includes('trello') || n.includes('asana') || n.includes('marketing') || n.includes('bi')) {
    return [
      'Creating Agile Scrum boards, sprints, and user story backlogs',
      'Tracking team tasks, deadlines, and project milestones',
      'Analyzing website traffic, conversion rates, and user analytics',
      'Automating email marketing campaigns and lead generation workflows',
      'Managing collaborative team documentation and project wikis'
    ];
  }

  // Biotech & Life Sciences
  if (n.includes('bioinformatics') || n.includes('blast') || n.includes('genomics') || n.includes('pymol') || n.includes('benchling') || n.includes('dna')) {
    return [
      'Aligning DNA and protein sequences against global NCBI databases',
      'Predicting 3D macromolecular structures of proteins and enzymes',
      'Simulating molecular docking and drug-target binding interactions',
      'Analyzing Next-Generation Sequencing (NGS) quality control data',
      'Documenting experiments in cloud-based Electronic Lab Notebooks (ELN)'
    ];
  }

  // Standard Software / CS Fallback
  if (n.includes('git') || n.includes('version')) {
    return [
      'Creating local repositories and initializing project tracking',
      'Making atomic commits to record project history milestone checkpoints',
      'Creating feature branches for isolated experiments and safe updates',
      'Merging branches, resolving code conflicts, and pushing to remote repos',
      'Collaborating with teammates using Pull Requests and peer reviews'
    ];
  }
  if (n.includes('react') || n.includes('frontend')) {
    return [
      'Building modern user interfaces using modular React components',
      'Managing component state dynamically with hooks like useState and useEffect',
      'Passing properties (props) cleanly between parent and child elements',
      'Connecting frontend interfaces to live REST API backend endpoints',
      'Optimizing rendering speed for responsive single-page web applications'
    ];
  }

  return [
    `Understanding the fundamental role of ${name} in modern engineering workflows`,
    `Exploring initial installation, configuration, and environment setup`,
    `Learning key features: ${desc}`,
    `Integrating ${name} into student projects and practical lab experiments`,
    `Following industry best practices for efficiency and productivity`
  ];
}

function getToolGuideUseCases(name: string, category: string): string[] {
  const c = category.toLowerCase();
  if (c.includes('computer') || c.includes('software')) {
    return ['Software Development', 'Student Projects', 'Open Source', 'Production Apps'];
  }
  if (c.includes('business')) {
    return ['Corporate Operations', 'Financial Planning', 'Team Management', 'Business Analytics'];
  }
  if (c.includes('electrical')) {
    return ['Hardware Engineering', 'Embedded Systems', 'Lab Experiments', 'Circuit Design'];
  }
  if (c.includes('cybersecurity')) {
    return ['Security Auditing', 'Threat Defense', 'Penetration Labs', 'Network Diagnostics'];
  }
  if (c.includes('ai') || c.includes('intelligence')) {
    return ['Machine Learning', 'Data Analysis', 'Automation', 'Predictive Modeling'];
  }
  if (c.includes('biotech')) {
    return ['Bioinformatics Research', 'Genomic Studies', 'Lab Automation', 'Drug Discovery'];
  }
  return ['Academic Learning', 'Student Projects', 'Industry Practice', 'Lab Work'];
}

function getToolGuideLinks(name: string, primaryUrl: string): { label: string; url: string }[] {
  const links: { label: string; url: string }[] = [];

  if (primaryUrl && primaryUrl !== '#') {
    links.push({ label: `Official ${name} Website & Documentation`, url: primaryUrl });
  } else {
    links.push({ label: `Official ${name} Documentation Portal`, url: `https://www.google.com/search?q=${encodeURIComponent(name)}+official+documentation` });
  }

  const n = name.toLowerCase();

  if (n.includes('git') || n.includes('github')) {
    links.push({ label: 'Git - Atlassian Complete Beginner Guide', url: 'https://www.atlassian.com/git/tutorials' });
    links.push({ label: 'Learn Git Branching (Interactive Visualizer)', url: 'https://learngitbranching.js.org/' });
  } else if (n.includes('react')) {
    links.push({ label: 'React Official Interactive Tutorial', url: 'https://react.dev/learn' });
    links.push({ label: 'FreeCodeCamp React Beginner Course', url: 'https://www.freecodecamp.org/news/tag/react/' });
  } else if (n.includes('tally') || n.includes('quickbooks') || n.includes('accounting') || n.includes('finance')) {
    links.push({ label: 'Accounting Fundamentals for Beginners (AccountingTools)', url: 'https://www.accountingtools.com/' });
    links.push({ label: `${name} Video Tutorials & Case Studies`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+beginner+guide` });
  } else if (n.includes('wireshark') || n.includes('nmap') || n.includes('metasploit') || n.includes('security')) {
    links.push({ label: 'TryHackMe Hands-on Security Labs', url: 'https://tryhackme.com/' });
    links.push({ label: 'OverTheWire Security Wargames', url: 'https://overthewire.org/' });
  } else if (n.includes('docker') || n.includes('kubernetes') || n.includes('container')) {
    links.push({ label: 'Docker Curriculum & Beginner Tutorial', url: 'https://docker-curriculum.com/' });
    links.push({ label: 'Play with Docker (Free Browser Sandbox)', url: 'https://labs.play-with-docker.com/' });
  } else if (n.includes('arduino') || n.includes('esp32') || n.includes('raspberry pi') || n.includes('stm32')) {
    links.push({ label: 'Arduino & Microcontroller Hardware Tutorials', url: 'https://docs.arduino.cc/tutorials/' });
    links.push({ label: 'Random Nerd Tutorials (ESP32 / Pi Guides)', url: 'https://randomnerdtutorials.com/' });
  } else if (n.includes('blast') || n.includes('pymol') || n.includes('biotech') || n.includes('dna')) {
    links.push({ label: 'NCBI Bioinformatics Training & Manuals', url: 'https://www.ncbi.nlm.nih.gov/guide/all/' });
    links.push({ label: 'BioRender Scientific Illustration Guides', url: 'https://biorender.com/learn/' });
  } else if (n.includes('openai') || n.includes('pytorch') || n.includes('tensorflow') || n.includes('ai') || n.includes('machine learning')) {
    links.push({ label: 'Fast.ai Practical Deep Learning for Coders', url: 'https://www.fast.ai/' });
    links.push({ label: 'Kaggle Machine Learning Courses & Datasets', url: 'https://www.kaggle.com/learn' });
  } else {
    links.push({ label: `Learn ${name} on W3Schools / FreeCodeCamp`, url: `https://www.google.com/search?q=learn+${encodeURIComponent(name)}+for+beginners` });
    links.push({ label: `${name} Video Tutorials & Step-by-Step Guides`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+beginner+tutorial` });
  }

  return links;
}

const TOOLKIT_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  'CS tools': { icon: Code, bg: '#EFF6FF', color: '#3B82F6' },
  'Business tools': { icon: Briefcase, bg: '#ECFDF5', color: '#10B981' },
  'Cybersecurity tools': { icon: ShieldCheck, bg: '#F5F3FF', color: '#8B5CF6' },
  'AI tools': { icon: BrainCircuit, bg: '#FDF2F8', color: '#EC4899' },
  'Electrical and Electronic tools': { icon: Zap, bg: '#FEF3C7', color: '#D97706' },
  'Biotech tools': { icon: Dna, bg: '#ECFEFF', color: '#06B6D4' },
};

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedToolkit = searchParams.get('toolkit');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<{ name: string; desc: string; url: string; category: string; bg: string; color: string } | null>(null);

  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/notes');
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map((n: any) => ({
            id: String(n.id),
            title: n.title,
            subject: n.subject,
            department: n.department,
            semester: n.semester,
            type: n.fileType,
            downloads: n.downloadsCount || 0,
            fileSize: n.fileSize,
            uploadedAt: n.uploadedAt ? n.uploadedAt.split('T')[0] : '',
            downloadUrl: n.downloadUrl
          }));
          setNotes(mappedData);
        } else {
          setNotes(NOTES_DATA);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setNotes(NOTES_DATA);
      }
    };
    fetchNotes();
  }, []);

  const handleDownload = async (noteId: string, downloadUrl: string) => {
    try {
      await fetch(`http://localhost:8080/api/notes/${noteId}/download`, { method: 'POST' });
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, downloads: n.downloads + 1 } : n));
    } catch (err) {
      console.error('Error incrementing download count:', err);
    }
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const setSelectedToolkit = (value: string | null) => {
    if (value) {
      setSearchParams({ toolkit: value });
      setSelectedCategory(null);
      setSelectedLanguage(null);
      setSelectedTool(null);
    } else {
      setSearchParams({});
      setSelectedCategory(null);
      setSelectedLanguage(null);
      setSelectedTool(null);
    }
  };
  const toolkitRef = useRef<HTMLDivElement>(null);

  const filtered = notes.filter((note) => {
    const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSem = selectedSem === 'All' || note.semester === parseInt(selectedSem);
    const matchDept = selectedDept === 'All Departments' || note.department === selectedDept || note.department === 'All Departments';
    const matchType = selectedType === 'all' || note.type === selectedType;
    const matchSubject = selectedSubject === 'All Subjects' || note.subject === selectedSubject;
    return matchSearch && matchSem && matchDept && matchType && matchSubject;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      {!selectedToolkit && (
        <div className="bg-white border-b border-[#E5E7EB] py-10">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>Home</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#F97316]">Notes & PYQs</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Notes &{' '}
                <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  PYQs
                </span>
              </h1>
              <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Access semester-wise notes, previous year question papers, and study materials.
              </p>
            </motion.div>
          </div>
        </div>
      )}

      <div className="container-custom py-10">
        {selectedToolkit ? (
          (() => {
            const TOOLKIT_MAP: Record<string, { categories: typeof CS_TOOLS_CATEGORIES; label: string }> = {
              cs: { categories: CS_TOOLS_CATEGORIES, label: 'Computer Science' },
              business: { categories: BUSINESS_TOOLS_CATEGORIES, label: 'Business' },
              electrical: { categories: EE_TOOLS_CATEGORIES, label: 'Electrical & Electronics' },
              cybersecurity: { categories: CYBERSECURITY_TOOLS_CATEGORIES, label: 'Cybersecurity' },
              ai: { categories: AI_TOOLS_CATEGORIES, label: 'Artificial Intelligence' },
              biotech: { categories: BIOTECH_TOOLS_CATEGORIES, label: 'Biotechnology' },
            };
            const current = TOOLKIT_MAP[selectedToolkit];
            if (!current) return null;
            const { categories, label } = current;
            return (
              <div>
                {/* Back Button and Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8"
                >
                  <button
                    onClick={() => {
                      if (selectedTool !== null) {
                        setSelectedTool(null);
                      } else if (selectedLanguage !== null) {
                        setSelectedLanguage(null);
                      } else if (selectedCategory !== null) {
                        setSelectedCategory(null);
                      } else {
                        setSelectedToolkit(null);
                        setTimeout(() => {
                          toolkitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#F97316] transition-colors mb-6 group"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {selectedTool !== null
                      ? `Back to ${categories[selectedCategory!].title}`
                      : selectedLanguage !== null
                      ? 'Back to Programming Languages'
                      : selectedCategory !== null
                      ? `Back to ${label} Tools`
                      : 'Back to Toolkit'}
                  </button>

                  <h2 className="text-3xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {selectedTool !== null ? (
                      <>
                        {selectedTool.name}{' '}
                        <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                          Guide
                        </span>
                      </>
                    ) : selectedLanguage !== null ? (
                      <>
                        {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].name}{' '}
                        <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                          Guide
                        </span>
                      </>
                    ) : selectedCategory !== null ? (
                      <>
                        {categories[selectedCategory].title}{' '}
                        <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                          Tools
                        </span>
                      </>
                    ) : (
                      <>
                        {label}{' '}
                        <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                          Tools
                        </span>
                      </>
                    )}
                  </h2>
                  <p className="text-[#64748B] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {selectedTool !== null
                      ? `Beginner overview, key concepts, and official resources for ${selectedTool.name}.`
                      : selectedLanguage !== null
                      ? `Beginner explanation, essential concepts, and curated learning links for ${PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].name}.`
                      : selectedCategory !== null
                      ? `Explore the ${categories[selectedCategory].title.toLowerCase()} tools.`
                      : `Select a category to explore curated ${label.toLowerCase()} tools.`}
                  </p>
                </motion.div>

                {selectedTool !== null ? (
                  /* ── Universal Tool Beginner Guide View ── */
                  <motion.div
                    key={`tool-guide-${selectedTool.name}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-10 shadow-sm mb-20"
                  >
                    {/* Top Header of Tool Guide */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner shrink-0"
                          style={{ backgroundColor: selectedTool.bg, color: selectedTool.color }}
                        >
                          <Wrench className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl md:text-3xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>
                              {selectedTool.name}
                            </h3>
                            <span
                              className="text-xs font-semibold px-3 py-1 rounded-full border"
                              style={{
                                backgroundColor: selectedTool.bg,
                                color: selectedTool.color,
                                borderColor: selectedTool.color + '40'
                              }}
                            >
                              {selectedTool.category} Tool
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-[#64748B] font-medium mt-0.5">
                            Curated Beginner Overview & Essential Learning Resources
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTool(null)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#F97316] transition-colors px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0]"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to {selectedTool.category}</span>
                      </button>
                    </div>

                    {/* Guide Content Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left 2 Cols: What It Is & Key Concepts */}
                      <div className="lg:col-span-2 space-y-8">
                        {/* Section 1: What It Is */}
                        <div>
                          <h4 className="text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                            What is {selectedTool.name}?
                          </h4>
                          <p className="text-sm text-[#475569] leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                            {selectedTool.desc} It is widely used in student engineering projects and industry applications to streamline development workflows and automate routine processes.
                          </p>
                        </div>

                        {/* Section 2: Key Concepts You'll Discover */}
                        <div>
                          <h4 className="text-base font-semibold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                            Key Concepts You'll Discover
                          </h4>
                          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 divide-y divide-[#F1F5F9]">
                            {getToolGuideConcepts(selectedTool.name, selectedTool.desc).map((item, idx) => (
                              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 text-xs md:text-sm text-[#334155]">
                                <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#3B82F6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Col: Applications & Links */}
                      <div className="space-y-8">
                        {/* Section 3: Primary Use Cases */}
                        <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                          <h4 className="text-sm font-semibold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                            Key Use Cases
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {getToolGuideUseCases(selectedTool.name, selectedTool.category).map((uc, i) => (
                              <span key={i} className="text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] px-3 py-1.5 rounded-xl shadow-2xs">
                                {uc}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Section 4: Recommended Learning Links */}
                        <div>
                          <h4 className="text-sm font-semibold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                            Recommended Learning Links
                          </h4>
                          <div className="space-y-2.5">
                            {getToolGuideLinks(selectedTool.name, selectedTool.url).map((link, lIdx) => (
                              <a
                                key={lIdx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FED7AA] rounded-xl text-xs font-semibold text-[#1E293B] hover:text-[#F97316] transition-all group shadow-2xs"
                              >
                                <span>{link.label}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F97316] transition-colors" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : selectedCategory !== null ? (
                  /* If CS tools & Programming Languages category (index 0) */
                  selectedToolkit === 'cs' && selectedCategory === 0 ? (
                    selectedLanguage !== null ? (
                      /* ── Beginner Guide View for Selected Language ── */
                      <motion.div
                        key={`guide-${selectedLanguage}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-10 shadow-sm mb-20"
                      >
                        {/* Top Header of Guide */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F5F9] pb-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner shrink-0"
                              style={{ backgroundColor: PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].bg, color: PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].color }}
                            >
                              <Code className="w-7 h-7" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-2xl md:text-3xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                  {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].name}
                                </h3>
                                <span
                                  className="text-xs font-semibold px-3 py-1 rounded-full border"
                                  style={{
                                    backgroundColor: PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].bg,
                                    color: PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].color,
                                    borderColor: PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].color + '40'
                                  }}
                                >
                                  Beginner Guide
                                </span>
                              </div>
                              <p className="text-xs md:text-sm text-[#64748B] font-medium mt-0.5">
                                {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].tagline}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedLanguage(null)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#F97316] transition-colors px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0]"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Languages</span>
                          </button>
                        </div>

                        {/* Guide Content Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Left 2 Cols: What It Is & Must-Know Essentials */}
                          <div className="lg:col-span-2 space-y-8">
                            {/* Section 1: What It Is */}
                            <div>
                              <h4 className="text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                                What is {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].name}?
                              </h4>
                              <p className="text-sm text-[#475569] leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                                {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].whatItIs}
                              </p>
                            </div>

                            {/* Section 2: Key Concepts You'll Discover */}
                            <div>
                              <h4 className="text-base font-semibold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                                Key Concepts You'll Discover
                              </h4>
                              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 divide-y divide-[#F1F5F9]">
                                {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].keyConcepts.map((item, idx) => (
                                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 text-xs md:text-sm text-[#334155]">
                                    <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#3B82F6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="leading-snug">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Col: Applications & Links */}
                          <div className="space-y-8">
                            {/* Section 3: Applications */}
                            <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                              <h4 className="text-sm font-semibold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                                Key Use Cases
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].useCases.map((uc, i) => (
                                  <span key={i} className="text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] px-3 py-1.5 rounded-xl shadow-2xs">
                                    {uc}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Section 4: Explore Links */}
                            <div>
                              <h4 className="text-sm font-semibold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                                Recommended Learning Links
                              </h4>
                              <div className="space-y-2.5">
                                {PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].links.map((link, lIdx) => (
                                  <a
                                    key={lIdx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-white hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FED7AA] rounded-xl text-xs font-semibold text-[#1E293B] hover:text-[#F97316] transition-all group shadow-2xs"
                                  >
                                    <span>{link.label}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F97316] transition-colors" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* ── List of Languages to Explore ── */
                      <motion.div
                        key="programming-languages-grid"
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-20"
                      >
                        {PROGRAMMING_LANGUAGES_GUIDES.map((lang, langIndex) => (
                          <motion.div
                            key={lang.name}
                            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }}
                            onClick={() => setSelectedLanguage(langIndex)}
                            whileHover={{ y: -4 }}
                            className="flex flex-col justify-between p-5 bg-white hover:bg-[#FFF7ED] border border-[#E5E7EB] hover:border-[#FED7AA] rounded-2xl cursor-pointer group transition-all shadow-xs hover:shadow-md w-full min-h-[170px]"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                                  style={{ backgroundColor: lang.bg, color: lang.color }}
                                >
                                  <Code className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-semibold text-[#F97316] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-[#FED7AA]">
                                  Beginner Guide
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-[#1E293B] group-hover:text-[#F97316] transition-colors mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {lang.name}
                              </h4>
                              <p className="text-xs text-[#64748B] leading-relaxed mb-4 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {lang.tagline}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold text-[#F97316] pt-3 border-t border-[#F1F5F9]">
                              <span>Explore Guide</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )
                  ) : (
                    /* ── Standard Tools Grid for other categories ── */
                    <motion.div
                      key={`cat-tools-${selectedToolkit}-${selectedCategory}`}
                      initial="hidden"
                      animate="visible"
                      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-20"
                    >
                      {categories[selectedCategory].tools.map((tool) => (
                        <motion.div
                          key={tool.name}
                          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }}
                          onClick={() =>
                            setSelectedTool({
                              name: tool.name,
                              desc: tool.desc,
                              url: tool.url,
                              category: categories[selectedCategory].title,
                              bg: categories[selectedCategory].bg,
                              color: categories[selectedCategory].color
                            })
                          }
                          whileHover={{ y: -3 }}
                          className="flex flex-col justify-between p-5 bg-white hover:bg-[#FFF7ED] border border-[#E5E7EB] hover:border-[#FED7AA] rounded-2xl cursor-pointer group transition-all shadow-sm hover:shadow-md w-full min-h-[160px]"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: categories[selectedCategory].bg, color: categories[selectedCategory].color }}
                              >
                                {(() => { const Icon = categories[selectedCategory].icon; return <Icon className="w-4 h-4" />; })()}
                              </div>
                              <span className="text-sm font-semibold text-[#1E293B] group-hover:text-[#F97316] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {tool.name}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {tool.desc}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold text-[#F97316] group-hover:text-orange-600 transition-colors mt-auto pt-3 border-t border-[#F1F5F9]">
                            <span>Explore Guide</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )
                ) : (
                  /* ── Category Buttons: styled like toolkit cards ── */
                  <motion.div
                    key={`${selectedToolkit}-categories`}
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                    className="flex flex-wrap justify-center gap-4 mb-20"
                  >
                    {categories.map((category, index) => {
                      const CategoryIcon = category.icon;
                      return (
                        <motion.div
                          key={category.title}
                          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }}
                          onClick={() => setSelectedCategory(index)}
                          whileHover={{ y: -3 }}
                          className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#E5E7EB] cursor-pointer group transition-all hover:border-[#FED7AA] hover:shadow-md"
                          style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: category.bg, color: category.color }}
                          >
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#1E293B] group-hover:text-[#F97316] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {category.title}
                            </div>
                            <div className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {category.tools.length} tool{category.tools.length > 1 ? 's' : ''}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F97316] group-hover:translate-x-1 transition-all shrink-0" />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })()
        ) : (
          <div>
            {/* Search + Filters */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-8"
              style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
            >
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search notes, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Type Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-[#94A3B8]" />
                  {['all', 'notes', 'pyq', 'syllabus'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        backgroundColor: selectedType === type ? '#F97316' : '#F8FAFC',
                        color: selectedType === type ? 'white' : '#475569',
                        border: `1px solid ${selectedType === type ? '#F97316' : '#E5E7EB'}`,
                      }}
                    >
                      {type === 'all' ? 'All Types' : type.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Semester Filter */}
                <div className="flex gap-2 flex-wrap items-center">
                  {SEMESTERS.slice(0, 3).map((sem) => (
                    <button
                      key={sem}
                      onClick={() => { setSelectedSem(sem); setSelectedSubject('All Subjects'); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        backgroundColor: selectedSem === sem ? '#1E293B' : '#F8FAFC',
                        color: selectedSem === sem ? 'white' : '#475569',
                        border: `1px solid ${selectedSem === sem ? '#1E293B' : '#E5E7EB'}`,
                      }}
                    >
                      {sem}
                    </button>
                  ))}
                </div>

                {/* Subject Dropdown */}
                {selectedSem !== 'All' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#64748B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Subject:</span>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F8FAFC] border border-[#E5E7EB] text-[#475569] focus:outline-none focus:border-[#F97316] transition-all cursor-pointer"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <option value="All Subjects">All Subjects</option>
                      {(SUBJECTS_BY_SEM[parseInt(selectedSem)] || []).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Results */}
            <StaggerContainer key={`${filtered.length}-${selectedSubject}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
              {filtered.map((note) => {
                const typeConfig = TYPE_COLORS[note.type] || { bg: '#F1F5F9', text: '#475569', icon: BookOpen };
                const TypeIcon = typeConfig.icon;
                return (
                  <StaggerItem key={note.id}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col justify-between gap-4 h-full"
                      style={{
                        borderLeft: `4px solid ${typeConfig.text}`,
                        boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)'
                      }}
                    >
                      <div className="flex gap-4">
                        {/* Visual PDF Preview Icon */}
                        <div className="w-14 h-20 border border-slate-200 rounded-xl p-2 flex flex-col justify-between bg-[#F8FAFC] shrink-0 shadow-sm">
                          <div className="bg-[#EF4444] text-[8px] font-extrabold text-white px-1 py-0.5 rounded w-fit uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            PDF
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="w-full h-1 bg-slate-200 rounded" />
                            <div className="w-5/6 h-1 bg-slate-200 rounded" />
                            <div className="w-2/3 h-1 bg-slate-200 rounded" />
                          </div>
                        </div>

                        {/* Text Details */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: typeConfig.bg }}>
                                <TypeIcon className="w-3.5 h-3.5" style={{ color: typeConfig.text }} />
                              </div>
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: typeConfig.bg, color: typeConfig.text, fontFamily: 'Poppins, sans-serif' }}
                              >
                                {note.type}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-[#1E293B] line-clamp-2 leading-tight mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {note.title}
                            </h3>
                            <p className="text-[11px] text-[#64748B] font-medium truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {note.subject} • Sem {note.semester}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Metadata Line */}
                      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-[11px] text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{note.downloads} downloads · {note.fileSize}</span>
                          <span className="px-1 py-0.2 bg-[#F1F5F9] rounded text-[9px] font-bold text-slate-600">PDF</span>
                        </div>
                        <span>{note.uploadedAt ? `Updated ${note.uploadedAt}` : 'Recently'}</span>
                      </div>

                      {/* Download Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleDownload(note.id, note.downloadUrl)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          background: 'linear-gradient(135deg, #F97316, #FB923C)',
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </motion.button>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* Toolkit Section */}
            <div ref={toolkitRef} />
            <SectionTitle tag="Useful Downloads" title="Student" highlight="Toolkit" align="left" />
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
              {TOOLKIT_ITEMS.map((item) => {
                const iconConfig = TOOLKIT_ICONS[item.title] || { icon: Code, bg: '#FFF7ED', color: '#F97316' };
                const IconComponent = iconConfig.icon;
                return (
                  <StaggerItem key={item.id} className="flex">
                    <motion.div
                      onClick={() => {
                        if (item.title === 'CS tools') {
                          setSelectedToolkit('cs');
                        } else if (item.title === 'Business tools') {
                          setSelectedToolkit('business');
                        } else if (item.title === 'Electrical and Electronic tools') {
                          setSelectedToolkit('electrical');
                        } else if (item.title === 'Cybersecurity tools') {
                          setSelectedToolkit('cybersecurity');
                        } else if (item.title === 'AI tools') {
                          setSelectedToolkit('ai');
                        } else if (item.title === 'Biotech tools') {
                          setSelectedToolkit('biotech');
                        } else if (item.url && item.url !== '#') {
                          window.open(item.url, '_blank');
                        }
                      }}
                      whileHover={{ y: -3 }}
                      className="flex items-center gap-4 p-5 bg-white hover:bg-[#FFF7ED] rounded-2xl border border-[#E5E7EB] hover:border-[#FED7AA] cursor-pointer group w-full transition-all shadow-xs hover:shadow-md"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-transform group-hover:scale-105"
                        style={{ backgroundColor: iconConfig.bg, color: iconConfig.color }}
                      >
                        <IconComponent className="w-5.5 h-5.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1E293B] group-hover:text-[#F97316] transition-colors mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {item.title}
                        </div>
                        <div className="text-xs text-[#64748B] line-clamp-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F97316] group-hover:translate-x-1 transition-all shrink-0" />
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}
      </div>
    </div>
  );
}
