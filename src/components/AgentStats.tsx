
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface AgentStatsProps {
  avmScore?: number;  // Оценка по шкале 1-10
  interactionCount: number;
  csat?: number;  // Процент удовлетворенности 0-100
  performance?: number; // Показатель эффективности 0-100
  compact?: boolean; // Если true, показывать только первые две метрики
  isNewAgent?: boolean; // Флаг, что агент только создан
  showZeroValues?: boolean; // Если true, показывать 0 вместо сообщения об отсутствии данных
  hideInteractions?: boolean; // Скрывать блок с количеством взаимодействий
}

export const AgentStats: React.FC<AgentStatsProps> = ({
  avmScore,
  interactionCount,
  isNewAgent = false,
  showZeroValues = false,
  hideInteractions = false
}) => {
  // Для новых агентов показываем отдельный блок
  if (isNewAgent && !showZeroValues) {
    return (
      <div className="flex gap-2 w-full">
        <Card className="flex-1 overflow-hidden shadow-sm">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Статус агента</span>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <CardContent className="p-2 text-center text-sm text-muted-foreground">
            Новый агент — статистика пока не собрана
          </CardContent>
        </Card>
      </div>
    );
  }

  // В аналитике или при showZeroValues выводим нули вместо стандартных значений
  const displayAvmScore = isNewAgent && showZeroValues ? 0 : avmScore;
  const displayInteractionCount = isNewAgent ? 0 : interactionCount;

  // Определяем цвет индикатора AVM в зависимости от диапазона
  const getScoreColor = (score: number): string => {
    if (score >= 8) return "bg-success"; // 8-10: высокий показатель
    if (score >= 6) return "bg-warning"; // 6-7: средний показатель
    return "bg-destructive"; // 1-5: низкий показатель
  };

  // Возвращаем уровень и цвет в зависимости от количества взаимодействий
  const getInteractionTier = (count: number): { label: string; color: string } => {
    if (count >= 1000) return { label: "Золотой уровень", color: "text-warning" };
    if (count >= 100) return { label: "Серебряный уровень", color: "text-muted-foreground" };
    return { label: "Бронзовый уровень", color: "text-brandPink" };
  };

  const interactionTier = getInteractionTier(displayInteractionCount);

  // Get the appropriate color class for the AVM score bar
  const scoreColorClass = displayAvmScore !== undefined ? getScoreColor(displayAvmScore) : "bg-muted";

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Блок взаимодействий (по умолчанию скрыт) */}
      {!hideInteractions && (
        <div className="flex gap-2 w-full">
          <Card className="flex-1 overflow-hidden shadow-sm">
            <div className="px-2 py-1 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Взаимодействия</span>
              <span className={`text-xs font-medium ${interactionTier.color}`}>{interactionTier.label}</span>
            </div>
            <CardContent className="p-2 text-center">
              <span className="text-xl font-semibold text-foreground">
                {displayInteractionCount >= 1000
                  ? `${(displayInteractionCount / 1000).toFixed(1)} тыс.`
                  : displayInteractionCount}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Индикатор AVM вне карточки */}
      {displayAvmScore !== undefined && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">AVM</span>
            <span className="text-xs font-medium">{displayAvmScore !== undefined ? displayAvmScore.toFixed(1) : "0.0"}</span>
          </div>
          <div className="relative w-full overflow-hidden rounded-full bg-secondary dark:bg-bgMuted h-2">
            <div
              className={`absolute h-full transition-all duration-300 ease-in-out ${scoreColorClass}`}
              style={{ width: `${displayAvmScore ? (displayAvmScore * 10) : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
