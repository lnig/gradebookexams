import img from '../assets/success.svg'
import Button from '../components/Button';
import { useNavigate } from "react-router-dom";

export default function SuccessfullyCreateExam(){
    const navigate = useNavigate();

    const handleHomeButton = () => {
        navigate(`/`);
      };

    return(
        <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-4 sm:px-8 h-max">
            <div className='flex flex-col justify-center items-center 2xl:flex-row'>
                <div className="w-full sm:w-3/4 md:w-2/4 lg:w-3/5 xl:w-2/4 2xl:w-4/6">
                    <img src={img} className="w-full h-auto" />
                </div>
                <div className='flex flex-col justify-center items-center mt-8 px-4 sm:px-0\12'>
                    <p className='text-primary-500 text-2xl 2xl:text-4xl font-bold'>Congratulations!</p>
                    <p className='text-textBg-700 text-xl 2xl:text-3xl text-center my-4'>
                        The exam has been successfully created. You can now proceed with its realization.
                    </p>
                    <Button text="Back to Home" size="xl" onClick={handleHomeButton} className={'w-full sm:w-fit'} />
                </div>
            </div>           
        </main>
    );
}
