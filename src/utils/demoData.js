// Demo resumes to test the system without needing to upload real files
import { generateId, parseResumeData } from './resumeUtils';

const DEMO_TEXTS = [
  {
    filename: 'Arjun_Kumar.txt',
    text: `Arjun Kumar
arjun.kumar@gmail.com | +91 98765 43210

OBJECTIVE
Passionate Full Stack Developer with 3 years of experience building scalable web applications using React and Node.js.

EXPERIENCE
Senior Developer at TechCorp Pvt Ltd (2021-2024)
- Built REST APIs using Node.js and Express
- Developed frontend with React, TypeScript, Redux
- Managed PostgreSQL and MongoDB databases

EDUCATION
B.Tech Computer Science - Anna University (2020)

SKILLS
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, Docker, Git, REST API, AWS`
  },
  {
    filename: 'Priya_Sharma.txt',
    text: `Priya Sharma
priya.sharma@outlook.com | +91 87654 32109

CAREER OBJECTIVE
Aspiring Data Scientist with strong skills in Python, TensorFlow and machine learning. Looking for opportunities to apply deep learning techniques.

INTERNSHIP
Data Science Intern at Analytics Hub (6 months)
- Built ML models using sklearn and TensorFlow
- Data preprocessing with Pandas and NumPy

EDUCATION
M.Tech Data Science - IIT Madras (2023)

SKILLS
Python, TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn, Jupyter, SQL, Matplotlib, Machine Learning, Deep Learning`
  },
  {
    filename: 'Rahul_Nair.txt',
    text: `Rahul Nair
rahul.nair@yahoo.com | +91 76543 21098

PROFILE
DevOps Engineer with 5 years of experience in cloud infrastructure, CI/CD pipelines, and container orchestration.

WORK EXPERIENCE
DevOps Engineer at CloudBase Solutions (2019-2024)
- Managed AWS infrastructure with Terraform
- Set up Kubernetes clusters and Docker containers
- Built Jenkins CI/CD pipelines

EDUCATION
B.E. Information Technology - VIT University (2018)

SKILLS
AWS, Azure, Docker, Kubernetes, Terraform, Jenkins, Ansible, Linux, Bash, CI/CD, Git, Monitoring`
  },
  {
    filename: 'Deepika_Menon.txt',
    text: `Deepika Menon
deepika.menon@gmail.com | +91 65432 10987

OBJECTIVE
Creative UX Designer with 2 years experience creating user-centered designs, wireframes and prototypes.

EXPERIENCE
UI/UX Designer at DesignStudio (2022-2024)
- Designed interfaces using Figma and Adobe XD
- Conducted user research and usability testing
- Created wireframes and interactive prototypes

EDUCATION
B.Des Visual Communication - NID (2021)

SKILLS
Figma, Adobe XD, Photoshop, Illustrator, Sketch, Wireframing, Prototyping, User Research`
  },
  {
    filename: 'Karthik_Raj_Intern.txt',
    text: `Karthik Raj
karthik.raj@gmail.com | +91 54321 09876

OBJECTIVE
Final year B.Tech student seeking internship as Android Developer.

INTERNSHIP
Android Development Intern at MobileApps Inc (3 months)
- Developed Android apps using Kotlin and Java
- Integrated REST APIs using Retrofit
- Published 2 apps on Google Play Store

ACADEMIC PROJECT
College attendance system app using Android Studio

EDUCATION
B.Tech Computer Science - Coimbatore Institute of Technology (2024 - Ongoing)

SKILLS
Android, Kotlin, Java, Android Studio, XML, REST API, Git, Firebase`
  },
  {
    filename: 'Sneha_Iyer.txt',
    text: `Sneha Iyer
sneha.iyer@gmail.com | +91 43210 98765

CAREER SUMMARY
Machine Learning Engineer with 6 years of industry experience specializing in NLP and computer vision applications.

WORK EXPERIENCE
Senior ML Engineer at AI Solutions Ltd (2018-2024)
- Built production NLP pipelines using BERT, GPT
- Implemented computer vision models using OpenCV, TensorFlow
- Deployed models on AWS SageMaker

EDUCATION
M.Tech AI - IISc Bangalore (2018)

SKILLS
Python, TensorFlow, PyTorch, Keras, OpenCV, NLP, Machine Learning, Deep Learning, AWS, Docker, Pandas, NumPy, scikit-learn`
  },
  {
    filename: 'Vikram_Singh.txt',
    text: `Vikram Singh
vikram.singh@gmail.com | +91 32109 87654

OBJECTIVE
Backend Developer with 4 years experience building high-performance APIs and microservices.

EXPERIENCE
Backend Engineer at Fintech Corp (2020-2024)
- Built microservices with Spring Boot and Python FastAPI
- Managed PostgreSQL and Redis databases
- Docker and Kubernetes deployment

EDUCATION
B.Tech Software Engineering - BITS Pilani (2019)

SKILLS
Java, Spring Boot, Python, FastAPI, PostgreSQL, MySQL, Redis, Docker, Kubernetes, Microservices, REST API, Git`
  },
  {
    filename: 'Ananya_Reddy.txt',
    text: `Ananya Reddy
ananya.reddy@gmail.com | +91 21098 76543

PROFILE
QA Engineer with 3 years experience in manual and automation testing.

WORK EXPERIENCE
QA Analyst at SoftTest India (2021-2024)
- Wrote and executed test cases using Selenium and Cypress
- API testing with Postman
- Agile/Scrum methodology

EDUCATION
B.E. Computer Science - Osmania University (2020)

SKILLS
Selenium, Cypress, Jest, Postman, JIRA, Agile, Scrum, REST API, SQL, Python, Git`
  },
];

export function generateDemoResumes() {
  return DEMO_TEXTS.map(({ filename, text }) => {
    const parsed = parseResumeData(text, filename);
    return {
      id: 'demo_' + filename.replace(/[^a-zA-Z0-9]/g, '_'),
      fileName: filename,
      fileSize: text.length,
      fileType: 'text/plain',
      uploadedAt: new Date().toISOString(),
      source: 'demo',
      status: 'parsed',
      ...parsed,
    };
  });
}
