export const courseCatalog = [
  {
    id: 'data-structures', code: 'MCA 204', title: 'Data Structures & Algorithms',
    shortDescription: 'Build a strong foundation in algorithm design and the data structures behind efficient software.',
    description: 'Explore how data is organized, stored, and processed. This course develops practical problem-solving skills through core structures, algorithm analysis, and implementation exercises.',
    instructor: 'Dr. Meera Kapoor', category: 'Computer Science', semester: 'Semester 1', lessonCount: 6,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85',
    progress: 72, tone: 'blue', isEnrolled: true,
    overview: 'A practical introduction to the structures and techniques used to solve computing problems. Learners will analyze trade-offs, implement common structures, and reason about runtime complexity.',
    modules: [
      { id: 'foundations', title: 'Algorithm Foundations', lessons: [
        { id: 'complexity', title: 'Understanding Complexity', duration: '18 min', completed: true, content: 'Algorithm analysis helps us compare solutions by how their resource requirements grow as an input grows. Big O notation describes an upper bound on that growth and gives us a useful language for discussing performance.', materials: [{ name: 'Complexity notation guide.pdf', size: '420 KB' }] },
        { id: 'analysis', title: 'Time and Space Analysis', duration: '22 min', completed: true, content: 'Time complexity estimates the number of operations an algorithm performs. Space complexity considers the additional memory required. Both help determine whether a solution will scale for a given workload.', materials: [{ name: 'Analysis practice notes.pdf', size: '385 KB' }] },
      ] },
      { id: 'linear-structures', title: 'Linear Data Structures', lessons: [
        { id: 'arrays-lists', title: 'Arrays and Linked Lists', duration: '26 min', completed: true, content: 'Arrays provide constant-time indexed access when the position is known. Linked lists organize values as nodes connected by references, making insertions and removals at known positions flexible.', materials: [{ name: 'Arrays and lists worksheet.pdf', size: '510 KB' }] },
        { id: 'stacks-queues', title: 'Stacks and Queues', duration: '20 min', completed: false, content: 'Stacks follow last-in, first-out order, while queues follow first-in, first-out order. These simple interfaces support expression evaluation, breadth-first search, scheduling, and many other patterns.', materials: [{ name: 'Stack and queue examples.pdf', size: '460 KB' }] },
      ] },
      { id: 'trees-graphs', title: 'Trees and Graphs', lessons: [
        { id: 'binary-trees', title: 'Binary Search Trees', duration: '28 min', completed: false, content: 'A binary search tree keeps smaller keys in the left subtree and larger keys in the right subtree. This ordering supports search, insertion, and deletion while the tree remains reasonably balanced.', materials: [{ name: 'Binary tree reference.pdf', size: '620 KB' }] },
        { id: 'graph-traversal', title: 'Graph Traversal', duration: '24 min', completed: false, content: 'Depth-first and breadth-first traversal visit graph vertices systematically. The choice of traversal influences discovery order and is useful in connectivity checks, shortest paths, and dependency exploration.', materials: [{ name: 'Graph traversal summary.pdf', size: '490 KB' }] },
      ] },
    ],
  },
  {
    id: 'database-systems', code: 'MCA 210', title: 'Database Management Systems',
    shortDescription: 'Design reliable relational databases and write clear, effective SQL queries.',
    description: 'Learn relational modeling, SQL, normalization, transaction concepts, and practical database design for modern applications.',
    instructor: 'Prof. Arjun Rao', category: 'Data & Analytics', semester: 'Semester 1', lessonCount: 5,
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1000&q=85',
    progress: 54, tone: 'violet', isEnrolled: true,
    overview: 'Move from conceptual data models to working relational databases. Practice translating requirements into normalized schemas and use SQL to retrieve and transform data.',
    modules: [
      { id: 'relational-model', title: 'Relational Foundations', lessons: [
        { id: 'relational-tables', title: 'The Relational Model', duration: '19 min', completed: true, content: 'The relational model represents information as relations made up of tuples and attributes. Keys, constraints, and relationships preserve meaning and help prevent inconsistent data.', materials: [{ name: 'Relational model notes.pdf', size: '360 KB' }] },
        { id: 'entity-design', title: 'Entity Relationship Design', duration: '24 min', completed: true, content: 'Entity relationship diagrams capture the entities, attributes, and associations in a domain before implementation. Cardinality and participation constraints clarify how records relate.', materials: [{ name: 'ER modeling exercises.pdf', size: '540 KB' }] },
      ] },
      { id: 'sql', title: 'SQL Essentials', lessons: [
        { id: 'querying', title: 'Queries and Joins', duration: '31 min', completed: false, content: 'SQL queries select and combine rows from one or more tables. Joins express relationships between datasets; filtering and projection keep results focused on the question at hand.', materials: [{ name: 'SQL query workbook.pdf', size: '680 KB' }] },
        { id: 'aggregation', title: 'Aggregation and Grouping', duration: '23 min', completed: false, content: 'Aggregate functions summarize rows into useful measures. Grouping produces one result per category, while having filters those groups after aggregation.', materials: [{ name: 'Aggregation examples.pdf', size: '410 KB' }] },
      ] },
      { id: 'quality', title: 'Data Quality', lessons: [
        { id: 'normalization', title: 'Normalization', duration: '27 min', completed: false, content: 'Normalization organizes attributes to reduce undesirable dependencies and update anomalies. Functional dependencies provide the reasoning used to derive normal forms.', materials: [{ name: 'Normalization quick reference.pdf', size: '475 KB' }] },
      ] },
    ],
  },
  {
    id: 'web-development', code: 'MCA 218', title: 'Web Application Development',
    shortDescription: 'Create responsive interfaces and understand the foundations of modern web applications.',
    description: 'Build accessible user interfaces with HTML, CSS, and JavaScript, then explore the architecture behind client-side web applications.',
    instructor: 'Dr. Nisha Verma', category: 'Software Development', semester: 'Semester 2', lessonCount: 5,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85',
    progress: 38, tone: 'green', isEnrolled: true,
    overview: 'Develop the skills to plan, build, and refine browser-based applications. The course emphasizes semantic markup, responsive styling, reusable interface patterns, and accessible interaction.',
    modules: [
      { id: 'web-foundations', title: 'Web Foundations', lessons: [
        { id: 'html-structure', title: 'Semantic HTML', duration: '20 min', completed: true, content: 'Semantic HTML describes the meaning and structure of content. Meaningful elements improve accessibility, document navigation, and the maintainability of a page.', materials: [{ name: 'HTML element reference.pdf', size: '390 KB' }] },
        { id: 'css-layout', title: 'CSS Layout Systems', duration: '28 min', completed: false, content: 'Modern CSS layout tools such as flexbox and grid help create resilient interfaces. Choose layout rules based on the relationships between content rather than on fixed screen coordinates.', materials: [{ name: 'Responsive layout guide.pdf', size: '570 KB' }] },
      ] },
      { id: 'interaction', title: 'Interactive Interfaces', lessons: [
        { id: 'javascript-basics', title: 'JavaScript in the Browser', duration: '32 min', completed: false, content: 'JavaScript responds to browser events and updates interface state. Separating data, rendering, and event handling helps interactive pages stay understandable as they grow.', materials: [{ name: 'JavaScript practice sheet.pdf', size: '620 KB' }] },
        { id: 'forms', title: 'Forms and Validation', duration: '21 min', completed: false, content: 'Well-designed forms provide clear labels, appropriate input types, and useful validation feedback. Accessible forms help every user understand what information is needed.', materials: [{ name: 'Form design checklist.pdf', size: '355 KB' }] },
      ] },
      { id: 'delivery', title: 'Application Delivery', lessons: [
        { id: 'accessibility', title: 'Accessible UI Review', duration: '25 min', completed: false, content: 'Accessibility review checks keyboard access, semantic structure, contrast, and assistive technology support. Small implementation choices can remove significant barriers.', materials: [{ name: 'Accessibility review list.pdf', size: '440 KB' }] },
      ] },
    ],
  },
  {
    id: 'artificial-intelligence', code: 'MCA 224', title: 'Foundations of Artificial Intelligence',
    shortDescription: 'Explore search, reasoning, and introductory machine learning concepts.',
    description: 'An introduction to intelligent systems, state-space search, knowledge representation, and the ideas behind machine learning.',
    instructor: 'Dr. Kavita Iyer', category: 'Computer Science', semester: 'Semester 2', lessonCount: 3,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=85',
    progress: 0, tone: 'blue', isEnrolled: false,
    overview: 'Build a conceptual foundation for artificial intelligence. Study how agents search, represent knowledge, and learn from examples, with a focus on clear problem formulation.',
    modules: [
      { id: 'agents', title: 'Intelligent Agents', lessons: [
        { id: 'agent-models', title: 'Agent Models', duration: '18 min', completed: false, content: 'An intelligent agent perceives an environment and chooses actions to achieve goals. The task environment helps define what success means and what information is available.', materials: [{ name: 'Agent model notes.pdf', size: '370 KB' }] },
        { id: 'search', title: 'Search Strategies', duration: '29 min', completed: false, content: 'Search algorithms explore a space of candidate states. Their properties such as completeness, optimality, time, and memory help determine which strategy fits a problem.', materials: [{ name: 'Search strategy worksheet.pdf', size: '520 KB' }] },
      ] },
      { id: 'learning', title: 'Learning Basics', lessons: [
        { id: 'supervised-learning', title: 'Supervised Learning', duration: '26 min', completed: false, content: 'Supervised learning uses labeled examples to build a model that predicts outputs for new inputs. Data quality, evaluation design, and generalization all matter.', materials: [{ name: 'Learning basics.pdf', size: '460 KB' }] },
      ] },
    ],
  },
  {
    id: 'cloud-computing', code: 'MCA 230', title: 'Cloud Computing Essentials',
    shortDescription: 'Understand cloud service models, deployment patterns, and scalable systems.',
    description: 'Study cloud architecture fundamentals, service models, deployment options, and the reliability principles used in distributed applications.',
    instructor: 'Prof. Rohan Desai', category: 'Infrastructure', semester: 'Semester 2', lessonCount: 4,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=85',
    progress: 0, tone: 'green', isEnrolled: false,
    overview: 'Learn how cloud platforms deliver compute, storage, and managed services. Evaluate deployment models and design for elasticity, observability, and failure recovery.',
    modules: [
      { id: 'cloud-models', title: 'Cloud Service Models', lessons: [
        { id: 'service-models', title: 'IaaS, PaaS, and SaaS', duration: '22 min', completed: false, content: 'Cloud service models describe how responsibilities are divided between a provider and a customer. Understanding the boundary helps teams choose an appropriate level of control.', materials: [{ name: 'Cloud service models.pdf', size: '400 KB' }] },
        { id: 'deployment-models', title: 'Deployment Models', duration: '20 min', completed: false, content: 'Public, private, and hybrid deployments offer different trade-offs in control, scale, and integration. Workload requirements guide a sensible choice.', materials: [{ name: 'Deployment models notes.pdf', size: '375 KB' }] },
      ] },
      { id: 'reliability', title: 'Reliable Cloud Systems', lessons: [
        { id: 'scaling', title: 'Scaling and Resilience', duration: '27 min', completed: false, content: 'Resilient systems expect components to fail and provide ways to detect, isolate, and recover from problems. Scaling decisions should account for both load and operational complexity.', materials: [{ name: 'Resilience design guide.pdf', size: '535 KB' }] },
        { id: 'monitoring', title: 'Monitoring Fundamentals', duration: '19 min', completed: false, content: 'Metrics, logs, and traces answer different operational questions. Together they help teams understand service health and investigate unexpected behavior.', materials: [{ name: 'Monitoring reference.pdf', size: '430 KB' }] },
      ] },
    ],
  },
];

