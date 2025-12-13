import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Target, Plus, Trash2, Edit2, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { EmojiTooltip } from "@/components/EmojiTooltip";

interface Meta {
  id: string;
  titulo: string;
  descricao: string | null;
  valor_objetivo: number;
  valor_atual: number;
  data_limite: string | null;
  icone: string;
  cor: string;
  categoria: string;
  status: string;
}

const CATEGORIAS = [
  { value: "viagem", label: "Viagem", emoji: "✈️" },
  { value: "carro", label: "Carro", emoji: "🚗" },
  { value: "casa", label: "Casa", emoji: "🏠" },
  { value: "educacao", label: "Educação", emoji: "📚" },
  { value: "emergencia", label: "Reserva de Emergência", emoji: "🛡️" },
  { value: "aposentadoria", label: "Aposentadoria", emoji: "🏖️" },
  { value: "tecnologia", label: "Tecnologia", emoji: "💻" },
  { value: "saude", label: "Saúde", emoji: "🏥" },
  { value: "outro", label: "Outro", emoji: "🎯" },
];

const EMOJIS = ["🎯", "✈️", "🚗", "🏠", "📚", "🛡️", "🏖️", "💻", "🏥", "💰", "🎉", "⭐", "🚀", "💎", "🎁", "🏆"];

const CORES = [
  "#8B5CF6", "#F59E0B", "#10B981", "#3B82F6", "#EF4444",
  "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#84CC16",
];

