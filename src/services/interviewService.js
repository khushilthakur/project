import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';
import { INTERVIEW_QUESTIONS_DATABASE } from '../lib/mockData';
import { evaluateInterviewAnswer } from './aiService';

export const interviewService = {
  // Start new interview session
  async createSession({ targetRole, interviewType, difficulty, jobDescription, questionCount = 3, userId }) {
    // Select questions
    const typeQuestions = INTERVIEW_QUESTIONS_DATABASE[interviewType]?.[difficulty] || 
      INTERVIEW_QUESTIONS_DATABASE['Technical']['Beginner'];

    const selectedPool = [...typeQuestions];
    // Shuffle pool
    selectedPool.sort(() => 0.5 - Math.random());
    const questionsToUse = selectedPool.slice(0, questionCount).map((q, idx) => ({
      id: 'q-' + Date.now() + '-' + idx,
      question_order: idx + 1,
      question_text: q.question,
      category: q.category,
      guidance: q.guidance,
      default_model_answer: q.model_answer,
      user_answer: '',
      feedback: '',
      model_answer: '',
      score: null,
      evaluation_criteria: {},
      answered_at: null,
    }));

    const session = {
      id: 'int-sess-' + Date.now(),
      user_id: userId,
      target_role: targetRole,
      interview_type: interviewType,
      difficulty: difficulty,
      job_description: jobDescription || '',
      status: 'in_progress',
      overall_score: null,
      overall_feedback: '',
      created_at: new Date().toISOString(),
      completed_at: null,
      questions: questionsToUse,
    };

    if (isSupabaseConfigured && supabase) {
      const { data: dbSession, error: sErr } = await supabase
        .from('interview_sessions')
        .insert({
          id: session.id,
          user_id: userId,
          target_role: targetRole,
          interview_type: interviewType,
          difficulty: difficulty,
          job_description: jobDescription,
          status: 'in_progress',
        })
        .select()
        .single();

      if (sErr) throw sErr;

      // Insert questions
      const qRows = questionsToUse.map((q) => ({
        id: q.id,
        session_id: dbSession.id,
        question_order: q.question_order,
        question_text: q.question_text,
        category: q.category,
      }));
      await supabase.from('interview_questions').insert(qRows);
    }

    // Always keep in local sessions cache for active UI flow
    const sessions = storage.get(STORAGE_KEYS.INTERVIEWS, []);
    storage.set(STORAGE_KEYS.INTERVIEWS, [session, ...sessions]);

    return session;
  },

  // Submit and evaluate an answer
  async submitAnswer({ sessionId, questionId, answer, role, interviewType }) {
    // Call AI / heuristic evaluation
    const evaluation = await evaluateInterviewAnswer({
      question: '',
      answer,
      role,
      interview_type: interviewType,
    });

    const sessions = storage.get(STORAGE_KEYS.INTERVIEWS, []);
    const sIndex = sessions.findIndex((s) => s.id === sessionId);

    if (sIndex >= 0) {
      const session = sessions[sIndex];
      const qIndex = session.questions.findIndex((q) => q.id === questionId);
      if (qIndex >= 0) {
        session.questions[qIndex].user_answer = answer;
        session.questions[qIndex].score = evaluation.score;
        session.questions[qIndex].feedback = evaluation.feedback;
        session.questions[qIndex].model_answer = evaluation.model_answer || session.questions[qIndex].default_model_answer;
        session.questions[qIndex].evaluation_criteria = {
          strengths: evaluation.strengths || [],
          areas_to_improve: evaluation.areas_to_improve || [],
        };
        session.questions[qIndex].answered_at = new Date().toISOString();

        storage.set(STORAGE_KEYS.INTERVIEWS, sessions);

        if (isSupabaseConfigured && supabase) {
          await supabase
            .from('interview_questions')
            .update({
              user_answer: answer,
              score: evaluation.score,
              feedback: evaluation.feedback,
              model_answer: session.questions[qIndex].model_answer,
              evaluation_criteria: session.questions[qIndex].evaluation_criteria,
              answered_at: new Date().toISOString(),
            })
            .eq('id', questionId);
        }

        return session.questions[qIndex];
      }
    }

    return null;
  },

  // Complete session and compute overall score
  async completeSession(sessionId) {
    const sessions = storage.get(STORAGE_KEYS.INTERVIEWS, []);
    const sIndex = sessions.findIndex((s) => s.id === sessionId);

    if (sIndex >= 0) {
      const session = sessions[sIndex];
      const answeredQuestions = session.questions.filter((q) => q.score !== null);
      const totalScore = answeredQuestions.reduce((acc, q) => acc + q.score, 0);
      const avgScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 0;

      session.status = 'completed';
      session.overall_score = avgScore;
      session.completed_at = new Date().toISOString();
      session.overall_feedback = avgScore >= 80
        ? 'Excellent interview performance! You demonstrated clear technical command, structured articulation, and confidence.'
        : avgScore >= 60
        ? 'Good performance with solid fundamentals. Work on structuring your answers using the STAR format and incorporating concrete metrics.'
        : 'Practice session completed. Review the model answers and focus on elaborating with specific technical context.';

      storage.set(STORAGE_KEYS.INTERVIEWS, sessions);

      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('interview_sessions')
          .update({
            status: 'completed',
            overall_score: avgScore,
            overall_feedback: session.overall_feedback,
            completed_at: session.completed_at,
          })
          .eq('id', sessionId);
      }

      return session;
    }
    return null;
  },

  // Get session history
  async getSessions(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*, interview_questions(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((s) => ({
          ...s,
          questions: s.interview_questions || [],
        }));
      }
    }
    return storage.get(STORAGE_KEYS.INTERVIEWS, []);
  },
};
