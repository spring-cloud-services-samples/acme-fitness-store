import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {getCurrentProductInView, parseMessageContentAndBuildLinks} from "../utils/helpers.ts";

interface ChatMessage {
    content: string;
    role: 'USER' | 'ASSISTANT';
}

interface AcmeChatResponse {
    messages: string[];
}

interface GreetingResponse {
    conversationId: string;
    greeting: string;
    suggestedPrompts: string[];
}

const STORAGE_KEY = 'acme_chat_history';

export const useChatService = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

    const loadChatHistory = useCallback(() => {
        const storedHistory = localStorage.getItem(STORAGE_KEY);
        return storedHistory ? JSON.parse(storedHistory) : [];
    }, []);

    const saveChatHistory = useCallback((history: ChatMessage[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }, []);

    const fetchGreeting = useCallback(async () => {
        try {
            const response = await axios.post<GreetingResponse>('/ai/hello', {
                conversationId: crypto.randomUUID(),
                page: window.location.pathname
            });

            if (response.data) {
                setSuggestedPrompts(response.data.suggestedPrompts)
                const initialMessages: ChatMessage[] = [
                    {content: response.data.greeting, role: 'ASSISTANT'}
                ];
                setChatHistory(initialMessages);
                saveChatHistory(initialMessages);
            } else {
                console.error('No greeting response received');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred fetching greeting'));
            console.error('Error fetching greeting:', err);
        }
    }, [saveChatHistory]);

    const initializeChatHistory = useCallback(() => {
        const loadedHistory = loadChatHistory();
        if (loadedHistory.length === 0) {
            fetchGreeting();
        } else {
            setChatHistory(loadedHistory);
        }
    }, [loadChatHistory, fetchGreeting]);

    useEffect(() => {
        initializeChatHistory();
    }, [initializeChatHistory]);

    const sendMessage = useCallback(async (message: string, cartData: string) => {
        setIsLoading(true);
        setError(null);

        const newUserMessage: ChatMessage = {
            content: message,
            role: 'USER',
        };

        const updatedHistory = [...chatHistory, newUserMessage];
        setChatHistory(updatedHistory);
        saveChatHistory(updatedHistory);


        try {
            const refinedHistory = [...updatedHistory]
            if(updatedHistory[0].role === "ASSISTANT"){
                refinedHistory.shift();
            }
            const payload = {
                messages: refinedHistory.map(msg => ({
                    content: msg.content,
                    role: msg.role
                }))
            };
            const latestMsg = payload['messages'].pop();
            payload['messages'].push({content: cartData, role: 'USER'});
            payload['messages'].push({content: getCurrentProductInView(), role: 'USER'})
            payload['messages'].push(latestMsg);

            const response = await axios.post<AcmeChatResponse>('/ai/question', payload);

            if (response.data && response.data.messages && response.data.messages.length > 0) {
                const assistantMessages = response.data.messages.map(content => ({
                    content: parseMessageContentAndBuildLinks(content),
                    role: 'ASSISTANT' as const
                }));

                const newHistory = [...updatedHistory, ...assistantMessages];
                setChatHistory(newHistory);
                saveChatHistory(newHistory);
            } else {
                console.error('Received an empty or malformed response from API');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
            console.error('Error in chat service:', err);
        } finally {
            setIsLoading(false);
        }
    }, [chatHistory, saveChatHistory]);

    const refreshChat = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setChatHistory([]);
        setSuggestedPrompts([]);
    }, []);

    return {
        chatHistory,
        suggestedPrompts,
        sendMessage,
        refreshChat,
        isLoading,
        error
    };
};