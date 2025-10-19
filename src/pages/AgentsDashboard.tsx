import { useEffect, useState, type MouseEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Bot, Search, CircleSlash, Loader2, UserCircle2, MoreVertical, Power, Edit, Eye, Archive, AlertCircle, Calendar, Phone, Mail, Copy, Sparkles, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { AgentType, AgentStatus, AgentChannelConfig } from "@/types/agent";
import { useAgents } from "@/hooks/useAgents";
import { AgentToggle } from "@/components/AgentToggle";
import { AgentChannels } from "@/components/AgentChannels";
import { AgentStats } from "@/components/AgentStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

const randomNames = ["Арина", "Михаил", "Юки", "Мила", "Нова", "Зефир", "Эхо", "Луна", "Орион", "Ирис"];

const getRandomName = (id: string) => {
  const lastChar = id.charAt(id.length - 1);
  const index = parseInt(lastChar, 36) % randomNames.length;
  return randomNames[index];
};

const getAgentAVMScore = (id: string): number => {
  const charSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const baseScore = 1 + (charSum % 9);
  const decimalPart = ((charSum * 13) % 100) / 100;
  return parseFloat((baseScore + decimalPart).toFixed(2));
};

const agentTypeLabels: Record<string, string> = {
  "Customer Service": "Поддержка клиентов",
  "Sales & Marketing": "Продажи и маркетинг",
  "Technical Support": "Техническая поддержка",
  "IT Helpdesk": "IT‑служба помощи",
  "Lead Generation": "Лидогенерация",
  "Appointment Booking": "Назначение встреч",
  "FAQ & Knowledge Base": "База знаний",
  "Customer Onboarding": "Онбординг клиентов",
  "Billing & Payments": "Биллинг и платежи",
  "Feedback Collection": "Сбор обратной связи",
  "Other Function": "Другое"
};

const channelLabels: Record<string, string> = {
  voice: "Голос",
  chat: "Чат",
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS"
};

const statusLabels: Record<AgentStatus, string> = {
  active: "активен",
  inactive: "неактивен",
  draft: "черновик"
};

const AgentsDashboard = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const filter = searchParams.get("filter") || "all-agents";
  const { toast } = useToast();
  const navigate = useNavigate();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [agentToDeactivate, setAgentToDeactivate] = useState<string | null>(null);
  const [skipConfirmation, setSkipConfirmation] = useState(() => {
    const saved = localStorage.getItem("skipAgentDeactivationConfirmation");
    return saved === "true";
  });

  const { agents: initialAgents, isLoading, error } = useAgents(filter);
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentType[]>([]);

  const newlyCreatedAgent: AgentType = {
    id: "new123",
    name: "Новый агент",
    description: "Этот агент только что создан и требует настройки, чтобы полноценно работать.",
    purpose: "Помогать пользователям с обращениями и отвечать на типовые вопросы.",
    status: "inactive",
    type: "Customer Service",
    createdAt: "Прямо сейчас",
    interactions: 0,
    channelConfigs: {
      "web": { enabled: false },
      "email": { enabled: false },
      "voice": { enabled: false }
    }
  };

  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (initialAgents) {
      let sorted = [newlyCreatedAgent, ...initialAgents];

      sorted = [...sorted].sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "most-used":
            return (b.interactions || 0) - (a.interactions || 0);
          case "less-used":
            return (a.interactions || 0) - (b.interactions || 0);
          case "recent":
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });

      let filtered = sorted.filter(agent => {
        const nameMatch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
        const purposeMatch = agent.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const searchMatches = nameMatch || purposeMatch;

        const typeMatches = filterType === "all" || agent.type === filterType;
        const statusMatches = filterStatus === "all" || agent.status === filterStatus;
        const channelMatches = filterChannel === "all" ||
          (agent.channels && agent.channels.includes(filterChannel)) ||
          (agent.channelConfigs && agent.channelConfigs[filterChannel]?.enabled);

        return searchMatches && typeMatches && statusMatches && channelMatches;
      });

      setFilteredAgents(filtered);
    }
  }, [initialAgents, searchTerm, sortBy, filterType, filterChannel, filterStatus]);

  const getFilterTitle = () => {
    switch (filter) {
      case "my-agents":
        return "Ваши личные агенты";
      case "team-agents":
        return "Агенты вашей команды";
      default:
        return "Ваши ИИ-агенты";
    }
  };

  const executeToggleStatus = (agentId: string, currentStatus: AgentStatus) => {
    const newStatus: AgentStatus = currentStatus === "active" ? "inactive" : "active";
    const statusText = statusLabels[newStatus] ?? newStatus;

    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      )
    );

    setFilteredAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      )
    );

    toast({
      title: `Агент ${newStatus === "active" ? "активирован" : "деактивирован"}`,
      description: `Теперь статус агента: ${statusText}.`,
    });

    console.log(`Изменение статуса агента ${agentId} на ${newStatus}`);
  };

  const handleToggleStatus = (e: MouseEvent, agentId: string, currentStatus: AgentStatus) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentStatus === "inactive" || skipConfirmation) {
      executeToggleStatus(agentId, currentStatus);
      return;
    }

    setAgentToDeactivate(agentId);
    setConfirmDialogOpen(true);
  };

  const handleSkipConfirmationChange = (checked: boolean) => {
    setSkipConfirmation(checked);
    localStorage.setItem("skipAgentDeactivationConfirmation", checked.toString());
  };

  const handleConfirmDeactivation = () => {
    if (agentToDeactivate) {
      const agent = agents.find(a => a.id === agentToDeactivate);
      if (agent) {
        executeToggleStatus(agentToDeactivate, agent.status);
      }
    }

    setConfirmDialogOpen(false);
    setAgentToDeactivate(null);
  };

  const handleCancelDeactivation = () => {
    setConfirmDialogOpen(false);
    setAgentToDeactivate(null);
  };

  const handleEditAgent = (e: MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (agentId === "new123") {
      navigate(`/agents/${agentId}?tab=setup`);
    } else {
      navigate(`/agents/${agentId}?tab=settings`);
    }
  };

  const handleArchiveAgent = (e: MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Архивация агента",
      description: "Агент перемещён в архив.",
      variant: "destructive",
    });
    setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
    setFilteredAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
  };

  const handleViewDetails = (e: MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (agentId === "new123") {
      navigate(`/agents/${agentId}?tab=setup`);
    } else {
      navigate(`/agents/${agentId}`);
    }
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} скопирован`,
      description: `${type.toLowerCase()} скопирован в буфер обмена.`,
    });
  };

  const handlePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
    toast({
      title: "Звонок агенту",
      description: `Начинаем звонок по номеру ${phone}`,
    });
  };

  const formatCreatedAt = (dateStr: string): string => {
    if (dateStr === "Just now" || dateStr === "Прямо сейчас") return "Прямо сейчас";

    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Сегодня";
      } else if (diffDays === 1) {
        return "Вчера";
      } else if (diffDays < 7) {
        return `${diffDays} дн. назад`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} нед. назад`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return dateStr;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <CircleSlash className="h-16 w-16 text-agent-error opacity-80" />
        <h2 className="text-2xl font-semibold text-foreground dark:text-white">Ошибка загрузки агентов</h2>
        <p className="text-muted-foreground dark:text-gray-300">Попробуйте обновить страницу позже.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Отключить агента?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите отключить этого агента? Он перестанет отвечать на запросы пользователей.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 py-3">
            <Checkbox
              id="skipConfirmation"
              checked={skipConfirmation}
              onCheckedChange={handleSkipConfirmationChange}
            />
            <label
              htmlFor="skipConfirmation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Больше не спрашивать
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeactivation}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeactivation} className="bg-agent-primary">
              Отключить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-fg tracking-tight">
            {getFilterTitle()}
          </h1>
          <p className="text-fgMuted mt-1">
            Создавайте, настраивайте и управляйте интеллектуальными ассистентами в одном месте
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fgMuted" />
          <Input
            placeholder="Поиск по имени или назначению..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-bg border-border">
              <SelectValue placeholder="Функция бота" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все функции</SelectItem>
              <SelectItem value="Customer Service">Поддержка клиентов</SelectItem>
              <SelectItem value="Sales & Marketing">Продажи и маркетинг</SelectItem>
              <SelectItem value="Technical Support">Техническая поддержка</SelectItem>
              <SelectItem value="IT Helpdesk">IT‑служба помощи</SelectItem>
              <SelectItem value="Lead Generation">Лидогенерация</SelectItem>
              <SelectItem value="Appointment Booking">Назначение встреч</SelectItem>
              <SelectItem value="FAQ & Knowledge Base">База знаний</SelectItem>
              <SelectItem value="Customer Onboarding">Онбординг клиентов</SelectItem>
              <SelectItem value="Billing & Payments">Биллинг и платежи</SelectItem>
              <SelectItem value="Feedback Collection">Сбор обратной связи</SelectItem>
              <SelectItem value="Other Function">Другое</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="w-[140px] bg-bg border-border">
              <SelectValue placeholder="Канал" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все каналы</SelectItem>
              <SelectItem value="voice">Голос</SelectItem>
              <SelectItem value="chat">Чат</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-bg border-border">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-bg border-border">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Самые новые</SelectItem>
              <SelectItem value="oldest">Самые старые</SelectItem>
              <SelectItem value="most-used">Самые популярные</SelectItem>
              <SelectItem value="less-used">Используются реже</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-brandPurple animate-spin" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Bot className="h-16 w-16 text-fgMuted opacity-80" />
          <h2 className="text-2xl font-semibold text-fg">Агенты не найдены</h2>
          <p className="text-fgMuted">
            {searchTerm ? "Попробуйте изменить запрос" : "Создайте первого агента, чтобы начать работу"}
          </p>
          {!searchTerm && (
            <Link to="/agents/create" className="brand-button mt-2">
              Создать первого агента
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/agents/create" className="block">
            <Card className="h-full card-hover border-dashed border-2 border-agent-primary/30 hover:border-agent-primary/70 transition-all bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/30">
              <div className="flex flex-col items-center justify-center h-full py-10">
                <div className="h-12 w-12 rounded-full bg-agent-primary/10 flex items-center justify-center mb-4">
                  <PlusCircle className="h-6 w-6 text-agent-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground dark:text-white">Создать нового агента</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400 text-center mt-2 max-w-xs">
                  Настройте собственного ИИ-агента для поддержки клиентов, продаж и других задач
                </p>
              </div>
            </Card>
          </Link>

          {filteredAgents.slice(1).map((agent) => (
            <Link to={`/agents/${agent.id}`} key={agent.id} className="block">
              <Card className="h-full card-hover">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-800">
                        <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`} alt={agent.name} />
                        <AvatarFallback><UserCircle2 className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground dark:text-white">{getRandomName(agent.id)}</h3>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">{agent.phone}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 z-50">
                        <DropdownMenuItem onClick={(e) => handleToggleStatus(e, agent.id, agent.status)}>
                          <Power className="mr-2 h-4 w-4" />
                          {agent.status === "active" ? "Отключить" : "Включить"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleEditAgent(e, agent.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать агента
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleViewDetails(e, agent.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Открыть профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleArchiveAgent(e, agent.id)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Архивировать агента
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3">
                    <CardDescription className="line-clamp-2 text-muted-foreground dark:text-gray-300 mb-2">
                      {agent.description}
                    </CardDescription>

                    {agent.channelConfigs ? (
                      <AgentChannels channels={agent.channelConfigs} readonly={true} compact={true} className="mt-0" />
                    ) : agent.channels && agent.channels.length > 0 ? (
                      <AgentChannels
                        channels={agent.channels.reduce((obj, channel) => {
                          obj[channel] = { enabled: true };
                          return obj;
                        }, {} as Record<string, AgentChannelConfig>)}
                        readonly={true}
                        compact={true}
                        className="mt-0"
                      />
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <AgentStats
                      avmScore={getAgentAVMScore(agent.id)}
                      interactionCount={agent.interactions}
                      compact={true}
                      hideInteractions={true}
                    />

                    <div className="flex flex-wrap gap-2 mt-2">
                      {filterType !== "all" && (
                        <Badge variant="muted" className="w-fit">
                          Тип: {agentTypeLabels[agent.type] ?? agent.type}
                        </Badge>
                      )}

                      {filterChannel !== "all" && agent.channels && (
                        <Badge variant="muted" className="w-fit">
                          Канал: {channelLabels[filterChannel] ?? filterChannel}
                        </Badge>
                      )}

                      {filterStatus !== "all" && (
                        <Badge variant="muted" className="w-fit">
                          Статус: {statusLabels[agent.status] ?? agent.status}
                        </Badge>
                      )}

                      {(sortBy === "recent" || sortBy === "oldest") && (
                        <Badge variant="muted" className="w-fit">
                          {formatCreatedAt(agent.createdAt)}
                        </Badge>
                      )}

                      {(sortBy === "most-used" || sortBy === "less-used") && (
                        <Badge variant="muted" className="w-fit">
                          {agent.interactions} взаимодействий
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-4 flex justify-between items-center">
                  <AgentToggle
                    isActive={agent.status === "active"}
                    onToggle={(e) => handleToggleStatus(e, agent.id, agent.status)}
                  />
                  <div className="text-sm text-foreground dark:text-white font-medium">Перейти к карточке &rarr;</div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentsDashboard;

