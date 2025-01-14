import  Button  from './Button';
import { useNavigate } from 'react-router-dom';
import { Clock3, ScrollText } from 'lucide-react';
import ExamTag from './ExamTag';
import { Pen } from 'lucide-react';

export default function ExamCard({
  type,
  endDate,
  startDate,
  title,
  description,
  questionsCount,
  duration,
  examId
}) {
    const typeClasses = {
      starting: ' border-accent1-500 text-accent1-500',
      active: 'border-success-700 text-success-700',
      ended: 'border-primary-500 text-primary-500'
    }

    const typeMessages = {
      starting: 'Starting',
      active: 'Active',
      ended: 'Ended'
    }

    const typeClass = typeClasses[type] || typeClasses.starting;
    const typeMessage = typeMessages[type] || typeMessages.starting;

    const navigate = useNavigate();

    const handleViewResults = () => {
      navigate(`/AboutExam?exam_id=${examId}`);
    };

    return (
      <div className="w-full 2xl:w-[calc(50%-16px)] border-solid border rounded border-t-textBg-300 p-6">
        <div className="flex items-center justify-between">
          <p className={`text-sm border-solid border rounded ${typeClass} px-3 w-fit`}>
           {typeMessage}
          </p>
          <p className="max-[430px]:hidden text-xs text-textBg-700">{typeMessage}: {typeMessage === typeMessages.active ? `${startDate} - ${endDate}` : typeMessage === typeMessages.ended ? `${endDate}` : `${startDate}`}</p>
        </div>
        <p className="text-textBg-700 text-3xl font-epilogue font-bold my-3 hover:cursor-pointer">{title}</p>
        <p className="webkit-box webkit-line-clamp-2 webkit-box-orient-vertical overflow-hidden text-textBg-700 text-base">
          {description}
        </p>
        <div className='flex justify-between mt-8 flex-wrap gap-y-4'>
          <div className='flex gap-4 flex-wrap'> 
            <ExamTag text={`${questionsCount} questions`} icon={<ScrollText size={16} />} />
            <ExamTag text={`${duration} min`} icon={<Clock3 size={16} />} />
          </div>

          <div className='flex gap-4 flex-wrap w-full sm:w-fit'> 
            {/* <Button size="m" icon={<Pen size={16} />} className={'px-0 min-w-9 max-w-9'} type="secondary"/> */}
            <Button size="m" text="View Exam Info" className={'w-full sm:w-fit'} onClick={handleViewResults}/>
          </div>
        </div>
      </div>
    );
  }
  