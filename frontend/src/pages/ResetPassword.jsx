import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { toast } from 'react-toastify';
import { decodeToken } from '../utils/UserRoleUtils';
import { API_GRADEBOOK_URL } from '../utils/config';

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const user = decodeToken();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Hasła muszą być identyczne!");
      return;
    }

    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Hasło zostało zresetowane!');
        navigate('/login');
      } else {
        toast.error(data.message || 'Wystąpił błąd przy resetowaniu hasła.');
      }
    } catch (error) {
      toast.error('Wystąpił błąd przy resetowaniu hasła.');
    }
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-white overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 2xl:gap-24 z-10 px-4">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl sm:text-4xl font-normal text-textBg-600 mb-4">
            Resetowanie hasła
          </h2>
          <p className="text-textBg-500 text-base">
            Wpisz nowe hasło, aby ustawić nowe dane logowania.
          </p>
        </div>

        <div className="rounded-md px-8 py-24 border-primary-500 bg-white w-full max-w-md shadow-xl">
          <h2 className="font-epilogue text-3xl font-bold text-center mb-8 text-textBg-900">
            Nowe Hasło
          </h2>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
            <div className="flex flex-col justify-center gap-[2px] w-full bg-textBg-200 px-3 py-0 h-12 rounded-md">
              <label htmlFor="password" className="block text-sm font-medium text-textBg-700">
                Nowe hasło
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-textBg-400"
                placeholder="Wpisz nowe hasło"
                required
              />
            </div>
            <div className="flex flex-col justify-center gap-[2px] w-full bg-textBg-200 px-3 py-0 h-12 rounded-md">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-textBg-700">
                Potwierdź hasło
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-textBg-400"
                placeholder="Powtórz nowe hasło"
                required
              />
            </div>
            <Button
              text="Zresetuj hasło"
              type="submit"
              className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition"
            />
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => navigate('/login')} className="text-primary-500 hover:underline text-sm">
              Powrót do logowania
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float-reverse {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ResetPassword;
