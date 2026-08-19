import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Download, BookOpen, ChevronRight, ArrowLeft, ExternalLink, Code, Globe,
  GitBranch, Cloud, Palette, Shield, DollarSign, BarChart3, Users, Megaphone,
  TrendingUp, UserCheck, ClipboardList, ShoppingCart, Cpu, Activity, LayoutGrid,
  Layers, Zap, Settings, Gauge, Radio, Wifi, Bot, Sun, Wrench, Binary, BatteryCharging,
  CircuitBoard, ShieldCheck, BrainCircuit, FlaskConical, Lock, Terminal, Dna, Microscope,
  Sparkles, Smartphone, Monitor, Server, CheckCircle2, Database, Briefcase, AlertTriangle, RefreshCw, Calculator,
  Building2, GraduationCap, Plus, Trash2, Award
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { TOOLKIT_ITEMS, DEPARTMENTS } from '@/constants';
import { DEPARTMENT_CURRICULUM, DEPARTMENT_CODE_MAP, PROFESSIONAL_ELECTIVES_LIST } from '@/constants/departmentCurriculum';
import { getStoredImsSession, fetchStudentDashboard } from '@/services/imsService';

const TOOLKIT_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  'CS tools': { icon: Code, bg: '#EFF6FF', color: '#3B82F6' },
  'Business tools': { icon: Briefcase, bg: '#ECFDF5', color: '#10B981' },
  'Cybersecurity tools': { icon: ShieldCheck, bg: '#F5F3FF', color: '#8B5CF6' },
  'AI tools': { icon: BrainCircuit, bg: '#FDF2F8', color: '#EC4899' },
  'Electrical and Electronic tools': { icon: Zap, bg: '#FEF3C7', color: '#D97706' },
  'Biotech tools': { icon: Dna, bg: '#ECFEFF', color: '#06B6D4' },
  'GPA and internal calculator': { icon: Calculator, bg: '#FEF2F2', color: '#EF4444' },
};

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
      { name: 'Team Communication', desc: 'Slack, Microsoft Teams, and Mattermost.', url: 'https://slack.com/' },
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
    title: 'Human Resources (HR)',
    icon: UserCheck,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'BambooHR', desc: 'HR software for employee records, onboarding, and PTO.', url: 'https://www.bamboohr.com/' },
      { name: 'Workday', desc: 'Enterprise cloud platform for finance, HR, and planning.', url: 'https://www.workday.com/' },
      { name: 'Zoho People', desc: 'Cloud HRMS software for managing employee operations.', url: 'https://www.zoho.com/people/' }
    ]
  },
  {
    title: 'Project & Operations',
    icon: ClipboardList,
    color: '#D97706',
    bg: '#FEF3C7',
    tools: [
      { name: 'Asana', desc: 'Work management platform to organize team projects.', url: 'https://asana.com/' },
      { name: 'Trello', desc: 'Kanban-style project management and list tool.', url: 'https://trello.com/' },
      { name: 'Smartsheet', desc: 'Enterprise platform for dynamic work and project management.', url: 'https://www.smartsheet.com/' }
    ]
  },
  {
    title: 'E-Commerce',
    icon: ShoppingCart,
    color: '#6366F1',
    bg: '#EEF2FF',
    tools: [
      { name: 'Shopify', desc: 'E-commerce platform for online stores and retail POS.', url: 'https://www.shopify.com/' },
      { name: 'WooCommerce', desc: 'Open-source e-commerce plugin for WordPress.', url: 'https://woocommerce.com/' },
      { name: 'Magento (Adobe Commerce)', desc: 'Flexible enterprise e-commerce platform.', url: 'https://business.adobe.com/products/magento/magento-commerce.html' }
    ]
  }
];

