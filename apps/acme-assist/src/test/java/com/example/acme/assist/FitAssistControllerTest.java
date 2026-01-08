package com.example.acme.assist;

import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class FitAssistControllerTest {

    @MockitoBean
    private EmbeddingModel embeddingModel;

    @MockitoBean
    private ChatClient chatClient;

    @Container
    @ServiceConnection
    public static final PostgreSQLContainer postgreSQLContainer =
            new PostgreSQLContainer<>(DockerImageName.parse("pgvector/pgvector:pg16")
                    .asCompatibleSubstituteFor("postgres"));

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGreetingsEndpoint() throws Exception {
        final MvcResult mvcResult = mockMvc.perform(
                        post("/ai/hello")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                           "page": "foobar page",
                                           "userId": "foobar userId",
                                           "conversationId": "foobar conversationId"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andReturn();
        final String content = mvcResult.getResponse().getContentAsString();
        JSONAssert.assertEquals("""
                        {
                          "conversationId": "foobar conversationId",
                          "greeting": "Welcome to ACME FITNESS! Looking for the perfect e-bike and accessories? I'm here to assist you. To get started, I can suggest some popular e-bike models based on your preferences. Just let me know your riding style, desired speed, and approximate range, and we'll find the ideal match for you.",
                          "suggestedPrompts": [
                            "I want an e-bike that can keep up with city traffic.",
                            "Show me e-bikes with long battery life for my daily commute.",
                            "What are the most popular e-bike models for city riders?"
                          ]
                        }
                        """,
                new JSONObject(content),
                JSONCompareMode.STRICT
        );
    }

    @Test
    public void testQuestionDeliveryTime() throws Exception {
        ChatClient.ChatClientRequestSpec requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        ChatClient.CallResponseSpec responseSpec = mock(ChatClient.CallResponseSpec.class);

        AssistantMessage assistantMessage = new AssistantMessage("Delivery usually takes 3-5 business days.");
        Generation generation = new Generation(assistantMessage);
        ChatResponse chatResponse = new ChatResponse(List.of(generation));

        when(chatClient.prompt(any(Prompt.class))).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(responseSpec);
        when(responseSpec.chatResponse()).thenReturn(chatResponse);

        final MvcResult mvcResult = mockMvc.perform(
                        post("/ai/question")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                           "page": "foobar page",
                                           "userId": "foobar userId",
                                           "messages": [
                                             {
                                               "role": "USER",
                                               "content": "How long will it take to get the bike delivered to me?"
                                             }
                                           ]
                                         }
                                        """))
                .andExpect(status().isOk())
                .andReturn();
        final String content = mvcResult.getResponse().getContentAsString();

        JSONAssert.assertEquals("""
                        {
                          "messages": [
                            "Delivery usually takes 3-5 business days."
                          ]
                        }
                        """,
                new JSONObject(content),
                JSONCompareMode.LENIENT
        );
    }
}
