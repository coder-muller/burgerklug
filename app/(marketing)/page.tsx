import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold">
            Burger Klug
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            O app de controle de vendas do Burger Klug
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Link href="/sign-in">
            <Button variant="outline">
              Entrar
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="group">
              Começar agora
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
