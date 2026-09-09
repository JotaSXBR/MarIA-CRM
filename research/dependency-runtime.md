# Implementação delegada à biblioteca — evidência instalada

[CODE] Trechos do pacote instalado a partir do bun.lock de A, não da versão latest da documentação. Sem esta inspeção, validação de argumentos, execução paralela e conversão de erro seriam apenas suposições. Hash é do arquivo completo; numeração original mantida.

## @langchain/langgraph@1.4.12

Path: `dist/prebuilt/tool_node.js`  
SHA-256: `1541337f24f22e62806007907ca25e44bc4f868893c1045faa6392b9b873f4ac`  
Caller: StateGraph tools node → ToolNode.run → runTool → StructuredTool.invoke/call.  
Callee: tool.invoke → schema parse → _call; resultado normalizado em ToolMessage.

```text
177: var ToolNode = class extends RunnableCallable {
178: 	tools;
179: 	handleToolErrors = true;
180: 	trace = false;
181: 	constructor(tools, options) {
182: 		const { name, tags, handleToolErrors } = options ?? {};
183: 		super({
184: 			name,
185: 			tags,
186: 			func: (input, config) => this.run(input, config)
187: 		});
188: 		this.tools = tools;
189: 		this.handleToolErrors = handleToolErrors ?? this.handleToolErrors;
190: 	}
191: 	async runTool(call, config, state) {
192: 		const tool = this.tools.find((tool) => tool.name === call.name);
193: 		try {
194: 			if (tool === void 0) throw new Error(`Tool "${call.name}" not found.`);
195: 			const toolCall = {
196: 				...call,
197: 				type: "tool_call"
198: 			};
199: 			const runtime = {
200: 				...config,
201: 				state,
202: 				toolCallId: call.id ?? "",
203: 				config,
204: 				context: config.context,
205: 				store: config.store ?? null,
206: 				writer: config.writer ?? config.configurable?.writer ?? null
207: 			};
208: 			const output = await tool.invoke(toolCall, runtime);
209: 			if (isBaseMessage(output) && output.getType() === "tool" || isCommand(output)) return output;
210: 			return new ToolMessage({
211: 				status: "success",
212: 				name: tool.name,
213: 				content: typeof output === "string" ? output : JSON.stringify(output),
214: 				tool_call_id: call.id
215: 			});
216: 		} catch (e) {
217: 			if (!this.handleToolErrors) throw e;
218: 			if (isGraphInterrupt(e)) throw e;
219: 			return new ToolMessage({
220: 				status: "error",
221: 				content: `Error: ${e.message}\n Please fix your mistakes.`,
222: 				name: call.name,
223: 				tool_call_id: call.id ?? ""
224: 			});
225: 		}
226: 	}
227: 	async run(input, config) {
228: 		let outputs;
229: 		if (isSendInput(input)) {
230: 			const { lg_tool_call: toolCall, ...state } = input;
231: 			outputs = [await this.runTool(toolCall, config, state)];
232: 		} else {
233: 			let messages;
234: 			if (isBaseMessageArray(input)) messages = input;
235: 			else if (isMessagesState(input)) messages = input.messages;
236: 			else throw new Error("ToolNode only accepts BaseMessage[] or { messages: BaseMessage[] } as input.");
237: 			const toolMessageIds = new Set(messages.filter((msg) => msg.getType() === "tool").map((msg) => msg.tool_call_id));
238: 			let aiMessage;
239: 			for (let i = messages.length - 1; i >= 0; i -= 1) {
240: 				const message = messages[i];
241: 				if (isAIMessage(message)) {
242: 					aiMessage = message;
243: 					break;
244: 				}
245: 			}
246: 			if (aiMessage == null || !isAIMessage(aiMessage)) throw new Error("ToolNode only accepts AIMessages as input.");
247: 			outputs = await Promise.all(aiMessage.tool_calls?.filter((call) => call.id == null || !toolMessageIds.has(call.id)).map((call) => this.runTool(call, config, input)) ?? []);
248: 		}
249: 		if (!outputs.some(isCommand)) return Array.isArray(input) ? outputs : { messages: outputs };
250: 		const combinedOutputs = [];
251: 		let parentCommand = null;
252: 		for (const output of outputs) if (isCommand(output)) if (output.graph === Command.PARENT && Array.isArray(output.goto) && output.goto.every((send) => _isSend(send))) if (parentCommand) parentCommand.goto.push(...output.goto);
253: 		else parentCommand = new Command({
254: 			graph: Command.PARENT,
255: 			goto: output.goto
256: 		});
257: 		else combinedOutputs.push(output);
258: 		else combinedOutputs.push(Array.isArray(input) ? [output] : { messages: [output] });
259: 		if (parentCommand) combinedOutputs.push(parentCommand);
260: 		return combinedOutputs;
```

