
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Bot, Target, Building, Briefcase, Code,
  HeartPulse, Landmark, ShoppingCart, CircuitBoard, GraduationCap,
  Plane, Factory, ShieldCheck, Phone, Home, Headphones, BarChart4,
  Wrench, MessageSquare, Calendar, Wallet
} from 'lucide-react';

interface AgentConfigProps {
  name: string;
  description: string;
  purpose: string;
  prompt: string;
  industry: string;
  botFunction: string;
  customIndustry?: string;
  customFunction?: string;
  agentType?: string;
  model?: string;
}

interface AgentConfigSidebarProps {
  agentConfig: AgentConfigProps;
}

const INDUSTRIES = {
  "healthcare": { name: "Здравоохранение", icon: <HeartPulse className="h-4 w-4" /> },
  "finance": { name: "Финансы и банки", icon: <Landmark className="h-4 w-4" /> },
  "retail": { name: "Ритейл и e-commerce", icon: <ShoppingCart className="h-4 w-4" /> },
  "technology": { name: "Технологии", icon: <CircuitBoard className="h-4 w-4" /> },
  "education": { name: "Образование", icon: <GraduationCap className="h-4 w-4" /> },
  "hospitality": { name: "Гостиничный и туристический бизнес", icon: <Plane className="h-4 w-4" /> },
  "manufacturing": { name: "Производство", icon: <Factory className="h-4 w-4" /> },
  "insurance": { name: "Страхование", icon: <ShieldCheck className="h-4 w-4" /> },
  "telecommunications": { name: "Телеком", icon: <Phone className="h-4 w-4" /> },
  "real-estate": { name: "Недвижимость", icon: <Home className="h-4 w-4" /> },
  "other": { name: "Другая отрасль", icon: null }
};

const BOT_FUNCTIONS = {
  "customer-service": { name: "Поддержка клиентов", icon: <Headphones className="h-4 w-4" /> },
  "sales": { name: "Продажи и маркетинг", icon: <BarChart4 className="h-4 w-4" /> },
  "support": { name: "Техническая поддержка", icon: <Wrench className="h-4 w-4" /> },
  "it-helpdesk": { name: "IT-служба помощи", icon: <CircuitBoard className="h-4 w-4" /> },
  "lead-generation": { name: "Лидогенерация", icon: <Target className="h-4 w-4" /> },
  "booking": { name: "Назначение встреч", icon: <Calendar className="h-4 w-4" /> },
  "faq": { name: "База знаний и FAQ", icon: <MessageSquare className="h-4 w-4" /> },
  "billing": { name: "Биллинг и платежи", icon: <Wallet className="h-4 w-4" /> },
  "other": { name: "Другая функция", icon: null }
};

export const AgentConfigSidebar: React.FC<AgentConfigSidebarProps> = ({ agentConfig }) => {
  const industryInfo = INDUSTRIES[agentConfig.industry as keyof typeof INDUSTRIES] ||
    { name: agentConfig.customIndustry || "Не выбрано", icon: null };

  const functionInfo = BOT_FUNCTIONS[agentConfig.botFunction as keyof typeof BOT_FUNCTIONS] ||
    { name: agentConfig.customFunction || "Не выбрано", icon: null };

  return (
    <Card className="sticky top-4 dark:bg-bgMuted/80">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-brandPurple" />
          Настройки агента
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent name display */}
        {agentConfig.name ? (
          <div className="space-y-1.5">
            <Label className="text-xs text-fgMuted">Имя агента</Label>
            <div className="font-medium text-lg text-fg">{agentConfig.name}</div>
          </div>
        ) : (
          <div className="bg-bgMuted/30 p-3 rounded-md flex items-center gap-2 text-fgMuted">
            <Bot className="h-4 w-4" />
            <span>Здесь появится имя агента</span>
          </div>
        )}

        {/* Industry and Function */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-fgMuted">Отрасль</Label>
            {agentConfig.industry ? (
              <Badge variant="outline" className="flex gap-1 items-center">
                {industryInfo.icon}
                <span>{industryInfo.name}</span>
              </Badge>
            ) : (
              <div className="text-fgMuted text-sm">Не выбрана</div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-fgMuted">Функция</Label>
            {agentConfig.botFunction ? (
              <Badge variant="outline" className="flex gap-1 items-center">
                {functionInfo.icon}
                <span>{functionInfo.name}</span>
              </Badge>
            ) : (
              <div className="text-fgMuted text-sm">Не выбрана</div>
            )}
          </div>
        </div>

        {/* Description/Purpose */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-brandPurple" />
            <Label>Цель</Label>
          </div>
          {agentConfig.purpose ? (
            <div className="bg-bgMuted/30 p-2 rounded-md text-sm text-fg">
              {agentConfig.purpose}
            </div>
          ) : (
            <div className="bg-bgMuted/30 p-3 rounded-md flex items-center gap-2 text-fgMuted text-sm">
              Здесь появится описание цели агента
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Code className="h-4 w-4 text-brandPurple" />
            <Label>Промпт</Label>
          </div>
          {agentConfig.prompt ? (
            <Textarea
              value={agentConfig.prompt}
              readOnly
              className="min-h-[150px] text-sm font-mono bg-bgMuted/30"
            />
          ) : (
            <div className="bg-bgMuted/30 p-3 rounded-md h-[150px] flex items-center justify-center text-fgMuted text-sm">
              Промпт агента будет показан здесь
            </div>
          )}
        </div>

        {/* Additional settings info */}
        <div className="text-xs text-fgMuted pt-2 border-t border-border">
          После создания агента вы сможете дополнительно настроить его и подключить каналы.
        </div>
      </CardContent>
    </Card>
  );
};
