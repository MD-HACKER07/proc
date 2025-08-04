import { QuizResult } from '../types';

export interface SecurityEvent {
  id: string;
  type: 'tab-switch' | 'window-blur' | 'copy-paste' | 'right-click' | 'fullscreen-exit' | 'dev-tools' | 'idle-timeout';
  timestamp: Date;
  quizId: string;
  username: string;
  details: string;
}

export interface QuizSession {
  id: string;
  username: string;
  quizId: string;
  startTime: Date;
  endTime?: Date;
  securityEvents: SecurityEvent[];
  isFlagged: boolean;
  finalScore: number;
  maxScore: number;
  status: 'active' | 'completed' | 'flagged' | 'cancelled';
}

class SecurityService {
  private static instance: SecurityService;
  private activeSessions: Map<string, QuizSession> = new Map();
  private securityEvents: SecurityEvent[] = [];

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  startQuizSession(quizId: string, username: string): QuizSession {
    const sessionId = this.generateSessionId();
    const session: QuizSession = {
      id: sessionId,
      username,
      quizId,
      startTime: new Date(),
      securityEvents: [],
      isFlagged: false,
      finalScore: 0,
      maxScore: 0,
      status: 'active'
    };

    this.activeSessions.set(sessionId, session);
    this.setupSecurityMonitoring(sessionId);
    
    // Store in localStorage
    this.saveSession(session);
    
    return session;
  }

  endQuizSession(sessionId: string, result: QuizResult): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.endTime = new Date();
      session.finalScore = result.percentage;
      session.maxScore = 100;
      
      // Check if session should be flagged
      if (session.securityEvents.length > 0) {
        session.isFlagged = true;
        session.status = 'flagged';
      } else {
        session.status = 'completed';
      }

      this.saveSession(session);
      this.activeSessions.delete(sessionId);
    }
  }

  private setupSecurityMonitoring(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Monitor tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logSecurityEvent(sessionId, 'tab-switch', 'User switched tabs');
      }
    });

    // Monitor window blur
    window.addEventListener('blur', () => {
      this.logSecurityEvent(sessionId, 'window-blur', 'User switched windows');
    });

    // Monitor copy/paste
    document.addEventListener('copy', (e) => {
      this.logSecurityEvent(sessionId, 'copy-paste', 'Copy action detected');
    });

    document.addEventListener('paste', (e) => {
      this.logSecurityEvent(sessionId, 'copy-paste', 'Paste action detected');
    });

    // Monitor right-click
    document.addEventListener('contextmenu', (e) => {
      this.logSecurityEvent(sessionId, 'right-click', 'Right-click detected');
      e.preventDefault(); // Prevent context menu
    });

    // Monitor fullscreen exit
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.logSecurityEvent(sessionId, 'fullscreen-exit', 'Exited fullscreen mode');
      }
    });

    // Monitor idle timeout (every 30 seconds)
    let lastActivity = Date.now();
    const idleInterval = setInterval(() => {
      if (Date.now() - lastActivity > 30000) { // 30 seconds idle
        this.logSecurityEvent(sessionId, 'idle-timeout', 'User idle for 30+ seconds');
      }
    }, 30000);

    // Update last activity on any interaction
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
      document.addEventListener(event, () => {
        lastActivity = Date.now();
      });
    });

    // Monitor dev tools
    this.detectDevTools(sessionId);
  }

  private detectDevTools(sessionId: string): void {
    // Detect dev tools opening
    const threshold = 160;
    let devToolsOpened = false;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpened) {
          this.logSecurityEvent(sessionId, 'dev-tools', 'Developer tools detected');
          devToolsOpened = true;
        }
      } else {
        devToolsOpened = false;
      }
    };

    setInterval(checkDevTools, 1000);
  }

  private logSecurityEvent(sessionId: string, type: SecurityEvent['type'], details: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const event: SecurityEvent = {
        id: this.generateEventId(),
        type,
        timestamp: new Date(),
        quizId: session.quizId,
        username: session.username,
        details
      };

      session.securityEvents.push(event);
      this.securityEvents.push(event);
      
      // Save updated session
      this.saveSession(session);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveSession(session: QuizSession): void {
    const sessions = this.getAllSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem('quizSessions', JSON.stringify(sessions));
  }

  getAllSessions(): QuizSession[] {
    return JSON.parse(localStorage.getItem('quizSessions') || '[]');
  }

  getSession(sessionId: string): QuizSession | undefined {
    return this.getAllSessions().find(s => s.id === sessionId);
  }

  getUserSessions(username: string): QuizSession[] {
    return this.getAllSessions().filter(s => s.username === username);
  }

  getFlaggedSessions(): QuizSession[] {
    return this.getAllSessions().filter(s => s.isFlagged);
  }

  // Fullscreen management
  enterFullscreen(): Promise<void> {
    return new Promise((resolve, reject) => {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        element.requestFullscreen().then(resolve).catch(reject);
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen().then(resolve).catch(reject);
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen().then(resolve).catch(reject);
      } else {
        reject(new Error('Fullscreen not supported'));
      }
    });
  }

  exitFullscreen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(resolve).catch(reject);
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen().then(resolve).catch(reject);
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen().then(resolve).catch(reject);
      } else {
        reject(new Error('Fullscreen exit not supported'));
      }
    });
  }

  // Disable right-click context menu
  disableContextMenu(): void {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  // Disable keyboard shortcuts
  disableKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Disable common shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
          case 'v':
          case 'x':
          case 'a':
          case 'p':
          case 's':
          case 'u':
            e.preventDefault();
            break;
        }
      }
      
      // Disable F keys
      if (e.key.startsWith('F')) {
        e.preventDefault();
      }
      
      // Disable context menu key
      if (e.key === 'ContextMenu') {
        e.preventDefault();
      }
    });
  }
}

export default SecurityService;
