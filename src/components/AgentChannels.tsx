
import React, { useMemo, useState } from "react";
import { Mic, MessageSquare, Smartphone, Mail, MessageCircle, Search, Coins, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface AgentChannelConfig {
  enabled: boolean;
  details?: string;
  config?: Record<string, any>;
}

interface AgentChannelsProps {
  channels?: Record<string, AgentChannelConfig>;
  onUpdateChannel?: (channel: string, config: AgentChannelConfig) => void;
  readonly?: boolean;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
  hideContactInfo?: boolean;
}

interface ChannelInfo {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  placeholder: string;
}

interface PhoneNumberOption {
  number: string;
  areaCode: string;
  isTollFree: boolean;
  price: number;
  type: string;
  available: boolean;
}

const CHANNEL_INFO: Record<string, ChannelInfo> = {
  "voice": {
    name: "Голос",
    icon: <Mic className="h-3.5 w-3.5" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    placeholder: "+7 (800) 123-45-67"
  },
  "chat": {
    name: "Чат",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    placeholder: "https://вашсайт.ru/chat"
  },
  "sms": {
    name: "SMS",
    icon: <Smartphone className="h-3.5 w-3.5" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    placeholder: "+7 (900) 123-45-67"
  },
  "email": {
    name: "Email",
    icon: <Mail className="h-3.5 w-3.5" />,
    color: "text-red-500",
    bgColor: "bg-red-500",
    placeholder: "support@company.ru"
  },
  "whatsapp": {
    name: "WhatsApp",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    color: "text-green-500",
    bgColor: "bg-green-500",
    placeholder: "+7 (999) 987-65-43"
  }
};

const SAMPLE_PHONE_NUMBERS: PhoneNumberOption[] = [
  { number: "+7 (800) 555-01-23", areaCode: "800", isTollFree: true, price: 350, type: "Бесплатный", available: true },
  { number: "+7 (804) 555-01-24", areaCode: "804", isTollFree: true, price: 350, type: "Бесплатный", available: true },
  { number: "+7 (805) 555-01-25", areaCode: "805", isTollFree: true, price: 350, type: "Бесплатный", available: true },
  { number: "+7 (806) 555-01-26", areaCode: "806", isTollFree: true, price: 350, type: "Бесплатный", available: true },
  { number: "+7 (807) 555-01-27", areaCode: "807", isTollFree: true, price: 350, type: "Бесплатный", available: true },
  { number: "+7 (808) 555-01-28", areaCode: "808", isTollFree: true, price: 350, type: "Бесплатный", available: true },
  { number: "+7 (495) 555-01-29", areaCode: "495", isTollFree: false, price: 290, type: "Москва", available: true },
  { number: "+7 (812) 555-01-30", areaCode: "812", isTollFree: false, price: 290, type: "Санкт-Петербург", available: true },
  { number: "+7 (343) 555-01-31", areaCode: "343", isTollFree: false, price: 280, type: "Екатеринбург", available: true },
  { number: "+7 (861) 555-01-32", areaCode: "861", isTollFree: false, price: 280, type: "Краснодар", available: true },
  { number: "+7 (383) 555-01-33", areaCode: "383", isTollFree: false, price: 280, type: "Новосибирск", available: true },
  { number: "+7 (846) 555-01-34", areaCode: "846", isTollFree: false, price: 270, type: "Самара", available: true },
  { number: "+7 (843) 555-01-35", areaCode: "843", isTollFree: false, price: 270, type: "Казань", available: true },
  { number: "+7 (831) 555-01-36", areaCode: "831", isTollFree: false, price: 270, type: "Нижний Новгород", available: true },
  { number: "+7 (4012) 55-01-37", areaCode: "4012", isTollFree: false, price: 260, type: "Калининград", available: true },
  { number: "+7 (4212) 55-01-38", areaCode: "4212", isTollFree: false, price: 260, type: "Хабаровск", available: true },
];

const ALL_CHANNELS = Object.keys(CHANNEL_INFO);

export const AgentChannels: React.FC<AgentChannelsProps> = ({
  channels = {},
  onUpdateChannel,
  readonly = false,
  compact = false,
  showDetails = false,
  className = "",
  hideContactInfo = false
}) => {
  const [activeDialogChannel, setActiveDialogChannel] = useState<string | null>(null);
  const [channelDetails, setChannelDetails] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>("");
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberOption[]>(SAMPLE_PHONE_NUMBERS);
  const [filterTollFree, setFilterTollFree] = useState<boolean | null>(null);
  const { toast } = useToast();

  const selectedPhone = useMemo(() => {
    if (!selectedPhoneNumber) return null;
    return phoneNumbers.find((phone) => phone.number === selectedPhoneNumber) || null;
  }, [phoneNumbers, selectedPhoneNumber]);

  const normalizedChannels = ALL_CHANNELS.reduce((acc, channel) => {
    acc[channel] = channels[channel] || { enabled: false };
    return acc;
  }, {} as Record<string, AgentChannelConfig>);

  const enabledChannels = Object.entries(normalizedChannels)
    .filter(([_, config]) => config.enabled)
    .map(([channel]) => channel);

  if (readonly || compact) {
    if (!enabledChannels.length) return null;

    return (
      <div className={`flex flex-wrap gap-2 ${compact ? "mt-0" : "mt-1"} ${className}`}>
        {enabledChannels.map((channel) => {
          const info = CHANNEL_INFO[channel];
          const details = normalizedChannels[channel]?.details;

          return (
            <Badge
              key={channel}
              variant="channel"
              className="px-2 py-0.5 flex items-center gap-1"
            >
              {info.icon}
              <span className="text-[0.6rem]">{info.name}</span>
              {showDetails && details && !hideContactInfo && (
                <span className="text-[0.6rem] ml-1 opacity-80">{details}</span>
              )}
            </Badge>
          );
        })}
      </div>
    );
  }

  const filteredPhoneNumbers = phoneNumbers.filter((phone) => {
    const matchesQuery = searchQuery === "" ||
      phone.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.areaCode.includes(searchQuery) ||
      phone.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTollFree = filterTollFree === null || phone.isTollFree === filterTollFree;

    return matchesQuery && matchesTollFree;
  });

  const handleToggleChannel = (channel: string, enabled: boolean) => {
    if (onUpdateChannel) {
      const currentConfig = normalizedChannels[channel] || { enabled: false };
      onUpdateChannel(channel, { ...currentConfig, enabled });
    }
  };

  const handleOpenConfigDialog = (channel: string) => {
    setActiveDialogChannel(channel);
    setChannelDetails(normalizedChannels[channel]?.details || "");

    if (channel === 'voice') {
      setSearchQuery("");
      setFilterTollFree(null);
      setSelectedPhoneNumber(normalizedChannels[channel]?.details || "");
    }
  };

  const handleSaveConfig = () => {
    if (activeDialogChannel && onUpdateChannel) {
      const currentConfig = normalizedChannels[activeDialogChannel] || { enabled: false };
      const details = activeDialogChannel === 'voice' && selectedPhoneNumber
        ? selectedPhoneNumber
        : channelDetails;

      onUpdateChannel(activeDialogChannel, {
        ...currentConfig,
        details: details
      });
      setActiveDialogChannel(null);
    }
  };

  const handlePurchasePhoneNumber = (phoneNumber: string) => {
    setSelectedPhoneNumber(phoneNumber);
    toast({
      title: "Номер выбран",
      description: `${phoneNumber} будет подключён и сохранён после подтверждения изменений.`,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleTollFree = (value: boolean | null) => {
    setFilterTollFree(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      {ALL_CHANNELS.map((channel) => {
        const channelConfig = normalizedChannels[channel];
        const info = CHANNEL_INFO[channel];

        return (
          <div
            key={channel}
            className="bg-white/90 dark:bg-black/40 rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex flex-col shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className={info.color}>{info.icon}</span>
                <span className="font-medium text-gray-800 dark:text-white">{info.name}</span>
              </div>
              <Switch
                checked={channelConfig.enabled}
                onCheckedChange={(checked) => handleToggleChannel(channel, checked)}
              />
            </div>

            {channelConfig.details ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 truncate">{channelConfig.details}</p>
            ) : (
              <p className="text-sm text-gray-500 mb-4 italic">Конфигурация не задана</p>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-auto border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white"
                  onClick={() => handleOpenConfigDialog(channel)}
                >
                  Настроить
                </Button>
              </DialogTrigger>

              {activeDialogChannel === channel && (
                <DialogContent className="sm:max-w-md bg-white dark:bg-black text-gray-800 dark:text-white border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className={info.color}>{info.icon}</span>
                      Настройка канала {info.name}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {channel === 'voice' ? (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Поиск по коду региона или городу..."
                              className="pl-9 bg-white/90 dark:bg-black/30 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
                              value={searchQuery}
                              onChange={handleSearchChange}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={filterTollFree === null ? "secondary" : "outline"}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleToggleTollFree(null)}
                          >
                            Все
                          </Button>
                          <Button
                            variant={filterTollFree === true ? "secondary" : "outline"}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleToggleTollFree(true)}
                          >
                            Бесплатные
                          </Button>
                          <Button
                            variant={filterTollFree === false ? "secondary" : "outline"}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleToggleTollFree(false)}
                          >
                            Городские
                          </Button>
                        </div>

                        {selectedPhoneNumber && (
                          <div className="flex items-center justify-between p-2 bg-agent-primary/10 rounded border border-agent-primary/20">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-agent-primary" />
                              <span className="text-sm">{selectedPhoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Coins className="h-3 w-3" />
                              <span>
                                {selectedPhone ? `${selectedPhone.price.toLocaleString("ru-RU")} ₽/мес` : "Тариф уточняется"}
                              </span>
                            </div>
                          </div>
                        )}

                        <ScrollArea className="h-[300px] pr-4 -mr-4">
                          <div className="space-y-2">
                            {filteredPhoneNumbers.length > 0 ? (
                              filteredPhoneNumbers.map((phone) => (
                                <div
                                  key={phone.number}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{phone.number}</span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Badge variant="outline" className="text-[0.65rem] h-4 px-1.5 bg-gray-100 dark:bg-gray-800">
                                        {phone.type}
                                      </Badge>
                                      {phone.isTollFree && (
                                        <Badge className="text-[0.65rem] h-4 px-1.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200">
                                          Бесплатный
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" className="bg-agent-primary hover:bg-agent-primary/90 text-white">
                                        <Coins className="h-3 w-3 mr-1" />
                                        {phone.price.toLocaleString("ru-RU")} ₽/мес
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Подтверждение выбора номера</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                          Вы собираетесь подключить номер {phone.number} к голосовому каналу.
                                          Стоимость составит {phone.price.toLocaleString("ru-RU")} ₽/мес. Оплата будет списана после сохранения изменений.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white">
                                          Отмена
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-agent-primary hover:bg-agent-primary/90"
                                          onClick={() => handlePurchasePhoneNumber(phone.number)}
                                        >
                                          Выбрать номер
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                                <Search className="h-8 w-8 mb-2 opacity-50" />
                                <p>По заданным параметрам номера не найдены.</p>
                                <p className="text-sm mt-1">Попробуйте изменить запрос или фильтр.</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor={`${channel}-details`}>
                          {channel === 'sms' || channel === 'whatsapp'
                            ? 'Номер телефона'
                            : channel === 'chat'
                              ? 'URL-адрес'
                              : 'Электронная почта'}
                        </Label>
                        <Input
                          id={`${channel}-details`}
                          placeholder={info.placeholder}
                          value={channelDetails}
                          onChange={(e) => setChannelDetails(e.target.value)}
                          className="bg-white/90 dark:bg-black/30 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveDialogChannel(null)}
                      className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white"
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleSaveConfig}
                      className="bg-agent-primary hover:bg-agent-primary/90"
                    >
                      Сохранить
                    </Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </div>
        );
      })}
    </div>
  );
};
