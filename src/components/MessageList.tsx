import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Message } from '../types/message';
import { MessageItem } from './MessageItem';
import '../styles.css'; // Используем единый style.css

interface MessageListProps {
  messages: Message[];
  isLoading: boolean; // Индикатор загрузки ответа (не истории)
}

// Определяем тип для методов, предоставляемых через ref
export interface MessageListHandles {
  scrollToTop: () => void;
  scrollToBottom: () => void;
}

// Используем React.forwardRef для получения ref от родителя
export const MessageList = React.memo(forwardRef<MessageListHandles, MessageListProps>(
  ({ messages, isLoading }, ref) => {
    const listRef = useRef<List>(null);
    const sizeMap = useRef<Record<string, number>>({}); // Используем ID сообщения как ключ
    const rowHeights = useRef<Record<string, number>>({}); // Для более точного измерения

    // Функция для измерения реальной высоты DOM-элемента сообщения
    const measureRow = (element: HTMLDivElement | null, index: number, id: string) => {
        if (element && !rowHeights.current[id]) {
            // Проверяем, изменилась ли высота с момента последнего измерения
            const newHeight = element.getBoundingClientRect().height;
            if (newHeight > 0 && rowHeights.current[id] !== newHeight) {
                rowHeights.current[id] = newHeight;
                sizeMap.current[id] = newHeight; // Обновляем и кеш для itemSize
                 // Плавно сбрасываем кеш для элементов после измененного
                if (listRef.current) {
                     listRef.current.resetAfterIndex(index, true);
                 }
            }
        }
    };


    // Прокрутка к последнему сообщению при добавлении нового
    useEffect(() => {
      if (messages.length > 0 && listRef.current) {
        const timer = setTimeout(() => {
          listRef.current?.scrollToItem(messages.length - 1, 'end');
        }, 50); // Небольшая задержка для рендеринга
        return () => clearTimeout(timer);
      }
    }, [messages]); // Зависим только от массива сообщений

    // Предоставляем методы scrollToTop и scrollToBottom родителю
    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        listRef.current?.scrollToItem(0, 'start');
      },
      scrollToBottom: () => {
        if (messages.length > 0) {
          listRef.current?.scrollToItem(messages.length - 1, 'end');
        }
      },
    }));

    // Рендерер строки
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const message = messages[index];
        const id = message.id || `msg-${index}`; // Нужен стабильный ID

        return (
            <div style={style}>
                {/* Оборачиваем MessageItem в div с ref для измерения */}
                <div ref={(el) => measureRow(el, index, id)}>
                    <MessageItem message={message} />
                </div>
            </div>
        );
    };


    // Функция для получения размера элемента (сначала оценка, потом точное значение)
    const getItemSize = (index: number): number => {
      const message = messages[index];
      const id = message.id || `msg-${index}`;

      // Если есть точное измеренное значение, используем его
      if (rowHeights.current[id]) {
          return rowHeights.current[id];
      }
       // Если есть кешированное значение (например, после сброса)
       if (sizeMap.current[id]) {
        return sizeMap.current[id];
       }

      // Начальная оценка высоты (может быть неточной)
      const estimate = () => {
          const content = message.content || '';
          const baseSize = 65; // Отступы, шапка
          const charsPerLine = 60; // Примерное количество символов в строке
          const lineHeight = 20; // Примерная высота строки
          const numLines = Math.ceil(content.length / charsPerLine);
          const codeBlockBonus = content.includes('```') ? 80 : 0; // Дополнительно за блок кода
          const calculatedHeight = baseSize + (numLines * lineHeight) + codeBlockBonus;
          return Math.max(80, calculatedHeight); // Минимальная высота
      }

      const estimatedSize = estimate();
      sizeMap.current[id] = estimatedSize; // Сохраняем оценку
      return estimatedSize;
    };

    // Сброс кеша размеров при изменении массива сообщений (например, очистка)
    // Важно сбрасывать и rowHeights, и sizeMap
    useEffect(() => {
        rowHeights.current = {};
        sizeMap.current = {};
        if (listRef.current) {
            listRef.current.resetAfterIndex(0, false); // false - не пересчитывать сразу
        }
    }, [messages]); // Срабатывает, когда ссылка на массив messages меняется


    return (
      // Этот div заполняет messages-container, AutoSizer измеряет его
      <div className="groq-chat__messages">
        {messages.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => {
              if (height === 0 || width === 0) {
                // Не рендерим список, пока нет размеров
                return null;
              }
              return (
                <List
                  ref={listRef}
                  height={height}
                  width={width}
                  itemCount={messages.length}
                  itemSize={getItemSize} // Используем нашу функцию оценки/измерения
                  estimatedItemSize={120} // Средняя ожидаемая высота
                  itemKey={(index) => messages[index].id || `msg-${index}`} // Используем ID для ключа
                  className="groq-react-window-list" // Добавляем класс для стилизации, если нужно
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        ) : (
          // Показываем, если нет сообщений и не идет загрузка истории
          !isLoading && <div className="groq-chat__empty">Нет сообщений для отображения</div>
        )}

        {/* Индикатор загрузки ответа */}
        {isLoading && (
          <div className="groq-loading-indicator">
            <div className="groq-spinner"></div>
            <span>Генерация ответа...</span>
          </div>
        )}
      </div>
    );
  }
));

MessageList.displayName = 'MessageList';