const EE_TOOLS_CATEGORIES = [
  {
    title: 'Circuit Simulation & CAD',
    icon: Cpu,
    color: '#D97706',
    bg: '#FEF3C7',
    tools: [
      { name: 'LTspice', desc: 'High-performance SPICE simulation software for analog circuits.', url: 'https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html' },
      { name: 'Proteus Design Suite', desc: 'Circuit simulation, schematic capture, and PCB layout.', url: 'https://www.labcenter.com/' },
      { name: 'Multisim (NI)', desc: 'SPICE simulation and circuit design environment.', url: 'https://www.ni.com/en-in/shop/electronic-test-instrumentation/application-software-for-electronic-test-and-instrumentation-category/what-is-multisim.html' }
    ]
  },
  {
    title: 'Computation & Analysis',
    icon: Activity,
    color: '#0284C7',
    bg: '#E0F2FE',
    tools: [
      { name: 'MATLAB', desc: 'Numerical computing environment for algorithms and data analysis.', url: 'https://www.mathworks.com/products/matlab.html' },
      { name: 'Simulink', desc: 'Block diagram environment for multi-domain simulation.', url: 'https://www.mathworks.com/products/simulink.html' },
      { name: 'LabVIEW', desc: 'System design software for test, measurement, and control.', url: 'https://www.ni.com/en-in/shop/labview.html' }
    ]
  },
  {
    title: 'PCB Design',
    icon: LayoutGrid,
    color: '#16A34A',
    bg: '#DCFCE7',
    tools: [
      { name: 'KiCad EDA', desc: 'Open-source electronics design automation suite.', url: 'https://www.kicad.org/' },
      { name: 'Altium Designer', desc: 'PCB design and electronics development software.', url: 'https://www.altium.com/' },
      { name: 'Eagle (Autodesk)', desc: 'PCB layout and schematic editing software.', url: 'https://www.autodesk.com/products/eagle/overview' }
    ]
  },
  {
    title: 'Embedded Systems',
    icon: Layers,
    color: '#7C3AED',
    bg: '#F3E8FF',
    tools: [
      { name: 'STM32CubeIDE', desc: 'C/C++ development platform for STM32 microcontrollers.', url: 'https://www.st.com/en/development-tools/stm32cubeide.html' },
      { name: 'Keil uVision', desc: 'IDE for ARM cortex microcontroller programming.', url: 'https://www.keil.com/' },
      { name: 'Arduino IDE', desc: 'Open-source software for microcontroller board programming.', url: 'https://www.arduino.cc/en/software' }
    ]
  },
  {
    title: 'Power Systems',
    icon: Zap,
    color: '#EA580C',
    bg: '#FFEDD5',
    tools: [
      { name: 'ETAP', desc: 'Electrical power system analysis and operation software.', url: 'https://etap.com/' },
      { name: 'PSCAD', desc: 'Power system transient simulation environment.', url: 'https://www.pscad.com/' },
      { name: 'PowerWorld Simulator', desc: 'Power system visual analysis and power flow tool.', url: 'https://www.powerworld.com/' }
    ]
  },
  {
    title: 'Control Systems',
    icon: Settings,
    color: '#059669',
    bg: '#D1FAE5',
    tools: [
      { name: 'Control System Toolbox (MATLAB)', desc: 'Tools for analyzing and designing control systems.', url: 'https://www.mathworks.com/products/control.html' },
      { name: 'Scilab Xcos', desc: 'Open-source graphical editor for dynamic systems simulation.', url: 'https://www.scilab.org/' }
    ]
  },
  {
    title: 'Instrumentation',
    icon: Gauge,
    color: '#4F46E5',
    bg: '#EEF2FF',
    tools: [
      { name: 'NI MAX (Measurement & Automation Explorer)', desc: 'Configuration tool for NI hardware devices.', url: 'https://www.ni.com/' },
      { name: 'Keysight PathWave', desc: 'Test and measurement software suite.', url: 'https://www.keysight.com/' }
    ]
  },
  {
    title: 'Signal Processing',
    icon: Radio,
    color: '#DB2777',
    bg: '#FCE7F3',
    tools: [
      { name: 'GNU Radio', desc: 'Software development toolkit for signal processing & SDR.', url: 'https://www.gnuradio.org/' },
      { name: 'DSP System Toolbox (MATLAB)', desc: 'Design and simulate signal processing systems.', url: 'https://www.mathworks.com/products/dsp-system.html' }
    ]
  }
];

const CYBERSECURITY_TOOLS_CATEGORIES = [
  {
    title: 'Network Scanner',
    icon: Wifi,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'Nmap', desc: 'Network discovery and vulnerability scanning security auditor.', url: 'https://nmap.org/' },
      { name: 'Masscan', desc: 'Ultra-fast IP port scanner capable of scanning the whole internet.', url: 'https://github.com/robertdavidgraham/masscan' },
      { name: 'Angry IP Scanner', desc: 'Fast and friendly network scanner for desktop platforms.', url: 'https://angryip.org/' }
    ]
  },
  {
    title: 'Penetration Testing',
    icon: ShieldCheck,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Metasploit Framework', desc: 'World\'s most used penetration testing framework.', url: 'https://www.metasploit.com/' },
      { name: 'Burp Suite', desc: 'Leading web security testing and vulnerability scanner.', url: 'https://portswigger.net/burp' },
      { name: 'OWASP ZAP', desc: 'Open-source web application security scanner.', url: 'https://www.zaproxy.org/' }
    ]
  },
  {
    title: 'Forensics',
    icon: Terminal,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'Autopsy', desc: 'Digital forensics platform and GUI for The Sleuth Kit.', url: 'https://www.autopsy.com/' },
      { name: 'Volatility', desc: 'Advanced memory forensics framework for incident response.', url: 'https://www.volatilityfoundation.org/' },
      { name: 'FTK Imager', desc: 'Data preview and forensic imaging tool.', url: 'https://www.exterro.com/ftk-imager' }
    ]
  },
  {
    title: 'Cryptography',
    icon: Lock,
    color: '#EC4899',
    bg: '#FDF2F8',
    tools: [
      { name: 'OpenSSL', desc: 'Robust commercial-grade cryptography toolkit and SSL/TLS CLI.', url: 'https://www.openssl.org/' },
      { name: 'CyberChef', desc: 'The Cyber Swiss Army Knife for encryption, encoding, and data analysis.', url: 'https://gchq.github.io/CyberChef/' },
      { name: 'VeraCrypt', desc: 'Free open-source disk encryption software based on TrueCrypt.', url: 'https://www.veracrypt.fr/' }
    ]
  },
  {
    title: 'Malware Analysis',
    icon: Bot,
    color: '#EF4444',
    bg: '#FEF2F2',
    tools: [
      { name: 'Ghidra', desc: 'NSA reverse engineering framework for software analysis.', url: 'https://ghidra-sre.org/' },
      { name: 'IDA Free', desc: 'Interactive disassembler for binary malware analysis.', url: 'https://hex-rays.com/ida-free/' },
      { name: 'Cuckoo Sandbox', desc: 'Automated malware analysis system.', url: 'https://cuckoosandbox.org/' }
    ]
  },
  {
    title: 'Identity Management',
    icon: UserCheck,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'HashiCorp Vault', desc: 'Manage secrets, keys, and credentials securely.', url: 'https://www.vaultproject.io/' },
      { name: 'Keycloak', desc: 'Open-source identity and access management for modern apps.', url: 'https://www.keycloak.org/' },
      { name: 'Okta', desc: 'Enterprise identity cloud platform for workforce authentication.', url: 'https://www.okta.com/' }
    ]
  }
];

