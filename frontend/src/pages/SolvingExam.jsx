import React, { useEffect, useState, useRef, useCallback } from "react";
import Button from "../components/Button";
import PageTitle from "../components/PageTitle";
import QuestionOnSolving from "../components/QuestionOnSolving";
import QuestionList from "../components/QuestionList";
import { AlarmCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken } from "../utils/UserRoleUtils";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_EXAMS_URL } from "../utils/config";

// Klucze w localStorage
const EXIT_TIME_KEY = "exitTime";
const EXAM_ID_KEY = "examId";
const ATTEMPT_ID_KEY = "attemptId";
const TITLE_KEY = "title";
const QUESTIONS_KEY = "questions";
const ANSWERS_KEY = "answers";
const END_TIME_KEY = "endTime";
const ALLOW_NAV_KEY = "allowNavigation";
const END_TEST_KEY = "end_test_after_leaving_window";

export function SolvingExam() {
  const token = getToken();
  const navigate = useNavigate();
  const location = useLocation();

  const [examId, setExamId] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [title, setTitle] = useState("Exam Title");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({ closed_answers: [], open_answers: [] });
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [block_copying_pasting, setBlockCopyingPasting] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [end_test_after_leaving_window, setEnd_test_after_leaving_window] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const paramExamId = queryParams.get("exam_id");

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const isAttemptEndedRef = useRef(false);

  const timerIdRef = useRef(null);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mm = m < 10 ? `0${m}` : m;
    const ss = s < 10 ? `0${s}` : s;
    return `${mm}:${ss}`;
  }, []);

  const clearExamLocalStorage = () => {
    localStorage.removeItem(EXAM_ID_KEY);
    localStorage.removeItem(ATTEMPT_ID_KEY);
    localStorage.removeItem(TITLE_KEY);
    localStorage.removeItem(QUESTIONS_KEY);
    localStorage.removeItem(ANSWERS_KEY);
    localStorage.removeItem(END_TIME_KEY);
    localStorage.removeItem(ALLOW_NAV_KEY);
    localStorage.removeItem(END_TEST_KEY);
    localStorage.removeItem(EXIT_TIME_KEY);
  };

  const saveExitTime = useCallback(() => {
    if (!isAttemptEndedRef.current) {
      localStorage.setItem(EXIT_TIME_KEY, String(Date.now()));
    }
  }, []);

  const fetchExamData = useCallback(
    async (examId) => {
      setLoading(true);
      setError(null);
      
      try {
        const noCacheParam = `?ts=${Date.now()}`;
        const resp = await fetch(`${API_EXAMS_URL}/exams/${examId}/startAttempt${noCacheParam}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) {
          const errData = await resp.json();
          throw new Error(errData.message || "Failed to fetch exam.");
        }
        let data = await resp.json();
        let attemptData = data.data;

        setExamId(examId);
        setAttemptId(attemptData.attempt_id);
        setTitle(attemptData.title || "Exam Title");
        setQuestions(attemptData.questions || []);
        setAnswers({ closed_answers: [], open_answers: [] });
        setAllowNavigation(!!attemptData.allow_navigation);
        setEnd_test_after_leaving_window(!!attemptData.end_test_after_leaving_window);
        setBlockCopyingPasting(attemptData.block_copying_pasting);

        const newEndTime = Date.now() + attemptData.time_for_exam * 60_000;
        setEndTime(newEndTime);
        setTimeLeft(attemptData.time_for_exam * 60);

        const tmpAnswered = new Array(attemptData.questions.length).fill(false);
        setAnsweredQuestions(tmpAnswered);

        localStorage.setItem(EXAM_ID_KEY, examId);
        localStorage.setItem(ATTEMPT_ID_KEY, attemptData.attempt_id);
        localStorage.setItem(TITLE_KEY, attemptData.title || "Exam Title");
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(attemptData.questions));
        localStorage.setItem(ANSWERS_KEY, JSON.stringify({ closed_answers: [], open_answers: [] }));
        localStorage.setItem(END_TIME_KEY, String(newEndTime));
        localStorage.setItem(ALLOW_NAV_KEY, String(attemptData.allow_navigation));
        localStorage.setItem(END_TEST_KEY, String(attemptData.end_test_after_leaving_window));

        attemptData = null;
        data = null;

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
        toast.error(err.message || "An unexpected error has occurred.");
      }
    },
    [token]
  );

  const handleEndAttempt = useCallback(
    async (isTimeUp = false, finalAnswers = answersRef.current) => {
      if (isAttemptEndedRef.current) return;
      isAttemptEndedRef.current = true;

      if (!attemptId) {
        return;
      }

      try {
        const resp = await fetch(`${API_EXAMS_URL}/exams/saveAttempt/${attemptId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(finalAnswers),
        });

        if (!resp.ok) {
          const errData = await resp.json();
          throw new Error(errData.message || "Failed to save exam attempt.");
        }

        if (isTimeUp) {
          toast.success("Time's up! Your attempt has been automatically saved.");
        } else {
          toast.success("Your attempt has been saved.");
        }

        clearExamLocalStorage();
        navigate(`/AboutExam?exam_id=${examId}`);
      } catch (err) {
        console.error("Error saving attempt:", err);
        setError(err.message);
        toast.error(err.message || "An unexpected error occurred.");
      }
    },
    [examId, attemptId, token, navigate]
  );

  useEffect(() => {
    if (!paramExamId) {
      setError("No exam ID provided.");
      setLoading(false);
      return;
    }

    (async () => {
      const storedExamId = localStorage.getItem(EXAM_ID_KEY);
      const storedAttemptId = localStorage.getItem(ATTEMPT_ID_KEY);
      const storedTitle = localStorage.getItem(TITLE_KEY);
      const storedQuestions = localStorage.getItem(QUESTIONS_KEY);
      const storedAnswers = localStorage.getItem(ANSWERS_KEY);
      const storedEndTime = localStorage.getItem(END_TIME_KEY);
      const storedAllowNav = localStorage.getItem(ALLOW_NAV_KEY);
      const storedEndAfterLeaving = localStorage.getItem(END_TEST_KEY);

      if (
        storedExamId === paramExamId &&
        storedAttemptId &&
        storedQuestions &&
        storedAnswers &&
        storedEndTime &&
        storedAllowNav &&
        storedEndAfterLeaving != true
      ) {
        setExamId(storedExamId);
        setAttemptId(storedAttemptId);
        setTitle(storedTitle || "Exam from localStorage");
        setQuestions(JSON.parse(storedQuestions));
        setAnswers(JSON.parse(storedAnswers));
        setEndTime(parseInt(storedEndTime, 10));
        setAllowNavigation(storedAllowNav === "true");
        setEnd_test_after_leaving_window(storedEndAfterLeaving === "true");

        const remain = Math.floor((parseInt(storedEndTime, 10) - Date.now()) / 1000);
        setTimeLeft(remain > 0 ? remain : 0);

        const qLen = JSON.parse(storedQuestions).length;
        setAnsweredQuestions(new Array(qLen).fill(false));

        setLoading(false);
      } else {
        clearExamLocalStorage();
        await fetchExamData(paramExamId);
      }
    })();
  }, [paramExamId, fetchExamData]);

  useEffect(() => {
    if (loading || !endTime) return;

    const timerTick = () => {
      const now = Date.now();
      const remainSec = Math.floor((endTime - now) / 1000);
      if (remainSec <= 0) {
        setTimeLeft(0);
        handleEndAttempt(true, answersRef.current);
        if (timerIdRef.current) clearInterval(timerIdRef.current);
      } else {
        setTimeLeft(remainSec);
      }
    };

    timerTick();
    timerIdRef.current = setInterval(timerTick, 1000);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [endTime, loading, handleEndAttempt]);

  useEffect(() => {
    if (loading || !attemptId) return;

    const storedExitTime = localStorage.getItem(EXIT_TIME_KEY);
    if (!storedExitTime) return;

    const exitTs = parseInt(storedExitTime, 10);
    const now = Date.now();
    const diff = (now - exitTs) / 1000;

    if (diff > 10) {
      toast.error("You left for more than 10s, attempt saved.");
      handleEndAttempt(true, answersRef.current);
      clearExamLocalStorage();
    } else {
      localStorage.removeItem(EXIT_TIME_KEY);
    }
  }, [loading, attemptId, handleEndAttempt]);

  useEffect(() => {
    if (loading) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden" && end_test_after_leaving_window) {
        toast.error("You left the window, attempt saved.");
        await handleEndAttempt(false, answersRef.current);
        clearExamLocalStorage();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, end_test_after_leaving_window, handleEndAttempt]);

  useEffect(() => {
    if (loading) return;

    const handleUnloadOrPageHide = () => {
      if (!isAttemptEndedRef.current) {
        if (end_test_after_leaving_window) {
          clearExamLocalStorage();
          toast.error("You left the window, attempt saved and ended.");
          handleEndAttempt(false, answersRef.current);
        } else {
          saveExitTime();
        }
      }
    };

    window.addEventListener("beforeunload", handleUnloadOrPageHide);
    window.addEventListener("pagehide", handleUnloadOrPageHide);

    return () => {
      window.removeEventListener("beforeunload", handleUnloadOrPageHide);
      window.removeEventListener("pagehide", handleUnloadOrPageHide);
    };
  }, [loading, end_test_after_leaving_window, handleEndAttempt, saveExitTime]);

  useEffect(() => {
    if (loading) return;

    return () => {
      if (!isAttemptEndedRef.current && attemptId) {
        if (end_test_after_leaving_window) {
          handleEndAttempt(false, answersRef.current);
          clearExamLocalStorage();
        } else {
          saveExitTime();
        }
      }
    };
  }, [loading, end_test_after_leaving_window, handleEndAttempt, saveExitTime, attemptId]);

  useEffect(() => {
    if (!block_copying_pasting) return;

    const handleCopy = (e) => {
      e.preventDefault();
      alert("Copying text is disabled during the exam.");
    };
    const handlePaste = (e) => {
      e.preventDefault();
      alert("Pasting text is disabled during the exam.");
    };
    const handleCut = (e) => {
      e.preventDefault();
      alert("Cutting text is disabled during the exam.");
    };
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert("Context menu is disabled during the exam.");
    };
    const handleSelectStart = (e) => {
      e.preventDefault();
      alert("Selecting text is disabled during the exam.");
    };

    window.addEventListener("copy", handleCopy);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("cut", handleCut);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("selectstart", handleSelectStart);

    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("cut", handleCut);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("selectstart", handleSelectStart);
      document.body.style.userSelect = "auto";
    };
  }, [block_copying_pasting]);

  const handleAnswerChange = (selectedAnswerIds, question) => {
    const newAnswers = { ...answersRef.current };
    let isAnswered = false;

    if (question.type === "CLOSED") {
      const filtered = newAnswers.closed_answers.filter((ca) => ca.closed_question_id !== question.id);
      if (Array.isArray(selectedAnswerIds) && selectedAnswerIds.length > 0) {
        selectedAnswerIds.forEach((ansId) => {
          filtered.push({
            closed_question_id: question.id,
            closed_answer_id: ansId,
          });
        });
        isAnswered = true;
      }
      newAnswers.closed_answers = filtered;
    } else {
      const openFiltered = [...newAnswers.open_answers];
      const idx = openFiltered.findIndex((oa) => oa.open_question_id === question.id);
      if (idx >= 0) {
        openFiltered[idx].description = selectedAnswerIds;
      } else {
        openFiltered.push({
          open_question_id: question.id,
          description: selectedAnswerIds,
        });
      }
      isAnswered = selectedAnswerIds.trim().length > 0;
      newAnswers.open_answers = openFiltered;
    }

    setAnswers(newAnswers);
    answersRef.current = newAnswers;
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(newAnswers));

    const indexQ = questions.findIndex((q) => q.id === question.id);
    if (indexQ >= 0) {
      const answered = [...answeredQuestions];
      answered[indexQ] = isAnswered;
      setAnsweredQuestions(answered);
    }
  };

  const handleSubmitExam = async () => {
    await handleEndAttempt(false, answersRef.current);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitExam();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading exam details...</p>;
  }

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <div className="flex flex-col md:flex-row md:justify-between w-full">
        <PageTitle text={title} />
        <div className="flex gap-2 w-fit text-success-700 font-semibold mt-3">
          <AlarmCheck size={24} />
          <p className="ml-1">
            {endTime ? formatTime(Math.floor((endTime - Date.now()) / 1000)) : "00:00"} left
          </p>
        </div>
      </div>

      <div className="flex w-full gap-8 lg:gap-16 mt-8">
        <div className="flex-1">
          <div className="border border-solid rounded p-4 mb-6">
            {questions.length > 0 ? (
              <QuestionOnSolving
                key={questions[currentQuestionIndex].id}
                number={`Question ${currentQuestionIndex + 1}`}
                type={questions[currentQuestionIndex].type === "CLOSED" ? "Multiple" : "Long"}
                answers={questions[currentQuestionIndex].answers || []}
                description={questions[currentQuestionIndex].description}
                score={questions[currentQuestionIndex].score}
                is_multiple={questions[currentQuestionIndex].is_multiple}
                value={
                  questions[currentQuestionIndex].type === "CLOSED"
                    ? answers.closed_answers
                        .filter((ca) => ca.closed_question_id === questions[currentQuestionIndex].id)
                        .map((ca) => ca.closed_answer_id)
                    : answers.open_answers.find(
                        (oa) => oa.open_question_id === questions[currentQuestionIndex].id
                      )?.description || ""
                }
                solving={true}
                disabled={false}
                onAnswerChange={(vals) => handleAnswerChange(vals, questions[currentQuestionIndex])}
              />
            ) : (
              <p>No questions available.</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            {allowNavigation && (
              <Button
                text="Previous"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              />
            )}
            <Button
              text={currentQuestionIndex < questions.length - 1 ? "Next" : "Submit"}
              onClick={handleNext}
            />
          </div>
        </div>

        <QuestionList
          questions={questions}
          answeredQuestions={answeredQuestions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          disableNavigation={!allowNavigation}
        />
      </div>

      <div className="flex mt-8 justify-end">
        <Button 
          text="Submit Now" 
          onClick={handleSubmitExam} 
          type="link"
        />
      </div>
    </main>
  );
}

export default SolvingExam;
