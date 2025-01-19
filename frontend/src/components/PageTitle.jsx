export default function PageTitle({text}){
    return (
        <p className={`text-2xl text-textBg-700 sm:text-3xl font-bold mb-8 mt-4 lg:mt-1`}>{text}</p>
    );
}