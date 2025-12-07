import { useAccessibility } from '@/hooks/useAccessibility';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accessibility, Eye, Type, Zap, Volume2, RotateCcw } from 'lucide-react';

export function AccessibilitySettings() {
  const { settings, updateSetting, resetSettings, announceToScreenReader } = useAccessibility();

  const handleFontSizeChange = (value: string) => {
    updateSetting('fontSize', value as 'normal' | 'large' | 'extra-large');
    announceToScreenReader(`Tamanho do texto alterado para ${value === 'normal' ? 'normal' : value === 'large' ? 'grande' : 'extra grande'}`);
  };

  const handleHighContrastChange = (checked: boolean) => {
    updateSetting('highContrast', checked);
    announceToScreenReader(`Alto contraste ${checked ? 'ativado' : 'desativado'}`);
  };

  const handleReduceMotionChange = (checked: boolean) => {
    updateSetting('reduceMotion', checked);
    announceToScreenReader(`Reduzir movimento ${checked ? 'ativado' : 'desativado'}`);
  };

  const handleScreenReaderModeChange = (checked: boolean) => {
    updateSetting('screenReaderMode', checked);
    announceToScreenReader(`Modo leitor de tela ${checked ? 'ativado' : 'desativado'}`);
  };

  const handleReset = () => {
    resetSettings();
    announceToScreenReader('Configurações de acessibilidade restauradas para o padrão');
  };

  return (
    <Card id="accessibility-settings" className="mb-6" role="region" aria-labelledby="accessibility-title">
      <CardHeader>
        <CardTitle id="accessibility-title" className="flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Acessibilidade</span>
        </CardTitle>
        <CardDescription>
          Configure as opções de acessibilidade para melhorar sua experiência. 
          Todas as configurações são salvas automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Size */}
        <div className="space-y-3" role="group" aria-labelledby="font-size-label">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Label id="font-size-label" className="text-base font-medium">
              Tamanho do Texto
            </Label>
          </div>
          <RadioGroup
            value={settings.fontSize}
            onValueChange={handleFontSizeChange}
            className="flex flex-col gap-2"
            aria-describedby="font-size-description"
          >
            <p id="font-size-description" className="sr-only">
              Escolha o tamanho do texto que melhor se adapta às suas necessidades
            </p>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="font-normal" />
              <Label htmlFor="font-normal" className="cursor-pointer">
                Normal (16px)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="font-large" />
              <Label htmlFor="font-large" className="cursor-pointer text-lg">
                Grande (18px)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="extra-large" id="font-extra-large" />
              <Label htmlFor="font-extra-large" className="cursor-pointer text-xl">
                Extra Grande (20px)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-base font-medium cursor-pointer">
                Alto Contraste
              </Label>
              <p className="text-sm text-muted-foreground">
                Aumenta o contraste entre texto e fundo
              </p>
            </div>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={handleHighContrastChange}
            aria-describedby="high-contrast-description"
          />
          <span id="high-contrast-description" className="sr-only">
            Ative para melhorar a visibilidade do texto
          </span>
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion" className="text-base font-medium cursor-pointer">
                Reduzir Movimento
              </Label>
              <p className="text-sm text-muted-foreground">
                Desativa animações e transições
              </p>
            </div>
          </div>
          <Switch
            id="reduce-motion"
            checked={settings.reduceMotion}
            onCheckedChange={handleReduceMotionChange}
            aria-describedby="reduce-motion-description"
          />
          <span id="reduce-motion-description" className="sr-only">
            Ative para remover animações que podem causar desconforto
          </span>
        </div>

        {/* Screen Reader Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader" className="text-base font-medium cursor-pointer">
                Modo Leitor de Tela
              </Label>
              <p className="text-sm text-muted-foreground">
                Otimiza a interface para leitores de tela
              </p>
            </div>
          </div>
          <Switch
            id="screen-reader"
            checked={settings.screenReaderMode}
            onCheckedChange={handleScreenReaderModeChange}
            aria-describedby="screen-reader-description"
          />
          <span id="screen-reader-description" className="sr-only">
            Ative para adicionar descrições extras para leitores de tela
          </span>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
            aria-label="Restaurar todas as configurações de acessibilidade para o padrão"
          >
            <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
            Restaurar Padrões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