export const assignments = [
  { id: 'bst-implementation', title: 'Binary Search Tree Implementation', courseId: 'data-structures', course: 'Data Structures & Algorithms', dueDate: '2026-09-27T23:59:00', status: 'Pending', totalMarks: 20, description: 'Implement insertion, search, and deletion for a binary search tree. Include a short explanation of the average and worst-case time complexity for each operation.', submittedAt: '', marks: null, feedback: '' },
  { id: 'sql-optimization', title: 'SQL Query Optimization', courseId: 'database-systems', course: 'Database Management Systems', dueDate: '2026-09-28T17:00:00', status: 'Submitted', totalMarks: 25, description: 'Review the provided reporting queries. Identify avoidable scans, propose suitable indexes, and explain how you would verify the effect of each change.', submittedAt: '2026-09-25T14:20:00', marks: null, feedback: '' },
  { id: 'responsive-ui', title: 'Responsive UI Design', courseId: 'web-development', course: 'Web Application Development', dueDate: '2026-10-02T23:59:00', status: 'Graded', totalMarks: 30, description: 'Create a responsive course overview screen that adapts to mobile, tablet, and desktop widths. Include semantic structure and a short accessibility checklist.', submittedAt: '2026-09-20T16:05:00', marks: 27, feedback: 'Thoughtful layout choices and strong keyboard support. Review the smallest mobile breakpoint to improve spacing consistency.' },
  { id: 'normalization-exercise', title: 'Normalization Case Study', courseId: 'database-systems', course: 'Database Management Systems', dueDate: '2026-10-08T17:00:00', status: 'Pending', totalMarks: 20, description: 'Normalize the registration dataset through third normal form. Show each transformation and state the dependencies used in your reasoning.', submittedAt: '', marks: null, feedback: '' },
];

