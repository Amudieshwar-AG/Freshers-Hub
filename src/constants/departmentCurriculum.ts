export interface SubjectCurriculum {
  name: string;
  credits: number;
  code?: string;
  isElective?: boolean;
  electiveSlot?: number;
}

export const PROFESSIONAL_ELECTIVES_LIST: Array<{ code: string; name: string; credits: number }> = [
  { code: 'AD23V11', name: 'Agriculture Data Analytics', credits: 3 },
  { code: 'AD23V12', name: 'Big Data Analytics', credits: 3 },
  { code: 'AD23V13', name: 'Data warehousing and Data Mining', credits: 3 },
  { code: 'AD23V14', name: 'Health Care Analytics', credits: 3 },
  { code: 'AD23V15', name: 'Image and Video Analytics', credits: 3 },
  { code: 'AD23V16', name: 'Web and Social Media Analytics', credits: 3 },
  { code: 'AD23V17', name: 'Predictive Analytics', credits: 3 },
  { code: 'AD23V18', name: 'Sentiment Analysis', credits: 3 },
  { code: 'AD23V21', name: 'AI in IoT', credits: 3 },
  { code: 'AD23V22', name: 'Applied Machine Learning', credits: 3 },
  { code: 'AD23V23', name: 'Cognitive Computing', credits: 3 },
  { code: 'AD23V24', name: 'Computer Vision', credits: 3 },
  { code: 'AD23V25', name: 'Ethics For AI', credits: 3 },
  { code: 'AD23V26', name: 'Game Theory', credits: 3 },
  { code: 'AD23V27', name: 'Quantum Computing Techniques', credits: 3 },
  { code: 'AD23V28', name: 'Responsive AI', credits: 3 },
];

export const DEPARTMENT_CODE_MAP: Record<string, string> = {
  'Artificial Intelligence & Data Science': 'AIDS',
  'Artificial Intelligence & Machine Learning': 'AIML',
  'Biotechnology': 'BIOTECH',
  'Communication and Computer Engineering': 'CCE',
  'Computer Science & Business Systems': 'CSBS',
  'Computer Science & Engineering': 'CSE',
  'Electronics & Communication Engineering': 'ECE',
  'Electronics Engineering VLSI (Design and Technology)': 'VLSI',
  'Mechanical Engineering': 'MECH',
};

