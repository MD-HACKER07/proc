import { readFileSync, writeFileSync } from 'fs';

// Function to create a complete OS quiz JSON with all questions
function createCompleteOsQuizJson() {
  try {
    // Read our structured data for categories and metadata
    const osQuestionsData = JSON.parse(readFileSync('src/data/osQuestions.json', 'utf8'));
    
    // Create a comprehensive list of all questions with manually corrected options
    const completeQuestions = [
      // Process Management
      {
        question: "Which of the following best describes a process in an operating system?",
        options: ["Program in execution", "Stored program", "Instruction", "Procedure"],
        correct: "Program in execution",
        category: "Process Management"
      },
      {
        question: "What is the main objective of scheduling algorithms in OS?",
        options: ["Maximize CPU utilization", "Minimize memory usage", "Increase system calls", "Reduce network latency"],
        correct: "Maximize CPU utilization",
        category: "CPU Scheduling"
      },
      {
        question: "Which scheduling policy selects the process that arrives first?",
        options: ["Shortest Job First", "First-Come First-Served", "Priority Scheduling", "Round Robin"],
        correct: "First-Come First-Served",
        category: "CPU Scheduling"
      },
      {
        question: "What does SJF stand for in process scheduling?",
        options: ["Simple Job Finish", "Shortest Job First", "Shortest Jump First", "Simple Job First"],
        correct: "Shortest Job First",
        category: "CPU Scheduling"
      },
      {
        question: "In STCF, a process with ____ is scheduled next.",
        options: ["Longest remaining time", "Shortest remaining time", "Highest priority", "Lowest priority"],
        correct: "Shortest remaining time",
        category: "CPU Scheduling"
      },
      {
        question: "Which scheduling algorithm assigns time slices to each process?",
        options: ["Priority Scheduling", "Round Robin", "MLFQ", "First-Come First-Served"],
        correct: "Round Robin",
        category: "CPU Scheduling"
      },
      {
        question: "Which of these is not a process scheduling metric?",
        options: ["Turnaround Time", "Waiting Time", "Response Time", "Execution Instruction"],
        correct: "Execution Instruction",
        category: "CPU Scheduling"
      },
      {
        question: "Turnaround time is calculated as:",
        options: ["Finish Time - Arrival Time", "Arrival Time - Start Time", "Start Time - Finish Time", "Finish Time - Execution Time"],
        correct: "Finish Time - Arrival Time",
        category: "CPU Scheduling"
      },
      {
        question: "Which scheduling method favors shorter jobs?",
        options: ["FIFO", "SJF", "Priority Scheduling", "Round Robin"],
        correct: "SJF",
        category: "CPU Scheduling"
      },
      {
        question: "In Priority Scheduling, the CPU is assigned to the process with:",
        options: ["Lowest ID", "Highest priority", "Lowest priority", "Longest execution time"],
        correct: "Highest priority",
        category: "CPU Scheduling"
      },
      {
        question: "Round Robin scheduling is most suitable for:",
        options: ["Batch systems", "Real-time systems", "Time-sharing systems", "Multiprocessing systems"],
        correct: "Time-sharing systems",
        category: "CPU Scheduling"
      },
      // Deadlock
      {
        question: "Which one is not a necessary condition for deadlock?",
        options: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Interruptible execution"],
        correct: "Interruptible execution",
        category: "Deadlock"
      },
      {
        question: "Which of the following can lead to a deadlock?",
        options: ["Mutual exclusion", "Preemption", "Spooling", "Thread yielding"],
        correct: "Mutual exclusion",
        category: "Deadlock"
      },
      {
        question: "Deadlock prevention can be achieved by eliminating:",
        options: ["Hold and Wait condition", "All threads", "Semaphores", "Memory paging"],
        correct: "Hold and Wait condition",
        category: "Deadlock"
      },
      {
        question: "Deadlock avoidance is implemented using which method?",
        options: ["Resource Allocation Graph", "Banker's Algorithm", "Spinlocks", "Mutex"],
        correct: "Banker's Algorithm",
        category: "Deadlock"
      },
      {
        question: "Which algorithm is used for deadlock avoidance?",
        options: ["Banker's Algorithm", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Floyd's Algorithm"],
        correct: "Banker's Algorithm",
        category: "Deadlock"
      },
      {
        question: "What happens in a circular wait deadlock?",
        options: ["Each process waits for a resource held by next process", "A resource is not released", "A process locks two resources", "Resources are infinitely produced"],
        correct: "Each process waits for a resource held by next process",
        category: "Deadlock"
      },
      {
        question: "What is a safe state in deadlock avoidance?",
        options: ["A state where deadlock is impossible", "A state where deadlock has occurred", "A state where processes are terminated", "A state with all resources free"],
        correct: "A state where deadlock is impossible",
        category: "Deadlock"
      },
      // More CPU Scheduling
      {
        question: "Which of the following is a non-preemptive scheduling algorithm?",
        options: ["Round Robin", "Priority Scheduling", "First-Come First-Served", "MLFQ"],
        correct: "First-Come First-Served",
        category: "CPU Scheduling"
      },
      {
        question: "Which scheduling metric measures the time a process spends waiting in the ready queue?",
        options: ["Turnaround Time", "Waiting Time", "Response Time", "Execution Time"],
        correct: "Waiting Time",
        category: "CPU Scheduling"
      },
      {
        question: "Which scheduling policy allows a running process to be interrupted?",
        options: ["Non-preemptive", "Preemptive", "Sequential", "Serial"],
        correct: "Preemptive",
        category: "CPU Scheduling"
      },
      {
        question: "In Priority Scheduling, which process gets scheduled first if two processes have the same priority?",
        options: ["First entered", "Last entered", "Shortest job", "Longest job"],
        correct: "First entered",
        category: "CPU Scheduling"
      },
      {
        question: "In MLFQ, a process using more CPU is moved to:",
        options: ["Lower priority queue", "Higher priority queue", "Suspended state", "Blocked state"],
        correct: "Lower priority queue",
        category: "CPU Scheduling"
      },
      {
        question: "Which of the following is an example of starvation?",
        options: ["A low-priority process waiting indefinitely", "A deadlock situation", "A preemptive switch", "A blocked thread"],
        correct: "A low-priority process waiting indefinitely",
        category: "CPU Scheduling"
      },
      {
        question: "What defines Response Time in a process?",
        options: ["First Response - Arrival Time", "First Response - Completion Time", "First CPU Allocation - Arrival Time", "Execution Time"],
        correct: "First Response - Arrival Time",
        category: "CPU Scheduling"
      },
      {
        question: "A job arrives at time 2 ms and completes at 12 ms. What is the turnaround time?",
        options: ["10 ms", "12 ms", "8 ms", "6 ms"],
        correct: "10 ms",
        category: "CPU Scheduling"
      },
      {
        question: "Process P1 needs 4 ms CPU time, P2 needs 3 ms CPU time, both arrive at same time. FCFS average waiting time?",
        options: ["1.5 ms", "2 ms", "3 ms", "3.5 ms"],
        correct: "2 ms",
        category: "CPU Scheduling"
      },
      {
        question: "In SJF, processes have burst times 5ms, 3ms, 8ms. Average turnaround time is closest to:",
        options: ["9 ms", "10 ms", "11 ms", "12 ms"],
        correct: "10 ms",
        category: "CPU Scheduling"
      },
      {
        question: "Given 3 processes with arrival times (0ms, 2ms, 4ms) and burst times (5ms each), average waiting time with FCFS?",
        options: ["5 ms", "4 ms", "6 ms", "7 ms"],
        correct: "4 ms",
        category: "CPU Scheduling"
      },
      {
        question: "In RR with quantum 4 ms, P1 burst=10ms. How many times is P1 scheduled before completion?",
        options: ["2", "3", "4", "5"],
        correct: "3",
        category: "CPU Scheduling"
      },
      {
        question: "In Priority Scheduling, if P1(priority=2) and P2(priority=1), which executes first?",
        options: ["P1", "P2", "Random", "Depends on Arrival"],
        correct: "P2",
        category: "CPU Scheduling"
      },
      {
        question: "Deadlock can occur if system has ___ resources and ___ processes.",
        options: ["More, Less", "Equal, Equal", "Less, More", "None"],
        correct: "Less, More",
        category: "Deadlock"
      },
      {
        question: "Process P1 arrives at 0ms needs 7ms CPU, P2 arrives at 2ms needs 4ms CPU. In FCFS, what is average turnaround time?",
        options: ["10ms", "13ms", "12ms", "11.5ms"],
        correct: "11.5ms",
        category: "CPU Scheduling"
      },
      {
        question: "If Turnaround Time = 20ms, Waiting Time = 12ms, what is CPU burst time?",
        options: ["8ms", "10ms", "12ms", "14ms"],
        correct: "8ms",
        category: "CPU Scheduling"
      },
      // Memory Management
      {
        question: "What is the main function of the main memory?",
        options: ["Store data permanently", "Temporary storage of data and instructions", "Perform calculations", "Manage I/O devices"],
        correct: "Temporary storage of data and instructions",
        category: "Memory Management"
      },
      {
        question: "Which memory allocation technique suffers from external fragmentation?",
        options: ["Paging", "Segmentation", "Contiguous Memory Allocation", "Virtual Memory"],
        correct: "Contiguous Memory Allocation",
        category: "Memory Management"
      },
      {
        question: "Which dynamic memory allocation algorithm searches the entire list for the smallest free suitable partition?",
        options: ["First Fit", "Best Fit", "Worst Fit", "Next Fit"],
        correct: "Best Fit",
        category: "Memory Management"
      },
      {
        question: "In contiguous memory allocation, which method allocates memory blocks first that fit the process size?",
        options: ["First Fit", "Best Fit", "Worst Fit", "Next Fit"],
        correct: "First Fit",
        category: "Memory Management"
      },
      // Paging
      {
        question: "Paging helps in solving which of the following problems?",
        options: ["External Fragmentation", "Internal Fragmentation", "Both", "None"],
        correct: "External Fragmentation",
        category: "Paging & Virtual Memory"
      },
      {
        question: "The mapping from logical to physical address is done by:",
        options: ["CPU", "Operating System", "Memory Management Unit", "Compiler"],
        correct: "Memory Management Unit",
        category: "Paging & Virtual Memory"
      },
      {
        question: "Which algorithm replaces the page that has not been used for the longest period of time?",
        options: ["FIFO", "LRU", "Optimal", "NONE"],
        correct: "LRU",
        category: "Paging & Virtual Memory"
      },
      {
        question: "In FIFO page replacement, which page is removed?",
        options: ["Oldest loaded page", "Least used page", "Random page", "Smallest page"],
        correct: "Oldest loaded page",
        category: "Paging & Virtual Memory"
      },
      {
        question: "A system has 4 frames. A page reference string 1,2,3,4,1,2,5. How many page faults with FIFO?",
        options: ["4", "5", "6", "7"],
        correct: "6",
        category: "Paging & Virtual Memory"
      },
      {
        question: "If a system uses LRU replacement, the least recently accessed page is:",
        options: ["Replaced", "Locked", "Moved", "Pinned"],
        correct: "Replaced",
        category: "Paging & Virtual Memory"
      },
      {
        question: "Which of the following is a fixed partition allocation scheme?",
        options: ["Paging", "Segmentation", "Contiguous Allocation", "Virtual Memory"],
        correct: "Contiguous Allocation",
        category: "Memory Management"
      },
      {
        question: "The main advantage of dynamic partitioning over fixed partitioning is:",
        options: ["Less complexity", "Less fragmentation", "Better utilization", "Less memory requirement"],
        correct: "Better utilization",
        category: "Memory Management"
      },
      {
        question: "External fragmentation occurs in:",
        options: ["Paging", "Contiguous Memory Allocation", "Virtual Memory", "Pure Demand Paging"],
        correct: "Contiguous Memory Allocation",
        category: "Memory Management"
      },
      {
        question: "In FIFO page replacement, increasing number of frames sometimes increases page faults. This is called:",
        options: ["Thrashing", "Belady's Anomaly", "Overhead", "Fragmentation"],
        correct: "Belady's Anomaly",
        category: "Paging & Virtual Memory"
      },
      {
        question: "Which memory management scheme requires relocation of processes during execution?",
        options: ["Segmentation", "Swapping", "Paging", "Contiguous Allocation"],
        correct: "Swapping",
        category: "Memory Management"
      },
      {
        question: "Page replacement occurs when:",
        options: ["A process requests a page not in memory", "Page is removed from main memory", "A page is loaded into memory from disk", "Frame is locked"],
        correct: "A process requests a page not in memory",
        category: "Paging & Virtual Memory"
      },
      {
        question: "In contiguous memory allocation, which strategy always allocates the largest available block?",
        options: ["First Fit", "Best Fit", "Worst Fit", "Next Fit"],
        correct: "Worst Fit",
        category: "Memory Management"
      },
      {
        question: "In paging, what is the main advantage compared to contiguous memory allocation?",
        options: ["Eliminates internal fragmentation", "Increases execution speed", "Reduces page faults", "Eliminates external fragmentation"],
        correct: "Eliminates external fragmentation",
        category: "Paging & Virtual Memory"
      },
      {
        question: "The basic unit of data exchange between secondary memory and main memory is called:",
        options: ["Segment", "Frame", "Block", "Page"],
        correct: "Page",
        category: "Paging & Virtual Memory"
      },
      // Concurrency
      {
        question: "What is concurrency in operating systems?",
        options: ["Multiple tasks running simultaneously", "Single task execution", "Single-threaded processing", "Sequential processing"],
        correct: "Multiple tasks running simultaneously",
        category: "Concurrency & Synchronization"
      },
      {
        question: "Which of the following helps manage concurrency?",
        options: ["Deadlock", "Lock", "Cache", "Virtual memory"],
        correct: "Lock",
        category: "Concurrency & Synchronization"
      },
      {
        question: "A lock is used to:",
        options: ["Prevent unauthorized access", "Ensure exclusive access to a shared resource", "Increase CPU speed", "Manage disk scheduling"],
        correct: "Ensure exclusive access to a shared resource",
        category: "Concurrency & Synchronization"
      },
      {
        question: "What is a critical section?",
        options: ["A section of code accessing shared resources", "A program header", "A memory location", "A CPU register"],
        correct: "A section of code accessing shared resources",
        category: "Concurrency & Synchronization"
      },
      {
        question: "Which of the following is NOT a lock-based synchronization mechanism?",
        options: ["Spinlock", "Mutex", "Semaphore", "Cache"],
        correct: "Cache",
        category: "Concurrency & Synchronization"
      },
      {
        question: "What is a mutex?",
        options: ["A mutual exclusion object", "A memory address", "An interrupt handler", "A paging algorithm"],
        correct: "A mutual exclusion object",
        category: "Concurrency & Synchronization"
      },
      {
        question: "When does a thread spin in a spinlock?",
        options: ["While waiting to acquire the lock", "When releasing the lock", "When scheduling", "While executing critical section"],
        correct: "While waiting to acquire the lock",
        category: "Concurrency & Synchronization"
      },
      {
        question: "Which condition must be satisfied for mutual exclusion?",
        options: ["Only one thread can access the critical section at a time", "Multiple threads access simultaneously", "All threads must sleep", "Threads must terminate"],
        correct: "Only one thread can access the critical section at a time",
        category: "Concurrency & Synchronization"
      },
      {
        question: "Which function is commonly associated with condition variables?",
        options: ["wait()", "execute()", "release()", "fork()"],
        correct: "wait()",
        category: "Concurrency & Synchronization"
      },
      {
        question: "Which two operations are associated with condition variables?",
        options: ["lock and unlock", "wait and signal", "create and destroy", "read and write"],
        correct: "wait and signal",
        category: "Concurrency & Synchronization"
      },
      {
        question: "What is a semaphore?",
        options: ["An encryption algorithm", "A scheduling method", "A type of memory", "A signaling mechanism"],
        correct: "A signaling mechanism",
        category: "Concurrency & Synchronization"
      },
      {
        question: "A binary semaphore can take values:",
        options: ["Any integer", "0 and 1", "0 and 2", "1 and 2"],
        correct: "0 and 1",
        category: "Concurrency & Synchronization"
      },
      // File Systems
      {
        question: "What is a file system interface responsible for?",
        options: ["Managing files and directories", "Memory management", "Network communication", "Managing disk blocks"],
        correct: "Managing files and directories",
        category: "File Systems"
      },
      {
        question: "Which operation creates a new file?",
        options: ["mkdir", "create", "link", "open"],
        correct: "create",
        category: "File Systems"
      },
      {
        question: "Which system call is used to open a file in C?",
        options: ["open()", "close()", "fork()", "unlink()"],
        correct: "open()",
        category: "File Systems"
      },
      {
        question: "Which system call reads data from a file?",
        options: ["read()", "open()", "write()", "fork()"],
        correct: "read()",
        category: "File Systems"
      },
      {
        question: "Which system call writes data to a file?",
        options: ["write()", "read()", "fork()", "dup()"],
        correct: "write()",
        category: "File Systems"
      },
      {
        question: "The fork() system call is used to:",
        options: ["Create new processes", "Duplicate a file descriptor", "Clone a memory segment", "Copy file content"],
        correct: "Create new processes",
        category: "Process Management"
      },
      {
        question: "The dup() system call is used to:",
        options: ["Duplicate a file descriptor", "Create a process", "Copy file content", "Create a new memory block"],
        correct: "Duplicate a file descriptor",
        category: "File Systems"
      },
      {
        question: "Which command deletes a directory?",
        options: ["rmdir", "mkdir", "unlink", "cd"],
        correct: "rmdir",
        category: "File Systems"
      },
      {
        question: "Which system call removes a file in UNIX?",
        options: ["unlink()", "open()", "mkdir()", "link()"],
        correct: "unlink()",
        category: "File Systems"
      },
      {
        question: "What happens to open file descriptors after fork()?",
        options: ["They are duplicated", "They are copied independently", "They are closed", "They are deleted"],
        correct: "They are duplicated",
        category: "Process Management"
      },
      {
        question: "Which operation lists files in a directory?",
        options: ["rmdir", "mkdir", "rm", "ls"],
        correct: "ls",
        category: "File Systems"
      },
      {
        question: "Which data structure stores metadata about a file in UNIX?",
        options: ["data block", "inode", "file content", "buffer"],
        correct: "inode",
        category: "File Systems"
      },
      {
        question: "Which operation must happen before writing to a file?",
        options: ["Opening the file", "Deleting the file", "Forking a process", "Closing another file"],
        correct: "Opening the file",
        category: "File Systems"
      },
      {
        question: "Which of the following is used to organize files?",
        options: ["Superblock", "inode", "Directory", "Scheduler"],
        correct: "Directory",
        category: "File Systems"
      },
      // Disk Management
      {
        question: "Which is NOT a disk scheduling algorithm?",
        options: ["SSTF", "Round Robin", "LOOK", "SCAN"],
        correct: "Round Robin",
        category: "Disk Management"
      },
      {
        question: "Which algorithm services request closest to current head position?",
        options: ["SSTF", "FCFS", "SCAN", "LOOK"],
        correct: "SSTF",
        category: "Disk Management"
      },
      {
        question: "Purpose of disk scheduling is:",
        options: ["Increase memory", "Maximize CPU load", "Reduce seek time", "Save bandwidth"],
        correct: "Reduce seek time",
        category: "Disk Management"
      },
      {
        question: "Which scheduling moves head from one end to another and back?",
        options: ["LOOK", "SSTF", "SCAN", "FCFS"],
        correct: "SCAN",
        category: "Disk Management"
      },
      {
        question: "What does SCAN algorithm do?",
        options: ["Moves disk head in one direction then back", "Jumps to first request", "Moves head randomly", "Only moves clockwise"],
        correct: "Moves disk head in one direction then back",
        category: "Disk Management"
      },
      {
        question: "Why is C-SCAN better than SCAN?",
        options: ["Provides uniform wait time", "Moves faster", "Reduces CPU load", "Skips requests"],
        correct: "Provides uniform wait time",
        category: "Disk Management"
      },
      {
        question: "Which algorithm gives best average seek time?",
        options: ["SSTF", "SCAN", "C-SCAN", "LOOK"],
        correct: "SSTF",
        category: "Disk Management"
      }
    ];
    
    // Create the final structured questions
    const finalQuestions = completeQuestions.map((q, index) => {
      // Try to find the original question for metadata
      const originalQuestion = osQuestionsData.find(origQ => 
        origQ.question.toLowerCase().includes(q.question.toLowerCase().substring(0, 20))
      );
      
      // Determine the subject key based on the category
      let subjectKey = 'os';
      if (q.category === 'Process Management') subjectKey = 'processes';
      else if (q.category === 'CPU Scheduling') subjectKey = 'scheduling';
      else if (q.category === 'Deadlock') subjectKey = 'deadlock';
      else if (q.category === 'Memory Management') subjectKey = 'memory';
      else if (q.category === 'Paging & Virtual Memory') subjectKey = 'paging';
      else if (q.category === 'Concurrency & Synchronization') subjectKey = 'concurrency';
      else if (q.category === 'File Systems') subjectKey = 'filesystem';
      else if (q.category === 'Disk Management') subjectKey = 'disk';
      
      return {
        id: originalQuestion?.id || `os-${subjectKey}-${index + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct,
        type: "single",
        points: 10,
        subject: "os",
        category: q.category,
        explanation: `Explanation for: ${q.question.substring(0, 30)}...`
      };
    });
    
    // Create the final quiz JSON
    const quizData = {
      subject: "Operating Systems",
      description: "Test your knowledge of operating system concepts including processes, memory management, scheduling, and more.",
      lastUpdated: new Date().toISOString(),
      questions: finalQuestions
    };
    
    // Write to final OS quiz JSON file
    writeFileSync('osquiz.json', JSON.stringify(quizData, null, 2));
    
    console.log(`Successfully created final osquiz.json with ${finalQuestions.length} questions`);
    return true;
  } catch (error) {
    console.error('Error creating final OS quiz JSON:', error);
    return false;
  }
}

// Execute the function
createCompleteOsQuizJson(); 