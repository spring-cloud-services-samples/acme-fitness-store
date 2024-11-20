import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  getCurrentProductInView,
  parseMessageContentAndBuildLinks,
  summarizeCart,
} from "../utils/helpers.ts";
import { FormRecommendationData } from "../types/FormRecommendationData.ts";
import { CartData } from "../types/Cart.ts";

export interface ChatMessage {
  content: string;
  role: "USER" | "ASSISTANT";
  formType?: "FORM1" | "FORM2" | "FORM3" | "RECOMMENDATION" | null;
}

interface AcmeChatResponse {
  messages: string[];
}

interface GreetingResponse {
  conversationId: string;
  greeting: string;
  suggestedPrompts: string[];
}

const STORAGE_KEY = "acme_chat_history";

export const useChatService = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [currentForm, setCurrentForm] = useState<
    "FORM1" | "FORM2" | "FORM3" | "RECOMMENDATION" | null
  >(null);
  const [formData, setFormData] = useState<FormRecommendationData>({});
  const [isCompletingForm, setIsCompletingForm] = useState<boolean>(false);
  const [isFormCompleted, setIsFormCompleted] = useState<boolean>(false);

  const loadChatHistory = useCallback(() => {
    const storedHistory = localStorage.getItem(STORAGE_KEY);
    return storedHistory ? JSON.parse(storedHistory) : [];
  }, []);

  const saveChatHistory = useCallback((history: ChatMessage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, []);

  const fetchGreeting = useCallback(async () => {
    try {
      const response = await axios.post<GreetingResponse>("/ai/hello", {
        conversationId: crypto.randomUUID(),
        page: window.location.pathname,
      });

      if (response.data) {
        setSuggestedPrompts(response.data.suggestedPrompts);
        const initialMessages: ChatMessage[] = [
          {
            content: response.data.greeting,
            role: "ASSISTANT",
            formType: null,
          },
        ];
        setChatHistory(initialMessages);
        saveChatHistory(initialMessages);
      } else {
        console.error("No greeting response received");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("An error occurred fetching greeting")
      );
      console.error("Error fetching greeting:", err);
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

  const sendMessage = useCallback(
    async (message: string, cartData?: CartData) => {
      setIsLoading(true);
      setError(null);

      const newUserMessage: ChatMessage = {
        content: message,
        role: "USER",
        formType: null,
      };

      const updatedHistory = [...chatHistory, newUserMessage];
      setChatHistory(updatedHistory);
      saveChatHistory(updatedHistory);

      if (message.toLowerCase() === "help me find a bike please") {
        setIsCompletingForm(true);
        setCurrentForm("FORM1");
        const form1Message: ChatMessage = {
          content: "Select a terrain",
          role: "ASSISTANT",
          formType: "FORM1",
        };
        const newHistory = [...updatedHistory, form1Message];
        setChatHistory(newHistory);
        saveChatHistory(newHistory);
        setIsLoading(false);
      } else {
        try {
          const refinedHistory = [...updatedHistory];
          if (updatedHistory[0].role === "ASSISTANT") {
            refinedHistory.shift();
          }
          const payload = {
            messages: refinedHistory.map((msg) => ({
              content: msg.content,
              role: msg.role,
            })),
          };
          const latestMsg = payload["messages"].pop();
          if (cartData != null) {
            payload["messages"].push({
              content: summarizeCart(cartData.cart),
              role: "USER",
            });
          }
          payload["messages"].push({
            content: getCurrentProductInView(),
            role: "USER",
          });
          payload["messages"].push(latestMsg);

          const response = await axios.post<AcmeChatResponse>(
            "/ai/question",
            payload
          );

          if (
            response.data &&
            response.data.messages &&
            response.data.messages.length > 0
          ) {
            const assistantMessages = response.data.messages.map((content) => ({
              content: parseMessageContentAndBuildLinks(content),
              role: "ASSISTANT" as const,
              formType: null,
            }));

            const newHistory = [...updatedHistory, ...assistantMessages];
            setChatHistory(newHistory);
            saveChatHistory(newHistory);
          } else {
            console.error("Received an empty or malformed response from API");
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error("An error occurred"));
          console.error("Error in chat service:", err);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [chatHistory, saveChatHistory]
  );

  const refreshChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setChatHistory([]);
    setSuggestedPrompts([]);
  }, []);

  const submitForm = useCallback(
    async (
      formType: "FORM1" | "FORM2" | "FORM3",
      data: FormRecommendationData
    ) => {
      setFormData({ ...formData, ...data });

      if (formType === "FORM1") {
        setCurrentForm("FORM2");
        const form2Message: ChatMessage = {
          content: "Select a riding position",
          role: "ASSISTANT",
          formType: "FORM2",
        };
        const newHistory = [...chatHistory, form2Message];
        setChatHistory(newHistory);
        saveChatHistory(newHistory);
      } else if (formType === "FORM2") {
        setCurrentForm("FORM3");
        const form3Message: ChatMessage = {
          content: "Excellent! Finally, please fill out this last form:",
          role: "ASSISTANT",
          formType: "FORM3",
        };
        const newHistory = [...chatHistory, form3Message];
        setChatHistory(newHistory);
        saveChatHistory(newHistory);
      } else if (formType === "FORM3") {
        setCurrentForm(null);
        setIsCompletingForm(false);
        setIsFormCompleted(true);
        setIsLoading(false);

        const finalMessage: ChatMessage = {
          content: "Thank you for completing those! Here's what I recommend:",
          role: "ASSISTANT",
          formType: null,
        };

        const recommendationMessage: ChatMessage = {
          content: "",
          role: "ASSISTANT",
          formType: "RECOMMENDATION",
        };

        const newHistory = [
          ...chatHistory,
          finalMessage,
          recommendationMessage,
        ];
        setChatHistory(newHistory);
        saveChatHistory(newHistory);
      }
    },
    [chatHistory, formData, saveChatHistory]
  );

  return {
    chatHistory,
    suggestedPrompts,
    sendMessage,
    refreshChat,
    isLoading,
    error,
    currentForm,
    submitForm,
    isCompletingForm,
    isFormCompleted,
    setIsFormCompleted,
  };
};
