// src/app/page.tsx
'use client'; // <--- ¡Importante! Añadir esto para usar hooks y efectos

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconChartBar, IconCoin, IconCreditCard, IconReceipt, IconTarget } from "@tabler/icons-react";
// --- Importar el componente del efecto ---
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"; // Ajusta la ruta si es diferente

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir al dashboard si el usuario ya está autenticado
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Si está cargando o ya está autenticado, no mostrar nada aún
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, no mostramos el contenido de la página de inicio
  // porque la redirección ya se encargará de llevarlo al dashboard
  if (status === "authenticated") {
    return null;
  }

  // --- Definir las palabras para el efecto ---
  const typewriterWords = [
    {
      text: "FinanWaken",
      // --- Añadir clases de Tailwind para el color verde ---
      className: "text-green-600 dark:text-green-500", // Puedes ajustar el tono de verde
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center my-12">

        {/* --- Reemplazar H1 con TypewriterEffectSmooth --- */}
        <TypewriterEffectSmooth
          words={typewriterWords}
          // Aplicar los estilos del H1 original al componente
          className="text-4xl md:text-6xl font-bold tracking-tight"
          // Opcional: Estilizar el cursor también con un color verde
          cursorClassName="bg-green-600 dark:bg-green-500"
        />
        {/* Ya no necesitamos el H1 estático:
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          FinanWaken
        </h1>
        */}

        <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
          Tu aplicación personal para el control y seguimiento de finanzas. Administra gastos, ingresos, deudas y metas de ahorro en un solo lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" asChild>
            <Link href="/register">Comenzar Gratis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="my-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Todo lo que necesitas para controlar tus finanzas
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<IconReceipt className="h-10 w-10 text-red-500" />}
            title="Control de Gastos"
            description="Registra y categoriza todos tus gastos para entender hacia dónde va tu dinero."
          />
          <FeatureCard
            icon={<IconCoin className="h-10 w-10 text-green-500" />}
            title="Seguimiento de Ingresos"
            description="Administra tus fuentes de ingreso y mantén un registro claro de tu flujo de dinero."
          />
          <FeatureCard
            icon={<IconCreditCard className="h-10 w-10 text-orange-500" />}
            title="Gestión de Deudas"
            description="Controla tus deudas, establece fechas de pago y visualiza tu progreso hacia la libertad financiera."
          />
          <FeatureCard
            icon={<IconTarget className="h-10 w-10 text-blue-500" />}
            title="Metas de Ahorro"
            description="Define objetivos financieros y monitorea tu avance para hacerlos realidad."
          />
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="my-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Visualiza tus finanzas con claridad
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
          Nuestro dashboard intuitivo te muestra un panorama completo de tu situación financiera.
        </p>
        <div className="rounded-lg overflow-hidden border shadow-lg">
          <div className="bg-card p-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Dashboard Financiero</h3>
            <IconChartBar className="h-6 w-6 text-purple-500" />
          </div>
          <div className="bg-background p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Balance Mensual" value="+$1,540.00" positive />
              <StatCard label="Ingresos" value="$4,200.00" />
              <StatCard label="Gastos" value="$2,660.00" />
              <StatCard label="Ahorros" value="$12,450.00" />
            </div>
            <div className="mt-8 h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Visualización de gráficos y estadísticas</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="my-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Comienza a controlar tus finanzas hoy
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Regístrate gratis y da el primer paso hacia la estabilidad financiera y el cumplimiento de tus metas.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Comenzar Ahora</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} FinanWaken - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

// --- Los componentes FeatureCard y StatCard se mantienen igual ---
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-card rounded-lg p-4 border">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold ${positive ? "text-green-500" : ""}`}>{value}</p>
    </div>
  );
}