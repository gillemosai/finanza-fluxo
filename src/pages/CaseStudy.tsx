import { motion } from "framer-motion";
import { ArrowLeft, Target, Users, Lightbulb, Palette, CheckCircle, ArrowRight, Mail, Linkedin, Github, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import logoFinanza from "@/assets/logo-finanza.png";
import phoneMockup from "@/assets/case-study-phones.png";
import gilProfile from "@/assets/gil-profile.png";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CaseStudy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-6 text-center z-10"
        >
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
            Estudo de Caso UX/UI
          </Badge>
          
          {/* Phone Mockup */}
          <motion.div 
            className="relative mx-auto mb-8 max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <img 
              src={phoneMockup} 
              alt="Finanza App Mockup em celulares" 
              className="w-full h-auto max-h-80 object-contain"
            />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Finanza
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Transformando a maneira como as pessoas controlam suas finanças pessoais
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              UX Research
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              UI Design
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Desenvolvimento
            </span>
          </div>
        </motion.div>
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
        </motion.div>
      </section>

      {/* Project Overview */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Visão Geral</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Sobre o Projeto
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp}>
                <h3 className="text-2xl font-semibold text-foreground mb-4">O Produto</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  O Finanza é um aplicativo web de controle financeiro pessoal que permite 
                  aos usuários gerenciar suas receitas, despesas, dívidas e saldos bancários 
                  de forma intuitiva e visual. Desenvolvido para pessoas que desejam ter 
                  clareza sobre sua situação financeira sem complicações.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>React</Badge>
                  <Badge>TypeScript</Badge>
                  <Badge>Tailwind CSS</Badge>
                  <Badge>Supabase</Badge>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-2">Duração do Projeto</h4>
                    <p className="text-muted-foreground">Novembro 2024 - Dezembro 2024</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-2">Minha Função</h4>
                    <p className="text-muted-foreground">UX Designer & Desenvolvedor Vibe Coding</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-2">Responsabilidades</h4>
                    <p className="text-muted-foreground">
                      Pesquisa de usuário, wireframing, prototipagem, design de interface, 
                      desenvolvimento front-end e back-end, testes de usabilidade
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem & Goal */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">O Problema</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Muitas pessoas têm dificuldade em controlar suas finanças pessoais. 
                  Elas perdem de vista quanto ganham, quanto gastam, e acabam sem saber 
                  para onde vai o dinheiro no final do mês. Planilhas são complicadas 
                  e aplicativos existentes são complexos demais para o uso diário.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">O Objetivo</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Criar uma solução simples, visual e acessível que permita a qualquer 
                  pessoa ter controle total sobre suas finanças. O Finanza foi projetado 
                  para ser intuitivo, eliminando barreiras e tornando a gestão financeira 
                  uma tarefa natural do dia a dia.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Research */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Pesquisa de Usuário</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Entendendo as Necessidades
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Realizamos entrevistas e pesquisas para compreender os desafios reais 
                enfrentados pelos usuários no gerenciamento de suas finanças.
              </p>
            </motion.div>

            {/* Pain Points */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                Pontos de Dor Identificados
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    number: "01",
                    title: "Complexidade",
                    description: "Planilhas e apps existentes são difíceis de usar e manter atualizados"
                  },
                  {
                    number: "02",
                    title: "Falta de Visão",
                    description: "Dificuldade em visualizar para onde o dinheiro está indo"
                  },
                  {
                    number: "03",
                    title: "Tempo",
                    description: "Registro manual de transações demanda muito tempo"
                  },
                  {
                    number: "04",
                    title: "Desorganização",
                    description: "Informações espalhadas em vários lugares sem centralização"
                  }
                ].map((point) => (
                  <Card key={point.number} className="border-t-4 border-t-destructive/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <span className="text-4xl font-bold text-destructive/20">{point.number}</span>
                      <h4 className="text-lg font-semibold text-foreground mt-2 mb-2">{point.title}</h4>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Personas */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                Personas
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                          J
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-foreground">João Silva</h4>
                          <p className="text-muted-foreground">32 anos, Analista de TI</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <blockquote className="italic text-muted-foreground border-l-4 border-primary pl-4">
                        "Eu sei que ganho bem, mas nunca consigo guardar dinheiro no final do mês."
                      </blockquote>
                      <div>
                        <h5 className="font-semibold text-foreground mb-2">Objetivos</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Entender seus gastos mensais</li>
                          <li>• Conseguir economizar para uma viagem</li>
                          <li>• Ter controle sem perder muito tempo</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground mb-2">Frustrações</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Apps muito complexos com muitas funcionalidades</li>
                          <li>• Não consegue manter planilhas atualizadas</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-secondary/40 to-secondary/10 p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center text-2xl font-bold text-secondary-foreground">
                          M
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-foreground">Maria Oliveira</h4>
                          <p className="text-muted-foreground">45 anos, Professora</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <blockquote className="italic text-muted-foreground border-l-4 border-secondary pl-4">
                        "Preciso de algo simples que me mostre se estou no vermelho ou no azul."
                      </blockquote>
                      <div>
                        <h5 className="font-semibold text-foreground mb-2">Objetivos</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Pagar suas dívidas</li>
                          <li>• Ter uma visão clara do saldo</li>
                          <li>• Interface simples e direta</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground mb-2">Frustrações</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Tecnologia intimida</li>
                          <li>• Não sabe por onde começar</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Design Process */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Processo de Design</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Do Conceito à Realidade
              </h2>
            </motion.div>

            {/* Design Decisions */}
            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Palette,
                  title: "Design System",
                  items: [
                    "Cores semânticas (verde=receita, vermelho=despesa)",
                    "Tipografia clara e legível",
                    "Componentes reutilizáveis",
                    "Tema claro e escuro"
                  ]
                },
                {
                  icon: Users,
                  title: "Foco no Usuário",
                  items: [
                    "Dashboard como tela principal",
                    "Filtro global por mês",
                    "Ações com poucos cliques",
                    "Feedback visual imediato"
                  ]
                },
                {
                  icon: CheckCircle,
                  title: "Acessibilidade",
                  items: [
                    "Conformidade WCAG 2.1 AA",
                    "Tamanhos de fonte ajustáveis",
                    "Alto contraste disponível",
                    "Navegação por teclado"
                  ]
                }
              ].map((section) => (
                <Card key={section.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground mb-4">{section.title}</h4>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Key Features */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                Funcionalidades Principais
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Dashboard Visual", desc: "Gráficos interativos com visão geral das finanças" },
                  { title: "Gestão de Receitas", desc: "Cadastro e categorização de todas as entradas" },
                  { title: "Controle de Despesas", desc: "Acompanhamento detalhado dos gastos" },
                  { title: "Gestão de Dívidas", desc: "Monitoramento de valores a pagar" },
                  { title: "Saldos Bancários", desc: "Visualização consolidada de todas as contas" },
                  { title: "Cartões de Crédito", desc: "Controle de faturas e vencimentos" },
                  { title: "Relatórios", desc: "Exportação para Excel e PDF" },
                  { title: "Replicação de Dados", desc: "Copiar transações entre meses" }
                ].map((feature) => (
                  <Card key={feature.title} className="text-center hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Acessibilidade</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Design para Todos
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8">
              <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl font-bold text-primary mb-4 block">01</span>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Contraste e Cores</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementação de modo de alto contraste e cores que atendem às 
                    diretrizes WCAG para garantir legibilidade para todos os usuários.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl font-bold text-primary mb-4 block">02</span>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Navegação por Teclado</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas as funcionalidades são acessíveis via teclado, com indicadores 
                    de foco visíveis e Skip Links para navegação rápida.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl font-bold text-primary mb-4 block">03</span>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Personalização</h4>
                  <p className="text-sm text-muted-foreground">
                    Opções de ajuste de tamanho de fonte, redução de movimento e 
                    modo de leitor de tela para atender diferentes necessidades.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Takeaways & Next Steps */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Conclusão</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Aprendizados e Próximos Passos
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-6">Impacto</h3>
                    <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-4 mb-6">
                      "Finalmente consigo ver para onde meu dinheiro vai. O app é tão 
                      simples que uso todos os dias sem esforço."
                    </blockquote>
                    <p className="text-muted-foreground">
                      O Finanza conseguiu entregar uma solução que equilibra simplicidade 
                      e funcionalidade, permitindo que usuários de diferentes níveis de 
                      familiaridade com tecnologia possam gerenciar suas finanças com confiança.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-6">O Que Aprendi</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          A importância de ouvir os usuários antes de definir funcionalidades
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Simplicidade é mais difícil de alcançar do que complexidade
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Acessibilidade deve ser considerada desde o início do projeto
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Design iterativo baseado em feedback gera melhores resultados
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="mt-12">
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                Próximos Passos
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <span className="text-3xl font-bold text-primary/30">01</span>
                    <h4 className="text-lg font-semibold text-foreground mt-2 mb-2">
                      Integração Bancária
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Conectar com APIs de bancos para importação automática de transações.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <span className="text-3xl font-bold text-primary/30">02</span>
                    <h4 className="text-lg font-semibold text-foreground mt-2 mb-2">
                      App Mobile
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Desenvolver versão nativa para iOS e Android com notificações push.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <span className="text-3xl font-bold text-primary/30">03</span>
                    <h4 className="text-lg font-semibold text-foreground mt-2 mb-2">
                      Metas Financeiras
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Adicionar funcionalidade de definição e acompanhamento de objetivos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-center gap-12">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="relative"
                >
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl">
                    <img 
                      src={gilProfile} 
                      alt="Gil - UX Designer & Desenvolvedor" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xl">👋</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Contact Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                  Vamos Conversar?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Se você gostou deste projeto ou tem interesse em colaborar, 
                  ficarei feliz em conversar!
                </p>
                <div className="flex justify-center md:justify-start gap-4 flex-wrap">
                  <Button 
                    size="lg" 
                    className="gap-2"
                    onClick={() => window.open("https://www.instagram.com/gillemosai/", "_blank")}
                  >
                    <Instagram className="w-4 h-4" />
                    Entre em Contato
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open("https://www.linkedin.com/in/gillemosai/", "_blank")}
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open("https://github.com/gillemosai", "_blank")}
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Back to App Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button 
          onClick={() => navigate("/auth")} 
          variant="secondary" 
          size="sm"
          className="shadow-lg gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao App
        </Button>
      </div>
    </div>
  );
};

export default CaseStudy;
