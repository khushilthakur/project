import React, { useState, useEffect } from 'react';
import {
  Mic,
  Sparkles,
  Play,
  RotateCcw,
  Award,
  ArrowRight,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { interviewService } from '../../services/interviewService';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge } from '../../components/common/Badge';

export function InterviewCoachPage() {
  const { user, profile } = useAuth();

  // Screen modes: 'setup' | 'session' | 'summary'
  const [mode, setMode] = useState('setup');

  // Setup Form
  const [targetRole, setTargetRole] = useState(profile?.preferred_roles?.[0] || 'Frontend Developer');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [questionCount, setQuestionCount] = useState(3);
  const [jobDescription, setJobDescription] = useState('');
  const [starting, setStarting] = useState(false);

  // Active Session State
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState(null);

  // Historical Sessions
  const [pastSessions, setPastSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      try {
        setLoadingHistory(true);
        const data = await interviewService.getSessions(user?.id);
        if (mounted) setPastSessions(data || []);
      } catch (e) {
        console.error('Error loading interview history:', e);
      } finally {
        if (mounted) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { mounted = false; };
  }, [user]);

  // Start new interview session
  const handleStartSession = async (e) => {
    e.preventDefault();
    setSessionError('');
    setStarting(true);
    try {
      const session = await interviewService.createSession({
        targetRole: targetRole || 'Software Engineer',
        interviewType: interviewType || 'Technical',
        difficulty: difficulty || 'Beginner',
        jobDescription: jobDescription || '',
        questionCount: Number(questionCount) || 3,
        userId: user?.id,
      });

      if (!session || !session.questions || session.questions.length === 0) {
        throw new Error('Failed to generate interview questions. Please try again.');
      }

      setCurrentSession(session);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setQuestionFeedback(null);
      setMode('session');
    } catch (err) {
      console.error('Error starting interview session:', err);
      setSessionError(err.message || 'Unable to start interview session. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  // Submit Answer for current question
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentSession) return;
    setEvaluating(true);
    setSessionError('');

    const question = currentSession.questions[currentQuestionIndex];
    try {
      const updatedQuestion = await interviewService.submitAnswer({
        sessionId: currentSession.id,
        questionId: question.id,
        questionText: question.question_text || question.question,
        modelAnswer: question.default_model_answer || question.model_answer,
        guidance: question.guidance,
        category: question.category,
        answer: userAnswer,
        role: currentSession.target_role,
        interviewType: currentSession.interview_type,
      });

      if (updatedQuestion) {
        setQuestionFeedback(updatedQuestion);
        setCurrentSession((prev) => {
          if (!prev) return prev;
          const nextQuestions = [...prev.questions];
          nextQuestions[currentQuestionIndex] = {
            ...nextQuestions[currentQuestionIndex],
            ...updatedQuestion,
          };
          return { ...prev, questions: nextQuestions };
        });
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
      setSessionError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  // Move to next question or complete session
  const handleNextQuestion = async () => {
    if (!currentSession) return;

    if (currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
      setQuestionFeedback(null);
    } else {
      // Complete Session
      try {
        const completed = await interviewService.completeSession(currentSession.id);
        const finalSession = completed || currentSession;
        setCurrentSession(finalSession);
        setPastSessions((prev) => [finalSession, ...prev.filter((s) => s.id !== finalSession.id)]);
        setMode('summary');

        // Trigger celebratory confetti if score is great
        if (finalSession.overall_score >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        console.error('Error completing session:', err);
        setMode('summary');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          AI Mock Interview Coach
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Practice technical and behavioral questions tailored to your target role with instant feedback.
        </p>
      </div>

      {sessionError && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {sessionError}
        </div>
      )}

      {/* MODE 1: SETUP SCREEN */}
      {mode === 'setup' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {/* Setup Form */}
          <Card title="Configure Interview Simulation" subtitle="Tailor the question bank and difficulty level">
            <form onSubmit={handleStartSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Target Job Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Full Stack Developer"
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select
                  label="Interview Category"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  options={['Technical', 'HR / Behavioral']}
                />
                <Select
                  label="Difficulty Level"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  options={['Beginner', 'Intermediate', 'Advanced']}
                />
              </div>

              <Select
                label="Number of Questions"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                options={[
                  { label: '3 Questions (Quick Practice)', value: 3 },
                  { label: '5 Questions (Standard Simulation)', value: 5 },
                ]}
              />

              <Textarea
                label="Optional Job Description Context"
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste requirements if you want the questions grounded in a specific role posting..."
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Play}
                isLoading={starting}
              >
                Begin Practice Interview
              </Button>
            </form>
          </Card>

          {/* Past Sessions History */}
          <Card title="Past Interview History" subtitle="Review past answers, scores, and feedback">
            {loadingHistory ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.875rem' }}>Loading session history...</p>
              </div>
            ) : pastSessions.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Mic size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--primary)', opacity: 0.7 }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>No practice sessions yet.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Configure your target role on the left and start practicing!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {pastSessions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {s.target_role} ({s.interview_type})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {s.difficulty} • {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={s.overall_score >= 70 ? 'success' : 'warning'}>
                      Score: {s.overall_score !== null ? `${s.overall_score}/100` : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODE 2: ACTIVE INTERVIEW SESSION */}
      {mode === 'session' && currentSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          {/* Progress Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant="primary">{currentSession.target_role}</Badge>
              <Badge variant="info">{currentSession.interview_type}</Badge>
              <Badge variant="warning">{currentSession.difficulty}</Badge>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Question {currentQuestionIndex + 1} of {currentSession.questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${((currentQuestionIndex + 1) / currentSession.questions.length) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--primary)',
                transition: 'width 300ms ease',
              }}
            />
          </div>

          {/* Current Question Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                }}
              >
                Q{currentQuestionIndex + 1}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {currentSession.questions[currentQuestionIndex]?.question_text || currentSession.questions[currentQuestionIndex]?.question || 'Interview Question'}
                </h3>
                {currentSession.questions[currentQuestionIndex]?.guidance && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    💡 Guidance: {currentSession.questions[currentQuestionIndex].guidance}
                  </p>
                )}
              </div>
            </div>

            {/* Answer Form */}
            {!questionFeedback ? (
              <form onSubmit={handleSubmitAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Textarea
                  rows={6}
                  placeholder="Type your response clearly. Use real project examples or technical reasoning..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (confirm('Are you sure you want to exit this interview session?')) {
                        setMode('setup');
                      }
                    }}
                  >
                    Exit Session
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={evaluating}
                    disabled={!userAnswer.trim()}
                    icon={Sparkles}
                  >
                    Submit Answer & Evaluate
                  </Button>
                </div>
              </form>
            ) : (
              /* Answer Feedback Card */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                {/* Score & Summary */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Answer Evaluation
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                      {questionFeedback.feedback}
                    </p>
                  </div>
                  <Badge
                    variant={questionFeedback.score >= 75 ? 'success' : questionFeedback.score >= 50 ? 'warning' : 'danger'}
                    style={{ fontSize: '1.05rem', padding: '0.45rem 0.9rem', fontWeight: 800 }}
                  >
                    Score: {questionFeedback.score}/100
                  </Badge>
                </div>

                {/* Key Strengths */}
                {questionFeedback.evaluation_criteria?.strengths?.length > 0 && (
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--success-bg)',
                      border: '1px solid var(--success-border)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success-text)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={15} /> Key Strengths
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {questionFeedback.evaluation_criteria.strengths.map((str, idx) => (
                        <li key={idx} style={{ marginBottom: '0.2rem' }}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas to Elevate */}
                {questionFeedback.evaluation_criteria?.areas_to_improve?.length > 0 && (
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--warning-text)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Lightbulb size={15} /> Areas to Elevate
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {questionFeedback.evaluation_criteria.areas_to_improve.map((tip, idx) => (
                        <li key={idx} style={{ marginBottom: '0.2rem' }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Model Answer */}
                {questionFeedback.model_answer && (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      ⭐ Exemplary Model Answer
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {questionFeedback.model_answer}
                    </p>
                  </div>
                )}

                {/* Next Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <Button
                    variant="primary"
                    icon={ArrowRight}
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < currentSession.questions.length - 1
                      ? 'Proceed to Next Question'
                      : 'Complete Session & View Summary'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODE 3: SESSION SUMMARY SCREEN */}
      {mode === 'summary' && currentSession && (
        <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Award size={38} />
            </div>

            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Interview Simulation Completed!
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              {currentSession.overall_feedback}
            </p>

            <div
              style={{
                display: 'inline-flex',
                padding: '0.75rem 2rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              Overall Score: {currentSession.overall_score} / 100
            </div>

            {/* Questions Review */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Session Questions & Scores
              </h4>
              {currentSession.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Q{idx + 1}: {q.question_text}
                    </span>
                    <Badge variant={q.score >= 70 ? 'success' : 'warning'}>
                      {q.score !== null ? `${q.score}/100` : 'Skipped'}
                    </Badge>
                  </div>
                  {q.user_answer && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      "{q.user_answer}"
                    </p>
                  )}
                  {q.feedback && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>
                      Feedback: {q.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <Button variant="primary" icon={RotateCcw} onClick={() => setMode('setup')}>
                Practice Another Role
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
