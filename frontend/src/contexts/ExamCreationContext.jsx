import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken } from '../utils/UserRoleUtils';
import { v4 as uuidv4 } from 'uuid';

export const ExamCreationContext = createContext();

export const ExamCreationProvider = ({ children, examId }) => {
  const [examData, setExamData] = useState(() => {
    const savedData = sessionStorage.getItem('examData');
    return savedData
      ? JSON.parse(savedData)
      : {
          title: '',
          startDateTime: '',
          startTime: '',
          endDateTime: '',
          endTime: '',
          visibility: false,
          questionsCount: 1,
          duration: 10,
          description: '',
          numberOfTries: 1,
          multipleTries: false,
          randomiseQuestions: false,  
          endTestAfterLeavingWindow: false, 
          blockCopyingPasting: false, 
          randomiseAnswers: false, 
          latestAttemptCounts: true, 
          bestAttemptCounts: false,
          hideResults: false, 
          displayPointsPerQuestion: false, 
          showCorrectAnswers: false, 
          allowNavigation: false, 
          allowReview: false, 
          allowReturnToPreviousQuestions: false,
          allowMultipleAttempts: false,
          selectedLessonId: '',
          questions: [],
          selectedClasses: [],
          selectedStudents: [],
          availableClasses: [],
          availableStudents: [],
          gradebookExams: [] // Inicjalizacja jako pusta tablica
        };
  });
  
  const [initialSelectedClasses, setInitialSelectedClasses] = useState([]);
  const [initialSelectedStudents, setInitialSelectedStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingCount, setLoadingCount] = useState(0);

  const token = getToken();

  const mapAnswerType = useCallback((question) => {
    if (question.type === 'OPEN') {
      return question.auto_check ? 'Auto Check' : 'Long Answer';
    } else if (question.type === 'CLOSED') {
      const correctAnswers = question.answers.filter(a => a.is_correct);
      return correctAnswers.length > 1 ? 'Multiple Choice' : 'Single Choice';
    }
    return 'Auto Check';
  }, []);

  const mapOptions = useCallback((question) => {
    if (question.type === 'CLOSED') {
      return question.answers.map(a => ({
        text: a.description,
        correct: a.is_correct
      }));
    }
    return [];
  }, []);

  const updateExamData = (newData) => {
    setExamData((prevData) => ({
      ...prevData,
      ...newData,
    }));
    // console.log(title)
    // console.log(selectedLessonId);
  };

  const fetchGradebookExams = useCallback(async () => {
    console.log("Fetching Gradebook Exams...");
    incrementLoading();
    try {
      const response = await fetch('http://localhost:3000/exams/getGradebookExams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Nie udało się pobrać gradebook exams.');
      }

      const data = await response.json();
      const fetchedGradebookExams = data.data.map(exam => ({
        lesson_id: exam.lesson_id,
        topic: exam.topic,
      }));

      setExamData(prevData => ({
        ...prevData,
        gradebookExams: fetchedGradebookExams,
      }));
      console.log("Fetched Gradebook Exams:", fetchedGradebookExams);
    } catch (error) {
      console.error('Error fetching gradebook exams:', error);
      setError(error.message);
    } finally {
      decrementLoading();
    }
  }, [token]);

  const initializeParticipants = useCallback((participantsData) => {
    const { classesParticipants, studentsParticipants, classes, students } = participantsData;

    const transformedClassesParticipants = classesParticipants.map(cls => ({
      value: cls.id,
      label: cls.name,
      yearbook: cls.yearbook,
      teacher_id: cls.teacher_id
    }));

    const transformedStudentsParticipants = studentsParticipants.map(student => ({
      value: student.id,
      label: `${student.first_name} ${student.last_name}`,
      class_id: student.class_id
    }));

    const transformedClasses = classes.map(cls => ({
      value: cls.id,
      label: cls.name,
      yearbook: cls.yearbook,
      teacher_id: cls.teacher_id
    }));

    const transformedStudents = students.map(student => ({
      value: student.id,
      label: `${student.first_name} ${student.last_name}`,
      class_id: student.class_id
    }));

    setInitialSelectedClasses(transformedClassesParticipants);
    setInitialSelectedStudents(transformedStudentsParticipants);
    setExamData(prevData => ({
      ...prevData,
      selectedClasses: transformedClassesParticipants,
      selectedStudents: transformedStudentsParticipants,
      availableClasses: transformedClasses,
      availableStudents: transformedStudents,
    }));
  }, []);

  const incrementLoading = () => setLoadingCount(count => count + 1);
  const decrementLoading = () => setLoadingCount(count => Math.max(count - 1, 0));

  const fetchExamInfo = useCallback(async () => {
    incrementLoading();
    try {
      const response = await fetch(`http://localhost:3000/exams/${examId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Nie udało się pobrać danych egzaminu.');
      }

      const data = await response.json();
      const exam = data.data;

      const startDateTime = new Date(exam.start_date_time);
      const endDateTime = new Date(exam.end_date_time);

      const startDate = startDateTime.toISOString().split('T')[0];
      const startTime = startDateTime.toISOString().split('T')[1].substr(0,5);

      const endDate = endDateTime.toISOString().split('T')[0];
      const endTime = endDateTime.toISOString().split('T')[1].substr(0,5);

      setExamData((prevData) => ({
        ...prevData,
        title: exam.title,
        lesson_id: exam.lesson_id,
        selectedLessonId: exam.lesson_id,
        description: exam.description,
        questionsCount: exam.number_of_questions,
        duration: exam.duration,
        visibility: exam.visibility,
        numberOfTries: exam.number_of_tries,
        multipleTries: exam.multiple_tries,
        randomiseQuestions: exam.randomise_questions,
        endTestAfterLeavingWindow: exam.end_test_after_leaving_window,
        blockCopyingPasting: exam.block_copying_pasting,
        randomiseAnswers: exam.randomise_answers,
        latestAttemptCounts: exam.latest_attempt_counts,
        bestAttemptCounts: exam.best_attempt_counts,
        hideResults: exam.hide_results,
        displayPointsPerQuestion: exam.display_points_per_question,
        showCorrectAnswers: exam.show_correct_answers,
        allowNavigation: exam.allow_navigation,
        allowReview: exam.allow_review,
        allowReturnToPreviousQuestions: exam.allow_return_to_previous_questions,
        allowMultipleAttempts: exam.allow_multiple_attempts,
        startDateTime: startDate,
        startTime: startTime,
        endDateTime: endDate,
        endTime: endTime,
      }));
    } catch (error) {
      console.error('Error fetching exam info:', error);
      setError(error.message);
    } finally {
      decrementLoading();
    }
  }, [examId, token]);

  const fetchExamQuestions = useCallback(async () => {
    incrementLoading();
    try {
      const response = await fetch(`http://localhost:3000/exams/${examId}/getExamQuestions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Nie udało się pobrać pytań egzaminu.');
      }

      const data = await response.json();
      const mappedQuestions = data.data.questions.map(q => ({
        id: q.id,
        text: q.description,
        answerType: mapAnswerType(q),
        options: mapOptions(q),
        points: q.score,
        words: 1,
        maxWords: 1,
        autoCheck: q.auto_check || false,
        answer: q.auto_check ? q.answers[0]?.description || '' : ''
      }));

      setExamData((prevData) => ({
        ...prevData,
        questions: mappedQuestions,
      }));
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      setError(error.message);
    } finally {
      decrementLoading();
    }
  }, [examId, token, mapAnswerType, mapOptions]);

  const fetchParticipants = useCallback(async () => {
    incrementLoading();
    try {
      const response = await fetch(`http://localhost:3000/exams/${examId}/getParticipants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Nie udało się pobrać uczestników egzaminu.');
      }

      const data = await response.json();
      const participantsData = data.data;
      initializeParticipants(participantsData);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setError(error.message);
    } finally {
      decrementLoading();
    }
  }, [examId, token, initializeParticipants]);

  const fetchParticipantsForNewExam = useCallback(async () => {
    incrementLoading();
    try {
      const response = await fetch(`http://localhost:3000/exams/NewExamParticipants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Nie udało się pobrać uczestników egzaminu.');
      }

      const data = await response.json();
      const participantsData = data.data;
      const { classes, students } = participantsData;

      const transformedClasses = classes.map(cls => ({
        value: cls.id,
        label: cls.name,
        yearbook: cls.yearbook,
        teacher_id: cls.teacher_id
      }));

      const transformedStudents = students.map(student => ({
        value: student.id,
        label: `${student.first_name} ${student.last_name}`,
        class_id: student.class_id
      }));
      setExamData(prevData => ({
        ...prevData,
        availableClasses: transformedClasses,
        availableStudents: transformedStudents,
      }));

    } catch (error) {
      console.error('Error fetching participants:', error);
      setError(error.message);
    } finally {
      decrementLoading();
    }
  }, [token]);

  const addQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      text: '',
      answerType: 'Auto Check',
      options: [
        { id: uuidv4(), text: '', correct: false }
      ],
      points: 1,
      words: 1,
      maxWords: 1,
      autoCheck: true,
      answer: '',
    };
    setExamData((prevData) => ({
      ...prevData,
      questions: [...prevData.questions, newQuestion]
    }));
  };

  const updateQuestion = useCallback((id, updatedQuestion) => {
    setExamData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map(q => q.id === id ? { ...q, ...updatedQuestion } : q)
    }));
  }, []);

  const removeQuestion = useCallback((id) => {
    setExamData((prevData) => ({
      ...prevData,
      questions: prevData.questions.filter(q => q.id !== id)
    }));
  }, []);

  const addSelectedClass = useCallback((classObj) => {
    setExamData((prevData) => ({
      ...prevData,
      selectedClasses: [...prevData.selectedClasses, classObj],
      availableClasses: prevData.availableClasses.filter(cls => cls.value !== classObj.value)
    }));
  }, []);

  const removeSelectedClass = useCallback((classId) => {
    const cls = examData.selectedClasses.find(cls => cls.value === classId);
    if (cls) {
      setExamData((prevData) => ({
        ...prevData,
        selectedClasses: prevData.selectedClasses.filter(cls => cls.value !== classId),
        availableClasses: [...prevData.availableClasses, cls]
      }));
    }
  }, [examData.selectedClasses]);

  const addSelectedStudent = useCallback((studentObj) => {
    setExamData((prevData) => ({
      ...prevData,
      selectedStudents: [...prevData.selectedStudents, studentObj],
      availableStudents: prevData.availableStudents.filter(student => student.value !== studentObj.value)
    }));
  }, []);

  const removeSelectedStudent = useCallback((studentId) => {
    const student = examData.selectedStudents.find(student => student.value === studentId);
    if (student) {
      setExamData((prevData) => ({
        ...prevData,
        selectedStudents: prevData.selectedStudents.filter(student => student.value !== studentId),
        availableStudents: [...prevData.availableStudents, student]
      }));
    }
  }, [examData.selectedStudents]);

  const resetExamData = useCallback(() => {
    setExamData({
      title: '',
      startDateTime: '',
      startTime: '',
      endDateTime: '',
      endTime: '',
      visibility: false,
      questionsCount: 1,
      duration: 10,
      description: '',
      numberOfTries: 1,
      multipleTries: false,
      randomiseQuestions: false,  
      endTestAfterLeavingWindow: false, 
      blockCopyingPasting: false, 
      randomiseAnswers: false, 
      latestAttemptCounts: true, 
      bestAttemptCounts: false,
      hideResults: false, 
      displayPointsPerQuestion: false, 
      selectedLessonId: '',
      showCorrectAnswers: false, 
      allowNavigation: false, 
      allowReview: false, 
      allowReturnToPreviousQuestions: false,
      allowMultipleAttempts: false,
      questions: [],
      selectedClasses: [],
      selectedStudents: [],
      availableClasses: [],
      availableStudents: [],
      gradebookExams: []
    });
    sessionStorage.removeItem('examData');
    setIsEditing(false);
    setError(null);
    setInitialSelectedClasses([]);
    setInitialSelectedStudents([]);
  }, []);

  useEffect(() => {
    if (examId) {
      setIsEditing(true);
      setError(null);
      Promise.all([
        fetchExamInfo(),
        fetchExamQuestions(),
        fetchParticipants(),
        fetchGradebookExams()
      ])
      .catch((err) => {
        setError(err.message);
      });
    } else {
      setIsEditing(false);
      // Usunięto wywołanie fetchGradebookExams
    }
  }, [examId, fetchExamInfo, fetchExamQuestions, fetchParticipants, fetchGradebookExams, resetExamData]);

  useEffect(() => {
    sessionStorage.setItem('examData', JSON.stringify(examData));
  }, [examData]);

  const isLoading = loadingCount > 0;

  return (
    <ExamCreationContext.Provider value={{ 
      examData, 
      updateExamData, 
      resetExamData, 
      addQuestion, 
      updateQuestion, 
      removeQuestion,
      fetchExamQuestions, 
      addSelectedClass, 
      removeSelectedClass, 
      addSelectedStudent, 
      removeSelectedStudent, 
      fetchGradebookExams,
      isEditing,
      fetchExamInfo,
      fetchParticipants, 
      fetchParticipantsForNewExam,
      setIsEditing,
      initialSelectedClasses,
      initialSelectedStudents,
      error,
      loading: isLoading,
      examId 
    }}>
      {children}
    </ExamCreationContext.Provider>
  );
};
