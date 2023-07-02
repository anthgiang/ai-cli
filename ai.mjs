#! /usr/bin/env node

import "dotenv/config";
import { program } from "commander";
import readline from "readline";
import { Configuration, OpenAIApi } from "openai";

const MODEL = "gpt-3.5-turbo";

/***************/
/* CLI OPTIONS */

program
  .argument("[message]", "the message")
  .option("-d, --debug", "output debug information", false)
  .option("-i, --interactive", "interactive prompt", false)
  .option("-s, --stream", "stream text or not", false)
  .option("-t, --temperature <temperature>", "temperature longer longer argument", parseFloat, 1);
/* arguments originate from node */
program.parse(process.argv);
const { interactive, stream, temperature } = program.opts();
const content = program.args.join(" ");

/*******************/
/* ENDPOINT REQUEST */

async function chat({ messages, stream, temperature }) {
  const output = await openai.createChatCompletion({
    model: MODEL,
    messages: messages,
    stream: stream,
    temperature: temperature,
  });
  console.log(output.data.choices[0].message.content); /* print to stdout */
  return output.data.choices[0].message;
}
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/*****************/
/* SINGLE PROMPT */

if (!interactive) {
  if (content === "") {
    console.log("Invalid input.");
  } else {
    const messages = [{ role: "user", content: content }];
    await chat({ messages, interactive, stream, temperature });
  }
  process.exit(0);
}

/**********************/
/* INTERACTIVE PROMPT */

if (interactive) {
  const messages = [];
  if (content !== "") {
    messages.push({ role: "user", content: content });
    await chat({ messages, interactive, stream, temperature });
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "message: ",
  });

  rl.prompt();
  rl.on("line", async (line) => {
    const input = line.trim();
    if (input === "") {
      console.log("Invalid input.");
      rl.prompt();
    }
    messages.push({ role: "user", content: line });
    await chat({ messages, interactive, stream, temperature });
    rl.prompt();
  }).on("close", () => {
    console.log("\nInteractive mode closed.");
    process.exit(0);
  });
}