## @langchain/core@1.2.9

Path: `dist/tools/index.js`  
SHA-256: `d399a900e391e33b771217326e7aaef2c9261dbf2e1dad1015e767b472f8a7aa`  
Caller: StateGraph tools node → ToolNode.run → runTool → StructuredTool.invoke/call.  
Callee: tool.invoke → schema parse → _call; resultado normalizado em ToolMessage.

```text
104: 	async call(arg, configArg, tags) {
105: 		const inputForValidation = _isToolCall(arg) ? arg.args : arg;
106: 		let parsed;
107: 		if (isInteropZodSchema(this.schema)) try {
108: 			parsed = await interopParseAsync(this.schema, inputForValidation);
109: 		} catch (e) {
110: 			let message = `Received tool input did not match expected schema`;
111: 			if (this.verboseParsingErrors) message = `${message}\nDetails: ${e.message}`;
112: 			if (isInteropZodError(e)) message = `${message}\n\n${z$1.prettifyError(e)}`;
113: 			throw new ToolInputParsingException(message, JSON.stringify(arg));
114: 		}
115: 		else {
116: 			const result = validate(inputForValidation, this.schema);
117: 			if (!result.valid) {
118: 				let message = `Received tool input did not match expected schema`;
119: 				if (this.verboseParsingErrors) message = `${message}\nDetails: ${result.errors.map((e) => `${e.keywordLocation}: ${e.error}`).join("\n")}`;
120: 				throw new ToolInputParsingException(message, JSON.stringify(arg));
121: 			}
122: 			parsed = inputForValidation;
123: 		}
124: 		const config = parseCallbackConfigArg(configArg);
125: 		const callbackManager_ = CallbackManager.configure(config.callbacks, this.callbacks, config.tags || tags, this.tags, config.metadata, this.metadata, { verbose: this.verbose });
126: 		let toolCallId;
127: 		if (_isToolCall(arg)) toolCallId = arg.id;
128: 		if (!toolCallId && _configHasToolCallId(config)) toolCallId = config.toolCall.id;
129: 		const runManager = await callbackManager_?.handleToolStart(this.toJSON(), typeof arg === "string" ? arg : JSON.stringify(arg), config.runId, void 0, void 0, void 0, config.runName, toolCallId);
130: 		delete config.runId;
131: 		let result;
132: 		try {
133: 			const raw = await this._call(parsed, runManager, config);
134: 			result = isAsyncGenerator(raw) ? await consumeAsyncGenerator(raw, async (chunk) => {
135: 				try {
136: 					await runManager?.handleToolEvent(chunk);
137: 				} catch (streamError) {
138: 					await runManager?.handleToolError(streamError);
139: 				}
140: 			}) : raw;
141: 		} catch (e) {
142: 			await runManager?.handleToolError(e);
143: 			throw e;
144: 		}
145: 		let content;
146: 		let artifact;
147: 		if (this.responseFormat === "content_and_artifact") if (Array.isArray(result) && result.length === 2) [content, artifact] = result;
148: 		else throw new Error(`Tool response format is "content_and_artifact" but the output was not a two-tuple.\nResult: ${JSON.stringify(result)}`);
```

## Interpretação delimitada

[CODE, HIGH] ToolNode usa Promise.all para chamadas ainda sem resultado correlacionado, preserva ToolMessage/Command já retornados e converte exceção ordinária em status error. GraphInterrupt é relançado. StructuredTool parseia schema antes da função. [INFERENCE, HIGH] Dedupe por tool_call_id já presente no state não garante idempotência de um HTTP write cujo efeito ocorreu e cujo resultado ainda não foi salvo.
