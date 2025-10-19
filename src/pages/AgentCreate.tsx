
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bot, Mic, Phone, CheckCircle2, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { LiveTranscription } from "@/components/LiveTranscription";
import { AgentConfigSidebar } from "@/components/AgentConfigSidebar";

const AgentCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callState, setCallState] = useState<"idle" | "connecting" | "active" | "completed">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcription, setTranscription] = useState<{ role: "system" | "user", text: string }[]>([]);
  const [agentConfig, setAgentConfig] = useState({
    name: "",
    description: "",
    agentType: "",
    model: "gpt-4",
    purpose: "",
    prompt: "",
    industry: "",
    botFunction: "",
    customIndustry: "",
    customFunction: "",
  });

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d\s()\-+]/g, '');
    setPhoneNumber(value);
  };

  const validatePhoneNumber = () => {
    return phoneNumber.replace(/[^\d]/g, '').length >= 10;
  };

  const startAgentCreationCall = () => {
    if (!validatePhoneNumber()) {
      toast({
        title: "Некорректный номер",
        description: "Введите, пожалуйста, корректный номер телефона.",
        variant: "destructive",
      });
      return;
    }

    setCallState("connecting");

    setTimeout(() => {
      setCallState("active");
      simulateConversation();
    }, 2000);
  };

  const simulateConversation = () => {
    const conversation = [
      { delay: 1000, role: "system" as const, text: "Здравствуйте! Я помогу вам создать нового агента. Как вы хотите его назвать?" },
      { delay: 4000, role: "user" as const, text: "Бот поддержки клиентов" },
      { delay: 2000, role: "system" as const, text: "Отличное имя! В какой отрасли будет работать агент?" },
      { delay: 4000, role: "user" as const, text: "Электронная коммерция" },
      { delay: 2000, role: "system" as const, text: "Отрасль электронной коммерции выбрана. Какую функцию будет выполнять агент — например, поддержку клиентов, продажи или техподдержку?" },
      { delay: 4000, role: "user" as const, text: "Поддержка клиентов по вопросам заказов и возвратов" },
      { delay: 2000, role: "system" as const, text: "Функция установлена как поддержка клиентов. Опишите основную задачу агента." },
      { delay: 5000, role: "user" as const, text: "Помогать отслеживать заказы, оформлять возвраты и решать типичные проблемы покупателей" },
      { delay: 2000, role: "system" as const, text: "Отлично! На основе разговора я подготовил промпт для агента. Вы можете просмотреть и отредактировать его в боковой панели. Хотите что-то дополнительно настроить?" },
      { delay: 4000, role: "user" as const, text: "Нет, всё подходит" },
      { delay: 2000, role: "system" as const, text: "Готово! Бот поддержки клиентов успешно создан. Проверьте детали в боковой панели и внесите финальные изменения при необходимости." },
    ];

    let cumulativeDelay = 0;

    conversation.forEach((item, index) => {
      cumulativeDelay += item.delay;

      setTimeout(() => {
        setTranscription(prev => [...prev, item]);

        if (item.role === "user") {
          switch (index) {
            case 1: // Name response
              setAgentConfig(prev => ({ ...prev, name: item.text }));
              break;
            case 3: // Industry response
              setAgentConfig(prev => ({ ...prev, industry: "retail" }));
              break;
            case 5: // Function response
              setAgentConfig(prev => ({ ...prev, botFunction: "customer-service" }));
              break;
            case 7: // Purpose response
              setAgentConfig(prev => ({
                ...prev,
                description: item.text,
                purpose: item.text,
                prompt: `You are a Customer Support Bot for an e-commerce platform. Your main purpose is to ${item.text.toLowerCase()}. Always be helpful, friendly, and efficient in addressing customer concerns.`
              }));
              break;
          }
        }

        if (index === conversation.length - 1) {
          setTimeout(() => {
            setCallState("completed");
          }, 2000);
        }
      }, cumulativeDelay);
    });
  };

  const handleCreateAgent = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "Агент создан!",
        description: `${agentConfig.name} успешно создан.`,
      });
      setIsSubmitting(false);
      navigate("/agents");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link to="/agents" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к агентам
        </Link>
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Создание агента голосом</h1>
          <p className="text-muted-foreground mt-1">Поговорите с системой, чтобы настроить нового агента</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {callState === "idle" ? (
            <Card>
              <CardHeader>
                <CardTitle>Шаг 1. Запустите звонок для настройки</CardTitle>
                <CardDescription>
                  Введите номер телефона, чтобы начать пошаговую настройку агента
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Номер телефона</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+7 (900) 123-45-67"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={startAgentCreationCall}
                      disabled={!phoneNumber}
                      className="gap-2"
                      variant="contrast"
                    >
                      <Mic className="h-4 w-4" />
                      Начать звонок
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Мы позвоним на указанный номер и проведём вас через настройку
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {callState === "connecting" && "Соединяем..."}
                      {callState === "active" && "Идёт настройка агента"}
                      {callState === "completed" && "Настройка завершена"}
                    </CardTitle>
                    <CardDescription>
                      {callState === "connecting" && "Подождите, пока мы подключим звонок"}
                      {callState === "active" && "Онлайн-транскрипция вашего разговора"}
                      {callState === "completed" && "Агент настроен на основе вашего диалога"}
                    </CardDescription>
                  </div>
                  <div>
                    {callState === "connecting" && (
                      <div className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Подключение
                      </div>
                    )}
                    {callState === "active" && (
                      <div className="bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        Звонок активен
                      </div>
                    )}
                    {callState === "completed" && (
                      <div className="bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Готово
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LiveTranscription messages={transcription} isCallActive={callState === "active"} />
              </CardContent>
              {callState === "completed" && (
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button
                    onClick={handleCreateAgent}
                    disabled={isSubmitting}
                    className="gap-2"
                    variant="contrast"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Создаём...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Создать агента
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>

        <div className="w-full md:w-[400px]">
          <AgentConfigSidebar agentConfig={agentConfig} />
        </div>
      </div>
    </div>
  );
};

export default AgentCreate;