export const DEPARTMENT_CURRICULUM: Record<string, Record<number, SubjectCurriculum[]>> = {
  AIDS: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Physics for Information Science (PH23111)", credits: 3 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Basic Electrical and Electronics Engineering (GE23113)", credits: 3 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Physics Laboratory (PH23121)", credits: 1 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23122)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Engineering Chemistry (CY23211)", credits: 3 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Tamil & Technology (GE23213)", credits: 0 },
      { name: "Engineering Graphics (GE23231)", credits: 4 },
      { name: "Data Structures Design (AD23231)", credits: 4 },
      { name: "Chemistry Laboratory (CY23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 }
    ],
    3: [
      { name: "Discrete Mathematics (MA23311)", credits: 4 },
      { name: "Artificial Intelligence (AL23311)", credits: 3 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Database Management Systems (CS23411)", credits: 3 },
      { name: "Digital Principles and Computer Organization (EC23331)", credits: 4 },
      { name: "Artificial Intelligence Laboratory (AL23321)", credits: 1 },
      { name: "Database Management Systems Laboratory (CS23421)", credits: 1 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "Data Wrangling (AD231C1)", credits: 1 }
    ],
    4: [
      { name: "Environmental Science and Sustainability (GE23411)", credits: 2 },
      { name: "Probability and Statistics (MA23411)", credits: 4 },
      { name: "Data Analytics (AD23411)", credits: 3 },
      { name: "Machine Learning (AL23411)", credits: 3 },
      { name: "Operating Systems (CS23412)", credits: 3 },
      { name: "Design and Analysis of Algorithms (CS23431)", credits: 4 },
      { name: "Data Analytics Laboratory (AD23421)", credits: 1 },
      { name: "Machine Learning Laboratory (AL23421)", credits: 1 },
      { name: "Operating Systems Laboratory (CS23422)", credits: 1 },
      { name: "Introduction to Azure Machine Learning (AD231C1)", credits: 1 }
    ],
    5: [
      { name: "Deep Learning (AD23511)", credits: 3 },
      { name: "Computer Networks (CS23511)", credits: 3 },
      { name: "Data Exploration and Visualization (AD23532)", credits: 4 },
      { name: "Business Analytics (CB23531)", credits: 4 },
      { name: "Disaster Risk Reduction and Management", credits: 0 },
      { name: "Big Data Analytics (AD23531)", credits: 3 },
      { name: "Image & Video Analytics (AD23V15)", credits: 3 },
      { name: "Tableau - Data Visualization (AD23IC3)", credits: 1 },
      { name: "Deep Learning Laboratory (AD23521)", credits: 1 },
      { name: "Computer Networks Laboratory (CS23521)", credits: 1 }
    ],
    6: [
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Embedded Systems and IoT (EC23631)", credits: 4 },
      { name: "Object Oriented Software Engineering (CS23631)", credits: 4 },
      { name: "Mini Project (AD23621)", credits: 2 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Data and Information Security (CB23511)", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Internship / Certification Course (AD23721)", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work (AD23821)", credits: 10 }
    ]
  },

  AIML: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Engineering Chemistry (CY23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Engineering Graphics (GE23131)", credits: 4 },
      { name: "Chemistry Laboratory (CY23121)", credits: 1 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23122)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Physics for Information Science (PH23211)", credits: 3 },
      { name: "Basic Electrical and Electronics Engineering (GE23211)", credits: 3 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Data Structures and Design (AD23231)", credits: 4 },
      { name: "Physics Laboratory (PH23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 }
    ],
    3: [
      { name: "Discrete Mathematics (MA23311)", credits: 4 },
      { name: "Artificial Intelligence (AL23311)", credits: 3 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Database Management Systems (CS23411)", credits: 3 },
      { name: "Digital Principles and Computer Organization (EC23331)", credits: 4 },
      { name: "Artificial Intelligence Laboratory (AL23321)", credits: 1 },
      { name: "Database Management Systems Laboratory (CS23421)", credits: 1 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "Data Wrangling (AD231C1)", credits: 1 }
    ],
    4: [
      { name: "Environmental Sciences and Sustainability (GE23411)", credits: 2 },
      { name: "Formal Language and Automata Theory (AD23412)", credits: 4 },
      { name: "Data Analytics (AD23411)", credits: 3 },
      { name: "Machine Learning (AL23411)", credits: 3 },
      { name: "Operating Systems (CS23412)", credits: 3 },
      { name: "Design and Analysis of Algorithms (CS23431)", credits: 4 },
      { name: "Machine Learning Laboratory (AL23421)", credits: 1 },
      { name: "Data Analytics Laboratory (AD23421)", credits: 1 },
      { name: "Operating Systems Laboratory (CS23422)", credits: 1 },
      { name: "Introduction to Azure Machine Learning (AD231C1)", credits: 1 }
    ],
    5: [
      { name: "Deep Learning for Computer Vision (AL23511)", credits: 3 },
      { name: "Computer Networks (CS23511)", credits: 3 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Natural Language Processing (AL23531)", credits: 4 },
      { name: "Big Data Analytics (AD23531)", credits: 4 },
      { name: "Deep Learning for Computer Vision Laboratory (AL23521)", credits: 1 },
      { name: "Computer Networks Laboratory (CS23521)", credits: 1 },
      { name: "Industry Oriented Course III", credits: 1 }
    ],
    6: [
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Embedded Systems and IoT (EC23631)", credits: 4 },
      { name: "Object Oriented Software Engineering (CS23631)", credits: 4 },
      { name: "Mini Project (AL23621)", credits: 2 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Cryptography and Cyber Security (CS23513)", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Internship / Certification Course (AL23721)", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work (AL23821)", credits: 10 }
    ]
  },

  BIOTECH: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Engineering Chemistry (CY23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Engineering Graphics (GE23131)", credits: 4 },
      { name: "Chemistry Laboratory (CY23121)", credits: 1 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Physics for Information Science (PH23211)", credits: 3 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Basic Electrical and Electronics Engineering (GE23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Physics Laboratory (PH23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23223)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 1", credits: 2 }
    ],
    3: [
      { name: "Discrete Mathematics (MA23311)", credits: 4 },
      { name: "Fundamentals of Economics and Financial Accounting (CB23311)", credits: 4 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Data Structures and Algorithms (CS23314)", credits: 3 },
      { name: "Digital Principles and Computer Organization (EC23331)", credits: 4 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "Data Structures and Algorithms Laboratory (CS23324)", credits: 1 },
      { name: "Design Thinking (CB23IC1)", credits: 1 }
    ],
    4: [
      { name: "Environmental Science and Sustainability (GE23411)", credits: 2 },
      { name: "Probability and Statistics (MA23411)", credits: 4 },
      { name: "Introduction to Business Systems (CB23411)", credits: 3 },
      { name: "Database Management Systems (CS23411)", credits: 3 },
      { name: "Operating Systems (CS23412)", credits: 3 },
      { name: "Artificial Intelligence and Machine Learning (AL23431)", credits: 4 },
      { name: "Database Management Systems Laboratory (CS23421)", credits: 1 },
      { name: "Operating Systems Laboratory (CS23422)", credits: 1 },
      { name: "Enterprise Resource Planning (CB23IC2)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 2", credits: 3 }
    ],
    5: [
      { name: "Data and Information Security (CB23511)", credits: 3 },
      { name: "Fundamentals of Management (CB23512)", credits: 3 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Deep Learning Techniques (AD23531)", credits: 4 },
      { name: "Business Analytics (CB23531)", credits: 4 },
      { name: "Data and Information Security Laboratory (CB23521)", credits: 1 },
      { name: "Business Communication Laboratory – I (GE23521)", credits: 1 },
      { name: "Visualization Tools using R (CB23IC3)", credits: 1 }
    ],
    6: [
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Embedded Systems and IoT (EC23631)", credits: 4 },
      { name: "Object Oriented Software Engineering (CS23631)", credits: 4 },
      { name: "Mini Project (CB23621)", credits: 2 },
      { name: "Business Communication Laboratory – II (GE23621)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 3", credits: 3 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Cryptography and Cyber Security (CS23513)", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Cloud Computing (CS23731)", credits: 4 },
      { name: "Internship / Certification Course (CB23721)", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work (CB23821)", credits: 10 }
    ]
  },

  CSBS: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Engineering Chemistry (CY23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Engineering Graphics (GE23131)", credits: 4 },
      { name: "Chemistry Laboratory (CY23121)", credits: 1 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Physics for Information Science (PH23211)", credits: 3 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Basic Electrical and Electronics Engineering (GE23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Physics Laboratory (PH23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23223)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 1", credits: 2 }
    ],
    3: [
      { name: "Discrete Mathematics (MA23311)", credits: 4 },
      { name: "Fundamentals of Economics and Financial Accounting (CB23311)", credits: 4 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Data Structures and Algorithms (CS23314)", credits: 3 },
      { name: "Digital Principles and Computer Organization (EC23331)", credits: 4 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "Data Structures and Algorithms Laboratory (CS23324)", credits: 1 },
      { name: "Design Thinking (CB23IC1)", credits: 1 }
    ],
    4: [
      { name: "Environmental Science and Sustainability (GE23411)", credits: 2 },
      { name: "Probability and Statistics (MA23411)", credits: 4 },
      { name: "Introduction to Business Systems (CB23411)", credits: 3 },
      { name: "Database Management Systems (CS23411)", credits: 3 },
      { name: "Operating Systems (CS23412)", credits: 3 },
      { name: "Artificial Intelligence and Machine Learning (AL23431)", credits: 4 },
      { name: "Database Management Systems Laboratory (CS23421)", credits: 1 },
      { name: "Operating Systems Laboratory (CS23422)", credits: 1 },
      { name: "Enterprise Resource Planning (CB23IC2)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 2", credits: 3 }
    ],
    5: [
      { name: "Data and Information Security (CB23511)", credits: 3 },
      { name: "Fundamentals of Management (CB23512)", credits: 3 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Deep Learning Techniques (AD23531)", credits: 4 },
      { name: "Business Analytics (CB23531)", credits: 4 },
      { name: "Data and Information Security Laboratory (CB23521)", credits: 1 },
      { name: "Business Communication Laboratory – I (GE23521)", credits: 1 },
      { name: "Visualization Tools using R (CB23IC3)", credits: 1 }
    ],
    6: [
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Embedded Systems and IoT (EC23631)", credits: 4 },
      { name: "Object Oriented Software Engineering (CS23631)", credits: 4 },
      { name: "Mini Project (CB23621)", credits: 2 },
      { name: "Business Communication Laboratory – II (GE23621)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 3", credits: 3 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Cryptography and Cyber Security (CS23513)", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Cloud Computing (CS23731)", credits: 4 },
      { name: "Internship / Certification Course (CB23721)", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work (CB23821)", credits: 10 }
    ]
  },

  CCE: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Physics for Electronics Engineering (PH23112)", credits: 3 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Circuit Analysis (EC23111)", credits: 4 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23122)", credits: 1 },
      { name: "Physics Laboratory (PH23121)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Engineering Chemistry (CY23211)", credits: 3 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Electronic Devices and Circuits (EC23231)", credits: 4 },
      { name: "Engineering Graphics (GE23231)", credits: 4 },
      { name: "Chemistry Laboratory (CY23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 1", credits: 1 }
    ],
    3: [
      { name: "Environmental Science and Sustainability (GE23311)", credits: 2 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Wide Band-gap Devices (EV23311)", credits: 3 },
      { name: "Digital System Design (EC23312)", credits: 3 },
      { name: "Signals and Systems (EC23313)", credits: 4 },
      { name: "Digital System Design Laboratory (EC23321)", credits: 1 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "PCB Design (EC23IC1)", credits: 1 }
    ],
    4: [
      { name: "Random Process and Linear Algebra (MA23412)", credits: 4 },
      { name: "Microprocessors and Microcontrollers (EV23411)", credits: 3 },
      { name: "Electromagnetic Fields (EC23412)", credits: 3 },
      { name: "Linear Integrated Circuits (EC23413)", credits: 3 },
      { name: "Digital Signal Processing (EC23431)", credits: 4 },
      { name: "Networks and Security (EC23432)", credits: 3 },
      { name: "Microprocessors and Microcontrollers Laboratory (EV23421)", credits: 1 },
      { name: "Linear Integrated Circuits Laboratory (EC23422)", credits: 1 },
      { name: "Design Thinking for Engineers (CC23IC2)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 2", credits: 2 }
    ],
    5: [
      { name: "ASIC Design (EV23511)", credits: 3 },
      { name: "VLSI and Chip Design (EC23512)", credits: 3 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Embedded Systems and IoT Design (EC23531)", credits: 4 },
      { name: "Artificial Intelligence and Machine Learning (AL23431)", credits: 4 },
      { name: "VLSI Laboratory (EC23521)", credits: 1 },
      { name: "Introduction to ARM Based System Design (EV23IC3)", credits: 1 }
    ],
    6: [
      { name: "CMOS Analog and Mixed Signal IC Design (EV23611)", credits: 3 },
      { name: "Digital Logic Synthesis using HDL (EV23612)", credits: 4 },
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Mini Project (EC23621)", credits: 2 },
      { name: "NCC / Service Club Credit Course Level 3", credits: 3 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Internship / Certification Course", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work", credits: 10 }
    ]
  },

  CSE: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Engineering Chemistry (CY23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Engineering Graphics (GE23131)", credits: 4 },
      { name: "Chemistry Laboratory (CY23121)", credits: 1 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Physics for Information Science (PH23211)", credits: 3 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Basic Electrical and Electronics Engineering (GE23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Physics Laboratory (PH23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23223)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 1", credits: 2 }
    ],
    3: [
      { name: "Environmental Science and Sustainability (GE23311)", credits: 2 },
      { name: "Discrete Mathematics (MA23311)", credits: 4 },
      { name: "Artificial Intelligence (AL23311)", credits: 3 },
      { name: "Data Structures (CS23311)", credits: 3 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Digital Principles and Computer Organization (EC23331)", credits: 4 },
      { name: "Data Structures Laboratory (CS23321)", credits: 1 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "Design Thinking for Software Engineers", credits: 1 }
    ],
    4: [
      { name: "Database Management Systems (CS23411)", credits: 3 },
      { name: "Operating Systems (CS23412)", credits: 3 },
      { name: "Theory of Computation (CS23413)", credits: 3 },
      { name: "Software Development Practices (CS23414)", credits: 3 },
      { name: "Machine Learning Techniques (AL23432)", credits: 4 },
      { name: "Design and Analysis of Algorithms (CS23431)", credits: 4 },
      { name: "Database Management Systems Laboratory (CS23421)", credits: 1 },
      { name: "Operating Systems Laboratory (CS23422)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 2", credits: 3 }
    ],
    5: [
      { name: "Computer Networks (CS23511)", credits: 3 },
      { name: "Compiler Design (CS23512)", credits: 3 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Deep Learning Techniques (AD23531)", credits: 4 },
      { name: "Data Exploration and Visualization (AD23532)", credits: 4 },
      { name: "Computer Networks Laboratory (CS23521)", credits: 1 },
      { name: "Industry Oriented Course", credits: 1 }
    ],
    6: [
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Embedded Systems and IoT (EC23631)", credits: 4 },
      { name: "Object Oriented Software Engineering (CS23631)", credits: 4 },
      { name: "Mini Project", credits: 2 },
      { name: "NCC / Service Club Credit Course Level 3", credits: 3 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Cryptography and Cyber Security (CS23513)", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Natural Language Processing (AL23531)", credits: 4 },
      { name: "Internship / Certification Course", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work", credits: 10 }
    ]
  },

  ECE: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Physics for Electronics Engineering (PH23112)", credits: 3 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Circuit Analysis (EC23111)", credits: 4 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Physics Laboratory (PH23121)", credits: 1 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23122)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Engineering Chemistry (CY23211)", credits: 3 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Electronic Devices and Circuits (EC23231)", credits: 4 },
      { name: "Engineering Graphics (GE23231)", credits: 4 },
      { name: "Chemistry Laboratory (CY23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 1", credits: 2 }
    ],
    3: [
      { name: "Environmental Science and Sustainability (GE23311)", credits: 2 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Control Systems (EC23311)", credits: 4 },
      { name: "Digital System Design (EC23312)", credits: 3 },
      { name: "Signals and Systems (EC23313)", credits: 4 },
      { name: "Digital System Design Laboratory (EC23321)", credits: 1 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "PCB Design (EC23IC1)", credits: 1 }
    ],
    4: [
      { name: "Random Process and Linear Algebra (MA23412)", credits: 4 },
      { name: "Communication Systems (EC23411)", credits: 3 },
      { name: "Electromagnetic Fields (EC23412)", credits: 3 },
      { name: "Linear Integrated Circuits (EC23413)", credits: 3 },
      { name: "Digital Signal Processing (EC23431)", credits: 4 },
      { name: "Networks and Security (EC23432)", credits: 3 },
      { name: "Communication Systems Laboratory (EC23421)", credits: 1 },
      { name: "Linear Integrated Circuits Laboratory (EC23422)", credits: 1 },
      { name: "Cyber Security (EC23IC2)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 2", credits: 3 }
    ],
    5: [
      { name: "Transmission Lines & RF Systems (EC23511)", credits: 3 },
      { name: "VLSI and Chip Design (EC23512)", credits: 3 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Embedded Systems and IoT Design (EC23531)", credits: 4 },
      { name: "Artificial Intelligence and Machine Learning (AL23431)", credits: 4 },
      { name: "VLSI Laboratory (EV23521)", credits: 1 },
      { name: "Introduction to Robotics (EC23IC3)", credits: 1 }
    ],
    6: [
      { name: "Antenna Theory (EC23611)", credits: 3 },
      { name: "Wireless Communication (EC23612)", credits: 3 },
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Mini Project (EC23621)", credits: 2 },
      { name: "Wireless Communication Laboratory (EC23622)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 3", credits: 3 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Ad Hoc and Wireless Sensor Networks (EC23711)", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Internship / Certification Course", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work", credits: 10 }
    ]
  },

  VLSI: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Physics for Electronics Engineering (PH23112)", credits: 3 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Circuit Analysis (EC23111)", credits: 4 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23122)", credits: 1 },
      { name: "Physics Laboratory (PH23121)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Engineering Chemistry (CY23211)", credits: 3 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Electronic Devices and Circuits (EC23231)", credits: 4 },
      { name: "Engineering Graphics (GE23231)", credits: 4 },
      { name: "Chemistry Laboratory (CY23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 }
    ],
    3: [
      { name: "Environmental Science and Sustainability (GE23311)", credits: 2 },
      { name: "Wide Band-gap Devices (EV23311)", credits: 3 },
      { name: "Digital System Design (EC23312)", credits: 3 },
      { name: "Signals and Systems (EC23313)", credits: 4 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Digital System Design Laboratory (EC23321)", credits: 1 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 },
      { name: "PCB Design (EC23IC1)", credits: 1 }
    ],
    4: [
      { name: "Random Process and Linear Algebra (MA23412)", credits: 4 },
      { name: "Microprocessors and Microcontrollers (EV23411)", credits: 3 },
      { name: "Electromagnetic Fields (EC23412)", credits: 3 },
      { name: "Linear Integrated Circuits (EC23413)", credits: 3 },
      { name: "Digital Signal Processing (EC23431)", credits: 4 },
      { name: "Networks and Security (EC23432)", credits: 3 },
      { name: "Microprocessors and Microcontrollers Laboratory (EV23421)", credits: 1 },
      { name: "Linear Integrated Circuits Laboratory (EC23422)", credits: 1 },
      { name: "Design Thinking for Engineers (CC23IC2)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 2", credits: 2 }
    ],
    5: [
      { name: "ASIC Design (EV23511)", credits: 3 },
      { name: "VLSI and Chip Design (EC23512)", credits: 3 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Embedded Systems and IoT Design (EC23531)", credits: 4 },
      { name: "Artificial Intelligence and Machine Learning (AL23431)", credits: 4 },
      { name: "VLSI Laboratory (EC23521)", credits: 1 },
      { name: "Introduction to ARM Based System Design (EV23IC3)", credits: 1 }
    ],
    6: [
      { name: "CMOS Analog and Mixed Signal IC Design (EV23611)", credits: 3 },
      { name: "Digital Logic Synthesis using HDL (EV23612)", credits: 4 },
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Mini Project", credits: 2 },
      { name: "NCC / Service Club Credit Course Level 3", credits: 3 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Internship / Certification Course", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work", credits: 10 }
    ]
  },

  MECH: {
    1: [
      { name: "Communicative English (HS23111)", credits: 3 },
      { name: "Matrices and Calculus (MA23111)", credits: 4 },
      { name: "Electrical, Electronics and Instrumentation Engineering (GE23114)", credits: 3 },
      { name: "Problem Solving and C Programming (GE23111)", credits: 3 },
      { name: "Materials Science (PH23113)", credits: 3 },
      { name: "Heritage of Tamils (GE23112)", credits: 0 },
      { name: "Physics Laboratory (PH23121)", credits: 1 },
      { name: "Problem Solving and C Programming Laboratory (GE23121)", credits: 1 },
      { name: "Engineering Practices Laboratory (GE23122)", credits: 1 },
      { name: "Basic Electrical and Electronics Engineering Laboratory (GE23123)", credits: 1 }
    ],
    2: [
      { name: "Professional English (HS23211)", credits: 2 },
      { name: "Engineering Chemistry (CY23211)", credits: 3 },
      { name: "Statistics and Numerical Methods (MA23211)", credits: 4 },
      { name: "Python for Data Science (AD23211)", credits: 3 },
      { name: "Tamils and Technology (GE23213)", credits: 0 },
      { name: "Engineering Graphics (GE23231)", credits: 4 },
      { name: "Chemistry Laboratory (CY23221)", credits: 1 },
      { name: "Python for Data Science Laboratory (AD23221)", credits: 1 },
      { name: "Communication Laboratory / Foreign Language (GE23221)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 1", credits: 2 }
    ],
    3: [
      { name: "Transforms and Partial Differential Equations (MA23313)", credits: 4 },
      { name: "Engineering Mechanics (ME23311)", credits: 3 },
      { name: "Engineering Thermodynamics (ME23312)", credits: 4 },
      { name: "Fluid Mechanics and Machinery (ME23313)", credits: 4 },
      { name: "Manufacturing Processes (ME23314)", credits: 3 },
      { name: "Object Oriented Programming (CS23312)", credits: 3 },
      { name: "Computer Aided Machine Drawing Laboratory (ME23321)", credits: 1 },
      { name: "Object Oriented Programming Laboratory (CS23322)", credits: 1 }
    ],
    4: [
      { name: "Environmental Science for Mechanical Engineers (GE23412)", credits: 2 },
      { name: "Engineering Materials and Metallurgy (ME23411)", credits: 3 },
      { name: "Manufacturing Technology (ME23412)", credits: 3 },
      { name: "Mechanics of Solids (ME23413)", credits: 3 },
      { name: "Theory of Machines (ME23414)", credits: 4 },
      { name: "Thermal Engineering (ME23431)", credits: 4 },
      { name: "Manufacturing Technology Laboratory (ME23421)", credits: 1 },
      { name: "Strength of Materials and Fluid Machinery Laboratory (ME23422)", credits: 1 },
      { name: "Introduction to Product Lifecycle Management (ME23IC1)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 2", credits: 3 }
    ],
    5: [
      { name: "Design of Machine Elements (ME23511)", credits: 4 },
      { name: "Heat and Mass Transfer (ME23512)", credits: 4 },
      { name: "Professional Elective I", credits: 3, isElective: true, electiveSlot: 1 },
      { name: "Professional Elective II", credits: 3, isElective: true, electiveSlot: 2 },
      { name: "Mandatory Course I", credits: 0 },
      { name: "Mechatronics (ME23531)", credits: 4 },
      { name: "Heat Transfer Laboratory (ME23521)", credits: 1 },
      { name: "Professional / Skill Development (ME23522)", credits: 1 },
      { name: "Introduction to Supply Chain Management (ME23IC2)", credits: 1 }
    ],
    6: [
      { name: "Design of Transmission Systems (ME23611)", credits: 3 },
      { name: "Professional Elective III", credits: 3, isElective: true, electiveSlot: 3 },
      { name: "Professional Elective IV", credits: 3, isElective: true, electiveSlot: 4 },
      { name: "Open Elective I", credits: 3 },
      { name: "Open Elective II", credits: 3 },
      { name: "Mandatory Course II", credits: 0 },
      { name: "Metrology and Measurements (ME23631)", credits: 4 },
      { name: "Design and Fabrication Project (ME23621)", credits: 2 },
      { name: "CAD and CAM Laboratory (ME23622)", credits: 1 },
      { name: "Dynamics Laboratory (ME23623)", credits: 1 },
      { name: "Introduction to HVAC Systems (ME23IC3)", credits: 1 },
      { name: "NCC / Service Club Credit Course Level 3", credits: 3 }
    ],
    7: [
      { name: "Human Values and Ethics (GE23711)", credits: 2 },
      { name: "Elective – Management", credits: 3 },
      { name: "Industrial Robotics (ME23712)", credits: 4 },
      { name: "Finite Element Analysis (ME23713)", credits: 4 },
      { name: "Professional Elective V", credits: 3, isElective: true, electiveSlot: 5 },
      { name: "Professional Elective VI", credits: 3, isElective: true, electiveSlot: 6 },
      { name: "Internship / Certification Course (ME23721)", credits: 2 }
    ],
    8: [
      { name: "Open Elective III", credits: 3 },
      { name: "Project Work", credits: 10 }
    ]
  }
};
