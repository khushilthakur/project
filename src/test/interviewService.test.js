import { describe, it, expect, beforeEach } from 'vitest';
import { interviewService } from '../services/interviewService';
import { isValidUUID, generateUUID, storage, STORAGE_KEYS } from '../lib/supabaseClient';

describe('Interview Coach Service & Asking Questions', () => {
  beforeEach(() => {
    storage.remove(STORAGE_KEYS.INTERVIEWS);
  });

  it('validates UUIDs properly', () => {
    const uuid = generateUUID();
    expect(isValidUUID(uuid)).toBe(true);
    expect(isValidUUID('usr-demo-123')).toBe(false);
    expect(isValidUUID(null)).toBe(false);
  });

  it('creates an interview session across all difficulties and categories without error', async () => {
    const technicalBeginner = await interviewService.createSession({
      targetRole: 'Frontend Developer',
      interviewType: 'Technical',
      difficulty: 'Beginner',
      questionCount: 3,
    });
    expect(technicalBeginner).toBeDefined();
    expect(technicalBeginner.questions.length).toBe(3);
    expect(technicalBeginner.questions[0].question_text).toBeTruthy();

    const hrAdvanced = await interviewService.createSession({
      targetRole: 'Engineering Lead',
      interviewType: 'HR / Behavioral',
      difficulty: 'Advanced',
      questionCount: 3,
    });
    expect(hrAdvanced).toBeDefined();
    expect(hrAdvanced.questions.length).toBe(3);
    expect(hrAdvanced.questions[0].question_text).toBeTruthy();
  });

  it('submits an answer, evaluates score and feedback, and updates question state', async () => {
    const session = await interviewService.createSession({
      targetRole: 'React Developer',
      interviewType: 'Technical',
      difficulty: 'Beginner',
      questionCount: 3,
    });

    const firstQuestion = session.questions[0];
    const evaluated = await interviewService.submitAnswer({
      sessionId: session.id,
      questionId: firstQuestion.id,
      answer: 'In JavaScript, var is function-scoped while let and const are block-scoped. Const prevents reassignment of variable identifiers.',
      role: 'React Developer',
      interviewType: 'Technical',
      questionText: firstQuestion.question_text,
      modelAnswer: firstQuestion.default_model_answer,
    });

    expect(evaluated).toBeDefined();
    expect(evaluated.score).toBeGreaterThan(0);
    expect(evaluated.feedback).toBeTruthy();
    expect(evaluated.user_answer).toContain('var is function-scoped');
  });

  it('completes session and generates overall score and summary feedback', async () => {
    const session = await interviewService.createSession({
      targetRole: 'Frontend Developer',
      interviewType: 'Technical',
      difficulty: 'Beginner',
      questionCount: 2,
    });

    // Answer first question
    await interviewService.submitAnswer({
      sessionId: session.id,
      questionId: session.questions[0].id,
      answer: 'React reconciliation uses a Virtual DOM diffing algorithm to minimize actual DOM reflows and repaints, improving UI performance.',
      role: 'Frontend Developer',
      interviewType: 'Technical',
      questionText: session.questions[0].question_text,
      modelAnswer: session.questions[0].default_model_answer,
    });

    const completed = await interviewService.completeSession(session.id);
    expect(completed.status).toBe('completed');
    expect(completed.overall_score).toBeGreaterThan(0);
    expect(completed.overall_feedback).toBeTruthy();
  });
});
