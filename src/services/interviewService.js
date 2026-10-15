import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage, generateUUID, isValidUUID } from '../lib/supabaseClient';
import { INTERVIEW_QUESTIONS_DATABASE } from '../lib/mockData';
import { evaluateInterviewAnswer } from './aiService';

export const interviewService = {
  // Start new interview session
  async createSession({ targetRole, interviewType, difficulty, jobDescription, questionCount = 3, userId }) {
    const validUserId = isValidUUID(userId) ? userId : generateUUID();

    // Select questions
    const categoryGroup = INTERVIEW_QUESTIONS_DATABASE[interviewType] || INTERVIEW_QUESTIONS_DATABASE['Technical'] || {};
    let typeQuestions = categoryGroup[difficulty] || categoryGroup['Beginner'] || [];

    // If pool is smaller than questionCount, merge with other tiers in the same category
    if (typeQuestions.length < questionCount) {
      const allCategoryQuestions = Object.values(categoryGroup).flat();
      typeQuestions = allCategoryQuestions.length > 0 ? allCategoryQuestions : Object.values(INTERVIEW_QUESTIONS_DATABASE['Technical']).flat();
    }

    const selectedPool = [...typeQuestions];
    // Shuffle pool
    selectedPool.sort(() => 0.5 - Math.random());
    const questionsToUse = selectedPool.slice(0, questionCount).map((q, idx) => ({
      id: generateUUID(),
      question_order: idx + 1,
      question_text: q.question || q.question_text || `Explain the core concepts and principles of ${targetRole || 'Software Engineering'}.`,
      category: q.category || 'General',
      guidance: q.guidance || 'Provide a clear, structured explanation with practical examples.',
      default_model_answer: q.model_answer || 'A solid answer outlines the key mechanism, reasons through edge cases, and provides a production example.',
      user_answer: '',
      feedback: '',
      model_answer: '',
      score: null,
      evaluation_criteria: {},
      answered_at: null,
    }));

    const session = {
      id: generateUUID(),
      user_id: validUserId,
      target_role: targetRole || 'Software Engineer',
      interview_type: interviewType || 'Technical',
      difficulty: difficulty || 'Beginner',
      job_description: jobDescription || '',
      status: 'in_progress',
      overall_score: null,
      overall_feedback: '',
      created_at: new Date().toISOString(),
      completed_at: null,
      questions: questionsToUse,
    };

    if (isSupabaseConfigured && supabase && isValidUUID(session.id) && isValidUUID(validUserId)) {
      try {
        const { data: dbSession, error: sErr } = await supabase
          .from('interview_sessions')
          .insert({
            id: session.id,
            user_id: validUserId,
            target_role: session.target_role,
            interview_type: session.interview_type,
            difficulty: session.difficulty,
            job_description: session.job_description,
            status: 'in_progress',
          })
          .select()
          .single();

        if (!sErr && dbSession) {
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
      } catch (sbErr) {
        console.warn('Supabase interview creation fallback to local storage:', sbErr);
      }
    }

    // Always keep in local sessions cache for active UI flow
    const sessions = storage.get(STORAGE_KEYS.INTERVIEWS, []);
    storage.set(STORAGE_KEYS.INTERVIEWS, [session, ...sessions]);

    return session;
  },

  // Submit and evaluate an answer
  async submitAnswer({ sessionId, questionId, answer, role, interviewType, questionText, modelAnswer, guidance }) {
    const sessions = storage.get(STORAGE_KEYS.INTERVIEWS, []);
    const sIndex = sessions.findIndex((s) => s.id === sessionId);

    const effectiveRole = role || 'Software Engineer';
    const effectiveType = interviewType || 'Technical';
    const effectiveQuestion = questionText || '';
    const effectiveModelAnswer = modelAnswer || '';
    const effectiveGuidance = guidance || '';

    // Call dynamic AI / evaluation engine
    const evaluation = await evaluateInterviewAnswer({
      question: effectiveQuestion,
      answer,
      role: effectiveRole,
      interview_type: effectiveType,
      model_answer: effectiveModelAnswer,
      guidance: effectiveGuidance,
    });

    const updatedQuestionData = {
      id: questionId || generateUUID(),
      user_answer: answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      model_answer: effectiveModelAnswer || evaluation.model_answer,
      evaluation_criteria: {
        strengths: evaluation.strengths || [],
        areas_to_improve: evaluation.areas_to_improve || [],
      },
      answered_at: new Date().toISOString(),
    };

    if (sIndex >= 0) {
      const session = sessions[sIndex];
      const qIndex = session.questions.findIndex((q) => q.id === questionId);
      if (qIndex >= 0) {
        session.questions[qIndex] = {
          ...session.questions[qIndex],
          ...updatedQuestionData,
        };

        storage.set(STORAGE_KEYS.INTERVIEWS, sessions);

        if (isSupabaseConfigured && supabase && isValidUUID(questionId)) {
          try {
            await supabase
              .from('interview_questions')
              .update({
                user_answer: answer,
                score: evaluation.score,
                feedback: evaluation.feedback,
                model_answer: session.questions[qIndex].model_answer,
                evaluation_criteria: session.questions[qIndex].evaluation_criteria,
                answered_at: updatedQuestionData.answered_at,
              })
              .eq('id', questionId);
          } catch (sbErr) {
            console.warn('Supabase answer update fallback:', sbErr);
          }
        }

        return session.questions[qIndex];
      }
    }

    return updatedQuestionData;
  },

  // Complete session and compute overall score
  async completeSession(sessionId) {
    const sessions = storage.get(STORAGE_KEYS.INTERVIEWS, []);
    const sIndex = sessions.findIndex((s) => s.id === sessionId);

    if (sIndex >= 0) {
      const session = sessions[sIndex];
      const answeredQuestions = session.questions.filter((q) => q.score !== null);
      const totalScore = answeredQuestions.reduce((acc, q) => acc + q.score, 0);
      const avgScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 75;

      session.status = 'completed';
      session.overall_score = avgScore;
      session.completed_at = new Date().toISOString();
      session.overall_feedback = avgScore >= 80
        ? 'Excellent interview performance! You demonstrated clear technical command, structured articulation, and confidence.'
        : avgScore >= 60
        ? 'Good performance with solid fundamentals. Work on structuring your answers using the STAR format and incorporating concrete metrics.'
        : 'Practice session completed. Review the model answers and focus on elaborating with specific technical context.';

      storage.set(STORAGE_KEYS.INTERVIEWS, sessions);

      if (isSupabaseConfigured && supabase && isValidUUID(sessionId)) {
        try {
          await supabase
            .from('interview_sessions')
            .update({
              status: 'completed',
              overall_score: avgScore,
              overall_feedback: session.overall_feedback,
              completed_at: session.completed_at,
            })
            .eq('id', sessionId);
        } catch (sbErr) {
          console.warn('Supabase session completion fallback:', sbErr);
        }
      }

      return session;
    }

    return {
      id: sessionId || generateUUID(),
      status: 'completed',
      overall_score: 80,
      overall_feedback: 'Practice session completed successfully! Review the feedback items to continuously improve your delivery.',
      questions: [],
    };
  },

  // Get session history
  async getSessions(userId) {
    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('interview_sessions')
          .select('*, interview_questions(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((s) => ({
            ...s,
            questions: s.interview_questions || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase getSessions fallback:', err);
      }
    }
    const local = storage.get(STORAGE_KEYS.INTERVIEWS, []);
    return userId ? local.filter((s) => !s.user_id || s.user_id === userId) : local;
  },
};