export const quizzes = [
  { id: 'algorithm-complexity', title: 'Algorithm Complexity', courseId: 'data-structures', course: 'Data Structures & Algorithms', questionCount: 5, totalMarks: 25, status: 'Attempted', previousScore: 23, attemptedAt: '2026-09-24', durationMinutes: 20 },
  { id: 'relational-model', title: 'Relational Model', courseId: 'database-systems', course: 'Database Management Systems', questionCount: 5, totalMarks: 20, status: 'Attempted', previousScore: 17, attemptedAt: '2026-09-21', durationMinutes: 15 },
  { id: 'web-fundamentals', title: 'Web Fundamentals', courseId: 'web-development', course: 'Web Application Development', questionCount: 5, totalMarks: 25, status: 'Available', previousScore: null, attemptedAt: '', durationMinutes: 20 },
  { id: 'ai-search', title: 'Search Strategies', courseId: 'artificial-intelligence', course: 'Foundations of Artificial Intelligence', questionCount: 5, totalMarks: 25, status: 'Available', previousScore: null, attemptedAt: '', durationMinutes: 20 },
];

export const quizQuestions = {
  'algorithm-complexity': [
    { id: 'q1', text: 'Which notation describes an asymptotic upper bound on an algorithm’s growth?', options: ['Big O', 'Big Omega', 'Big Theta', 'Little omega'] },
    { id: 'q2', text: 'What is the average lookup time in a well-balanced binary search tree?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'] },
    { id: 'q3', text: 'Which data structure follows last-in, first-out order?', options: ['Queue', 'Stack', 'Graph', 'Heap'] },
    { id: 'q4', text: 'What is the time complexity of binary search on a sorted array?', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'] },
    { id: 'q5', text: 'Which traversal explores a graph level by level?', options: ['Depth-first search', 'Breadth-first search', 'In-order traversal', 'Backtracking'] },
  ],
  'relational-model': [
    { id: 'q1', text: 'What uniquely identifies a row in a relational table?', options: ['Primary key', 'Foreign key', 'View', 'Index'] },
    { id: 'q2', text: 'Which SQL clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'ORDER BY', 'FROM'] },
    { id: 'q3', text: 'What does a foreign key represent?', options: ['A reference to a key in another relation', 'A duplicate primary key', 'A calculated column', 'A database view'] },
    { id: 'q4', text: 'Which normal form removes partial dependency on a composite key?', options: ['First normal form', 'Second normal form', 'Third normal form', 'Boyce-Codd normal form'] },
    { id: 'q5', text: 'Which join returns matching rows from both tables?', options: ['INNER JOIN', 'CROSS JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'] },
  ],
  'web-fundamentals': [
    { id: 'q1', text: 'Which element represents the primary content of a page?', options: ['<main>', '<aside>', '<footer>', '<title>'] },
    { id: 'q2', text: 'Which CSS layout tool is designed for two-dimensional arrangements?', options: ['CSS Grid', 'Float', 'Inline flow', 'Text alignment'] },
    { id: 'q3', text: 'What is the purpose of an associated form label?', options: ['Name and activate its input', 'Submit the form automatically', 'Style the input only', 'Store a default value'] },
    { id: 'q4', text: 'Which attribute provides alternative text for an informative image?', options: ['alt', 'title', 'name', 'role'] },
    { id: 'q5', text: 'Which event is commonly used to respond to a button activation?', options: ['click', 'resize', 'scroll', 'load'] },
  ],
  'ai-search': [
    { id: 'q1', text: 'What does a search state represent?', options: ['A possible configuration of a problem', 'A final program output', 'A training label', 'A database record'] },
    { id: 'q2', text: 'Which strategy explores the shallowest unvisited nodes first?', options: ['Breadth-first search', 'Depth-first search', 'Hill climbing', 'Random restart'] },
    { id: 'q3', text: 'What does a heuristic estimate?', options: ['Cost or distance toward a goal', 'The number of source files', 'A database key', 'The exact runtime'] },
    { id: 'q4', text: 'What is an agent’s percept?', options: ['An observation from its environment', 'A selected action', 'A reward function', 'A search frontier'] },
    { id: 'q5', text: 'What is the purpose of a goal test?', options: ['Check whether a state satisfies the objective', 'Estimate memory use', 'Generate training examples', 'Order database rows'] },
  ],
};

export const quizResults = [
  { id: 'algorithm-complexity', title: 'Algorithm Complexity', course: 'Data Structures & Algorithms', score: 23, totalMarks: 25, percentage: 92, attemptedAt: 'Sep 24, 2026', status: 'Passed' },
  { id: 'relational-model', title: 'Relational Model', course: 'Database Management Systems', score: 17, totalMarks: 20, percentage: 85, attemptedAt: 'Sep 21, 2026', status: 'Passed' },
  { id: 'javascript-fundamentals', title: 'JavaScript Fundamentals', course: 'Web Application Development', score: 20, totalMarks: 25, percentage: 80, attemptedAt: 'Sep 18, 2026', status: 'Passed' },
];

export const assignmentResults = assignments.filter((assignment) => assignment.status === 'Graded');

export const studentProfile = {
  name: 'Alex Morgan', email: 'alex.morgan@college.edu', phone: '+1 (555) 014-7284', role: 'Student',
  studentId: 'MCA-2025-0418', program: 'Master of Computer Applications', academicSession: '2025–2026',
};

export const studentDashboardData = {
  name: studentProfile.name,
  academicSession: `${studentProfile.academicSession} Academic Session`,
  stats: [
    { label: 'Enrolled courses', value: String(courseCatalog.filter((course) => course.isEnrolled).length).padStart(2, '0'), note: 'Across 2 semesters', icon: 'courses', tone: 'blue' },
    { label: 'In progress', value: String(courseCatalog.filter((course) => course.isEnrolled && course.progress < 100).length).padStart(2, '0'), note: 'Keep up the momentum', icon: 'progress', tone: 'violet' },
    { label: 'Pending assignments', value: String(assignments.filter((assignment) => assignment.status === 'Pending').length).padStart(2, '0'), note: 'Due soon', icon: 'assignments', tone: 'amber' },
    { label: 'Quiz average', value: `${Math.round(quizResults.reduce((sum, quiz) => sum + quiz.percentage, 0) / quizResults.length)}%`, note: 'Across completed quizzes', icon: 'results', tone: 'green' },
  ],
  courses: courseCatalog.filter((course) => course.isEnrolled).slice(0, 3).map((course) => ({
    id: course.id, code: course.code, title: course.title, instructor: course.instructor, progress: course.progress,
    lessons: `${Math.round(course.lessonCount * course.progress / 100)} of ${course.lessonCount} lessons`,
    color: course.tone === 'violet' ? 'bg-violet-500' : course.tone === 'green' ? 'bg-emerald-500' : 'bg-blue-600',
    icon: course.id === 'data-structures' ? 'brackets' : course.id === 'database-systems' ? 'database' : 'web',
  })),
  assignments: assignments.slice(0, 3).map((assignment) => ({
    course: assignment.course, title: assignment.title,
    due: new Date(assignment.dueDate).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    status: assignment.status, tone: assignment.status === 'Pending' ? 'amber' : assignment.status === 'Graded' ? 'green' : 'blue',
  })),
  quizzes: quizResults.map((quiz) => ({ title: quiz.title, course: quiz.course, score: quiz.percentage, date: quiz.attemptedAt })),
};