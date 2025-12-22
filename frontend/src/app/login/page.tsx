import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-goban-pattern p-4 relative overflow-hidden">
      
      {/* Fondo decorativo (Abstracto) */}
      <div className="absolute inset-0 bg-mexican-hero opacity-5 z-0"></div>
      
      {/* Círculos flotantes (Piedras de Go abstractas) */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-amgo-green opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amgo-red opacity-5 rounded-full blur-3xl"></div>

      <div className="z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}