import { CreateRoomForm } from "@/components/home/create-room-form";
import { JoinRoomForm } from "@/components/home/join-room-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link2, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center">
          <h1 className="text-4xl text-primary font-bold">Planning Poker</h1>
        </div>
      </header>

      <section className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <p className="text-lg text-center text-muted-foreground text-pretty">
            Crie uma sala, compartilhe o link e comece a estimar com seu time.
            Sem cadastro, sem complicação.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <CreateRoomForm />
            <JoinRoomForm />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Tempo Real</CardTitle>
              <CardDescription>
                Votações sincronizadas instantaneamente entre todos os
                participantes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Link2 className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Sem Cadastro</CardTitle>
              <CardDescription>
                Crie uma sala e compartilhe o link. Simples assim.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Colaborativo</CardTitle>
              <CardDescription>
                Convide seu time com um código simples e comece a estimar
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            Como Funciona
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h4 className="font-semibold text-lg">Crie uma Sala</h4>
              <p className="text-muted-foreground text-sm">
                Informe o nome da sala e seu nome. Receba um código para
                compartilhar
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h4 className="font-semibold text-lg">Compartilhe o Link</h4>
              <p className="text-muted-foreground text-sm">
                Envie o link ou código para seu time. Eles entram informando
                apenas o nome
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h4 className="font-semibold text-lg">Vote e Revele</h4>
              <p className="text-muted-foreground text-sm">
                Todos votam simultaneamente e revelam juntos para consenso
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
