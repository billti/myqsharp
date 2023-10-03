// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as vscode from "vscode";
import {
  getAuthSession,
  getRandomGuid,
  scopes,
} from "./azure/workspaceActions";
import { log } from "qsharp-lang";

const chatUrl = "https://api.quantum.microsoft.com/api/chat/completions";
const chatApp = "652066ed-7ea8-4625-a1e9-5bac6600bf06";

const useService = true;

const chatAgentCommand: vscode.ChatAgentCommand = {
  name: "quantumNotebook",
  description: "Create an Azure Quantum Jupyter Notebook",
};

const chatAgentMetadata: vscode.ChatAgentMetadata = {
  fullName: "Azure Quantum",
  description: "Azure Quantum Copilot",
  subCommands: [chatAgentCommand],
};

const cannedResponse = {
  role: "assistant",
  content:
    "Here's a Q# code sample that demonstrates how to entangle two qubits:\n\n```qsharp\nnamespace Sample {\n    open Microsoft.Quantum.Diagnostics;\n\n    @EntryPoint()\n    operation EntangleQubits() : (Result, Result) {\n        // Allocate the two qubits that will be entangled.\n        use (q1, q2) = (Qubit(), Qubit());\n        // Set the first qubit in superposition by calling the `H` operation, \n        // which applies a Hadamard transformation to the qubit.\n        // Then, entangle the two qubits using the `CNOT` operation.\n        H(q1);\n        CNOT(q1, q2);\n        // Show the entangled state using the `DumpMachine` function.\n        DumpMachine();\n        // Measurements of entangled qubits are always correlated.\n        let (m1, m2) = (M(q1), M(q2));\n        Reset(q1);\n        Reset(q2);\n        return (m1, m2);\n    }\n}\n```\n\nYou can copy this code to the Q# code editor and run it to see the entangled state of the qubits. The results will be displayed in the histogram and diagnostics table.",
  embeddedData: null,
};

type quantumChatRequest = {
  conversationId: string; // GUID
  messages: Array<{
    role: string; // e.g. "user"
    content: string;
  }>; // The actual question
  additionalContext: any; // ?
};

type QuantumChatResponse = {
  role: string; // e.g. "assistant"
  content: string; // The actual answer
  embeddedData: any; // ?
};

async function chatRequest(
  token: string,
  question: string
): Promise<QuantumChatResponse> {
  const payload: quantumChatRequest = {
    conversationId: getRandomGuid(),
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
    additionalContext: {
      qcomEnvironment: "Desktop",
    },
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  };
  log.debug("About to call ChatAPI with payload: ", payload);

  try {
    const response = await fetch(chatUrl, options);
    log.debug("ChatAPI response status: ", response.statusText);

    const json = await response.json();
    log.debug("ChatAPI response payload: ", json);
    return json;
  } catch (error) {
    log.error("ChatAPI fetch failed with error: ", error);
    throw error;
  }
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const chatAgent: vscode.ChatAgent = async (
  prompt: vscode.ChatMessage,
  context: vscode.ChatAgentContext,
  progress: vscode.Progress<vscode.ChatAgentResponse>,
  token: vscode.CancellationToken
): Promise<vscode.ChatAgentResult | void> => {
  // If the user invoked the agent with a subcommand, it will be available in prompt.content,
  // e.g., it will contain a string such as "/myAgentCommand"

  if (useService) {
    const msaChatSession = await getAuthSession([
      scopes.chatApi,
      `VSCODE_TENANT:common`,
      `VSCODE_CLIENT_ID:${chatApp}`,
    ]);
    if (!msaChatSession) throw Error("Failed to get MSA chat token");
    const response = await chatRequest(
      msaChatSession.accessToken,
      prompt.content
    );
    if (token.isCancellationRequested) return;

    // No streaming reponse, so just return the whole thing in one progress update.
    progress.report({ message: new vscode.MarkdownString(response.content) });
  } else {
    // Mimick a streaming result by sending a word every 16ms
    const resultWords = cannedResponse.content.split(" ");

    for (const word of resultWords) {
      await timer(16);
      // Note that each message gets appended, so don't return ALL the message so far.
      progress.report({ message: new vscode.MarkdownString(word + " ") });
    }
  }

  const result: vscode.ChatAgentResult = {};
  return Promise.resolve(result);
};

export function activateChatAgent(context: vscode.ExtensionContext) {
  // Register a chat agent
  context.subscriptions.push(
    vscode.chat.registerAgent("quantum", chatAgent, chatAgentMetadata)
  );
}