const AI_TOOLS_CATEGORIES = [
  {
    title: 'Machine Learning Frameworks',
    icon: BrainCircuit,
    color: '#EC4899',
    bg: '#FDF2F8',
    tools: [
      { name: 'PyTorch', desc: 'Leading open-source deep learning framework by Meta.', url: 'https://pytorch.org/' },
      { name: 'TensorFlow', desc: 'End-to-end open-source machine learning platform by Google.', url: 'https://www.tensorflow.org/' },
      { name: 'Scikit-Learn', desc: 'Simple and efficient tools for predictive data analysis in Python.', url: 'https://scikit-learn.org/' }
    ]
  },
  {
    title: 'LLM & Generative AI',
    icon: Bot,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'Hugging Face Transformers', desc: 'Thousands of pretrained models for NLP, Vision, & Audio.', url: 'https://huggingface.co/' },
      { name: 'LangChain', desc: 'Framework for developing applications powered by language models.', url: 'https://www.langchain.com/' },
      { name: 'Ollama', desc: 'Run large language models locally on your machine.', url: 'https://ollama.com/' }
    ]
  },
  {
    title: 'Computer Vision',
    icon: Microscope,
    color: '#3B82F6',
    bg: '#EFF6FF',
    tools: [
      { name: 'OpenCV', desc: 'Open-source computer vision and machine learning software library.', url: 'https://opencv.org/' },
      { name: 'YOLOv8 (Ultralytics)', desc: 'Real-time object detection and image segmentation.', url: 'https://www.ultralytics.com/' },
      { name: 'MediaPipe', desc: 'Cross-platform ML solutions for live and streaming media.', url: 'https://developers.google.com/mediapipe' }
    ]
  },
  {
    title: 'Natural Language Processing (NLP)',
    icon: Sparkles,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'spaCy', desc: 'Industrial-strength Natural Language Processing in Python.', url: 'https://spacy.io/' },
      { name: 'NLTK', desc: 'Natural Language Toolkit for symbolic and statistical NLP.', url: 'https://www.nltk.org/' },
      { name: 'Gensim', desc: 'Topic modeling and document similarity analysis for human language.', url: 'https://radimrehurek.com/gensim/' }
    ]
  },
  {
    title: 'Data Annotation & MLOps',
    icon: Database,
    color: '#F97316',
    bg: '#FFF7ED',
    tools: [
      { name: 'MLflow', desc: 'Open-source platform to manage the ML lifecycle.', url: 'https://mlflow.org/' },
      { name: 'Label Studio', desc: 'Multi-type data labeling and annotation tool.', url: 'https://labelstud.io/' },
      { name: 'Weights & Biases (W&B)', desc: 'Developer platform for machine learning experiment tracking.', url: 'https://wandb.ai/' }
    ]
  }
];