export default function Metas() {
  const { user } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  
  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorObjetivo, setValorObjetivo] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [icone, setIcone] = useState("🎯");
  const [cor, setCor] = useState("#8B5CF6");
  const [categoria, setCategoria] = useState("outro");

  useEffect(() => {
    if (user) {
      fetchMetas();
    }
  }, [user]);

  const fetchMetas = async () => {
    try {
      const { data, error } = await supabase
        .from('metas_financeiras')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMetas(data || []);
    } catch (error) {
      console.error('Error fetching metas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas metas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setValorObjetivo("");
    setValorAtual("");
    setDataLimite("");
    setIcone("🎯");
    setCor("#8B5CF6");
    setCategoria("outro");
    setEditingMeta(null);
  };

  const openEditDialog = (meta: Meta) => {
    setEditingMeta(meta);
    setTitulo(meta.titulo);
    setDescricao(meta.descricao || "");
    setValorObjetivo(meta.valor_objetivo.toString());
    setValorAtual(meta.valor_atual.toString());
    setDataLimite(meta.data_limite || "");
    setIcone(meta.icone);
    setCor(meta.cor);
    setCategoria(meta.categoria);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!titulo || !valorObjetivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o valor objetivo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const metaData = {
        titulo,
        descricao: descricao || null,
        valor_objetivo: parseFloat(valorObjetivo),
        valor_atual: parseFloat(valorAtual) || 0,
        data_limite: dataLimite || null,
        icone,
        cor,
        categoria,
        user_id: user?.id,
        status: parseFloat(valorAtual) >= parseFloat(valorObjetivo) ? 'concluida' : 'em_progresso',
      };

      if (editingMeta) {
        const { error } = await supabase
          .from('metas_financeiras')
          .update(metaData)
          .eq('id', editingMeta.id);

        if (error) throw error;
        toast({
          title: "Meta atualizada! 🎯",
          description: "Continue firme no seu objetivo!",
        });
      } else {
        const { error } = await supabase
          .from('metas_financeiras')
          .insert([metaData]);

        if (error) throw error;
        toast({
          title: "Meta criada! 🚀",
          description: "Você deu o primeiro passo para realizar seu sonho!",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchMetas();
    } catch (error) {
      console.error('Error saving meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a meta.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('metas_financeiras')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Meta removida",
        description: "A meta foi excluída com sucesso.",
      });
      fetchMetas();
    } catch (error) {
      console.error('Error deleting meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a meta.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgress = (atual: number, objetivo: number) => {
    if (objetivo <= 0) return 0;
    return Math.min((atual / objetivo) * 100, 100);
  };

  const getDaysRemaining = (dataLimite: string | null) => {
    if (!dataLimite) return null;
    const today = new Date();
    const limit = new Date(dataLimite);
    const diff = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 100) return "🎉 Parabéns! Você conseguiu!";
    if (progress >= 75) return "🔥 Quase lá! Falta pouco!";
    if (progress >= 50) return "💪 Metade do caminho! Continue assim!";
    if (progress >= 25) return "🌟 Bom progresso! Não desista!";
    return "🚀 Todo sonho começa com um passo!";
  };

  const totalMetas = metas.length;
  const metasConcluidas = metas.filter(m => m.status === 'concluida').length;
  const totalObjetivo = metas.reduce((acc, m) => acc + m.valor_objetivo, 0);
  const totalAtual = metas.reduce((acc, m) => acc + m.valor_atual, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            Metas & Sonhos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transforme seus sonhos em realidade, um passo de cada vez! ✨
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{icone}</span>
                {editingMeta ? "Editar Meta" : "Nova Meta"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ex: Viagem para Europa"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva seu sonho..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Objetivo *</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={valorObjetivo}
                    onChange={(e) => setValorObjetivo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Atual</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={valorAtual}
                    onChange={(e) => setValorAtual(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Limite</Label>
                <Input
                  type="date"
                  value={dataLimite}
                  onChange={(e) => setDataLimite(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        icone === emoji 
                          ? 'bg-primary/20 scale-110 ring-2 ring-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setIcone(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {CORES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full transition-all ${
                        cor === color 
                          ? 'scale-110 ring-2 ring-offset-2 ring-primary' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                {editingMeta ? "Salvar" : "Criar Meta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <EmojiTooltip message="Quantos sonhos você está perseguindo!" emoji="🎯">
          <Card className="bg-card border-border/50 cursor-default">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total de Metas</p>
                  <p className="text-2xl font-bold text-primary">{totalMetas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </EmojiTooltip>

        <EmojiTooltip message="Sonhos realizados! Você é incrível!" emoji="🏆">
          <Card className="bg-card border-border/50 cursor-default">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold text-emerald-500">{metasConcluidas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </EmojiTooltip>

        <EmojiTooltip message="O total que você quer juntar!" emoji="💰">
          <Card className="bg-card border-border/50 cursor-default">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Objetivo</p>
                  <p className="text-lg font-bold text-amber-500">{formatCurrency(totalObjetivo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </EmojiTooltip>

        <EmojiTooltip message="Quanto você já juntou! Continue assim!" emoji="🐷">
          <Card className="bg-card border-border/50 cursor-default">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <TrendingUp className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Acumulado</p>
                  <p className="text-lg font-bold text-teal-500">{formatCurrency(totalAtual)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </EmojiTooltip>
      </section>

      {/* Metas Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : metas.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma meta ainda!</h3>
            <p className="text-muted-foreground mb-6">
              Comece a transformar seus sonhos em realidade criando sua primeira meta.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metas.map((meta) => {
            const progress = getProgress(meta.valor_atual, meta.valor_objetivo);
            const daysRemaining = getDaysRemaining(meta.data_limite);
            const isCompleted = meta.status === 'concluida';

            return (
              <Card 
                key={meta.id}
                className={`bg-card border-border/50 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isCompleted ? 'ring-2 ring-emerald-500/50' : ''
                }`}
              >
                <div 
                  className="h-2 transition-all duration-500"
                  style={{ 
                    background: `linear-gradient(90deg, ${meta.cor} ${progress}%, transparent ${progress}%)` 
                  }}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{meta.icone}</span>
                      <div>
                        <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {CATEGORIAS.find(c => c.value === meta.categoria)?.label || "Outro"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(meta)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. A meta "{meta.titulo}" será excluída permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(meta.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meta.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{meta.descricao}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium" style={{ color: meta.cor }}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-3"
                      style={{ 
                        '--progress-color': meta.cor 
                      } as React.CSSProperties}
                    />
                    <p className="text-xs text-center font-medium" style={{ color: meta.cor }}>
                      {getMotivationalMessage(progress)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-muted-foreground">Acumulado</p>
                      <p className="font-bold" style={{ color: meta.cor }}>
                        {formatCurrency(meta.valor_atual)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Objetivo</p>
                      <p className="font-bold text-foreground">
                        {formatCurrency(meta.valor_objetivo)}
                      </p>
                    </div>
                  </div>

                  {daysRemaining !== null && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {daysRemaining > 0 ? (
                        <span>Faltam {daysRemaining} dias</span>
                      ) : daysRemaining === 0 ? (
                        <span className="text-amber-500">Vence hoje!</span>
                      ) : (
                        <span className="text-red-500">Vencido há {Math.abs(daysRemaining)} dias</span>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-emerald-500/10 text-emerald-500 text-center py-2 rounded-lg text-sm font-medium">
                      🎉 Meta Alcançada!
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
