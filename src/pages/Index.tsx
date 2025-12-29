import { BulgarianCalendar } from '@/components/BulgarianCalendar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
            Български календар
          </h1>
          <p className="text-lg text-muted-foreground">
            Декември 2025 – Януари 2027
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Национални, православни и неработни дни
          </p>
        </header>

        {/* Calendar */}
        <main>
          <BulgarianCalendar />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2025 Български календар</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