const BIOTECH_TOOLS_CATEGORIES = [
  {
    title: 'Bioinformatics & Sequence Analysis',
    icon: Dna,
    color: '#06B6D4',
    bg: '#ECFEFF',
    tools: [
      { name: 'NCBI BLAST', desc: 'Basic Local Alignment Search Tool for nucleotide & protein sequences.', url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi' },
      { name: 'Biopython', desc: 'Freely available Python tools for computational molecular biology.', url: 'https://biopython.org/' },
      { name: 'Clustal Omega', desc: 'Multiple sequence alignment program for DNA/RNA/protein.', url: 'https://www.ebi.ac.uk/Tools/msa/clustalo/' }
    ]
  },
  {
    title: 'Molecular Modeling & Visualization',
    icon: FlaskConical,
    color: '#10B981',
    bg: '#ECFDF5',
    tools: [
      { name: 'PyMOL', desc: 'Molecular visualization system on an open-source foundation.', url: 'https://pymol.org/' },
      { name: 'UCSF ChimeraX', desc: 'Next-generation interactive molecular visualization and analysis.', url: 'https://www.rbvi.ucsf.edu/chimerax/' },
      { name: 'AutoDock Vina', desc: 'Molecular docking program for drug discovery and structural biology.', url: 'https://vina.scripps.edu/' }
    ]
  },
  {
    title: 'Genomics & Next-Gen Sequencing',
    icon: Microscope,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    tools: [
      { name: 'SAMtools', desc: 'Utilities for interacting with high-throughput sequencing data.', url: 'http://www.htslib.org/' },
      { name: 'FASTQC', desc: 'Quality control tool for high-throughput sequence data.', url: 'https://www.bioinformatics.babraham.ac.uk/projects/fastqc/' },
      { name: 'IGV (Integrative Genomics Viewer)', desc: 'High-performance interactive visualization tool for genomic data.', url: 'https://igv.org/' }
    ]
  }
];



export default function Toolkit() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedToolkit = searchParams.get('toolkit');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<{ name: string; desc: string; url: string; category: string; bg: string; color: string } | null>(null);
  const [gpaDepartment, setGpaDepartment] = useState('');
  const [gpaSemester, setGpaSemester] = useState('');
  const [calculationType, setCalculationType] = useState<'gpa' | 'internal' | null>(null);
  const [gpaStep, setGpaStep] = useState<1 | 2>(1);
  const [calculatedScore, setCalculatedScore] = useState<string | null>(null);
  const [imsData, setImsData] = useState<any>(null);
  const [isImsAutoFilled, setIsImsAutoFilled] = useState(false);

  useEffect(() => {
    const session = getStoredImsSession();
    if (session?.student) {
      const st = session.student;
      const matchingDept = DEPARTMENTS.find(d => 
        d.toLowerCase().includes(st.department?.toLowerCase() || '') ||
        (st.departmentCode && d.toUpperCase().includes(st.departmentCode.toUpperCase()))
      );
      if (matchingDept) {
        setGpaDepartment(matchingDept);
      }
      const sem = st.semester || 1;
      setGpaSemester(`${sem}${sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester`);

      fetchStudentDashboard(st.regNumber).then((d) => {
        setImsData(d);
      }).catch(() => {});
    }
  }, [selectedToolkit]);

  interface SubjectItem {
    name: string;
    credits: number;
    grade: string;
    cat1: string;
    cat2: string;
    assignment: string;
    attendance: string;
    isElective?: boolean;
    electiveSlot?: number;
    electiveCode?: string;
  }

  const [subjects, setSubjects] = useState<SubjectItem[]>([
    { name: 'Subject 1', credits: 4, grade: 'O', cat1: '45', cat2: '48', assignment: '10', attendance: '95' },
    { name: 'Subject 2', credits: 3, grade: 'A+', cat1: '42', cat2: '44', assignment: '9', attendance: '92' },
    { name: 'Subject 3', credits: 3, grade: 'A', cat1: '38', cat2: '40', assignment: '8', attendance: '88' },
    { name: 'Subject 4', credits: 4, grade: 'O', cat1: '46', cat2: '47', assignment: '10', attendance: '96' },
    { name: 'Subject 5', credits: 2, grade: 'A+', cat1: '44', cat2: '45', assignment: '9', attendance: '94' },
  ]);

  const handleProceedToStep2 = (type: 'gpa' | 'internal') => {
    if (!gpaDepartment || !gpaSemester) return;
    setCalculationType(type);

    const semNum = parseInt(gpaSemester.replace(/\D/g, ''), 10) || 1;
    const deptKey = DEPARTMENT_CODE_MAP[gpaDepartment] || '';

    let rawCurriculum = null;
    try {
      const saved = localStorage.getItem('RIT_LOCAL_GPA_CURRICULUM');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[deptKey] && parsed[deptKey][semNum] && parsed[deptKey][semNum].length > 0) {
          rawCurriculum = parsed[deptKey][semNum];
        }
      }
    } catch {}

    if (!rawCurriculum) {
      rawCurriculum = DEPARTMENT_CURRICULUM[deptKey]?.[semNum];
    }

    if (rawCurriculum && rawCurriculum.length > 0) {
      let electiveCounter = 1;
      const imsGrades = imsData?.results?.[0]?.subjects || [];
      const imsCatMarks = imsData?.catMarks?.subjects || [];
      let foundAnyImsMatch = false;

      const loaded = rawCurriculum
        .filter((s: any) => type === 'internal' || s.credits > 0)
        .map((s: any) => {
          const isElective = !!s.isElective;
          const sName = s.name.toLowerCase();
          const sCode = s.code ? s.code.toLowerCase() : '';
          
          // Match real grade if available
          const matchedGrade = imsGrades.find((g: any) => 
            (sCode && g.code && g.code.toLowerCase() === sCode) ||
            (g.name && sName.includes(g.name.toLowerCase())) ||
            (g.name && g.name.toLowerCase().includes(sName))
          );

          // Match CAT marks if available
          const matchedCat = imsCatMarks.find((c: any) => 
            (sCode && c.code && c.code.toLowerCase() === sCode) ||
            (c.name && sName.includes(c.name.toLowerCase()))
          );

          if (matchedGrade || matchedCat) {
            foundAnyImsMatch = true;
          }

          const gradeVal = matchedGrade?.grade || 'O';
          const cat1Val = matchedCat?.cat1 ? String(matchedCat.cat1) : '45';
          const cat2Val = matchedCat?.cat2 ? String(matchedCat.cat2) : '45';
          const assgnVal = matchedCat?.assignment ? String(matchedCat.assignment) : '9';

          if (isElective) {
            const slot = s.electiveSlot || electiveCounter++;
            const defaultElectiveObj = PROFESSIONAL_ELECTIVES_LIST[(slot - 1) % PROFESSIONAL_ELECTIVES_LIST.length] || PROFESSIONAL_ELECTIVES_LIST[0];
            return {
              name: `${defaultElectiveObj.code} - ${defaultElectiveObj.name}`,
              credits: s.credits,
              grade: gradeVal,
              cat1: cat1Val,
              cat2: cat2Val,
              assignment: assgnVal,
              attendance: '95',
              isElective: true,
              electiveSlot: slot,
              electiveCode: defaultElectiveObj.code,
            };
          }
          return {
            name: s.name,
            credits: s.credits,
            grade: gradeVal,
            cat1: cat1Val,
            cat2: cat2Val,
            assignment: assgnVal,
            attendance: '95',
            isElective: false,
          };
        });
      setSubjects(loaded);

      if (type === 'gpa') {
        setIsImsAutoFilled(foundAnyImsMatch || imsGrades.length > 0);
        let totalCredits = 0;
        let totalPoints = 0;
        const GRADE_POINTS: Record<string, number> = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'RA': 0 };
        loaded.forEach((sub: any) => {
          const pts = GRADE_POINTS[sub.grade] ?? 10;
          totalCredits += sub.credits;
          totalPoints += pts * sub.credits;
        });
        if (totalCredits > 0) {
          setCalculatedScore((totalPoints / totalCredits).toFixed(2));
        }
      }
    } else {
      setSubjects([
        { name: 'Subject 1', credits: 4, grade: 'O', cat1: '45', cat2: '48', assignment: '10', attendance: '95' },
        { name: 'Subject 2', credits: 3, grade: 'A+', cat1: '42', cat2: '44', assignment: '9', attendance: '92' },
        { name: 'Subject 3', credits: 3, grade: 'A', cat1: '38', cat2: '40', assignment: '8', attendance: '88' },
        { name: 'Subject 4', credits: 4, grade: 'O', cat1: '46', cat2: '47', assignment: '10', attendance: '96' },
        { name: 'Subject 5', credits: 2, grade: 'A+', cat1: '44', cat2: '45', assignment: '9', attendance: '94' },
      ]);
    }

    setGpaStep(2);
  };

  const setSelectedToolkit = (value: string | null) => {
    if (value) {
      setSearchParams({ toolkit: value });
      setSelectedCategory(null);
      setSelectedLanguage(null);
      setSelectedTool(null);
      setGpaDepartment('');
      setGpaSemester('');
      setCalculationType(null);
      setGpaStep(1);
      setCalculatedScore(null);
    } else {
      setSearchParams({});
      setSelectedCategory(null);
      setSelectedLanguage(null);
      setSelectedTool(null);
      setGpaDepartment('');
      setGpaSemester('');
      setCalculationType(null);
      setGpaStep(1);
      setCalculatedScore(null);
    }
  };

  const toolkitRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#FAF9FC]">
      {/* Header */}
      {!selectedToolkit && (
        <div className="bg-white border-b border-[#E9E5EE] py-10">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs text-[#9E91B6] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Link to="/" className="hover:text-[#FF6B00]">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#FF6B00] font-semibold">Student Toolkit</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A0B2E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Student{' '}
                <span style={{ background: 'linear-gradient(135deg, #FF6B00, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Toolkit
                </span>
              </h1>
              <p className="text-[#4A3E5E]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Access specialized development environments, IDE configurations, compiler guides, and department toolkits.
              </p>
            </motion.div>
          </div>
        </div>
      )}

      <div className="container-custom pt-10 pb-32 lg:pb-44">
        {selectedToolkit ? (
          (() => {
            const TOOLKIT_MAP: Record<string, { categories: typeof CS_TOOLS_CATEGORIES; label: string }> = {
              cs: { categories: CS_TOOLS_CATEGORIES, label: 'Computer Science' },
              business: { categories: BUSINESS_TOOLS_CATEGORIES, label: 'Business' },
              electrical: { categories: EE_TOOLS_CATEGORIES, label: 'Electrical & Electronics' },
              cybersecurity: { categories: CYBERSECURITY_TOOLS_CATEGORIES, label: 'Cybersecurity' },
              ai: { categories: AI_TOOLS_CATEGORIES, label: 'Artificial Intelligence' },
              biotech: { categories: BIOTECH_TOOLS_CATEGORIES, label: 'Biotechnology' },
              gpa: { categories: [], label: 'GPA and Internal Calculator' },
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
                      if (selectedTool) {
                        setSelectedTool(null);
                      } else if (selectedLanguage !== null) {
                        setSelectedLanguage(null);
                      } else if (selectedCategory !== null) {
                        setSelectedCategory(null);
                      } else {
                        setSelectedToolkit(null);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#4A3E5E] bg-white border border-[#E9E5EE] hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all cursor-pointer shadow-2xs mb-4"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {selectedTool
                      ? 'Back to Category'
                      : selectedLanguage !== null
                      ? 'Back to Programming Languages'
                      : selectedCategory !== null
                      ? 'Back to All Categories'
                      : 'Back to Toolkit'}
                  </button>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A0B2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {label} <span style={{ background: 'linear-gradient(135deg, #FF6B00, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Toolkit</span>
                    </h2>
                  </div>
                  <p className="text-[#64748B] text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {selectedLanguage !== null
                      ? `Complete beginner guide, core concepts, use cases, and resources for ${PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage].name}.`
                      : selectedCategory !== null
                      ? `Browse essential ${categories[selectedCategory].title} software, guides, and developer resources.`
                      : selectedToolkit === 'gpa'
                      ? 'Select your department and semester for GPA and internal score calculations.'
                      : `Explore all categories and tools curated for ${label} students.`}
                  </p>
                </motion.div>

                {/* Main Content Area */}
                {selectedToolkit === 'gpa' ? (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto">
                    {gpaStep === 1 ? (
                      /* ── STEP 1: Department and Semester Selection ── */
                      <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#E5E7EB] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6B00] via-[#EF4444] to-[#F97316]" />

                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center font-bold shadow-xs">
                            <Calculator className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              GPA & Internal Calculator
                            </h3>
                            <p className="text-sm text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Step 1 of 2: Select your department and semester to begin.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Department Input */}
                          <div>
                            <label className="block text-sm font-bold text-[#1E293B] mb-2 flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              <Building2 className="w-4 h-4 text-[#F97316]" /> Department
                            </label>
                            <select
                              value={gpaDepartment}
                              onChange={(e) => setGpaDepartment(e.target.value)}
                              className="w-full px-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 text-[#1E293B] text-sm font-medium transition-all outline-none cursor-pointer"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              <option value="" disabled>Select Department</option>
                              {DEPARTMENTS.filter(d => d !== 'All Departments').map((dept, idx) => (
                                <option key={idx} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>

                          {/* Semester Input */}
                          <div>
                            <label className="block text-sm font-bold text-[#1E293B] mb-2 flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              <GraduationCap className="w-4 h-4 text-[#F97316]" /> Semester
                            </label>
                            <select
                              value={gpaSemester}
                              onChange={(e) => setGpaSemester(e.target.value)}
                              className="w-full px-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 text-[#1E293B] text-sm font-medium transition-all outline-none cursor-pointer"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              <option value="" disabled>Select Semester</option>
                              {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map((sem, idx) => (
                                <option key={idx} value={sem}>{sem}</option>
                              ))}
                            </select>
                          </div>

                          {/* Two Action Buttons to proceed to Step 2 */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <button
                              onClick={() => handleProceedToStep2('internal')}
                              disabled={!gpaDepartment || !gpaSemester}
                              className={`py-3.5 px-5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                                gpaDepartment && gpaSemester
                                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white shadow-purple-500/20 hover:scale-[1.01]'
                                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none'
                              }`}
                              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                              <BarChart3 className="w-4 h-4" />
                              Calculate Internal
                            </button>

                            <button
                              onClick={() => handleProceedToStep2('gpa')}
                              disabled={!gpaDepartment || !gpaSemester}
                              className={`py-3.5 px-5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                                gpaDepartment && gpaSemester
                                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:from-[#EA580C] hover:to-[#DD6B20] text-white shadow-orange-500/20 hover:scale-[1.01]'
                                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none'
                              }`}
                              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                              <Calculator className="w-4 h-4" />
                              Calculate GPA
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ── STEP 2: Subject Input and Marks Section ── */
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E5E7EB] shadow-xl relative overflow-hidden">
                          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F1F5F9]">
                            <div>
                              <button
                                onClick={() => setGpaStep(1)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#EA580C] transition-colors mb-2 cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Selection
                              </button>
                              <h3 className="text-xl md:text-2xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                {calculationType === 'gpa' ? 'GPA Calculation' : 'Internal Marks Calculation'}
                              </h3>
                              <p className="text-xs font-semibold text-[#64748B] mt-0.5">
                                {gpaDepartment} — <span className="text-[#FF6B00]">{gpaSemester}</span>
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#FF6B00] flex items-center justify-center font-bold shrink-0">
                              {calculationType === 'gpa' ? <Calculator className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />}
                            </div>
                          </div>

                          {isImsAutoFilled && calculationType === 'gpa' && (
                            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#1E293B]">Official RIT IMS Grades Loaded</p>
                                  <p className="text-[11px] text-[#64748B]">Pre-populated from student records. Adjust any course below to test target GPA.</p>
                                </div>
                              </div>
                              {calculatedScore && (
                                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-orange-200 text-center shrink-0">
                                  <p className="text-[9px] uppercase font-bold text-[#94A3B8]">Calculated SGPA</p>
                                  <p className="text-sm font-black text-[#FF6B00]">{calculatedScore} / 10.00</p>
                                </div>
                              )}
                            </div>
                          )}

                          {calculationType === 'gpa' ? (
                            /* ── Clean 2-Column GPA Layout (Fixed Credits, Grade Input Only) ── */
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8] px-1 mb-2">
                                <span>Subject & Credits</span>
                                <span>Grade Achieved</span>
                              </div>

                              {(() => {
                                const selectedElectiveCodes = new Set(subjects.filter((s) => s.isElective && s.electiveCode).map((s) => s.electiveCode));

                                return subjects.filter(s => s.credits > 0).map((sub, idx) => (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all">
                                    <div className="flex-1 min-w-0 pr-2">
                                      {sub.isElective ? (
                                        <div className="space-y-1">
                                          <div className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider">
                                            Professional Elective {sub.electiveSlot}
                                          </div>
                                          <select
                                            value={sub.electiveCode}
                                            onChange={(e) => {
                                              const newCode = e.target.value;
                                              const found = PROFESSIONAL_ELECTIVES_LIST.find((el) => el.code === newCode);
                                              const updated = [...subjects];
                                              updated[idx].electiveCode = newCode;
                                              updated[idx].name = found ? `${found.code} - ${found.name}` : newCode;
                                              setSubjects(updated);
                                              setCalculatedScore(null);
                                            }}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] focus:border-[#FF6B00] text-xs font-bold text-[#1E293B] outline-none cursor-pointer"
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                          >
                                            {PROFESSIONAL_ELECTIVES_LIST.filter((opt) => opt.code === sub.electiveCode || !selectedElectiveCodes.has(opt.code)).map((opt) => (
                                              <option key={opt.code} value={opt.code}>
                                                {opt.code} - {opt.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      ) : (
                                        <p className="text-sm font-bold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                          {sub.name}
                                        </p>
                                      )}
                                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#FFF7ED] text-[#FF6B00] text-[11px] font-bold border border-[#FFEDD5]">
                                        {sub.credits} {sub.credits === 1 ? 'Credit' : 'Credits'}
                                      </span>
                                    </div>
                                    <div className="w-full sm:w-60 shrink-0">
                                      <select
                                        value={sub.grade}
                                        onChange={(e) => {
                                          const updated = [...subjects];
                                          updated[idx].grade = e.target.value;
                                          setSubjects(updated);
                                          setCalculatedScore(null);
                                        }}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-xs font-bold text-[#1E293B] outline-none cursor-pointer shadow-2xs"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                      >
                                        <option value="O">O</option>
                                        <option value="A+">A+</option>
                                        <option value="A">A</option>
                                        <option value="B+">B+</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="UA">UA</option>
                                      </select>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          ) : (
                            /* ── Internal Marks Layout ── */
                            <div className="space-y-4 mb-6">
                              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                <span>Subject Details</span>
                                <span>{subjects.length} Subjects</span>
                              </div>

                              {subjects.map((sub, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      value={sub.name}
                                      onChange={(e) => {
                                        const updated = [...subjects];
                                        updated[idx].name = e.target.value;
                                        setSubjects(updated);
                                        setCalculatedScore(null);
                                      }}
                                      placeholder={`Subject ${idx + 1} Name`}
                                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#1E293B] focus:border-[#FF6B00] outline-none"
                                    />
                                    {subjects.length > 1 && (
                                      <button
                                        onClick={() => {
                                          setSubjects(subjects.filter((_, i) => i !== idx));
                                          setCalculatedScore(null);
                                        }}
                                        className="p-2 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                                        title="Remove subject"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-[#64748B] mb-1">CAT 1 (/50)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={sub.cat1}
                                        onChange={(e) => {
                                          const updated = [...subjects];
                                          updated[idx].cat1 = e.target.value;
                                          setSubjects(updated);
                                          setCalculatedScore(null);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#1E293B] outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-[#64748B] mb-1">CAT 2 (/50)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={sub.cat2}
                                        onChange={(e) => {
                                          const updated = [...subjects];
                                          updated[idx].cat2 = e.target.value;
                                          setSubjects(updated);
                                          setCalculatedScore(null);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#1E293B] outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-[#64748B] mb-1">Assignment (/10)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={sub.assignment}
                                        onChange={(e) => {
                                          const updated = [...subjects];
                                          updated[idx].assignment = e.target.value;
                                          setSubjects(updated);
                                          setCalculatedScore(null);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#1E293B] outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-[#64748B] mb-1">Attendance %</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={sub.attendance}
                                        onChange={(e) => {
                                          const updated = [...subjects];
                                          updated[idx].attendance = e.target.value;
                                          setSubjects(updated);
                                          setCalculatedScore(null);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#1E293B] outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <button
                                onClick={() => {
                                  setSubjects([
                                    ...subjects,
                                    { name: `Subject ${subjects.length + 1}`, credits: 3, grade: 'A', cat1: '40', cat2: '40', assignment: '8', attendance: '90' }
                                  ]);
                                  setCalculatedScore(null);
                                }}
                                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#CBD5E1] hover:border-[#FF6B00] text-xs font-bold text-[#64748B] hover:text-[#FF6B00] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Subject
                              </button>
                            </div>
                          )}

                          {/* Submit Button for Step 2 */}
                          <button
                            onClick={() => {
                              if (calculationType === 'gpa') {
                                const GRADE_MAP: Record<string, number> = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'UA': 0, 'RA': 0 };
                                let totalPts = 0;
                                let totalCreds = 0;
                                subjects.forEach(s => {
                                  const pts = GRADE_MAP[s.grade] ?? 0;
                                  const cred = Number(s.credits) || 0;
                                  totalPts += pts * cred;
                                  totalCreds += cred;
                                });
                                setCalculatedScore(totalCreds > 0 ? (totalPts / totalCreds).toFixed(2) : '0.00');
                              } else {
                                let total = 0;
                                subjects.forEach(s => {
                                  const c1 = (Number(s.cat1) || 0) / 50 * 15;
                                  const c2 = (Number(s.cat2) || 0) / 50 * 15;
                                  const ass = (Number(s.assignment) || 0) / 10 * 5;
                                  const att = (Number(s.attendance) || 0) >= 80 ? 5 : 3;
                                  total += (c1 + c2 + ass + att);
                                });
                                setCalculatedScore(subjects.length > 0 ? (total / subjects.length).toFixed(1) : '0.0');
                              }
                            }}
                            className={`w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                              calculationType === 'gpa'
                                ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:from-[#EA580C] hover:to-[#DD6B20] text-white shadow-orange-500/20 hover:scale-[1.01]'
                                : 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white shadow-purple-500/20 hover:scale-[1.01]'
                            }`}
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {calculationType === 'gpa' ? 'Calculate Final GPA' : 'Calculate Total Internal Marks'}
                          </button>

                          {/* Calculated Result Card */}
                          {calculatedScore !== null && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.96, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-[#FFF7ED] to-[#FFFBEB] border border-[#FED7AA] shadow-sm space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                                  {calculationType === 'gpa' ? 'Calculated SGPA' : 'Average Internal Score'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold">
                                  {gpaSemester}
                                </span>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-[#FFEDD5] flex items-baseline justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-[#64748B] mb-1">{gpaDepartment}</p>
                                  <span className="text-4xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    {calculatedScore} {calculationType === 'gpa' ? '/ 10.00' : '/ 40.0'}
                                  </span>
                                </div>
                                <span className="px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#10B981] text-xs font-bold">
                                  {calculationType === 'gpa'
                                    ? (Number(calculatedScore) >= 9.0 ? 'First Class with Distinction (O)' : Number(calculatedScore) >= 8.5 ? 'First Class with Distinction' : Number(calculatedScore) >= 7.0 ? 'First Class' : Number(calculatedScore) >= 5.0 ? 'Second Class' : 'UA / Reappear')
                                    : (Number(calculatedScore) >= 35 ? 'Excellent' : 'Good')}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : selectedLanguage !== null ? (
                  /* ── Detailed Programming Language Guide View ── */
                  (() => {
                    const guide = PROGRAMMING_LANGUAGES_GUIDES[selectedLanguage];
                    return (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm relative overflow-hidden">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md" style={{ backgroundColor: guide.color }}>
                              <Code className="w-7 h-7" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>{guide.name}</h3>
                              <p className="text-sm font-semibold text-[#F97316]">{guide.tagline}</p>
                            </div>
                          </div>
                          <p className="text-[#475569] leading-relaxed text-base mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {guide.whatItIs}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB]">
                              <h4 className="font-bold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <Sparkles className="w-4 h-4 text-[#F97316]" /> Key Concepts to Learn
                              </h4>
                              <ul className="space-y-2 text-sm text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {guide.keyConcepts.map((concept, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-[#F97316] font-bold">•</span>
                                    <span>{concept}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB]">
                              <h4 className="font-bold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <Globe className="w-4 h-4 text-[#F97316]" /> Real-World Use Cases
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-6">
                                {guide.useCases.map((useCase, idx) => (
                                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#1E293B] shadow-2xs">
                                    {useCase}
                                  </span>
                                ))}
                              </div>

                              <h4 className="font-bold text-[#1E293B] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <ExternalLink className="w-4 h-4 text-[#F97316]" /> Official Documentation & Courses
                              </h4>
                              <div className="space-y-2">
                                {guide.links.map((link, idx) => (
                                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#FFF7ED] border border-[#E5E7EB] hover:border-[#FED7AA] text-xs font-semibold text-[#1E293B] hover:text-[#F97316] transition-all">
                                    <span>{link.label}</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()
                ) : selectedCategory !== null ? (
                  /* ── Tools inside selected Category ── */
                  (() => {
                    const cat = categories[selectedCategory];
                    const IconComp = cat.icon;
                    return (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="flex items-center gap-4 mb-6 p-6 bg-white rounded-2xl border border-[#E5E7EB]">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg, color: cat.color }}>
                            <IconComp className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>{cat.title}</h3>
                            <p className="text-xs text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {cat.tools.length} software tools & resources available
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {cat.tools.map((tool, idx) => (
                            <motion.div
                              key={idx}
                              whileHover={{ y: -4, boxShadow: '0 12px 30px -10px rgba(0,0,0,0.08)' }}
                              onClick={() => {
                                if (selectedToolkit === 'cs' && selectedCategory === 0) {
                                  setSelectedLanguage(idx);
                                } else {
                                  setSelectedTool({ ...tool, category: cat.title, bg: cat.bg, color: cat.color });
                                }
                              }}
                              className="p-6 bg-white hover:bg-[#FFF7ED] rounded-2xl border border-[#E5E7EB] hover:border-[#FED7AA] cursor-pointer group transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-bold text-[#1E293B] group-hover:text-[#F97316] text-base transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {tool.name}
                                  </h4>
                                  <ExternalLink className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F97316] transition-colors" />
                                </div>
                                <p className="text-xs text-[#64748B] leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {tool.desc}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-[#F97316] flex items-center gap-1 group-hover:translate-x-1 transition-transform w-fit">
                                {selectedToolkit === 'cs' && selectedCategory === 0 ? 'View Beginner Guide & Concepts' : 'Explore Tool & Resources'}
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()
                ) : (
                  /* ── Category Cards Grid ── */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => {
                      const IconComp = cat.icon;
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -4, boxShadow: '0 16px 35px -10px rgba(0,0,0,0.08)' }}
                          onClick={() => setSelectedCategory(idx)}
                          className="p-7 bg-white hover:bg-[#FFF7ED] rounded-[22px] border border-[#E5E7EB] hover:border-[#FED7AA] cursor-pointer group transition-all shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105" style={{ backgroundColor: cat.bg, color: cat.color }}>
                              <IconComp className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#F97316] transition-colors mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {cat.title}
                            </h3>
                            <p className="text-xs text-[#64748B] leading-relaxed mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {cat.tools.length} curated tools and guides available.
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                            <span className="text-xs font-semibold text-[#94A3B8] group-hover:text-[#F97316] transition-colors">Browse Tools</span>
                            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F97316] group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div>
            {/* Toolkit Section Main */}
            <div ref={toolkitRef} />
            <SectionTitle tag="Useful Downloads" title="Student" highlight="Toolkit" align="left" />
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
              {TOOLKIT_ITEMS.map((item) => {
                if (item.title === 'GPA and internal calculator') {
                  return (
                    <StaggerItem key={item.id} className="col-span-1 md:col-span-2 flex">
                      <motion.div
                        onClick={() => setSelectedToolkit('gpa')}
                        whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(239,68,68,0.22)' }}
                        className="relative w-full p-7 md:p-8 bg-gradient-to-r from-[#FFF7ED] via-[#FEF2F2] to-[#FFF1F2] rounded-[26px] border-2 border-[#FECACA] hover:border-[#FCA5A5] cursor-pointer group transition-all shadow-md hover:shadow-xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                      >
                        {/* Top Gradient Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF6B00] via-[#EF4444] to-[#F97316]" />

                        <div className="flex items-start md:items-center gap-5 flex-1 min-w-0 z-10">
                          <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-tr from-[#EF4444] via-[#F97316] to-[#FF6B00] text-white flex items-center justify-center shrink-0 font-bold shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform">
                            <Calculator className="w-8 h-8 md:w-9 md:h-9" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-[#EF4444] to-[#F97316] text-white shadow-xs tracking-wide uppercase">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> POPULAR UTILITY
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-[#991B1B] border border-red-200 shadow-2xs">
                                RIT Regulations
                              </span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-extrabold text-[#1E293B] group-hover:text-[#EF4444] transition-colors mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              GPA, CGPA & Internal Marks Calculator
                            </h3>

                            <p className="text-sm text-[#475569] leading-relaxed max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Calculate your semester GPA, overall CGPA, and internal assessment marks based on official department course regulations and grade points.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-medium text-[#64748B]">
                              <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/80">
                                <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Semester GPA
                              </span>
                              <span className="flex items-center gap-1.5 text-orange-700 font-semibold bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/80">
                                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> Cumulative CGPA
                              </span>
                              <span className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Internal Score
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 z-10 self-end md:self-center shrink-0">
                          <button className="px-6 py-3 bg-gradient-to-r from-[#EF4444] via-[#F97316] to-[#FF6B00] hover:from-[#DC2626] hover:to-[#EA580C] text-white font-bold text-sm rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all flex items-center gap-2">
                            Calculate Now
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                }

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
                      whileHover={{ y: -4, boxShadow: '0 12px 30px -10px rgba(249,115,22,0.15)' }}
                      className="flex items-start gap-5 p-7 bg-white hover:bg-[#FFF7ED] rounded-[22px] border border-[#E5E7EB] hover:border-[#FED7AA] cursor-pointer group w-full transition-all shadow-xs hover:shadow-md"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm transition-transform group-hover:scale-105"
                        style={{ backgroundColor: iconConfig.bg, color: iconConfig.color }}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base lg:text-lg font-bold text-[#1E293B] group-hover:text-[#F97316] transition-colors mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {item.title}
                        </div>
                        <div className="text-sm text-[#64748B] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#F97316] group-hover:translate-x-1.5 transition-all shrink-0 mt-1" />
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}
      </div>

      {/* Tool Modal */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#E5E7EB] shadow-2xl relative"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: selectedTool.bg, color: selectedTool.color }}>
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>{selectedTool.name}</h3>
                <span className="text-xs font-semibold text-[#F97316]">{selectedTool.category}</span>
              </div>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              {selectedTool.desc}
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
              <button
                onClick={() => setSelectedTool(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-all cursor-pointer"
              >
                Close
              </button>
              {selectedTool.url && selectedTool.url !== '#' && (
                <a
                  href={selectedTool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Visit Official Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
